// Function to extract job details from LinkedIn
function extractJobDetails() {
  try {
    // Basic job information
    const jobTitle = document.querySelector(".job-details-jobs-unified-top-card__job-title")?.textContent?.trim();
    const companyName = document.querySelector(".job-details-jobs-unified-top-card__company-name")?.textContent?.trim();
    const jobDescription = document.querySelector(".job-details-jobs-unified-description__content")?.textContent?.trim();

    // Use the current URL for the job URL
    const jobUrl = window.location.href;
    console.log("Job URL:", jobUrl);

    // Extract location from the job details section
    let location = "";
    const locationElement = document.querySelector(
      ".job-details-jobs-unified-top-card__tertiary-description-container .tvm__text.tvm__text--low-emphasis"
    );
    if (locationElement) {
      location = locationElement.textContent.replace(/<!---->/g, "").trim();
      console.log("Found location:", location);
    }

    // Extract job type (Remote, Hybrid, On-site) and employment type (Full-time, Part-time)
    let jobType = "";
    let employmentType = "";

    // Look for job type and employment type in the preferences and skills section
    const preferencePills = document.querySelectorAll(".job-details-preferences-and-skills__pill");
    preferencePills.forEach((pill) => {
      const text = pill.textContent.trim();
      if (text.includes("Remote") || text.includes("Hybrid") || text.includes("On-site")) {
        jobType = text.replace(/<!---->/g, "").trim();
        console.log("Found job type:", jobType);
      } else if (
        text.includes("Full-time") ||
        text.includes("Part-time") ||
        text.includes("Contract") ||
        text.includes("Temporary")
      ) {
        employmentType = text.replace(/<!---->/g, "").trim();
        console.log("Found employment type:", employmentType);
      }
    });

    // If we still don't have a location, try to find it in the job title or description
    if (!location) {
      // Check if the job title contains location information
      if (jobTitle) {
        // Check for location in parentheses
        const parenthesesMatch = jobTitle.match(/\((.*?)\)/);
        if (parenthesesMatch && parenthesesMatch[1]) {
          const possibleLocation = parenthesesMatch[1].trim();
          if (possibleLocation.includes(",")) {
            location = possibleLocation;
            console.log("Found location in job title parentheses:", location);
          }
        }

        // Check for location after a hyphen
        if (!location && jobTitle.includes(" - ")) {
          const parts = jobTitle.split(" - ");
          if (parts.length > 1) {
            const possibleLocation = parts[parts.length - 1].trim();
            if (possibleLocation.includes(",")) {
              location = possibleLocation;
              console.log("Found location in job title after hyphen:", location);
            }
          }
        }
      }
    }

    console.log("Final extracted location:", location);
    console.log("Final extracted job type:", jobType);
    console.log("Final extracted employment type:", employmentType);
    console.log("Current URL:", window.location.href);

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
        employmentType: employmentType || "",
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
          employmentType,
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
