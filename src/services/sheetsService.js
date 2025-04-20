import { SHEET_CONFIG, API_ENDPOINTS } from "../js/constants.js";

class SheetsService {
  constructor() {
    this.token = null;
  }

  async initialize(token) {
    this.token = token;
  }

  async createOrGetSheet() {
    try {
      const existingSheet = await this.findExistingSheet();
      if (existingSheet) {
        return existingSheet;
      }
      return await this.createNewSheet();
    } catch (error) {
      console.error("Sheet creation error:", error);
      return null;
    }
  }

  async findExistingSheet() {
    const response = await fetch(API_ENDPOINTS.SHEETS_SEARCH + encodeURIComponent(SHEET_CONFIG.NAME), {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  }

  async createNewSheet() {
    const createResponse = await fetch(API_ENDPOINTS.SHEETS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          title: SHEET_CONFIG.NAME,
        },
        sheets: [
          {
            properties: {
              title: "Applications",
              gridProperties: {
                rowCount: SHEET_CONFIG.MAX_ROWS,
                columnCount: SHEET_CONFIG.COLUMNS,
              },
            },
          },
        ],
      }),
    });

    const createData = await createResponse.json();
    await this.addHeaders(createData.spreadsheetId);
    return createData.spreadsheetId;
  }

  async addHeaders(sheetId) {
    await fetch(`${API_ENDPOINTS.SHEETS}/${sheetId}/values/A1:E1?valueInputOption=RAW`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [SHEET_CONFIG.HEADERS],
      }),
    });
  }

  async appendJob(sheetId, jobData) {
    const values = [
      [new Date(jobData.date).toLocaleDateString(), jobData.title, jobData.company, jobData.status, jobData.url],
    ];

    await fetch(`${API_ENDPOINTS.SHEETS}/${sheetId}/values/A:E:append?valueInputOption=RAW`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    });
  }
}

export const sheetsService = new SheetsService();
