export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function validateJobData(jobData) {
  const requiredFields = ["title", "company"];
  return requiredFields.every((field) => jobData[field] && jobData[field].trim());
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
  status.textContent = capitalizeFirstLetter(job.status);

  const date = document.createElement("p");
  date.textContent = formatDate(job.date);

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

export function clearForm(formElements) {
  Object.values(formElements).forEach((element) => {
    if (element.tagName === "SELECT") {
      element.selectedIndex = 0;
    } else {
      element.value = "";
    }
  });
}
