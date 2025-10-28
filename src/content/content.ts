/**
 * Content Script for Login Form Detection and Autofill
 * 
 * This script runs on all web pages to detect login forms and enable
 * automatic credential filling from the Key Vault extension.
 */

/// <reference types="chrome"/>

import { detectLoginForms, fillFormFields, type DetectedForm } from './formDetection';
import { CredentialPicker } from './credentialPicker';
import {
  MessageType,
  createMessage,
  isValidMessage,
  type CredentialsResponseMessage,
  type CredentialForAutofill,
  type RequestCredentialsMessage,
  type FormDetectedMessage,
} from './messages';

/**
 * Content script state
 */
class ContentScript {
  private detectedForms: DetectedForm[] = [];
  private credentialPicker: CredentialPicker;
  private isInitialized = false;

  constructor() {
    this.credentialPicker = new CredentialPicker();
  }

  /**
   * Initialize the content script
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    console.log('[Key Vault] Content script initializing...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { this.setup(); });
    } else {
      this.setup();
    }
    
    this.isInitialized = true;
  }

  /**
   * Setup form detection and event listeners
   */
  private setup(): void {
    // Detect forms on page load
    this.detectForms();
    
    // Re-detect forms when DOM changes (for SPAs)
    const observer = new MutationObserver(() => {
      this.detectForms();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    // Add click handler for password fields
    this.setupPasswordFieldHandlers();
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (isValidMessage(message)) {
        this.handleMessage(message);
      }
      sendResponse({ received: true });
      return true;
    });
    
    console.log('[Key Vault] Content script ready');
  }

  /**
   * Detect login forms on the page
   */
  private detectForms(): void {
    const forms = detectLoginForms();
    
    if (forms.length > 0 && forms.length !== this.detectedForms.length) {
      this.detectedForms = forms;
      console.log(`[Key Vault] Detected ${String(forms.length)} login form(s)`);
      
      // Notify background script about detected forms
      this.notifyFormDetection(forms.length);
    }
  }

  /**
   * Notify background script about detected forms
   */
  private notifyFormDetection(formCount: number): void {
    const message = createMessage<FormDetectedMessage>({
      type: MessageType.FORM_DETECTED,
      url: window.location.href,
      domain: window.location.hostname,
      formCount,
    });
    
    void chrome.runtime.sendMessage(message).catch((error: unknown) => {
      console.error('[Key Vault] Failed to notify form detection:', error);
    });
  }

  /**
   * Setup handlers for password field interactions
   */
  private setupPasswordFieldHandlers(): void {
    // Use event delegation for dynamically added fields
    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement;
      
      if (target instanceof HTMLInputElement && target.type === 'password') {
        this.handlePasswordFieldFocus(target);
      }
    }, true);
  }

  /**
   * Handle password field focus
   */
  private handlePasswordFieldFocus(passwordField: HTMLInputElement): void {
    // Find the detected form containing this password field
    const detectedForm = this.detectedForms.find(
      df => df.passwordField === passwordField
    );
    
    if (!detectedForm) return;
    
    // Request credentials from background script
    this.requestCredentials(passwordField);
  }

  /**
   * Request credentials from background script
   */
  private requestCredentials(targetElement: HTMLElement): void {
    const message = createMessage<RequestCredentialsMessage>({
      type: MessageType.REQUEST_CREDENTIALS,
      url: window.location.href,
      domain: window.location.hostname,
    });
    
    void chrome.runtime.sendMessage(message)
      .then((response) => {
        if (isValidMessage(response) && 
            response.type === MessageType.CREDENTIALS_RESPONSE) {
          this.handleCredentialsResponse(response, targetElement);
        }
      })
      .catch((error: unknown) => {
        console.error('[Key Vault] Failed to request credentials:', error);
      });
  }

  /**
   * Handle credentials response from background script
   */
  private handleCredentialsResponse(
    response: CredentialsResponseMessage,
    targetElement: HTMLElement
  ): void {
    const credentials = response.credentials;
    
    if (credentials.length === 0) {
      console.log('[Key Vault] No matching credentials found');
      return;
    }
    
    console.log(`[Key Vault] Found ${String(credentials.length)} matching credential(s)`);
    
    if (credentials.length === 1) {
      // Auto-fill if only one credential
      this.fillCredentials(credentials[0]);
    } else {
      // Show picker if multiple credentials
      this.showCredentialPicker(credentials, targetElement);
    }
  }

  /**
   * Show credential picker
   */
  private showCredentialPicker(
    credentials: CredentialForAutofill[],
    targetElement: HTMLElement
  ): void {
    this.credentialPicker.show(credentials, targetElement, (credential) => {
      this.fillCredentials(credential);
    });
  }

  /**
   * Fill form with credentials
   */
  private fillCredentials(credential: CredentialForAutofill): void {
    // Find the appropriate form to fill
    const detectedForm = this.findFormForCurrentField();
    
    if (!detectedForm) {
      console.error('[Key Vault] No form found to fill');
      return;
    }
    
    console.log('[Key Vault] Filling credentials...');
    
    // Fill the form
    fillFormFields(detectedForm, credential.username, credential.password);
    
    console.log('[Key Vault] Credentials filled successfully');
  }

  /**
   * Find the form for the currently focused field
   */
  private findFormForCurrentField(): DetectedForm | null {
    const activeElement = document.activeElement;
    
    if (!activeElement) {
      return this.detectedForms[0] || null;
    }
    
    // Find form containing the active element
    const form = this.detectedForms.find(
      df => df.form.contains(activeElement) ||
           df.passwordField === activeElement ||
           df.usernameField === activeElement
    );
    
    return form ?? (this.detectedForms[0] ?? null);
  }

  /**
   * Handle messages from background script
   */
  private handleMessage(message: unknown): void {
    if (!isValidMessage(message)) return;
    
    switch (message.type) {
      case MessageType.CREDENTIALS_RESPONSE:
        // Handled by request callback
        break;
      default:
        console.log('[Key Vault] Received message:', message.type);
    }
  }
}

// Initialize content script
const contentScript = new ContentScript();
contentScript.initialize();
