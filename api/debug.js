module.exports = async (req, res) => {
  res.status(200).json({
    LOGIN_USERNAME: process.env.LOGIN_USERNAME || 'Not Set',
    LOGIN_PASSWORD_HASH: process.env.LOGIN_PASSWORD_HASH ? 'Set' : 'Not Set',
    EDGE_CONFIG: process.env.EDGE_CONFIG ? 'Set' : 'Not Set',
  });
};