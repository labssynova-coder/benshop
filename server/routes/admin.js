const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { queryAll, queryGet, run } = require('../db/init');
const config = require('../config');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sanitize } = require('../utils/validators');
const { getError } = require('../utils/errors');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// Image upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(config.uploadsDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: config.maxUploadSize },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, config.allowedUploadExtensions.includes(ext));
  }
});

// ==========================================
// DASHBOARD
// ==========================================
router.get('/dashboard', (req, res) => {
  try {
    const totalOrders = queryGet('SELECT COUNT(*) as count FROM orders')?.count || 0;
    const totalRevenue = queryGet("SELECT COALESCE(SUM(total), 0) as sum FROM orders WHERE status != 'cancelled'")?.sum || 0;
    const totalProducts = queryGet('SELECT COUNT(*) as count FROM products WHERE is_active = 1')?.count || 0;
    const pendingOrders = queryGet("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'")?.count || 0;
    const unreadMessages = queryGet('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0')?.count || 0;

    const recentOrders = queryAll("SELECT * FROM orders ORDER BY created_at DESC LIMIT 10");
    for (const order of recentOrders) {
      const items = queryAll('SELECT product_name, quantity FROM order_items WHERE order_id = ?', [order.id]);
      order.items_summary = items.map(i => `${i.product_name} x${i.quantity}`).join(', ');
    }

    const revenueByDay = queryAll("SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as count FROM orders WHERE status != 'cancelled' AND created_at >= datetime('now', '-30 days') GROUP BY DATE(created_at) ORDER BY date DESC");

    const topProducts = queryAll(`
      SELECT oi.product_name, SUM(oi.quantity) as total_sold, SUM(oi.product_price * oi.quantity) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.product_id
      ORDER BY total_sold DESC LIMIT 5
    `);

    res.json({
      stats: { totalOrders, totalRevenue, totalProducts, pendingOrders, unreadMessages },
      recentOrders,
      revenueByDay,
      topProducts,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// ==========================================
// PRODUCTS CRUD
// ==========================================
router.get('/products/:id', (req, res) => {
  try {
    const product = queryGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: getError('PRODUCT_NOT_FOUND') });
    const images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : (product.image ? [product.image] : []);
    res.json({ ...product, images });
  } catch (err) {
    console.error('Admin product detail error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.get('/products', (req, res) => {
  try {
    const products = queryAll('SELECT * FROM products ORDER BY created_at DESC');
    res.json(products.map(p => {
      const images = p.images ? (typeof p.images === 'string' ? JSON.parse(p.images) : p.images) : (p.image ? [p.image] : []);
      return { ...p, images };
    }));
  } catch (err) {
    console.error('Admin products error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.post('/products', (req, res) => {
  const { id, name, category, price, old_price, image, badge, description, images, stock, family } = req.body;

  if (!id || !name || !category || !price) {
    return res.status(400).json({ error: getError('PRODUCT_REQUIRED_FIELDS') });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: getError('PRODUCT_PRICE_INVALID') });
  }

  try {
    const imagesData = images && images.length > 0 ? JSON.stringify(images) : null;
    const mainImage = (images && images.length > 0) ? images[0] : (image || config.defaultImage);
    run(`INSERT INTO products (id, name, category, price, old_price, image, badge, description, images, stock, family)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sanitize(id), sanitize(name), category, price, old_price || null, mainImage, badge ? sanitize(badge) : null, description ? sanitize(description) : null,
       imagesData, stock || config.defaultStock, family || null]);

    logAction(req.user.id, 'product.created', 'product', id);
    res.status(201).json({ message: getError('PRODUCT_CREATED'), id });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: getError('PRODUCT_DUPLICATE') });
    }
    console.error('Create product error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.put('/products/:id', (req, res) => {
  const { name, category, price, old_price, image, badge, description, images, stock, is_active, family } = req.body;

  try {
    const existing = queryGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: getError('PRODUCT_NOT_FOUND') });
    }

    const imagesData = images !== undefined ? (images && images.length > 0 ? JSON.stringify(images) : null) : existing.images;
    const mainImage = images !== undefined && images.length > 0 ? images[0] : (image !== undefined ? image : existing.image);

    run(`UPDATE products SET name = ?, category = ?, price = ?, old_price = ?, image = ?,
      badge = ?, description = ?, images = ?, stock = ?, is_active = ?, family = ?, updated_at = datetime('now')
      WHERE id = ?`,
      [name !== undefined && name !== '' ? sanitize(name) : existing.name,
       category !== undefined && category !== '' ? category : existing.category,
       price !== undefined ? price : existing.price,
       old_price !== undefined ? old_price : existing.old_price,
       mainImage,
       badge !== undefined ? sanitize(badge || '') : existing.badge,
       description !== undefined ? sanitize(description || '') : existing.description,
       imagesData,
       stock !== undefined ? stock : existing.stock,
       is_active !== undefined ? is_active : existing.is_active,
       family !== undefined ? family : existing.family,
       req.params.id]);

    logAction(req.user.id, 'product.updated', 'product', req.params.id);
    res.json({ message: getError('PRODUCT_UPDATED') });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    run("UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?", [req.params.id]);
    logAction(req.user.id, 'product.deactivated', 'product', req.params.id);
    res.json({ message: getError('PRODUCT_DISABLED') });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.delete('/products/:id/permanent', (req, res) => {
  try {
    const existing = queryGet('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: getError('PRODUCT_NOT_FOUND') });
    run('DELETE FROM order_items WHERE product_id = ?', [req.params.id]);
    run('DELETE FROM products WHERE id = ?', [req.params.id]);
    logAction(req.user.id, 'product.deleted', 'product', req.params.id);
    res.json({ message: getError('PRODUCT_DELETED') });
  } catch (err) {
    console.error('Permanent delete product error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.post('/products/:id/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: getError('IMAGE_REQUIRED') });
  }

  const imagePath = `uploads/products/${req.file.filename}`;
  try {
    const product = queryGet('SELECT id, image, images FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: getError('PRODUCT_NOT_FOUND') });
    }
    // Add to images array
    let images = [];
    try { images = JSON.parse(product.images) || []; } catch { images = product.image ? [product.image] : []; }
    images.push(imagePath);
    // Set first image as main image
    const mainImage = images[0] || imagePath;
    run("UPDATE products SET image = ?, images = ?, updated_at = datetime('now') WHERE id = ?", [mainImage, JSON.stringify(images), req.params.id]);
    logAction(req.user.id, 'product.image_updated', 'product', req.params.id);
    res.json({ message: getError('IMAGE_UPDATED'), path: imagePath, images });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// DELETE image from product's images array
router.delete('/products/:id/images', (req, res) => {
  const { imagePath } = req.body;
  if (!imagePath) return res.status(400).json({ error: getError('IMAGE_PATH_REQUIRED') });

  // Prevent path traversal — only allow paths under uploads/products/
  const normalizedPath = imagePath.replace(/\\/g, '/');
  if (normalizedPath.includes('..') || !normalizedPath.startsWith('uploads/products/')) {
    return res.status(400).json({ error: getError('IMAGE_PATH_INVALID') });
  }

  try {
    const product = queryGet('SELECT id, image, images FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: getError('PRODUCT_NOT_FOUND') });

    let images = [];
    try { images = JSON.parse(product.images) || []; } catch { images = product.image ? [product.image] : []; }
    images = images.filter(img => img !== imagePath);
    const mainImage = images.length > 0 ? images[0] : config.defaultImage;
    run("UPDATE products SET image = ?, images = ?, updated_at = datetime('now') WHERE id = ?", [mainImage, images.length > 0 ? JSON.stringify(images) : null, req.params.id]);

    // Delete file from disk
    const fullPath = path.resolve('public', imagePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    logAction(req.user.id, 'product.image_removed', 'product', req.params.id);
    res.json({ message: getError('IMAGE_DELETED'), images });
  } catch (err) {
    console.error('Image delete error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// ==========================================
// ORDERS MANAGEMENT
// ==========================================
router.get('/orders', (req, res) => {
  const { status, from, to } = req.query;
  let page = Math.max(1, parseInt(req.query.page) || 1);
  let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM orders';
  const conditions = [];
  const params = [];

  if (status) { conditions.push('status = ?'); params.push(status); }
  if (from) { conditions.push("created_at >= ?"); params.push(from); }
  if (to) { conditions.push("created_at <= ?"); params.push(to + ' 23:59:59'); }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  try {
    // Get total count first
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = queryGet(countSql, params.length > 0 ? params : null);
    const total = countResult ? countResult.total : 0;

    // Fetch paginated orders
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const orders = queryAll(sql, [...params, parseInt(limit), offset]);

    // Add items summary to each order
    for (const order of orders) {
      const items = queryAll('SELECT product_name, quantity FROM order_items WHERE order_id = ?', [order.id]);
      order.items_summary = items.map(i => `${i.product_name} x${i.quantity}`).join(', ');
    }

    res.json({ orders, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Admin orders error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// CSV export for orders — MUST be before /orders/:id to avoid route collision
router.get('/orders/export', (req, res) => {
  try {
    const orders = queryAll(`
      SELECT o.id, o.customer_name, o.customer_phone, o.customer_email, o.customer_wilaya,
        o.customer_commune, o.customer_address, o.total, o.delivery_fee, o.delivery_type,
        o.status, o.payment_method, o.notes, o.created_at,
        GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    const lang = req.query.lang || 'ar';
    const statusLabels = {
      pending: getError('CSV_STATUS_PENDING', lang),
      confirmed: getError('CSV_STATUS_CONFIRMED', lang),
      shipped: getError('CSV_STATUS_SHIPPED', lang),
      delivered: getError('CSV_STATUS_DELIVERED', lang),
      cancelled: getError('CSV_STATUS_CANCELLED', lang),
    };
    const deliveryLabels = {
      domicile: getError('CSV_DELIVERY_DOMICILE', lang),
      bureau: getError('CSV_DELIVERY_BUREAU', lang),
    };

    const headers = getError('CSV_HEADERS', lang);
    const rows = orders.map(o => [
      o.id,
      o.created_at,
      o.customer_name,
      o.customer_phone,
      o.customer_email || '',
      o.customer_wilaya,
      o.customer_commune || '',
      o.customer_address,
      o.items_summary || '',
      o.total,
      o.delivery_fee || 0,
      deliveryLabels[o.delivery_type] || o.delivery_type || '',
      statusLabels[o.status] || o.status,
      o.notes || ''
    ].map(field => {
      const str = String(field).replace(/"/g, '""');
      return `"${str}"`;
    }).join(','));

    const csv = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
    const filename = `benshop_orders_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('﻿' + csv);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ error: getError('CSV_EXPORT_ERROR') });
  }
});

router.get('/orders/:id', (req, res) => {
  try {
    const order = queryGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: getError('ORDER_NOT_FOUND') });

    const items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ ...order, items });
  } catch (err) {
    console.error('Admin order detail error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = config.orderStatuses;

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `${getError('INVALID_STATUS')}. Valides: ${validStatuses.join(', ')}` });
  }

  try {
    const existing = queryGet('SELECT id, status FROM orders WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: getError('ORDER_NOT_FOUND') });

    // Decrement stock when order is confirmed (from pending)
    if (status === 'confirmed' && existing.status === 'pending') {
      const items = queryAll('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [req.params.id]);
      for (const item of items) {
        run('UPDATE products SET stock = stock - ? WHERE id = ? AND stock IS NOT NULL AND stock >= ?', [item.quantity, item.product_id, item.quantity]);
      }
    }

    // Restore stock when order is cancelled (from confirmed)
    if (status === 'cancelled' && existing.status === 'confirmed') {
      const items = queryAll('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [req.params.id]);
      for (const item of items) {
        run('UPDATE products SET stock = stock + ? WHERE id = ? AND stock IS NOT NULL', [item.quantity, item.product_id]);
      }
    }

    run("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?", [status, req.params.id]);
    logAction(req.user.id, `order.${status}`, 'order', req.params.id);

    res.json({ message: `${getError('ORDER_UPDATED')}: ${status}` });
  } catch (err) {
    console.error('Order status update error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// ==========================================
// CONTACT MESSAGES
// ==========================================
router.get('/contact', (req, res) => {
  try {
    const messages = queryAll('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(messages);
  } catch (err) {
    console.error('Admin contact messages error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.put('/contact/:id/read', (req, res) => {
  try {
    run('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: getError('MESSAGE_MARKED_READ') });
  } catch (err) {
    console.error('Mark message read error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.delete('/contact/:id', (req, res) => {
  try {
    run('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ message: getError('MESSAGE_DELETED') });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// ==========================================
// FAMILIES
// ==========================================
router.get('/families', (req, res) => {
  try {
    const families = queryAll('SELECT * FROM families ORDER BY sort_order ASC');
    res.json(families);
  } catch (err) {
    console.error('Get families error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.post('/families', (req, res) => {
  const { id, label, sort_order } = req.body;
  if (!id || !label) {
    return res.status(400).json({ error: getError('FAMILY_FIELDS_REQUIRED') });
  }
  try {
    const existing = queryGet('SELECT id FROM families WHERE id = ?', [id.trim()]);
    if (existing) {
      return res.status(409).json({ error: getError('FAMILY_DUPLICATE') });
    }
    run('INSERT INTO families (id, label, sort_order) VALUES (?, ?, ?)', [id.trim(), label.trim(), parseInt(sort_order) || 0]);
    res.status(201).json({ id: id.trim(), label: label.trim(), sort_order: parseInt(sort_order) || 0 });
  } catch (err) {
    console.error('Create family error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.put('/families/:id', (req, res) => {
  const { label, sort_order } = req.body;
  try {
    const existing = queryGet('SELECT id FROM families WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: getError('FAMILY_NOT_FOUND') });
    }
    const newLabel = label !== undefined ? label.trim() : existing.label;
    const newOrder = sort_order !== undefined ? parseInt(sort_order) : existing.sort_order;
    run('UPDATE families SET label = ?, sort_order = ? WHERE id = ?', [newLabel, newOrder, req.params.id]);
    res.json({ id: req.params.id, label: newLabel, sort_order: newOrder });
  } catch (err) {
    console.error('Update family error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.delete('/families/:id', (req, res) => {
  try {
    const productsUsingFamily = queryGet('SELECT COUNT(*) as count FROM products WHERE family = ?', [req.params.id]);
    if (productsUsingFamily && productsUsingFamily.count > 0) {
      return res.status(409).json({ error: `${productsUsingFamily.count} ${getError('FAMILY_IN_USE')}` });
    }
    run('DELETE FROM families WHERE id = ?', [req.params.id]);
    res.json({ message: getError('FAMILY_DELETED') });
  } catch (err) {
    console.error('Delete family error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// ==========================================
// STATS
// ==========================================
router.get('/stats/revenue', (req, res) => {
  const { period = 'daily', from, to } = req.query;

  let dateFormat = '%Y-%m-%d';
  if (period === 'monthly') dateFormat = '%Y-%m';

  try {
    let sql = `SELECT STRFTIME('${dateFormat}', created_at) as period, SUM(total) as revenue, COUNT(*) as count FROM orders WHERE status != 'cancelled'`;
    const params = [];
    if (from) { sql += ' AND created_at >= ?'; params.push(from); }
    if (to) { sql += ' AND created_at <= ?'; params.push(to + ' 23:59:59'); }
    sql += ' GROUP BY period ORDER BY period DESC LIMIT 30';

    const stats = queryAll(sql, params.length > 0 ? params : null);
    res.json(stats);
  } catch (err) {
    console.error('Revenue stats error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

router.get('/stats/products', (req, res) => {
  try {
    const stats = queryAll(`
      SELECT oi.product_id, oi.product_name, SUM(oi.quantity) as total_sold,
      SUM(oi.product_price * oi.quantity) as revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.product_id
      ORDER BY total_sold DESC
    `);
    res.json(stats);
  } catch (err) {
    console.error('Product stats error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// ==========================================
// HELPER: Log admin actions
// ==========================================
function logAction(adminId, action, entityType, entityId) {
  try {
    run('INSERT INTO admin_logs (id, admin_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), adminId, action, entityType, entityId]);
  } catch (err) {
    console.error('Log action error:', err);
  }
}

module.exports = router;