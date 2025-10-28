/**
 * Integration Tests for Auto-Lock Functionality
 * 
 * Tests the complete auto-lock flow across session store and vault store
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSessionStore } from './sessionStore';
import { useVaultStore } from './vaultStore';
import type { CryptographyKey } from 'sodium-plus';

// Mock the storage module
jest.mock('../storage/vaultStorage', () => ({
  createVaultStorage: jest.fn(() => ({
    getAllCredentials: jest.fn().mockResolvedValue([
      {
        id: 'test-id-1',
        folderId: null,
        encryptedData: { ciphertext: 'encrypted', nonce: 'nonce' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: false,
      },
    ]),
    getCredentialData: jest.fn().mockResolvedValue({
      title: 'Test Site',
      username: 'test@example.com',
      password: 'testpassword123',
      url: 'https://test.com',
    }),
  })),
}));

// Mock chrome.storage API
const mockChromeStorage = {
  local: {
    get: jest.fn().mockResolvedValue({}),
    set: jest.fn().mockResolvedValue(undefined),
  },
};

// Mock chrome.runtime API
const mockChromeRuntime = {
  sendMessage: jest.fn().mockResolvedValue(undefined),
  onMessage: {
    addListener: jest.fn(),
  },
};

// Set up global chrome object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).chrome = {
  storage: mockChromeStorage,
  runtime: mockChromeRuntime,
};

describe('Auto-Lock Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset stores to initial state
    useSessionStore.setState({
      isActive: false,
      lastActivityTime: Date.now(),
      lockTimeoutMinutes: 15,
      autoLockTimerId: null,
    });
    
    useVaultStore.setState({
      isUnlocked: false,
      key: null,
      credentials: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedCredentialId: null,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('automatically locks vault after timeout period', async () => {
    const { result: sessionResult } = renderHook(() => useSessionStore());
    const { result: vaultResult } = renderHook(() => useVaultStore());
    const mockKey = {} as CryptographyKey;

    // Unlock vault
    await act(async () => {
      await vaultResult.current.unlock(mockKey);
    });

    expect(vaultResult.current.isUnlocked).toBe(true);
    expect(sessionResult.current.isActive).toBe(true);

    // Set lock timeout to 1 minute for testing
    await act(async () => {
      await sessionResult.current.setLockTimeout(1);
    });

    // Set last activity to more than 1 minute ago
    const oneMinuteAgo = Date.now() - (1 * 60 * 1000 + 1000);
    act(() => {
      useSessionStore.setState({ lastActivityTime: oneMinuteAgo });
    });

    // Fast forward the timer check (runs every 10 seconds)
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Vault should be locked
    expect(vaultResult.current.isUnlocked).toBe(false);
    expect(vaultResult.current.key).toBe(null);
    expect(vaultResult.current.credentials).toEqual([]);
    expect(sessionResult.current.isActive).toBe(false);
  }, 10000);

  it('does not lock vault if activity is recent', async () => {
    const { result: sessionResult } = renderHook(() => useSessionStore());
    const { result: vaultResult } = renderHook(() => useVaultStore());
    const mockKey = {} as CryptographyKey;

    // Unlock vault
    await act(async () => {
      await vaultResult.current.unlock(mockKey);
    });

    expect(vaultResult.current.isUnlocked).toBe(true);

    // Set lock timeout to 1 minute
    await act(async () => {
      await sessionResult.current.setLockTimeout(1);
    });

    // Update activity
    act(() => {
      vaultResult.current.updateActivity();
    });

    // Fast forward timer check
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Vault should still be unlocked
    expect(vaultResult.current.isUnlocked).toBe(true);
    expect(sessionResult.current.isActive).toBe(true);
  }, 10000);

  it('clears sensitive data when vault is locked', async () => {
    const { result: vaultResult } = renderHook(() => useVaultStore());
    const mockKey = {} as CryptographyKey;

    // Unlock and load credentials
    await act(async () => {
      await vaultResult.current.unlock(mockKey);
    });

    await waitFor(() => {
      expect(vaultResult.current.credentials.length).toBeGreaterThan(0);
    });

    // Add some UI state
    act(() => {
      vaultResult.current.searchCredentials('test query');
      vaultResult.current.selectCredential('test-id');
    });

    expect(vaultResult.current.searchQuery).toBe('test query');
    expect(vaultResult.current.selectedCredentialId).toBe('test-id');

    // Lock vault
    act(() => {
      vaultResult.current.lock();
    });

    // All sensitive data should be cleared
    expect(vaultResult.current.isUnlocked).toBe(false);
    expect(vaultResult.current.key).toBe(null);
    expect(vaultResult.current.credentials).toEqual([]);
    expect(vaultResult.current.searchQuery).toBe('');
    expect(vaultResult.current.selectedCredentialId).toBe(null);
    expect(vaultResult.current.error).toBe(null);
  });

  it('updates activity on user interactions', async () => {
    const { result: sessionResult } = renderHook(() => useSessionStore());
    const { result: vaultResult } = renderHook(() => useVaultStore());
    const mockKey = {} as CryptographyKey;

    // Unlock vault
    await act(async () => {
      await vaultResult.current.unlock(mockKey);
    });

    const initialTime = sessionResult.current.lastActivityTime;

    // Advance time
    jest.advanceTimersByTime(5000);

    // Simulate user interaction
    act(() => {
      vaultResult.current.searchCredentials('test');
    });

    // Activity time should be updated
    expect(sessionResult.current.lastActivityTime).toBeGreaterThan(initialTime);
  });

  it('notifies background script on unlock and lock', async () => {
    const { result: vaultResult } = renderHook(() => useVaultStore());
    const mockKey = {} as CryptographyKey;

    // Unlock vault
    await act(async () => {
      await vaultResult.current.unlock(mockKey);
    });

    await waitFor(() => {
      expect(vaultResult.current.isUnlocked).toBe(true);
    });

    // Should notify background of unlock
    expect(mockChromeRuntime.sendMessage).toHaveBeenCalledWith({ type: 'vault-unlock' });

    // Lock vault
    act(() => {
      vaultResult.current.lock();
    });

    // Should notify background of lock
    expect(mockChromeRuntime.sendMessage).toHaveBeenCalledWith({ type: 'vault-lock' });
  });

  it('respects different lock timeout settings', async () => {
    const { result: sessionResult } = renderHook(() => useSessionStore());
    const { result: vaultResult } = renderHook(() => useVaultStore());
    const mockKey = {} as CryptographyKey;

    // Unlock vault
    await act(async () => {
      await vaultResult.current.unlock(mockKey);
    });

    // Set timeout to 30 minutes
    await act(async () => {
      await sessionResult.current.setLockTimeout(30);
    });

    expect(sessionResult.current.lockTimeoutMinutes).toBe(30);

    // Set last activity to 29 minutes ago (should not lock)
    const twentyNineMinutesAgo = Date.now() - (29 * 60 * 1000);
    act(() => {
      useSessionStore.setState({ lastActivityTime: twentyNineMinutesAgo });
    });

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Should still be unlocked
    expect(vaultResult.current.isUnlocked).toBe(true);

    // Set last activity to 31 minutes ago (should lock)
    const thirtyOneMinutesAgo = Date.now() - (31 * 60 * 1000);
    act(() => {
      useSessionStore.setState({ lastActivityTime: thirtyOneMinutesAgo });
    });

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Should now be locked
    expect(vaultResult.current.isUnlocked).toBe(false);
  }, 10000);
});
