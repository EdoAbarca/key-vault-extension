/**
 * Database Module Tests
 * 
 * Tests for Dexie.js database configuration and basic operations.
 */

import { getDatabase, closeDatabase, deleteDatabase, VaultDatabase } from './database';
import { CURRENT_SCHEMA_VERSION } from './types';

describe('VaultDatabase', () => {
  let db: VaultDatabase;

  beforeEach(async () => {
    // Clean slate for each test
    await deleteDatabase();
    db = getDatabase();
  });

  afterEach(() => {
    closeDatabase();
  });

  afterAll(async () => {
    await deleteDatabase();
  });

  describe('Database Initialization', () => {
    it('should create a database instance', () => {
      expect(db).toBeInstanceOf(VaultDatabase);
      expect(db.name).toBe('KeyVaultDB');
    });

    it('should have correct tables defined', () => {
      expect(db.credentials).toBeDefined();
      expect(db.folders).toBeDefined();
      expect(db.metadata).toBeDefined();
    });

    it('should report not initialized by default', async () => {
      const initialized = await db.isInitialized();
      expect(initialized).toBe(false);
    });

    it('should initialize with salt', async () => {
      const salt = 'test-salt-base64';
      await db.initialize(salt);

      const initialized = await db.isInitialized();
      expect(initialized).toBe(true);

      const metadata = await db.getMetadata();
      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe('default');
      expect(metadata?.salt).toBe(salt);
      expect(metadata?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(metadata?.initialized).toBe(true);
      expect(metadata?.createdAt).toBeDefined();
      expect(metadata?.lastAccessedAt).toBeDefined();
    });
  });

  describe('Metadata Operations', () => {
    beforeEach(async () => {
      await db.initialize('test-salt');
    });

    it('should get metadata', async () => {
      const metadata = await db.getMetadata();
      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe('default');
    });

    it('should update last accessed timestamp', async () => {
      const before = await db.getMetadata();
      const beforeTime = before?.lastAccessedAt ?? 0;

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => { setTimeout(resolve, 10); });

      await db.updateLastAccessed();

      const after = await db.getMetadata();
      const afterTime = after?.lastAccessedAt ?? 0;

      expect(afterTime).toBeGreaterThan(beforeTime);
    });

    it('should return undefined for non-existent metadata', async () => {
      await db.clearAll();
      const metadata = await db.getMetadata();
      expect(metadata).toBeUndefined();
    });
  });

  describe('Data Operations', () => {
    beforeEach(async () => {
      await db.initialize('test-salt');
    });

    it('should add and retrieve credentials', async () => {
      const credential = {
        id: 'test-id-1',
        folderId: null,
        encryptedData: {
          ciphertext: 'encrypted',
          nonce: 'nonce',
          timestamp: Date.now(),
          version: 1,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: false,
      };

      await db.credentials.add(credential);

      const retrieved = await db.credentials.get('test-id-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-id-1');
      expect(retrieved?.deleted).toBe(false);
    });

    it('should add and retrieve folders', async () => {
      const folder = {
        id: 'folder-1',
        parentId: null,
        name: 'Test Folder',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: false,
      };

      await db.folders.add(folder);

      const retrieved = await db.folders.get('folder-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('folder-1');
      expect(retrieved?.name).toBe('Test Folder');
    });

    it('should query credentials by folder', async () => {
      const cred1 = {
        id: 'cred-1',
        folderId: 'folder-1',
        encryptedData: {
          ciphertext: 'encrypted1',
          nonce: 'nonce1',
          timestamp: Date.now(),
          version: 1,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: false,
      };

      const cred2 = {
        id: 'cred-2',
        folderId: 'folder-2',
        encryptedData: {
          ciphertext: 'encrypted2',
          nonce: 'nonce2',
          timestamp: Date.now(),
          version: 1,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: false,
      };

      await db.credentials.bulkAdd([cred1, cred2]);

      const folder1Creds = await db.credentials
        .where('folderId')
        .equals('folder-1')
        .toArray();

      expect(folder1Creds).toHaveLength(1);
      expect(folder1Creds[0].id).toBe('cred-1');
    });

    it('should clear all data', async () => {
      // Add some data
      await db.credentials.add({
        id: 'test-cred',
        folderId: null,
        encryptedData: {
          ciphertext: 'encrypted',
          nonce: 'nonce',
          timestamp: Date.now(),
          version: 1,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: false,
      });

      await db.folders.add({
        id: 'test-folder',
        parentId: null,
        name: 'Test',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: false,
      });

      // Clear all
      await db.clearAll();

      // Verify everything is cleared
      const credCount = await db.credentials.count();
      const folderCount = await db.folders.count();
      const metadataCount = await db.metadata.count();

      expect(credCount).toBe(0);
      expect(folderCount).toBe(0);
      expect(metadataCount).toBe(0);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same database instance', () => {
      const db1 = getDatabase();
      const db2 = getDatabase();
      expect(db1).toBe(db2);
    });

    it('should create a new instance after close', () => {
      const db1 = getDatabase();
      closeDatabase();
      const db2 = getDatabase();
      expect(db1).not.toBe(db2);
    });
  });

  describe('Database Deletion', () => {
    it('should delete the entire database', async () => {
      await db.initialize('test-salt');
      await db.credentials.add({
        id: 'test-cred',
        folderId: null,
        encryptedData: {
          ciphertext: 'encrypted',
          nonce: 'nonce',
          timestamp: Date.now(),
          version: 1,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deleted: false,
      });

      await deleteDatabase();

      // Get a new instance
      const newDb = getDatabase();
      const initialized = await newDb.isInitialized();
      expect(initialized).toBe(false);

      const count = await newDb.credentials.count();
      expect(count).toBe(0);
    });
  });
});
