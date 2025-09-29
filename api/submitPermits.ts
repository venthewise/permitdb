// api/submitPermits.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { permits } = req.body;
  if (!permits || !Array.isArray(permits)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    // Your webhook URL stored in an environment variable
    const webhookURL = process.env.N8N_WEBHOOK_URL;

    const url = `${webhookURL}?permitNumbers=${encodeURIComponent(permits.join('\n'))}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Workflow request failed.');
    }

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    // Send CSV back to client
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=permit_report.csv');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
