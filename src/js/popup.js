// UI Elements
const UI_ELEMENTS = {
  LOGIN_SECTION: "login-section",
  JOB_FORM: "job-form",
  RECENT_JOBS: "recent-jobs",
  LOGIN_BUTTON: "login-button",
  SAVE_JOB_FORM: "save-job-form",
  JOBS_LIST: "jobs-list",
  COMPANY: "company",
  POSITION: "position",
  STATUS: "status",
  NOTES: "notes",
  LOCATION: "location",
  JOB_TYPE: "job-type",
  POSTED_DATE: "posted-date",
  COMPANY_SIZE: "company-size",
  COMPANY_INDUSTRY: "company-industry",
  SALARY_INFO: "salary-info",
  URL: "url",
};

const JOB_STATUS = {
  APPLIED: "applied",
  INTERVIEWING: "interviewing",
  OFFER: "offer",
  REJECTED: "rejected",
  ACCEPTED: "accepted",
};

// Helper functions
function validateJobData(jobData) {
  return jobData.company && jobData.position && jobData.status;
}

function createJobElement(job) {
  const div = document.createElement("div");
  div.className = "job-item";

  const company = document.createElement("h3");
  company.textContent = job.company;

  const position = document.createElement("p");
  position.textContent = job.position;

  const status = document.createElement("span");
  status.className = `status-badge status-${job.status.toLowerCase()}`;
  status.textContent = job.status;

  const date = document.createElement("p");
  date.className = "job-date";
  date.textContent = new Date(job.date).toLocaleDateString();

  div.appendChild(company);
  div.appendChild(position);
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

function clearForm(form) {
  if (form) {
    form.reset();
    // Explicitly clear the new fields in case they're not properly reset
    const elements = {
      location: document.getElementById(UI_ELEMENTS.LOCATION),
      url: document.getElementById(UI_ELEMENTS.URL),
    };
    if (elements.location) elements.location.value = "";
    if (elements.url) elements.url.value = "";
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
    saveJobForm: document.getElementById(UI_ELEMENTS.SAVE_JOB_FORM),
    jobsList: document.getElementById(UI_ELEMENTS.JOBS_LIST),
    company: document.getElementById(UI_ELEMENTS.COMPANY),
    position: document.getElementById(UI_ELEMENTS.POSITION),
    status: document.getElementById(UI_ELEMENTS.STATUS),
    notes: document.getElementById(UI_ELEMENTS.NOTES),
    location: document.getElementById(UI_ELEMENTS.LOCATION),
    jobType: document.getElementById(UI_ELEMENTS.JOB_TYPE),
    postedDate: document.getElementById(UI_ELEMENTS.POSTED_DATE),
    companySize: document.getElementById(UI_ELEMENTS.COMPANY_SIZE),
    companyIndustry: document.getElementById(UI_ELEMENTS.COMPANY_INDUSTRY),
    salaryInfo: document.getElementById(UI_ELEMENTS.SALARY_INFO),
    url: document.getElementById(UI_ELEMENTS.URL),
  };

  // Check login status
  chrome.storage.local.get(["isLoggedIn"], function (result) {
    if (result.isLoggedIn) {
      showElement(elements.jobForm);
      showElement(elements.recentJobs);
      hideElement(elements.loginSection);
      loadRecentJobs();
    } else {
      showElement(elements.loginSection);
      hideElement(elements.jobForm);
      hideElement(elements.recentJobs);
    }
  });

  // Handle login
  if (elements.loginButton) {
    elements.loginButton.addEventListener("click", function () {
      chrome.runtime.sendMessage({ action: "login" }, function (response) {
        if (response.success) {
          showElement(elements.jobForm);
          showElement(elements.recentJobs);
          hideElement(elements.loginSection);
          loadRecentJobs();
        }
      });
    });
  }

  // Handle job save
  if (elements.saveJobForm) {
    elements.saveJobForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const jobData = {
        company: elements.company.value,
        position: elements.position.value,
        status: elements.status.value,
        location: elements.location?.value || "",
        jobType: elements.jobType?.value || "",
        postedDate: elements.postedDate?.value || "",
        companySize: elements.companySize?.value || "",
        companyIndustry: elements.companyIndustry?.value || "",
        salaryInfo: elements.salaryInfo?.value || "",
        url: elements.url?.value || "",
        notes: elements.notes.value,
        date: new Date().toISOString(),
      };

      console.log("Saving job data:", jobData);

      if (validateJobData(jobData)) {
        chrome.runtime.sendMessage({ action: "saveJob", jobData: jobData }, function (response) {
          if (response.success) {
            clearForm(elements.saveJobForm);
            loadRecentJobs();
          }
        });
      }
    });
  }
});

// Load recent jobs
function loadRecentJobs() {
  chrome.runtime.sendMessage({ action: "getRecentJobs" }, function (response) {
    if (response.success && response.jobs) {
      const jobsList = document.getElementById(UI_ELEMENTS.JOBS_LIST);
      if (jobsList) {
        jobsList.innerHTML = "";
        response.jobs.forEach((job) => {
          jobsList.appendChild(createJobElement(job));
        });
      }
    }
  });
}
