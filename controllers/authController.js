const { authenticate } = require('../services/authService');

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  const result = authenticate(username, password);
  if (!result) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.cookie('token', result.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });
  return res.json({ user: result.user });
}

function logout(req, res) {
  res.clearCookie('token');
  return res.json({ message: 'Logged out' });
}

function me(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  return res.json({ user: req.user });
}

module.exports = {
  login,
  logout,
  me,
};

