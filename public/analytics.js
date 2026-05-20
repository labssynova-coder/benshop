/* ==========================================
   BENSHOP — Google Analytics 4 Tracking
   ========================================== */

// IMPORTANT: Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID before deploying to production!
// Find it in: GA4 Admin > Data Streams > Web Stream > Measurement ID
// Analytics will NOT track any data until this is changed to a valid ID.
const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';

// Check if we're in production and have a valid GA4 ID
const isProduction = window.location.hostname !== 'localhost' &&
                     window.location.hostname !== '127.0.0.1';
const hasValidGA4 = GA4_MEASUREMENT_ID !== 'G-XXXXXXXXXX';

/* -------------------------------------------
   GTAG.JS SNIPPET (Standard gtag.js approach)
   ------------------------------------------- */
window.dataLayer = window.dataLayer || [];

function gtag() {
  dataLayer.push(arguments);
}

// Configure consent mode (default: denied until user opts in)
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied'
});

// Load gtag.js only if we have a valid measurement ID
if (hasValidGA4) {
  gtag('js', new Date());

  gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: false, // We manually track page views
    currency: 'DZD',
    country: 'DZ'
  });

  // Load the gtag script
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(gaScript);
}

/* -------------------------------------------
   ANALYTICS HELPERS
   ------------------------------------------- */

/**
 * Track a page view
 * @param {string} pagePath - The page path (e.g., '/catalog.html')
 * @param {string} pageTitle - The page title
 */
function trackPageView(pagePath, pageTitle) {
  if (!hasValidGA4) {
    console.log('[Analytics] page_view:', { page_path: pagePath, page_title: pageTitle });
    return;
  }
  gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    send_to: GA4_MEASUREMENT_ID
  });
}

/**
 * Track add-to-cart event
 * @param {Object} product - The product object { id, name, category, price, qty }
 */
function trackAddToCart(product) {
  const item = {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category || 'chaussettes',
    price: product.price,
    quantity: product.qty || 1
  };

  if (!hasValidGA4) {
    console.log('[Analytics] add_to_cart:', { items: [item], value: product.price });
    return;
  }

  gtag('event', 'add_to_cart', {
    currency: 'DZD',
    value: product.price * (product.qty || 1),
    items: [item],
    send_to: GA4_MEASUREMENT_ID
  });
}

/**
 * Track checkout start event
 * @param {Array} cartItems - Array of cart items
 * @param {number} total - Cart total
 */
function trackCheckoutStart(cartItems, total) {
  const items = cartItems.map(item => ({
    item_id: item.id,
    item_name: item.name,
    item_category: item.category || 'chaussettes',
    price: item.price,
    quantity: item.qty || 1
  }));

  if (!hasValidGA4) {
    console.log('[Analytics] checkout_start:', { items, value: total });
    return;
  }

  gtag('event', 'begin_checkout', {
    currency: 'DZD',
    value: total,
    items: items,
    send_to: GA4_MEASUREMENT_ID
  });
}

/**
 * Track purchase/order completed event
 * @param {Array} cartItems - Array of items purchased
 * @param {number} total - Order total
 * @param {string} transactionId - Unique order ID
 */
function trackPurchase(cartItems, total, transactionId) {
  const items = cartItems.map(item => ({
    item_id: item.id,
    item_name: item.name,
    item_category: item.category || 'chaussettes',
    price: item.price,
    quantity: item.qty || 1
  }));

  if (!hasValidGA4) {
    console.log('[Analytics] purchase:', { transaction_id: transactionId, items, value: total });
    return;
  }

  gtag('event', 'purchase', {
    transaction_id: transactionId,
    currency: 'DZD',
    value: total,
    items: items,
    send_to: GA4_MEASUREMENT_ID
  });
}

/**
 * Track search event
 * @param {string} searchTerm - The search query
 */
function trackSearch(searchTerm) {
  if (!hasValidGA4) {
    console.log('[Analytics] search:', { search_term: searchTerm });
    return;
  }

  gtag('event', 'search', {
    search_term: searchTerm,
    send_to: GA4_MEASUREMENT_ID
  });
}

/* -------------------------------------------
   PAGE VIEW TRACKING ON ROUTE CHANGE
   ------------------------------------------- */
// Track initial page view
document.addEventListener('DOMContentLoaded', () => {
  trackPageView(window.location.pathname + window.location.search, document.title);
});

// Track page view on history changes (for SPA-like navigation)
window.addEventListener('popstate', () => {
  trackPageView(window.location.pathname + window.location.search, document.title);
});

// Track page view when clicking internal links (non-SPA fallback)
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.href &&
      !link.href.startsWith('javascript:') &&
      !link.target && // Not external link
      (link.hostname === window.location.hostname || link.hostname === '')) {
    // Let the page load naturally, then track
    setTimeout(() => {
      trackPageView(window.location.pathname + window.location.search, document.title);
    }, 100);
  }
});

/* -------------------------------------------
   CONSENT MANAGEMENT (Placeholder)
   ------------------------------------------- */
/**
 * Call this when user accepts analytics cookies
 */
function analyticsAcceptConsent() {
  gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted'
  });
}

/**
 * Call this when user rejects analytics cookies
 */
function analyticsRejectConsent() {
  gtag('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied'
  });
}

// Expose to global scope
window.trackPageView = trackPageView;
window.trackAddToCart = trackAddToCart;
window.trackCheckoutStart = trackCheckoutStart;
window.trackPurchase = trackPurchase;
window.trackSearch = trackSearch;
window.analyticsAcceptConsent = analyticsAcceptConsent;
window.analyticsRejectConsent = analyticsRejectConsent;
