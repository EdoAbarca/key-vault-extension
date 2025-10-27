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

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder from this project

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

