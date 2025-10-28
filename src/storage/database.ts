/**
 * Vault Database Module
 * 
 * IndexedDB database configuration using Dexie.js for encrypted vault storage.
 * All credential data is encrypted before storage using XChaCha20-Poly1305.
 * 
 * Database Schema:
 * - credentials: Encrypted credential entries
 * - folders: Folder hierarchy for organization
 * - metadata: Vault configuration and metadata
 */

import Dexie, { type Table } from 'dexie';
import type { Credential, Folder, VaultMetadata } from './types';
import { CURRENT_SCHEMA_VERSION } from './types';

/**
 * VaultDatabase class extending Dexie for type safety
 */
export class VaultDatabase extends Dexie {
  /** Credentials table */
  credentials!: Table<Credential, string>;
  /** Folders table */
  folders!: Table<Folder, string>;
  /** Metadata table */
  metadata!: Table<VaultMetadata, string>;

  constructor() {
    super('KeyVaultDB');
    
    // Define database schema
    // Version 1: Initial schema
    this.version(CURRENT_SCHEMA_VERSION).stores({
      // Credentials indexed by id, folderId, and deleted flag
      credentials: 'id, folderId, deleted, createdAt, updatedAt',
      // Folders indexed by id, parentId, and deleted flag
      folders: 'id, parentId, deleted, createdAt, updatedAt',
      // Metadata with single 'default' entry
      metadata: 'id',
    });
  }

  /**
   * Initialize the database with default metadata
   * Called on first run or after database reset
   */
  async initialize(salt: string): Promise<void> {
    const now = Date.now();
    
    await this.metadata.put({
      id: 'default',
      salt,
      createdAt: now,
      lastAccessedAt: now,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      initialized: true,
    });
  }

  /**
   * Check if the vault is initialized
   */
  async isInitialized(): Promise<boolean> {
    const metadata = await this.metadata.get('default');
    return metadata?.initialized ?? false;
  }

  /**
   * Get vault metadata
   */
  async getMetadata(): Promise<VaultMetadata | undefined> {
    return await this.metadata.get('default');
  }

  /**
   * Update last accessed timestamp
   */
  async updateLastAccessed(): Promise<void> {
    await this.metadata.update('default', {
      lastAccessedAt: Date.now(),
    });
  }

  /**
   * Clear all data from the database
   * WARNING: This permanently deletes all vault data
   */
  async clearAll(): Promise<void> {
    await this.transaction('rw', this.credentials, this.folders, this.metadata, async () => {
      await this.credentials.clear();
      await this.folders.clear();
      await this.metadata.clear();
    });
  }
}

/**
 * Singleton database instance
 */
let dbInstance: VaultDatabase | null = null;

/**
 * Get the database instance
 * Creates a new instance if one doesn't exist
 */
export function getDatabase(): VaultDatabase {
  dbInstance ??= new VaultDatabase();
  return dbInstance;
}

/**
 * Close the database connection
 * Useful for testing and cleanup
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Delete the entire database
 * WARNING: This permanently deletes all vault data
 */
export async function deleteDatabase(): Promise<void> {
  closeDatabase();
  await Dexie.delete('KeyVaultDB');
}
