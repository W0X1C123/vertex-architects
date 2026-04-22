const { get, put } = require('@vercel/blob');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const USERS_PATHNAME = 'auth/users.json';
const seedUsersPath = path.join(process.cwd(), 'server', 'users.json');

function normalizeUsername(username) {
  return String(username || '').trim();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword) {
    return false;
  }

  if (!storedPassword.includes(':')) {
    return storedPassword === password;
  }

  const [salt, hash] = storedPassword.split(':');
  const suppliedHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(suppliedHash, 'hex'));
}

function loadSeedUsers() {
  try {
    if (!fs.existsSync(seedUsersPath)) {
      return [];
    }

    const raw = fs.readFileSync(seedUsersPath, 'utf8');
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

async function streamToText(stream) {
  if (!stream) {
    return '';
  }

  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function readUsers() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return loadSeedUsers();
  }

  try {
    const blob = await get(USERS_PATHNAME, { access: 'private' });

    if (!blob || blob.statusCode === 404 || !blob.stream) {
      return loadSeedUsers();
    }

    const raw = await streamToText(blob.stream);
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return loadSeedUsers();
  }
}

async function writeUsers(users) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Missing blob storage configuration');
  }

  await put(USERS_PATHNAME, JSON.stringify(users, null, 2), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json'
  });
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

module.exports = {
  normalizeUsername,
  hashPassword,
  verifyPassword,
  readUsers,
  writeUsers,
  sendJson,
  parseBody
};
