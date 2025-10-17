// api/jobStore.js
const jobs = {};

function getJob(jobId) {
  return jobs[jobId];
}

function setJob(jobId, job) {
  jobs[jobId] = job;
}

function deleteJob(jobId) {
  delete jobs[jobId];
}

function getAllJobs() {
  return jobs;
}

module.exports = { getJob, setJob, deleteJob, getAllJobs };