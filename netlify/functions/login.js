const jwt = require('jsonwebtoken');
const helpers = require('./_helpers');
const { comparePassword, findUserByEmail } = helpers;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and password required' }) };
    }

    const user = findUserByEmail(email);
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
    }

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

    return {
      statusCode: 200,
      body: JSON.stringify({ token, user: { id: user.id, email: user.email, name: user.name } })
    };
  } catch (err) {
    console.error('login error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
