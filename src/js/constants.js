export const SHEET_CONFIG = {
  NAME: "NomadBoard Job Applications",
  HEADERS: ["Date", "Job Title", "Company", "Status", "URL"],
  MAX_ROWS: 1000,
  COLUMNS: 5,
};

export const JOB_STATUS = {
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  ACCEPTED: "Accepted",
  OTHER: "Other",
};

export const STORAGE_KEYS = {
  IS_LOGGED_IN: "isLoggedIn",
  SHEET_ID: "sheetId",
  RECENT_JOBS: "recentJobs",
  MAX_RECENT_JOBS: 10,
};

export const API_ENDPOINTS = {
  SHEETS: "https://sheets.googleapis.com/v4/spreadsheets",
  SHEETS_SEARCH: "https://sheets.googleapis.com/v4/spreadsheets?q=title%3D",
};

export const UI_ELEMENTS = {
  LOGIN_SECTION: "login-section",
  MAIN_SECTION: "main-section",
  LOGIN_BUTTON: "login-button",
  SAVE_JOB_BUTTON: "save-job",
  JOBS_LIST: "jobs-list",
  JOB_TITLE: "job-title",
  COMPANY_NAME: "company-name",
  JOB_STATUS: "job-status",
};

export const UI = {
  MAX_TITLE_LENGTH: 50,
  MAX_COMPANY_LENGTH: 30,
  MAX_NOTES_LENGTH: 200,
};
