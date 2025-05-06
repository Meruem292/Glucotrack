import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firebaseId: text("firebase_id").notNull().unique(),
  deviceId: text("device_id"),
  name: text("name"),
  email: text("email").notNull().unique(),
});

export const readings = pgTable("readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  glucose: integer("glucose").notNull(),
  heartRate: integer("heart_rate").notNull(),
  spo2: integer("spo2").notNull(),
  status: text("status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userHealth = pgTable("user_health", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  age: integer("age"),
  weight: integer("weight"),
  height: integer("height"),
  healthCondition: text("health_condition"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firebaseId: true,
  deviceId: true,
  name: true,
  email: true,
});

export const insertReadingSchema = createInsertSchema(readings).pick({
  userId: true,
  glucose: true,
  heartRate: true,
  spo2: true,
  status: true,
});

export const insertUserHealthSchema = createInsertSchema(userHealth).pick({
  userId: true,
  age: true,
  weight: true,
  height: true,
  healthCondition: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertReading = z.infer<typeof insertReadingSchema>;
export type InsertUserHealth = z.infer<typeof insertUserHealthSchema>;

export type User = typeof users.$inferSelect;
export type Reading = typeof readings.$inferSelect;
export type UserHealth = typeof userHealth.$inferSelect;
