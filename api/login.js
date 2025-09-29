import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const envUsername = process.env.LOGIN_USERNAME;
  const envPasswordHash = process.env.LOGIN_PASSWORD_HASH;

  // Hash the provided password
  const hash = crypto.createHash('sha256').update(password).digest('hex');

  if (username === envUsername && hash === envPasswordHash) {
    // Login success: return a simple token (could be JWT or random string)
    // For simplicity, we’ll just return a random token
    const token = crypto.randomBytes(16).toString('hex');
    res.status(200).json({ token });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
}
