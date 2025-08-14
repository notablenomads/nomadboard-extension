export interface JobData {
  company: string;
  position: string;
  status: JobStatus;
  notes?: string;
  date: string;
  url?: string;
  source?: string;
}

export type JobStatus = 'Applied' | 'Interviewing' | 'Offered' | 'Rejected' | 'Accepted';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GoogleConfig {
  SHEET_NAME: string;
  HEADERS: string[];
  MAX_ROWS: number;
  COLUMNS: number;
}

export interface ApiConfig {
  BASE_URL: string;
  DRIVE_URL: string;
  SCOPES: string[];
  VALUE_INPUT_OPTION: string;
  INSERT_DATA_OPTION: string;
}

export interface StorageKeys {
  IS_LOGGED_IN: string;
  SHEET_ID: string;
  RECENT_JOBS: string;
  MAX_RECENT_JOBS: number;
}

export interface ExtractedJobData {
  position: string;
  company: string;
  description?: string;
  url: string;
  source: string;
  date: string;
}
