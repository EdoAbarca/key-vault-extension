# Crypto Module

This module provides cryptographic utilities for secure password-based key derivation and key management.

## Key Derivation

The key derivation module implements **Argon2id** algorithm for transforming user passwords into cryptographic keys suitable for encryption operations.

### Features

- **Argon2id Algorithm**: Hybrid mode combining resistance against both side-channel and GPU attacks
- **OWASP-Compliant Parameters**: 64 MiB memory cost, 3 iterations
- **Secure Salt Generation**: Cryptographically secure random 16-byte salts
- **Constant-Time Verification**: Protection against timing attacks
- **Memory Management**: Secure key cleanup utilities

### Usage Examples

#### Deriving a Key from Password

```typescript
import { deriveKey, exportSalt } from './crypto';

// First time - generate new salt
const { key, salt } = await deriveKey('userMasterPassword');

// Store the salt (base64 encoded) for future use
const saltString = exportSalt(salt);
// Save saltString to storage (NEVER store the password!)
```

#### Verifying a Password

```typescript
import { deriveKey, verifyPassword, importSalt } from './crypto';

// Retrieve stored salt
const storedSalt = importSalt(saltString);

// During setup, derive and store the key
const { key, salt } = await deriveKey('userPassword', storedSalt);

// Later, verify password
const isValid = await verifyPassword('userPassword', storedSalt, key);
```

#### Secure Key Cleanup

```typescript
import { deriveKey, clearKey } from './crypto';

const { key } = await deriveKey('password');

// Use key for encryption/decryption...

// When done, securely clear from memory
await clearKey(key);
```

## Security Considerations

### Parameters (ARGON2_PARAMS)

- **Memory Cost**: 65536 KiB (64 MiB) - Makes brute-force attacks expensive
- **Time Cost**: 3 iterations - OWASP recommended minimum
- **Parallelism**: 1 thread - Ensures consistent behavior
- **Key Length**: 32 bytes (256 bits) - Strong cryptographic key
- **Salt Length**: 16 bytes (128 bits) - Sufficient randomness

### Best Practices

1. **Never Store Passwords**: Only store salts and derived keys
2. **Unique Salts**: Generate a new salt for each user/key derivation
3. **Secure Storage**: Store salts and keys in secure storage (IndexedDB with encryption)
4. **Memory Cleanup**: Always clear keys from memory when done using `clearKey()`
5. **Error Handling**: Don't expose password validation errors that could leak information

## Testing

Run the comprehensive test suite:

```bash
npm test -- keyDerivation.test.ts
```

Test coverage includes:
- Salt generation and uniqueness
- Key derivation correctness
- Password verification
- Error handling
- Security properties
- Integration scenarios

## References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Argon2 RFC 9106](https://www.rfc-editor.org/rfc/rfc9106.html)
- [sodium-plus Documentation](https://github.com/paragonie/sodium-plus)
