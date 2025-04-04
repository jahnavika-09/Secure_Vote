import { 
  users, 
  voterProfiles, 
  verificationSessions, 
  blockchainRecords,
  type User, 
  type InsertUser,
  type VoterProfile, 
  type InsertVoterProfile,
  type VerificationSession, 
  type InsertVerificationSession,
  type BlockchainRecord, 
  type InsertBlockchainRecord 
} from "@shared/schema";
import session from "express-session";
import { db, pool } from "./db";
import { eq, desc, count } from "drizzle-orm";
import connectPgSimple from "connect-pg-simple";

const PostgresSessionStore = connectPgSimple(session);

export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Voter Profile Management
  getVoterProfile(id: number): Promise<VoterProfile | undefined>;
  getVoterProfileByUserId(userId: number): Promise<VoterProfile | undefined>;
  getVoterProfileByVoterId(voterId: string): Promise<VoterProfile | undefined>;
  createVoterProfile(profile: InsertVoterProfile): Promise<VoterProfile>;
  updateVoterProfile(id: number, profile: Partial<VoterProfile>): Promise<VoterProfile | undefined>;
  
  // Verification Session Management
  getVerificationSession(id: number): Promise<VerificationSession | undefined>;
  getVerificationSessionsByUserId(userId: number): Promise<VerificationSession[]>;
  createVerificationSession(session: InsertVerificationSession): Promise<VerificationSession>;
  updateVerificationSession(id: number, session: Partial<VerificationSession>): Promise<VerificationSession | undefined>;
  getAllVerificationSessions(limit?: number): Promise<VerificationSession[]>;
  
  // Blockchain Record Management
  getBlockchainRecord(id: number): Promise<BlockchainRecord | undefined>;
  getBlockchainRecordByHash(hash: string): Promise<BlockchainRecord | undefined>;
  getLatestBlockchainRecord(): Promise<BlockchainRecord | undefined>;
  createBlockchainRecord(record: InsertBlockchainRecord): Promise<BlockchainRecord>;
  getBlockchainRecordCount(): Promise<number>;
  
  // Session Store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Voter Profile Management
  async getVoterProfile(id: number): Promise<VoterProfile | undefined> {
    const [profile] = await db.select().from(voterProfiles).where(eq(voterProfiles.id, id));
    return profile;
  }

  async getVoterProfileByUserId(userId: number): Promise<VoterProfile | undefined> {
    const [profile] = await db.select().from(voterProfiles).where(eq(voterProfiles.userId, userId));
    return profile;
  }

  async getVoterProfileByVoterId(voterId: string): Promise<VoterProfile | undefined> {
    const [profile] = await db.select().from(voterProfiles).where(eq(voterProfiles.voterId, voterId));
    return profile;
  }

  async createVoterProfile(insertProfile: InsertVoterProfile): Promise<VoterProfile> {
    const [profile] = await db.insert(voterProfiles).values(insertProfile).returning();
    return profile;
  }

  async updateVoterProfile(id: number, updates: Partial<VoterProfile>): Promise<VoterProfile | undefined> {
    const [updatedProfile] = await db
      .update(voterProfiles)
      .set(updates)
      .where(eq(voterProfiles.id, id))
      .returning();
    
    return updatedProfile;
  }

  // Verification Session Management
  async getVerificationSession(id: number): Promise<VerificationSession | undefined> {
    const [session] = await db.select().from(verificationSessions).where(eq(verificationSessions.id, id));
    return session;
  }

  async getVerificationSessionsByUserId(userId: number): Promise<VerificationSession[]> {
    return await db
      .select()
      .from(verificationSessions)
      .where(eq(verificationSessions.userId, userId))
      .orderBy(desc(verificationSessions.timestamp));
  }

  async createVerificationSession(insertSession: InsertVerificationSession): Promise<VerificationSession> {
    const [session] = await db.insert(verificationSessions).values(insertSession).returning();
    return session;
  }

  async updateVerificationSession(id: number, updates: Partial<VerificationSession>): Promise<VerificationSession | undefined> {
    const [updatedSession] = await db
      .update(verificationSessions)
      .set(updates)
      .where(eq(verificationSessions.id, id))
      .returning();
    
    return updatedSession;
  }
  
  async getAllVerificationSessions(limit: number = 100): Promise<VerificationSession[]> {
    return await db
      .select()
      .from(verificationSessions)
      .orderBy(desc(verificationSessions.timestamp))
      .limit(limit);
  }

  // Blockchain Record Management
  async getBlockchainRecord(id: number): Promise<BlockchainRecord | undefined> {
    const [record] = await db.select().from(blockchainRecords).where(eq(blockchainRecords.id, id));
    return record;
  }

  async getBlockchainRecordByHash(hash: string): Promise<BlockchainRecord | undefined> {
    const [record] = await db.select().from(blockchainRecords).where(eq(blockchainRecords.hash, hash));
    return record;
  }

  async getLatestBlockchainRecord(): Promise<BlockchainRecord | undefined> {
    const [record] = await db
      .select()
      .from(blockchainRecords)
      .orderBy(desc(blockchainRecords.id))
      .limit(1);
    
    return record;
  }

  async createBlockchainRecord(insertRecord: InsertBlockchainRecord): Promise<BlockchainRecord> {
    const [record] = await db.insert(blockchainRecords).values(insertRecord).returning();
    return record;
  }
  
  async getBlockchainRecordCount(): Promise<number> {
    const result = await db.select({ count: count(blockchainRecords.id) }).from(blockchainRecords);
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();
