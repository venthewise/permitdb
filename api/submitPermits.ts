// api/submitPermits.ts
import * as crypto from 'crypto';

// In-memory job store (use Redis or DB in production)
const jobs: { [key: string]: { status: 'processing' | 'completed' | 'failed'; csvData?: Buffer; error?: string } } = {};

function generateJobId(): string {
  return crypto.randomBytes(16).toString('hex');
}

async function processPermitsAsync(jobId: string, permits: string[]) {
  try {
    const webhookURL = process.env.N8N_WEBHOOK_URL;
    const url = `${webhookURL}?permitNumbers=${encodeURIComponent(permits.join('\n'))}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Workflow request failed.');

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    jobs[jobId] = { status: 'completed', csvData: buffer };
  } catch (err) {
    console.error(err);
    jobs[jobId] = { status: 'failed', error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { permits } = req.body;
  if (!permits || !Array.isArray(permits)) return res.status(400).json({ error: 'Invalid input' });

  const jobId = generateJobId();
  jobs[jobId] = { status: 'processing' };

  // Start async processing
  processPermitsAsync(jobId, permits);

  // Return job ID immediately
  res.status(202).json({ status: 'processing', jobId });
}
