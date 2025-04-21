// Function to extract job details from LinkedIn
function extractJobDetails() {
  try {
    // Wait for the job details to load
    const jobTitle = document.querySelector(".job-details-jobs-unified-top-card__job-title")?.textContent?.trim();
    const companyName = document.querySelector(".job-details-jobs-unified-top-card__company-name")?.textContent?.trim();
    const jobDescription = document.querySelector(".job-details-jobs-unified-description__content")?.textContent?.trim();
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

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractJobDetails") {
    const jobDetails = extractJobDetails();
    if (jobDetails) {
      sendResponse({ success: true, jobData: jobDetails });
    } else {
      sendResponse({ success: false, error: "Could not extract job details" });
    }
  }
  return true;
});

// Notify the extension when the page is ready
const jobDetails = extractJobDetails();
if (jobDetails) {
  chrome.runtime.sendMessage({
    action: "jobDetailsExtracted",
    jobData: jobDetails,
  });
}
