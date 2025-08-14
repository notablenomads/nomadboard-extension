import { LINKEDIN_SELECTORS, MESSAGE_ACTIONS } from "../config/constants";
import { ExtractedJobData, ApiResponse } from "../types";

function extractJobDetails(): ExtractedJobData | null {
  try {
    const jobTitle = document.querySelector(LINKEDIN_SELECTORS.JOB_TITLE)?.textContent?.trim();
    const companyName = document.querySelector(LINKEDIN_SELECTORS.COMPANY_NAME)?.textContent?.trim();
    const jobDescription = document.querySelector(LINKEDIN_SELECTORS.JOB_DESCRIPTION)?.textContent?.trim();
    const jobUrl = window.location.href;

    if (jobTitle && companyName) {
      return {
        position: jobTitle,
        company: companyName,
        description: jobDescription,
        url: jobUrl,
        source: "LinkedIn",
        date: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error extracting job details:", error);
    return null;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === MESSAGE_ACTIONS.EXTRACT_JOB_DETAILS) {
    const jobDetails = extractJobDetails();
    if (jobDetails) {
      sendResponse({ success: true, data: jobDetails });
    } else {
      sendResponse({ success: false, error: "Could not extract job details" });
    }
  }
  return true;
});

const jobDetails = extractJobDetails();
if (jobDetails) {
  chrome.runtime.sendMessage({
    action: MESSAGE_ACTIONS.JOB_DETAILS_EXTRACTED,
    jobData: jobDetails,
  });
}
