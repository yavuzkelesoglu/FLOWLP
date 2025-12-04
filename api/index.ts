import express, { type Request, Response, NextFunction } from "express";
import { storage } from "../server/storage";
import { insertLeadSchema } from "../shared/schema";
import { fromZodError } from "zod-validation-error";
import { sendLeadNotification } from "../server/email";
import { chat } from "../server/chat";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

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

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

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
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Geçerli bir e-posta adresi giriniz" });
    }
    
    const admin = await storage.createAdminUser({ email: email.trim(), password, name: name.trim() });
    res.status(201).json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (error: any) {
    console.error("Setup error:", error);
    if (error.message && error.message.includes("pattern")) {
      return res.status(400).json({ error: "Geçersiz veri formatı. Lütfen tüm alanları kontrol edin." });
    }
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
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Geçerli bir e-posta adresi giriniz" });
    }
    
    const existing = await storage.getAdminByEmail(email.trim());
    if (existing) {
      return res.status(400).json({ error: "Bu email zaten kayıtlı" });
    }
    
    const admin = await storage.createAdminUser({ email: email.trim(), password, name: name.trim() });
    res.status(201).json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (error: any) {
    console.error("Error creating admin:", error);
    if (error.message && error.message.includes("pattern")) {
      return res.status(400).json({ error: "Geçersiz veri formatı. Lütfen tüm alanları kontrol edin." });
    }
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
      console.error("Validation error:", validationError.message);
      // Return first error message in a user-friendly format
      const firstError = error.errors?.[0];
      if (firstError) {
        return res.status(400).json({ 
          error: firstError.message || "Geçersiz form verisi. Lütfen tüm alanları kontrol edin." 
        });
      }
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
