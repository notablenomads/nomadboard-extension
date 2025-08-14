import { STORAGE_KEYS } from '../config/constants';
import { JobData } from '../types';

export class StorageService {
  async getLoginStatus(): Promise<boolean> {
    const { [STORAGE_KEYS.IS_LOGGED_IN]: isLoggedIn = false } = await chrome.storage.local.get([STORAGE_KEYS.IS_LOGGED_IN]);
    return isLoggedIn;
  }

  async setLoginStatus(isLoggedIn: boolean): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.IS_LOGGED_IN]: isLoggedIn });
  }

  async getSheetId(): Promise<string | null> {
    const { [STORAGE_KEYS.SHEET_ID]: sheetId } = await chrome.storage.local.get([STORAGE_KEYS.SHEET_ID]);
    return sheetId || null;
  }

  async setSheetId(sheetId: string): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEYS.SHEET_ID]: sheetId });
  }

  async getRecentJobs(): Promise<JobData[]> {
    const { [STORAGE_KEYS.RECENT_JOBS]: recentJobs = [] } = await chrome.storage.local.get([STORAGE_KEYS.RECENT_JOBS]);
    return recentJobs;
  }

  async updateRecentJobs(jobData: JobData): Promise<void> {
    const recentJobs = await this.getRecentJobs();
    const updatedJobs = [jobData, ...recentJobs.slice(0, STORAGE_KEYS.MAX_RECENT_JOBS - 1)];
    await chrome.storage.local.set({ [STORAGE_KEYS.RECENT_JOBS]: updatedJobs });
  }

  async clearAll(): Promise<void> {
    await chrome.storage.local.clear();
  }
}

export const storageService = new StorageService();
