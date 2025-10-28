/**
 * Message Types Tests
 */

import {
  MessageType,
  createMessage,
  isValidMessage,
  type RequestCredentialsMessage,
  type FormDetectedMessage,
  type CredentialsResponseMessage,
} from './messages';

describe('Message Types', () => {
  describe('createMessage', () => {
    it('should create a RequestCredentialsMessage with timestamp', () => {
      const message = createMessage<RequestCredentialsMessage>({
        type: MessageType.REQUEST_CREDENTIALS,
        url: 'https://example.com/login',
        domain: 'example.com',
      });

      expect(message.type).toBe(MessageType.REQUEST_CREDENTIALS);
      expect(message.url).toBe('https://example.com/login');
      expect(message.domain).toBe('example.com');
      expect(message.timestamp).toBeGreaterThan(0);
      expect(typeof message.timestamp).toBe('number');
    });

    it('should create a FormDetectedMessage with timestamp', () => {
      const message = createMessage<FormDetectedMessage>({
        type: MessageType.FORM_DETECTED,
        url: 'https://example.com',
        domain: 'example.com',
        formCount: 2,
      });

      expect(message.type).toBe(MessageType.FORM_DETECTED);
      expect(message.formCount).toBe(2);
      expect(message.timestamp).toBeGreaterThan(0);
    });

    it('should create a CredentialsResponseMessage with timestamp', () => {
      const credentials = [
        {
          id: '1',
          title: 'Example Account',
          username: 'user@example.com',
          password: 'password123',
          url: 'https://example.com',
        },
      ];

      const message = createMessage<CredentialsResponseMessage>({
        type: MessageType.CREDENTIALS_RESPONSE,
        credentials,
        url: 'https://example.com',
      });

      expect(message.type).toBe(MessageType.CREDENTIALS_RESPONSE);
      expect(message.credentials).toEqual(credentials);
      expect(message.timestamp).toBeGreaterThan(0);
    });
  });

  describe('isValidMessage', () => {
    it('should validate a valid RequestCredentialsMessage', () => {
      const message = createMessage<RequestCredentialsMessage>({
        type: MessageType.REQUEST_CREDENTIALS,
        url: 'https://example.com',
        domain: 'example.com',
      });

      expect(isValidMessage(message)).toBe(true);
    });

    it('should validate a valid FormDetectedMessage', () => {
      const message = createMessage<FormDetectedMessage>({
        type: MessageType.FORM_DETECTED,
        url: 'https://example.com',
        domain: 'example.com',
        formCount: 1,
      });

      expect(isValidMessage(message)).toBe(true);
    });

    it('should validate a valid CredentialsResponseMessage', () => {
      const message = createMessage<CredentialsResponseMessage>({
        type: MessageType.CREDENTIALS_RESPONSE,
        credentials: [],
        url: 'https://example.com',
      });

      expect(isValidMessage(message)).toBe(true);
    });

    it('should reject null', () => {
      expect(isValidMessage(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isValidMessage(undefined)).toBe(false);
    });

    it('should reject non-object types', () => {
      expect(isValidMessage('string')).toBe(false);
      expect(isValidMessage(123)).toBe(false);
      expect(isValidMessage(true)).toBe(false);
    });

    it('should reject message without type', () => {
      const message = {
        timestamp: Date.now(),
        url: 'https://example.com',
      };

      expect(isValidMessage(message)).toBe(false);
    });

    it('should reject message without timestamp', () => {
      const message = {
        type: MessageType.REQUEST_CREDENTIALS,
        url: 'https://example.com',
      };

      expect(isValidMessage(message)).toBe(false);
    });

    it('should reject message with invalid type', () => {
      const message = {
        type: 'INVALID_TYPE',
        timestamp: Date.now(),
      };

      expect(isValidMessage(message)).toBe(false);
    });

    it('should reject message with non-string type', () => {
      const message = {
        type: 123,
        timestamp: Date.now(),
      };

      expect(isValidMessage(message)).toBe(false);
    });

    it('should reject message with non-number timestamp', () => {
      const message = {
        type: MessageType.REQUEST_CREDENTIALS,
        timestamp: 'not a number',
      };

      expect(isValidMessage(message)).toBe(false);
    });
  });

  describe('MessageType constants', () => {
    it('should have correct values', () => {
      expect(MessageType.REQUEST_CREDENTIALS).toBe('REQUEST_CREDENTIALS');
      expect(MessageType.FORM_DETECTED).toBe('FORM_DETECTED');
      expect(MessageType.CREDENTIALS_RESPONSE).toBe('CREDENTIALS_RESPONSE');
    });
  });
});
