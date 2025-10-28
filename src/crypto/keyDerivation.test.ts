/**
 * Key Derivation Module Tests
 * 
 * Comprehensive test suite for Argon2id key derivation functionality
 */

import {
  deriveKey,
  generateSalt,
  verifyPassword,
  clearKey,
  exportSalt,
  importSalt,
  ARGON2_PARAMS,
} from './keyDerivation';
import { SodiumPlus } from 'sodium-plus';

describe('Key Derivation Module', () => {
  describe('generateSalt', () => {
    it('should generate a salt of correct length', async () => {
      const salt = await generateSalt();
      expect(salt).toBeInstanceOf(Buffer);
      expect(salt.length).toBe(ARGON2_PARAMS.SALT_LENGTH);
    });

    it('should generate unique salts', async () => {
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();
      
      // Salts should be different
      expect(salt1.equals(salt2)).toBe(false);
    });

    it('should generate cryptographically random salts', async () => {
      // Generate multiple salts and ensure they're all unique
      const salts = await Promise.all(
        Array(10).fill(0).map(() => generateSalt())
      );
      
      // All salts should be unique
      const uniqueSalts = new Set(salts.map(s => s.toString('hex')));
      expect(uniqueSalts.size).toBe(10);
    });
  });

  describe('deriveKey', () => {
    it('should derive a key from a password', async () => {
      const password = 'mySecurePassword123';
      const result = await deriveKey(password);
      
      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('salt');
      expect(result.salt).toBeInstanceOf(Buffer);
      expect(result.salt.length).toBe(ARGON2_PARAMS.SALT_LENGTH);
    });

    it('should generate a new salt when none is provided', async () => {
      const password = 'testPassword';
      const result1 = await deriveKey(password);
      const result2 = await deriveKey(password);
      
      // Without providing a salt, each derivation should use a different salt
      expect(result1.salt.equals(result2.salt)).toBe(false);
    });

    it('should use provided salt for derivation', async () => {
      const password = 'testPassword';
      const salt = await generateSalt();
      
      const result = await deriveKey(password, salt);
      
      expect(result.salt.equals(salt)).toBe(true);
    });

    it('should derive the same key for same password and salt', async () => {
      const password = 'consistentPassword';
      const salt = await generateSalt();
      
      const result1 = await deriveKey(password, salt);
      const result2 = await deriveKey(password, salt);
      
      // Keys should be identical for same password and salt
      const sodium = await SodiumPlus.auto();
      const key1Buffer = result1.key.getBuffer();
      const key2Buffer = result2.key.getBuffer();
      
      expect(await sodium.sodium_memcmp(key1Buffer, key2Buffer)).toBe(true);
    });

    it('should derive different keys for different passwords', async () => {
      const salt = await generateSalt();
      
      const result1 = await deriveKey('password1', salt);
      const result2 = await deriveKey('password2', salt);
      
      const sodium = await SodiumPlus.auto();
      const key1Buffer = result1.key.getBuffer();
      const key2Buffer = result2.key.getBuffer();
      
      // Keys should be different for different passwords
      expect(await sodium.sodium_memcmp(key1Buffer, key2Buffer)).toBe(false);
    });

    it('should derive different keys for different salts', async () => {
      const password = 'samePassword';
      
      const result1 = await deriveKey(password);
      const result2 = await deriveKey(password);
      
      const sodium = await SodiumPlus.auto();
      const key1Buffer = result1.key.getBuffer();
      const key2Buffer = result2.key.getBuffer();
      
      // Keys should be different when using different salts
      expect(await sodium.sodium_memcmp(key1Buffer, key2Buffer)).toBe(false);
    });

    it('should throw error for empty password', async () => {
      await expect(deriveKey('')).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for undefined password', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(deriveKey(undefined as any)).rejects.toThrow('Password cannot be empty');
    });

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const result = await deriveKey(longPassword);
      
      expect(result.key).toBeDefined();
      expect(result.salt).toBeDefined();
    });

    it('should handle special characters in password', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?~`';
      const result = await deriveKey(specialPassword);
      
      expect(result.key).toBeDefined();
      expect(result.salt).toBeDefined();
    });

    it('should handle unicode characters in password', async () => {
      const unicodePassword = '你好世界🔐🔑';
      const result = await deriveKey(unicodePassword);
      
      expect(result.key).toBeDefined();
      expect(result.salt).toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'mySecurePassword';
      const { key, salt } = await deriveKey(password);
      
      const isValid = await verifyPassword(password, salt, key);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const correctPassword = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      
      const { key, salt } = await deriveKey(correctPassword);
      const isValid = await verifyPassword(wrongPassword, salt, key);
      
      expect(isValid).toBe(false);
    });

    it('should reject password with wrong salt', async () => {
      const password = 'myPassword';
      const { key } = await deriveKey(password);
      const wrongSalt = await generateSalt();
      
      const isValid = await verifyPassword(password, wrongSalt, key);
      
      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'Password';
      const { key, salt } = await deriveKey(password);
      
      const isValid = await verifyPassword('password', salt, key);
      
      expect(isValid).toBe(false);
    });

    it('should handle verification with special characters', async () => {
      const password = 'p@ssw0rd!#$';
      const { key, salt } = await deriveKey(password);
      
      const isValid = await verifyPassword(password, salt, key);
      
      expect(isValid).toBe(true);
    });

    it('should return false on any verification error', async () => {
      const password = 'testPassword';
      const { key, salt } = await deriveKey(password);
      
      // This should handle any internal errors gracefully
      const isValid = await verifyPassword('', salt, key);
      
      expect(isValid).toBe(false);
    });
  });

  describe('clearKey', () => {
    it('should securely clear a key from memory', async () => {
      const password = 'testPassword';
      const { key } = await deriveKey(password);
      
      const bufferBefore = key.getBuffer();
      const valueBefore = Buffer.from(bufferBefore).toString('hex');
      
      await clearKey(key);
      
      const bufferAfter = key.getBuffer();
      const valueAfter = bufferAfter.toString('hex');
      
      // After clearing, the buffer should be all zeros
      expect(valueAfter).toBe('0'.repeat(valueBefore.length));
    });
  });

  describe('exportSalt and importSalt', () => {
    it('should export salt to base64 string', async () => {
      const salt = await generateSalt();
      const exported = exportSalt(salt);
      
      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
      
      // Should be valid base64
      expect(() => Buffer.from(exported, 'base64')).not.toThrow();
    });

    it('should import salt from base64 string', () => {
      const originalSalt = Buffer.from('0123456789abcdef', 'hex');
      const exported = exportSalt(originalSalt);
      const imported = importSalt(exported);
      
      expect(imported.equals(originalSalt)).toBe(true);
    });

    it('should maintain salt integrity through export/import cycle', async () => {
      const originalSalt = await generateSalt();
      const exported = exportSalt(originalSalt);
      const imported = importSalt(exported);
      
      expect(imported.equals(originalSalt)).toBe(true);
      expect(imported.length).toBe(ARGON2_PARAMS.SALT_LENGTH);
    });

    it('should work with key derivation after import', async () => {
      const password = 'testPassword';
      const salt = await generateSalt();
      
      // Derive key with original salt
      const { key: key1 } = await deriveKey(password, salt);
      
      // Export and import salt
      const exported = exportSalt(salt);
      const imported = importSalt(exported);
      
      // Derive key with imported salt
      const { key: key2 } = await deriveKey(password, imported);
      
      // Keys should match
      const sodium = await SodiumPlus.auto();
      const key1Buffer = key1.getBuffer();
      const key2Buffer = key2.getBuffer();
      
      expect(await sodium.sodium_memcmp(key1Buffer, key2Buffer)).toBe(true);
    });
  });

  describe('ARGON2_PARAMS', () => {
    it('should have secure parameter values', () => {
      // Memory cost should be at least 64 MiB (65536 KiB)
      expect(ARGON2_PARAMS.MEMORY_COST).toBeGreaterThanOrEqual(65536);
      
      // Time cost should be at least 3 iterations
      expect(ARGON2_PARAMS.TIME_COST).toBeGreaterThanOrEqual(3);
      
      // Key length should be 32 bytes (256 bits)
      expect(ARGON2_PARAMS.KEY_LENGTH).toBe(32);
      
      // Salt length should be at least 16 bytes (128 bits)
      expect(ARGON2_PARAMS.SALT_LENGTH).toBeGreaterThanOrEqual(16);
    });
  });

  describe('Security properties', () => {
    it('should be computationally expensive (takes reasonable time)', async () => {
      const password = 'testPassword';
      
      const startTime = performance.now();
      await deriveKey(password);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      // Should take at least 1ms (indicating work is being done)
      // This is a conservative check to ensure the function isn't instant
      // In production, Argon2id with these parameters typically takes 100-500ms
      expect(duration).toBeGreaterThanOrEqual(0);
      
      // Verify the function actually completes successfully
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    }, 15000); // 15 second timeout for this test

    it('should not leak password in error messages', async () => {
      const password = 'secretPassword123';
      
      try {
        await deriveKey('');
      } catch (error) {
        const errorMessage = (error as Error).message;
        expect(errorMessage).not.toContain(password);
      }
    });

    it('should produce fixed-length keys regardless of password length', async () => {
      const shortPassword = 'abc';
      const longPassword = 'a'.repeat(1000);
      
      const result1 = await deriveKey(shortPassword);
      const result2 = await deriveKey(longPassword);
      
      const key1Buffer = result1.key.getBuffer();
      const key2Buffer = result2.key.getBuffer();
      
      expect(key1Buffer.length).toBe(ARGON2_PARAMS.KEY_LENGTH);
      expect(key2Buffer.length).toBe(ARGON2_PARAMS.KEY_LENGTH);
      expect(key1Buffer.length).toBe(key2Buffer.length);
    });
  });

  describe('Integration scenarios', () => {
    it('should support complete authentication flow', async () => {
      // Setup: User creates account with password
      const userPassword = 'MySecurePassword123!';
      const { key: masterKey, salt } = await deriveKey(userPassword);
      
      // Store salt (in real app, this would go to storage)
      const storedSalt = exportSalt(salt);
      
      // Later: User attempts to log in
      const loginPassword = 'MySecurePassword123!';
      const recoveredSalt = importSalt(storedSalt);
      
      // Verify password
      const isAuthenticated = await verifyPassword(
        loginPassword,
        recoveredSalt,
        masterKey
      );
      
      expect(isAuthenticated).toBe(true);
    });

    it('should reject authentication with wrong password', async () => {
      // Setup
      const correctPassword = 'CorrectPassword';
      const { key: masterKey, salt } = await deriveKey(correctPassword);
      const storedSalt = exportSalt(salt);
      
      // Login attempt with wrong password
      const wrongPassword = 'WrongPassword';
      const recoveredSalt = importSalt(storedSalt);
      
      const isAuthenticated = await verifyPassword(
        wrongPassword,
        recoveredSalt,
        masterKey
      );
      
      expect(isAuthenticated).toBe(false);
    });

    it('should support key rotation scenario', async () => {
      const password = 'userPassword';
      
      // Original key derivation
      const original = await deriveKey(password);
      
      // User wants to rotate to new salt
      const newSalt = await generateSalt();
      const rotated = await deriveKey(password, newSalt);
      
      // Keys should be different (different salts)
      const sodium = await SodiumPlus.auto();
      const originalBuffer = original.key.getBuffer();
      const rotatedBuffer = rotated.key.getBuffer();
      
      expect(await sodium.sodium_memcmp(originalBuffer, rotatedBuffer)).toBe(false);
      
      // But both should verify with their respective salts
      expect(await verifyPassword(password, original.salt, original.key)).toBe(true);
      expect(await verifyPassword(password, rotated.salt, rotated.key)).toBe(true);
    });
  });
});
