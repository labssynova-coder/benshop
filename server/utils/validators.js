function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^(0|\+213|213)[5-7]\d{8}$/;
  return re.test(phone.replace(/\s/g, ''));
}

function validateOrder(order) {
  const errors = [];
  if (!order.customerName || order.customerName.trim().length < 2) {
    errors.push('Le nom est requis (2 caractères minimum)');
  }
  if (!order.customerPhone || !validatePhone(order.customerPhone)) {
    errors.push('Numéro de téléphone invalide');
  }
  if (!order.customerWilaya || order.customerWilaya.trim().length < 2) {
    errors.push('La wilaya est requise');
  }
  if (!order.customerAddress || order.customerAddress.trim().length < 2) {
    errors.push('L\'adresse de livraison est requise (2 caractères minimum)');
  }
  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Le panier est vide');
  }
  return errors;
}

function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>'"&]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;'
  }[c]));
}

module.exports = { validateEmail, validatePhone, validateOrder, sanitize };