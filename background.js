// Google Sheets API configuration
const SHEET_NAME = "NomadBoard Job Applications";
const HEADERS = ["Date", "Job Title", "Company", "Status", "URL"];

// Initialize extension
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({ isLoggedIn: false });
});

// Handle messages from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
  try {
    const token = await chrome.identity.getAuthToken({ interactive: true });
    if (!token) {
      sendResponse({ success: false });
      return;
    }

    // Create or get the Google Sheet
    const sheetId = await createOrGetSheet(token);
    if (!sheetId) {
      sendResponse({ success: false });
      return;
    }

    chrome.storage.local.set({
      isLoggedIn: true,
      sheetId: sheetId,
    });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    sendResponse({ success: false });
  }
}

// Create or get the Google Sheet
async function createOrGetSheet(token) {
  try {
    // First, try to find existing sheet
    const response = await fetch(
      "https://sheets.googleapis.com/v4/spreadsheets?q=title%3D" + encodeURIComponent(SHEET_NAME),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();

    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    // Create new sheet if none exists
    const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          title: SHEET_NAME,
        },
        sheets: [
          {
            properties: {
              title: "Applications",
              gridProperties: {
                rowCount: 1000,
                columnCount: 5,
              },
            },
          },
        ],
      }),
    });

    const createData = await createResponse.json();

    // Add headers
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${createData.spreadsheetId}/values/A1:E1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [HEADERS],
        }),
      }
    );

    return createData.spreadsheetId;
  } catch (error) {
    console.error("Sheet creation error:", error);
    return null;
  }
}

// Save job to Google Sheet
async function saveJob(jobData, sendResponse) {
  try {
    const { sheetId } = await chrome.storage.local.get(["sheetId"]);
    const token = await chrome.identity.getAuthToken({ interactive: false });

    if (!sheetId || !token) {
      sendResponse({ success: false });
      return;
    }

    const values = [
      [new Date(jobData.date).toLocaleDateString(), jobData.title, jobData.company, jobData.status, jobData.url],
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:E:append?valueInputOption=RAW`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: values,
      }),
    });

    // Store in local storage for recent jobs
    const { recentJobs = [] } = await chrome.storage.local.get(["recentJobs"]);
    recentJobs.unshift(jobData);
    await chrome.storage.local.set({ recentJobs: recentJobs.slice(0, 10) });

    sendResponse({ success: true });
  } catch (error) {
    console.error("Save job error:", error);
    sendResponse({ success: false });
  }
}

// Get recent jobs from local storage
async function getRecentJobs(sendResponse) {
  try {
    const { recentJobs = [] } = await chrome.storage.local.get(["recentJobs"]);
    sendResponse(recentJobs);
  } catch (error) {
    console.error("Get recent jobs error:", error);
    sendResponse([]);
  }
}
