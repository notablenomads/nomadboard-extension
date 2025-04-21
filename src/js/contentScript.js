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

    // Additional job details
    // Try multiple selectors for location
    const locationSelectors = [
      ".tvm__text.tvm__text--low-emphasis",
      ".job-details-jobs-unified-top-card__bullet",
      ".job-details-jobs-unified-top-card__primary-description",
      ".job-details-jobs-unified-top-card__subtitle-secondary",
      ".job-details-jobs-unified-top-card__job-insight",
      ".job-details-jobs-unified-top-card__job-insight-container",
      // Try more specific selectors
      "span[class*='location']",
      "div[class*='location']",
      "span[class*='job-location']",
      "div[class*='job-location']",
      // Try to find the location in the job card
      ".job-card-container__metadata-item",
      ".job-card-container__primary-description",
      ".job-card-container__location",
      // Try to find the location in the job details
      ".job-details-jobs-unified-top-card__job-insight-container .job-details-jobs-unified-top-card__job-insight",
      ".job-details-jobs-unified-top-card__job-insight-container .job-details-jobs-unified-top-card__bullet",
    ];

    let location = "";
    for (const selector of locationSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        // Clean the text content by removing HTML comments and extra whitespace
        const text = element.textContent
          .replace(/<!---->/g, "") // Remove HTML comments
          .replace(/\s+/g, " ") // Replace multiple spaces with single space
          .trim();

        console.log(`Found location with selector ${selector}:`, text);

        // Skip if the text contains placeholder or search-related content
        if (
          text &&
          !text.includes("Posted") &&
          !text.includes("Full-time") &&
          !text.includes("Part-time") &&
          !text.includes("City, state") &&
          !text.includes("Clear search") &&
          !text.includes("Enter location") &&
          !text.includes("Search") &&
          !text.includes("Filter") &&
          !text.includes("Sort") &&
          !text.includes("Apply") &&
          !text.includes("Save") &&
          !text.includes("Share")
        ) {
          location = text;
          break;
        }
      }
    }

    // If we still don't have a location, try to find it in the job details section
    if (!location) {
      // Look for the job details section
      const jobDetailsSection = document.querySelector(".job-details-jobs-unified-top-card");
      if (jobDetailsSection) {
        // Look for elements that might contain location information
        const possibleLocationElements = jobDetailsSection.querySelectorAll("span, div, p");
        for (const element of possibleLocationElements) {
          const text = element.textContent.trim();
          if (
            text &&
            !text.includes("Posted") &&
            !text.includes("Full-time") &&
            !text.includes("Part-time") &&
            !text.includes("City, state") &&
            !text.includes("Clear search") &&
            !text.includes("Enter location")
          ) {
            // Check if the text looks like a location
            if (text.includes(",") || text.includes("Remote") || text.includes("Hybrid") || text.includes("On-site")) {
              location = text;
              console.log("Found location in job details section:", location);
              break;
            }
          }
        }
      }
    }

    // If we still don't have a location, try to find elements containing location-related text
    if (!location) {
      // Look for elements containing location-related text
      const locationKeywords = ["Location", "Based in", "Remote", "Hybrid", "On-site"];
      const allElements = document.querySelectorAll("span, div, p, li");

      for (const element of allElements) {
        const text = element.textContent.trim();
        if (text) {
          // Skip placeholder text or search field text
          if (
            text.includes("City, state") ||
            text.includes("Clear search") ||
            text.includes("Enter location") ||
            text.includes("Search") ||
            text.includes("Filter") ||
            text.includes("Sort") ||
            text.includes("Apply") ||
            text.includes("Save") ||
            text.includes("Share")
          ) {
            continue;
          }

          // Check if the element contains any location keywords
          const hasKeyword = locationKeywords.some((keyword) => text.includes(keyword));
          // Check if the text looks like a location (contains commas or is a known location format)
          const looksLikeLocation =
            text.includes(",") || text.includes("Remote") || text.includes("Hybrid") || text.includes("On-site");

          if (hasKeyword || looksLikeLocation) {
            console.log("Found potential location element:", text);
            // Extract just the location part if it contains a keyword
            if (hasKeyword) {
              const parts = text.split(":");
              if (parts.length > 1) {
                location = parts[1].trim();
              } else {
                location = text;
              }
            } else {
              location = text;
            }
            break;
          }
        }
      }
    }

    // If we still don't have a location, try to find it in the job title or description
    if (!location) {
      // Check if the job title contains location information
      if (jobTitle) {
        // Check for location in parentheses
        const parenthesesMatch = jobTitle.match(/\((.*?)\)/);
        if (parenthesesMatch && parenthesesMatch[1]) {
          const possibleLocation = parenthesesMatch[1].trim();
          if (
            possibleLocation.includes(",") ||
            possibleLocation.includes("Remote") ||
            possibleLocation.includes("Hybrid") ||
            possibleLocation.includes("On-site")
          ) {
            location = possibleLocation;
            console.log("Found location in job title parentheses:", location);
          }
        }

        // Check for location after a hyphen
        if (!location && jobTitle.includes(" - ")) {
          const parts = jobTitle.split(" - ");
          if (parts.length > 1) {
            const possibleLocation = parts[parts.length - 1].trim();
            if (
              possibleLocation.includes(",") ||
              possibleLocation.includes("Remote") ||
              possibleLocation.includes("Hybrid") ||
              possibleLocation.includes("On-site")
            ) {
              location = possibleLocation;
              console.log("Found location in job title after hyphen:", location);
            }
          }
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
