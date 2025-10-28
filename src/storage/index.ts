/**
 * Storage Module - Main Export
 * 
 * Centralized exports for vault storage functionality.
 * Provides IndexedDB-based encrypted storage using Dexie.js.
 */

// Database configuration
export {
  VaultDatabase,
  getDatabase,
  closeDatabase,
  deleteDatabase,
} from './database';

// Storage API
export {
  VaultStorage,
  createVaultStorage,
  VaultNotInitializedError,
  CredentialNotFoundError,
  FolderNotFoundError,
} from './vaultStorage';

// Types
export type {
  ID,
  Credential,
  CredentialData,
  Folder,
  VaultMetadata,
} from './types';

export {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_METADATA,
} from './types';
