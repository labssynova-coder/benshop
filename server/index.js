const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { initDB, flushSave } = require('./db/init');
const { getError } = require('./utils/errors');

async function startServer() {
  // Initialize database first
  await initDB();

  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://www.googletagmanager.com"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", config.corsOrigin],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://www.google-analytics.com"],
        frameSrc: ["'self'", "https://www.google.com"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    message: { error: getError('RATE_LIMITED') },
  });
  app.use('/api/', apiLimiter);

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: config.bodyLimit }));
  app.use(express.urlencoded({ extended: true }));

  // Serve uploads directory for product images
  app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

  // Serve static files from public/
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // Public config endpoint (WhatsApp numbers for frontend)
  app.get('/api/config', (req, res) => {
    res.json({
      whatsappOrders: config.whatsappOrders,
      whatsappWholesale: config.whatsappWholesale,
    });
  });

  // API routes
  app.use('/api/products', require('./routes/api'));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/contact', require('./routes/contact'));
  app.get('/api/wilayas', (req, res) => {
    const wilayas = require('./utils/wilayas');
    res.json(wilayas);
  });

  app.get('/api/wilayas/:code/communes', (req, res) => {
    const wilayas = require('./utils/wilayas');
    const wilaya = wilayas.find(w => w.code === req.params.code);
    if (!wilaya) return res.status(404).json({ error: getError('WILAYA_NOT_FOUND') });
    res.json(wilaya.communes || []);
  });

  // Admin API (protected)
  app.use('/api/admin', require('./routes/admin'));

  // Admin panel (served as static)
  app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

  // SPA fallback for admin panel
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 404 handler for API routes
  app.use('/api', (req, res) => {
    res.status(404).json({ error: getError('NOT_FOUND') });
  });

  // 404 handler for all other routes — serve custom 404 page
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: getError('INVALID_JSON') });
    }
    res.status(500).json({ error: getError('SERVER_ERROR') });
  });

  const PORT = config.port;
  const server = app.listen(PORT, () => {
    console.log(`BENSHOP server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
    console.log(`Environment: ${config.nodeEnv}`);
  });

  // Graceful shutdown — flush pending DB saves
  process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    flushSave();
    server.close(() => process.exit(0));
  });
  process.on('SIGTERM', () => {
    flushSave();
    server.close(() => process.exit(0));
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});