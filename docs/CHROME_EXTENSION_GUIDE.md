# Chrome Extension Loading Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Verification](#verification)
4. [Troubleshooting](#troubleshooting)
5. [Development Workflow](#development-workflow)
6. [Manifest V3 Details](#manifest-v3-details)

## System Requirements

### Browser
- **Chrome**: Version 88 or higher (for full Manifest V3 support)
- **Chromium-based browsers**: Edge, Brave, Opera (should work but not officially tested)

### Development Environment
- **Node.js**: Version 18 or higher recommended
- **npm**: Comes with Node.js
- **Operating System**: Windows, macOS, or Linux

## Installation Steps

### 1. Initial Setup

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/EdoAbarca/key-vault-extension.git
cd key-vault-extension

# Install dependencies
npm install
```

### 2. Build the Extension

Build the production-ready extension:

```bash
npm run build
```

**Expected Output:**
```
> key-vault-extension@0.0.0 build
> tsc -b && vite build

vite v7.1.12 building for production...
transforming...
✓ 34 modules transformed.
rendering chunks...
dist/manifest.json                       0.70 kB
dist/service-worker-loader.js            0.05 kB
dist/index.html                          0.47 kB
dist/icon-16.png                         0.08 kB
dist/icon-48.png                         0.12 kB
dist/icon-128.png                        0.26 kB
✓ built in 1.22s
```

The build creates a `dist/` folder containing:
- `manifest.json` - Extension configuration
- `service-worker-loader.js` - Background service worker
- `index.html` - Popup UI
- `icon-*.png` - Extension icons
- `assets/` - Compiled JavaScript and CSS

### 3. Load in Chrome

#### Step 3.1: Open Extensions Page

**Option 1 - Direct URL:**
1. Open Chrome
2. Type `chrome://extensions/` in the address bar
3. Press Enter

**Option 2 - Via Menu:**
1. Click the Chrome menu (three dots ⋮ in top-right)
2. Hover over "More Tools"
3. Click "Extensions"

#### Step 3.2: Enable Developer Mode

1. Look for the "Developer mode" toggle in the top-right corner
2. Click it to enable (it should turn blue/on)
3. Additional options will appear: "Load unpacked", "Pack extension", "Update"

#### Step 3.3: Load Unpacked Extension

1. Click the "Load unpacked" button
2. A file browser dialog will open
3. Navigate to your `key-vault-extension` project folder
4. **Important**: Select the `dist` folder (not the root folder)
5. Click "Select Folder" (or "Open" on some systems)

#### Step 3.4: Verify Installation

After loading, you should see:
- **Extension Card**: A card appears with:
  - Name: "Key Vault Extension"
  - Version: "0.0.1"
  - Description: "Credential management chrome extension"
  - ID: A unique extension ID (like `abcdefghijklmnopqrstuvwxyz123456`)
- **Toolbar Icon**: The extension icon appears in Chrome's toolbar
- **No Errors**: No red error messages on the extension card

## Verification

### Basic Checks

1. **Extension appears in list**: Check `chrome://extensions/`
2. **Service worker is active**: 
   - Click "service worker" link on the extension card
   - DevTools opens showing console logs
   - Should see: "Key Vault Extension - Background service worker initialized"
3. **Popup opens**: Click the extension icon in toolbar
4. **No errors**: Check for any error messages or warnings

### Advanced Verification

#### Inspect Service Worker
```
1. Go to chrome://extensions/
2. Find "Key Vault Extension"
3. Click "service worker" (blue link)
4. DevTools opens showing:
   Console: "Key Vault Extension - Background service worker initialized"
   Console: "Extension installed: {reason: 'install', ...}"
```

#### Test Message Passing
```javascript
// Open extension popup
// Open DevTools (F12)
// Run in console:
chrome.runtime.sendMessage({test: "hello"}, response => {
  console.log("Response:", response); // Should log: {status: "ok"}
});
```

## Troubleshooting

### Common Issues

#### Issue: "Failed to load extension"
**Cause**: Wrong folder selected or build incomplete

**Solution**:
1. Ensure you selected the `dist` folder (not the root folder)
2. Verify `dist/manifest.json` exists
3. Rebuild: `npm run build`

#### Issue: "Manifest version 2 is deprecated"
**Cause**: Old manifest file being loaded

**Solution**: 
1. Check that `dist/manifest.json` contains `"manifest_version": 3`
2. Rebuild the extension
3. Remove and reload the extension

#### Issue: "Service worker registration failed"
**Cause**: Service worker file not found or invalid

**Solution**:
1. Check `dist/service-worker-loader.js` exists
2. Verify `dist/assets/background.ts-*.js` exists
3. Rebuild: `npm run build`

#### Issue: "Could not load icon 'icon-*.png'"
**Cause**: Icon files missing

**Solution**:
1. Check that `public/icon-16.png`, `public/icon-48.png`, `public/icon-128.png` exist
2. Rebuild: `npm run build`
3. Verify icons copied to `dist/` folder

#### Issue: Extension loads but popup is blank
**Cause**: JavaScript errors in popup code

**Solution**:
1. Right-click extension icon → "Inspect popup"
2. Check Console for errors
3. Verify `dist/index.html` and `dist/assets/popup-*.js` exist

### Clean Rebuild

If issues persist, try a clean rebuild:

```bash
# Remove build artifacts
rm -rf dist/
rm -rf node_modules/

# Reinstall dependencies
npm install

# Rebuild
npm run build

# Reload extension in Chrome
```

## Development Workflow

### Making Changes

1. **Edit code**: Make changes to files in `src/`
2. **Rebuild**: Run `npm run build`
3. **Reload extension**: 
   - Go to `chrome://extensions/`
   - Click the refresh icon (↻) on the extension card
   - Or remove and re-add the extension

### Hot Reload (Development Mode)

For faster development:

```bash
npm run dev
```

**Note**: This starts a dev server but you still need to manually reload the extension in Chrome after changes. The CRXJS plugin handles rebuilding automatically.

### Testing Changes

```bash
# Run linter
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Manifest V3 Details

### Key Differences from Manifest V2

| Feature | Manifest V2 | Manifest V3 |
|---------|-------------|-------------|
| Manifest version | `"manifest_version": 2` | `"manifest_version": 3` |
| Background | `"background": {"scripts": [...]}` | `"background": {"service_worker": "..."}` |
| Browser action | `"browser_action"` | `"action"` |
| Host permissions | Mixed with permissions | Separate `"host_permissions"` |
| Content Security Policy | String | Object with keys |
| Remotely hosted code | Allowed | Blocked |

### Service Worker vs Background Page

**Background Page (V2)**:
- Always running
- DOM access
- Uses persistent background page

**Service Worker (V3)**:
- Event-driven (starts/stops as needed)
- No DOM access
- More efficient resource usage
- Must handle lifecycle correctly

### Extension Architecture

```
┌─────────────────────────────────────────┐
│         Chrome Extension                │
├─────────────────────────────────────────┤
│  Popup UI (index.html)                  │
│  - React application                    │
│  - User interface                       │
│  - Communicates via chrome.runtime      │
├─────────────────────────────────────────┤
│  Service Worker (background.ts)         │
│  - Event handlers                       │
│  - Message listeners                    │
│  - Background logic                     │
├─────────────────────────────────────────┤
│  Chrome Storage API                     │
│  - Persistent data storage              │
│  - Synced across devices (if enabled)   │
├─────────────────────────────────────────┤
│  IndexedDB (via Dexie.js)              │
│  - Local encrypted credential storage   │
│  - Large data capacity                  │
└─────────────────────────────────────────┘
```

### Permissions Explained

- **`storage`**: Access to `chrome.storage` API for settings and data
- **`unlimitedStorage`**: Store unlimited data (overrides quota limits)
- **`host_permissions`**: Empty array (no website access needed)

### Content Security Policy

```json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
}
```

- **`script-src 'self'`**: Only scripts from extension allowed
- **`'wasm-unsafe-eval'`**: Required for libsodium.js (WebAssembly crypto)
- **`object-src 'self'`**: Only objects from extension allowed

## Additional Resources

### Official Documentation
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Service Workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

### Project Documentation
- [README.md](../README.md) - Project overview
- [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) - Technical stack details

### Useful Chrome URLs
- `chrome://extensions/` - Extensions management
- `chrome://serviceworker-internals/` - Service worker debugging
- `chrome://inspect/#service-workers` - Inspect running service workers

## Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/EdoAbarca/key-vault-extension/issues)
2. Review the project's README.md
3. Verify your Chrome version supports Manifest V3
4. Ensure all build steps completed successfully
