// Sheets service for managing Google Sheets operations
const SHEET_CONFIG = {
  NAME: "NomadBoard Job Applications",
  HEADERS: ["Date", "Job Title", "Company", "Status", "URL"],
  MAX_ROWS: 1000,
  COLUMNS: 5,
};

class SheetsService {
  constructor() {
    this.token = null;
  }

  initialize(token) {
    this.token = token;
  }

  async createOrGetSheet() {
    try {
      // First, try to find existing sheet
      const response = await fetch(
        "https://sheets.googleapis.com/v4/spreadsheets?q=title%3D" + encodeURIComponent(SHEET_CONFIG.NAME),
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
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

      // Add headers
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${createData.spreadsheetId}/values/A1:E1?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: [SHEET_CONFIG.HEADERS],
          }),
        }
      );

      return createData.spreadsheetId;
    } catch (error) {
      console.error("Sheet creation error:", error);
      return null;
    }
  }

  async appendJob(sheetId, jobData) {
    const values = [
      [new Date(jobData.date).toLocaleDateString(), jobData.title, jobData.company, jobData.status, jobData.url],
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:E:append?valueInputOption=RAW`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: values,
      }),
    });
  }
}

export const sheetsService = new SheetsService();
