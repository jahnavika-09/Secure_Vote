import { createHash } from 'crypto';
import { storage } from './storage';
import { InsertBlockchainRecord } from '@shared/schema';

class Block {
  hash: string;
  previousHash: string;
  data: Record<string, any>;
  timestamp: number;
  nonce: number;

  constructor(
    data: Record<string, any>,
    previousHash = ''
  ) {
    this.data = data;
    this.previousHash = previousHash;
    // Use seconds instead of milliseconds to fit in Postgres integer field
    this.timestamp = Math.floor(Date.now() / 1000);
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return createHash('sha256')
      .update(
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
      )
      .digest('hex');
  }

  // Simple proof of work with difficulty = 2
  mine(difficulty: number = 2): void {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

export class Blockchain {
  private static instance: Blockchain;
  private difficulty: number = 2;

  private constructor() {}

  static async getInstance(): Promise<Blockchain> {
    if (!Blockchain.instance) {
      Blockchain.instance = new Blockchain();
      
      // Check if there's already a genesis block in storage
      const latestBlock = await storage.getLatestBlockchainRecord();
      if (!latestBlock) {
        // Create genesis block if none exists
        await Blockchain.instance.createGenesisBlock();
      }
    }
    return Blockchain.instance;
  }

  async createGenesisBlock(): Promise<void> {
    const genesisBlock = new Block({ data: "Genesis Block" }, "0");
    genesisBlock.mine(this.difficulty);
    
    const blockRecord: InsertBlockchainRecord = {
      hash: genesisBlock.hash,
      previousHash: genesisBlock.previousHash,
      data: genesisBlock.data,
      timestamp: genesisBlock.timestamp,
      nonce: genesisBlock.nonce
    };
    
    await storage.createBlockchainRecord(blockRecord);
  }

  async getLatestBlock(): Promise<Block | null> {
    const latestRecord = await storage.getLatestBlockchainRecord();
    if (!latestRecord) return null;
    
    const block = new Block(latestRecord.data as Record<string, any>, latestRecord.previousHash);
    block.hash = latestRecord.hash;
    block.timestamp = latestRecord.timestamp;
    block.nonce = latestRecord.nonce;
    
    return block;
  }

  async addBlock(data: Record<string, any>): Promise<Block> {
    const latestBlock = await this.getLatestBlock();
    const previousHash = latestBlock ? latestBlock.hash : "0";
    
    const newBlock = new Block(data, previousHash);
    newBlock.mine(this.difficulty);
    
    const blockRecord: InsertBlockchainRecord = {
      hash: newBlock.hash,
      previousHash: newBlock.previousHash,
      data: newBlock.data,
      timestamp: newBlock.timestamp,
      nonce: newBlock.nonce
    };
    
    await storage.createBlockchainRecord(blockRecord);
    return newBlock;
  }

  async isChainValid(): Promise<boolean> {
    const records = Array.from(
      await Promise.all(
        Array(await this.getChainLength())
          .fill(0)
          .map((_, i) => storage.getBlockchainRecord(i + 1))
      )
    ).filter(Boolean);

    // Check if there are any records
    if (records.length === 0) return true;

    // Validate each block
    for (let i = 1; i < records.length; i++) {
      const currentBlock = records[i]!;
      const previousBlock = records[i - 1]!;

      // Validate current block hash
      const block = new Block(currentBlock.data as Record<string, any>, currentBlock.previousHash);
      block.timestamp = currentBlock.timestamp;
      block.nonce = currentBlock.nonce;
      
      if (currentBlock.hash !== block.calculateHash()) {
        return false;
      }

      // Validate link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  async getChainLength(): Promise<number> {
    // Query the database for the count of blockchain records
    const count = await storage.getBlockchainRecordCount();
    return count;
  }

  async getBlockByHash(hash: string): Promise<Block | null> {
    const record = await storage.getBlockchainRecordByHash(hash);
    if (!record) return null;
    
    const block = new Block(record.data as Record<string, any>, record.previousHash);
    block.hash = record.hash;
    block.timestamp = record.timestamp;
    block.nonce = record.nonce;
    
    return block;
  }
}

export async function initializeBlockchain(): Promise<void> {
  await Blockchain.getInstance();
}
