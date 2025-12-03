import { db } from "../db";
import { type Lead, type InsertLead, leads, settings, adminUsers, authTokens, type AdminUser, type InsertAdminUser } from "@shared/schema";
import { desc, eq, and, gt } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

export interface IStorage {
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  getAdminByEmail(email: string): Promise<AdminUser | null>;
  getAdminById(id: string): Promise<AdminUser | null>;
  getAllAdmins(): Promise<AdminUser[]>;
  deleteAdmin(id: string): Promise<void>;
  validateAdminPassword(email: string, password: string): Promise<AdminUser | null>;
  createAuthToken(adminId: string): Promise<string>;
  validateAuthToken(token: string): Promise<string | null>;
  deleteAuthToken(token: string): Promise<void>;
  deleteAuthTokensForAdmin(adminId: string): Promise<void>;
}

export class DBStorage implements IStorage {
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

  async deleteAuthTokensForAdmin(adminId: string): Promise<void> {
    await db.delete(authTokens).where(eq(authTokens.adminId, adminId));
  }
}

export const storage = new DBStorage();
