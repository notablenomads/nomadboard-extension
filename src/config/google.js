/**
 * API Configuration for Google Services
 */
export const API_CONFIG = {
  BASE_URL: "https://sheets.googleapis.com/v4",
  DRIVE_URL: "https://www.googleapis.com/drive/v3",
  SCOPES: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
  VALUE_INPUT_OPTION: "RAW",
  INSERT_DATA_OPTION: "INSERT_ROWS",
};

/**
 * Google Sheets Configuration
 */
export const GOOGLE_CONFIG = {
  CLIENT_ID: "262329997733-dlgb28ljup88nno1vhdgblffll96cr23.apps.googleusercontent.com",
  DISCOVERY_DOCS: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  SHEET_NAME: "NomadBoard Job Applications",
  HEADERS: [
    "Date",
    "Job Title",
    "Company",
    "Status",
    "Location",
    "Job Type",
    "Employment Type",
    "Company Size",
    "Company Industry",
    "Salary Info",
    "URL",
    "Notes",
  ],
  MAX_ROWS: 1000,
  COLUMNS: 12,
};
