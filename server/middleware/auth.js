const jwt = require('jsonwebtoken');
const config = require('../config');
const { queryGet } = require('../db/init');
const { getError } = require('../utils/errors');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const cookieToken = parseCookie(req.headers.cookie || '').benshop_admin_token;
  if ((!authHeader || !authHeader.startsWith('Bearer ')) && !cookieToken) {
    return res.status(401).json({ error: getError('TOKEN_REQUIRED') });
  }
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : cookieToken;
  try {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    // Check if user is still active
    if (decoded.id) {
      const user = queryGet('SELECT is_active FROM users WHERE id = ?', [decoded.id]);
      if (!user || !user.is_active) {
        return res.status(401).json({ error: getError('ACCOUNT_DISABLED') });
      }
    }
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: getError('TOKEN_EXPIRED') });
    }
    return res.status(401).json({ error: getError('TOKEN_INVALID') });
  }
}

function parseCookie(header) {
  return header.split(';').reduce((cookies, part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return cookies;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: getError('ADMIN_REQUIRED') });
  }
  next();
}

module.exports = { authMiddleware, adminMiddleware };
