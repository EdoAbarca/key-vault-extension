import manifest from '../manifest.json';

describe('Manifest V3 Configuration', () => {
  it('should have manifest version 3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it('should have required metadata', () => {
    expect(manifest.name).toBe('Key Vault Extension');
    expect(manifest.description).toBeTruthy();
    expect(manifest.version).toBeTruthy();
  });

  it('should have proper action configuration', () => {
    expect(manifest.action).toBeDefined();
    expect(manifest.action.default_popup).toBe('index.html');
    expect(manifest.action.default_title).toBeTruthy();
  });

  it('should have all required icon sizes', () => {
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons['16']).toBeDefined();
    expect(manifest.icons['48']).toBeDefined();
    expect(manifest.icons['128']).toBeDefined();
  });

  it('should have action icons configured', () => {
    expect(manifest.action.default_icon).toBeDefined();
    expect(manifest.action.default_icon['16']).toBeDefined();
    expect(manifest.action.default_icon['48']).toBeDefined();
    expect(manifest.action.default_icon['128']).toBeDefined();
  });

  it('should have service worker configured', () => {
    expect(manifest.background).toBeDefined();
    expect(manifest.background.service_worker).toBe('src/background.ts');
    expect(manifest.background.type).toBe('module');
  });

  it('should have required permissions', () => {
    expect(manifest.permissions).toContain('storage');
    expect(manifest.permissions).toContain('unlimitedStorage');
  });

  it('should have host_permissions defined', () => {
    expect(manifest.host_permissions).toBeDefined();
    expect(Array.isArray(manifest.host_permissions)).toBe(true);
  });

  it('should have content security policy for WASM support', () => {
    expect(manifest.content_security_policy).toBeDefined();
    expect(manifest.content_security_policy.extension_pages).toContain('wasm-unsafe-eval');
  });
});
