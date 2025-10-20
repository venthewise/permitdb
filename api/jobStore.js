// api/jobStore.js
const { createClient } = require('@vercel/edge-config');

// Use in-memory storage for local development
let inMemoryStore = {};

const client = process.env.EDGE_CONFIG ? createClient(process.env.EDGE_CONFIG) : null;

async function getJob(jobId) {
  if (client) {
    return await client.get(jobId);
  } else {
    return inMemoryStore[jobId] || null;
  }
}

async function setJob(jobId, job) {
  try {
    // Edge Config can't store Buffers, so we'll store the CSV as a base64 string
    if (job.csvData) {
      job.csvData = job.csvData.toString('base64');
    }

    if (client) {
      // Edge Config doesn't have a set method, we need to use digest
      // For now, fall back to in-memory storage even in production
      console.log(`Edge Config client doesn't support set method, using in-memory storage for ${jobId}`);
      inMemoryStore[jobId] = job;
      console.log(`Successfully set job ${jobId} in memory (fallback).`);
    } else {
      inMemoryStore[jobId] = job;
      console.log(`Successfully set job ${jobId} in memory.`);
    }
  } catch (error) {
    console.error(`Error setting job ${jobId}:`, error);
    throw error; // Re-throw the error to be caught by the calling function
  }
}

async function deleteJob(jobId) {
  if (client) {
    return await client.delete(jobId);
  } else {
    delete inMemoryStore[jobId];
  }
}

async function getAllJobs() {
  if (client) {
    return await client.getAll();
  } else {
    return inMemoryStore;
  }
}

module.exports = { getJob, setJob, deleteJob, getAllJobs };