import { readFileSync } from 'fs';
import { join } from 'path';

describe('Vite Configuration', () => {
  it('should have vite.config.ts with proper HMR settings', () => {
    const viteConfigPath = join(__dirname, '..', 'vite.config.ts');
    const viteConfig = readFileSync(viteConfigPath, 'utf-8');

    // Check for React plugin
    expect(viteConfig).toContain("react()");

    // Check for server configuration
    expect(viteConfig).toContain('server:');

    // Check for HMR configuration
    expect(viteConfig).toContain('hmr:');
    expect(viteConfig).toContain('overlay: true');

    // Check for sourcemap in build
    expect(viteConfig).toContain('sourcemap: true');
  });

  it('should have @vitejs/plugin-react in package.json', () => {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react');
  });

  it('should have dev script configured', () => {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts.dev).toBe('vite');
  });

  it('should have React Fast Refresh ESLint plugin configured', () => {
    const eslintConfigPath = join(__dirname, '..', 'eslint.config.js');
    const eslintConfig = readFileSync(eslintConfigPath, 'utf-8');

    // Check for React Refresh plugin
    expect(eslintConfig).toContain('eslint-plugin-react-refresh');
    expect(eslintConfig).toContain('reactRefresh.configs.vite');
  });
});

describe('TypeScript Configuration', () => {
  it('should have proper JSX configuration for React', () => {
    const tsconfigAppPath = join(__dirname, '..', 'tsconfig.app.json');
    const tsconfigAppContent = readFileSync(tsconfigAppPath, 'utf-8');

    // Check for jsx setting (handle JSON with comments)
    expect(tsconfigAppContent).toContain('"jsx": "react-jsx"');
  });

  it('should have vite/client types configured', () => {
    const tsconfigAppPath = join(__dirname, '..', 'tsconfig.app.json');
    const tsconfigAppContent = readFileSync(tsconfigAppPath, 'utf-8');

    // Check for vite/client in types array (handle JSON with comments)
    expect(tsconfigAppContent).toContain('vite/client');
  });
});

describe('Hot Reload Development Workflow', () => {
  it('should have development workflow documentation', () => {
    const docPath = join(__dirname, '..', 'docs', 'DEVELOPMENT_WORKFLOW.md');
    const doc = readFileSync(docPath, 'utf-8');

    // Check for key sections
    expect(doc).toContain('Hot Module Replacement');
    expect(doc).toContain('React Fast Refresh');
    expect(doc).toContain('npm run dev');
    expect(doc).toContain('Troubleshooting');
  });
});
