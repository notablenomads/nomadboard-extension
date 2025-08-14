import { API_CONFIG, GOOGLE_CONFIG } from '../config/constants';
import { JobData } from '../types';
import { createHeaders, handleApiError } from '../utils/api';

export class SheetsService {
  async createOrGetSheet(token: string): Promise<string | null> {
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

  async findExistingSheet(token: string): Promise<string | null> {
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

  async createNewSheet(token: string): Promise<string> {
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

  async addHeaders(token: string, sheetId: string): Promise<void> {
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

  async appendJobData(token: string, sheetId: string, jobData: JobData): Promise<void> {
    const values = [[
      new Date().toISOString(), 
      jobData.position, 
      jobData.company, 
      jobData.status, 
      jobData.notes || ""
    ]];
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
}

export const sheetsService = new SheetsService();
