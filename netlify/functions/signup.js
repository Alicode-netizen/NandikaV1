const jwt = require('jsonwebtoken');
const helpers = require('./_helpers');
const { hashPassword, findUserByEmail, createUser } = helpers;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password, name } = body;
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email and password required' }) };
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return { statusCode: 409, body: JSON.stringify({ error: 'User already exists' }) };
    }

    const passwordHash = await hashPassword(password);
    const user = createUser({ email, password: passwordHash, name });

    // create token
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

    return {
      statusCode: 201,
      body: JSON.stringify({ token, user: { id: user.id, email: user.email, name: user.name } })
    };

  } catch (err) {
    console.error('signup error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
