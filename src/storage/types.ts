/**
 * Storage Types Module
 * 
 * Defines TypeScript interfaces and types for vault data storage.
 * All data stored in IndexedDB is encrypted using XChaCha20-Poly1305.
 */

import type { EncryptedData } from '../crypto';

/**
 * Unique identifier type for database records
 */
export type ID = string;

/**
 * Credential entry in the vault
 * Stored encrypted in IndexedDB
 */
export interface Credential {
  /** Unique identifier */
  id: ID;
  /** Parent folder ID (null for root level) */
  folderId: ID | null;
  /** Encrypted credential data */
  encryptedData: EncryptedData;
  /** Creation timestamp */
  createdAt: number;
  /** Last modification timestamp */
  updatedAt: number;
  /** Soft delete flag */
  deleted: boolean;
}

/**
 * Decrypted credential data structure
 */
export interface CredentialData {
  /** Service or website name */
  title: string;
  /** Username or email */
  username: string;
  /** Password */
  password: string;
  /** Website URL */
  url?: string;
  /** Additional notes */
  notes?: string;
  /** Custom fields */
  customFields?: Record<string, string>;
}

/**
 * Folder for organizing credentials
 */
export interface Folder {
  /** Unique identifier */
  id: ID;
  /** Parent folder ID (null for root level) */
  parentId: ID | null;
  /** Folder name */
  name: string;
  /** Creation timestamp */
  createdAt: number;
  /** Last modification timestamp */
  updatedAt: number;
  /** Soft delete flag */
  deleted: boolean;
}

/**
 * Vault metadata and configuration
 */
export interface VaultMetadata {
  /** Unique identifier (always 'default') */
  id: string;
  /** Base64-encoded salt for key derivation */
  salt: string;
  /** Vault creation timestamp */
  createdAt: number;
  /** Last access timestamp */
  lastAccessedAt: number;
  /** Database schema version */
  schemaVersion: number;
  /** Whether vault is initialized */
  initialized: boolean;
}

/**
 * Database schema version
 * Increment when making schema changes
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Default vault metadata for new installations
 */
export const DEFAULT_METADATA: Omit<VaultMetadata, 'salt' | 'createdAt' | 'lastAccessedAt'> = {
  id: 'default',
  schemaVersion: CURRENT_SCHEMA_VERSION,
  initialized: false,
};
