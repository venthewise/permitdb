// api/jobStore.js
const { createClient } = require('@vercel/edge-config');

const client = createClient(process.env.EDGE_CONFIG);

async function getJob(jobId) {
  return await client.get(jobId);
}

async function setJob(jobId, job) {
  // Edge Config can't store Buffers, so we'll store the CSV as a base64 string
  if (job.csvData) {
    job.csvData = job.csvData.toString('base64');
  }
  return await client.set(jobId, job);
}

async function deleteJob(jobId) {
  return await client.delete(jobId);
}

async function getAllJobs() {
  return await client.getAll();
}

module.exports = { getJob, setJob, deleteJob, getAllJobs };