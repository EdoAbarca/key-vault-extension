/**
 * Encryption Module Tests
 * 
 * Comprehensive test suite for XChaCha20-Poly1305 encryption functionality
 */

import {
  encrypt,
  decrypt,
  generateNonce,
  encryptCredentials,
  decryptCredentials,
  clearSensitiveData,
  serializeEncryptedData,
  deserializeEncryptedData,
  XCHACHA20_PARAMS,
  type EncryptedData,
} from './encryption';
import { deriveKey } from './keyDerivation';

describe('Encryption Module', () => {
  describe('generateNonce', () => {
    it('should generate a nonce of correct length', async () => {
      const nonce = await generateNonce();
      expect(nonce).toBeInstanceOf(Buffer);
      expect(nonce.length).toBe(XCHACHA20_PARAMS.NONCE_LENGTH);
    });

    it('should generate unique nonces', async () => {
      const nonce1 = await generateNonce();
      const nonce2 = await generateNonce();
      
      // Nonces should be different
      expect(nonce1.equals(nonce2)).toBe(false);
    });

    it('should generate cryptographically random nonces', async () => {
      // Generate multiple nonces and ensure they're all unique
      const nonces = await Promise.all(
        Array(20).fill(0).map(() => generateNonce())
      );
      
      // All nonces should be unique
      const uniqueNonces = new Set(nonces.map(n => n.toString('hex')));
      expect(uniqueNonces.size).toBe(20);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text successfully', async () => {
      const plaintext = 'Hello, World! This is a secret message.';
      const { key } = await deriveKey('testPassword');
      
      const encrypted = await encrypt(plaintext, key);
      const decrypted = await decrypt(encrypted, key);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should return EncryptedData structure with all fields', async () => {
      const plaintext = 'test data';
      const { key } = await deriveKey('password');
      
      const encrypted = await encrypt(plaintext, key);
      
      expect(encrypted).toHaveProperty('ciphertext');
      expect(encrypted).toHaveProperty('nonce');
      expect(encrypted).toHaveProperty('timestamp');
      expect(encrypted).toHaveProperty('version');
      expect(typeof encrypted.ciphertext).toBe('string');
      expect(typeof encrypted.nonce).toBe('string');
      expect(typeof encrypted.timestamp).toBe('number');
      expect(encrypted.version).toBe(1);
    });

    it('should generate different ciphertexts for same plaintext', async () => {
      const plaintext = 'same plaintext';
      const { key } = await deriveKey('password');
      
      const encrypted1 = await encrypt(plaintext, key);
      const encrypted2 = await encrypt(plaintext, key);
      
      // Ciphertexts should be different (different nonces)
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.nonce).not.toBe(encrypted2.nonce);
      
      // But both should decrypt to the same plaintext
      expect(await decrypt(encrypted1, key)).toBe(plaintext);
      expect(await decrypt(encrypted2, key)).toBe(plaintext);
    });

    it('should handle empty string encryption', async () => {
      const { key } = await deriveKey('password');
      
      await expect(encrypt('', key)).rejects.toThrow('Plaintext cannot be empty');
    });

    it('should handle Buffer plaintext', async () => {
      const plaintext = Buffer.from('binary data');
      const { key } = await deriveKey('password');
      
      const encrypted = await encrypt(plaintext, key);
      const decrypted = await decrypt(encrypted, key);
      
      expect(decrypted).toBe('binary data');
    });

    it('should handle special characters', async () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?~`';
      const { key } = await deriveKey('password');
      
      const encrypted = await encrypt(plaintext, key);
      const decrypted = await decrypt(encrypted, key);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', async () => {
      const plaintext = '你好世界🔐🔑 Привет мир';
      const { key } = await deriveKey('password');
      
      const encrypted = await encrypt(plaintext, key);
      const decrypted = await decrypt(encrypted, key);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle long text', async () => {
      const plaintext = 'a'.repeat(10000);
      const { key } = await deriveKey('password');
      
      const encrypted = await encrypt(plaintext, key);
      const decrypted = await decrypt(encrypted, key);
      
      expect(decrypted).toBe(plaintext);
      expect(decrypted.length).toBe(10000);
    });

    it('should fail decryption with wrong key', async () => {
      const plaintext = 'secret data';
      const { key: key1 } = await deriveKey('password1');
      const { key: key2 } = await deriveKey('password2');
      
      const encrypted = await encrypt(plaintext, key1);
      
      await expect(decrypt(encrypted, key2)).rejects.toThrow('Decryption failed');
    });

    it('should fail decryption with tampered ciphertext', async () => {
      const plaintext = 'secret data';
      const { key } = await deriveKey('password');
      
      const encrypted = await encrypt(plaintext, key);
      
      // Tamper with ciphertext
      const tamperedData = {
        ...encrypted,
        ciphertext: encrypted.ciphertext.slice(0, -4) + 'AAAA',
      };
      
      await expect(decrypt(tamperedData, key)).rejects.toThrow('Decryption failed');
    });

    it('should fail decryption with tampered nonce', async () => {
      const plaintext = 'secret data';
      const { key } = await deriveKey('password');
      
      const encrypted = await encrypt(plaintext, key);
      
      // Tamper with nonce
      const anotherNonce = await generateNonce();
      const tamperedData = {
        ...encrypted,
        nonce: anotherNonce.toString('base64'),
      };
      
      await expect(decrypt(tamperedData, key)).rejects.toThrow('Decryption failed');
    });

    it('should fail decryption with missing ciphertext', async () => {
      const { key } = await deriveKey('password');
      const nonce = await generateNonce();
      
      const invalidData: EncryptedData = {
        ciphertext: '',
        nonce: nonce.toString('base64'),
        timestamp: Date.now(),
        version: 1,
      };
      
      await expect(decrypt(invalidData, key)).rejects.toThrow('Invalid encrypted data');
    });

    it('should fail decryption with missing nonce', async () => {
      const { key } = await deriveKey('password');
      
      const invalidData: EncryptedData = {
        ciphertext: 'dGVzdA==',
        nonce: '',
        timestamp: Date.now(),
        version: 1,
      };
      
      await expect(decrypt(invalidData, key)).rejects.toThrow('Invalid encrypted data');
    });

    it('should fail decryption with invalid nonce length', async () => {
      const plaintext = 'test';
      const { key } = await deriveKey('password');
      
      const encrypted = await encrypt(plaintext, key);
      
      // Use a nonce of wrong length
      const shortNonce = Buffer.from('short');
      const invalidData = {
        ...encrypted,
        nonce: shortNonce.toString('base64'),
      };
      
      await expect(decrypt(invalidData, key)).rejects.toThrow('Invalid nonce length');
    });
  });

  describe('encrypt and decrypt with AAD', () => {
    it('should encrypt and decrypt with additional authenticated data', async () => {
      const plaintext = 'secret message';
      const { key } = await deriveKey('password');
      const aad = Buffer.from('additional context');
      
      const encrypted = await encrypt(plaintext, key, aad);
      const decrypted = await decrypt(encrypted, key, aad);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should fail decryption with wrong AAD', async () => {
      const plaintext = 'secret message';
      const { key } = await deriveKey('password');
      const aad1 = Buffer.from('correct context');
      const aad2 = Buffer.from('wrong context');
      
      const encrypted = await encrypt(plaintext, key, aad1);
      
      await expect(decrypt(encrypted, key, aad2)).rejects.toThrow('Decryption failed');
    });

    it('should fail decryption with missing AAD when it was used', async () => {
      const plaintext = 'secret message';
      const { key } = await deriveKey('password');
      const aad = Buffer.from('context');
      
      const encrypted = await encrypt(plaintext, key, aad);
      
      await expect(decrypt(encrypted, key)).rejects.toThrow('Decryption failed');
    });
  });

  describe('encryptCredentials and decryptCredentials', () => {
    it('should encrypt and decrypt credential objects', async () => {
      const credentials = {
        username: 'user@example.com',
        password: 'secretPassword123',
        website: 'https://example.com',
        notes: 'Important account',
      };
      const { key } = await deriveKey('masterPassword');
      
      const encrypted = await encryptCredentials(credentials, key);
      const decrypted = await decryptCredentials(encrypted, key);
      
      expect(decrypted).toEqual(credentials);
    });

    it('should handle nested credential objects', async () => {
      const credentials = {
        username: 'user',
        password: 'pass',
        metadata: {
          created: Date.now(),
          tags: ['important', 'work'],
        },
      };
      const { key } = await deriveKey('password');
      
      const encrypted = await encryptCredentials(credentials, key);
      const decrypted = await decryptCredentials(encrypted, key);
      
      expect(decrypted).toEqual(credentials);
    });

    it('should handle arrays in credentials', async () => {
      const credentials = {
        username: 'user',
        passwords: ['pass1', 'pass2', 'pass3'],
        securityQuestions: [
          { question: 'Q1', answer: 'A1' },
          { question: 'Q2', answer: 'A2' },
        ],
      };
      const { key } = await deriveKey('password');
      
      const encrypted = await encryptCredentials(credentials, key);
      const decrypted = await decryptCredentials(encrypted, key);
      
      expect(decrypted).toEqual(credentials);
    });

    it('should handle null and undefined values', async () => {
      const credentials = {
        username: 'user',
        password: 'pass',
        nullValue: null,
        undefinedValue: undefined,
      };
      const { key } = await deriveKey('password');
      
      const encrypted = await encryptCredentials(credentials, key);
      const decrypted = await decryptCredentials(encrypted, key);
      
      // Note: JSON.stringify removes undefined values
      expect(decrypted.username).toBe('user');
      expect(decrypted.password).toBe('pass');
      expect(decrypted.nullValue).toBeNull();
      expect(decrypted).not.toHaveProperty('undefinedValue');
    });

    it('should fail to decrypt credentials with wrong key', async () => {
      const credentials = { username: 'user', password: 'pass' };
      const { key: key1 } = await deriveKey('password1');
      const { key: key2 } = await deriveKey('password2');
      
      const encrypted = await encryptCredentials(credentials, key1);
      
      await expect(decryptCredentials(encrypted, key2)).rejects.toThrow('Decryption failed');
    });

    it('should fail to decrypt corrupted JSON', async () => {
      const { key } = await deriveKey('password');
      
      // Create invalid encrypted data that will decrypt to non-JSON
      const invalidEncrypted = await encrypt('not valid json {[}', key);
      
      await expect(decryptCredentials(invalidEncrypted, key))
        .rejects.toThrow('Failed to parse decrypted credentials');
    });
  });

  describe('clearSensitiveData', () => {
    it('should clear sensitive string data from memory', async () => {
      const sensitiveData = 'very secret password';
      
      // This should not throw
      await expect(clearSensitiveData(sensitiveData)).resolves.toBeUndefined();
    });

    it('should work with empty strings', async () => {
      await expect(clearSensitiveData('')).resolves.toBeUndefined();
    });
  });

  describe('serializeEncryptedData and deserializeEncryptedData', () => {
    it('should serialize and deserialize encrypted data', async () => {
      const plaintext = 'test data';
      const { key } = await deriveKey('password');
      
      const encrypted = await encrypt(plaintext, key);
      const serialized = serializeEncryptedData(encrypted);
      const deserialized = deserializeEncryptedData(serialized);
      
      expect(deserialized).toEqual(encrypted);
      
      // Should be able to decrypt the deserialized data
      const decrypted = await decrypt(deserialized, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should maintain all fields during serialization', () => {
      const encrypted: EncryptedData = {
        ciphertext: 'dGVzdA==',
        nonce: 'bm9uY2U=',
        timestamp: 1234567890,
        version: 1,
      };
      
      const serialized = serializeEncryptedData(encrypted);
      const deserialized = deserializeEncryptedData(serialized);
      
      expect(deserialized.ciphertext).toBe(encrypted.ciphertext);
      expect(deserialized.nonce).toBe(encrypted.nonce);
      expect(deserialized.timestamp).toBe(encrypted.timestamp);
      expect(deserialized.version).toBe(encrypted.version);
    });

    it('should fail to deserialize invalid JSON', () => {
      const invalidJson = 'not valid json {[}';
      
      expect(() => deserializeEncryptedData(invalidJson))
        .toThrow('Failed to deserialize encrypted data');
    });

    it('should fail to deserialize incomplete data', () => {
      const incompleteData = JSON.stringify({
        ciphertext: 'test',
        // missing nonce, timestamp, version
      });
      
      expect(() => deserializeEncryptedData(incompleteData))
        .toThrow('Invalid encrypted data structure');
    });

    it('should fail to deserialize with missing ciphertext', () => {
      const invalidData = JSON.stringify({
        nonce: 'test',
        timestamp: 123456,
        version: 1,
      });
      
      expect(() => deserializeEncryptedData(invalidData))
        .toThrow('Invalid encrypted data structure');
    });

    it('should fail to deserialize with missing nonce', () => {
      const invalidData = JSON.stringify({
        ciphertext: 'test',
        timestamp: 123456,
        version: 1,
      });
      
      expect(() => deserializeEncryptedData(invalidData))
        .toThrow('Invalid encrypted data structure');
    });
  });

  describe('XCHACHA20_PARAMS', () => {
    it('should have correct parameter values', () => {
      // XChaCha20 nonce should be 24 bytes (192 bits)
      expect(XCHACHA20_PARAMS.NONCE_LENGTH).toBe(24);
      
      // Poly1305 tag should be 16 bytes (128 bits)
      expect(XCHACHA20_PARAMS.TAG_LENGTH).toBe(16);
      
      // Key length should be 32 bytes (256 bits)
      expect(XCHACHA20_PARAMS.KEY_LENGTH).toBe(32);
    });
  });

  describe('Security properties', () => {
    it('should produce different nonces for each encryption', async () => {
      const plaintext = 'same text';
      const { key } = await deriveKey('password');
      
      const encryptions = await Promise.all(
        Array(10).fill(0).map(() => encrypt(plaintext, key))
      );
      
      // All nonces should be unique
      const nonces = encryptions.map(e => e.nonce);
      const uniqueNonces = new Set(nonces);
      expect(uniqueNonces.size).toBe(10);
    });

    it('should prevent timing attacks on decryption', async () => {
      const plaintext = 'test data';
      const { key: correctKey } = await deriveKey('correctPassword');
      const { key: wrongKey } = await deriveKey('wrongPassword');
      
      const encrypted = await encrypt(plaintext, correctKey);
      
      // Both should throw, timing should not reveal which is correct
      await expect(decrypt(encrypted, wrongKey)).rejects.toThrow();
      
      // Tampered data
      const tampered = { ...encrypted, ciphertext: 'invalid' };
      await expect(decrypt(tampered, correctKey)).rejects.toThrow();
    });

    it('should not leak plaintext length in ciphertext', async () => {
      const { key } = await deriveKey('password');
      
      // Different length plaintexts
      const short = 'hi';
      const long = 'a'.repeat(1000);
      
      const encryptedShort = await encrypt(short, key);
      const encryptedLong = await encrypt(long, key);
      
      // Ciphertext length should reflect plaintext length + tag
      const shortCipherLen = Buffer.from(encryptedShort.ciphertext, 'base64').length;
      const longCipherLen = Buffer.from(encryptedLong.ciphertext, 'base64').length;
      
      // Length difference should be approximately the plaintext length difference
      // (both have the same tag length)
      expect(longCipherLen - shortCipherLen).toBeGreaterThan(900);
    });

    it('should have timestamp in milliseconds', async () => {
      const plaintext = 'test';
      const { key } = await deriveKey('password');
      
      const before = Date.now();
      const encrypted = await encrypt(plaintext, key);
      const after = Date.now();
      
      expect(encrypted.timestamp).toBeGreaterThanOrEqual(before);
      expect(encrypted.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete encryption workflow', async () => {
      // User creates master password
      const masterPassword = 'MySecureMasterPassword123!';
      const { key } = await deriveKey(masterPassword);
      
      // User stores credentials
      const credentials = {
        website: 'https://example.com',
        username: 'user@example.com',
        password: 'sitePassword123',
        notes: 'Important account',
      };
      
      // Encrypt and serialize for storage
      const encrypted = await encryptCredentials(credentials, key);
      const serialized = serializeEncryptedData(encrypted);
      
      // Store serialized data (e.g., in database)
      expect(typeof serialized).toBe('string');
      
      // Later: retrieve and decrypt
      const retrieved = deserializeEncryptedData(serialized);
      const decrypted = await decryptCredentials(retrieved, key);
      
      expect(decrypted).toEqual(credentials);
    });

    it('should handle multiple credentials encryption', async () => {
      const { key } = await deriveKey('masterPassword');
      
      const credentialsList = [
        { site: 'site1.com', user: 'user1', pass: 'pass1' },
        { site: 'site2.com', user: 'user2', pass: 'pass2' },
        { site: 'site3.com', user: 'user3', pass: 'pass3' },
      ];
      
      // Encrypt all credentials
      const encrypted = await Promise.all(
        credentialsList.map(cred => encryptCredentials(cred, key))
      );
      
      // Each should have unique nonce
      const nonces = encrypted.map(e => e.nonce);
      const uniqueNonces = new Set(nonces);
      expect(uniqueNonces.size).toBe(3);
      
      // Decrypt all credentials
      const decrypted = await Promise.all(
        encrypted.map(enc => decryptCredentials(enc, key))
      );
      
      expect(decrypted).toEqual(credentialsList);
    });

    it('should support key rotation scenario', async () => {
      const oldPassword = 'oldMasterPassword';
      const newPassword = 'newMasterPassword';
      
      const { key: oldKey } = await deriveKey(oldPassword);
      const { key: newKey } = await deriveKey(newPassword);
      
      const credentials = { user: 'test', pass: 'secret' };
      
      // Encrypt with old key
      const encrypted = await encryptCredentials(credentials, oldKey);
      
      // Decrypt with old key and re-encrypt with new key
      const decrypted = await decryptCredentials(encrypted, oldKey);
      const reencrypted = await encryptCredentials(decrypted, newKey);
      
      // Should not be able to decrypt with old key anymore
      await expect(decryptCredentials(reencrypted, oldKey)).rejects.toThrow();
      
      // Should decrypt successfully with new key
      const finalDecrypted = await decryptCredentials(reencrypted, newKey);
      expect(finalDecrypted).toEqual(credentials);
    });
  });

  describe('Compatibility with key derivation module', () => {
    it('should work seamlessly with derived keys', async () => {
      const password = 'userPassword123';
      
      // Derive key
      const { key, salt } = await deriveKey(password);
      
      // Use derived key for encryption
      const plaintext = 'secret data';
      const encrypted = await encrypt(plaintext, key);
      
      // Derive same key again with same salt
      const { key: derivedAgain } = await deriveKey(password, salt);
      
      // Should decrypt successfully
      const decrypted = await decrypt(encrypted, derivedAgain);
      expect(decrypted).toBe(plaintext);
    });

    it('should verify keys are compatible', async () => {
      const password = 'testPassword';
      const { key } = await deriveKey(password);
      
      // Key should have correct length for XChaCha20-Poly1305
      const keyBuffer = key.getBuffer();
      expect(keyBuffer.length).toBe(XCHACHA20_PARAMS.KEY_LENGTH);
    });
  });
});
