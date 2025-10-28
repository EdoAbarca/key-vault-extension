# Key Vault Extension

Credential management chrome extension

## Description

A secure Chrome Extension for managing credentials with end-to-end encryption. Built with modern web technologies and cryptographic best practices.

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Chrome Extension**: Manifest V3
- **Cryptography**:
  - libsodium.js (via sodium-plus) for core cryptographic operations
  - Argon2id for key derivation
  - XChaCha20-Poly1305 for encryption
  - Web Crypto API for additional operations
  - Secure Scrypt for backup key derivation
- **Storage**: IndexedDB with Dexie.js
- **State Management**: Zustand
- **Testing**: Jest + Testing Library

## Manifest V3 Configuration

This extension uses **Chrome Extension Manifest V3**, the latest and required standard for Chrome extensions. Key features:

- **Service Worker**: Modern background script architecture using `background.ts`
- **Permissions**: Minimal permissions for security
  - `storage`: For Chrome storage API access
  - `unlimitedStorage`: For large encrypted credential databases
- **Content Security Policy**: Configured for WebAssembly support (required by libsodium)
- **Action API**: Popup-based UI with extension toolbar integration
- **Icons**: Multiple sizes (16x16, 48x48, 128x128) for various contexts

The extension is fully compliant with Chrome Web Store requirements and modern extension standards.

## Installation

```bash
npm install
```

## Documentation

### Development Guides
- **[Development Workflow Guide](./docs/DEVELOPMENT_WORKFLOW.md)** - Complete guide for development with hot reload
- **[Chrome Extension Loading Guide](./docs/CHROME_EXTENSION_GUIDE.md)** - Comprehensive guide for loading the extension in Chrome
- **[Setup Summary](./docs/SETUP_SUMMARY.md)** - Technical stack and configuration details

### Chrome Web Store Publication
- **[Chrome Web Store Readiness Checklist](./docs/CHROME_WEB_STORE_READINESS.md)** - Complete checklist for submission readiness
- **[Chrome Web Store Setup Guide](./docs/CHROME_WEB_STORE_SETUP.md)** - Developer account setup instructions
- **[Store Listing Guide](./docs/STORE_LISTING_GUIDE.md)** - Prepare descriptions, screenshots, and assets
- **[Submission Guide](./docs/CHROME_WEB_STORE_SUBMISSION.md)** - Step-by-step submission process
- **[Permissions Justification](./docs/PERMISSIONS_JUSTIFICATION.md)** - Detailed permission explanations

### Legal Documents
- **[Privacy Policy](./PRIVACY_POLICY.md)** - Data collection and privacy practices
- **[Terms of Service](./TERMS_OF_SERVICE.md)** - Usage terms and conditions


## Development

Start the development server with hot reload:

```bash
npm run dev
```

The development server includes:
- **Hot Module Replacement (HMR)**: Changes to React components update instantly
- **React Fast Refresh**: Preserves component state during updates
- **TypeScript compilation**: Automatic type checking
- **Error overlay**: Visual feedback for errors

After starting the dev server, load the `dist` folder as an unpacked extension in Chrome. See the [Development Workflow Guide](./docs/DEVELOPMENT_WORKFLOW.md) for detailed instructions.

## Build

```bash
npm run build
```

## Testing

```bash
npm test
npm run test:watch
```

## Linting

```bash
npm run lint
```

## Loading the Extension in Chrome

### Prerequisites
- Chrome browser (version 88 or later for full Manifest V3 support)
- Node.js and npm installed

### Steps

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd key-vault-extension
   npm install
   ```

2. **Build the extension:**
   ```bash
   npm run build
   ```
   This will create a `dist` folder with the compiled extension.

3. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

4. **Verify installation:**
   - The extension should appear in your Chrome toolbar
   - Click the extension icon to open the popup
   - Check the Chrome DevTools console for the service worker initialization message

### Troubleshooting

- If the extension doesn't load, check the Chrome console for errors
- Ensure all dependencies are installed: `npm install`
- Try rebuilding: `npm run build`
- Make sure you're selecting the `dist` folder, not the root project folder

## Features

- Secure credential storage using IndexedDB
- End-to-end encryption with industry-standard cryptography
- Chrome Extension Manifest V3 compliant
- Modern React UI with Tailwind CSS
- Type-safe with TypeScript

## Security

This extension uses multiple layers of security:
- Argon2id for password-based key derivation
- XChaCha20-Poly1305 for authenticated encryption
- Secure key storage practices
- No credentials sent to external servers

