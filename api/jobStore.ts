// api/jobStore.ts
export interface Job {
  status: 'processing' | 'completed' | 'failed';
  csvData?: Buffer;
  error?: string;
}

const jobs: { [key: string]: Job } = {};

export function getJob(jobId: string): Job | undefined {
  return jobs[jobId];
}

export function setJob(jobId: string, job: Job): void {
  jobs[jobId] = job;
}

export function deleteJob(jobId: string): void {
  delete jobs[jobId];
}

export function getAllJobs(): { [key: string]: Job } {
  return jobs;
}