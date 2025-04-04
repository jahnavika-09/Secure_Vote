import { apiRequest } from "./queryClient";

// Basic Block interface
export interface Block {
  hash: string;
  previousHash: string;
  data: Record<string, any>;
  timestamp: number;
  nonce: number;
}

// BlockchainRecord interface
export interface BlockchainRecord {
  id: number;
  hash: string;
  previousHash: string;
  data: Record<string, any>;
  timestamp: number;
  nonce: number;
}

/**
 * Utility class to interact with the blockchain on the client side
 */
export class BlockchainUtil {
  /**
   * Verify the integrity of a block's hash
   * @param block The block to verify
   * @returns boolean indicating if the block's hash is valid
   */
  static verifyBlockHash(block: Block): boolean {
    const calculatedHash = this.calculateHash(
      block.previousHash,
      block.timestamp,
      block.data,
      block.nonce
    );
    return calculatedHash === block.hash;
  }

  /**
   * Calculate a block hash using SHA-256
   * @param previousHash 
   * @param timestamp 
   * @param data 
   * @param nonce 
   * @returns The calculated hash
   */
  static calculateHash(
    previousHash: string,
    timestamp: number,
    data: Record<string, any>,
    nonce: number
  ): string {
    // In a real application, we would use a proper hashing library
    // Here we're just simulating the hash calculation
    const blockString = previousHash + timestamp + JSON.stringify(data) + nonce;
    return this.simulateHash(blockString);
  }

  /**
   * Simulate SHA-256 hash (this is not a real hash function)
   * In a production environment, use a proper crypto library
   */
  private static simulateHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString(16);
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hex string and ensure it's 64 characters (like SHA-256)
    const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
    // Repeat to make it look more like a SHA-256 hash
    return (hexHash.repeat(8)).substring(0, 64);
  }

  /**
   * Fetch the latest block from the blockchain
   */
  static async getLatestBlock(): Promise<Block | null> {
    try {
      const res = await apiRequest("GET", "/api/admin/blockchain/latest", undefined);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error("Failed to fetch latest block:", error);
      return null;
    }
  }

  /**
   * Verify a transaction by its hash
   * @param hash The transaction hash to verify
   */
  static async verifyTransaction(hash: string): Promise<{
    valid: boolean;
    block?: Block;
    error?: string;
  }> {
    try {
      const res = await apiRequest("GET", `/api/admin/blockchain/verify/${hash}`, undefined);
      if (!res.ok) {
        return {
          valid: false,
          error: "Transaction not found or invalid"
        };
      }
      const data = await res.json();
      return {
        valid: data.valid,
        block: data.block
      };
    } catch (error) {
      return {
        valid: false,
        error: "Failed to verify transaction"
      };
    }
  }

  /**
   * Create a simplified representation of a block for display
   * @param block The block to format
   */
  static formatBlockForDisplay(block: Block): {
    hash: string;
    shortHash: string;
    previousHash: string;
    shortPreviousHash: string;
    timestamp: string;
    data: string;
  } {
    return {
      hash: block.hash,
      shortHash: `${block.hash.substring(0, 8)}...${block.hash.substring(block.hash.length - 8)}`,
      previousHash: block.previousHash,
      shortPreviousHash: `${block.previousHash.substring(0, 8)}...${block.previousHash.substring(block.previousHash.length - 8)}`,
      timestamp: new Date(block.timestamp).toLocaleString(),
      data: JSON.stringify(block.data, null, 2),
    };
  }
}

/**
 * Hook to get blockchain status
 * This would be a React hook in a real application
 */
export async function getBlockchainStatus(): Promise<{
  isValid: boolean;
  chainLength: number;
  message: string;
} | null> {
  try {
    const res = await apiRequest("GET", "/api/admin/blockchain", undefined);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch blockchain status:", error);
    return null;
  }
}
