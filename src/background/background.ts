import { MESSAGE_ACTIONS } from "../config/constants";
import { JobData, ApiResponse } from "../types";
import { storageService } from "../utils/storage";
import { sheetsService } from "../services/sheetsService";
import { getAuthToken, getAuthTokenInteractive, clearToken } from "../utils/api";

chrome.runtime.onInstalled.addListener(() => {
  storageService.setLoginStatus(false);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case MESSAGE_ACTIONS.LOGIN:
      handleLogin(sendResponse);
      break;
    case MESSAGE_ACTIONS.SAVE_JOB:
      saveJob(request.jobData, sendResponse);
      break;
    case MESSAGE_ACTIONS.GET_RECENT_JOBS:
      getRecentJobs(sendResponse);
      break;
    case MESSAGE_ACTIONS.JOB_DETAILS_EXTRACTED:
      handleExtractedJobDetails(request.jobData);
      break;
  }
  return true;
});

async function handleLogin(sendResponse: (response: ApiResponse) => void) {
  let token: string | null = null;
  try {
    console.log("Starting login process...");

    token = await getAuthTokenInteractive();
    console.log("Got auth token:", token ? "Token received" : "No token");

    if (!token) {
      throw new Error("No auth token received");
    }

    console.log("Creating/getting sheet...");
    const sheetId = await sheetsService.createOrGetSheet(token);
    if (!sheetId) {
      throw new Error("Failed to create or get sheet");
    }

    console.log("Sheet created/retrieved successfully:", sheetId);
    await storageService.setLoginStatus(true);
    await storageService.setSheetId(sheetId);

    sendResponse({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    await clearToken(token);
    sendResponse({ success: false, error: error.message });
  }
}

async function saveJob(jobData: JobData, sendResponse: (response: ApiResponse) => void) {
  let token: string | null = null;
  try {
    const sheetId = await storageService.getSheetId();
    if (!sheetId) {
      throw new Error("No sheet ID found");
    }

    token = await getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    await sheetsService.appendJobData(token, sheetId, jobData);
    await storageService.updateRecentJobs(jobData);

    console.log("Job saved successfully");
    sendResponse({ success: true });
  } catch (error) {
    console.error("Save job error:", error);
    await clearToken(token);
    sendResponse({ success: false, error: error.message });
  }
}

async function getRecentJobs(sendResponse: (response: ApiResponse<JobData[]>) => void) {
  try {
    const recentJobs = await storageService.getRecentJobs();
    sendResponse({ success: true, data: recentJobs });
  } catch (error) {
    console.error("Get recent jobs error:", error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleExtractedJobDetails(jobData: JobData) {
  if (!jobData) return;

  try {
    const isLoggedIn = await storageService.getLoginStatus();
    if (!isLoggedIn) {
      console.log("User not logged in, job details will be saved when logged in");
      return;
    }

    const sheetId = await storageService.getSheetId();
    if (!sheetId) {
      console.log("No sheet ID found, job details will be saved when sheet is created");
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      console.log("Not authenticated, job details will be saved when authenticated");
      return;
    }

    await sheetsService.appendJobData(token, sheetId, jobData);
    await storageService.updateRecentJobs(jobData);
    console.log("LinkedIn job saved successfully");
  } catch (error) {
    console.error("Error saving LinkedIn job:", error);
  }
}
