# Deployment Fixes for Bolt.new

## Issues Fixed

### 1. **File Organization**
- **Problem**: Configuration data was mixed in wrong files
- **Fix**:
  - Separated mock data (INITIAL_USERS, INITIAL_CREWS, INITIAL_REQUESTS) to `src/data/mockData.js`
  - Kept only constants in `src/config/constants.js`
  - Kept Discord config in `src/config/discord.js`

### 2. **Import Paths**
- **Problem**: Components were importing from wrong locations
- **Fixed files**:
  - `src/App.jsx` - Updated to import mock data from `data/mockData.js` and Discord config from `config/discord.js`
  - `src/components/views/LoginScreen.jsx` - Import INITIAL_USERS from `data/mockData.js`
  - `src/utils/helpers.js` - Import Discord config from `config/discord.js`
  - `src/hooks/useDiscordAuth.js` - Import AUTH_ERRORS from `config/discord.js`

### 3. **Vite Configuration**
- **Problem**: Missing entry point configuration
- **Fix**: Moved `index.html` from `public/` to root directory (Vite convention)

### 4. **JSX File Extension**
- **Problem**: `src/index.js` contained JSX syntax but had `.js` extension
- **Fix**: Renamed to `src/index.jsx` and updated reference in `index.html`

### 5. **Build Entry Point**
- **Problem**: `index.html` didn't reference the main script
- **Fix**: Added `<script type="module" src="/src/index.jsx"></script>` to index.html

## Build Verification

✅ Build successful: `npm run build`
✅ Dev server working: `npm run dev`
✅ All imports resolved correctly
✅ No syntax errors

## Current Structure

```
onyxdispatch/
├── index.html              ← Moved from public/ (Vite entry point)
├── src/
│   ├── index.jsx          ← Renamed from index.js (contains JSX)
│   ├── App.jsx
│   ├── components/
│   ├── config/
│   │   ├── constants.js   ← Only contains constants now
│   │   └── discord.js     ← Discord-specific config
│   ├── data/
│   │   └── mockData.js    ← Mock users, crews, requests
│   ├── hooks/
│   ├── styles/
│   └── utils/
├── package.json
└── vite.config.js
```

## Deployment to Bolt.new

The project is now ready for Bolt.new deployment:

1. All imports are correctly resolved
2. Build process completes successfully
3. File structure follows Vite conventions
4. No syntax or configuration errors

Simply upload/sync the project to Bolt.new and it should deploy without the previous error.
