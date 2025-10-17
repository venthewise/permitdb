// api/downloadStatus.js
const { getJob } = require('./jobStore');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Job ID required' }));
    return;
  }

  const job = getJob(jobId);
  if (!job) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Job not found' }));
    return;
  }

  if (job.status === 'processing') {
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'processing' }));
    return;
  }

  if (job.status === 'failed') {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: job.error }));
    return;
  }

  // Completed: return CSV
  res.writeHead(200, {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename=permit_report.csv'
  });
  res.end(job.csvData);
}