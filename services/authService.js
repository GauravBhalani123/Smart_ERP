const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readJson, writeJson } = require('../utils/fileStorage');
const roles = require('../config/roles');
const { v4: uuidv4 } = require('uuid');

const USERS_FILE = 'users.json';

function getAllUsers() {
  return readJson(USERS_FILE, []);
}

function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

function ensureAdminUser() {
  const users = getAllUsers();
  if (!users.some((u) => u.role === roles.ADMIN)) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    users.push({
      id: uuidv4(),
      username: 'admin',
      passwordHash,
      role: roles.ADMIN,
      active: true,
    });
    saveUsers(users);
    console.log('Default admin user created: username=admin, password=admin123');
  }
}

function authenticate(username, password) {
  const users = getAllUsers();
  const user = users.find((u) => u.username === username && u.active !== false);
  if (!user) return null;
  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) return null;

  const payload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: '8h',
  });
  return { token, user: payload };
}

module.exports = {
  ensureAdminUser,
  authenticate,
  getAllUsers,
};

