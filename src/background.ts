// Background service worker for Chrome Extension
/// <reference types="chrome"/>

import {
  MessageType,
  createMessage,
  isValidMessage,
  type RequestCredentialsMessage,
  type CredentialsResponseMessage,
  type FormDetectedMessage,
  type CredentialForAutofill,
} from './content/messages';

console.log('Key Vault Extension - Background service worker initialized');

// Session state in background
interface SessionState {
  isUnlocked: boolean;
  lastActivity: number;
  lockTimeoutMinutes: number;
}

interface SessionSettings {
  lockTimeoutMinutes: number;
}

const sessionState: SessionState = {
  isUnlocked: false,
  lastActivity: Date.now(),
  lockTimeoutMinutes: 15,
};

// Auto-lock timer
let autoLockTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Initialize session settings from storage
 */
async function initializeSessionSettings(): Promise<void> {
  try {
    const result = await chrome.storage.local.get('sessionSettings');
    if (result.sessionSettings) {
      const settings = result.sessionSettings as SessionSettings;
      if (typeof settings.lockTimeoutMinutes === 'number') {
        sessionState.lockTimeoutMinutes = settings.lockTimeoutMinutes;
      }
    }
  } catch (error) {
    console.error('[Background] Failed to load session settings:', error);
  }
}

/**
 * Start auto-lock timer
 */
function startAutoLockTimer(): void {
  if (autoLockTimer) {
    clearInterval(autoLockTimer);
  }

  // Check every 10 seconds for inactivity
  autoLockTimer = setInterval(() => {
    if (sessionState.isUnlocked) {
      const now = Date.now();
      const inactiveTime = now - sessionState.lastActivity;
      const timeoutMs = sessionState.lockTimeoutMinutes * 60 * 1000;

      if (inactiveTime >= timeoutMs) {
        console.log('[Background] Auto-locking vault due to inactivity');
        sessionState.isUnlocked = false;
        // Broadcast lock event to all extension contexts
        void chrome.runtime.sendMessage({
          type: 'vault-locked',
          reason: 'auto-lock',
        }).catch(() => {
          // Ignore errors if no listeners
        });
      }
    }
  }, 10000);
}

/**
 * Stop auto-lock timer
 */
function stopAutoLockTimer(): void {
  if (autoLockTimer) {
    clearInterval(autoLockTimer);
    autoLockTimer = null;
  }
}

/**
 * Update session activity
 */
function updateSessionActivity(): void {
  sessionState.lastActivity = Date.now();
}

// Initialize session settings
void initializeSessionSettings();

// Listen for installation
chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
  console.log('Extension installed:', details);
});

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Check if a credential URL matches the requested domain
 */
function matchesDomain(credentialUrl: string | undefined, requestDomain: string): boolean {
  if (!credentialUrl) return false;
  
  try {
    const credDomain = extractDomain(credentialUrl);
    
    // Exact match
    if (credDomain === requestDomain) return true;
    
    // Subdomain match (e.g., login.example.com matches example.com)
    if (credDomain.endsWith('.' + requestDomain)) return true;
    if (requestDomain.endsWith('.' + credDomain)) return true;
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Get credentials for a specific domain from storage
 * Note: This is a placeholder that returns empty array
 * In production, this would decrypt and return matching credentials
 */
function getCredentialsForDomain(domain: string): Promise<CredentialForAutofill[]> {
  try {
    // Get vault key from session storage (if unlocked)
    // This is a simplified version - in production, you'd check if vault is unlocked
    // and decrypt credentials from IndexedDB
    
    // For now, return empty array since vault integration requires unlocking
    // The actual implementation would:
    // 1. Check if vault is unlocked (key in memory)
    // 2. Query IndexedDB for all credentials
    // 3. Decrypt each credential
    // 4. Filter by domain match
    // 5. Return matching credentials
    
    console.log(`[Background] Getting credentials for domain: ${domain}`);
    
    // Placeholder: In production, this would query and decrypt from storage
    return Promise.resolve([]);
  } catch (error: unknown) {
    console.error('[Background] Error getting credentials:', error);
    return Promise.resolve([]);
  }
}

/**
 * Handle credential request from content script
 */
async function handleCredentialRequest(
  message: RequestCredentialsMessage
): Promise<CredentialsResponseMessage> {
  const { domain, url } = message;
  
  console.log(`[Background] Credential request for: ${domain}`);
  
  // Get matching credentials
  const allCredentials = await getCredentialsForDomain(domain);
  
  // Filter credentials that match the domain
  const matchingCredentials = allCredentials.filter(cred => 
    matchesDomain(cred.url, domain)
  );
  
  console.log(`[Background] Found ${String(matchingCredentials.length)} matching credentials`);
  
  return createMessage<CredentialsResponseMessage>({
    type: MessageType.CREDENTIALS_RESPONSE,
    credentials: matchingCredentials,
    url,
  });
}

/**
 * Handle form detection notification
 */
function handleFormDetection(message: FormDetectedMessage): void {
  const { domain, formCount } = message;
  console.log(`[Background] Form detected on ${domain}: ${String(formCount)} form(s)`);
  
  // Could be used to update extension icon badge
  // chrome.action.setBadgeText({ text: formCount.toString() });
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((
  message: unknown,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) => {
  console.log('[Background] Message received:', message);
  
  // Handle session-related messages (non-validated format)
  if (typeof message === 'object' && message !== null && 'type' in message) {
    const msg = message as { type: string };
    
    switch (msg.type) {
      case 'vault-unlock':
        console.log('[Background] Vault unlocked');
        sessionState.isUnlocked = true;
        sessionState.lastActivity = Date.now();
        startAutoLockTimer();
        sendResponse({ success: true });
        return false;
        
      case 'vault-lock':
        console.log('[Background] Vault locked');
        sessionState.isUnlocked = false;
        stopAutoLockTimer();
        sendResponse({ success: true });
        return false;
        
      case 'session-activity':
        updateSessionActivity();
        sendResponse({ success: true });
        return false;
        
      case 'get-session-state':
        sendResponse({ 
          isUnlocked: sessionState.isUnlocked,
          lastActivity: sessionState.lastActivity,
          lockTimeoutMinutes: sessionState.lockTimeoutMinutes,
        });
        return false;
    }
  }
  
  // Validate message for credential-related operations
  if (!isValidMessage(message)) {
    sendResponse({ error: 'Invalid message format' });
    return false;
  }
  
  // Handle different message types
  switch (message.type) {
    case MessageType.REQUEST_CREDENTIALS: {
      const credRequest = message;
      void handleCredentialRequest(credRequest)
        .then(response => { sendResponse(response); })
        .catch((error: unknown) => {
          console.error('[Background] Error handling credential request:', error);
          sendResponse(createMessage<CredentialsResponseMessage>({
            type: MessageType.CREDENTIALS_RESPONSE,
            credentials: [],
            url: credRequest.url,
          }));
        });
      return true; // Keep channel open for async response
    }
      
    case MessageType.FORM_DETECTED: {
      const formDetected = message;
      handleFormDetection(formDetected);
      sendResponse({ received: true });
      return false;
    }
      
    default:
      sendResponse({ status: 'ok' });
      return false;
  }
});
