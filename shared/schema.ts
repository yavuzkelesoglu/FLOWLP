import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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

// Create base schemas and override ID validation to be more flexible
const baseLeadSchema = createInsertSchema(leads, {
  id: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(1),
  fullName: z.string().min(1),
});

const baseSettingSchema = createInsertSchema(settings, {
  id: z.string().optional(),
});

const baseAdminUserSchema = createInsertSchema(adminUsers, {
  id: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().min(1),
});

export const insertLeadSchema = baseLeadSchema.omit({
  id: true,
  createdAt: true,
});

export const insertSettingSchema = baseSettingSchema.omit({
  id: true,
});

export const insertAdminUserSchema = baseAdminUserSchema.omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
