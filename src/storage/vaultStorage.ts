/**
 * Encrypted Storage Layer Module
 * 
 * Provides high-level API for storing and retrieving encrypted vault data.
 * Handles encryption/decryption transparently using XChaCha20-Poly1305.
 */

import type { CryptographyKey } from 'sodium-plus';
import { encryptCredentials, decryptCredentials } from '../crypto';
import { getDatabase } from './database';
import type {
  Credential,
  CredentialData,
  Folder,
  ID,
  VaultMetadata,
} from './types';

/**
 * Error thrown when vault is not initialized
 */
export class VaultNotInitializedError extends Error {
  constructor() {
    super('Vault is not initialized. Please initialize the vault first.');
    this.name = 'VaultNotInitializedError';
  }
}

/**
 * Error thrown when credential is not found
 */
export class CredentialNotFoundError extends Error {
  constructor(id: ID) {
    super(`Credential with id '${id}' not found`);
    this.name = 'CredentialNotFoundError';
  }
}

/**
 * Error thrown when folder is not found
 */
export class FolderNotFoundError extends Error {
  constructor(id: ID) {
    super(`Folder with id '${id}' not found`);
    this.name = 'FolderNotFoundError';
  }
}

/**
 * Generate a unique ID for database records
 */
function generateId(): ID {
  return `${Date.now().toString()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Vault Storage API
 * 
 * Main interface for interacting with encrypted vault storage.
 */
export class VaultStorage {
  private key: CryptographyKey;

  constructor(key: CryptographyKey) {
    this.key = key;
  }

  /**
   * Check if vault is initialized
   */
  async isInitialized(): Promise<boolean> {
    const db = getDatabase();
    return await db.isInitialized();
  }

  /**
   * Get vault metadata
   */
  async getMetadata(): Promise<VaultMetadata | undefined> {
    const db = getDatabase();
    return await db.getMetadata();
  }

  /**
   * Initialize the vault with a salt
   */
  async initialize(salt: string): Promise<void> {
    const db = getDatabase();
    await db.initialize(salt);
  }

  // ==================== Credential Operations ====================

  /**
   * Create a new credential
   * 
   * @param data - Credential data to store
   * @param folderId - Optional folder ID to organize the credential
   * @returns Created credential with generated ID
   */
  async createCredential(
    data: CredentialData,
    folderId: ID | null = null
  ): Promise<Credential> {
    const db = getDatabase();
    
    // Encrypt credential data
    const encryptedData = await encryptCredentials(data as unknown as Record<string, unknown>, this.key);
    
    const now = Date.now();
    const credential: Credential = {
      id: generateId(),
      folderId,
      encryptedData,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };

    await db.credentials.add(credential);
    await db.updateLastAccessed();
    
    return credential;
  }

  /**
   * Get a credential by ID
   * 
   * @param id - Credential ID
   * @returns Credential or undefined if not found
   */
  async getCredential(id: ID): Promise<Credential | undefined> {
    const db = getDatabase();
    const credential = await db.credentials.get(id);
    
    if (credential) {
      await db.updateLastAccessed();
    }
    
    return credential;
  }

  /**
   * Get decrypted credential data
   * 
   * @param id - Credential ID
   * @returns Decrypted credential data
   * @throws {CredentialNotFoundError} If credential not found
   */
  async getCredentialData(id: ID): Promise<CredentialData> {
    const credential = await this.getCredential(id);
    
    if (!credential) {
      throw new CredentialNotFoundError(id);
    }

    // Decrypt credential data
    const data = await decryptCredentials(credential.encryptedData, this.key);
    return data as unknown as CredentialData;
  }

  /**
   * Get all credentials (excluding deleted)
   * 
   * @param folderId - Optional folder ID to filter by
   * @returns Array of credentials
   */
  async getAllCredentials(folderId?: ID | null): Promise<Credential[]> {
    const db = getDatabase();
    
    let collection = db.credentials.filter(c => !c.deleted);
    
    if (folderId !== undefined) {
      collection = collection.filter(c => c.folderId === folderId);
    }
    
    const credentials = await collection.toArray();
    await db.updateLastAccessed();
    
    return credentials;
  }

  /**
   * Update a credential
   * 
   * @param id - Credential ID
   * @param data - New credential data
   * @throws {CredentialNotFoundError} If credential not found
   */
  async updateCredential(id: ID, data: CredentialData): Promise<void> {
    const db = getDatabase();
    const existing = await db.credentials.get(id);
    
    if (!existing) {
      throw new CredentialNotFoundError(id);
    }

    // Encrypt updated data
    const encryptedData = await encryptCredentials(data as unknown as Record<string, unknown>, this.key);
    
    await db.credentials.update(id, {
      encryptedData,
      updatedAt: Date.now(),
    });
    
    await db.updateLastAccessed();
  }

  /**
   * Delete a credential (soft delete)
   * 
   * @param id - Credential ID
   * @throws {CredentialNotFoundError} If credential not found
   */
  async deleteCredential(id: ID): Promise<void> {
    const db = getDatabase();
    const existing = await db.credentials.get(id);
    
    if (!existing) {
      throw new CredentialNotFoundError(id);
    }

    await db.credentials.update(id, {
      deleted: true,
      updatedAt: Date.now(),
    });
    
    await db.updateLastAccessed();
  }

  /**
   * Permanently delete a credential
   * 
   * @param id - Credential ID
   */
  async permanentlyDeleteCredential(id: ID): Promise<void> {
    const db = getDatabase();
    await db.credentials.delete(id);
    await db.updateLastAccessed();
  }

  // ==================== Folder Operations ====================

  /**
   * Create a new folder
   * 
   * @param name - Folder name
   * @param parentId - Optional parent folder ID
   * @returns Created folder with generated ID
   */
  async createFolder(name: string, parentId: ID | null = null): Promise<Folder> {
    const db = getDatabase();
    
    const now = Date.now();
    const folder: Folder = {
      id: generateId(),
      parentId,
      name,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };

    await db.folders.add(folder);
    await db.updateLastAccessed();
    
    return folder;
  }

  /**
   * Get a folder by ID
   * 
   * @param id - Folder ID
   * @returns Folder or undefined if not found
   */
  async getFolder(id: ID): Promise<Folder | undefined> {
    const db = getDatabase();
    const folder = await db.folders.get(id);
    
    if (folder) {
      await db.updateLastAccessed();
    }
    
    return folder;
  }

  /**
   * Get all folders (excluding deleted)
   * 
   * @param parentId - Optional parent folder ID to filter by
   * @returns Array of folders
   */
  async getAllFolders(parentId?: ID | null): Promise<Folder[]> {
    const db = getDatabase();
    
    let collection = db.folders.filter(f => !f.deleted);
    
    if (parentId !== undefined) {
      collection = collection.filter(f => f.parentId === parentId);
    }
    
    const folders = await collection.toArray();
    await db.updateLastAccessed();
    
    return folders;
  }

  /**
   * Update a folder
   * 
   * @param id - Folder ID
   * @param name - New folder name
   * @throws {FolderNotFoundError} If folder not found
   */
  async updateFolder(id: ID, name: string): Promise<void> {
    const db = getDatabase();
    const existing = await db.folders.get(id);
    
    if (!existing) {
      throw new FolderNotFoundError(id);
    }

    await db.folders.update(id, {
      name,
      updatedAt: Date.now(),
    });
    
    await db.updateLastAccessed();
  }

  /**
   * Delete a folder (soft delete)
   * 
   * @param id - Folder ID
   * @throws {FolderNotFoundError} If folder not found
   */
  async deleteFolder(id: ID): Promise<void> {
    const db = getDatabase();
    const existing = await db.folders.get(id);
    
    if (!existing) {
      throw new FolderNotFoundError(id);
    }

    await db.folders.update(id, {
      deleted: true,
      updatedAt: Date.now(),
    });
    
    await db.updateLastAccessed();
  }

  /**
   * Permanently delete a folder
   * 
   * @param id - Folder ID
   */
  async permanentlyDeleteFolder(id: ID): Promise<void> {
    const db = getDatabase();
    await db.folders.delete(id);
    await db.updateLastAccessed();
  }

  // ==================== Utility Methods ====================

  /**
   * Clear all data from the vault
   * WARNING: This permanently deletes all vault data
   */
  async clearAll(): Promise<void> {
    const db = getDatabase();
    await db.clearAll();
  }
}

/**
 * Create a new VaultStorage instance with the given key
 * 
 * @param key - Cryptography key for encryption/decryption
 * @returns VaultStorage instance
 */
export function createVaultStorage(key: CryptographyKey): VaultStorage {
  return new VaultStorage(key);
}
