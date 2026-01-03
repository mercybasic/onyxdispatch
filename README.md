# Onyx Dispatch

A modern dispatch management system for emergency services in Star Citizen. Built with React and designed for real-time coordination between dispatchers, pilots, and crew members.

## Features

- **Discord OAuth Authentication** - Secure role-based access control via Discord
- **Service Request Management** - Create, assign, and track emergency service requests
- **Crew Management** - Organize and manage crew assignments and capabilities
- **Real-time Dashboard** - Monitor active missions, pending requests, and personnel status
- **Role-based Access** - Different views and permissions for dispatchers, pilots, and crew
- **Public Landing Page** - Allow external clients to submit service requests

## Service Types

- Search & Rescue (SAR)
- Combat SAR (CSAR)
- Refueling
- Medical Evacuation
- Escort Services
- Cargo Assistance

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with modern CSS features
- **Discord OAuth 2.0** - Authentication and authorization

## Project Structure

```
onyxdispatch/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── common/         # Reusable components (Toast, Modal, Cards)
│   │   ├── layout/         # Layout components (Header, NavTabs)
│   │   ├── modals/         # Modal dialogs
│   │   └── views/          # Page views (Dashboard, Requests, Crews, etc.)
│   ├── config/
│   │   ├── constants.js    # App constants and mock data
│   │   └── discord.js      # Discord OAuth configuration
│   ├── hooks/
│   │   └── useDiscordAuth.js  # Discord authentication hook
│   ├── styles/
│   │   └── main.css        # Global styles
│   ├── utils/
│   │   └── helpers.js      # Utility functions
│   ├── App.jsx             # Main application component
│   └── index.js            # React entry point
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Discord application with OAuth configured (for authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd onyxdispatch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Discord OAuth:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application or select an existing one
   - Set up OAuth2 redirect URI (e.g., `http://localhost:3000/auth/callback`)
   - Copy your Client ID

4. Update Discord configuration in `src/config/discord.js`:
   - Set your `clientId`
   - Configure your server and role IDs
   - Update the Discord invite link

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Discord Setup

### Required Configuration

1. **Server IDs**: Add your Discord server ID(s) to `DISCORD_AUTH_CONFIG.requiredServers`
2. **Role IDs**: Configure role IDs for different access levels:
   - Dispatcher roles (highest privilege)
   - Pilot roles
   - Crew roles

### OAuth Flow

The application uses Discord OAuth 2.0 for authentication:
1. Users click "Login with Discord"
2. They're redirected to Discord for authorization
3. Discord redirects back with an authorization code
4. The code is exchanged for user info (in production, this should happen on your backend)
5. User role is determined based on Discord server membership and roles

**Note**: For production use, implement a backend service to securely handle the OAuth token exchange and store sensitive credentials.

## Demo Mode

The application includes a demo mode with pre-configured users:
- Commander Reyes (Dispatcher)
- Dispatcher Orion (Dispatcher)
- Pilot Nova (Pilot)
- Engineer Kaz (Crew)

Use these for testing without Discord OAuth configuration.

## Security Notes

- Never expose your Discord Client Secret in the frontend
- Implement proper backend authentication for production
- Use environment variables for sensitive configuration
- Validate all user inputs and permissions server-side

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on the GitHub repository.
