/**
 * @typedef {Object} JobData
 * @property {string} position - Job position/title
 * @property {string} company - Company name
 * @property {string} status - Application status
 * @property {string} [notes] - Optional notes about the application
 */

/**
 * @typedef {Object} GoogleConfig
 * @property {string} SHEET_NAME - Name of the Google Sheet
 * @property {string[]} HEADERS - Column headers for the sheet
 * @property {number} MAX_ROWS - Maximum number of rows in the sheet
 * @property {number} COLUMNS - Number of columns in the sheet
 */

/**
 * @typedef {Object} StorageKeys
 * @property {string} IS_LOGGED_IN - Key for login status
 * @property {string} SHEET_ID - Key for sheet ID
 * @property {string} RECENT_JOBS - Key for recent jobs
 * @property {number} MAX_RECENT_JOBS - Maximum number of recent jobs to store
 */

// Import statements are not supported in service workers directly
// We'll use importScripts for the modules we need

// Define the API configuration
const API_CONFIG = {
  BASE_URL: "https://sheets.googleapis.com/v4",
  DRIVE_URL: "https://www.googleapis.com/drive/v3",
  SCOPES: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
  VALUE_INPUT_OPTION: "RAW",
  INSERT_DATA_OPTION: "INSERT_ROWS",
};

// Define the Google Sheets configuration
const GOOGLE_CONFIG = {
  SHEET_NAME: "NomadBoard Job Applications",
  HEADERS: [
    "Date",
    "Job Title",
    "Company",
    "Status",
    "Location",
    "Job Type",
    "Posted Date",
    "Company Size",
    "Company Industry",
    "Salary Info",
    "URL",
    "Notes",
  ],
  MAX_ROWS: 1000,
  COLUMNS: 12,
};

// Define storage keys
const STORAGE_KEYS = {
  IS_LOGGED_IN: "isLoggedIn",
  SHEET_ID: "sheetId",
  RECENT_JOBS: "recentJobs",
  MAX_RECENT_JOBS: 10,
};

// Helper functions
const createHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  Accept: "application/json",
});

const handleApiError = async (response, operation) => {
  const errorText = await response.text();
  console.error(`${operation} error:`, errorText);
  throw new Error(`${operation} failed: ${response.statusText}. Response: ${errorText}`);
};

const clearToken = async (token) => {
  if (token) {
    try {
      await new Promise((resolve) => {
        chrome.identity.removeCachedAuthToken({ token }, resolve);
      });
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }
};

const getAuthToken = () => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
};

// Sheets service functions
const sheetsService = {
  async createOrGetSheet(token) {
    try {
      console.log("Starting createOrGetSheet process...");
      console.log("Searching for existing sheet...");
      const sheetId = await this.findExistingSheet(token);
      if (sheetId) {
        console.log("Found existing sheet with ID:", sheetId);
        await storageService.setSheetId(sheetId);
        return sheetId;
      }

      console.log("No existing sheet found, proceeding to create new sheet...");
      const newSheetId = await this.createNewSheet(token);
      console.log("New sheet created with ID:", newSheetId);
      return newSheetId;
    } catch (error) {
      console.error("Sheet creation error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        token: token ? "Token exists" : "No token",
      });
      return null;
    }
  },

  async findExistingSheet(token) {
    try {
      console.log("Searching for sheet with name:", GOOGLE_CONFIG.SHEET_NAME);
      const searchResponse = await fetch(
        `${API_CONFIG.DRIVE_URL}/files?q=name%3D'${encodeURIComponent(
          GOOGLE_CONFIG.SHEET_NAME
        )}'%20and%20mimeType%3D'application/vnd.google-apps.spreadsheet'`,
        {
          headers: createHeaders(token),
        }
      );

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error("Search sheet error response:", {
          status: searchResponse.status,
          statusText: searchResponse.statusText,
          errorText,
        });
        await handleApiError(searchResponse, "Search sheet");
      }

      const searchData = await searchResponse.json();
      console.log("Search response data:", searchData);

      if (searchData.files && searchData.files.length > 0) {
        console.log("Found existing sheet:", searchData.files[0].id);
        return searchData.files[0].id;
      }

      console.log("No existing sheet found");
      return null;
    } catch (error) {
      console.error("Error in findExistingSheet:", error);
      throw error;
    }
  },

  async createNewSheet(token) {
    try {
      console.log("Starting new sheet creation...");
      const createResponse = await fetch(`${API_CONFIG.BASE_URL}/spreadsheets`, {
        method: "POST",
        headers: createHeaders(token),
        body: JSON.stringify({
          properties: {
            title: GOOGLE_CONFIG.SHEET_NAME,
          },
          sheets: [
            {
              properties: {
                title: "Applications",
                gridProperties: {
                  rowCount: GOOGLE_CONFIG.MAX_ROWS,
                  columnCount: GOOGLE_CONFIG.COLUMNS,
                },
              },
            },
          ],
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("Create sheet error response:", {
          status: createResponse.status,
          statusText: createResponse.statusText,
          errorText,
        });
        await handleApiError(createResponse, "Create sheet");
      }

      const createData = await createResponse.json();
      console.log("Create response data:", createData);

      if (!createData.spreadsheetId) {
        throw new Error("No spreadsheet ID in response");
      }

      // Store the sheet ID immediately after creation
      await storageService.setSheetId(createData.spreadsheetId);
      console.log("Sheet ID stored in local storage:", createData.spreadsheetId);

      // Verify sheet access
      const verifyResponse = await fetch(`${API_CONFIG.BASE_URL}/spreadsheets/${createData.spreadsheetId}`, {
        headers: createHeaders(token),
      });

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error("Sheet verification error:", {
          status: verifyResponse.status,
          statusText: verifyResponse.statusText,
          errorText,
        });
        throw new Error("Failed to verify sheet access");
      }

      console.log("Adding headers to new sheet...");
      await this.addHeaders(token, createData.spreadsheetId);
      console.log("Headers added successfully");

      return createData.spreadsheetId;
    } catch (error) {
      console.error("Error in createNewSheet:", error);
      // Clear the sheet ID if there was an error
      await storageService.setSheetId(null);
      throw error;
    }
  },

  async addHeaders(token, sheetId) {
    console.log("Adding headers to new sheet...");
    const headerResponse = await fetch(
      `${API_CONFIG.BASE_URL}/spreadsheets/${sheetId}/values/A1:L1?valueInputOption=${API_CONFIG.VALUE_INPUT_OPTION}`,
      {
        method: "PUT",
        headers: createHeaders(token),
        body: JSON.stringify({
          range: "A1:L1",
          majorDimension: "ROWS",
          values: [GOOGLE_CONFIG.HEADERS],
        }),
      }
    );

    if (!headerResponse.ok) {
      await handleApiError(headerResponse, "Add headers");
    }
  },

  async appendJobData(token, sheetId, jobData) {
    try {
      // Verify sheet access before appending
      const verifyResponse = await fetch(`${API_CONFIG.BASE_URL}/spreadsheets/${sheetId}`, {
        headers: createHeaders(token),
      });

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error("Sheet verification error before append:", {
          status: verifyResponse.status,
          statusText: verifyResponse.statusText,
          errorText,
        });
        throw new Error("Failed to verify sheet access before appending data");
      }

      // Ensure all fields are in the correct order
      const values = [
        [
          new Date().toISOString(), // Date
          jobData.position || "", // Job Title
          jobData.company || "", // Company
          jobData.status || "", // Status
          jobData.location || "", // Location
          jobData.jobType || "", // Job Type
          jobData.postedDate || "", // Posted Date
          jobData.companySize || "", // Company Size
          jobData.companyIndustry || "", // Company Industry
          jobData.salaryInfo || "", // Salary Info
          jobData.url || "", // URL
          jobData.notes || "", // Notes
        ],
      ];

      console.log("Adding job data to sheet:", values);

      const appendResponse = await fetch(
        `${API_CONFIG.BASE_URL}/spreadsheets/${sheetId}/values/A:L:append?valueInputOption=${API_CONFIG.VALUE_INPUT_OPTION}&insertDataOption=${API_CONFIG.INSERT_DATA_OPTION}`,
        {
          method: "POST",
          headers: createHeaders(token),
          body: JSON.stringify({
            range: "A:L",
            majorDimension: "ROWS",
            values: values,
          }),
        }
      );

      if (!appendResponse.ok) {
        const errorText = await appendResponse.text();
        console.error("Append data error response:", {
          status: appendResponse.status,
          statusText: appendResponse.statusText,
          errorText,
        });
        await handleApiError(appendResponse, "Append data");
      }

      console.log("Job data appended successfully");
    } catch (error) {
      console.error("Error in appendJobData:", error);
      throw error;
    }
  },
};

// Storage service functions
const storageService = {
  async getLoginStatus() {
    const { [STORAGE_KEYS.IS_LOGGED_IN]: isLoggedIn = false } = await chrome.storage.local.get([STORAGE_KEYS.IS_LOGGED_IN]);
    return isLoggedIn;
  },

  async setLoginStatus(isLoggedIn) {
    await chrome.storage.local.set({ [STORAGE_KEYS.IS_LOGGED_IN]: isLoggedIn });
  },

  async getSheetId() {
    const { [STORAGE_KEYS.SHEET_ID]: sheetId } = await chrome.storage.local.get([STORAGE_KEYS.SHEET_ID]);
    return sheetId || null;
  },

  async setSheetId(sheetId) {
    await chrome.storage.local.set({ [STORAGE_KEYS.SHEET_ID]: sheetId });
  },

  async getRecentJobs() {
    const { [STORAGE_KEYS.RECENT_JOBS]: recentJobs = [] } = await chrome.storage.local.get([STORAGE_KEYS.RECENT_JOBS]);
    return recentJobs;
  },

  async updateRecentJobs(jobData) {
    const recentJobs = await this.getRecentJobs();
    const updatedJobs = [jobData, ...recentJobs.slice(0, STORAGE_KEYS.MAX_RECENT_JOBS - 1)];
    await chrome.storage.local.set({ [STORAGE_KEYS.RECENT_JOBS]: updatedJobs });
  },

  async clearAll() {
    await chrome.storage.local.clear();
  },
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  storageService.setLoginStatus(false);
});

// Handle messages from popup and content script
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
    case "jobDetailsExtracted":
      handleExtractedJobDetails(request.jobData);
      break;
  }
  return true; // Keep the message channel open for async responses
});

/**
 * Handles Google OAuth login
 * @param {function} sendResponse - Callback to send response to popup
 */
async function handleLogin(sendResponse) {
  let token = null;
  try {
    console.log("Starting login process...");

    // Clear any existing sheet ID and login status
    await storageService.setSheetId(null);
    await storageService.setLoginStatus(false);
    console.log("Cleared existing sheet ID and login status");

    // Get the auth token
    token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken(
        {
          interactive: true,
          scopes: API_CONFIG.SCOPES,
        },
        (token) => {
          if (chrome.runtime.lastError) {
            console.error("Auth token error:", chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            console.log("Auth token received successfully");
            resolve(token);
          }
        }
      );
    });

    console.log("Got auth token:", token ? "Token received" : "No token");

    if (!token) {
      throw new Error("No auth token received");
    }

    // Create or get the Google Sheet
    console.log("Creating/getting sheet...");
    const sheetId = await sheetsService.createOrGetSheet(token);
    if (!sheetId) {
      throw new Error("Failed to create or get sheet");
    }

    console.log("Sheet created/retrieved successfully:", sheetId);

    // Verify the sheet ID is stored
    const storedSheetId = await storageService.getSheetId();
    console.log("Stored sheet ID:", storedSheetId);

    if (!storedSheetId) {
      throw new Error("Sheet ID not stored properly");
    }

    if (storedSheetId !== sheetId) {
      console.error("Sheet ID mismatch:", { stored: storedSheetId, created: sheetId });
      throw new Error("Sheet ID storage verification failed");
    }

    await storageService.setLoginStatus(true);
    console.log("Login status set to true");

    sendResponse({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      token: token ? "Token exists" : "No token",
    });
    await clearToken(token);
    await storageService.setLoginStatus(false);
    await storageService.setSheetId(null);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Saves job data to Google Sheet
 * @param {Object} jobData - Job data to save
 * @param {function} sendResponse - Callback to send response to popup
 */
async function saveJob(jobData, sendResponse) {
  let token = null;
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

/**
 * Gets recent jobs from storage
 * @param {function} sendResponse - Callback to send response to popup
 */
async function getRecentJobs(sendResponse) {
  try {
    const recentJobs = await storageService.getRecentJobs();
    sendResponse({ success: true, jobs: recentJobs });
  } catch (error) {
    console.error("Get recent jobs error:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handles extracted job details from LinkedIn
 * @param {Object} jobData - The extracted job data
 */
async function handleExtractedJobDetails(jobData) {
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
