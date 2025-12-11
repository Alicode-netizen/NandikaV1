const jwt = require('jsonwebtoken');
const helpers = require('./_helpers');
const { readUsers } = helpers;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const auth = event.headers.authorization || event.headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Missing or invalid Authorization header' }) };
    }

    const token = auth.substring('Bearer '.length);
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
    }

    const users = readUsers();
    const user = users.find(u => u.id === payload.sub);
    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user: { id: user.id, email: user.email, name: user.name } })
    };
  } catch (err) {
    console.error('profile error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
