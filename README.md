# NomadBoard Chrome Extension

NomadBoard is a Chrome extension that helps you track your job applications efficiently by integrating with Google Sheets. It automatically captures job details and maintains a comprehensive log of your job search progress.

## Features

- Google Account Integration
- Automatic job data capture
- Status tracking (Wishlist, Applied, Interview, Offer, Rejected)
- Google Sheets storage
- Clean and intuitive user interface
- Real-time updates

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Setup

1. You'll need to set up a Google Cloud Project and enable the Google Sheets API:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Sheets API
   - Create OAuth 2.0 credentials
   - Add your extension's ID to the authorized JavaScript origins
   - Copy your Client ID

2. Update the extension's manifest:
   - Open `manifest.json`
   - Replace `${YOUR_CLIENT_ID}` with your actual Google Cloud Client ID

## Usage

1. Click the NomadBoard icon in your Chrome toolbar
2. Sign in with your Google Account
3. When viewing a job listing:
   - Click the NomadBoard icon
   - Fill in the job details
   - Select the application status
   - Click "Save Job"
4. View your saved jobs in the popup
5. Access your complete job application history in the automatically created Google Sheet

## Development

The extension is built with vanilla JavaScript and uses the following structure:

- `manifest.json`: Extension configuration
- `popup.html`: User interface
- `popup.js`: Popup functionality
- `background.js`: Background processes and Google Sheets integration
- `styles.css`: Styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.
