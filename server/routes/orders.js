const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { queryAll, queryGet, run, beginTransaction, commitTransaction, rollbackTransaction } = require('../db/init');
const { validateOrder, validateEmail, sanitize } = require('../utils/validators');
const { getError } = require('../utils/errors');
const config = require('../config');
const wilayas = require('../utils/wilayas');

// Rate limit order creation: configurable per 15 minutes per IP
const orderLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.orderRateLimitMax,
  message: { error: getError('ORDER_RATE_LIMITED') },
});

// Calculate delivery fee server-side from wilaya code and delivery type
function calculateDeliveryFee(wilayaCode, deliveryType) {
  const wilaya = wilayas.find(w => w.code === wilayaCode);
  if (!wilaya) return 0;
  if (deliveryType === 'domicile') return wilaya.delivery_home || 0;
  if (deliveryType === 'bureau') return wilaya.delivery_office || 0;
  return 0;
}

// POST /api/orders — place a new order (guest only)
router.post('/', orderLimiter, (req, res) => {
  const { customerName, customerPhone, customerEmail, customerWilaya, customerCommune, customerAddress, items, notes, deliveryType } = req.body;

  const errors = validateOrder({ customerName, customerPhone, customerWilaya, customerAddress, items });
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('. ') });
  }

  // Validate email format if provided
  if (customerEmail && customerEmail.trim()) {
    if (!validateEmail(customerEmail.trim())) {
      return res.status(400).json({ error: getError('EMAIL_INVALID') });
    }
  }

  try {
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + uuidv4().slice(0, 4).toUpperCase();
    let total = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = queryGet('SELECT id, name, price, stock, is_active FROM products WHERE id = ?', [item.productId || item.id]);
      if (!product || !product.is_active) {
        return res.status(400).json({ error: `${getError('PRODUCT_NOT_AVAILABLE')}: ${item.productName || item.name}` });
      }
      if (product.stock !== null && product.stock !== undefined && product.stock <= 0) {
        return res.status(400).json({ error: `${getError('PRODUCT_OUT_OF_STOCK')}: ${product.name}` });
      }
      const qty = Math.max(1, parseInt(item.quantity || item.qty) || 1);
      if (product.stock !== null && product.stock !== undefined && qty > product.stock) {
        return res.status(400).json({ error: `${getError('STOCK_INSUFFICIENT')}: ${product.name}. Disponible: ${product.stock}` });
      }
      total += product.price * qty;
      verifiedItems.push({
        id: uuidv4(),
        orderId,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        quantity: qty,
      });
    }

    // Calculate delivery fee server-side from wilaya + delivery type (ignore client-sent value)
    const wilayaCode = customerWilaya.trim().split(' - ')[0];
    const fee = calculateDeliveryFee(wilayaCode, deliveryType);
    total += fee;

    const emailValue = customerEmail && customerEmail.trim() ? customerEmail.trim() : null;
    const communeValue = customerCommune && customerCommune.trim() ? sanitize(customerCommune.trim()) : null;
    const deliveryTypeValue = deliveryType || null;

    beginTransaction();
    try {
      run(`INSERT INTO orders (id, user_id, customer_name, customer_phone, customer_wilaya, customer_commune, customer_address, customer_email, total, delivery_fee, delivery_type, status, payment_method, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'cod', ?)`,
        [orderId, null, sanitize(customerName.trim()), customerPhone.trim(), customerWilaya.trim(), communeValue, sanitize(customerAddress.trim()), emailValue, total, fee, deliveryTypeValue, notes ? sanitize(notes.trim()) : null]);

      for (const item of verifiedItems) {
        run('INSERT INTO order_items (id, order_id, product_id, product_name, product_price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
          [item.id, item.orderId, item.productId, item.productName, item.productPrice, item.quantity]);
      }
      commitTransaction();
    } catch (dbErr) {
      rollbackTransaction();
      throw dbErr;
    }

    res.status(201).json({
      id: orderId,
      total,
      deliveryFee: fee,
      deliveryType: deliveryTypeValue,
      status: 'pending',
      items: verifiedItems.map(i => ({
        productId: i.productId,
        productName: i.productName,
        productPrice: i.productPrice,
        quantity: i.quantity,
      })),
      message: getError('ORDER_CREATED')
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: getError('ORDER_CREATE_ERROR') });
  }
});

// GET /api/orders/:id — get order by ID (limited info for tracking)
router.get('/:id', (req, res) => {
  try {
    const order = queryGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ error: getError('ORDER_NOT_FOUND') });
    }
    const phone = String(req.query.phone || '').replace(/\D/g, '');
    const orderPhone = String(order.customer_phone || '').replace(/\D/g, '');
    if (!phone || phone.slice(-6) !== orderPhone.slice(-6)) {
      return res.status(403).json({ error: getError('TOKEN_INVALID') });
    }

    const items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({
      id: order.id,
      customer_name: order.customer_name,
      status: order.status,
      total: order.total,
      delivery_fee: order.delivery_fee || 0,
      delivery_type: order.delivery_type || null,
      customer_wilaya: order.customer_wilaya,
      created_at: order.created_at,
      items: items.map(i => ({
        product_name: i.product_name,
        product_price: i.product_price,
        quantity: i.quantity,
      })),
    });
  } catch (err) {
    console.error('Fetch order error:', err);
    res.status(500).json({ error: getError('SERVER_ERROR') });
  }
});

module.exports = router;
