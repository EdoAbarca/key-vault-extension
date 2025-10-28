import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('TypeScript Configuration', () => {
  describe('Project References', () => {
    it('should have root tsconfig with project references', () => {
      const tsconfigPath = join(__dirname, '..', 'tsconfig.json');
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8')) as {
        references: { path: string }[];
      };

      expect(tsconfig.references).toBeDefined();
      expect(tsconfig.references).toHaveLength(3);
      expect(tsconfig.references).toEqual([
        { path: './tsconfig.app.json' },
        { path: './tsconfig.node.json' },
        { path: './tsconfig.test.json' },
      ]);
    });

    it('should have tsconfig.app.json with strict mode enabled', () => {
      const tsconfigPath = join(__dirname, '..', 'tsconfig.app.json');
      const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');

      expect(tsconfigContent).toContain('"strict": true');
      expect(tsconfigContent).toContain('"noUnusedLocals": true');
      expect(tsconfigContent).toContain('"noUnusedParameters": true');
      expect(tsconfigContent).toContain('"noFallthroughCasesInSwitch": true');
    });

    it('should have Chrome and Vite types configured', () => {
      const tsconfigPath = join(__dirname, '..', 'tsconfig.app.json');
      const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');

      expect(tsconfigContent).toContain('"vite/client"');
      expect(tsconfigContent).toContain('"chrome"');
    });

    it('should have tsconfig.test.json for test files', () => {
      const tsconfigPath = join(__dirname, '..', 'tsconfig.test.json');
      const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');

      expect(tsconfigContent).toContain('tsconfig.app.json');
      expect(tsconfigContent).toContain('"jest"');
      expect(tsconfigContent).toContain('"node"');
    });
  });

  describe('Package Scripts', () => {
    it('should have type-check script', () => {
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        scripts: Record<string, string>;
      };

      expect(packageJson.scripts).toHaveProperty('type-check');
      expect(packageJson.scripts['type-check']).toBe('tsc -b --noEmit');
    });

    it('should have build script with type checking', () => {
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        scripts: Record<string, string>;
      };

      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts.build).toContain('tsc -b');
    });
  });

  describe('Pre-commit Hooks', () => {
    it('should have husky prepare script', () => {
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        scripts: Record<string, string>;
      };

      expect(packageJson.scripts).toHaveProperty('prepare');
      expect(packageJson.scripts.prepare).toBe('husky');
    });

    it('should have lint-staged configuration', () => {
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        'lint-staged': Record<string, string[]>;
      };

      expect(packageJson['lint-staged']).toBeDefined();
      expect(packageJson['lint-staged']['*.{ts,tsx}']).toBeDefined();
      expect(packageJson['lint-staged']['*.{ts,tsx}']).toContain('eslint --fix');
    });

    it('should have pre-commit hook file', () => {
      const preCommitPath = join(__dirname, '..', '.husky', 'pre-commit');
      const preCommitContent = readFileSync(preCommitPath, 'utf-8');

      expect(preCommitContent).toContain('lint-staged');
    });
  });

  describe('ESLint Configuration', () => {
    it('should have TypeScript ESLint strict configuration', () => {
      const eslintConfigPath = join(__dirname, '..', 'eslint.config.js');
      const eslintConfig = readFileSync(eslintConfigPath, 'utf-8');

      expect(eslintConfig).toContain('tseslint.configs.strictTypeChecked');
      expect(eslintConfig).toContain('tseslint.configs.stylisticTypeChecked');
    });

    it('should reference all tsconfig files', () => {
      const eslintConfigPath = join(__dirname, '..', 'eslint.config.js');
      const eslintConfig = readFileSync(eslintConfigPath, 'utf-8');

      expect(eslintConfig).toContain('./tsconfig.app.json');
      expect(eslintConfig).toContain('./tsconfig.node.json');
      expect(eslintConfig).toContain('./tsconfig.test.json');
    });
  });

  describe('Dependencies', () => {
    it('should have @types/chrome installed', () => {
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        dependencies: Record<string, string>;
        devDependencies: Record<string, string>;
      };

      const hasChrome =
        packageJson.dependencies['@types/chrome'] ||
        packageJson.devDependencies['@types/chrome'];

      expect(hasChrome).toBeDefined();
    });

    it('should have husky and lint-staged installed', () => {
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        devDependencies: Record<string, string>;
      };

      expect(packageJson.devDependencies).toHaveProperty('husky');
      expect(packageJson.devDependencies).toHaveProperty('lint-staged');
    });

    it('should have typescript-eslint installed', () => {
      const packageJsonPath = join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        devDependencies: Record<string, string>;
      };

      expect(packageJson.devDependencies).toHaveProperty('typescript-eslint');
    });
  });

  describe('Documentation', () => {
    it('should have TypeScript configuration documentation', () => {
      const docPath = join(__dirname, '..', 'docs', 'TYPESCRIPT_CONFIGURATION.md');
      const doc = readFileSync(docPath, 'utf-8');

      expect(doc).toContain('# TypeScript Configuration Guide');
      expect(doc).toContain('## Configuration Files');
      expect(doc).toContain('## TypeScript Strict Mode');
      expect(doc).toContain('## Chrome Extension API Types');
      expect(doc).toContain('## IDE Integration');
      expect(doc).toContain('## Build Process Integration');
      expect(doc).toContain('## Pre-commit Hooks');
      expect(doc).toContain('## ESLint Integration');
    });

    it('should reference TypeScript documentation in README', () => {
      const readmePath = join(__dirname, '..', 'README.md');
      const readme = readFileSync(readmePath, 'utf-8');

      expect(readme).toContain('TYPESCRIPT_CONFIGURATION.md');
      expect(readme).toContain('TypeScript Configuration Guide');
    });
  });
});
