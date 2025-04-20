export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function validateJobData(jobData) {
  return jobData.title && jobData.company && jobData.status;
}

export function createJobElement(job) {
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

export function showElement(element) {
  element.classList.remove("hidden");
}

export function hideElement(element) {
  element.classList.add("hidden");
}

export function clearForm(elements) {
  elements.jobTitle.value = "";
  elements.companyName.value = "";
  elements.jobStatus.selectedIndex = 0;
}
