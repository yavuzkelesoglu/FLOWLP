import express, { type Request, Response, NextFunction } from "express";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql as sqlTemplate } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { desc, eq, and, gt } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { fromZodError } from "zod-validation-error";
import OpenAI from "openai";
import { Resend } from "resend";

// ===== DATABASE SCHEMA =====
const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sqlTemplate`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  consent: boolean("consent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sqlTemplate`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sqlTemplate`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const authTokens = pgTable("auth_tokens", {
  id: varchar("id").primaryKey().default(sqlTemplate`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  adminId: varchar("admin_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

type InsertLead = z.infer<typeof insertLeadSchema>;
type Lead = typeof leads.$inferSelect;
type AdminUser = typeof adminUsers.$inferSelect;
type InsertAdminUser = { email: string; password: string; name: string };

// ===== DATABASE CONNECTION =====
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// ===== STORAGE =====
class DBStorage {
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const existing = await this.getSetting(key);
    if (existing !== null) {
      await db.update(settings).set({ value }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value });
    }
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [admin] = await db.insert(adminUsers).values({
      ...user,
      password: hashedPassword,
    }).returning();
    return admin;
  }

  async getAdminByEmail(email: string): Promise<AdminUser | null> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || null;
  }

  async getAdminById(id: string): Promise<AdminUser | null> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return admin || null;
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
  }

  async deleteAdmin(id: string): Promise<void> {
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
  }

  async validateAdminPassword(email: string, password: string): Promise<AdminUser | null> {
    const admin = await this.getAdminByEmail(email);
    if (!admin) return null;
    
    const isValid = await bcrypt.compare(password, admin.password);
    return isValid ? admin : null;
  }

  async createAuthToken(adminId: string): Promise<string> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await db.insert(authTokens).values({
      token,
      adminId,
      expiresAt,
    });
    
    return token;
  }

  async validateAuthToken(token: string): Promise<string | null> {
    const [result] = await db.select()
      .from(authTokens)
      .where(and(
        eq(authTokens.token, token),
        gt(authTokens.expiresAt, new Date())
      ));
    
    return result?.adminId || null;
  }

  async deleteAuthToken(token: string): Promise<void> {
    await db.delete(authTokens).where(eq(authTokens.token, token));
  }
}

const storage = new DBStorage();

// ===== CHAT =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Sen, Flow Coaching & Leadership Institute'da koçluk eğitimi hakkında bilgi veren bir AI eğitim danışmanısın. Aynı zamanda satış temsilcisi gibi yönlendirici ve ikna edici şekilde konuşursun.

GÖREVLER:
1. Kullanıcının sorularını yanıtla
2. Koçluk eğitimi hakkında bilgi ver
3. Konuşma boyunca profesyonel ama sıcak bir ton kullan
4. Kullanıcıyı eğitime kayıt olmaya yönlendir
5. "İstersen seni hemen ön kayda alabilirim" gibi satış CTA'ları kullan
6. Kullanıcı iletişim bilgisi paylaşmak isterse, ekrandaki formu doldurmasını söyle

EĞİTİM BİLGİLERİ:
- Program: Flow Temel Koçluk Okulu - ICF Onaylı Sertifika Programı
- Format: Tamamen Online (Canlı dersler)
- Süre: 6 Modül, toplam 125+ saat
- Akreditasyon: ICF Level 1 & Level 2
- Fiyat bilgisi için detaylı bilgi almak isteyenlere danışman yönlendirmesi yap

MODÜLLER:
1. Koçluğa Giriş ve Temel İlkeler
2. Aktif Dinleme ve Güçlü Sorular
3. Hedef Belirleme ve Aksiyon Planlama
4. Değerler ve İnançlarla Çalışma
5. Koçluk Araçları ve Modelleri
6. Süpervizyon ve Sertifikasyon

ÖNEMLİ:
- Türkçe konuş
- Samimi ama profesyonel ol
- Soruları kısa ve net tut
- Her mesajda bir soru veya CTA olsun
- Cevapları kısa tut (maksimum 2-3 cümle)`;

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function chat(messages: ChatMessage[]): Promise<{ message: string }> {
  try {
    const messagesWithSystem: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messagesWithSystem,
      temperature: 0.7,
      max_tokens: 300,
    });

    const assistantMessage = response.choices[0]?.message?.content || "Üzgünüm, bir hata oluştu.";

    return {
      message: assistantMessage,
    };
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
}

// ===== EMAIL =====
interface LeadData {
  fullName: string;
  email: string;
  phone: string;
}

async function sendLeadNotification(lead: LeadData): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("RESEND_API_KEY not set, skipping email");
      return false;
    }

    const client = new Resend(apiKey);
    
    const emailsSetting = await storage.getSetting("notification_emails");
    
    if (!emailsSetting || emailsSetting.trim() === "") {
      console.log("No notification emails configured, skipping email");
      return false;
    }
    
    const toEmails = emailsSetting
      .split(",")
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes("@"));
    
    if (toEmails.length === 0) {
      console.log("No valid notification emails found, skipping email");
      return false;
    }
    
    const result = await client.emails.send({
      from: 'Flow Coaching <bilgi@in-flowtr.com>',
      to: toEmails,
      subject: `Yeni Form Başvurusu: ${lead.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;">
            Yeni Form Başvurusu
          </h2>
          <p style="font-size: 16px; color: #333;">
            Flow Temel Koçluk Okulu için yeni bir başvuru alındı:
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold; width: 120px;">Ad Soyad</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${lead.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">E-posta</td>
              <td style="padding: 10px; border: 1px solid #ddd;">
                <a href="mailto:${lead.email}" style="color: #0d9488;">${lead.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Telefon</td>
              <td style="padding: 10px; border: 1px solid #ddd;">
                <a href="tel:${lead.phone}" style="color: #0d9488;">${lead.phone}</a>
              </td>
            </tr>
          </table>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Bu e-posta Flow Coaching & Leadership Institute web sitesinden otomatik olarak gönderilmiştir.
          </p>
        </div>
      `
    });
    
    console.log('Email sent successfully to:', toEmails, result);
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

// ===== EXPRESS APP =====
const app = express();

interface AuthenticatedRequest extends Request {
  adminId?: string;
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const adminId = await storage.validateAuthToken(token);
    if (adminId) {
      authReq.adminId = adminId;
      return next();
    }
  }
  
  return res.status(401).json({ error: "Unauthorized" });
}

async function verifyRecaptcha(token: string): Promise<{ success: boolean; score: number; errorCodes?: string[] }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY not set, skipping verification");
    return { success: true, score: 1.0 };
  }
  
  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${token}`
      }
    );
    
    const data = await response.json();
    return {
      success: data.success && (data.score === undefined || data.score >= 0.5),
      score: data.score || 0,
      errorCodes: data["error-codes"]
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: true, score: 0 };
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Auth routes
app.post("/api/auth/setup", async (req, res) => {
  try {
    const existingAdmins = await storage.getAllAdmins();
    if (existingAdmins.length > 0) {
      return res.status(400).json({ error: "Admin zaten mevcut. Kurulum yapılamaz." });
    }
    
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, şifre ve ad gereklidir" });
    }
    
    const admin = await storage.createAdminUser({ email, password, name });
    res.status(201).json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (error) {
    console.error("Setup error:", error);
    res.status(500).json({ error: "Kurulum yapılamadı" });
  }
});

app.get("/api/auth/setup-status", async (req, res) => {
  try {
    const existingAdmins = await storage.getAllAdmins();
    res.json({ needsSetup: existingAdmins.length === 0 });
  } catch (error) {
    console.error("Setup status error:", error);
    res.status(500).json({ error: "Durum kontrol edilemedi" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email ve şifre gereklidir" });
    }
    
    const admin = await storage.validateAdminPassword(email, password);
    
    if (!admin) {
      return res.status(401).json({ error: "Geçersiz email veya şifre" });
    }
    
    const token = await storage.createAuthToken(admin.id);
    
    res.json({ 
      id: admin.id, 
      email: admin.email, 
      name: admin.name,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Giriş yapılamadı" });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      await storage.deleteAuthToken(token);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Çıkış yapılamadı" });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  const admin = await storage.getAdminById(authReq.adminId!);
  if (!admin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  res.json({ 
    id: admin.id, 
    email: admin.email, 
    name: admin.name 
  });
});

// Admin routes
app.get("/api/admin/users", requireAuth, async (req, res) => {
  try {
    const admins = await storage.getAllAdmins();
    res.json(admins.map(a => ({ id: a.id, email: a.email, name: a.name, createdAt: a.createdAt })));
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

app.post("/api/admin/users", requireAuth, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Tüm alanlar gereklidir" });
    }
    
    const existing = await storage.getAdminByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Bu email zaten kayıtlı" });
    }
    
    const admin = await storage.createAdminUser({ email, password, name });
    res.status(201).json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ error: "Admin oluşturulamadı" });
  }
});

app.delete("/api/admin/users/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    
    if (id === authReq.adminId) {
      return res.status(400).json({ error: "Kendinizi silemezsiniz" });
    }
    
    await storage.deleteAdmin(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ error: "Admin silinemedi" });
  }
});

// Lead routes
app.post("/api/leads", async (req, res) => {
  try {
    const { recaptchaToken, ...formData } = req.body;
    
    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        return res.status(400).json({ error: "Güvenlik doğrulaması gerekli." });
      }
      
      const verification = await verifyRecaptcha(recaptchaToken);
      
      if (!verification.success) {
        console.warn("reCAPTCHA failed:", verification.errorCodes, "Score:", verification.score);
        return res.status(400).json({ error: "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin." });
      }
    }
    
    const validatedData = insertLeadSchema.parse(formData);
    const lead = await storage.createLead(validatedData);
    
    sendLeadNotification({
      fullName: validatedData.fullName,
      email: validatedData.email,
      phone: validatedData.phone
    }).catch(err => console.error("Email notification failed:", err));
    
    res.status(201).json(lead);
  } catch (error: any) {
    if (error.name === "ZodError") {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "Form gönderilemedi" });
  }
});

app.get("/api/leads", requireAuth, async (req, res) => {
  try {
    const allLeads = await storage.getLeads();
    res.json(allLeads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// Settings routes
app.get("/api/settings/notification-emails", requireAuth, async (req, res) => {
  try {
    const emails = await storage.getSetting("notification_emails");
    res.json({ emails: emails || "" });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.post("/api/settings/notification-emails", requireAuth, async (req, res) => {
  try {
    const { emails } = req.body;
    if (typeof emails !== "string") {
      return res.status(400).json({ error: "Invalid emails format" });
    }
    await storage.setSetting("notification_emails", emails);
    res.json({ success: true, emails });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }
    
    const result = await chat(messages);
    res.json(result);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Sohbet hatası oluştu" });
  }
});

export default app;
