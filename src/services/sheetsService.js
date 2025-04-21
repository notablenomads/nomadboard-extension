/**
 * @typedef {Object} JobData
 * @property {string} position - Job position/title
 * @property {string} company - Company name
 * @property {string} status - Application status
 * @property {string} [notes] - Optional notes about the application
 */

import { API_CONFIG, GOOGLE_CONFIG } from "../config/google.js";
import { STORAGE_KEYS } from "../js/constants.js";
import { handleApiError, createHeaders } from "../utils/helpers.js";

/**
 * Service for handling Google Sheets operations
 */
class SheetsService {
  /**
   * Creates or retrieves a Google Sheet
   * @param {string} token - OAuth token
   * @returns {Promise<string|null>} Sheet ID or null if failed
   */
  async createOrGetSheet(token) {
    try {
      console.log("Searching for existing sheet...");
      const sheetId = await this.findExistingSheet(token);
      if (sheetId) {
        return sheetId;
      }

      return await this.createNewSheet(token);
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
  async findExistingSheet(token) {
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
  async createNewSheet(token) {
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

    await this.addHeaders(token, createData.spreadsheetId);
    return createData.spreadsheetId;
  }

  /**
   * Adds headers to a new sheet
   * @param {string} token - OAuth token
   * @param {string} sheetId - Sheet ID
   */
  async addHeaders(token, sheetId) {
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
   * Appends job data to the sheet
   * @param {string} token - OAuth token
   * @param {string} sheetId - Sheet ID
   * @param {JobData} jobData - Job data to append
   */
  async appendJobData(token, sheetId, jobData) {
    console.log("Received job data for sheet:", jobData);

    const values = [
      [
        new Date().toISOString(),
        jobData.position,
        jobData.company,
        jobData.status,
        jobData.location || "",
        jobData.jobType || "",
        jobData.postedDate || "",
        jobData.companySize || "",
        jobData.companyIndustry || "",
        jobData.salaryInfo || "",
        jobData.url || "",
        jobData.notes || "",
      ],
    ];
    console.log("Formatted values for sheet:", values);

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
      await handleApiError(appendResponse, "Append data");
    }
  }
}

export const sheetsService = new SheetsService();
