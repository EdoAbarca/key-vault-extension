/**
 * Crypto Module - Main Export
 * 
 * Centralized exports for cryptographic utilities
 */

export {
  deriveKey,
  generateSalt,
  verifyPassword,
  clearKey,
  exportSalt,
  importSalt,
  ARGON2_PARAMS,
  type KeyDerivationSalt,
  type DerivedKey,
} from './keyDerivation';

export {
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

export {
  generatePassword,
  calculatePasswordStrength,
  validateOptions,
  CHARACTER_SETS,
  PASSWORD_CONSTRAINTS,
  DEFAULT_OPTIONS,
  PasswordStrength,
  type PasswordGeneratorOptions,
  type PasswordStrengthResult,
} from './passwordGenerator';
