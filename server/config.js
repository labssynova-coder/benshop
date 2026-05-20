require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@benshop.dz',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  whatsappOrders: process.env.WHATSAPP_ORDERS || '213696409537',
  whatsappWholesale: process.env.WHATSAPP_WHOLESALE || '213772268427',
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

// Warn if using default JWT secret in production
if (config.nodeEnv === 'production' && config.jwtSecret === 'change-me-in-production') {
  console.error('[FATAL] JWT_SECRET must be set in production. Set the JWT_SECRET environment variable.');
  process.exit(1);
}

if (config.nodeEnv !== 'production' && config.jwtSecret === 'change-me-in-production') {
  console.warn('[WARN] Using default JWT secret. Set JWT_SECRET in .env for security.');
}

// Warn if admin password is not set
if (!config.adminPassword) {
  console.warn('[WARN] ADMIN_PASSWORD is not set. Admin user will not be created automatically.');
}

module.exports = config;