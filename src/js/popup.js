import { UI_ELEMENTS, JOB_STATUS } from "./constants.js";
import { storageService } from "../services/storageService.js";
import { sheetsService } from "../services/sheetsService.js";
import { validateJobData, createJobElement, showElement, hideElement, clearForm } from "../utils/helpers.js";

class PopupManager {
  constructor() {
    this.elements = {};
    this.initialize();
  }

  initialize() {
    this.cacheElements();
    this.setupEventListeners();
    this.checkLoginStatus();
  }

  cacheElements() {
    this.elements = {
      loginSection: document.getElementById(UI_ELEMENTS.LOGIN_SECTION),
      mainSection: document.getElementById(UI_ELEMENTS.MAIN_SECTION),
      loginButton: document.getElementById(UI_ELEMENTS.LOGIN_BUTTON),
      saveJobButton: document.getElementById(UI_ELEMENTS.SAVE_JOB_BUTTON),
      jobsList: document.getElementById(UI_ELEMENTS.JOBS_LIST),
      jobTitle: document.getElementById(UI_ELEMENTS.JOB_TITLE),
      companyName: document.getElementById(UI_ELEMENTS.COMPANY_NAME),
      jobStatus: document.getElementById(UI_ELEMENTS.JOB_STATUS),
    };
  }

  setupEventListeners() {
    this.elements.loginButton.addEventListener("click", () => this.handleLogin());
    this.elements.saveJobButton.addEventListener("click", () => this.handleSaveJob());
  }

  async checkLoginStatus() {
    const isLoggedIn = await storageService.getLoginStatus();
    if (isLoggedIn) {
      this.showMainSection();
      this.loadRecentJobs();
    } else {
      this.showLoginSection();
    }
  }

  async handleLogin() {
    try {
      const token = await chrome.identity.getAuthToken({ interactive: true });
      if (!token) {
        throw new Error("Failed to get auth token");
      }

      await sheetsService.initialize(token);
      const sheetId = await sheetsService.createOrGetSheet();

      if (!sheetId) {
        throw new Error("Failed to create or get sheet");
      }

      await storageService.setMultiple({
        [STORAGE_KEYS.IS_LOGGED_IN]: true,
        [STORAGE_KEYS.SHEET_ID]: sheetId,
      });

      this.showMainSection();
      this.loadRecentJobs();
    } catch (error) {
      console.error("Login error:", error);
      alert("Failed to login. Please try again.");
    }
  }

  async handleSaveJob() {
    const jobData = {
      title: this.elements.jobTitle.value,
      company: this.elements.companyName.value,
      status: this.elements.jobStatus.value,
      url: window.location.href,
      date: new Date().toISOString(),
    };

    if (!validateJobData(jobData)) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const sheetId = await storageService.getSheetId();
      const token = await chrome.identity.getAuthToken({ interactive: false });

      if (!sheetId || !token) {
        throw new Error("Not authenticated");
      }

      await sheetsService.initialize(token);
      await sheetsService.appendJob(sheetId, jobData);
      await storageService.addRecentJob(jobData);

      this.loadRecentJobs();
      clearForm(this.elements);
    } catch (error) {
      console.error("Save job error:", error);
      alert("Failed to save job. Please try again.");
    }
  }

  async loadRecentJobs() {
    const jobs = await storageService.getRecentJobs();
    this.elements.jobsList.innerHTML = "";
    jobs.forEach((job) => {
      const jobElement = createJobElement(job);
      this.elements.jobsList.appendChild(jobElement);
    });
  }

  showLoginSection() {
    hideElement(this.elements.mainSection);
    showElement(this.elements.loginSection);
  }

  showMainSection() {
    hideElement(this.elements.loginSection);
    showElement(this.elements.mainSection);
  }
}

// Initialize the popup
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
