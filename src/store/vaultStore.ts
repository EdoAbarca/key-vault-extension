/**
 * Vault Store Module
 * 
 * Zustand store for managing vault state, credentials, and UI state
 */

import { create } from 'zustand';
import type { CryptographyKey } from 'sodium-plus';
import type { CredentialData, ID } from '../storage/types';
import { createVaultStorage } from '../storage/vaultStorage';

/**
 * Decrypted credential with metadata
 */
export interface DecryptedCredential extends CredentialData {
  id: ID;
  createdAt: number;
  updatedAt: number;
}

/**
 * Vault store state
 */
interface VaultState {
  // Authentication state
  isUnlocked: boolean;
  key: CryptographyKey | null;
  
  // Credentials
  credentials: DecryptedCredential[];
  isLoading: boolean;
  error: string | null;
  
  // UI state
  searchQuery: string;
  selectedCredentialId: ID | null;
  
  // Actions
  setKey: (key: CryptographyKey) => void;
  unlock: (key: CryptographyKey) => Promise<void>;
  lock: () => void;
  loadCredentials: () => Promise<void>;
  searchCredentials: (query: string) => void;
  selectCredential: (id: ID | null) => void;
  copyToClipboard: (text: string) => Promise<void>;
  getFilteredCredentials: () => DecryptedCredential[];
}

/**
 * Create vault store
 */
export const useVaultStore = create<VaultState>((set, get) => ({
  // Initial state
  isUnlocked: false,
  key: null,
  credentials: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCredentialId: null,

  /**
   * Set the encryption key
   */
  setKey: (key: CryptographyKey) => {
    set({ key, isUnlocked: true });
  },

  /**
   * Unlock vault and load credentials
   */
  unlock: async (key: CryptographyKey) => {
    set({ key, isUnlocked: true, isLoading: true, error: null });
    
    try {
      const storage = createVaultStorage(key);
      const allCredentials = await storage.getAllCredentials();
      
      // Decrypt all credentials
      const decryptedCredentials: DecryptedCredential[] = [];
      for (const credential of allCredentials) {
        try {
          const data = await storage.getCredentialData(credential.id);
          decryptedCredentials.push({
            ...data,
            id: credential.id,
            createdAt: credential.createdAt,
            updatedAt: credential.updatedAt,
          });
        } catch (error) {
          console.error(`Failed to decrypt credential ${credential.id}:`, error);
        }
      }
      
      set({ credentials: decryptedCredentials, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load credentials',
        isLoading: false 
      });
    }
  },

  /**
   * Lock vault and clear sensitive data
   */
  lock: () => {
    set({
      isUnlocked: false,
      key: null,
      credentials: [],
      searchQuery: '',
      selectedCredentialId: null,
      error: null,
    });
  },

  /**
   * Load credentials from storage
   */
  loadCredentials: async () => {
    const { key } = get();
    if (!key) {
      set({ error: 'Vault is locked' });
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const storage = createVaultStorage(key);
      const allCredentials = await storage.getAllCredentials();
      
      // Decrypt all credentials
      const decryptedCredentials: DecryptedCredential[] = [];
      for (const credential of allCredentials) {
        try {
          const data = await storage.getCredentialData(credential.id);
          decryptedCredentials.push({
            ...data,
            id: credential.id,
            createdAt: credential.createdAt,
            updatedAt: credential.updatedAt,
          });
        } catch (error) {
          console.error(`Failed to decrypt credential ${credential.id}:`, error);
        }
      }
      
      set({ credentials: decryptedCredentials, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load credentials',
        isLoading: false 
      });
    }
  },

  /**
   * Update search query
   */
  searchCredentials: (query: string) => {
    set({ searchQuery: query, selectedCredentialId: null });
  },

  /**
   * Select a credential
   */
  selectCredential: (id: ID | null) => {
    set({ selectedCredentialId: id });
  },

  /**
   * Copy text to clipboard
   */
  copyToClipboard: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  },

  /**
   * Get filtered credentials based on search query
   */
  getFilteredCredentials: () => {
    const { credentials, searchQuery } = get();
    
    if (!searchQuery.trim()) {
      return credentials;
    }
    
    const query = searchQuery.toLowerCase();
    return credentials.filter((credential) => {
      return (
        credential.title.toLowerCase().includes(query) ||
        credential.username.toLowerCase().includes(query) ||
        (credential.url?.toLowerCase().includes(query) ?? false) ||
        (credential.notes?.toLowerCase().includes(query) ?? false)
      );
    });
  },
}));
