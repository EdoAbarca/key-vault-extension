# Privacy Policy for Key Vault Extension

**Last Updated:** October 28, 2025

## Introduction

Key Vault Extension ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our Chrome browser extension.

## Information Collection and Use

### What We Collect

**Local Data Only:**
- Encrypted credentials stored locally in your browser's IndexedDB
- Extension settings and preferences stored locally using Chrome's storage API
- Master password hash (never stored in plain text)

**What We DON'T Collect:**
- We do not collect, transmit, or store any personal information on external servers
- We do not track your browsing history
- We do not collect analytics or usage statistics
- We do not share any data with third parties
- We do not use cookies or tracking technologies

### Data Storage

All data is stored **locally on your device only** using:
- **IndexedDB**: For encrypted credential storage
- **Chrome Storage API**: For extension settings and preferences

Your data never leaves your device. We have no servers, no databases, and no external data collection.

## Data Security

### Encryption

Your credentials are protected using industry-standard cryptography:
- **Argon2id**: Password-based key derivation with high memory and CPU cost
- **XChaCha20-Poly1305**: Authenticated encryption for all stored credentials
- **libsodium**: Cryptographic library implementation (sodium-plus)

All encryption and decryption operations occur locally on your device.

### Master Password

- Your master password is never stored in plain text
- Only a derived key hash is stored for authentication
- The master password cannot be recovered if lost
- You are responsible for remembering your master password

## Permissions Justification

The extension requests the following Chrome permissions:

### Storage Permission
**Purpose**: Access to Chrome's storage API for saving extension settings and preferences
**Data Stored**: User preferences, extension configuration
**Location**: Local browser storage only

### Unlimited Storage Permission
**Purpose**: Remove storage quota limits for large encrypted credential databases
**Reason**: Users may store many credentials, requiring more space than the default quota
**Data Stored**: Encrypted credentials in IndexedDB
**Location**: Local browser storage only

### No Host Permissions
**Important**: The extension does NOT request access to any websites or browsing data

## Data Access

- Only you have access to your credentials through your master password
- Credentials are encrypted and cannot be accessed without your master password
- We have no backdoors, no recovery mechanisms, and no access to your data
- If you forget your master password, your data cannot be recovered

## Data Retention and Deletion

### Data Control
- You have complete control over your data
- All data is stored locally on your device
- You can delete individual credentials at any time
- You can uninstall the extension to remove all data

### Uninstalling the Extension
When you uninstall the extension:
- All locally stored data is removed by Chrome
- No data remains on any external servers (because we don't use any)
- The extension and all its data are completely removed from your device

## Third-Party Services

We do not use any third-party services, analytics, or tracking tools. The extension operates entirely offline and locally on your device.

## Children's Privacy

The extension does not knowingly collect any information from children. It is intended for general use and stores no personal information online.

## Changes to Privacy Policy

We may update this Privacy Policy from time to time. Changes will be reflected in the "Last Updated" date. We will notify users of significant changes through:
- Extension update notes in the Chrome Web Store
- In-extension notifications for major policy updates

## Open Source

This extension is open source. You can review the complete source code to verify our privacy claims:
- GitHub Repository: https://github.com/EdoAbarca/key-vault-extension

## Contact

For questions about this Privacy Policy or the extension:
- GitHub Issues: https://github.com/EdoAbarca/key-vault-extension/issues
- Email: [Add contact email if available]

## Your Rights

Since all data is stored locally on your device and we collect no information:
- You have complete control over your data
- You can export, delete, or modify your data at any time
- You can uninstall the extension to remove all data
- There is no data to request from us, as we store nothing externally

## Compliance

This extension:
- Does not collect personal information
- Does not transmit data to external servers
- Complies with Chrome Web Store Developer Program Policies
- Follows privacy best practices for browser extensions

## Security

If you discover a security vulnerability, please report it responsibly:
- Open a security issue on GitHub (private disclosure)
- Do not publicly disclose security issues until they are resolved
- Email: [Add security contact email if available]

## Consent

By installing and using the Key Vault Extension, you agree to this Privacy Policy. If you do not agree, please do not install or use the extension.

---

**Summary**: Key Vault Extension is a privacy-focused, offline-first credential manager. All your data stays on your device, encrypted with your master password. We collect nothing, track nothing, and share nothing. Your privacy is guaranteed by design.
