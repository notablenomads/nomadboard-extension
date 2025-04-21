// Function to extract job details from LinkedIn
function extractJobDetails() {
  try {
    // Basic job information
    const jobTitle = document.querySelector(".job-details-jobs-unified-top-card__job-title")?.textContent?.trim();
    const companyName = document.querySelector(".job-details-jobs-unified-top-card__company-name")?.textContent?.trim();
    const jobDescription = document.querySelector(".job-details-jobs-unified-description__content")?.textContent?.trim();
    const jobUrl = window.location.href;

    // Additional job details
    const location =
      document.querySelector(".tvm__text.tvm__text--low-emphasis")?.textContent?.trim() ||
      document.querySelector(".job-details-jobs-unified-top-card__bullet")?.textContent?.trim();
    const jobType = document.querySelector(".job-details-jobs-unified-top-card__job-insight")?.textContent?.trim();
    const postedDate = document.querySelector(".job-details-jobs-unified-top-card__subtitle-secondary")?.textContent?.trim();

    // Company details
    const companySize = document.querySelector(".job-details-jobs-unified-top-card__company-size")?.textContent?.trim();
    const companyIndustry = document
      .querySelector(".job-details-jobs-unified-top-card__company-industry")
      ?.textContent?.trim();

    // Salary information (if available)
    const salaryInfo = document.querySelector(".job-details-jobs-unified-top-card__salary-info")?.textContent?.trim();

    if (jobTitle && companyName) {
      const jobData = {
        position: jobTitle,
        company: companyName,
        description: jobDescription,
        url: jobUrl,
        source: "LinkedIn",
        date: new Date().toISOString(),
        // Additional fields
        location: location || "",
        jobType: jobType || "",
        postedDate: postedDate || "",
        companySize: companySize || "",
        companyIndustry: companyIndustry || "",
        salaryInfo: salaryInfo || "",
        // Raw data for debugging
        rawData: {
          title: jobTitle,
          company: companyName,
          description: jobDescription,
          location,
          jobType,
          postedDate,
          companySize,
          companyIndustry,
          salaryInfo,
        },
      };

      console.log("Extracted job data:", jobData);
      return jobData;
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
