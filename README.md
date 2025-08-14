# NomadBoard Chrome Extension

A modern, well-structured Chrome extension to help job seekers track their applications with Google Sheets integration.

## 🚀 Features

- **Google Account Integration**: Seamless OAuth 2.0 authentication
- **Automatic Job Data Capture**: Extract job details from LinkedIn job pages
- **Status Tracking**: Track application status (Applied, Interviewing, Offered, Rejected, Accepted)
- **Google Sheets Integration**: Automatic spreadsheet creation and data synchronization
- **Recent Jobs History**: Quick access to recently added applications
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## 🏗️ Architecture

### **Technology Stack**

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **UI Components**: Radix UI primitives with custom styling
- **Build Tool**: Vite for fast development and optimized builds
- **Extension**: Chrome Extension Manifest V3 with Service Worker
- **Authentication**: Chrome Identity API for Google OAuth
- **Storage**: Chrome Storage API + Google Sheets API

### **Project Structure**

```
src/
├── assets/              # Static assets (icons, images)
│   └── icons/          # Extension icons
├── background/          # Extension background scripts
│   └── background.ts   # Service worker
├── components/          # Shared UI components
│   └── ui/             # Base UI components (Radix UI)
├── config/             # Configuration and constants
│   └── constants.ts    # Centralized constants
├── content-scripts/    # Content scripts for web pages
│   └── linkedin.ts     # LinkedIn job extraction
├── features/           # Feature-based modules
│   ├── jobs/           # Job management feature
│   │   ├── components/ # Job-related components
│   │   ├── hooks/      # Job-related hooks
│   │   └── index.ts    # Feature exports
│   └── linkedin/       # LinkedIn integration feature
│       ├── components/ # LinkedIn-related components
│       └── index.ts    # Feature exports
├── pages/              # Page components
│   └── popup/          # Extension popup
│       ├── Popup.tsx   # Main popup component
│       ├── index.tsx   # Popup entry point
│       └── popup.html  # Popup HTML template
├── services/           # Business logic services
│   └── sheetsService.ts # Google Sheets operations
├── shared/             # Shared utilities and hooks
│   ├── hooks/          # Shared React hooks
│   └── index.ts        # Shared exports
├── styles/             # Global styles
│   └── globals.css     # Global CSS and Tailwind
├── types/              # TypeScript type definitions
│   └── index.ts        # Centralized types
└── utils/              # Utility functions
    ├── api.ts          # API utilities
    ├── common.ts       # Common helper functions
    └── storage.ts      # Storage utilities
```

## 🛠️ Development

### **Prerequisites**

- Node.js 18+
- Chrome browser
- Google Cloud Console access

### **Setup**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nomadboard-extension
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Google API**

   - Copy `src/config/config.template.js` to `src/config/config.js`
   - Set up Google Cloud Console project
   - Enable Google Sheets API and Drive API
   - Configure OAuth consent screen
   - Add your Client ID to the config

4. **Build the extension**

   ```bash
   npm run build
   ```

5. **Load in Chrome**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

### **Development Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏛️ Code Quality

### **Principles Applied**

- **KISS (Keep It Simple, Stupid)**: Simple, straightforward code without unnecessary complexity
- **DRY (Don't Repeat Yourself)**: Eliminated duplicate code through modular architecture
- **Single Responsibility**: Each component and function has a single, clear purpose
- **Type Safety**: Full TypeScript implementation for better development experience
- **Feature-Based Organization**: Code organized by features rather than technical concerns

### **Key Improvements**

- **Feature-Based Architecture**: Code organized by business features (jobs, linkedin)
- **Clear Separation of Concerns**: Background scripts, content scripts, and UI components separated
- **Type Safety**: Comprehensive TypeScript types for all data structures
- **Custom Hooks**: Reusable React hooks for common functionality
- **Centralized Constants**: All configuration and constants in one place
- **Error Handling**: Consistent error handling throughout the application
- **Loading States**: Proper loading indicators for better UX

### **Naming Conventions**

- **Folders**: kebab-case (e.g., `content-scripts`, `background`)
- **Files**: PascalCase for components (e.g., `JobForm.tsx`), camelCase for utilities (e.g., `api.ts`)
- **Components**: PascalCase (e.g., `JobForm`, `RecentJobs`)
- **Hooks**: camelCase with `use` prefix (e.g., `useJobForm`, `useChromeMessaging`)
- **Types**: PascalCase (e.g., `JobData`, `ApiResponse`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MESSAGE_ACTIONS`, `JOB_STATUSES`)

## 🔧 Configuration

### **Environment Variables**

Create a `src/config/config.js` file with your Google API credentials:

```javascript
export const CONFIG = {
  GOOGLE: {
    CLIENT_ID: "your-client-id",
    API_KEY: "your-api-key",
    DISCOVERY_DOCS: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    SCOPES: "https://www.googleapis.com/auth/spreadsheets",
    SHEET_NAME: "NomadBoard Job Applications",
    HEADERS: ["Date", "Job Title", "Company", "Status", "URL"],
  },
};
```

## 🚀 Deployment

### **Extension Packing**

1. Build the extension: `npm run build`
2. Go to `chrome://extensions/`
3. Click "Pack extension"
4. Select the `dist` directory
5. Keep the generated `.pem` file secure

### **Security Notes**

- Never commit sensitive files like `config.js` or `.pem` files
- Keep your `.pem` file secure and separate from the project
- Use environment variables for local development
- Each developer should generate their own `.pem` file and extension key

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Style**

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused
- Use consistent formatting (Prettier)
- Follow the established folder structure and naming conventions

### **Adding New Features**

1. Create a new feature folder in `src/features/`
2. Organize components, hooks, and utilities within the feature
3. Export from the feature's `index.ts`
4. Import in the appropriate page or component

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact:

- **Email**: dee@notablenomads.com
- **Website**: https://notablenomads.com

## 🎯 Roadmap

- [ ] Offline support with sync when online
- [ ] Job application analytics and insights
- [ ] Multi-platform job site integration
- [ ] Export functionality for backup
- [ ] Advanced filtering and search
- [ ] Email notifications for status updates
