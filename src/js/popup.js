// UI Elements
const UI_ELEMENTS = {
  LOGIN_SECTION: "login-section",
  MAIN_SECTION: "main-section",
  LOGIN_BUTTON: "login-button",
  SAVE_JOB_BUTTON: "save-job",
  JOBS_LIST: "jobs-list",
  JOB_TITLE: "job-title",
  COMPANY_NAME: "company-name",
  JOB_STATUS: "job-status",
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
  return jobData.title && jobData.company && jobData.status;
}

function createJobElement(job) {
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

function showElement(element) {
  element.classList.remove("hidden");
}

function hideElement(element) {
  element.classList.add("hidden");
}

function clearForm(elements) {
  elements.jobTitle.value = "";
  elements.companyName.value = "";
  elements.jobStatus.selectedIndex = 0;
}

// Initialize popup
document.addEventListener("DOMContentLoaded", function () {
  // Cache DOM elements
  const elements = {
    loginSection: document.getElementById(UI_ELEMENTS.LOGIN_SECTION),
    mainSection: document.getElementById(UI_ELEMENTS.MAIN_SECTION),
    loginButton: document.getElementById(UI_ELEMENTS.LOGIN_BUTTON),
    saveJobButton: document.getElementById(UI_ELEMENTS.SAVE_JOB_BUTTON),
    jobsList: document.getElementById(UI_ELEMENTS.JOBS_LIST),
    jobTitle: document.getElementById(UI_ELEMENTS.JOB_TITLE),
    companyName: document.getElementById(UI_ELEMENTS.COMPANY_NAME),
    jobStatus: document.getElementById(UI_ELEMENTS.JOB_STATUS),
  };

  // Check login status
  chrome.storage.local.get(["isLoggedIn"], function (result) {
    if (result.isLoggedIn) {
      showElement(elements.mainSection);
      hideElement(elements.loginSection);
      loadRecentJobs();
    } else {
      showElement(elements.loginSection);
      hideElement(elements.mainSection);
    }
  });

  // Handle login
  elements.loginButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "login" }, function (response) {
      if (response.success) {
        showElement(elements.mainSection);
        hideElement(elements.loginSection);
        loadRecentJobs();
      }
    });
  });

  // Handle job save
  elements.saveJobButton.addEventListener("click", function () {
    const jobData = {
      title: elements.jobTitle.value,
      company: elements.companyName.value,
      status: elements.jobStatus.value,
      url: window.location.href,
      date: new Date().toISOString(),
    };

    if (!validateJobData(jobData)) {
      alert("Please fill in all required fields");
      return;
    }

    chrome.runtime.sendMessage(
      {
        action: "saveJob",
        jobData: jobData,
      },
      function (response) {
        if (response.success) {
          loadRecentJobs();
          clearForm(elements);
        } else {
          alert("Failed to save job. Please try again.");
        }
      }
    );
  });

  function loadRecentJobs() {
    chrome.runtime.sendMessage({ action: "getRecentJobs" }, function (jobs) {
      elements.jobsList.innerHTML = "";
      jobs.forEach((job) => {
        const jobElement = createJobElement(job);
        elements.jobsList.appendChild(jobElement);
      });
    });
  }
});
