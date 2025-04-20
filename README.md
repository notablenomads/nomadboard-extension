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

- Never commit sensitive files like `config.js` or `.pem` files to the repository
- Keep your `.pem` file secure and separate from the project
- The extension key in `manifest.json` should be the public key extracted from your `.pem` file
- Use environment variables for local development
- When sharing the extension, each developer should generate their own `.pem` file and extension key

### Extension Key Setup

1. After packing your extension in Chrome, you'll receive a `.pem` file
2. Store this `.pem` file securely outside your project directory
3. Run the key extraction script:
   ```bash
   node scripts/get-extension-key.js path/to/your/extension.pem
   ```
4. Copy the output key and update the `key` field in your `manifest.json`

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
