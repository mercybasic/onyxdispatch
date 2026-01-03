# Onyx Dispatch - Project Structure

This document describes the organized file structure after extracting components from the monolithic `dispatch-system.jsx` file.

## Directory Structure

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── CrewCard.jsx
│   │   ├── Modal.jsx
│   │   ├── RequestCard.jsx
│   │   ├── StatCard.jsx
│   │   └── Toast.jsx
│   ├── layout/              # Layout components
│   │   ├── Header.jsx
│   │   └── NavTabs.jsx
│   ├── modals/              # Modal dialog components
│   │   ├── AssignCrewModal.jsx
│   │   ├── ManageCrewModal.jsx
│   │   └── NewRequestModal.jsx
│   └── views/               # Main view/page components
│       ├── CrewsView.jsx
│       ├── Dashboard.jsx
│       ├── LandingPage.jsx
│       ├── LoginScreen.jsx
│       ├── PersonnelView.jsx
│       └── RequestsView.jsx
├── config/
│   └── constants.js         # App constants and configuration
├── hooks/
│   └── useDiscordAuth.js    # Discord OAuth authentication hook
├── styles/
│   └── main.css             # Global styles
├── utils/
│   └── helpers.js           # Utility functions
├── App.jsx                  # Main application component
└── index.js                 # Application entry point

public/
└── index.html               # HTML template
```

## File Descriptions

### Components

#### Common Components (`src/components/common/`)
- **Toast.jsx** - Notification toast component
- **Modal.jsx** - Reusable modal dialog wrapper
- **StatCard.jsx** - Statistics display card
- **RequestCard.jsx** - Service request card display
- **CrewCard.jsx** - Crew information card

#### Layout Components (`src/components/layout/`)
- **Header.jsx** - Application header with logo and user info
- **NavTabs.jsx** - Navigation tabs component

#### Modal Components (`src/components/modals/`)
- **NewRequestModal.jsx** - Modal for creating new service requests
- **AssignCrewModal.jsx** - Modal for assigning crews to requests
- **ManageCrewModal.jsx** - Modal for managing crew details

#### View Components (`src/components/views/`)
- **LandingPage.jsx** - Public-facing landing page for service requests
- **LoginScreen.jsx** - Authentication screen with Discord OAuth
- **Dashboard.jsx** - Main dashboard view
- **RequestsView.jsx** - Detailed requests management view
- **CrewsView.jsx** - Crew management view
- **PersonnelView.jsx** - Personnel overview (dispatcher only)

### Configuration & Utilities

#### Config (`src/config/`)
- **constants.js** - Application constants including:
  - INITIAL_USERS
  - INITIAL_CREWS
  - INITIAL_REQUESTS
  - SERVICE_TYPES
  - STATUS_COLORS
  - PRIORITY_COLORS
  - DISCORD_OAUTH_CONFIG
  - DISCORD_AUTH_CONFIG
  - AUTH_ERRORS

#### Hooks (`src/hooks/`)
- **useDiscordAuth.js** - Custom React hook for Discord OAuth authentication

#### Utils (`src/utils/`)
- **helpers.js** - Utility functions:
  - formatTime()
  - generateId()
  - generateOAuthState()
  - getDiscordOAuthUrl()
  - mockDiscordAuth()
  - determineUserRole()

#### Styles (`src/styles/`)
- **main.css** - All application styles including:
  - CSS variables for theming
  - Component styles
  - Animations
  - Responsive breakpoints

### Main Application Files

- **App.jsx** - Main application component (formerly DispatchSystem)
- **index.js** - React application entry point
- **public/index.html** - HTML template

## Import Paths

All imports follow these patterns:

### Components
```javascript
import ComponentName from '../common/ComponentName';
import ComponentName from '../layout/ComponentName';
import ComponentName from '../modals/ComponentName';
import ComponentName from '../views/ComponentName';
```

### Config & Utils (from components)
```javascript
import { CONSTANT_NAME } from '../../config/constants';
import { helperFunction } from '../../utils/helpers';
```

### From App.jsx
```javascript
import ComponentName from './components/category/ComponentName';
import { CONSTANT_NAME } from './config/constants';
import { helperFunction } from './utils/helpers';
import useCustomHook from './hooks/useCustomHook';
import './styles/main.css';
```

## Component Dependencies

### Dependency Graph

```
App.jsx
├── useDiscordAuth (hook)
├── Header
├── NavTabs
├── LandingPage
├── LoginScreen
├── Dashboard
│   ├── StatCard
│   └── RequestCard
├── RequestsView
│   ├── RequestCard
│   └── AssignCrewModal
│       └── CrewCard
├── CrewsView
│   ├── CrewCard
│   └── ManageCrewModal
│       └── Modal
├── PersonnelView
├── NewRequestModal
│   └── Modal
└── Toast
```

## Notes

- All components use ES6 imports/exports
- CSS is imported directly into App.jsx
- Constants are centralized in `config/constants.js`
- Utility functions are separated in `utils/helpers.js`
- Custom hooks are in `hooks/` directory
- All components export as default
