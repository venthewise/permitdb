// api/submitPermits.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { permits } = req.body;
  if (!permits || !Array.isArray(permits)) return res.status(400).json({ error: 'Invalid input' });

  try {
    const webhookURL = process.env.N8N_WEBHOOK_URL;
    const url = `${webhookURL}?permitNumbers=${encodeURIComponent(permits.join('\n'))}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Workflow request failed.');

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=permit_report.csv');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
