# Chrome Web Store Submission Guide

This comprehensive guide walks you through the complete process of submitting the Key Vault Extension to the Chrome Web Store.

## Prerequisites

Before starting the submission process, ensure you have:

- [ ] Chrome Web Store developer account (see [CHROME_WEB_STORE_SETUP.md](./CHROME_WEB_STORE_SETUP.md))
- [ ] Production build of the extension (.zip file)
- [ ] All store listing materials prepared (see [STORE_LISTING_GUIDE.md](./STORE_LISTING_GUIDE.md))
- [ ] Privacy policy published and accessible via URL
- [ ] Terms of service published and accessible via URL
- [ ] Screenshots and promotional images ready
- [ ] Extension tested thoroughly

## Step 1: Prepare Extension Package

### 1.1 Build Production Version

```bash
cd key-vault-extension
npm install
npm run build
```

This creates the `dist/` directory with the production build.

### 1.2 Create ZIP Package

**Important**: Zip the contents of the `dist` folder, NOT the dist folder itself.

```bash
cd dist
zip -r ../key-vault-extension.zip .
cd ..
```

**On Windows** (PowerShell):
```powershell
cd dist
Compress-Archive -Path * -DestinationPath ../key-vault-extension.zip
cd ..
```

**On Windows** (File Explorer):
1. Open the `dist` folder
2. Select all files inside
3. Right-click → Send to → Compressed (zipped) folder
4. Name it `key-vault-extension.zip`
5. Move the zip file to the project root

### 1.3 Verify ZIP Package

Extract to a temporary location and verify:
- `manifest.json` is at the root level
- All assets are included (icons, HTML, JS, CSS)
- No unnecessary files (no source files, tests, or node_modules)
- File size is reasonable (< 50 MB)

**Required files in ZIP:**
```
manifest.json
index.html
service-worker-loader.js
icon-16.png
icon-48.png
icon-128.png
assets/
  ├── background.ts-[hash].js
  ├── popup-[hash].js
  └── popup-[hash].css
```

## Step 2: Access Developer Dashboard

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your developer account
3. Ensure you're signed in to the correct account (if you have multiple)

## Step 3: Create New Item

### 3.1 Start New Extension

1. Click **"New Item"** button in the dashboard
2. Click **"Choose file"** or drag and drop your ZIP file
3. Upload `key-vault-extension.zip`
4. Wait for upload to complete (progress bar)
5. Click **"Continue"** or proceed to next step

### 3.2 Initial Upload Review

Chrome automatically reviews your uploaded package for:
- Valid manifest.json
- Proper file structure
- Malware/security issues
- Basic policy compliance

**If upload fails:**
- Check ZIP structure (manifest.json at root)
- Verify manifest.json is valid JSON
- Ensure all referenced files exist
- Review error messages carefully

## Step 4: Fill Out Store Listing

### 4.1 Product Details Tab

#### Extension Name
- **Title**: Key Vault Extension
- **Character limit**: 45 characters
- **Tips**: Clear, descriptive, searchable

#### Short Description
- **Text**: "Secure offline credential manager with end-to-end encryption. Store passwords safely with Argon2id and XChaCha20-Poly1305."
- **Character limit**: 132 characters
- **Purpose**: Search results and browse pages

#### Detailed Description
- **Text**: Use the detailed description from [STORE_LISTING_GUIDE.md](./STORE_LISTING_GUIDE.md)
- **Format**: Plain text with line breaks
- **Tips**: 
  - Highlight key features first
  - Explain security benefits
  - Mention open source
  - Include technical details
  - List permissions and justifications

#### Category
- **Primary**: Productivity
- **Alternative**: Developer Tools

#### Language
- **Primary**: English (US)
- **Additional**: Add more as available

### 4.2 Graphic Assets Tab

#### App Icon (Required)
- **Upload**: 128x128 PNG icon
- **File**: Use `public/icon-128.png` or create professional icon
- **Tips**: Clear, recognizable, high quality

#### Screenshots (Required - Minimum 1)
- **Upload**: 3-5 screenshots
- **Size**: 1280x800 or 640x400 pixels
- **Format**: PNG or JPEG
- **Content**: 
  1. Main popup interface
  2. Adding credentials
  3. Security features
  4. Settings/options
  5. Master password setup

#### Small Promotional Tile (Required)
- **Upload**: 440x280 PNG/JPEG
- **Content**: Extension branding with key benefit

#### Large Promotional Tile (Optional but Recommended)
- **Upload**: 920x680 PNG/JPEG
- **Content**: Professional promotional graphic

#### Marquee Promotional Tile (Optional)
- **Upload**: 1400x560 PNG/JPEG
- **Content**: Hero image for featured listings

### 4.3 Additional Fields Tab

#### Official URL (Website)
- **URL**: https://github.com/EdoAbarca/key-vault-extension
- **Purpose**: Source code and project information

#### Support URL
- **URL**: https://github.com/EdoAbarca/key-vault-extension/issues
- **Purpose**: User support and bug reports

#### Privacy Policy (Required)
- **URL**: https://github.com/EdoAbarca/key-vault-extension/blob/main/PRIVACY_POLICY.md
- **Or**: Host on separate website
- **Must be accessible**: Publicly available URL

#### Terms of Service (Optional but Recommended)
- **URL**: https://github.com/EdoAbarca/key-vault-extension/blob/main/TERMS_OF_SERVICE.md
- **Or**: Host on separate website

#### Single Purpose (Required)
- **Text**: "Secure credential management with local encryption"
- **Character limit**: 180 characters
- **Purpose**: Describe the extension's primary function

#### Permission Justifications (Required for Requested Permissions)

For **Storage** permission:
```
This permission is used to store extension settings and encrypted credential data locally in Chrome's storage API. All data stays on the user's device and is never transmitted externally.
```

For **Unlimited Storage** permission:
```
This permission allows users to store large numbers of encrypted credentials without hitting Chrome's storage quota limits. As credentials are encrypted, they require more space than plain text. This ensures users can store as many credentials as needed.
```

**Why No Host Permissions:**
```
This extension does not request access to any websites or browsing data. All functionality is self-contained within the extension, ensuring maximum privacy and security.
```

## Step 5: Privacy Practices

### 5.1 Data Collection Questionnaire

Chrome Web Store requires you to disclose data collection practices:

#### Do you collect or use personal information?
- **Answer**: No
- **Reason**: All data is stored locally on the user's device

#### Does your extension use remote code?
- **Answer**: No
- **Reason**: All code is bundled in the extension package

#### Are you using third-party services?
- **Answer**: No (for third-party data collection)
- **Reason**: No analytics, tracking, or external services

#### Cryptography Declaration
- **Question**: Does your extension use cryptography?
- **Answer**: Yes
- **Purpose**: Local credential encryption
- **Libraries**: libsodium (sodium-plus), Argon2id, XChaCha20-Poly1305
- **Explanation**: "Uses libsodium for local credential encryption. All cryptographic operations are performed locally on the user's device."

### 5.2 Privacy Policy Link
- **Provide**: URL to PRIVACY_POLICY.md
- **Ensure**: Publicly accessible and up-to-date

## Step 6: Distribution Settings

### 6.1 Visibility

**Options:**
- **Public**: Anyone can find and install (recommended)
- **Unlisted**: Only those with direct link can install
- **Private**: Only specified Google accounts/groups

**Recommendation**: Public (for maximum reach)

### 6.2 Pricing

- **Free**: Yes (Key Vault Extension is free)
- **In-app purchases**: No
- **Ads**: No

### 6.3 Geographic Distribution

**Options:**
- All regions (recommended)
- Specific countries only

**Recommendation**: All regions (unless legal restrictions apply)

### 6.4 Platform Distribution

- **Chrome**: Yes (primary)
- **ChromeOS**: Yes
- **Windows**: Yes
- **Mac**: Yes
- **Linux**: Yes

## Step 7: Review and Submit

### 7.1 Preview Your Listing

1. Click **"Preview"** or **"View in store"** (if available)
2. Review how your listing appears to users
3. Check all text for typos and accuracy
4. Verify all images display correctly
5. Test all links (privacy policy, support, etc.)

### 7.2 Final Checklist

Before submitting, verify:

- [ ] Extension package is correct version
- [ ] All required fields completed
- [ ] Privacy policy is accessible
- [ ] Screenshots are high quality
- [ ] Description is accurate and compelling
- [ ] Permissions are justified
- [ ] Icon is professional quality
- [ ] No policy violations
- [ ] Extension has been thoroughly tested
- [ ] All links work correctly
- [ ] Terms of service is accessible

### 7.3 Submit for Review

1. Click **"Submit for Review"** or **"Publish"**
2. Confirm submission
3. Review submission confirmation

**You will see:**
- Submission confirmation message
- Estimated review timeline
- Status: "Pending Review"

## Step 8: Post-Submission

### 8.1 Review Timeline

- **Typical**: 1-3 business days
- **Can take longer**: During high volume periods
- **First submission**: May take longer than updates

### 8.2 Monitor Status

Check your Developer Dashboard regularly for:
- Review status updates
- Approval or rejection notifications
- Required changes or clarifications

### 8.3 Review Outcomes

#### If Approved
1. You'll receive approval notification via email
2. Extension goes live on Chrome Web Store
3. Users can find and install it
4. Monitor reviews and feedback

#### If Rejected
1. Review rejection reasons carefully
2. Common issues:
   - Privacy policy issues
   - Permission justifications insufficient
   - Store listing policy violations
   - Security concerns
   - Code quality issues
3. Address all feedback
4. Resubmit with fixes

## Step 9: After Publication

### 9.1 Verify Publication

1. Search for your extension in Chrome Web Store
2. Install and test the published version
3. Verify store listing appears correctly
4. Check all links work

### 9.2 Promote Your Extension

- Share link on GitHub README
- Announce on social media
- Update project documentation
- Notify existing users
- Write a blog post or announcement

### 9.3 Monitor and Maintain

**Regular Tasks:**
- Monitor user reviews and ratings
- Respond to user feedback
- Address reported issues
- Keep extension updated
- Maintain documentation
- Update privacy policy if needed

**Responding to Reviews:**
- Be professional and courteous
- Address legitimate concerns
- Thank users for positive feedback
- Provide support for issues
- Don't argue or be defensive

## Updating Your Extension

### When to Update
- Bug fixes
- Security patches
- New features
- Policy compliance changes
- Performance improvements

### Update Process

1. Make changes in your codebase
2. Test thoroughly
3. Update version number in manifest.json
4. Build production version: `npm run build`
5. Create new ZIP package
6. Go to Developer Dashboard
7. Click "Upload new version"
8. Upload new ZIP
9. Update store listing if needed
10. Submit for review

**Update Reviews:**
- Usually faster than initial review
- May require review for significant changes
- Minor updates might publish immediately

### Version Numbering

Use semantic versioning:
- **Major.Minor.Patch** (e.g., 1.0.0)
- **Major**: Breaking changes
- **Minor**: New features
- **Patch**: Bug fixes

Example progression:
- 0.0.1 → Initial release
- 0.1.0 → First feature update
- 0.1.1 → Bug fix
- 1.0.0 → First stable release

## Troubleshooting

### Common Submission Issues

#### "Manifest file is missing or invalid"
- **Fix**: Ensure manifest.json is at root of ZIP
- **Fix**: Validate JSON syntax

#### "Required field missing"
- **Fix**: Complete all required store listing fields
- **Fix**: Add privacy policy URL

#### "Privacy policy not accessible"
- **Fix**: Ensure privacy policy URL is publicly accessible
- **Fix**: Test URL in incognito browser

#### "Permission justification required"
- **Fix**: Provide clear justification for each permission
- **Fix**: Explain why permission is necessary

#### "Single purpose not clear"
- **Fix**: Clarify extension's primary function
- **Fix**: Ensure manifest matches description

#### "Misleading content"
- **Fix**: Ensure description accurately represents functionality
- **Fix**: Don't exaggerate capabilities
- **Fix**: Remove any misleading screenshots

### Getting Help

**Official Support:**
- [Chrome Web Store Help Center](https://support.google.com/chrome_webstore/)
- [Developer Support Forum](https://support.google.com/chrome_webstore/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/chrome-extension)

**Report Issues:**
- GitHub Issues: For extension-specific problems
- Developer Dashboard: For submission issues
- Google Support: For account or policy questions

## Best Practices

### Do's
✓ Test extension thoroughly before submission  
✓ Provide clear, accurate descriptions  
✓ Use high-quality images and screenshots  
✓ Respond promptly to review feedback  
✓ Keep privacy policy up-to-date  
✓ Monitor user reviews and address issues  
✓ Update extension regularly  
✓ Follow all Chrome Web Store policies

### Don'ts
✗ Submit untested extensions  
✗ Use misleading descriptions or images  
✗ Request unnecessary permissions  
✗ Ignore review feedback  
✗ Let privacy policy become outdated  
✗ Ignore user reports or reviews  
✗ Abandon the extension  
✗ Violate store policies

## Security Considerations

### Code Quality
- Remove debug code and console.logs
- Minify and optimize code
- Use content security policy
- Validate all inputs
- Handle errors gracefully

### Privacy
- Don't collect unnecessary data
- Be transparent about data usage
- Honor user privacy expectations
- Update privacy policy for any changes

### Permissions
- Request minimum necessary permissions
- Justify each permission clearly
- Remove unused permissions
- Don't request host_permissions unless needed

## Compliance Checklist

- [ ] Manifest V3 compliant
- [ ] Privacy policy published and accessible
- [ ] Terms of service available (recommended)
- [ ] All permissions justified
- [ ] No misleading content
- [ ] No copyright/trademark violations
- [ ] No prohibited content
- [ ] Accurate store listing
- [ ] High-quality assets
- [ ] Extension thoroughly tested
- [ ] Security best practices followed
- [ ] Code quality standards met

## Timeline Summary

| Phase | Time Required |
|-------|--------------|
| Prepare assets | 2-4 hours |
| Fill out listing | 1-2 hours |
| Initial review | 1-3 business days |
| Address feedback (if needed) | 1-2 hours |
| Resubmission review | 1-2 business days |
| **Total** | **3-7 business days** |

## Costs

- Developer account registration: $5 USD (one-time)
- Extension publishing: Free
- Updates: Free
- Total: **$5 USD one-time**

## Success Checklist

After successful publication:

- [ ] Extension is live on Chrome Web Store
- [ ] Store listing looks professional
- [ ] Installation works correctly
- [ ] All features function as expected
- [ ] Privacy policy is linked and accessible
- [ ] Support channels are set up
- [ ] Extension is promoted on GitHub
- [ ] Documentation is updated with store link
- [ ] Monitoring is in place for reviews/feedback

## Next Steps

After publication:
1. Update README.md with Chrome Web Store link
2. Add installation badge to repository
3. Monitor user feedback and reviews
4. Plan future updates and improvements
5. Engage with user community

---

**Congratulations!** You're ready to submit Key Vault Extension to the Chrome Web Store.

**Remember**: Quality over speed. Take time to prepare a professional submission that reflects well on your extension.

**Good luck with your submission! 🚀**
