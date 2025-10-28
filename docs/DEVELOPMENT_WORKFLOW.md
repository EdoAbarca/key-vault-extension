# Development Workflow Guide

## Overview
This guide explains how to use the React development environment with hot reload for efficient development of the Key Vault Extension.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Chrome browser for testing the extension

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The development server will start and build the extension in development mode. You'll see output indicating the server is ready:
```
VITE v7.1.12  ready in 497 ms

B R O W S E R
E X T E N S I O N
T O O L S

➜  CRXJS: Load dist as unpacked extension
```

### 3. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `dist` folder from your project directory
5. The extension is now loaded and ready for development!

## Hot Reload Features

### What is Hot Module Replacement (HMR)?
HMR allows you to see your changes instantly without manually reloading the extension. When you save changes to your React components, the extension automatically updates.

### How It Works
1. **React Fast Refresh**: Automatically enabled for all React components
   - Component state is preserved during updates
   - Only the changed component re-renders
   - Instant feedback in the browser

2. **TypeScript Compilation**: Changes to TypeScript files trigger automatic recompilation
   - Type errors appear in the terminal
   - Compilation errors show in the browser overlay

3. **CSS Hot Reload**: Tailwind CSS and other styles update instantly
   - No page refresh needed
   - Styles apply immediately

### Testing Hot Reload

1. Start the dev server: `npm run dev`
2. Load the extension in Chrome
3. Open the extension popup
4. Make a change to `src/App.tsx` (e.g., modify text or add a new element)
5. Save the file
6. The popup automatically updates with your changes!

## Development Scripts

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production version of the extension |
| `npm run lint` | Run ESLint to check code quality |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run preview` | Preview production build locally |

## Development Tips

### 1. Use React DevTools
Install React DevTools extension for Chrome to inspect component hierarchy and props.

### 2. Enable Source Maps
Source maps are automatically generated in development mode, making debugging easier.

### 3. Error Overlay
When errors occur, Vite displays an overlay with the error details. Fix the error and save to dismiss.

### 4. Console Logs
Background service worker logs appear in:
- Chrome DevTools → Extensions → Service Worker (inspect)
- Popup logs appear in the popup's DevTools console

### 5. State Persistence
React Fast Refresh preserves component state during hot reload, so you don't lose your work.

## Workflow Best Practices

### 1. Incremental Development
- Make small, focused changes
- Test each change immediately
- Use hot reload to verify changes quickly

### 2. Component-Driven Development
- Build components in isolation
- Test components independently
- Use hot reload to iterate quickly

### 3. TypeScript First
- Write TypeScript interfaces first
- Use type checking to catch errors early
- Let TypeScript guide your implementation

### 4. Test as You Go
- Run tests frequently: `npm run test:watch`
- Write tests alongside code
- Use hot reload for quick verification

## Troubleshooting

### Hot Reload Not Working?

1. **Check the dev server is running**
   ```bash
   npm run dev
   ```

2. **Verify the extension is loaded from the dist folder**
   - Go to `chrome://extensions/`
   - Check the extension path points to your `dist` folder

3. **Reload the extension manually**
   - Click the refresh icon on the extension card in Chrome
   - Try closing and reopening the popup

4. **Clear browser cache**
   - Sometimes cached files interfere with hot reload
   - Try hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### TypeScript Errors?

1. **Check terminal output**
   - TypeScript errors appear in the terminal running `npm run dev`
   - Fix errors and save to trigger recompilation

2. **Run type checking**
   ```bash
   npm run build
   ```
   This runs `tsc -b` to check all TypeScript files

### Build Errors?

1. **Clean and rebuild**
   ```bash
   rm -rf dist node_modules/.vite
   npm run dev
   ```

2. **Check dependencies**
   ```bash
   npm install
   ```

## Configuration Files

### vite.config.ts
- Configures Vite build tool
- Enables React plugin with Fast Refresh
- Configures HMR server settings
- Enables source maps for debugging

### tsconfig.json / tsconfig.app.json
- TypeScript compiler settings
- Strict type checking enabled
- JSX transform configured for React

### manifest.json
- Chrome extension configuration
- Defines extension capabilities
- Transformed by @crxjs/vite-plugin during build

## Advanced Features

### Custom HMR Boundaries
If needed, you can define custom HMR boundaries in your code:
```typescript
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Custom hot reload logic
  })
}
```

### Environment Variables
Create `.env` files for different environments:
- `.env.development` - Development variables
- `.env.production` - Production variables

Access in code: `import.meta.env.VITE_*`

## Next Steps

- Read [CHROME_EXTENSION_GUIDE.md](./CHROME_EXTENSION_GUIDE.md) for extension-specific development
- Check [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) for project architecture
- Explore the codebase starting with `src/App.tsx`

Happy coding! 🚀
