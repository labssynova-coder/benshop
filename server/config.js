require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  whatsappOrders: process.env.WHATSAPP_ORDERS || '',
  whatsappWholesale: process.env.WHATSAPP_WHOLESALE || '',
  dbPath: process.env.DB_PATH || './server/db/benshop.sqlite',
  uploadsDir: './public/uploads/products',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Rate limits
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100,
  loginRateLimitMax: 5,
  orderRateLimitMax: 5,
  contactRateLimitMax: 5,

  // Upload limits
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  allowedUploadExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  defaultImage: 'assets/images/placeholder.svg',
  defaultStock: 100,

  // Body size limit
  bodyLimit: '10mb',

  // Order statuses
  orderStatuses: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],

  // Bcrypt
  bcryptSaltRounds: 10,
};

// Require JWT_SECRET in all environments
if (!config.jwtSecret) {
  console.error('[FATAL] JWT_SECRET must be set. Add JWT_SECRET to your .env file.');
  process.exit(1);
}

// Warn if admin password is not set
if (!config.adminPassword) {
  console.warn('[WARN] ADMIN_PASSWORD is not set. Admin user will not be created automatically.');
}

module.exports = config;