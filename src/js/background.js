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

// API Configuration
const API_CONFIG = {
  BASE_URL: "https://sheets.googleapis.com/v4",
  DRIVE_URL: "https://www.googleapis.com/drive/v3",
  SCOPES: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
  VALUE_INPUT_OPTION: "RAW",
  INSERT_DATA_OPTION: "INSERT_ROWS",
};

// Google Sheets configuration
const GOOGLE_CONFIG = {
  SHEET_NAME: "NomadBoard Job Applications",
  HEADERS: ["Date", "Job Title", "Company", "Status", "URL"],
  MAX_ROWS: 1000,
  COLUMNS: 5,
};

// Storage keys for chrome.storage.local
const STORAGE_KEYS = {
  IS_LOGGED_IN: "isLoggedIn",
  SHEET_ID: "sheetId",
  RECENT_JOBS: "recentJobs",
  MAX_RECENT_JOBS: 10,
};

/**
 * Creates headers for API requests
 * @param {string} token - OAuth token
 * @returns {Object} Headers object
 */
const createHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  Accept: "application/json",
});

/**
 * Handles API errors and logs them
 * @param {Response} response - Fetch API response
 * @param {string} operation - Operation being performed
 * @returns {Promise<never>} Throws error with details
 */
const handleApiError = async (response, operation) => {
  const errorText = await response.text();
  console.error(`${operation} error:`, errorText);
  throw new Error(`${operation} failed: ${response.statusText}. Response: ${errorText}`);
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ [STORAGE_KEYS.IS_LOGGED_IN]: false });
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

/**
 * Handles Google OAuth login
 * @param {function} sendResponse - Callback to send response to popup
 */
async function handleLogin(sendResponse) {
  let token = null;
  try {
    console.log("Starting login process...");

    // Get the auth token
    token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken(
        {
          interactive: true,
          scopes: API_CONFIG.SCOPES,
        },
        (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
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
    const sheetId = await createOrGetSheet(token);
    if (!sheetId) {
      throw new Error("Failed to create or get sheet");
    }

    console.log("Sheet created/retrieved successfully:", sheetId);
    await chrome.storage.local.set({
      [STORAGE_KEYS.IS_LOGGED_IN]: true,
      [STORAGE_KEYS.SHEET_ID]: sheetId,
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    await clearToken(token);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Clears the OAuth token
 * @param {string} token - Token to clear
 */
async function clearToken(token) {
  if (token) {
    try {
      await new Promise((resolve) => {
        chrome.identity.removeCachedAuthToken({ token }, resolve);
      });
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }
}

/**
 * Creates or retrieves a Google Sheet
 * @param {string} token - OAuth token
 * @returns {Promise<string|null>} Sheet ID or null if failed
 */
async function createOrGetSheet(token) {
  try {
    console.log("Searching for existing sheet...");
    const sheetId = await findExistingSheet(token);
    if (sheetId) {
      return sheetId;
    }

    return await createNewSheet(token);
  } catch (error) {
    console.error("Sheet creation error:", error);
    return null;
  }
}

/**
 * Finds an existing Google Sheet
 * @param {string} token - OAuth token
 * @returns {Promise<string|null>} Sheet ID or null if not found
 */
async function findExistingSheet(token) {
  const searchResponse = await fetch(
    `${API_CONFIG.DRIVE_URL}/files?q=name%3D'${encodeURIComponent(
      GOOGLE_CONFIG.SHEET_NAME
    )}'%20and%20mimeType%3D'application/vnd.google-apps.spreadsheet'`,
    {
      headers: createHeaders(token),
    }
  );

  if (!searchResponse.ok) {
    await handleApiError(searchResponse, "Search sheet");
  }

  const searchData = await searchResponse.json();
  console.log("Search response:", searchData);

  if (searchData.files && searchData.files.length > 0) {
    console.log("Found existing sheet:", searchData.files[0].id);
    return searchData.files[0].id;
  }

  return null;
}

/**
 * Creates a new Google Sheet
 * @param {string} token - OAuth token
 * @returns {Promise<string|null>} Sheet ID or null if failed
 */
async function createNewSheet(token) {
  console.log("No existing sheet found, creating new one...");
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
    await handleApiError(createResponse, "Create sheet");
  }

  const createData = await createResponse.json();
  console.log("Create response:", createData);

  if (!createData.spreadsheetId) {
    throw new Error("No spreadsheet ID in response");
  }

  await addHeaders(token, createData.spreadsheetId);
  return createData.spreadsheetId;
}

/**
 * Adds headers to a new sheet
 * @param {string} token - OAuth token
 * @param {string} sheetId - Sheet ID
 */
async function addHeaders(token, sheetId) {
  console.log("Adding headers to new sheet...");
  const headerResponse = await fetch(
    `${API_CONFIG.BASE_URL}/spreadsheets/${sheetId}/values/A1:E1?valueInputOption=${API_CONFIG.VALUE_INPUT_OPTION}`,
    {
      method: "PUT",
      headers: createHeaders(token),
      body: JSON.stringify({
        range: "A1:E1",
        majorDimension: "ROWS",
        values: [GOOGLE_CONFIG.HEADERS],
      }),
    }
  );

  if (!headerResponse.ok) {
    await handleApiError(headerResponse, "Add headers");
  }
}

/**
 * Saves job data to Google Sheet
 * @param {JobData} jobData - Job data to save
 * @param {function} sendResponse - Callback to send response to popup
 */
async function saveJob(jobData, sendResponse) {
  let token = null;
  try {
    const { sheetId } = await chrome.storage.local.get([STORAGE_KEYS.SHEET_ID]);
    if (!sheetId) {
      throw new Error("No sheet ID found");
    }

    token = await getAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    await appendJobData(token, sheetId, jobData);
    await updateRecentJobs(jobData);

    console.log("Job saved successfully");
    sendResponse({ success: true });
  } catch (error) {
    console.error("Save job error:", error);
    await clearToken(token);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Gets an auth token
 * @returns {Promise<string>} OAuth token
 */
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Appends job data to the sheet
 * @param {string} token - OAuth token
 * @param {string} sheetId - Sheet ID
 * @param {JobData} jobData - Job data to append
 */
async function appendJobData(token, sheetId, jobData) {
  const values = [[new Date().toISOString(), jobData.position, jobData.company, jobData.status, jobData.notes || ""]];
  console.log("Adding job data:", values);

  const appendResponse = await fetch(
    `${API_CONFIG.BASE_URL}/spreadsheets/${sheetId}/values/A:E:append?valueInputOption=${API_CONFIG.VALUE_INPUT_OPTION}&insertDataOption=${API_CONFIG.INSERT_DATA_OPTION}`,
    {
      method: "POST",
      headers: createHeaders(token),
      body: JSON.stringify({
        range: "A:E",
        majorDimension: "ROWS",
        values: values,
      }),
    }
  );

  if (!appendResponse.ok) {
    await handleApiError(appendResponse, "Append data");
  }
}

/**
 * Updates the recent jobs in storage
 * @param {JobData} jobData - New job data
 */
async function updateRecentJobs(jobData) {
  const { recentJobs = [] } = await chrome.storage.local.get([STORAGE_KEYS.RECENT_JOBS]);
  const updatedJobs = [jobData, ...recentJobs.slice(0, STORAGE_KEYS.MAX_RECENT_JOBS - 1)];
  await chrome.storage.local.set({ [STORAGE_KEYS.RECENT_JOBS]: updatedJobs });
}

/**
 * Gets recent jobs from storage
 * @param {function} sendResponse - Callback to send response to popup
 */
async function getRecentJobs(sendResponse) {
  try {
    const { recentJobs = [] } = await chrome.storage.local.get([STORAGE_KEYS.RECENT_JOBS]);
    sendResponse({ success: true, jobs: recentJobs });
  } catch (error) {
    console.error("Get recent jobs error:", error);
    sendResponse({ success: false, error: error.message });
  }
}
