import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  name: text("name"),
  role: text("role").default("voter").notNull(),
});

export const voterProfiles = pgTable("voter_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  voterId: text("voter_id").notNull().unique(),
  district: text("district").notNull(),
  age: integer("age").notNull(),
  registrationDate: text("registration_date").notNull(),
  precinct: text("precinct").notNull(),
  isEligible: boolean("is_eligible").default(true).notNull(),
});

export const verificationSessions = pgTable("verification_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  step: text("step").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  blockchainRef: text("blockchain_ref"),
});

export const blockchainRecords = pgTable("blockchain_records", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull().unique(),
  previousHash: text("previous_hash").notNull(),
  data: jsonb("data").notNull(),
  timestamp: integer("timestamp").notNull(),
  nonce: integer("nonce").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
  name: true,
  role: true,
});

export const insertVoterProfileSchema = createInsertSchema(voterProfiles).pick({
  userId: true,
  voterId: true,
  district: true,
  age: true,
  registrationDate: true,
  precinct: true,
  isEligible: true,
});

export const insertVerificationSessionSchema = createInsertSchema(verificationSessions).pick({
  userId: true,
  step: true,
  status: true,
  blockchainRef: true,
});

export const insertBlockchainRecordSchema = createInsertSchema(blockchainRecords).pick({
  hash: true,
  previousHash: true,
  data: true,
  timestamp: true,
  nonce: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVoterProfile = z.infer<typeof insertVoterProfileSchema>;
export type VoterProfile = typeof voterProfiles.$inferSelect;

export type InsertVerificationSession = z.infer<typeof insertVerificationSessionSchema>;
export type VerificationSession = typeof verificationSessions.$inferSelect;

export type InsertBlockchainRecord = z.infer<typeof insertBlockchainRecordSchema>;
export type BlockchainRecord = typeof blockchainRecords.$inferSelect;

export const VerificationSteps = {
  IDENTITY: "IDENTITY",
  ELIGIBILITY: "ELIGIBILITY",
  BIOMETRIC: "BIOMETRIC",
  OTP: "OTP",
  READY: "READY",
} as const;

export const VerificationStatus = {
  PENDING: "pending", 
  IN_PROGRESS: "in_progress",
  VERIFIED: "verified",
  FAILED: "failed",
} as const;
