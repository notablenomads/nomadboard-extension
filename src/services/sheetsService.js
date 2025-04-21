/**
 * @typedef {Object} JobData
 * @property {string} position - Job position/title
 * @property {string} company - Company name
 * @property {string} status - Application status
 * @property {string} location - Job location
 * @property {string} jobType - Job type (Remote, Hybrid, On-site)
 * @property {string} employmentType - Employment type (Full-time, Part-time, Contract, Temporary)
 * @property {string} companySize - Company size
 * @property {string} companyIndustry - Company industry
 * @property {string} salaryInfo - Salary information
 * @property {string} url - Job URL
 * @property {string} notes - Optional notes about the application
 * @property {string} date - Date when the job was added
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

    return createData.spreadsheetId;
  }

  /**
   * Adds headers to the sheet
   * @param {string} token - OAuth token
   * @param {string} sheetId - Sheet ID
   * @returns {Promise<boolean>} Success status
   */
  async addHeaders(token, sheetId) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/spreadsheets/${sheetId}/values/A1:L1?valueInputOption=${API_CONFIG.VALUE_INPUT_OPTION}`,
        {
          method: "PUT",
          headers: createHeaders(token),
          body: JSON.stringify({
            values: [GOOGLE_CONFIG.HEADERS],
          }),
        }
      );

      if (!response.ok) {
        await handleApiError(response, "Add headers");
      }

      return true;
    } catch (error) {
      console.error("Error adding headers:", error);
      return false;
    }
  }

  /**
   * Appends job data to the sheet
   * @param {string} token - OAuth token
   * @param {string} sheetId - Sheet ID
   * @param {JobData} jobData - Job data to append
   * @returns {Promise<boolean>} Success status
   */
  async appendJobData(token, sheetId, jobData) {
    try {
      // Format the date
      const date = new Date(jobData.date);
      const formattedDate = date.toLocaleDateString();

      // Prepare the row data in the same order as the headers
      const rowData = [
        formattedDate,
        jobData.position || "",
        jobData.company || "",
        jobData.status || "",
        jobData.location || "",
        jobData.jobType || "",
        jobData.employmentType || "",
        jobData.companySize || "",
        jobData.companyIndustry || "",
        jobData.salaryInfo || "",
        jobData.url || "",
        jobData.notes || "",
      ];

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/spreadsheets/${sheetId}/values/A:L:append?valueInputOption=${API_CONFIG.VALUE_INPUT_OPTION}&insertDataOption=${API_CONFIG.INSERT_DATA_OPTION}`,
        {
          method: "POST",
          headers: createHeaders(token),
          body: JSON.stringify({
            values: [rowData],
          }),
        }
      );

      if (!response.ok) {
        await handleApiError(response, "Append job data");
      }

      return true;
    } catch (error) {
      console.error("Error appending job data:", error);
      return false;
    }
  }

  /**
   * Gets recent jobs from the sheet
   * @param {string} token - OAuth token
   * @param {string} sheetId - Sheet ID
   * @param {number} limit - Maximum number of jobs to retrieve
   * @returns {Promise<JobData[]>} Array of job data
   */
  async getRecentJobs(token, sheetId, limit = 10) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/spreadsheets/${sheetId}/values/A2:L${limit + 1}`, {
        headers: createHeaders(token),
      });

      if (!response.ok) {
        await handleApiError(response, "Get recent jobs");
      }

      const data = await response.json();
      if (!data.values || data.values.length === 0) {
        return [];
      }

      // Convert the row data to JobData objects
      return data.values.map((row) => {
        const [
          date,
          position,
          company,
          status,
          location,
          jobType,
          employmentType,
          companySize,
          companyIndustry,
          salaryInfo,
          url,
          notes,
        ] = row;
        return {
          date,
          position,
          company,
          status,
          location,
          jobType,
          employmentType,
          companySize,
          companyIndustry,
          salaryInfo,
          url,
          notes,
        };
      });
    } catch (error) {
      console.error("Error getting recent jobs:", error);
      return [];
    }
  }
}

export default new SheetsService();
