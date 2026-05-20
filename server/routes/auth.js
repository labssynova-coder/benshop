const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { queryGet } = require('../db/init');
const config = require('../config');
const { getError } = require('../utils/errors');

const loginLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.loginRateLimitMax,
  message: { error: getError('LOGIN_RATE_LIMITED') }
});

// POST /api/auth/login — admin login only
router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: getError('CREDENTIALS_REQUIRED') });
  }

  try {
    const user = queryGet('SELECT * FROM users WHERE email = ? AND is_active = 1', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: getError('INVALID_CREDENTIALS') });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: getError('INVALID_CREDENTIALS') });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        wilaya: user.wilaya,
        address: user.address,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

module.exports = router;