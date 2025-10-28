# TypeScript Configuration Guide

## Overview
This project uses TypeScript with strict type checking to ensure type safety and catch errors during development rather than at runtime. The configuration is designed to work seamlessly with React, Vite, Chrome Extension APIs, and modern JavaScript features.

## Configuration Files

### Main Configuration Files

#### `tsconfig.json` (Root Configuration)
The root configuration file uses project references to organize TypeScript compilation:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.test.json" }
  ]
}
```

This setup enables:
- Separate compilation for different parts of the project
- Faster incremental builds
- Better IDE performance
- Clear separation of concerns

#### `tsconfig.app.json` (Application Code)
Configuration for the main application source code in `src/`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client", "chrome"],
    
    /* Strict Type Checking */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    
    /* Bundler Mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/setupTests.ts"]
}
```

**Key Features:**
- **Strict Mode**: Enables all strict type checking options
- **Chrome Types**: Includes `@types/chrome` for Chrome Extension API types
- **Vite Types**: Includes `vite/client` for Vite-specific types and HMR
- **React JSX**: Uses modern `react-jsx` transform (no need to import React)
- **Modern ES**: Targets ES2022 with latest JavaScript features

#### `tsconfig.node.json` (Build Tools)
Configuration for Node.js build tools like `vite.config.ts`:
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    
    /* Strict Type Checking */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

#### `tsconfig.test.json` (Test Files)
Configuration for test files with Jest:
```json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "types": ["vite/client", "chrome", "jest", "node"]
  },
  "include": [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/setupTests.ts"
  ]
}
```

## TypeScript Strict Mode

### What is Strict Mode?
Strict mode enables a comprehensive set of type checking options that catch common errors:

- ✅ **`strict: true`** - Enables all strict family options:
  - `strictNullChecks` - null/undefined must be explicitly handled
  - `strictFunctionTypes` - Function parameter checking is contravariant
  - `strictBindCallApply` - Check that bind/call/apply methods have correct arguments
  - `strictPropertyInitialization` - Class properties must be initialized
  - `noImplicitThis` - Raise error on 'this' expressions with implied 'any' type
  - `alwaysStrict` - Parse in strict mode and emit "use strict"
  - `useUnknownInCatchVariables` - Catch clause variables are 'unknown' instead of 'any'

### Additional Strict Checks
Beyond the standard strict mode, we enable:

- ✅ **`noUnusedLocals`** - Report errors on unused local variables
- ✅ **`noUnusedParameters`** - Report errors on unused function parameters
- ✅ **`noFallthroughCasesInSwitch`** - Report errors for fallthrough cases in switch
- ✅ **`noUncheckedSideEffectImports`** - Check side effect imports are used
- ✅ **`erasableSyntaxOnly`** - Ensure emitted JavaScript is safe

## Chrome Extension API Types

### Installing Types
The `@types/chrome` package provides TypeScript definitions for all Chrome Extension APIs:

```bash
npm install --save @types/chrome
```

### Usage in Source Code
Include the reference directive at the top of files using Chrome APIs:

```typescript
/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
  console.log('Extension installed:', details);
});

chrome.runtime.onMessage.addListener((
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
) => {
  // Handle message
  sendResponse({ status: 'ok' });
  return true;
});
```

### Available Chrome API Namespaces
- `chrome.runtime` - Extension lifecycle and messaging
- `chrome.storage` - Data persistence
- `chrome.tabs` - Tab management
- `chrome.windows` - Window management
- `chrome.action` - Extension popup and badge
- And many more...

## IDE Integration

### Visual Studio Code
VSCode provides excellent TypeScript support out of the box:

1. **IntelliSense**: Auto-completion for all types and APIs
2. **Error Detection**: Red squiggles for type errors
3. **Quick Fixes**: Automatic fixes for common issues
4. **Go to Definition**: Navigate to type definitions with F12
5. **Rename Symbol**: Safely rename across the project

**Recommended Extensions:**
- ESLint - JavaScript/TypeScript linting
- Prettier - Code formatting
- TypeScript Importer - Auto-import TypeScript definitions

### WebStorm
WebStorm has built-in TypeScript support:

1. Navigate to `Preferences > Languages & Frameworks > TypeScript`
2. Enable "TypeScript Language Service"
3. Set TypeScript version to "Use project TypeScript"

### Other Editors
Most modern editors support TypeScript through Language Server Protocol (LSP):
- Vim/Neovim: Use `coc-tsserver` or `nvim-lspconfig`
- Sublime Text: Use LSP-typescript
- Atom: Use atom-typescript

## Build Process Integration

### Type Checking in Build
The build script includes TypeScript compilation:

```json
{
  "scripts": {
    "build": "tsc -b && vite build"
  }
}
```

**Build Process:**
1. `tsc -b` - TypeScript compiler checks all code for errors
2. If type checking passes, Vite bundles the application
3. If type checking fails, build stops with error messages

### Type Checking Without Build
For faster type checking during development:

```bash
npm run type-check
```

This runs `tsc -b --noEmit` which checks types without emitting JavaScript files.

## Pre-commit Hooks

### Git Hooks with Husky
Pre-commit hooks automatically run type checking before each commit:

```bash
# .husky/pre-commit
npx lint-staged
```

### Lint-Staged Configuration
In `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix"
    ]
  }
}
```

**What happens on commit:**
1. Husky intercepts the git commit
2. lint-staged identifies staged TypeScript files
3. ESLint runs and auto-fixes issues (includes TypeScript type checking via typescript-eslint)
4. If checks pass, commit proceeds
5. If checks fail, commit is blocked with error messages

**Note:** ESLint with typescript-eslint performs comprehensive type checking on staged files, including all the strict type checking rules configured in `eslint.config.js`. This provides both linting and type safety in a single fast check.

### Setup Pre-commit Hooks
Pre-commit hooks are automatically installed when you run:

```bash
npm install
```

The `prepare` script in package.json runs `husky` which sets up the git hooks.

## ESLint Integration

### TypeScript ESLint
The project uses `typescript-eslint` for TypeScript-specific linting rules:

```javascript
// eslint.config.js
export default defineConfig([
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json', './tsconfig.test.json'],
      },
    },
  },
])
```

### Key ESLint Rules for TypeScript

**Type Safety Rules:**
- `@typescript-eslint/no-explicit-any` - Disallow 'any' type
- `@typescript-eslint/no-unsafe-assignment` - Prevent unsafe assignments
- `@typescript-eslint/no-unsafe-call` - Prevent unsafe function calls
- `@typescript-eslint/no-unsafe-member-access` - Prevent unsafe property access
- `@typescript-eslint/no-floating-promises` - Require promise handling
- `@typescript-eslint/await-thenable` - Disallow awaiting non-thenable values

**Best Practices:**
- `@typescript-eslint/no-unused-vars` - Report unused variables
- `@typescript-eslint/consistent-type-imports` - Use consistent import syntax
- `@typescript-eslint/explicit-function-return-type` - Require return types

**Note:** Test files have relaxed rules for pragmatic testing:
```javascript
{
  files: ['**/*.test.{ts,tsx}', '**/setupTests.ts'],
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
  },
}
```

## Common TypeScript Patterns

### Null Safety
Always handle null/undefined explicitly:

```typescript
// ❌ Bad - will error with strictNullChecks
const element = document.getElementById('root');
element.innerHTML = 'Hello';

// ✅ Good - explicit null check
const element = document.getElementById('root');
if (!element) {
  throw new Error('Root element not found');
}
element.innerHTML = 'Hello';

// ✅ Good - optional chaining
element?.addEventListener('click', handler);
```

### Function Return Types
Always specify return types for clarity:

```typescript
// ✅ Explicit return type
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Async function
async function fetchData(url: string): Promise<Data> {
  const response = await fetch(url);
  return response.json();
}
```

### Type Guards
Use type guards for narrowing types:

```typescript
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

try {
  // ...
} catch (error) {
  if (isError(error)) {
    console.error(error.message); // TypeScript knows error is Error
  }
}
```

### Chrome API Types
Always type Chrome API callbacks:

```typescript
chrome.tabs.query(
  { active: true },
  (tabs: chrome.tabs.Tab[]) => {
    const activeTab = tabs[0];
    if (activeTab.id) {
      chrome.tabs.sendMessage(activeTab.id, message);
    }
  }
);
```

## Troubleshooting

### Issue: "Cannot find module 'chrome'"
**Solution:** Install Chrome types:
```bash
npm install --save-dev @types/chrome
```

### Issue: "Type 'null' is not assignable to type"
**Solution:** Add null check or use optional chaining:
```typescript
// Before
const value = element.value;

// After
const value = element?.value ?? '';
```

### Issue: ESLint shows "Parsing error" for TypeScript files
**Solution:** Ensure tsconfig files are referenced in `eslint.config.js`:
```javascript
parserOptions: {
  project: ['./tsconfig.app.json', './tsconfig.node.json', './tsconfig.test.json'],
}
```

### Issue: Slow Type Checking
**Solutions:**
1. Use `tsc-files` for pre-commit checks (only checks staged files)
2. Use project references (already configured)
3. Enable `skipLibCheck: true` in tsconfig (already enabled)
4. Use `incremental: true` for faster rebuilds

### Issue: IDE not showing type errors
**Solutions:**
1. Restart TypeScript server (VS Code: Cmd/Ctrl + Shift + P → "Restart TS Server")
2. Check TypeScript version matches project (VS Code: click version in status bar)
3. Ensure workspace is using workspace TypeScript, not global version

## Testing with TypeScript

### Jest Configuration
Jest is configured to work with TypeScript via `ts-jest`:

```javascript
// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
      },
    }],
  },
};
```

### Writing Typed Tests
Always type your test data and mocks:

```typescript
describe('Component', () => {
  it('should render correctly', () => {
    const mockData: Props = {
      title: 'Test',
      count: 42,
    };
    
    render(<Component {...mockData} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Best Practices

### 1. Enable Strict Mode Always
Never disable strict mode in production code. It catches bugs early.

### 2. Avoid 'any' Type
Use `unknown` instead of `any` when type is truly unknown:
```typescript
// ❌ Bad
function process(data: any) { }

// ✅ Good
function process(data: unknown) {
  if (typeof data === 'string') {
    // Type narrowed to string
  }
}
```

### 3. Use Type Inference
Let TypeScript infer types when possible:
```typescript
// ✅ Good - type inferred
const count = 42;

// ❌ Unnecessary - type is obvious
const count: number = 42;
```

### 4. Define Interfaces for Objects
Create interfaces for complex objects:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return `Hello, ${user.name}!`;
}
```

### 5. Use Readonly for Immutability
Mark properties readonly when they shouldn't change:
```typescript
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}
```

## Resources

### Official Documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Chrome Extension Types](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/chrome)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play) - Try TypeScript online
- [TS Config Explorer](https://www.typescriptlang.org/tsconfig) - Explore compiler options
- [TypeScript ESLint](https://typescript-eslint.io/) - ESLint for TypeScript

### Community
- [TypeScript GitHub](https://github.com/microsoft/TypeScript)
- [TypeScript Discord](https://discord.gg/typescript)
- [r/typescript](https://www.reddit.com/r/typescript/)

## Summary

This project uses a comprehensive TypeScript configuration with:
- ✅ **Strict Mode Enabled** - Maximum type safety
- ✅ **Chrome Extension Types** - Full API type coverage
- ✅ **IDE Integration** - IntelliSense and error detection
- ✅ **Build Integration** - Type checking in build process
- ✅ **Pre-commit Hooks** - Automatic type checking before commits
- ✅ **ESLint Integration** - TypeScript-aware linting
- ✅ **Test Support** - TypeScript with Jest

This setup ensures type safety throughout the development process, catching errors early and providing excellent developer experience.
