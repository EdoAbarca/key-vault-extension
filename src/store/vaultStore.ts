/**
 * Vault Store Module
 * 
 * Zustand store for managing vault state, credentials, and UI state
 */

import { create } from 'zustand';
import type { CryptographyKey } from 'sodium-plus';
import type { CredentialData, ID } from '../storage/types';
import { createVaultStorage } from '../storage/vaultStorage';
import { useSessionStore } from './sessionStore';

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
  updateActivity: () => void;
}

/**
 * Helper function to decrypt all credentials from storage
 */
async function decryptAllCredentials(
  storage: ReturnType<typeof createVaultStorage>
): Promise<DecryptedCredential[]> {
  const allCredentials = await storage.getAllCredentials();
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
  
  return decryptedCredentials;
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
    
    // Initialize session when vault is unlocked
    const sessionStore = useSessionStore.getState();
    void sessionStore.initializeSession();
    sessionStore.startAutoLockTimer();
    
    // Notify background script
    if (typeof chrome !== 'undefined' && 'runtime' in chrome) {
      void chrome.runtime.sendMessage({ type: 'vault-unlock' }).catch(() => {
        // Ignore if background script is not available
      });
    }
  },

  /**
   * Unlock vault and load credentials
   */
  unlock: async (key: CryptographyKey) => {
    set({ key, isUnlocked: true, isLoading: true, error: null });
    
    try {
      const storage = createVaultStorage(key);
      const decryptedCredentials = await decryptAllCredentials(storage);
      set({ credentials: decryptedCredentials, isLoading: false });
      
      // Initialize session when vault is unlocked
      const sessionStore = useSessionStore.getState();
      await sessionStore.initializeSession();
      sessionStore.startAutoLockTimer();
      
      // Notify background script
      if (typeof chrome !== 'undefined' && 'runtime' in chrome) {
        void chrome.runtime.sendMessage({ type: 'vault-unlock' }).catch(() => {
          // Ignore if background script is not available
        });
      }
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
    // Clear session
    const sessionStore = useSessionStore.getState();
    sessionStore.clearSession();
    
    // Clear sensitive data from memory
    set({
      isUnlocked: false,
      key: null,
      credentials: [],
      searchQuery: '',
      selectedCredentialId: null,
      error: null,
    });
    
    // Notify background script
    if (typeof chrome !== 'undefined' && 'runtime' in chrome) {
      void chrome.runtime.sendMessage({ type: 'vault-lock' }).catch(() => {
        // Ignore if background script is not available
      });
    }
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
      const decryptedCredentials = await decryptAllCredentials(storage);
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
    
    // Update activity on user interaction
    const sessionStore = useSessionStore.getState();
    sessionStore.updateActivity();
  },

  /**
   * Select a credential
   */
  selectCredential: (id: ID | null) => {
    set({ selectedCredentialId: id });
    
    // Update activity on user interaction
    const sessionStore = useSessionStore.getState();
    sessionStore.updateActivity();
  },

  /**
   * Copy text to clipboard
   */
  copyToClipboard: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Update activity on user interaction
      const sessionStore = useSessionStore.getState();
      sessionStore.updateActivity();
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  },

  /**
   * Update activity (called on user interactions)
   */
  updateActivity: () => {
    const sessionStore = useSessionStore.getState();
    sessionStore.updateActivity();
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

/**
 * Initialize auto-lock event listener
 * This listens for vault-auto-lock events dispatched by the session store
 */
if (typeof window !== 'undefined') {
  window.addEventListener('vault-auto-lock', () => {
    const vaultStore = useVaultStore.getState();
    if (vaultStore.isUnlocked) {
      vaultStore.lock();
    }
  });
}

/**
 * Listen for lock messages from background script
 */
if (typeof chrome !== 'undefined' && 'runtime' in chrome) {
  chrome.runtime.onMessage.addListener((message: unknown) => {
    if (typeof message === 'object' && message !== null && 'type' in message) {
      const msg = message as { type: string; reason?: string };
      
      if (msg.type === 'vault-locked') {
        console.log('[VaultStore] Received lock message from background:', msg.reason);
        const vaultStore = useVaultStore.getState();
        if (vaultStore.isUnlocked) {
          vaultStore.lock();
        }
      }
    }
  });
}
