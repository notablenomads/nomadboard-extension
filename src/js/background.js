// Google Sheets API configuration
const GOOGLE_CONFIG = {
  SHEET_NAME: "NomadBoard Job Applications",
  HEADERS: ["Date", "Job Title", "Company", "Status", "URL"],
  MAX_ROWS: 1000,
  COLUMNS: 5,
};

const STORAGE_KEYS = {
  IS_LOGGED_IN: "isLoggedIn",
  SHEET_ID: "sheetId",
  RECENT_JOBS: "recentJobs",
  MAX_RECENT_JOBS: 10,
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isLoggedIn: false });
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

// Handle Google OAuth login
async function handleLogin(sendResponse) {
  let token = null;
  try {
    console.log("Starting login process...");

    // Get the auth token
    const authResult = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken(
        {
          interactive: true,
          scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
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

    token = authResult;
    console.log("Got auth token:", token ? "Token received" : "No token");

    if (!token) {
      console.error("No token received");
      sendResponse({ success: false, error: "No auth token received" });
      return;
    }

    // Create or get the Google Sheet
    console.log("Creating/getting sheet...");
    const sheetId = await createOrGetSheet(token);
    if (!sheetId) {
      console.error("Failed to create/get sheet");
      // Clear the token if sheet creation fails
      if (token) {
        await new Promise((resolve) => {
          chrome.identity.removeCachedAuthToken({ token }, resolve);
        });
      }
      sendResponse({ success: false, error: "Failed to create or get sheet" });
      return;
    }

    console.log("Sheet created/retrieved successfully:", sheetId);
    await chrome.storage.local.set({
      isLoggedIn: true,
      sheetId: sheetId,
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    // Clear the token if we have one
    if (token) {
      try {
        await new Promise((resolve) => {
          chrome.identity.removeCachedAuthToken({ token }, resolve);
        });
      } catch (removeError) {
        console.error("Error removing token:", removeError);
      }
    }
    sendResponse({ success: false, error: error.message });
  }
}

// Create or get the Google Sheet
async function createOrGetSheet(token) {
  try {
    console.log("Searching for existing sheet...");
    // First, try to find existing sheet
    const searchResponse = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=name%3D'" +
        encodeURIComponent(GOOGLE_CONFIG.SHEET_NAME) +
        "'%20and%20mimeType%3D'application/vnd.google-apps.spreadsheet'",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Search response error:", errorText);
      throw new Error(`Failed to search for sheet: ${searchResponse.statusText}. Response: ${errorText}`);
    }

    const searchData = await searchResponse.json();
    console.log("Search response:", searchData);

    if (searchData.files && searchData.files.length > 0) {
      console.log("Found existing sheet:", searchData.files[0].id);
      return searchData.files[0].id;
    }

    console.log("No existing sheet found, creating new one...");
    // Create new sheet if none exists
    const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
      console.error("Create response error:", errorText);
      throw new Error(`Failed to create sheet: ${createResponse.statusText}. Response: ${errorText}`);
    }

    const createData = await createResponse.json();
    console.log("Create response:", createData);

    if (!createData.spreadsheetId) {
      throw new Error("No spreadsheet ID in response");
    }

    // Add headers
    console.log("Adding headers to new sheet...");
    const headerResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${createData.spreadsheetId}/values/A1:E1`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          range: "A1:E1",
          majorDimension: "ROWS",
          values: [GOOGLE_CONFIG.HEADERS],
        }),
      }
    );

    if (!headerResponse.ok) {
      const errorText = await headerResponse.text();
      console.error("Header response error:", errorText);
      throw new Error(`Failed to add headers: ${headerResponse.statusText}. Response: ${errorText}`);
    }

    console.log("Successfully created new sheet:", createData.spreadsheetId);
    return createData.spreadsheetId;
  } catch (error) {
    console.error("Sheet creation error:", error);
    return null;
  }
}

// Save job to Google Sheet
async function saveJob(jobData, sendResponse) {
  let token = null;
  try {
    const { sheetId } = await chrome.storage.local.get(["sheetId"]);
    if (!sheetId) {
      sendResponse({ success: false, error: "No sheet ID found" });
      return;
    }

    // Get the auth token
    token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(token);
        }
      });
    });

    if (!token) {
      sendResponse({ success: false, error: "Not authenticated" });
      return;
    }

    console.log("Getting next empty row...");
    // Get the next empty row
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:A`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Get next row error:", errorText);
      throw new Error(`Failed to get next row: ${response.statusText}. Response: ${errorText}`);
    }

    const data = await response.json();
    const nextRow = data.values ? data.values.length + 1 : 2;
    console.log("Next row:", nextRow);

    // Add the job data
    const values = [[new Date().toISOString(), jobData.position, jobData.company, jobData.status, jobData.notes || ""]];
    console.log("Adding job data:", values);

    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A${nextRow}:E${nextRow}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          range: `A${nextRow}:E${nextRow}`,
          majorDimension: "ROWS",
          values: values,
        }),
      }
    );

    if (!appendResponse.ok) {
      const errorText = await appendResponse.text();
      console.error("Append data error:", errorText);
      throw new Error(`Failed to append data: ${appendResponse.statusText}. Response: ${errorText}`);
    }

    // Update recent jobs in storage
    const { recentJobs = [] } = await chrome.storage.local.get(["recentJobs"]);
    const updatedJobs = [jobData, ...recentJobs.slice(0, STORAGE_KEYS.MAX_RECENT_JOBS - 1)];
    await chrome.storage.local.set({ recentJobs: updatedJobs });

    console.log("Job saved successfully");
    sendResponse({ success: true });
  } catch (error) {
    console.error("Save job error:", error);
    // Clear the token if we have one and there's an error
    if (token) {
      try {
        await new Promise((resolve) => {
          chrome.identity.removeCachedAuthToken({ token }, resolve);
        });
      } catch (removeError) {
        console.error("Error removing token:", removeError);
      }
    }
    sendResponse({ success: false, error: error.message });
  }
}

// Get recent jobs from storage
async function getRecentJobs(sendResponse) {
  try {
    const { recentJobs = [] } = await chrome.storage.local.get(["recentJobs"]);
    sendResponse({ success: true, jobs: recentJobs });
  } catch (error) {
    console.error("Get recent jobs error:", error);
    sendResponse({ success: false, error: error.message });
  }
}
