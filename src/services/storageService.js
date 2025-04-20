// Storage service for managing local storage operations
const STORAGE_KEYS = {
  IS_LOGGED_IN: "isLoggedIn",
  SHEET_ID: "sheetId",
  RECENT_JOBS: "recentJobs",
  MAX_RECENT_JOBS: 10,
};

class StorageService {
  async getLoginStatus() {
    const result = await chrome.storage.local.get([STORAGE_KEYS.IS_LOGGED_IN]);
    return result[STORAGE_KEYS.IS_LOGGED_IN] || false;
  }

  async getSheetId() {
    const result = await chrome.storage.local.get([STORAGE_KEYS.SHEET_ID]);
    return result[STORAGE_KEYS.SHEET_ID];
  }

  async setMultiple(data) {
    await chrome.storage.local.set(data);
  }

  async getRecentJobs() {
    const result = await chrome.storage.local.get([STORAGE_KEYS.RECENT_JOBS]);
    return result[STORAGE_KEYS.RECENT_JOBS] || [];
  }

  async addRecentJob(jobData) {
    const jobs = await this.getRecentJobs();
    jobs.unshift(jobData);
    await chrome.storage.local.set({
      [STORAGE_KEYS.RECENT_JOBS]: jobs.slice(0, STORAGE_KEYS.MAX_RECENT_JOBS),
    });
  }
}

export const storageService = new StorageService();
