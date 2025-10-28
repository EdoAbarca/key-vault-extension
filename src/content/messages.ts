/**
 * Message Types Module
 * 
 * Defines message types and protocols for secure communication between
 * content scripts, background service worker, and popup.
 */

/**
 * Message types for extension communication
 */
export const MessageType = {
  // Content script -> Background
  REQUEST_CREDENTIALS: 'REQUEST_CREDENTIALS' as const,
  FORM_DETECTED: 'FORM_DETECTED' as const,
  
  // Background -> Content script
  CREDENTIALS_RESPONSE: 'CREDENTIALS_RESPONSE' as const,
  
  // Popup -> Background
  GET_CURRENT_TAB_URL: 'GET_CURRENT_TAB_URL' as const,
  
  // Background -> Popup
  CURRENT_TAB_URL_RESPONSE: 'CURRENT_TAB_URL_RESPONSE' as const,
};

export type MessageTypeValues = typeof MessageType[keyof typeof MessageType];

/**
 * Base message structure
 */
export interface BaseMessage {
  type: MessageTypeValues;
  timestamp: number;
}

/**
 * Request credentials for the current page
 */
export interface RequestCredentialsMessage extends BaseMessage {
  type: typeof MessageType.REQUEST_CREDENTIALS;
  url: string;
  domain: string;
}

/**
 * Form detection notification
 */
export interface FormDetectedMessage extends BaseMessage {
  type: typeof MessageType.FORM_DETECTED;
  url: string;
  domain: string;
  formCount: number;
}

/**
 * Credential data for autofill
 */
export interface CredentialForAutofill {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
}

/**
 * Response with matching credentials
 */
export interface CredentialsResponseMessage extends BaseMessage {
  type: typeof MessageType.CREDENTIALS_RESPONSE;
  credentials: CredentialForAutofill[];
  url: string;
}

/**
 * Union type for all messages
 */
export type Message = 
  | RequestCredentialsMessage
  | FormDetectedMessage
  | CredentialsResponseMessage;

/**
 * Create a message with timestamp
 */
export function createMessage<T extends Message>(
  message: Omit<T, 'timestamp'>
): T {
  return {
    ...message,
    timestamp: Date.now(),
  } as T;
}

/**
 * Validate message structure
 */
export function isValidMessage(message: unknown): message is Message {
  if (typeof message !== 'object' || message === null) {
    return false;
  }
  
  const msg = message as Record<string, unknown>;
  
  return (
    typeof msg.type === 'string' &&
    Object.values(MessageType).includes(msg.type as MessageTypeValues) &&
    typeof msg.timestamp === 'number'
  );
}
