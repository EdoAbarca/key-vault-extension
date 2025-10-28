/**
 * Credential Picker UI Module
 * 
 * Creates and manages the UI for selecting credentials on web pages
 */

import type { CredentialForAutofill } from './messages';

/**
 * Credential picker overlay
 */
export class CredentialPicker {
  private overlay: HTMLDivElement | null = null;
  private selectedIndex = 0;
  private credentials: CredentialForAutofill[] = [];
  private onSelectCallback: ((credential: CredentialForAutofill) => void) | null = null;

  /**
   * Show the credential picker
   */
  show(
    credentials: CredentialForAutofill[],
    _targetElement: HTMLElement,
    onSelect: (credential: CredentialForAutofill) => void
  ): void {
    this.credentials = credentials;
    this.selectedIndex = 0;
    this.onSelectCallback = onSelect;
    
    // Remove existing overlay if present
    this.hide();
    
    // Create overlay
    this.overlay = this.createOverlay();
    document.body.appendChild(this.overlay);
    
    // Add event listeners
    this.setupEventListeners();
    
    // Position the overlay
    this.positionOverlay(_targetElement);
  }

  /**
   * Hide the credential picker
   */
  hide(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.credentials = [];
    this.selectedIndex = 0;
    this.onSelectCallback = null;
  }

  /**
   * Create the overlay element
   */
  private createOverlay(): HTMLDivElement {
    const overlay = document.createElement('div');
    overlay.id = 'key-vault-credential-picker';
    overlay.style.cssText = `
      position: absolute;
      z-index: 2147483647;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      max-width: 320px;
      min-width: 280px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 14px;
      overflow: hidden;
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    
    const title = document.createElement('div');
    title.textContent = 'Select Credential';
    title.style.cssText = `
      font-weight: 600;
      color: #111827;
      font-size: 14px;
    `;
    header.appendChild(title);
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: #6b7280;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    `;
    closeButton.onmouseover = () => {
      closeButton.style.background = '#e5e7eb';
    };
    closeButton.onmouseout = () => {
      closeButton.style.background = 'none';
    };
    closeButton.onclick = () => { this.hide(); };
    header.appendChild(closeButton);
    
    overlay.appendChild(header);
    
    // Create credentials list
    const list = document.createElement('div');
    list.style.cssText = `
      max-height: 300px;
      overflow-y: auto;
    `;
    
    this.credentials.forEach((credential, index) => {
      const item = this.createCredentialItem(credential, index);
      list.appendChild(item);
    });
    
    overlay.appendChild(list);
    
    // Create footer
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 8px 16px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #6b7280;
      text-align: center;
    `;
    footer.textContent = 'Use ↑↓ to navigate • Enter to select • Esc to close';
    overlay.appendChild(footer);
    
    return overlay;
  }

  /**
   * Create a credential list item
   */
  private createCredentialItem(
    credential: CredentialForAutofill,
    index: number
  ): HTMLDivElement {
    const item = document.createElement('div');
    item.dataset.index = index.toString();
    item.style.cssText = `
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.15s;
      ${index === this.selectedIndex ? 'background: #eff6ff;' : ''}
    `;
    
    const titleDiv = document.createElement('div');
    titleDiv.textContent = credential.title;
    titleDiv.style.cssText = `
      font-weight: 500;
      color: #111827;
      margin-bottom: 4px;
    `;
    item.appendChild(titleDiv);
    
    const usernameDiv = document.createElement('div');
    usernameDiv.textContent = credential.username;
    usernameDiv.style.cssText = `
      font-size: 12px;
      color: #6b7280;
    `;
    item.appendChild(usernameDiv);
    
    // Event handlers
    item.onmouseover = () => {
      this.selectedIndex = index;
      this.updateSelection();
    };
    
    item.onclick = () => {
      this.selectCredential(credential);
    };
    
    return item;
  }

  /**
   * Update the visual selection
   */
  private updateSelection(): void {
    if (!this.overlay) return;
    
    const items = this.overlay.querySelectorAll('[data-index]');
    items.forEach((item, index) => {
      const element = item as HTMLElement;
      if (index === this.selectedIndex) {
        element.style.background = '#eff6ff';
      } else {
        element.style.background = 'white';
      }
    });
  }

  /**
   * Select a credential
   */
  private selectCredential(credential: CredentialForAutofill): void {
    if (this.onSelectCallback) {
      this.onSelectCallback(credential);
    }
    this.hide();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Keyboard navigation
    const handleKeydown = (e: KeyboardEvent) => {
      if (!this.overlay) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.selectedIndex = Math.min(
            this.selectedIndex + 1,
            this.credentials.length - 1
          );
          this.updateSelection();
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
          this.updateSelection();
          break;
          
        case 'Enter':
          e.preventDefault();
          if (this.credentials[this.selectedIndex]) {
            this.selectCredential(this.credentials[this.selectedIndex]);
          }
          break;
          
        case 'Escape':
          e.preventDefault();
          this.hide();
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // Click outside to close
    const handleClickOutside = (e: MouseEvent) => {
      if (this.overlay && !this.overlay.contains(e.target as Node)) {
        this.hide();
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside, { once: true });
    }, 100);
    
    // Cleanup on hide
    if (this.overlay) {
      this.overlay.addEventListener('remove', () => {
        document.removeEventListener('keydown', handleKeydown);
      });
    }
  }

  /**
   * Position the overlay near the target element
   */
  private positionOverlay(targetElement: HTMLElement): void {
    if (!this.overlay) return;
    
    const rect = targetElement.getBoundingClientRect();
    const overlayHeight = this.overlay.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Position below if there's space, otherwise above
    if (spaceBelow >= overlayHeight || spaceBelow > spaceAbove) {
      this.overlay.style.top = `${String(rect.bottom + window.scrollY + 5)}px`;
    } else {
      this.overlay.style.top = `${String(rect.top + window.scrollY - overlayHeight - 5)}px`;
    }
    
    // Align to the left of the target element
    this.overlay.style.left = `${String(rect.left + window.scrollX)}px`;
    
    // Ensure overlay is not off-screen horizontally
    const overlayWidth = this.overlay.offsetWidth;
    if (rect.left + overlayWidth > window.innerWidth) {
      this.overlay.style.left = `${String(window.innerWidth - overlayWidth - 10)}px`;
    }
  }
}
