import { STORAGE_KEYS } from "../js/constants.js";

/**
 * Service for handling Chrome storage operations
 */
class StorageService {
  /**
   * Gets the login status
   * @returns {Promise<boolean>} Login status
   */
  async getLoginStatus() {
    const { [STORAGE_KEYS.IS_LOGGED_IN]: isLoggedIn = false } = await chrome.storage.local.get([STORAGE_KEYS.IS_LOGGED_IN]);
    return isLoggedIn;
  }

  /**
   * Sets the login status
   * @param {boolean} isLoggedIn - Login status
   */
  async setLoginStatus(isLoggedIn) {
    await chrome.storage.local.set({ [STORAGE_KEYS.IS_LOGGED_IN]: isLoggedIn });
  }

  /**
   * Gets the sheet ID
   * @returns {Promise<string|null>} Sheet ID or null if not found
   */
  async getSheetId() {
    const { [STORAGE_KEYS.SHEET_ID]: sheetId } = await chrome.storage.local.get([STORAGE_KEYS.SHEET_ID]);
    return sheetId || null;
  }

  /**
   * Sets the sheet ID
   * @param {string} sheetId - Sheet ID
   */
  async setSheetId(sheetId) {
    await chrome.storage.local.set({ [STORAGE_KEYS.SHEET_ID]: sheetId });
  }

  /**
   * Gets recent jobs
   * @returns {Promise<Array>} Recent jobs
   */
  async getRecentJobs() {
    const { [STORAGE_KEYS.RECENT_JOBS]: recentJobs = [] } = await chrome.storage.local.get([STORAGE_KEYS.RECENT_JOBS]);
    return recentJobs;
  }

  /**
   * Updates recent jobs
   * @param {Object} jobData - New job data
   */
  async updateRecentJobs(jobData) {
    const recentJobs = await this.getRecentJobs();
    const updatedJobs = [jobData, ...recentJobs.slice(0, STORAGE_KEYS.MAX_RECENT_JOBS - 1)];
    await chrome.storage.local.set({ [STORAGE_KEYS.RECENT_JOBS]: updatedJobs });
  }

  /**
   * Clears all storage data
   */
  async clearAll() {
    await chrome.storage.local.clear();
  }
}

export const storageService = new StorageService();
