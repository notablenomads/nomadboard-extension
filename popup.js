document.addEventListener("DOMContentLoaded", function () {
  const loginSection = document.getElementById("login-section");
  const mainSection = document.getElementById("main-section");
  const loginButton = document.getElementById("login-button");
  const saveJobButton = document.getElementById("save-job");
  const jobsList = document.getElementById("jobs-list");

  // Check if user is logged in
  chrome.storage.local.get(["isLoggedIn", "sheetId"], function (result) {
    if (result.isLoggedIn) {
      showMainSection();
      loadRecentJobs();
    } else {
      showLoginSection();
    }
  });

  // Handle login
  loginButton.addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "login" }, function (response) {
      if (response.success) {
        showMainSection();
        loadRecentJobs();
      }
    });
  });

  // Handle job save
  saveJobButton.addEventListener("click", function () {
    const jobTitle = document.getElementById("job-title").value;
    const companyName = document.getElementById("company-name").value;
    const status = document.getElementById("job-status").value;
    const jobUrl = window.location.href;

    if (!jobTitle || !companyName) {
      alert("Please fill in all required fields");
      return;
    }

    const jobData = {
      title: jobTitle,
      company: companyName,
      status: status,
      url: jobUrl,
      date: new Date().toISOString(),
    };

    chrome.runtime.sendMessage(
      {
        action: "saveJob",
        jobData: jobData,
      },
      function (response) {
        if (response.success) {
          loadRecentJobs();
          clearForm();
        } else {
          alert("Failed to save job. Please try again.");
        }
      }
    );
  });

  function showLoginSection() {
    loginSection.classList.remove("hidden");
    mainSection.classList.add("hidden");
  }

  function showMainSection() {
    loginSection.classList.add("hidden");
    mainSection.classList.remove("hidden");
  }

  function clearForm() {
    document.getElementById("job-title").value = "";
    document.getElementById("company-name").value = "";
    document.getElementById("job-status").value = "wishlist";
  }

  function loadRecentJobs() {
    chrome.runtime.sendMessage({ action: "getRecentJobs" }, function (jobs) {
      jobsList.innerHTML = "";
      jobs.forEach((job) => {
        const jobElement = createJobElement(job);
        jobsList.appendChild(jobElement);
      });
    });
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
});
