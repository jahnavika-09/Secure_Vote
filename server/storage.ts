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
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  
  // Blockchain Record Management
  getBlockchainRecord(id: number): Promise<BlockchainRecord | undefined>;
  getBlockchainRecordByHash(hash: string): Promise<BlockchainRecord | undefined>;
  getLatestBlockchainRecord(): Promise<BlockchainRecord | undefined>;
  createBlockchainRecord(record: InsertBlockchainRecord): Promise<BlockchainRecord>;
  
  // Session Store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private voterProfiles: Map<number, VoterProfile>;
  private verificationSessions: Map<number, VerificationSession>;
  private blockchainRecords: Map<number, BlockchainRecord>;
  
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentProfileId: number;
  currentSessionId: number;
  currentBlockId: number;

  constructor() {
    this.users = new Map();
    this.voterProfiles = new Map();
    this.verificationSessions = new Map();
    this.blockchainRecords = new Map();
    
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentSessionId = 1;
    this.currentBlockId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Voter Profile Management
  async getVoterProfile(id: number): Promise<VoterProfile | undefined> {
    return this.voterProfiles.get(id);
  }

  async getVoterProfileByUserId(userId: number): Promise<VoterProfile | undefined> {
    return Array.from(this.voterProfiles.values()).find(profile => profile.userId === userId);
  }

  async getVoterProfileByVoterId(voterId: string): Promise<VoterProfile | undefined> {
    return Array.from(this.voterProfiles.values()).find(profile => profile.voterId === voterId);
  }

  async createVoterProfile(insertProfile: InsertVoterProfile): Promise<VoterProfile> {
    const id = this.currentProfileId++;
    const profile: VoterProfile = { ...insertProfile, id };
    this.voterProfiles.set(id, profile);
    return profile;
  }

  async updateVoterProfile(id: number, updates: Partial<VoterProfile>): Promise<VoterProfile | undefined> {
    const profile = this.voterProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...updates };
    this.voterProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Verification Session Management
  async getVerificationSession(id: number): Promise<VerificationSession | undefined> {
    return this.verificationSessions.get(id);
  }

  async getVerificationSessionsByUserId(userId: number): Promise<VerificationSession[]> {
    return Array.from(this.verificationSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createVerificationSession(insertSession: InsertVerificationSession): Promise<VerificationSession> {
    const id = this.currentSessionId++;
    const timestamp = new Date();
    const session: VerificationSession = { ...insertSession, id, timestamp };
    this.verificationSessions.set(id, session);
    return session;
  }

  async updateVerificationSession(id: number, updates: Partial<VerificationSession>): Promise<VerificationSession | undefined> {
    const session = this.verificationSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.verificationSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Blockchain Record Management
  async getBlockchainRecord(id: number): Promise<BlockchainRecord | undefined> {
    return this.blockchainRecords.get(id);
  }

  async getBlockchainRecordByHash(hash: string): Promise<BlockchainRecord | undefined> {
    return Array.from(this.blockchainRecords.values()).find(record => record.hash === hash);
  }

  async getLatestBlockchainRecord(): Promise<BlockchainRecord | undefined> {
    if (this.blockchainRecords.size === 0) return undefined;
    
    // Sort by id in descending order and get the first one
    return Array.from(this.blockchainRecords.values())
      .sort((a, b) => b.id - a.id)[0];
  }

  async createBlockchainRecord(insertRecord: InsertBlockchainRecord): Promise<BlockchainRecord> {
    const id = this.currentBlockId++;
    const record: BlockchainRecord = { ...insertRecord, id };
    this.blockchainRecords.set(id, record);
    return record;
  }
}

export const storage = new MemStorage();
