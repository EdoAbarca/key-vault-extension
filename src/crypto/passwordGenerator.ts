/**
 * Password Generator Module
 * 
 * Implements cryptographically secure password generation using sodium-plus
 * for true random number generation. Provides customizable password generation
 * with various character sets and complexity requirements.
 * 
 * Security Features:
 * - Uses sodium-plus for cryptographically secure randomness
 * - No predictable patterns in generated passwords
 * - Ensures minimum character set requirements are met
 * - Validates all inputs to prevent weak password generation
 */

import { SodiumPlus } from 'sodium-plus';

/**
 * Character sets for password generation
 */
export const CHARACTER_SETS = {
  UPPERCASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  LOWERCASE: 'abcdefghijklmnopqrstuvwxyz',
  NUMBERS: '0123456789',
  SYMBOLS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

/**
 * Password generation options
 */
export interface PasswordGeneratorOptions {
  /** Length of the password (8-128 characters) */
  length: number;
  /** Include uppercase letters */
  includeUppercase: boolean;
  /** Include lowercase letters */
  includeLowercase: boolean;
  /** Include numbers */
  includeNumbers: boolean;
  /** Include symbols */
  includeSymbols: boolean;
}

/**
 * Password strength levels
 */
export const PasswordStrength = {
  VERY_WEAK: 'very-weak',
  WEAK: 'weak',
  FAIR: 'fair',
  GOOD: 'good',
  STRONG: 'strong',
  VERY_STRONG: 'very-strong',
} as const;

export type PasswordStrength = typeof PasswordStrength[keyof typeof PasswordStrength];

/**
 * Password strength result
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
}

/**
 * Password generation constraints
 */
export const PASSWORD_CONSTRAINTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  MIN_CHARSET_SIZE: 2, // Minimum different character types required
} as const;

/**
 * Default password generator options
 */
export const DEFAULT_OPTIONS: PasswordGeneratorOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
};

/**
 * Validate password generation options
 * 
 * @param options - Password generation options to validate
 * @throws {Error} If options are invalid
 */
export function validateOptions(options: PasswordGeneratorOptions): void {
  // Validate length
  if (options.length < PASSWORD_CONSTRAINTS.MIN_LENGTH) {
    throw new Error(`Password length must be at least ${PASSWORD_CONSTRAINTS.MIN_LENGTH.toString()} characters`);
  }
  if (options.length > PASSWORD_CONSTRAINTS.MAX_LENGTH) {
    throw new Error(`Password length must not exceed ${PASSWORD_CONSTRAINTS.MAX_LENGTH.toString()} characters`);
  }

  // Validate at least one character set is selected
  const charsetCount = [
    options.includeUppercase,
    options.includeLowercase,
    options.includeNumbers,
    options.includeSymbols,
  ].filter(Boolean).length;

  if (charsetCount === 0) {
    throw new Error('At least one character set must be selected');
  }
}

/**
 * Build the character pool from selected options
 * 
 * @param options - Password generation options
 * @returns String containing all available characters
 */
function buildCharacterPool(options: PasswordGeneratorOptions): string {
  let pool = '';
  
  if (options.includeUppercase) {
    pool += CHARACTER_SETS.UPPERCASE;
  }
  if (options.includeLowercase) {
    pool += CHARACTER_SETS.LOWERCASE;
  }
  if (options.includeNumbers) {
    pool += CHARACTER_SETS.NUMBERS;
  }
  if (options.includeSymbols) {
    pool += CHARACTER_SETS.SYMBOLS;
  }
  
  return pool;
}

/**
 * Generate a cryptographically secure random integer in range [0, max)
 * 
 * Uses rejection sampling to ensure uniform distribution without modulo bias
 * 
 * @param max - Upper bound (exclusive)
 * @returns Promise resolving to random integer
 */
async function getSecureRandomInt(max: number): Promise<number> {
  const sodium = await SodiumPlus.auto();
  
  // Calculate the number of bytes needed to represent max
  const bytesNeeded = Math.ceil(Math.log2(max) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const rejectionThreshold = maxValue - (maxValue % max);
  
  // Use rejection sampling to avoid modulo bias
  let randomValue: number;
  do {
    const randomBytes = await sodium.randombytes_buf(bytesNeeded);
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = (randomValue << 8) | randomBytes[i];
    }
  } while (randomValue >= rejectionThreshold);
  
  return randomValue % max;
}

/**
 * Ensure the password contains at least one character from each required set
 * 
 * @param password - Generated password characters as array
 * @param options - Password generation options
 * @returns Promise resolving to password with required characters
 */
async function ensureCharacterRequirements(
  password: string[],
  options: PasswordGeneratorOptions
): Promise<string[]> {
  const requiredSets: { chars: string; included: boolean }[] = [];
  
  if (options.includeUppercase) {
    requiredSets.push({
      chars: CHARACTER_SETS.UPPERCASE,
      included: password.some(c => CHARACTER_SETS.UPPERCASE.includes(c)),
    });
  }
  if (options.includeLowercase) {
    requiredSets.push({
      chars: CHARACTER_SETS.LOWERCASE,
      included: password.some(c => CHARACTER_SETS.LOWERCASE.includes(c)),
    });
  }
  if (options.includeNumbers) {
    requiredSets.push({
      chars: CHARACTER_SETS.NUMBERS,
      included: password.some(c => CHARACTER_SETS.NUMBERS.includes(c)),
    });
  }
  if (options.includeSymbols) {
    requiredSets.push({
      chars: CHARACTER_SETS.SYMBOLS,
      included: password.some(c => CHARACTER_SETS.SYMBOLS.includes(c)),
    });
  }
  
  // Replace random positions with missing character types
  for (const set of requiredSets) {
    if (!set.included) {
      const position = await getSecureRandomInt(password.length);
      const charIndex = await getSecureRandomInt(set.chars.length);
      password[position] = set.chars[charIndex];
    }
  }
  
  return password;
}

/**
 * Generate a cryptographically secure random password
 * 
 * @param options - Password generation options
 * @returns Promise resolving to generated password
 * @throws {Error} If options are invalid
 * 
 * @example
 * ```typescript
 * const password = await generatePassword({
 *   length: 16,
 *   includeUppercase: true,
 *   includeLowercase: true,
 *   includeNumbers: true,
 *   includeSymbols: true,
 * });
 * console.log(password); // e.g., "K7#mP9$xL2@qR5!n"
 * ```
 */
export async function generatePassword(
  options: PasswordGeneratorOptions = DEFAULT_OPTIONS
): Promise<string> {
  // Validate options
  validateOptions(options);
  
  // Build character pool
  const charPool = buildCharacterPool(options);
  
  // Generate random password
  const passwordChars: string[] = [];
  const length = options.length;
  for (let i = 0; i < length; i++) {
    const index = await getSecureRandomInt(charPool.length);
    passwordChars.push(charPool[index]);
  }
  
  // Ensure all required character sets are represented
  const finalPassword = await ensureCharacterRequirements(passwordChars, options);
  
  return finalPassword.join('');
}

/**
 * Calculate password strength score
 * 
 * Evaluates password strength based on:
 * - Length
 * - Character set diversity
 * - Entropy
 * - Common patterns (if detectable)
 * 
 * @param password - Password to evaluate
 * @returns Password strength result with score and feedback
 * 
 * @example
 * ```typescript
 * const result = calculatePasswordStrength('K7#mP9$xL2@qR5!n');
 * console.log(result.strength); // 'very-strong'
 * console.log(result.score); // 95
 * ```
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;
  
  // Check length
  if (password.length < 8) {
    feedback.push('Password is too short (minimum 8 characters)');
  } else if (password.length < 12) {
    score += 20;
    feedback.push('Consider using a longer password');
  } else if (password.length < 16) {
    score += 30;
  } else if (password.length < 20) {
    score += 40;
  } else {
    score += 50;
  }
  
  // Check character set diversity
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  
  const charsetCount = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
  
  if (charsetCount === 1) {
    score += 5;
    feedback.push('Use multiple character types (uppercase, lowercase, numbers, symbols)');
  } else if (charsetCount === 2) {
    score += 15;
    feedback.push('Add more character types for better security');
  } else if (charsetCount === 3) {
    score += 25;
  } else if (charsetCount === 4) {
    score += 35;
  }
  
  // Calculate entropy bonus
  let charsetSize = 0;
  if (hasLowercase) charsetSize += 26;
  if (hasUppercase) charsetSize += 26;
  if (hasNumbers) charsetSize += 10;
  if (hasSymbols) charsetSize += 32;
  
  const entropy = password.length * Math.log2(charsetSize);
  if (entropy > 80) {
    score += 15;
  } else if (entropy > 60) {
    score += 10;
  } else if (entropy > 40) {
    score += 5;
  } else {
    feedback.push('Increase password complexity');
  }
  
  // Check for common patterns
  const hasRepeatingChars = /(.)\1{2,}/.test(password);
  const hasSequentialChars = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
  
  if (hasRepeatingChars) {
    score -= 10;
    feedback.push('Avoid repeating characters');
  }
  if (hasSequentialChars) {
    score -= 5;
    feedback.push('Avoid sequential patterns');
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Determine strength level
  let strength: PasswordStrength;
  if (score < 20) {
    strength = PasswordStrength.VERY_WEAK;
  } else if (score < 40) {
    strength = PasswordStrength.WEAK;
  } else if (score < 60) {
    strength = PasswordStrength.FAIR;
  } else if (score < 75) {
    strength = PasswordStrength.GOOD;
  } else if (score < 90) {
    strength = PasswordStrength.STRONG;
  } else {
    strength = PasswordStrength.VERY_STRONG;
  }
  
  // Add positive feedback for strong passwords
  if (score >= 90) {
    feedback.push('Excellent password strength!');
  } else if (score >= 75) {
    feedback.push('Strong password');
  }
  
  return {
    strength,
    score,
    feedback,
  };
}
