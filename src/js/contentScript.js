// Function to extract job details from LinkedIn
function extractJobDetails() {
  try {
    // Basic job information
    const jobTitle = document.querySelector(".job-details-jobs-unified-top-card__job-title")?.textContent?.trim();
    const companyName = document.querySelector(".job-details-jobs-unified-top-card__company-name")?.textContent?.trim();
    const jobDescription = document.querySelector(".job-details-jobs-unified-description__content")?.textContent?.trim();

    // Get the actual job URL from the page
    let jobUrl = window.location.href;
    // If we're on a search page, try to get the actual job URL
    if (jobUrl.includes("search")) {
      // Try to get the job ID from the URL
      const jobIdMatch = jobUrl.match(/currentJobId=(\d+)/);
      if (jobIdMatch && jobIdMatch[1]) {
        jobUrl = `https://www.linkedin.com/jobs/view/${jobIdMatch[1]}`;
      }
    }
    console.log("Job URL:", jobUrl);

    // Additional job details
    // Try multiple selectors for location
    const locationSelectors = [
      ".tvm__text.tvm__text--low-emphasis",
      ".job-details-jobs-unified-top-card__bullet",
      ".job-details-jobs-unified-top-card__primary-description",
      ".job-details-jobs-unified-top-card__subtitle-secondary",
      ".job-details-jobs-unified-top-card__job-insight",
      ".job-details-jobs-unified-top-card__job-insight-container",
    ];

    let location = "";
    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent.replace(/<!---->/g, "").trim();
        console.log(`Found location with selector ${selector}:`, text);
        if (text && !text.includes("Posted") && !text.includes("Full-time") && !text.includes("Part-time")) {
          location = text;
          break;
        }
      }
    }

    console.log("Final extracted location:", location);
    console.log("Current URL:", window.location.href);

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
