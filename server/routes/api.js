const express = require('express');
const router = express.Router();
const { queryAll, queryGet, run } = require('../db/init');
const { getError } = require('../utils/errors');

function safeParseJSON(val) {
  if (!val) return null;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return null; }
}

function parseProduct(p) {
  const images = safeParseJSON(p.images) || (p.image ? [p.image] : []);

  return { ...p, images, oldPrice: p.old_price, desc: p.description };
}

// GET /api/products — list all active products
router.get('/', (req, res) => {
  try {
    let sql = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];

    if (req.query.category) {
      sql += ' AND category = ?';
      params.push(req.query.category);
    }

    if (req.query.search) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR category LIKE ?)';
      const term = `%${String(req.query.search).slice(0, 100)}%`;
      params.push(term, term, term);
    }

    if (req.query.badge) {
      sql += ' AND badge = ?';
      params.push(req.query.badge);
    }

    if (req.query.family) {
      sql += ' AND family = ?';
      params.push(req.query.family);
    }

    sql += ' ORDER BY created_at DESC';

    const products = queryAll(sql, params.length > 0 ? params : null);
    const parsed = products.map(parseProduct);
    res.json(parsed);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// GET /api/products/featured — products with badges
router.get('/featured', (req, res) => {
  try {
    const products = queryAll("SELECT * FROM products WHERE is_active = 1 AND badge IS NOT NULL ORDER BY created_at DESC");
    const parsed = products.map(parseProduct);
    res.json(parsed);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// GET /api/products/families — list all families
router.get('/families', (req, res) => {
  try {
    const families = queryAll('SELECT * FROM families ORDER BY sort_order ASC');
    res.json(families);
  } catch (err) {
    console.error('Error fetching families:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

// GET /api/products/:id — single product
router.get('/:id', (req, res) => {
  try {
    const product = queryGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: getError('PRODUCT_NOT_FOUND') });
    }
    res.json(parseProduct(product));
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

module.exports = router;