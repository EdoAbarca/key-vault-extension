/**
 * Key Derivation Module
 * 
 * Implements secure password-based key derivation using Argon2id algorithm.
 * Following OWASP guidelines for password-based key derivation.
 * 
 * Security Features:
 * - Argon2id algorithm (hybrid mode for resistance against side-channel and GPU attacks)
 * - Memory-hard function (64 MiB memory cost)
 * - Configurable time cost (3 iterations by default)
 * - Cryptographically secure salt generation
 * - No plain text password storage
 */

import { SodiumPlus, CryptographyKey } from 'sodium-plus';

/**
 * Argon2id parameters following OWASP recommendations
 * Memory cost: 64 MiB (65536 KiB) - Balance between security and usability
 * Time cost: 3 iterations - OWASP recommended minimum
 * Parallelism: 1 - Single thread for consistency
 */
export const ARGON2_PARAMS = {
  MEMORY_COST: 65536, // 64 MiB in KiB
  TIME_COST: 3, // iterations
  PARALLELISM: 1, // threads
  KEY_LENGTH: 32, // 256 bits
  SALT_LENGTH: 16, // 128 bits
} as const;

/**
 * Salt storage structure for key derivation
 */
export interface KeyDerivationSalt {
  salt: Buffer;
  timestamp: number;
}

/**
 * Result of key derivation operation
 */
export interface DerivedKey {
  key: CryptographyKey;
  salt: Buffer;
}

/**
 * Generate a cryptographically secure random salt
 * 
 * @returns Buffer containing 16 bytes of random data
 */
export async function generateSalt(): Promise<Buffer> {
  const sodium = await SodiumPlus.auto();
  return await sodium.randombytes_buf(ARGON2_PARAMS.SALT_LENGTH);
}

/**
 * Derive a cryptographic key from a master password using Argon2id
 * 
 * This function transforms a user's master password into a strong cryptographic key
 * suitable for encryption operations. The password is never stored in plain text.
 * 
 * @param password - Master password (will not be stored)
 * @param salt - Optional salt; if not provided, a new one will be generated
 * @returns Promise resolving to derived key and salt used
 * 
 * @example
 * ```typescript
 * // First time - generate new salt
 * const { key, salt } = await deriveKey('mySecurePassword');
 * // Store salt for future use, but NEVER store the password
 * 
 * // Subsequent times - use stored salt
 * const { key: derivedKey } = await deriveKey('mySecurePassword', salt);
 * ```
 */
export async function deriveKey(
  password: string,
  salt?: Buffer
): Promise<DerivedKey> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }

  const sodium = await SodiumPlus.auto();
  
  // Generate new salt if not provided
  const actualSalt = salt ?? await generateSalt();
  
  // Derive key using Argon2id
  // Argon2id is a hybrid mode that combines:
  // - Argon2i: Resistant to side-channel attacks
  // - Argon2d: Resistant to GPU cracking attacks
  const derivedKey = await sodium.crypto_pwhash(
    ARGON2_PARAMS.KEY_LENGTH,
    password,
    actualSalt,
    ARGON2_PARAMS.TIME_COST,
    ARGON2_PARAMS.MEMORY_COST,
    sodium.CRYPTO_PWHASH_ALG_ARGON2ID13
  );
  
  return {
    key: derivedKey,
    salt: actualSalt,
  };
}

/**
 * Verify that a password produces the expected derived key
 * 
 * This is useful for authentication - derive a key from the provided password
 * and compare it with a previously derived key.
 * 
 * @param password - Password to verify
 * @param salt - Salt used in original derivation
 * @param expectedKey - Expected derived key to compare against
 * @returns Promise resolving to true if keys match, false otherwise
 * 
 * @example
 * ```typescript
 * // During setup
 * const { key, salt } = await deriveKey('myPassword');
 * // Store key and salt securely
 * 
 * // During authentication
 * const isValid = await verifyPassword('myPassword', salt, key);
 * ```
 */
export async function verifyPassword(
  password: string,
  salt: Buffer,
  expectedKey: CryptographyKey
): Promise<boolean> {
  try {
    const { key: derivedKey } = await deriveKey(password, salt);
    const sodium = await SodiumPlus.auto();
    
    // Constant-time comparison to prevent timing attacks
    return await sodium.sodium_memcmp(
      derivedKey.getBuffer(),
      expectedKey.getBuffer()
    );
  } catch {
    // If derivation fails, password is invalid
    return false;
  }
}

/**
 * Securely clear a cryptographic key from memory
 * 
 * @param key - Key to clear
 */
export async function clearKey(key: CryptographyKey): Promise<void> {
  const sodium = await SodiumPlus.auto();
  const buffer = key.getBuffer();
  void sodium.sodium_memzero(buffer);
}

/**
 * Export salt for storage
 * 
 * @param salt - Salt buffer to export
 * @returns Base64-encoded salt string
 */
export function exportSalt(salt: Buffer): string {
  return salt.toString('base64');
}

/**
 * Import salt from storage
 * 
 * @param saltString - Base64-encoded salt string
 * @returns Salt buffer
 */
export function importSalt(saltString: string): Buffer {
  return Buffer.from(saltString, 'base64');
}
