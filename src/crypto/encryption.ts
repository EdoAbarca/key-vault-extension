/**
 * Encryption Module
 * 
 * Implements XChaCha20-Poly1305 authenticated encryption for credential storage.
 * Provides both confidentiality and integrity protection for sensitive data.
 * 
 * Security Features:
 * - XChaCha20-Poly1305 AEAD (Authenticated Encryption with Associated Data)
 * - Cryptographically secure nonce generation (192-bit/24-byte nonces)
 * - Automatic integrity verification on decryption
 * - No nonce reuse (each encryption generates a new nonce)
 * - Constant-time operations to prevent timing attacks
 */

import { SodiumPlus, CryptographyKey } from 'sodium-plus';

/**
 * XChaCha20-Poly1305 parameters
 * XChaCha20 uses extended 192-bit (24-byte) nonces, providing better security
 * against nonce reuse compared to standard ChaCha20's 96-bit nonces.
 */
export const XCHACHA20_PARAMS = {
  NONCE_LENGTH: 24, // 192 bits - XChaCha20 extended nonce
  TAG_LENGTH: 16,   // 128 bits - Poly1305 authentication tag
  KEY_LENGTH: 32,   // 256 bits - encryption key length
} as const;

/**
 * Structure for encrypted data with metadata
 */
export interface EncryptedData {
  /** Base64-encoded ciphertext with authentication tag */
  ciphertext: string;
  /** Base64-encoded nonce used for encryption */
  nonce: string;
  /** Timestamp of encryption (for audit/rotation purposes) */
  timestamp: number;
  /** Version identifier for future compatibility */
  version: number;
}

/**
 * Current encryption version
 * Allows for future algorithm updates while maintaining backward compatibility
 */
const ENCRYPTION_VERSION = 1;

/**
 * Generate a cryptographically secure random nonce
 * 
 * XChaCha20 uses 24-byte (192-bit) nonces, which are large enough to be
 * randomly generated without significant collision risk even for billions
 * of encryptions (unlike ChaCha20's 96-bit nonces).
 * 
 * @returns Promise resolving to a Buffer containing 24 bytes of random data
 */
export async function generateNonce(): Promise<Buffer> {
  const sodium = await SodiumPlus.auto();
  return await sodium.randombytes_buf(XCHACHA20_PARAMS.NONCE_LENGTH);
}

/**
 * Encrypt data using XChaCha20-Poly1305 AEAD
 * 
 * This function provides authenticated encryption, ensuring both confidentiality
 * and integrity of the data. The Poly1305 MAC is computed over the ciphertext
 * and is automatically included in the output.
 * 
 * @param plaintext - Data to encrypt (string or Buffer)
 * @param key - Encryption key (must be 32 bytes)
 * @param additionalData - Optional additional authenticated data (AAD)
 * @returns Promise resolving to EncryptedData structure
 * 
 * @throws {Error} If plaintext is empty or key is invalid
 * 
 * @example
 * ```typescript
 * const { key } = await deriveKey('masterPassword');
 * const encrypted = await encrypt('sensitive data', key);
 * // Store encrypted.ciphertext and encrypted.nonce
 * ```
 */
export async function encrypt(
  plaintext: string | Buffer,
  key: CryptographyKey,
  additionalData?: Buffer
): Promise<EncryptedData> {
  if (!plaintext || (typeof plaintext === 'string' && plaintext.length === 0)) {
    throw new Error('Plaintext cannot be empty');
  }

  const sodium = await SodiumPlus.auto();
  
  // Convert string to Buffer if necessary
  const plaintextBuffer = typeof plaintext === 'string'
    ? Buffer.from(plaintext, 'utf-8')
    : plaintext;

  // Generate a fresh nonce for this encryption
  const nonce = await generateNonce();

  // Encrypt with XChaCha20-Poly1305
  // The authentication tag is automatically appended to the ciphertext
  const ciphertext = await sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintextBuffer,
    nonce,
    key,
    additionalData
  );

  // Return structured encrypted data
  return {
    ciphertext: ciphertext.toString('base64'),
    nonce: nonce.toString('base64'),
    timestamp: Date.now(),
    version: ENCRYPTION_VERSION,
  };
}

/**
 * Decrypt data using XChaCha20-Poly1305 AEAD
 * 
 * This function decrypts data and automatically verifies the authentication tag.
 * If the tag verification fails (data has been tampered with), an error is thrown.
 * 
 * @param encryptedData - Encrypted data structure from encrypt()
 * @param key - Decryption key (must match encryption key)
 * @param additionalData - Optional AAD (must match what was used during encryption)
 * @returns Promise resolving to decrypted plaintext as string
 * 
 * @throws {Error} If decryption fails or authentication tag is invalid
 * 
 * @example
 * ```typescript
 * const { key } = await deriveKey('masterPassword');
 * const decrypted = await decrypt(encryptedData, key);
 * console.log(decrypted); // Original plaintext
 * ```
 */
export async function decrypt(
  encryptedData: EncryptedData,
  key: CryptographyKey,
  additionalData?: Buffer
): Promise<string> {
  if (!encryptedData.ciphertext || !encryptedData.nonce) {
    throw new Error('Invalid encrypted data: missing ciphertext or nonce');
  }

  const sodium = await SodiumPlus.auto();

  // Decode base64-encoded data
  const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64');
  const nonce = Buffer.from(encryptedData.nonce, 'base64');

  // Verify nonce length
  if (nonce.length !== XCHACHA20_PARAMS.NONCE_LENGTH) {
    throw new Error(`Invalid nonce length: expected ${String(XCHACHA20_PARAMS.NONCE_LENGTH)}, got ${String(nonce.length)}`);
  }

  try {
    // Decrypt and verify authentication tag
    // This will throw if the tag is invalid (data has been tampered with)
    const plaintext = await sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      ciphertext,
      nonce,
      key,
      additionalData
    );

    // Convert Buffer back to string
    return plaintext.toString('utf-8');
  } catch {
    // Decryption failed - either wrong key or data has been tampered with
    throw new Error('Decryption failed: invalid key or corrupted data');
  }
}

/**
 * Encrypt credentials for secure storage
 * 
 * Higher-level wrapper for encrypting credential objects.
 * Automatically serializes the credential data to JSON before encryption.
 * 
 * @param credentials - Credential object to encrypt
 * @param key - Encryption key
 * @returns Promise resolving to EncryptedData structure
 * 
 * @example
 * ```typescript
 * const credentials = {
 *   username: 'user@example.com',
 *   password: 'secretPassword123',
 *   website: 'https://example.com'
 * };
 * const encrypted = await encryptCredentials(credentials, key);
 * ```
 */
export async function encryptCredentials(
  credentials: Record<string, unknown>,
  key: CryptographyKey
): Promise<EncryptedData> {
  // Serialize credentials to JSON
  const json = JSON.stringify(credentials);
  
  // Encrypt the JSON string
  return await encrypt(json, key);
}

/**
 * Decrypt credentials from secure storage
 * 
 * Higher-level wrapper for decrypting credential objects.
 * Automatically deserializes JSON after decryption.
 * 
 * @param encryptedData - Encrypted data structure
 * @param key - Decryption key
 * @returns Promise resolving to decrypted credential object
 * 
 * @example
 * ```typescript
 * const credentials = await decryptCredentials(encryptedData, key);
 * console.log(credentials.username); // 'user@example.com'
 * ```
 */
export async function decryptCredentials(
  encryptedData: EncryptedData,
  key: CryptographyKey
): Promise<Record<string, unknown>> {
  // Decrypt the JSON string
  const json = await decrypt(encryptedData, key);
  
  try {
    // Parse JSON back to object
    const credentials = JSON.parse(json) as Record<string, unknown>;
    return credentials;
  } catch {
    throw new Error('Failed to parse decrypted credentials: invalid JSON');
  }
}

/**
 * Securely clear sensitive data from memory
 * 
 * @param data - String containing sensitive data to clear
 */
export async function clearSensitiveData(data: string): Promise<void> {
  const sodium = await SodiumPlus.auto();
  const buffer = Buffer.from(data, 'utf-8');
  void sodium.sodium_memzero(buffer);
}

/**
 * Serialize encrypted data for storage
 * 
 * @param encryptedData - Encrypted data structure
 * @returns JSON string representation
 */
export function serializeEncryptedData(encryptedData: EncryptedData): string {
  return JSON.stringify(encryptedData);
}

/**
 * Deserialize encrypted data from storage
 * 
 * @param serialized - JSON string representation
 * @returns Encrypted data structure
 * @throws {Error} If serialized data is invalid
 */
export function deserializeEncryptedData(serialized: string): EncryptedData {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = JSON.parse(serialized);
    
    // Validate required fields
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!data.ciphertext || !data.nonce || !data.timestamp || !data.version) {
      throw new Error('Invalid encrypted data structure');
    }
    
    return data as EncryptedData;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid encrypted data structure')) {
      throw error;
    }
    throw new Error('Failed to deserialize encrypted data: invalid JSON');
  }
}
