import { ApiConfig, GoogleConfig, StorageKeys } from '../types';

export const API_CONFIG: ApiConfig = {
  BASE_URL: "https://sheets.googleapis.com/v4",
  DRIVE_URL: "https://www.googleapis.com/drive/v3",
  SCOPES: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
  VALUE_INPUT_OPTION: "RAW",
  INSERT_DATA_OPTION: "INSERT_ROWS",
};

export const GOOGLE_CONFIG: GoogleConfig = {
  SHEET_NAME: "NomadBoard Job Applications",
  HEADERS: ["Date", "Job Title", "Company", "Status", "URL"],
  MAX_ROWS: 1000,
  COLUMNS: 5,
};

export const STORAGE_KEYS: StorageKeys = {
  IS_LOGGED_IN: "isLoggedIn",
  SHEET_ID: "sheetId",
  RECENT_JOBS: "recentJobs",
  MAX_RECENT_JOBS: 10,
};

export const JOB_STATUSES = {
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFERED: "Offered",
  REJECTED: "Rejected",
  ACCEPTED: "Accepted",
} as const;

export const MESSAGE_ACTIONS = {
  LOGIN: "login",
  SAVE_JOB: "saveJob",
  GET_RECENT_JOBS: "getRecentJobs",
  JOB_DETAILS_EXTRACTED: "jobDetailsExtracted",
  EXTRACT_JOB_DETAILS: "extractJobDetails",
} as const;

export const LINKEDIN_SELECTORS = {
  JOB_TITLE: ".job-details-jobs-unified-top-card__job-title",
  COMPANY_NAME: ".job-details-jobs-unified-top-card__company-name",
  JOB_DESCRIPTION: ".job-details-jobs-unified-description__content",
} as const;
