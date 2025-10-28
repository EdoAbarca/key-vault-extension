# Permissions Justification Document

This document provides detailed justification for all permissions requested by the Key Vault Extension, ensuring compliance with Chrome Web Store policies and user transparency.

## Overview

Key Vault Extension follows the **principle of least privilege**, requesting only the minimum permissions necessary for its core functionality. This document explains why each permission is needed and how it's used.

## Current Permissions

The extension requests the following permissions in `manifest.json`:

```json
{
  "permissions": [
    "storage",
    "unlimitedStorage"
  ],
  "host_permissions": []
}
```

## Detailed Justifications

### 1. Storage Permission

**Permission**: `storage`  
**Required**: Yes  
**User Impact**: Low

#### Purpose
Access to Chrome's `chrome.storage` API for persisting extension settings and encrypted credential data locally on the user's device.

#### Why It's Needed
- Store user preferences (theme, display options, etc.)
- Save extension configuration and settings
- Maintain encrypted credential metadata
- Preserve vault lock state and authentication status
- Enable offline functionality

#### How It's Used
The extension uses `chrome.storage.local` to:
1. **Save Settings**: User preferences like theme, auto-lock timeout, display options
2. **Store Vault Metadata**: Information about the encrypted vault (not the credentials themselves)
3. **Maintain State**: Authentication status, last access time, vault lock state
4. **Configuration Data**: Extension configuration that persists across sessions

#### Data Stored
- Extension settings (JSON objects)
- Vault metadata (encrypted)
- Authentication state
- User preferences

#### Privacy Guarantee
- All data stays on the user's device
- No data is transmitted to external servers
- Storage is local to the Chrome browser
- Uninstalling the extension removes all stored data

#### Code Examples
```typescript
// Example: Saving settings
chrome.storage.local.set({ theme: 'dark', autoLock: true });

// Example: Reading settings
const data = await chrome.storage.local.get(['theme', 'autoLock']);
```

#### Alternative Considered
- **localStorage**: Not accessible in service worker context (required for Manifest V3)
- **IndexedDB alone**: Insufficient for quick access to settings and state

**Conclusion**: The `storage` permission is essential for the extension's core functionality and cannot be avoided.

---

### 2. Unlimited Storage Permission

**Permission**: `unlimitedStorage`  
**Required**: Yes  
**User Impact**: Low (positive - allows storing more credentials)

#### Purpose
Remove Chrome's default storage quota limits to allow users to store large numbers of encrypted credentials without hitting size restrictions.

#### Why It's Needed
- **Encryption Overhead**: Encrypted data is larger than plain text
  - Each credential includes encryption metadata, nonces, and authentication tags
  - Encryption can increase data size by 50-100% or more
- **Large Credential Databases**: Power users may store hundreds or thousands of credentials
- **Additional Metadata**: Each credential includes:
  - Title, username, password (encrypted)
  - URLs, notes, custom fields (encrypted)
  - Timestamps, tags, categories
  - Encryption metadata (nonces, salts)

#### Storage Requirements Example

Plain text credential:
```json
{
  "username": "user@example.com",
  "password": "mypassword"
}
// Size: ~50 bytes
```

Encrypted credential:
```json
{
  "id": "uuid-here",
  "title": "encrypted-data-here",
  "username": "encrypted-data-here",
  "password": "encrypted-data-here",
  "nonce": "24-byte-nonce",
  "salt": "32-byte-salt",
  "created": 1234567890,
  "modified": 1234567890,
  "metadata": {...}
}
// Size: ~500-1000 bytes (10-20x larger)
```

#### Storage Math
- **Default Chrome quota**: ~10 MB for local storage
- **Average encrypted credential**: ~800 bytes
- **Without unlimitedStorage**: ~12,500 credentials max
- **With unlimitedStorage**: Limited only by available disk space

For users with:
- **100 credentials**: ~80 KB (well within default quota)
- **500 credentials**: ~400 KB (within default quota)
- **1,000 credentials**: ~800 KB (within default quota)
- **5,000 credentials**: ~4 MB (approaching quota)
- **10,000+ credentials**: Would exceed quota without unlimited storage

#### How It's Used
The extension uses IndexedDB (via Dexie.js) for:
1. **Credential Storage**: All encrypted credentials
2. **Full-Text Search Indexes**: For quick searching
3. **Audit Logs**: Optional access history and change logs
4. **Backup Data**: Temporary export/import operations

#### Data Privacy
- All data remains local on the user's device
- No external storage or cloud services
- Storage is encrypted at rest with user's master password
- Only accessible through the extension when unlocked

#### User Benefit
- Store unlimited credentials without arbitrary limits
- No "storage full" errors
- Future-proof for growing credential collections
- Accommodates encryption overhead without user concern

#### Alternative Considered
- **External File Storage**: Would require additional permissions (file system access)
- **Cloud Storage**: Against our privacy-first principle (no external servers)
- **Multiple Vaults**: Complex UX, doesn't solve the per-vault limit

**Conclusion**: The `unlimitedStorage` permission is necessary to provide a seamless user experience and accommodate encrypted data storage for users with large credential collections.

---

## Permissions We DON'T Request

### No Host Permissions

**We do NOT request**: `host_permissions`

#### What This Means
- The extension cannot access any websites
- Cannot read or modify web page content
- Cannot track browsing history
- Cannot inject scripts into web pages
- Cannot monitor or intercept network requests

#### Why This Matters
- **Maximum Privacy**: Your browsing activity is never visible to the extension
- **Security**: Even if compromised, the extension cannot access websites
- **Trust**: Users can verify we don't have access to their browsing

#### Comparison to Password Managers
Many password managers request `host_permissions` for:
- Auto-fill functionality on websites
- Password capture on forms
- Website icon fetching
- URL matching

**Key Vault Extension** prioritizes privacy over convenience and does NOT auto-fill or access websites.

---

### No Additional Permissions

We explicitly do NOT request:

| Permission | Why We Don't Need It |
|------------|---------------------|
| `tabs` | Don't need to access or monitor browser tabs |
| `history` | Don't track or analyze browsing history |
| `cookies` | Don't read or modify cookies |
| `webRequest` | Don't intercept or monitor network traffic |
| `clipboardWrite` | Could request for copy functionality, but use native APIs instead |
| `notifications` | Don't need to show system notifications (could add in future if needed) |
| `activeTab` | Don't need to interact with active tab |
| `geolocation` | No need to access user location |
| `webNavigation` | Don't track page navigation |
| `bookmarks` | Don't access or modify bookmarks |
| `downloads` | Don't manage downloads (export uses native save dialog) |
| `management` | Don't need to manage other extensions |

---

## Permission Security Analysis

### Attack Surface Minimization

By requesting only 2 permissions (storage, unlimitedStorage), we minimize the attack surface:

- **No network access**: Cannot exfiltrate data even if compromised
- **No website access**: Cannot steal credentials from web forms
- **No sensitive APIs**: Cannot access camera, microphone, location, etc.
- **Isolated execution**: Runs in sandboxed extension environment

### Principle of Least Privilege

We follow the principle of least privilege:

1. **Identify minimum permissions needed**: storage + unlimitedStorage only
2. **Justify each permission**: Clear use case documented
3. **Avoid optional permissions**: Don't request "nice to have" features
4. **Future-proof design**: Architecture doesn't require additional permissions

### User Trust

Minimal permissions build user trust:

- **Transparent**: Easy to understand what we can access (just local storage)
- **Auditable**: Simple permission set is easy to verify
- **Privacy-focused**: No tracking, analytics, or data collection possible
- **Open Source**: Users can audit code to verify permission usage

---

## Chrome Web Store Compliance

### Disclosure Requirements

For Chrome Web Store submission, we disclose:

1. **Storage Permission**: "Used to store encrypted credentials locally"
2. **Unlimited Storage Permission**: "Allows storing large credential databases"
3. **No Data Collection**: "Extension does not collect or transmit any user data"
4. **No External Connections**: "All data stays on your device"

### Permission Warnings

Users see the following warnings during installation:

> **This extension can:**
> - Store unlimited amount of client-side data

**Note**: Chrome does not show a warning for basic `storage` permission as it's considered low-risk.

### Privacy Practices Declaration

Chrome Web Store questionnaire answers:

- **Collect personal data?** No
- **Use remote code?** No
- **Third-party services?** No
- **Data transmitted?** No
- **Analytics/tracking?** No

---

## Future Permission Considerations

### Permissions We Might Add

If users request additional features, we might consider:

| Permission | Feature | Privacy Impact |
|------------|---------|----------------|
| `clipboardWrite` | Explicit copy-to-clipboard button | Low - only when user clicks copy |
| `notifications` | Security alerts or reminders | Low - local notifications only |
| `alarms` | Auto-lock after timeout | Low - timer functionality |

### Permissions We Will NEVER Add

The following permissions violate our privacy principles:

| Permission | Why Never |
|------------|-----------|
| `host_permissions` | Would allow tracking user browsing |
| `webRequest` | Would allow intercepting network traffic |
| `tabs` | Would allow monitoring open tabs |
| `history` | Would allow accessing browsing history |
| `cookies` | Would allow reading authentication tokens |

---

## User FAQ

### Q: Why does the extension need storage permission?

**A**: To save your encrypted credentials locally on your device. Without this permission, the extension couldn't store any data and would be useless.

### Q: Why unlimited storage? Isn't that excessive?

**A**: Encryption increases data size significantly. For users with many credentials (500+), the default Chrome storage quota might not be enough. This permission ensures you never hit a storage limit.

### Q: Can the extension access my browsing history?

**A**: No. We do not request any permissions that would allow us to see your browsing history, open tabs, or visited websites.

### Q: Can the extension steal data from websites I visit?

**A**: No. We have zero permissions to access or interact with websites. We can only access the extension's own storage.

### Q: What happens if I don't grant these permissions?

**A**: Chrome grants these permissions automatically when you install the extension. They're required for the extension to function. If you're uncomfortable with these permissions, the extension cannot work.

### Q: Can the extension send my data to a server?

**A**: No. The extension has no permissions to access the internet or communicate with external servers. All data stays on your device.

---

## Transparency and Audit

### Open Source Verification

Users can verify our permission usage by:

1. **Reading the source code**: GitHub repository is public
2. **Searching for permission usage**: 
   ```bash
   # Find chrome.storage usage
   grep -r "chrome.storage" src/
   
   # Verify no network calls
   grep -r "fetch\|XMLHttpRequest\|axios" src/
   ```
3. **Reviewing manifest.json**: All permissions are declared in manifest

### Chrome DevTools Monitoring

Users can monitor extension behavior using Chrome DevTools:

1. Open `chrome://extensions/`
2. Click "Inspect service worker" on Key Vault Extension
3. Check Console and Network tabs
4. Verify no network requests are made

---

## Conclusion

Key Vault Extension requests the absolute minimum permissions necessary for its core functionality:

✓ **storage**: Required for saving encrypted credentials locally  
✓ **unlimitedStorage**: Necessary for accommodating encrypted data overhead  
✗ **NO other permissions**: Maximum privacy and security

**Privacy Promise**: Your data never leaves your device. We have no ability to access, transmit, or monitor your information beyond the extension's own local storage.

**Transparency**: All code is open source and auditable. Verify our claims by reviewing the source code on GitHub.

---

**Last Updated**: October 28, 2025  
**Manifest Version**: 3  
**Extension Version**: 0.0.1

For questions about permissions, please open an issue on GitHub: https://github.com/EdoAbarca/key-vault-extension/issues
