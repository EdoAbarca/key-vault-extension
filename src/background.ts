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
  
  // Validate message
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
