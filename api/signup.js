const {
  normalizeUsername,
  readUsers,
  writeUsers,
  sendJson,
  parseBody
} = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, message: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const username = normalizeUsername(body.username);
    const password = String(body.password || '').trim();

    if (!username || !password) {
      return sendJson(res, 400, {
        success: false,
        message: 'Username and password are required'
      });
    }

    const users = await readUsers();
    const exists = users.some(user => user.username.toLowerCase() === username.toLowerCase());

    if (exists) {
      return sendJson(res, 409, {
        success: false,
        message: 'Username already exists'
      });
    }

    users.push({
      username,
      password
    });

    await writeUsers(users);

    return sendJson(res, 200, {
      success: true,
      message: 'Account created'
    });
  } catch (error) {
    return sendJson(res, 500, {
      success: false,
      message: error.message === 'Missing blob storage configuration'
        ? 'Blob storage is not connected to this Vercel project yet'
        : 'Unable to create account right now'
    });
  }
};
