/**
 * VaultStorage Tests
 * 
 * Tests for encrypted storage layer with full encryption/decryption flow.
 */

import { deriveKey, exportSalt } from '../crypto';
import {
  createVaultStorage,
  VaultStorage,
  CredentialNotFoundError,
  FolderNotFoundError,
} from './vaultStorage';
import { deleteDatabase, closeDatabase } from './database';
import type { CredentialData } from './types';

describe('VaultStorage', () => {
  let storage: VaultStorage;
  const TEST_PASSWORD = 'test-master-password-123';

  beforeEach(async () => {
    // Clean slate for each test
    await deleteDatabase();
    
    // Derive a key for testing
    const { key, salt } = await deriveKey(TEST_PASSWORD);
    storage = createVaultStorage(key);
    
    // Initialize the vault
    await storage.initialize(exportSalt(salt));
  });

  afterEach(() => {
    closeDatabase();
  });

  afterAll(async () => {
    await deleteDatabase();
  });

  describe('Initialization', () => {
    it('should create a VaultStorage instance', () => {
      expect(storage).toBeInstanceOf(VaultStorage);
    });

    it('should report initialized after initialization', async () => {
      const initialized = await storage.isInitialized();
      expect(initialized).toBe(true);
    });

    it('should get metadata', async () => {
      const metadata = await storage.getMetadata();
      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe('default');
      expect(metadata?.initialized).toBe(true);
    });
  });

  describe('Credential Operations', () => {
    const testCredentialData: CredentialData = {
      title: 'Test Service',
      username: 'testuser@example.com',
      password: 'securePassword123!',
      url: 'https://example.com',
      notes: 'Test notes',
      customFields: {
        'security-question': 'What is your favorite color?',
        'answer': 'Blue',
      },
    };

    describe('Create Credential', () => {
      it('should create a credential with encrypted data', async () => {
        const credential = await storage.createCredential(testCredentialData);

        expect(credential.id).toBeDefined();
        expect(credential.folderId).toBeNull();
        expect(credential.encryptedData).toBeDefined();
        expect(credential.encryptedData.ciphertext).toBeDefined();
        expect(credential.encryptedData.nonce).toBeDefined();
        expect(credential.createdAt).toBeDefined();
        expect(credential.updatedAt).toBeDefined();
        expect(credential.deleted).toBe(false);
      });

      it('should create a credential in a folder', async () => {
        const folderId = 'test-folder-id';
        const credential = await storage.createCredential(testCredentialData, folderId);

        expect(credential.folderId).toBe(folderId);
      });

      it('should encrypt credential data', async () => {
        const credential = await storage.createCredential(testCredentialData);

        // Encrypted data should not contain plaintext
        const serialized = JSON.stringify(credential.encryptedData);
        expect(serialized).not.toContain('Test Service');
        expect(serialized).not.toContain('testuser@example.com');
        expect(serialized).not.toContain('securePassword123!');
      });
    });

    describe('Get Credential', () => {
      it('should retrieve a credential by ID', async () => {
        const created = await storage.createCredential(testCredentialData);
        const retrieved = await storage.getCredential(created.id);

        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe(created.id);
      });

      it('should return undefined for non-existent credential', async () => {
        const retrieved = await storage.getCredential('non-existent-id');
        expect(retrieved).toBeUndefined();
      });

      it('should decrypt credential data', async () => {
        const created = await storage.createCredential(testCredentialData);
        const decrypted = await storage.getCredentialData(created.id);

        expect(decrypted.title).toBe(testCredentialData.title);
        expect(decrypted.username).toBe(testCredentialData.username);
        expect(decrypted.password).toBe(testCredentialData.password);
        expect(decrypted.url).toBe(testCredentialData.url);
        expect(decrypted.notes).toBe(testCredentialData.notes);
        expect(decrypted.customFields).toEqual(testCredentialData.customFields);
      });

      it('should throw error when credential not found', async () => {
        await expect(storage.getCredentialData('non-existent-id'))
          .rejects.toThrow(CredentialNotFoundError);
      });
    });

    describe('Get All Credentials', () => {
      it('should return empty array when no credentials exist', async () => {
        const credentials = await storage.getAllCredentials();
        expect(credentials).toHaveLength(0);
      });

      it('should return all credentials', async () => {
        await storage.createCredential(testCredentialData);
        await storage.createCredential({ ...testCredentialData, title: 'Second Service' });

        const credentials = await storage.getAllCredentials();
        expect(credentials).toHaveLength(2);
      });

      it('should filter credentials by folder', async () => {
        const folder1 = 'folder-1';
        const folder2 = 'folder-2';

        await storage.createCredential(testCredentialData, folder1);
        await storage.createCredential(testCredentialData, folder1);
        await storage.createCredential(testCredentialData, folder2);

        const folder1Creds = await storage.getAllCredentials(folder1);
        expect(folder1Creds).toHaveLength(2);

        const folder2Creds = await storage.getAllCredentials(folder2);
        expect(folder2Creds).toHaveLength(1);
      });

      it('should exclude deleted credentials', async () => {
        const cred1 = await storage.createCredential(testCredentialData);
        await storage.createCredential(testCredentialData);

        await storage.deleteCredential(cred1.id);

        const credentials = await storage.getAllCredentials();
        expect(credentials).toHaveLength(1);
      });
    });

    describe('Update Credential', () => {
      it('should update credential data', async () => {
        const created = await storage.createCredential(testCredentialData);

        const updatedData: CredentialData = {
          ...testCredentialData,
          title: 'Updated Service',
          password: 'newPassword456!',
        };

        await storage.updateCredential(created.id, updatedData);

        const decrypted = await storage.getCredentialData(created.id);
        expect(decrypted.title).toBe('Updated Service');
        expect(decrypted.password).toBe('newPassword456!');
      });

      it('should update timestamp on update', async () => {
        const created = await storage.createCredential(testCredentialData);
        const beforeUpdate = created.updatedAt;

        // Wait a bit to ensure timestamp changes
        await new Promise(resolve => { setTimeout(resolve, 10); });

        await storage.updateCredential(created.id, testCredentialData);

        const updated = await storage.getCredential(created.id);
        expect(updated?.updatedAt).toBeGreaterThan(beforeUpdate);
      });

      it('should throw error when credential not found', async () => {
        await expect(storage.updateCredential('non-existent-id', testCredentialData))
          .rejects.toThrow(CredentialNotFoundError);
      });
    });

    describe('Delete Credential', () => {
      it('should soft delete a credential', async () => {
        const created = await storage.createCredential(testCredentialData);

        await storage.deleteCredential(created.id);

        const retrieved = await storage.getCredential(created.id);
        expect(retrieved?.deleted).toBe(true);
      });

      it('should exclude soft deleted credentials from getAllCredentials', async () => {
        const cred = await storage.createCredential(testCredentialData);
        await storage.deleteCredential(cred.id);

        const credentials = await storage.getAllCredentials();
        expect(credentials).toHaveLength(0);
      });

      it('should throw error when credential not found', async () => {
        await expect(storage.deleteCredential('non-existent-id'))
          .rejects.toThrow(CredentialNotFoundError);
      });

      it('should permanently delete a credential', async () => {
        const created = await storage.createCredential(testCredentialData);

        await storage.permanentlyDeleteCredential(created.id);

        const retrieved = await storage.getCredential(created.id);
        expect(retrieved).toBeUndefined();
      });
    });
  });

  describe('Folder Operations', () => {
    describe('Create Folder', () => {
      it('should create a folder', async () => {
        const folder = await storage.createFolder('Test Folder');

        expect(folder.id).toBeDefined();
        expect(folder.name).toBe('Test Folder');
        expect(folder.parentId).toBeNull();
        expect(folder.createdAt).toBeDefined();
        expect(folder.updatedAt).toBeDefined();
        expect(folder.deleted).toBe(false);
      });

      it('should create a nested folder', async () => {
        const parentId = 'parent-folder-id';
        const folder = await storage.createFolder('Child Folder', parentId);

        expect(folder.parentId).toBe(parentId);
      });
    });

    describe('Get Folder', () => {
      it('should retrieve a folder by ID', async () => {
        const created = await storage.createFolder('Test Folder');
        const retrieved = await storage.getFolder(created.id);

        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe(created.id);
        expect(retrieved?.name).toBe('Test Folder');
      });

      it('should return undefined for non-existent folder', async () => {
        const retrieved = await storage.getFolder('non-existent-id');
        expect(retrieved).toBeUndefined();
      });
    });

    describe('Get All Folders', () => {
      it('should return empty array when no folders exist', async () => {
        const folders = await storage.getAllFolders();
        expect(folders).toHaveLength(0);
      });

      it('should return all folders', async () => {
        await storage.createFolder('Folder 1');
        await storage.createFolder('Folder 2');

        const folders = await storage.getAllFolders();
        expect(folders).toHaveLength(2);
      });

      it('should filter folders by parent', async () => {
        const parent1 = 'parent-1';
        const parent2 = 'parent-2';

        await storage.createFolder('Child 1', parent1);
        await storage.createFolder('Child 2', parent1);
        await storage.createFolder('Child 3', parent2);

        const parent1Folders = await storage.getAllFolders(parent1);
        expect(parent1Folders).toHaveLength(2);

        const parent2Folders = await storage.getAllFolders(parent2);
        expect(parent2Folders).toHaveLength(1);
      });

      it('should exclude deleted folders', async () => {
        const folder1 = await storage.createFolder('Folder 1');
        await storage.createFolder('Folder 2');

        await storage.deleteFolder(folder1.id);

        const folders = await storage.getAllFolders();
        expect(folders).toHaveLength(1);
      });
    });

    describe('Update Folder', () => {
      it('should update folder name', async () => {
        const created = await storage.createFolder('Old Name');

        await storage.updateFolder(created.id, 'New Name');

        const updated = await storage.getFolder(created.id);
        expect(updated?.name).toBe('New Name');
      });

      it('should update timestamp on update', async () => {
        const created = await storage.createFolder('Test Folder');
        const beforeUpdate = created.updatedAt;

        // Wait a bit to ensure timestamp changes
        await new Promise(resolve => { setTimeout(resolve, 10); });

        await storage.updateFolder(created.id, 'Updated Folder');

        const updated = await storage.getFolder(created.id);
        expect(updated?.updatedAt).toBeGreaterThan(beforeUpdate);
      });

      it('should throw error when folder not found', async () => {
        await expect(storage.updateFolder('non-existent-id', 'New Name'))
          .rejects.toThrow(FolderNotFoundError);
      });
    });

    describe('Delete Folder', () => {
      it('should soft delete a folder', async () => {
        const created = await storage.createFolder('Test Folder');

        await storage.deleteFolder(created.id);

        const retrieved = await storage.getFolder(created.id);
        expect(retrieved?.deleted).toBe(true);
      });

      it('should exclude soft deleted folders from getAllFolders', async () => {
        const folder = await storage.createFolder('Test Folder');
        await storage.deleteFolder(folder.id);

        const folders = await storage.getAllFolders();
        expect(folders).toHaveLength(0);
      });

      it('should throw error when folder not found', async () => {
        await expect(storage.deleteFolder('non-existent-id'))
          .rejects.toThrow(FolderNotFoundError);
      });

      it('should permanently delete a folder', async () => {
        const created = await storage.createFolder('Test Folder');

        await storage.permanentlyDeleteFolder(created.id);

        const retrieved = await storage.getFolder(created.id);
        expect(retrieved).toBeUndefined();
      });
    });
  });

  describe('Clear All', () => {
    it('should clear all vault data', async () => {
      // Add some data
      await storage.createCredential({
        title: 'Test',
        username: 'user',
        password: 'pass',
      });
      await storage.createFolder('Test Folder');

      // Clear all
      await storage.clearAll();

      // Verify everything is cleared
      const credentials = await storage.getAllCredentials();
      const folders = await storage.getAllFolders();
      const metadata = await storage.getMetadata();

      expect(credentials).toHaveLength(0);
      expect(folders).toHaveLength(0);
      expect(metadata).toBeUndefined();
    });
  });

  describe('Encryption Verification', () => {
    it('should encrypt different credentials with different nonces', async () => {
      const cred1 = await storage.createCredential({
        title: 'Service 1',
        username: 'user1',
        password: 'pass1',
      });

      const cred2 = await storage.createCredential({
        title: 'Service 1',
        username: 'user1',
        password: 'pass1',
      });

      // Same plaintext should result in different ciphertexts due to different nonces
      expect(cred1.encryptedData.nonce).not.toBe(cred2.encryptedData.nonce);
      expect(cred1.encryptedData.ciphertext).not.toBe(cred2.encryptedData.ciphertext);
    });

    it('should fail to decrypt with wrong key', async () => {
      const cred = await storage.createCredential({
        title: 'Test',
        username: 'user',
        password: 'pass',
      });

      // Create storage with different key
      const { key: wrongKey } = await deriveKey('wrong-password');
      const wrongStorage = createVaultStorage(wrongKey);

      // Should throw error when trying to decrypt
      await expect(wrongStorage.getCredentialData(cred.id))
        .rejects.toThrow();
    });
  });
});
