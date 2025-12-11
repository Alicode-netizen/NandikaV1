const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
}

function readUsers() {
  ensureDataDir();
  const raw = fs.readFileSync(USERS_FILE, 'utf8');
  try {
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hashed) {
  return bcrypt.compare(password, hashed);
}

function findUserByEmail(email) {
  const users = readUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function createUser({ email, password, name }) {
  const users = readUsers();
  const id = uuidv4();
  const user = { id, email, name: name || '', passwordHash: password, createdAt: new Date().toISOString() };
  users.push(user);
  writeUsers(users);
  return user;
}

module.exports = {
  readUsers,
  writeUsers,
  hashPassword,
  comparePassword,
  findUserByEmail,
  createUser
};
