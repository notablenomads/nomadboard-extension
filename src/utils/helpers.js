/**
 * Creates headers for API requests
 * @param {string} token - OAuth token
 * @returns {Object} Headers object
 */
export const createHeaders = (token) => ({
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
export const handleApiError = async (response, operation) => {
  const errorText = await response.text();
  console.error(`${operation} error:`, errorText);
  throw new Error(`${operation} failed: ${response.statusText}. Response: ${errorText}`);
};

/**
 * Clears the OAuth token
 * @param {string} token - Token to clear
 */
export const clearToken = async (token) => {
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

/**
 * Gets an auth token
 * @returns {Promise<string>} OAuth token
 */
export const getAuthToken = () => {
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

/**
 * Formats a date to ISO string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  return date.toISOString();
};

/**
 * Truncates a string to a maximum length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export const truncateString = (str, maxLength) => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
};

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function validateJobData(jobData) {
  return jobData.title && jobData.company && jobData.status;
}

export function createJobElement(job) {
  const div = document.createElement("div");
  div.className = "job-item";

  const title = document.createElement("h3");
  title.textContent = job.title;

  const company = document.createElement("p");
  company.textContent = job.company;

  const status = document.createElement("span");
  status.className = `status-badge status-${job.status}`;
  status.textContent = job.status.charAt(0).toUpperCase() + job.status.slice(1);

  const date = document.createElement("p");
  date.textContent = new Date(job.date).toLocaleDateString();

  div.appendChild(title);
  div.appendChild(company);
  div.appendChild(status);
  div.appendChild(date);

  return div;
}

export function showElement(element) {
  element.classList.remove("hidden");
}

export function hideElement(element) {
  element.classList.add("hidden");
}

export function clearForm(elements) {
  elements.jobTitle.value = "";
  elements.companyName.value = "";
  elements.jobStatus.selectedIndex = 0;
}
