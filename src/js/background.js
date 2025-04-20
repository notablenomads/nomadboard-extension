import { storageService } from "../services/storageService.js";
import { sheetsService } from "../services/sheetsService.js";
import { STORAGE_KEYS } from "./constants.js";

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  storageService.setLoginStatus(false);
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "login":
      handleLogin(sendResponse);
      break;
    case "saveJob":
      saveJob(request.jobData, sendResponse);
      break;
    case "getRecentJobs":
      getRecentJobs(sendResponse);
      break;
  }
  return true; // Keep the message channel open for async responses
});

async function handleLogin(sendResponse) {
  try {
    const token = await chrome.identity.getAuthToken({ interactive: true });
    if (!token) {
      sendResponse({ success: false });
      return;
    }

    await sheetsService.initialize(token);
    const sheetId = await sheetsService.createOrGetSheet();

    if (!sheetId) {
      sendResponse({ success: false });
      return;
    }

    await storageService.setMultiple({
      [STORAGE_KEYS.IS_LOGGED_IN]: true,
      [STORAGE_KEYS.SHEET_ID]: sheetId,
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    sendResponse({ success: false });
  }
}

async function saveJob(jobData, sendResponse) {
  try {
    const sheetId = await storageService.getSheetId();
    const token = await chrome.identity.getAuthToken({ interactive: false });

    if (!sheetId || !token) {
      sendResponse({ success: false });
      return;
    }

    await sheetsService.initialize(token);
    await sheetsService.appendJob(sheetId, jobData);
    await storageService.addRecentJob(jobData);

    sendResponse({ success: true });
  } catch (error) {
    console.error("Save job error:", error);
    sendResponse({ success: false });
  }
}

async function getRecentJobs(sendResponse) {
  try {
    const jobs = await storageService.getRecentJobs();
    sendResponse(jobs);
  } catch (error) {
    console.error("Get recent jobs error:", error);
    sendResponse([]);
  }
}
