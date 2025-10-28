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

## Installation

```bash
npm install
```

## Documentation

- **[Chrome Extension Loading Guide](./docs/CHROME_EXTENSION_GUIDE.md)** - Comprehensive guide for loading the extension in Chrome
- **[Setup Summary](./docs/SETUP_SUMMARY.md)** - Technical stack and configuration details


## Development

```bash
npm run dev
```

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
- Chrome browser (version 88 or higher for Manifest V3 support)
- Node.js and npm installed
- Project dependencies installed (`npm install`)

### Installation Steps

1. **Build the extension:**
   ```bash
   npm run build
   ```
   This will compile TypeScript, bundle assets, and create the production build in the `dist` folder.

2. **Open Chrome Extensions page:**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Or use menu: Chrome Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode:**
   - Find the "Developer mode" toggle in the top-right corner
   - Click to enable it

4. **Load the Extension:**
   - Click the "Load unpacked" button (appears after enabling Developer mode)
   - Navigate to your project directory
   - Select the `dist` folder
   - Click "Select Folder" or "Open"

5. **Verify Installation:**
   - The extension should appear in your extensions list
   - Look for "Key Vault Extension" with version 0.0.1
   - Check that there are no error messages
   - The extension icon should be visible in your Chrome toolbar

### Troubleshooting

**If you see errors:**
- Make sure you selected the `dist` folder, not the root project folder
- Verify the build completed successfully without errors
- Check that all required files are present in the `dist` folder (manifest.json, service-worker-loader.js, icons)

**To reload after making changes:**
1. Make your code changes
2. Run `npm run build` again
3. Go to `chrome://extensions/`
4. Click the refresh icon (↻) on the Key Vault Extension card

### Development Mode

For active development, you can use:
```bash
npm run dev
```
However, note that you'll still need to reload the extension in Chrome after changes.

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

