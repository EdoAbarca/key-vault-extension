/**
 * Session Store Module
 * 
 * Manages vault session state including auto-lock timeout and inactivity detection
 */

import { create } from 'zustand';

/**
 * Lock timeout in minutes (1-60)
 */
export type LockTimeout = number;

/**
 * Session settings stored in chrome.storage
 */
export interface SessionSettings {
  lockTimeoutMinutes: LockTimeout;
}

/**
 * Default session settings
 */
export const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  lockTimeoutMinutes: 15, // 15 minutes default
};

/**
 * Session store state
 */
interface SessionState {
  // Session state
  isActive: boolean;
  lastActivityTime: number;
  lockTimeoutMinutes: LockTimeout;
  autoLockTimerId: NodeJS.Timeout | null;
  
  // Actions
  initializeSession: () => Promise<void>;
  updateActivity: () => void;
  startAutoLockTimer: () => void;
  stopAutoLockTimer: () => void;
  setLockTimeout: (minutes: LockTimeout) => Promise<void>;
  checkAndLockIfInactive: () => void;
  clearSession: () => void;
}

/**
 * Load settings from chrome.storage.local
 */
async function loadSettings(): Promise<SessionSettings> {
  if (typeof chrome !== 'undefined' && 'storage' in chrome) {
    try {
      const result = await chrome.storage.local.get('sessionSettings');
      if (result.sessionSettings) {
        return result.sessionSettings as SessionSettings;
      }
    } catch (error) {
      console.error('Failed to load session settings:', error);
    }
  }
  return DEFAULT_SESSION_SETTINGS;
}

/**
 * Save settings to chrome.storage.local
 */
async function saveSettings(settings: SessionSettings): Promise<void> {
  if (typeof chrome !== 'undefined' && 'storage' in chrome) {
    try {
      await chrome.storage.local.set({ sessionSettings: settings });
    } catch (error) {
      console.error('Failed to save session settings:', error);
    }
  }
}

/**
 * Create session store
 */
export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  isActive: false,
  lastActivityTime: Date.now(),
  lockTimeoutMinutes: DEFAULT_SESSION_SETTINGS.lockTimeoutMinutes,
  autoLockTimerId: null,

  /**
   * Initialize session with stored settings
   */
  initializeSession: async () => {
    const settings = await loadSettings();
    set({ 
      lockTimeoutMinutes: settings.lockTimeoutMinutes,
      isActive: true,
      lastActivityTime: Date.now(),
    });
  },

  /**
   * Update last activity time
   */
  updateActivity: () => {
    set({ lastActivityTime: Date.now() });
  },

  /**
   * Start auto-lock timer
   */
  startAutoLockTimer: () => {
    const { autoLockTimerId, stopAutoLockTimer } = get();
    
    // Clear existing timer
    if (autoLockTimerId) {
      stopAutoLockTimer();
    }

    // Check every 10 seconds for inactivity
    const timerId = setInterval(() => {
      get().checkAndLockIfInactive();
    }, 10000); // Check every 10 seconds

    set({ autoLockTimerId: timerId });
  },

  /**
   * Stop auto-lock timer
   */
  stopAutoLockTimer: () => {
    const { autoLockTimerId } = get();
    if (autoLockTimerId) {
      clearInterval(autoLockTimerId);
      set({ autoLockTimerId: null });
    }
  },

  /**
   * Set lock timeout and save to storage
   */
  setLockTimeout: async (minutes: LockTimeout) => {
    // Validate timeout (1-60 minutes)
    const validatedMinutes = Math.max(1, Math.min(60, minutes));
    
    set({ lockTimeoutMinutes: validatedMinutes });
    
    // Save to storage
    await saveSettings({ lockTimeoutMinutes: validatedMinutes });
  },

  /**
   * Check if session is inactive and trigger lock via event
   */
  checkAndLockIfInactive: () => {
    const { lastActivityTime, lockTimeoutMinutes, isActive } = get();
    
    if (!isActive) {
      return;
    }

    const now = Date.now();
    const timeoutMs = lockTimeoutMinutes * 60 * 1000;
    const inactiveTime = now - lastActivityTime;

    if (inactiveTime >= timeoutMs) {
      // Dispatch custom event to trigger lock
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vault-auto-lock'));
      }
      
      // Clear session state
      get().clearSession();
    }
  },

  /**
   * Clear session state (called when vault is locked)
   */
  clearSession: () => {
    const { stopAutoLockTimer } = get();
    stopAutoLockTimer();
    set({ 
      isActive: false,
      lastActivityTime: Date.now(),
    });
  },
}));
