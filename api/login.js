const {
  normalizeUsername,
  verifyPassword,
  readUsers,
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
    const user = users.find(entry => entry.username.toLowerCase() === username.toLowerCase());

    if (!user || !verifyPassword(password, user.password)) {
      return sendJson(res, 401, {
        success: false,
        message: 'Invalid username or password'
      });
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    return sendJson(res, 500, {
      success: false,
      message: 'Unable to log in right now'
    });
  }
};
