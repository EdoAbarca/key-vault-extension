# Chrome Web Store Listing Guide

This guide helps you prepare professional store listing materials for the Key Vault Extension, including descriptions, screenshots, and promotional assets.

## Table of Contents
1. [Store Listing Text](#store-listing-text)
2. [Icons and Images](#icons-and-images)
3. [Screenshots](#screenshots)
4. [Promotional Images](#promotional-images)
5. [Store Listing Checklist](#store-listing-checklist)

## Store Listing Text

### Extension Name
**Title**: Key Vault Extension  
**Length**: 45 characters maximum  
**Current**: 20 characters ✓

**Alternative Names** (if needed):
- Key Vault - Secure Password Manager
- Secure Key Vault
- Key Vault: Credential Manager

### Short Description
**Purpose**: Appears in search results and browse pages  
**Length**: 132 characters maximum  
**Required**: Yes

**Recommended Short Description:**
```
Secure offline credential manager with end-to-end encryption. Store passwords safely with Argon2id and XChaCha20-Poly1305.
```
(Length: 130 characters ✓)

**Alternative Short Descriptions:**
```
Open-source password manager with military-grade encryption. Your credentials stay on your device, encrypted with your master key.
```
(Length: 131 characters ✓)

```
Privacy-focused credential vault. All data encrypted locally, never sent to servers. Open source, secure, and completely offline.
```
(Length: 130 characters ✓)

### Detailed Description

**Purpose**: Full extension description on store page  
**Length**: No strict limit (recommended 1000-2000 characters)  
**Format**: Plain text with limited formatting

**Recommended Detailed Description:**

```
Key Vault Extension - Your Secure, Offline Credential Manager

KEY FEATURES:
✓ Complete Privacy - All data stored locally on your device
✓ End-to-End Encryption - Military-grade cryptography protects your credentials
✓ Zero Knowledge - We never see your passwords or master key
✓ Open Source - Transparent code you can audit
✓ Offline First - No internet required, no data transmitted
✓ Modern Security - Argon2id + XChaCha20-Poly1305 encryption

SECURITY FIRST:
- Argon2id password-based key derivation (memory and CPU intensive)
- XChaCha20-Poly1305 authenticated encryption for all credentials
- libsodium cryptographic library (industry standard)
- No backdoors, no password recovery, no external access
- Your master password is your only key - keep it safe!

HOW IT WORKS:
1. Create a strong master password
2. Your credentials are encrypted with your master password
3. All data stays on your device in IndexedDB
4. No servers, no cloud, no data transmission
5. You control your data completely

PRIVACY GUARANTEE:
- No data collection or analytics
- No tracking or telemetry
- No external server connections
- No third-party services
- Your credentials never leave your device

PERMISSIONS EXPLAINED:
- Storage: Save encrypted credentials locally in Chrome storage
- Unlimited Storage: Store large credential databases without quota limits
- No host permissions: We don't access any websites

PERFECT FOR:
- Security-conscious users who value privacy
- Those who want complete control over their credentials
- Users seeking offline-first password management
- Developers and IT professionals who audit their tools
- Anyone who wants transparent, open-source security

TECHNICAL DETAILS:
- Built with React 19 + TypeScript
- Manifest V3 compliant
- Modern service worker architecture
- Tailwind CSS for clean UI
- Dexie.js for IndexedDB management
- Thoroughly tested with Jest

WHY CHOOSE KEY VAULT:
✓ Open Source - Review our code on GitHub
✓ No Subscription - Completely free forever
✓ No Vendor Lock-in - Export your data anytime
✓ Privacy by Design - Data stays local always
✓ Active Development - Community-driven improvements

IMPORTANT:
⚠️ Remember your master password - it cannot be recovered
⚠️ Back up your credentials regularly using export feature
⚠️ Keep your device and Chrome browser updated

SUPPORT:
- Report issues: GitHub Issues
- Source code: github.com/EdoAbarca/key-vault-extension
- Privacy Policy: See our GitHub repository
- Community: Join discussions on GitHub

Get complete peace of mind knowing your credentials are protected by the same cryptography used by security professionals worldwide.

Download Key Vault Extension today - Your privacy is our priority.
```

### Category
**Primary Category**: Productivity  
**Alternative**: Developer Tools (if productivity doesn't fit)

### Language
**Primary**: English (US)  
**Additional**: Add more languages as needed

## Icons and Images

### App Icon Requirements

**Size**: 128x128 pixels  
**Format**: PNG with transparency  
**Current Status**: Icon files exist in `public/` directory

**Icon Checklist:**
- [ ] icon-16.png (16x16) - Browser UI
- [ ] icon-48.png (48x48) - Extensions page
- [ ] icon-128.png (128x128) - Chrome Web Store and detailed view

**Icon Design Guidelines:**
- Use simple, recognizable design
- Ensure icon is clear at all sizes
- Use high contrast for visibility
- Avoid text (especially small text)
- Make it unique and memorable
- Consider color psychology (blue = trust, green = security)

**Current Icons:**
The extension currently has placeholder icons. Consider creating professional icons:
- Key/lock symbol for security
- Vault/safe imagery
- Shield for protection
- Modern, minimalist design

**Icon Tools:**
- Figma (free, browser-based)
- Inkscape (free, vector graphics)
- GIMP (free, raster graphics)
- Adobe Illustrator (paid)
- Canva (free tier available)

## Screenshots

### Screenshot Requirements

**Mandatory**: At least 1 screenshot  
**Recommended**: 3-5 screenshots  
**Size**: 1280x800 or 640x400 pixels  
**Format**: PNG or JPEG  
**Aspect Ratio**: 16:10 preferred

### Screenshot Guidelines

1. **Show Key Features**:
   - Main interface/popup view
   - Credential storage list
   - Add credential form
   - Security/encryption features
   - Settings or configuration

2. **Quality Standards**:
   - High resolution, crisp text
   - No placeholder content
   - Actual extension UI (not mockups)
   - Clear, readable text
   - Professional appearance

3. **Composition**:
   - Center important UI elements
   - Use consistent browser chrome (if showing)
   - Annotate key features (optional)
   - Show real-world use cases
   - Keep consistent styling

### Recommended Screenshots

**Screenshot 1: Main Popup Interface**
- Show the extension popup opened
- Display credential list (sample data)
- Highlight search/filter functionality
- Caption: "Secure credential management at your fingertips"

**Screenshot 2: Adding a Credential**
- Form for adding new credential
- Show fields (title, username, password, etc.)
- Highlight encryption indicator
- Caption: "Add credentials with military-grade encryption"

**Screenshot 3: Master Password Setup**
- Initial setup screen
- Master password creation flow
- Security strength indicator
- Caption: "Create your master password - your only key"

**Screenshot 4: Security Features**
- Highlight encryption algorithms
- Show privacy features
- Display "zero knowledge" benefits
- Caption: "Industry-standard cryptography protects your data"

**Screenshot 5: Settings/Options**
- Configuration options
- Export/import features
- Security settings
- Caption: "Complete control over your credentials"

### How to Capture Screenshots

1. **Load the extension** in Chrome (dev mode)
2. **Open the popup** and navigate to the screen
3. **Capture screenshot**:
   - Full window: Press F12 → three dots → Screenshot → Capture screenshot
   - Extension popup: Right-click popup → Inspect → Capture screenshot
   - Or use screenshot tools: Snipping Tool, Lightshot, etc.
4. **Edit if needed**:
   - Crop to 1280x800 or 640x400
   - Add annotations (optional)
   - Ensure clarity and quality
5. **Save as PNG** for best quality

### Screenshot Tips

- Use sample/demo data (not real credentials!)
- Ensure text is readable
- Show the extension in action
- Highlight unique features
- Make it visually appealing
- Keep consistent theme/styling
- Test how it looks in store listing

## Promotional Images

### Small Tile (Required)
**Size**: 440x280 pixels  
**Format**: PNG or JPEG  
**Purpose**: Used in store promotions and collections

**Content Ideas:**
- Extension icon + name
- Key benefit text ("Secure Offline Credentials")
- Simple, clean design
- Brand colors

### Large Tile (Optional but Recommended)
**Size**: 920x680 pixels  
**Format**: PNG or JPEG  
**Purpose**: Featured listings and promotions

**Content Ideas:**
- Extension logo/icon (larger)
- Tagline: "Military-Grade Encryption"
- Key features list (3-4 bullets)
- Professional graphic design

### Marquee (Optional)
**Size**: 1400x560 pixels  
**Format**: PNG or JPEG  
**Purpose**: Chrome Web Store homepage features

**Content Ideas:**
- Hero image with extension branding
- Compelling headline
- Feature highlights
- Call to action
- High-quality graphics

### Promotional Image Guidelines

1. **Branding**:
   - Consistent with extension icon
   - Professional appearance
   - Clear, readable text
   - High contrast

2. **Content**:
   - Focus on key benefit
   - Minimal text (quick to read)
   - Visual hierarchy
   - Professional typography

3. **Technical**:
   - High resolution (no pixelation)
   - Proper dimensions (exact pixels)
   - Optimized file size
   - PNG for transparency, JPEG for photos

4. **Design Tools**:
   - Canva (templates available)
   - Figma (professional design)
   - Adobe Photoshop/Illustrator
   - GIMP (free alternative)

## Store Listing Checklist

### Required Items
- [ ] Extension title (45 chars max)
- [ ] Short description (132 chars max)
- [ ] Detailed description (1000+ chars)
- [ ] App icon 128x128 PNG
- [ ] At least 1 screenshot (1280x800)
- [ ] Small promo tile (440x280)
- [ ] Category selection
- [ ] Privacy policy URL
- [ ] Primary language

### Recommended Items
- [ ] 3-5 quality screenshots
- [ ] Large promo tile (920x680)
- [ ] Publisher verification
- [ ] Support/contact email
- [ ] Website URL (GitHub)
- [ ] Multiple language support

### Optional Items
- [ ] Marquee promotional tile (1400x560)
- [ ] Video demo (YouTube URL)
- [ ] Additional languages
- [ ] Regions/countries targeting

### Quality Checks
- [ ] All text proofread for typos
- [ ] Screenshots show actual extension
- [ ] Icons are high quality and clear
- [ ] Descriptions are accurate
- [ ] No exaggerated or false claims
- [ ] Permissions are justified
- [ ] Privacy policy is accurate
- [ ] All images are proper dimensions
- [ ] Professional appearance overall
- [ ] Consistent branding throughout

## Writing Best Practices

### Do's
✓ Be clear and concise  
✓ Highlight unique features  
✓ Explain security benefits  
✓ Use bullet points for readability  
✓ Include relevant keywords naturally  
✓ Be honest about capabilities  
✓ Mention open source (builds trust)  
✓ Explain permissions clearly  
✓ Use professional language  
✓ Focus on user benefits

### Don'ts
✗ Use excessive exclamation marks!!!  
✗ Make exaggerated claims  
✗ Use all caps for emphasis  
✗ Include contact info in description (use proper fields)  
✗ Copy competitors' descriptions  
✗ Use misleading keywords  
✗ Mention competitors by name  
✗ Include promotional pricing  
✗ Use poor grammar or spelling  
✗ Add unrelated keywords

## SEO and Discoverability

### Keywords to Include
- Password manager
- Credential manager
- Secure vault
- Encryption
- Privacy
- Offline password manager
- Open source password vault
- Local credential storage
- Zero knowledge
- Argon2id
- XChaCha20-Poly1305 (for technical users)

### Use Keywords Naturally
- In extension name (if space)
- In short description
- Throughout detailed description
- In feature lists
- In context, not keyword stuffing

## Localization (Optional)

### Consider Translating
- Extension name (if appropriate)
- Short description
- Detailed description
- Screenshot captions

### Popular Languages
1. Spanish (es)
2. French (fr)
3. German (de)
4. Portuguese (pt-BR)
5. Japanese (ja)
6. Chinese Simplified (zh-CN)
7. Russian (ru)
8. Italian (it)

### Translation Tips
- Use professional translators or services
- Native speakers are best
- Test UI in target languages
- Ensure text fits in UI elements
- Consider cultural context

## Preview Your Listing

Before submitting:

1. **Review all text** for accuracy and professionalism
2. **Check all images** display correctly
3. **Preview in store** (if possible during submission)
4. **Get feedback** from team members
5. **Compare with similar extensions** for quality
6. **Verify all links work** (privacy policy, support, etc.)
7. **Test on mobile** (Chrome Web Store is accessible on mobile)

## Next Steps

After preparing your store listing:

1. Review [CHROME_WEB_STORE_SUBMISSION.md](./CHROME_WEB_STORE_SUBMISSION.md) for submission process
2. Prepare your extension package (.zip file)
3. Have privacy policy and terms accessible
4. Complete the submission form in Developer Dashboard

---

**Time Required**: 2-4 hours for quality listing preparation

**Remember**: Your store listing is often the first impression. Invest time in making it professional, accurate, and compelling!
