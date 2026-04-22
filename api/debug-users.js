const { readUsers, sendJson } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return sendJson(res, 405, {
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const users = await readUsers();

    return sendJson(res, 200, {
      success: true,
      count: users.length,
      users: users.map(user => ({
        username: user.username,
        passwordStored: user.password && user.password.includes(':') ? 'hashed' : 'plain-text'
      }))
    });
  } catch (error) {
    return sendJson(res, 500, {
      success: false,
      message: 'Unable to read users right now'
    });
  }
};
