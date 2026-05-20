const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { run } = require('../db/init');
const { sanitize, validateEmail } = require('../utils/validators');
const { getError } = require('../utils/errors');
const config = require('../config');

// Rate limit contact form: configurable per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.contactRateLimitMax,
  message: { error: getError('CONTACT_RATE_LIMITED') },
});

// POST /api/contact — submit contact message
router.post('/', contactLimiter, (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: getError('CONTACT_FIELDS_REQUIRED') });
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ error: getError('CONTACT_NAME_SHORT') });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: getError('CONTACT_EMAIL_INVALID') });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: getError('CONTACT_MESSAGE_LONG') });
  }

  try {
    const id = uuidv4();
    run('INSERT INTO contact_messages (id, name, email, message) VALUES (?, ?, ?, ?)',
      [id, sanitize(name.trim()), email.toLowerCase().trim(), sanitize(message.trim())]);

    res.status(201).json({ message: getError('CONTACT_SENT') });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

module.exports = router;