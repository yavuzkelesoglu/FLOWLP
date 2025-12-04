import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  consent: boolean("consent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const authTokens = pgTable("auth_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  adminId: varchar("admin_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Manual Zod schemas to avoid UUID pattern validation issues with createInsertSchema
export const insertLeadSchema = z.object({
  fullName: z.string().trim().min(2, "Ad Soyad en az 2 karakter olmalıdır."),
  email: z.string().trim().email("Geçerli bir e-posta adresi giriniz"),
  phone: z
    .string()
    .trim()
    .min(10, "Geçerli bir telefon numarası giriniz."),
  consent: z
    .boolean()
    .refine((value) => value === true, {
      message: "Devam etmek için KVKK onayını kabul etmelisiniz.",
    }),
});

export const insertSettingSchema = z.object({
  key: z.string().trim().min(1, "Anahtar değeri gereklidir"),
  value: z.string().trim().min(1, "Değer alanı gereklidir"),
});

export const insertAdminUserSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta adresi giriniz"),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır."),
  name: z
    .string()
    .trim()
    .min(2, "Ad en az 2 karakter olmalıdır."),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
