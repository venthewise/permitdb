// api/submitPermits.js
const crypto = require('crypto');
const { setJob, getAllJobs } = require('./jobStore');

function generateJobId() {
  return crypto.randomBytes(16).toString('hex');
}

async function processPermitsAsync(jobId, permits, location) {
  try {
    const locationWebhookUrls = {
      clearwater: 'https://n8n.ai8mations.com/webhook/cwater',
      northport: 'https://n8n.ai8mations.com/webhook/northport',
      pasco: 'https://n8n.ai8mations.com/webhook/pasco',
      tampa: 'https://n8n.ai8mations.com/webhook/tampa',
      bradenton: 'https://n8n.ai8mations.com/webhook/bradenton',
      hillsborough: 'https://n8n.ai8mations.com/webhook/hillsborough',
      polkcounty: 'https://n8n.ai8mations.com/webhook/polkcounty',
      charlotte: 'https://n8n.ai8mations.com/webhook/charlotte',
      atlanta: 'https://n8n.ai8mations.com/webhook/atlanta',
      citruscounty: 'https://n8n.ai8mations.com/webhook/citruscounty',
      fortworth: 'https://n8n.ai8mations.com/webhook/fortworth',
      lakealfred: 'https://n8n.ai8mations.com/webhook/lakealfred',
      leoncounty: 'https://n8n.ai8mations.com/webhook/leoncounty',
      sanantonio: 'https://n8n.ai8mations.com/webhook/sanantonio',
      sarasota: 'https://n8n.ai8mations.com/webhook/sarasota',
      weston: 'https://n8n.ai8mations.com/webhook/weston'
    };

    const webhookURL = locationWebhookUrls[location];
    if (!webhookURL) throw new Error('Invalid location');

    const url = `${webhookURL}?permitNumbers=${encodeURIComponent(permits.join('\n'))}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Workflow request failed.');

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    setJob(jobId, { status: 'completed', csvData: buffer });
  } catch (err) {
    console.error(err);
    setJob(jobId, { status: 'failed', error: err.message || 'Unknown error' });
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { permits, location } = req.body;
  if (!permits || !Array.isArray(permits)) return res.status(400).json({ error: 'Invalid input' });
  if (!location) return res.status(400).json({ error: 'Location required' });

  const jobId = generateJobId();
  await setJob(jobId, { status: 'processing' });
  console.log(`Job created: ${jobId}`);

  // Start async processing
  processPermitsAsync(jobId, permits, location);

  // Return job ID immediately
  res.status(202).json({ status: 'processing', jobId });
}