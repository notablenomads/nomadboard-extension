// UI Elements
const UI_ELEMENTS = {
  LOGIN_SECTION: "login-section",
  JOB_FORM: "job-form",
  RECENT_JOBS: "recent-jobs",
  LOGIN_BUTTON: "login-button",
  SAVE_JOB_BUTTON: "save-job",
  JOBS_LIST: "jobs-list",
  JOB_TITLE: "job-title",
  COMPANY_NAME: "company-name",
  LOCATION: "location",
  JOB_TYPE: "job-type",
  EMPLOYMENT_TYPE: "employment-type",
  COMPANY_SIZE: "company-size",
  COMPANY_INDUSTRY: "company-industry",
  SALARY_INFO: "salary-info",
  URL: "url",
  JOB_STATUS: "job-status",
  NOTES: "notes",
};

const JOB_STATUS = {
  WISHLIST: "wishlist",
  APPLIED: "applied",
  INTERVIEW: "interview",
  OFFER: "offer",
  REJECTED: "rejected",
};

// Helper functions
function validateJobData(jobData) {
  return jobData.position && jobData.company && jobData.status;
}

function createJobElement(job) {
  const div = document.createElement("div");
  div.className = "job-item";

  const company = document.createElement("h3");
  company.textContent = job.company;

  const position = document.createElement("p");
  position.textContent = job.position;

  const location = document.createElement("p");
  location.className = "job-location";
  location.textContent = job.location || "Location not specified";

  const jobType = document.createElement("p");
  jobType.className = "job-type";
  jobType.textContent = job.jobType
    ? `${job.jobType}${job.employmentType ? ` - ${job.employmentType}` : ""}`
    : "Job type not specified";

  const status = document.createElement("span");
  status.className = `status-badge status-${job.status.toLowerCase()}`;
  status.textContent = job.status;

  const date = document.createElement("p");
  date.className = "job-date";
  date.textContent = new Date(job.date).toLocaleDateString();

  div.appendChild(company);
  div.appendChild(position);
  div.appendChild(location);
  div.appendChild(jobType);
  div.appendChild(status);
  div.appendChild(date);

  return div;
}

function showElement(element) {
  if (element) {
    element.style.display = "block";
  }
}

function hideElement(element) {
  if (element) {
    element.style.display = "none";
  }
}

function clearForm() {
  const form = document.querySelector(".job-form");
  if (form) {
    form.reset();
  }
}

// Initialize popup
document.addEventListener("DOMContentLoaded", function () {
  // Cache DOM elements
  const elements = {
    loginSection: document.getElementById(UI_ELEMENTS.LOGIN_SECTION),
    jobForm: document.getElementById(UI_ELEMENTS.JOB_FORM),
    recentJobs: document.getElementById(UI_ELEMENTS.RECENT_JOBS),
    loginButton: document.getElementById(UI_ELEMENTS.LOGIN_BUTTON),
    saveJobButton: document.getElementById(UI_ELEMENTS.SAVE_JOB_BUTTON),
    jobsList: document.getElementById(UI_ELEMENTS.JOBS_LIST),
    jobTitle: document.getElementById(UI_ELEMENTS.JOB_TITLE),
    companyName: document.getElementById(UI_ELEMENTS.COMPANY_NAME),
    location: document.getElementById(UI_ELEMENTS.LOCATION),
    jobType: document.getElementById(UI_ELEMENTS.JOB_TYPE),
    employmentType: document.getElementById(UI_ELEMENTS.EMPLOYMENT_TYPE),
    companySize: document.getElementById(UI_ELEMENTS.COMPANY_SIZE),
    companyIndustry: document.getElementById(UI_ELEMENTS.COMPANY_INDUSTRY),
    salaryInfo: document.getElementById(UI_ELEMENTS.SALARY_INFO),
    url: document.getElementById(UI_ELEMENTS.URL),
    jobStatus: document.getElementById(UI_ELEMENTS.JOB_STATUS),
    notes: document.getElementById(UI_ELEMENTS.NOTES),
  };

  // Check if user is logged in
  chrome.storage.local.get(["token"], function (result) {
    if (result.token) {
      hideElement(elements.loginSection);
      showElement(elements.jobForm);
      showElement(elements.recentJobs);
      loadRecentJobs();
    } else {
      showElement(elements.loginSection);
      hideElement(elements.jobForm);
      hideElement(elements.recentJobs);
    }
  });

  // Handle login button click
  elements.loginButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "login" }, function (response) {
      if (response.success) {
        hideElement(elements.loginSection);
        showElement(elements.jobForm);
        showElement(elements.recentJobs);
        loadRecentJobs();
      }
    });
  });

  // Handle save job button click
  elements.saveJobButton.addEventListener("click", function () {
    const jobData = {
      position: elements.jobTitle.value,
      company: elements.companyName.value,
      location: elements.location.value,
      jobType: elements.jobType.value,
      employmentType: elements.employmentType.value,
      companySize: elements.companySize.value,
      companyIndustry: elements.companyIndustry.value,
      salaryInfo: elements.salaryInfo.value,
      url: elements.url.value,
      status: elements.jobStatus.value,
      notes: elements.notes.value,
      date: new Date().toISOString(),
    };

    if (validateJobData(jobData)) {
      chrome.runtime.sendMessage({ action: "saveJob", jobData: jobData }, function (response) {
        if (response.success) {
          clearForm();
          loadRecentJobs();
        } else {
          console.error("Failed to save job:", response.error);
        }
      });
    } else {
      console.error("Invalid job data");
    }
  });

  // Load recent jobs
  function loadRecentJobs() {
    chrome.runtime.sendMessage({ action: "getRecentJobs" }, function (response) {
      if (response.success && response.jobs) {
        elements.jobsList.innerHTML = "";
        response.jobs.forEach((job) => {
          elements.jobsList.appendChild(createJobElement(job));
        });
      }
    });
  }
});
