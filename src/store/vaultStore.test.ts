/**
 * Vault Store Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react';
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

describe('useVaultStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useVaultStore());
    act(() => {
      result.current.lock();
    });
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useVaultStore());

    expect(result.current.isUnlocked).toBe(false);
    expect(result.current.key).toBe(null);
    expect(result.current.credentials).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedCredentialId).toBe(null);
  });

  it('sets key and unlocked state', () => {
    const { result } = renderHook(() => useVaultStore());
    const mockKey = {} as CryptographyKey;

    act(() => {
      result.current.setKey(mockKey);
    });

    expect(result.current.isUnlocked).toBe(true);
    expect(result.current.key).toBe(mockKey);
  });

  it('updates search query', () => {
    const { result } = renderHook(() => useVaultStore());

    act(() => {
      result.current.searchCredentials('test query');
    });

    expect(result.current.searchQuery).toBe('test query');
  });

  it('selects credential', () => {
    const { result } = renderHook(() => useVaultStore());

    act(() => {
      result.current.selectCredential('credential-id');
    });

    expect(result.current.selectedCredentialId).toBe('credential-id');
  });

  it('locks vault and clears sensitive data', () => {
    const { result } = renderHook(() => useVaultStore());
    const mockKey = {} as CryptographyKey;

    act(() => {
      result.current.setKey(mockKey);
      result.current.searchCredentials('test');
      result.current.selectCredential('id');
    });

    act(() => {
      result.current.lock();
    });

    expect(result.current.isUnlocked).toBe(false);
    expect(result.current.key).toBe(null);
    expect(result.current.credentials).toEqual([]);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedCredentialId).toBe(null);
  });

  it('filters credentials based on search query', async () => {
    const { result } = renderHook(() => useVaultStore());
    const mockKey = {} as CryptographyKey;

    // Unlock and load credentials
    await act(async () => {
      await result.current.unlock(mockKey);
    });

    // Wait for credentials to load
    await waitFor(() => {
      expect(result.current.credentials.length).toBeGreaterThan(0);
    });

    // Test filtering
    act(() => {
      result.current.searchCredentials('test');
    });

    const filtered = result.current.getFilteredCredentials();
    expect(filtered.length).toBeGreaterThan(0);

    // Test with non-matching query
    act(() => {
      result.current.searchCredentials('nonexistent');
    });

    const filteredEmpty = result.current.getFilteredCredentials();
    expect(filteredEmpty.length).toBe(0);
  });

  it('returns all credentials when search query is empty', async () => {
    const { result } = renderHook(() => useVaultStore());
    const mockKey = {} as CryptographyKey;

    await act(async () => {
      await result.current.unlock(mockKey);
    });

    await waitFor(() => {
      expect(result.current.credentials.length).toBeGreaterThan(0);
    });

    const filtered = result.current.getFilteredCredentials();
    expect(filtered).toEqual(result.current.credentials);
  });
});
