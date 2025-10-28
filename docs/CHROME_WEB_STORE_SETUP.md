# Chrome Web Store Developer Account Setup

This guide walks you through setting up a Chrome Web Store developer account for publishing the Key Vault Extension.

## Prerequisites

- Google account (Gmail or Google Workspace)
- $5 USD one-time registration fee
- Valid payment method (credit card or debit card)
- Valid identification (for verification purposes)

## Step 1: Register as a Chrome Web Store Developer

### 1.1 Access the Developer Dashboard

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Accept the Chrome Web Store Developer Agreement

### 1.2 Pay Registration Fee

1. Click on "Pay registration fee" or similar prompt
2. Enter your payment information
3. Pay the $5 USD one-time fee
4. Wait for payment confirmation (usually instant)

**Important Notes:**
- This is a one-time fee (not recurring)
- The fee is non-refundable
- You can publish unlimited extensions with one account
- Fee may vary by region (check current pricing)

### 1.3 Complete Developer Profile

1. Set up your developer account:
   - **Publisher name**: Choose a professional name (e.g., "Key Vault Team", your name, or organization)
   - **Publisher email**: Contact email visible to users
   - **Publisher website**: Optional but recommended (GitHub repository URL works)
2. Verify your email address if prompted
3. Save your profile information

## Step 2: Publisher Verification (Optional but Recommended)

### 2.1 Why Verify?

Verified publishers get:
- Green "Verified Publisher" badge
- Increased user trust
- Better visibility in search
- Reduced security warnings

### 2.2 Verification Process

1. In the Developer Dashboard, click "Verify Publisher"
2. Choose verification method:
   - **Domain verification**: Own a website domain
   - **Google Play verification**: Link to Google Play developer account
3. Follow verification instructions:
   - For domain: Add DNS TXT record or upload HTML file
   - For Google Play: Link your accounts
4. Wait for verification (usually 24-48 hours)

### 2.3 Domain Verification Steps

If verifying with a domain:

1. **Get verification code** from Chrome Web Store Dashboard
2. **Choose method**:
   - DNS TXT record (recommended)
   - HTML file upload
   - Meta tag in homepage
3. **Add verification**:
   - DNS: Add TXT record with code to your domain's DNS settings
   - HTML: Upload provided file to domain root
   - Meta: Add meta tag to homepage HTML
4. **Verify**: Click "Verify" in dashboard
5. **Wait**: Verification takes up to 48 hours

## Step 3: Set Up Two-Factor Authentication (Recommended)

Protect your developer account:

1. Go to your [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"
3. Choose verification methods:
   - Authenticator app (recommended)
   - SMS/Phone call
   - Security key
4. Save backup codes

**Why 2FA?**
- Prevents unauthorized access to your developer account
- Protects your published extensions from hijacking
- Required by some organizations
- Chrome may require it in the future

## Step 4: Create a Brand Account (Optional)

For team publishing or organizational identity:

### 4.1 When to Use Brand Accounts

Use a Brand Account if:
- Publishing for an organization
- Multiple team members need access
- Want separation from personal Google account
- Building a brand identity

### 4.2 Create Brand Account

1. Go to [Brand Accounts](https://myaccount.google.com/brandaccounts)
2. Create new brand account:
   - Choose account name
   - Set up profile
3. Add managers/owners (team members)
4. Use Brand Account to register for Chrome Web Store

## Step 5: Prepare for Publishing

### 5.1 Required Materials Checklist

Before publishing, prepare:

- [ ] Extension ZIP file (production build)
- [ ] Store listing title (max 45 characters)
- [ ] Store description (max 132 characters summary)
- [ ] Detailed description (formatted with features, security info)
- [ ] Extension icons (128x128 PNG)
- [ ] Screenshots (1280x800 or 640x400 PNG/JPEG)
- [ ] Promotional images:
  - Small promo tile: 440x280 PNG
  - Large promo tile: 920x680 PNG (optional)
  - Marquee promo tile: 1400x560 PNG (optional)
- [ ] Privacy policy URL (can be GitHub file)
- [ ] Support/contact information
- [ ] Category selection
- [ ] Language/region settings

### 5.2 Documentation Links

Have these ready:
- Privacy Policy: Link to PRIVACY_POLICY.md in GitHub
- Terms of Service: Link to TERMS_OF_SERVICE.md in GitHub
- Source code repository: GitHub URL (for transparency)
- Support/issues: GitHub Issues URL

### 5.3 Review Chrome Web Store Policies

Read and understand:
- [Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq/)
- [Content Policies](https://developer.chrome.com/docs/webstore/program-policies/listing-requirements/)
- [Branding Guidelines](https://developer.chrome.com/docs/webstore/branding/)

## Step 6: Understand Review Process

### 6.1 Review Timeline

- **Initial submission**: 1-3 business days (can be longer)
- **Updates**: Usually faster, but can take 1-3 days
- **Policy violations**: May require revision and resubmission

### 6.2 What Google Reviews

- Manifest permissions justification
- Privacy policy compliance
- Code quality and security
- Store listing accuracy
- Prohibited content/functionality
- Trademark/copyright issues

### 6.3 Common Rejection Reasons

Avoid these:
- Missing or inadequate privacy policy
- Excessive permissions without justification
- Misleading store listing or screenshots
- Security vulnerabilities
- Obfuscated code (without justification)
- Trademark/copyright infringement
- Policy violations

## Step 7: Set Up Payment Account (If Monetizing)

If you plan to sell the extension (Key Vault Extension is free):

1. Set up Google Payments merchant account
2. Provide tax information
3. Choose pricing model
4. Set up payment processing

**Note**: Key Vault Extension is free and open source, so this step is not applicable.

## Step 8: Best Practices

### 8.1 Developer Account Security

- Use strong unique password
- Enable 2FA
- Don't share account credentials
- Review account activity regularly
- Use Brand Account for team collaboration

### 8.2 Publishing Preparation

- Test extension thoroughly before submission
- Have all assets ready before starting submission
- Write clear, accurate descriptions
- Follow all policies and guidelines
- Respond promptly to review feedback

### 8.3 Post-Publication

- Monitor reviews and ratings
- Respond to user feedback
- Keep extension updated
- Address security issues promptly
- Maintain privacy policy and terms

## Troubleshooting

### Can't Access Developer Dashboard

**Solutions:**
- Ensure you're signed into the correct Google account
- Clear browser cache and cookies
- Try incognito/private browsing
- Check if payment went through

### Payment Issues

**Solutions:**
- Use different payment method
- Check card has international transactions enabled
- Contact Google support if payment fails repeatedly
- Ensure sufficient funds

### Verification Delays

**Solutions:**
- Wait full 48 hours for domain verification
- Double-check DNS/HTML verification is correct
- Use Google Search Console to verify domain first
- Contact support if stuck

## Support Resources

### Official Resources
- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Developer Support](https://support.google.com/chrome_webstore/community)
- [Policy Updates](https://developer.chrome.com/docs/webstore/program-policies/)

### Community Resources
- Chrome Extensions Google Group
- Stack Overflow (chrome-extension tag)
- Reddit r/chrome_extensions

## Checklist

Before proceeding to publication:

- [ ] Google account created and verified
- [ ] $5 registration fee paid
- [ ] Developer profile completed
- [ ] Publisher name chosen (professional)
- [ ] Contact email set up
- [ ] 2FA enabled (recommended)
- [ ] Publisher verification started (optional)
- [ ] All publishing materials prepared
- [ ] Policies reviewed and understood
- [ ] Extension tested and ready

## Next Steps

After completing developer account setup:

1. Review [STORE_LISTING_GUIDE.md](./STORE_LISTING_GUIDE.md) for preparing your store listing
2. Check [CHROME_WEB_STORE_SUBMISSION.md](./CHROME_WEB_STORE_SUBMISSION.md) for the publication process
3. Ensure all assets and documentation are ready

---

**Estimated Time**: 30-60 minutes (plus verification wait time)

**Costs**: $5 USD one-time registration fee

**Ready to proceed?** Continue to the Store Listing Guide!
