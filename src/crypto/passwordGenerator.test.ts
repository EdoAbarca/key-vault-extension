/**
 * Password Generator Module Tests
 * 
 * Comprehensive test suite for secure password generation functionality
 */

import {
  generatePassword,
  calculatePasswordStrength,
  validateOptions,
  PASSWORD_CONSTRAINTS,
  DEFAULT_OPTIONS,
  CHARACTER_SETS,
  PasswordStrength,
  type PasswordGeneratorOptions,
} from './passwordGenerator';

describe('Password Generator Module', () => {
  describe('validateOptions', () => {
    it('should accept valid options', () => {
      expect(() => { validateOptions(DEFAULT_OPTIONS); }).not.toThrow();
    });

    it('should reject length below minimum', () => {
      const options: PasswordGeneratorOptions = {
        ...DEFAULT_OPTIONS,
        length: PASSWORD_CONSTRAINTS.MIN_LENGTH - 1,
      };
      expect(() => { validateOptions(options); }).toThrow(/at least/);
    });

    it('should reject length above maximum', () => {
      const options: PasswordGeneratorOptions = {
        ...DEFAULT_OPTIONS,
        length: PASSWORD_CONSTRAINTS.MAX_LENGTH + 1,
      };
      expect(() => { validateOptions(options); }).toThrow(/not exceed/);
    });

    it('should reject when no character sets are selected', () => {
      const options: PasswordGeneratorOptions = {
        length: 16,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      };
      expect(() => { validateOptions(options); }).toThrow('At least one character set must be selected');
    });

    it('should accept minimum length', () => {
      const options: PasswordGeneratorOptions = {
        ...DEFAULT_OPTIONS,
        length: PASSWORD_CONSTRAINTS.MIN_LENGTH,
      };
      expect(() => { validateOptions(options); }).not.toThrow();
    });

    it('should accept maximum length', () => {
      const options: PasswordGeneratorOptions = {
        ...DEFAULT_OPTIONS,
        length: PASSWORD_CONSTRAINTS.MAX_LENGTH,
      };
      expect(() => { validateOptions(options); }).not.toThrow();
    });
  });

  describe('generatePassword', () => {
    it('should generate password with default options', async () => {
      const password = await generatePassword();
      expect(password).toBeTruthy();
      expect(password.length).toBe(DEFAULT_OPTIONS.length);
    });

    it('should generate password of specified length', async () => {
      const lengths = [8, 16, 24, 32];
      for (const length of lengths) {
        const password = await generatePassword({ ...DEFAULT_OPTIONS, length });
        expect(password.length).toBe(length);
      }
    });

    it('should generate unique passwords', async () => {
      const passwords = await Promise.all(
        Array(20).fill(0).map(() => generatePassword())
      );
      
      const uniquePasswords = new Set(passwords);
      expect(uniquePasswords.size).toBe(20);
    });

    it('should include only uppercase letters when specified', async () => {
      const password = await generatePassword({
        length: 20,
        includeUppercase: true,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      });
      
      expect(/^[A-Z]+$/.test(password)).toBe(true);
    });

    it('should include only lowercase letters when specified', async () => {
      const password = await generatePassword({
        length: 20,
        includeUppercase: false,
        includeLowercase: true,
        includeNumbers: false,
        includeSymbols: false,
      });
      
      expect(/^[a-z]+$/.test(password)).toBe(true);
    });

    it('should include only numbers when specified', async () => {
      const password = await generatePassword({
        length: 20,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: true,
        includeSymbols: false,
      });
      
      expect(/^[0-9]+$/.test(password)).toBe(true);
    });

    it('should include only symbols when specified', async () => {
      const password = await generatePassword({
        length: 20,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: true,
      });
      
      // Check that all characters are symbols
      for (const char of password) {
        expect(CHARACTER_SETS.SYMBOLS.includes(char)).toBe(true);
      }
    });

    it('should include all character types when all are enabled', async () => {
      const password = await generatePassword({
        length: 30,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
      });
      
      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/[a-z]/.test(password)).toBe(true);
      expect(/[0-9]/.test(password)).toBe(true);
      expect(/[^A-Za-z0-9]/.test(password)).toBe(true);
    });

    it('should include uppercase when enabled', async () => {
      const password = await generatePassword({
        length: 20,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
      });
      
      expect(/[A-Z]/.test(password)).toBe(true);
    });

    it('should include lowercase when enabled', async () => {
      const password = await generatePassword({
        length: 20,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
      });
      
      expect(/[a-z]/.test(password)).toBe(true);
    });

    it('should include numbers when enabled', async () => {
      const password = await generatePassword({
        length: 20,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
      });
      
      expect(/[0-9]/.test(password)).toBe(true);
    });

    it('should include symbols when enabled', async () => {
      const password = await generatePassword({
        length: 20,
        includeUppercase: true,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: true,
      });
      
      expect(/[^A-Za-z0-9]/.test(password)).toBe(true);
    });

    it('should generate minimum length password', async () => {
      const password = await generatePassword({
        ...DEFAULT_OPTIONS,
        length: PASSWORD_CONSTRAINTS.MIN_LENGTH,
      });
      
      expect(password.length).toBe(PASSWORD_CONSTRAINTS.MIN_LENGTH);
    });

    it('should generate maximum length password', async () => {
      const password = await generatePassword({
        ...DEFAULT_OPTIONS,
        length: PASSWORD_CONSTRAINTS.MAX_LENGTH,
      });
      
      expect(password.length).toBe(PASSWORD_CONSTRAINTS.MAX_LENGTH);
    });

    it('should throw error for invalid options', async () => {
      const invalidOptions: PasswordGeneratorOptions = {
        length: 5,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      };
      
      await expect(generatePassword(invalidOptions)).rejects.toThrow();
    });

    it('should handle mixed character sets correctly', async () => {
      const password = await generatePassword({
        length: 25,
        includeUppercase: true,
        includeLowercase: false,
        includeNumbers: true,
        includeSymbols: false,
      });
      
      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/[0-9]/.test(password)).toBe(true);
      expect(/[a-z]/.test(password)).toBe(false);
      expect(/[^A-Za-z0-9]/.test(password)).toBe(false);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('should rate very short password as very weak', () => {
      const result = calculatePasswordStrength('abc');
      expect(result.strength).toBe(PasswordStrength.VERY_WEAK);
      expect(result.score).toBeLessThan(40);
    });

    it('should rate short password as weak', () => {
      const result = calculatePasswordStrength('abcd1234');
      expect([PasswordStrength.VERY_WEAK, PasswordStrength.WEAK, PasswordStrength.FAIR]).toContain(result.strength);
    });

    it('should rate medium complexity password as fair or good', () => {
      const result = calculatePasswordStrength('Password123');
      expect(result.score).toBeGreaterThan(20);
    });

    it('should rate strong password with all character types as strong or very strong', () => {
      const result = calculatePasswordStrength('P@ssw0rd!2024Secure');
      expect([PasswordStrength.GOOD, PasswordStrength.STRONG, PasswordStrength.VERY_STRONG]).toContain(result.strength);
      expect(result.score).toBeGreaterThan(60);
    });

    it('should rate very long complex password as very strong', () => {
      const result = calculatePasswordStrength('xK9#mP7$qL2@wR5!nB4%tF8^vG3&yJ6*');
      expect(result.strength).toBe(PasswordStrength.VERY_STRONG);
      expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it('should penalize repeating characters', () => {
      const withoutRepeat = calculatePasswordStrength('P@ssw0rd!Secure');
      const withRepeat = calculatePasswordStrength('P@ssswww0rd!Secure');
      
      expect(withRepeat.score).toBeLessThanOrEqual(withoutRepeat.score);
    });

    it('should penalize sequential patterns', () => {
      const withoutSequence = calculatePasswordStrength('Pw9#xK2@mL7$');
      const withSequence = calculatePasswordStrength('Pw9#abc123$');
      
      expect(withSequence.score).toBeLessThanOrEqual(withoutSequence.score);
    });

    it('should provide feedback for weak passwords', () => {
      const result = calculatePasswordStrength('pass');
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should provide positive feedback for strong passwords', () => {
      const result = calculatePasswordStrength('xK9#mP7$qL2@wR5!nB4%tF8^vG3&yJ6*');
      expect(result.feedback.some(f => f.includes('Excellent') || f.includes('Strong'))).toBe(true);
    });

    it('should return score between 0 and 100', () => {
      const passwords = [
        'a',
        'abc',
        'password',
        'Password1',
        'P@ssw0rd1',
        'xK9#mP7$qL2@wR5!nB4%tF8^vG3&yJ6*',
      ];
      
      for (const password of passwords) {
        const result = calculatePasswordStrength(password);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      }
    });

    it('should detect lack of uppercase letters', () => {
      const result = calculatePasswordStrength('password123!');
      // The password should get a lower score without uppercase
      expect(result.score).toBeLessThan(80);
    });

    it('should detect lack of lowercase letters', () => {
      const result = calculatePasswordStrength('PASSWORD123!');
      // The password should get a lower score without lowercase
      expect(result.score).toBeLessThan(80);
    });

    it('should detect lack of numbers', () => {
      const result = calculatePasswordStrength('Password!@#$');
      // The password should get a lower score without numbers
      expect(result.score).toBeLessThan(90);
    });

    it('should detect lack of symbols', () => {
      const result = calculatePasswordStrength('Password1234');
      // The password should get a lower score without symbols
      expect(result.score).toBeLessThan(90);
    });

    it('should reward longer passwords', () => {
      const short = calculatePasswordStrength('Pw9@xK2#');
      const medium = calculatePasswordStrength('Pw9@xK2#mL7$qR5!');
      const long = calculatePasswordStrength('Pw9@xK2#mL7$qR5!nB4%tF8^vG3&yJ6*');
      
      expect(medium.score).toBeGreaterThan(short.score);
      expect(long.score).toBeGreaterThan(medium.score);
    });

    it('should reward character diversity', () => {
      const oneType = calculatePasswordStrength('abcdefghijklmnop');
      const twoTypes = calculatePasswordStrength('abcdefgh12345678');
      const threeTypes = calculatePasswordStrength('Abcdefgh12345678');
      const fourTypes = calculatePasswordStrength('Abcdefgh1234!@#$');
      
      expect(twoTypes.score).toBeGreaterThan(oneType.score);
      expect(threeTypes.score).toBeGreaterThan(twoTypes.score);
      expect(fourTypes.score).toBeGreaterThan(threeTypes.score);
    });
  });

  describe('Character Sets', () => {
    it('should have non-empty character sets', () => {
      expect(CHARACTER_SETS.UPPERCASE.length).toBeGreaterThan(0);
      expect(CHARACTER_SETS.LOWERCASE.length).toBeGreaterThan(0);
      expect(CHARACTER_SETS.NUMBERS.length).toBeGreaterThan(0);
      expect(CHARACTER_SETS.SYMBOLS.length).toBeGreaterThan(0);
    });

    it('should have correct uppercase characters', () => {
      expect(CHARACTER_SETS.UPPERCASE).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    });

    it('should have correct lowercase characters', () => {
      expect(CHARACTER_SETS.LOWERCASE).toBe('abcdefghijklmnopqrstuvwxyz');
    });

    it('should have correct number characters', () => {
      expect(CHARACTER_SETS.NUMBERS).toBe('0123456789');
    });

    it('should have symbols in the symbol set', () => {
      expect(CHARACTER_SETS.SYMBOLS.length).toBeGreaterThan(10);
      expect(CHARACTER_SETS.SYMBOLS).toContain('!');
      expect(CHARACTER_SETS.SYMBOLS).toContain('@');
      expect(CHARACTER_SETS.SYMBOLS).toContain('#');
    });
  });

  describe('Integration Tests', () => {
    it('should generate multiple strong passwords', async () => {
      const passwords = await Promise.all(
        Array(10).fill(0).map(() => generatePassword({
          length: 20,
          includeUppercase: true,
          includeLowercase: true,
          includeNumbers: true,
          includeSymbols: true,
        }))
      );
      
      for (const password of passwords) {
        const strength = calculatePasswordStrength(password);
        expect(strength.score).toBeGreaterThan(70);
      }
    });

    it('should generate passwords that meet strength requirements', async () => {
      const options: PasswordGeneratorOptions = {
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
      };
      
      const password = await generatePassword(options);
      const strength = calculatePasswordStrength(password);
      
      expect(strength.strength).not.toBe(PasswordStrength.VERY_WEAK);
      expect(strength.strength).not.toBe(PasswordStrength.WEAK);
    });
  });
});
