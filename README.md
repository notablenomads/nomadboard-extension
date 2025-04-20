# NomadBoard Chrome Extension

A Chrome extension to help job seekers track their job applications with Google Sheets integration.

## Features

- Google Account integration
- Automatic job data capture
- Status tracking
- Google Sheets integration
- Recent jobs history

## Setup

1. Clone the repository
2. Copy `src/config/config.template.js` to `src/config/config.js`
3. Fill in your Google API credentials in `src/config/config.js`:
   - Get your Client ID from Google Cloud Console
   - Enable the Google Sheets API
   - Configure OAuth consent screen

## Development

1. Load the extension in Chrome:

   - Go to chrome://extensions/
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

2. Make changes to the code
3. Click "Reload" in chrome://extensions/ to see your changes

## Security Notes

- Never commit `config.js` or any files containing real credentials
- Keep your `.pem` file safe - you'll need it for updates
- Don't share your API keys or client IDs
- Use environment variables for local development

## Building

1. Make sure all sensitive data is removed
2. Go to chrome://extensions/
3. Click "Pack extension"
4. Select the extension directory
5. Keep the generated `.pem` file safe

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For support, please open an issue in the GitHub repository.
