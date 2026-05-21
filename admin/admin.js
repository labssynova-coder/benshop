/* ==========================================
   BENSHOP ADMIN — Dashboard SPA
   ========================================== */

const API = '/api/admin';

// ==========================================
// DEMO MODE (static hosting fallback)
// ==========================================
let DEMO_MODE = false;
let DEMO_INITIALIZED = false;

const DEMO_ADMIN = { name: 'Demo Admin', email: 'demo@benshop.dz', role: 'admin' };

const DEMO_DATA = {
  dashboard: {
    stats: { totalOrders: 47, totalRevenue: 285600, pendingOrders: 8, unreadMessages: 3 },
    recentOrders: [
      { id: 'ORD-MP9J6E25', customer_name: 'Karim Benali', customer_wilaya: 'Algiers', total: 4800, status: 'pending', created_at: '2026-05-20T14:30:00Z' },
      { id: 'ORD-KT3R8N17', customer_name: 'Amina Hadj', customer_wilaya: 'Oran', total: 3200, status: 'confirmed', created_at: '2026-05-19T10:15:00Z' },
      { id: 'ORD-PW5X2V44', customer_name: 'Youcef Mesbah', customer_wilaya: 'Constantine', total: 5600, status: 'shipped', created_at: '2026-05-18T16:45:00Z' },
      { id: 'ORD-LQ8F9H33', customer_name: 'Fatima Zeroual', customer_wilaya: 'Sétif', total: 2400, status: 'delivered', created_at: '2026-05-17T09:00:00Z' },
      { id: 'ORD-RJ2M7W61', customer_name: 'Nabil Khelfi', customer_wilaya: 'Bordj Bou Arreridj', total: 7200, status: 'cancelled', created_at: '2026-05-16T11:20:00Z' },
    ],
    topProducts: [
      { product_name: 'Pack Sport Premium', total_sold: 34, revenue: 40800 },
      { product_name: 'Classique Coton Homme', total_sold: 28, revenue: 14000 },
      { product_name: 'Invisible Femme', total_sold: 22, revenue: 8800 },
    ]
  },
  products: [
    { id: 'prod_classique_1', name: 'Classique Coton Homme', category: 'homme', price: 500, old_price: null, image: 'assets/images/prod-coton-gris.png', stock: 150, is_active: 1, badge: 'Populaire', description: 'Chaussettes classiques en coton pour homme', family: 'classique_coton', images: ['assets/images/prod-coton-gris.png'] },
    { id: 'prod_sport_1', name: 'Pack Sport Premium', category: 'homme', price: 1200, old_price: 1500, image: 'assets/images/prod-sport.png', stock: 80, is_active: 1, badge: 'Nouveau', description: 'Pack de chaussettes sport techniques', family: 'sport', images: ['assets/images/prod-sport.png'] },
    { id: 'prod_invisible_1', name: 'Invisible Femme', category: 'femme', price: 400, old_price: null, image: 'assets/images/prod-invisible.png', stock: 200, is_active: 1, badge: null, description: 'Chaussettes invisibles pour femme', family: 'invisible', images: ['assets/images/prod-invisible.png'] },
    { id: 'prod_mollet_1', name: 'Mi-Mollet Enfant', category: 'enfants', price: 350, old_price: null, image: 'assets/images/prod-enfant-color.png', stock: 120, is_active: 1, badge: null, description: 'Chaussettes mi-mollet pour enfants', family: 'mi_mollet', images: ['assets/images/prod-enfant-color.png'] },
    { id: 'promo_pack_1', name: 'Pack Promo Mixte', category: 'autres', price: 1800, old_price: 2400, image: 'assets/images/prod-pack.png', stock: 45, is_active: 1, badge: 'Promo', description: 'Pack promotionnel mixte', family: 'classique_coton', images: ['assets/images/prod-pack.png'] },
    { id: 'prod_hiver_1', name: 'Hiver Laine Homme', category: 'homme', price: 800, old_price: null, image: 'assets/images/prod-rayures.png', stock: 0, is_active: 0, badge: 'Hiver', description: 'Chaussettes hiver en laine', family: 'classique_coton', images: ['assets/images/prod-rayures.png'] },
  ],
  orders: {
    orders: [
      { id: 'ORD-MP9J6E25', customer_name: 'Karim Benali', customer_phone: '0555123456', customer_wilaya: 'Algiers', total: 4800, status: 'pending', created_at: '2026-05-20T14:30:00Z' },
      { id: 'ORD-KT3R8N17', customer_name: 'Amina Hadj', customer_phone: '0667788990', customer_wilaya: 'Oran', total: 3200, status: 'confirmed', created_at: '2026-05-19T10:15:00Z' },
      { id: 'ORD-PW5X2V44', customer_name: 'Youcef Mesbah', customer_phone: '0778901234', customer_wilaya: 'Constantine', total: 5600, status: 'shipped', created_at: '2026-05-18T16:45:00Z' },
      { id: 'ORD-LQ8F9H33', customer_name: 'Fatima Zeroual', customer_phone: '0544567890', customer_wilaya: 'Sétif', total: 2400, status: 'delivered', created_at: '2026-05-17T09:00:00Z' },
      { id: 'ORD-RJ2M7W61', customer_name: 'Nabil Khelfi', customer_phone: '0699887766', customer_wilaya: 'Bordj Bou Arreridj', total: 7200, status: 'cancelled', created_at: '2026-05-16T11:20:00Z' },
      { id: 'ORD-TX4B1Y88', customer_name: 'Samia Bouzid', customer_phone: '0533221100', customer_wilaya: 'Béjaïa', total: 1600, status: 'pending', created_at: '2026-05-15T13:05:00Z' },
    ]
  },
  orderDetail: {
    id: 'ORD-MP9J6E25', customer_name: 'Karim Benali', customer_phone: '0555123456', customer_wilaya: 'Algiers', customer_address: '12 Rue Didouche Mourad', customer_commune: 'Alger Centre', delivery_type: 'domicile', total: 4800, delivery_fee: 400, status: 'pending', created_at: '2026-05-20T14:30:00Z',
    items: [
      { product_name: 'Pack Sport Premium', quantity: 2, product_price: 1200 },
      { product_name: 'Classique Coton Homme', quantity: 4, product_price: 500 },
    ]
  },
  messages: [
    { id: 'msg_1', name: 'Samira Bouzid', email: 'samira@example.com', message: 'Bonjour, je souhaite commander en gros pour ma boutique à Oran. Quels sont vos tarifs de gros ?', created_at: '2026-05-20T08:30:00Z', is_read: false },
    { id: 'msg_2', name: 'Karim Benali', email: 'karim@example.com', message: 'Merci pour la livraison rapide ! Les chaussettes sont de très bonne qualité.', created_at: '2026-05-19T15:10:00Z', is_read: true },
    { id: 'msg_3', name: 'Amina Hadj', email: 'amina@example.com', message: 'Est-ce que vous livrez à Tlemcen ? Et quel est le délai de livraison ?', created_at: '2026-05-18T09:45:00Z', is_read: false },
    { id: 'msg_4', name: 'Youcef Mesbah', email: 'youcef@example.com', message: 'Je n\'ai pas reçu ma commande ORD-PW5X2V44. Pouvez-vous vérifier ?', created_at: '2026-05-17T14:20:00Z', is_read: true },
  ],
  families: [
    { id: 'classique_coton', label: 'Coton', sort_order: 1 },
    { id: 'invisible', label: 'Invisible', sort_order: 2 },
    { id: 'sport', label: 'Sport', sort_order: 3 },
    { id: 'mi_mollet', label: 'Mi-Mollet', sort_order: 4 },
    { id: 'hiver', label: 'Hiver', sort_order: 5 },
  ]
};

function demoApiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const isWrite = method !== 'GET' && method !== 'HEAD';

  // Handle write operations — simulate locally
  if (isWrite) {
    showToast(ta('demo_toast_saved') || 'Demo: change simulated (not persisted)', 'success');
    if (method === 'PUT' && path.match(/^\/orders\/[^/]+\/status$/)) {
      const status = JSON.parse(options.body).status;
      const orderId = path.split('/')[2];
      const order = DEMO_DATA.orders.orders.find(o => o.id === orderId);
      if (order) order.status = status;
    }
    if (method === 'PUT' && path.match(/^\/products\//) && !path.includes('/image') && !path.includes('/status')) {
      const id = path.split('/')[2];
      const product = DEMO_DATA.products.find(p => p.id === id);
      if (product) Object.assign(product, JSON.parse(options.body));
    }
    if (method === 'PUT' && path.match(/^\/contact\//)) {
      const id = path.split('/')[2];
      const msg = DEMO_DATA.messages.find(m => m.id === id);
      if (msg) msg.is_read = true;
    }
    if (method === 'PUT' && path.match(/^\/families\//)) {
      const id = decodeURIComponent(path.split('/')[2]);
      const family = DEMO_DATA.families.find(f => f.id === id);
      if (family) Object.assign(family, JSON.parse(options.body));
    }
    if (method === 'DELETE' && path.match(/^\/products\//) && !path.includes('/images')) {
      const id = path.includes('/permanent') ? path.split('/')[2] : path.split('/')[2];
      DEMO_DATA.products = DEMO_DATA.products.filter(p => p.id !== id);
    }
    if (method === 'DELETE' && path.match(/^\/contact\//)) {
      const id = path.split('/')[2];
      DEMO_DATA.messages = DEMO_DATA.messages.filter(m => m.id !== id);
    }
    if (method === 'DELETE' && path.match(/^\/families\//)) {
      const id = decodeURIComponent(path.split('/')[2]);
      DEMO_DATA.families = DEMO_DATA.families.filter(f => f.id !== id);
    }
    if (method === 'POST' && path === '/products') {
      const data = JSON.parse(options.body);
      data.is_active = 1;
      DEMO_DATA.products.push(data);
    }
    if (method === 'POST' && path === '/families') {
      const data = JSON.parse(options.body);
      DEMO_DATA.families.push(data);
    }
    return Promise.resolve({ success: true });
  }

  // Handle read operations — return mock data
  if (path === '/dashboard') return Promise.resolve(DEMO_DATA.dashboard);
  if (path === '/products') return Promise.resolve(DEMO_DATA.products);
  if (path.match(/^\/products\//)) {
    const id = path.split('/')[2];
    if (path.includes('/image')) return Promise.resolve({ success: true });
    const product = DEMO_DATA.products.find(p => p.id === id);
    return Promise.resolve(product || null);
  }
  if (path.startsWith('/orders')) {
    if (path.match(/^\/orders\/[^/]+$/)) {
      const id = path.split('/')[2];
      return Promise.resolve({ ...DEMO_DATA.orderDetail, id });
    }
    const urlParams = new URLSearchParams(path.includes('?') ? path.split('?')[1] : '');
    const statusFilter = urlParams.get('status');
    let orders = DEMO_DATA.orders.orders;
    if (statusFilter) orders = orders.filter(o => o.status === statusFilter);
    return Promise.resolve({ orders });
  }
  if (path === '/contact') return Promise.resolve(DEMO_DATA.messages);
  if (path.match(/^\/contact\//)) {
    const id = path.split('/')[2];
    const msg = DEMO_DATA.messages.find(m => m.id === id);
    return Promise.resolve(msg || null);
  }
  if (path === '/families') return Promise.resolve(DEMO_DATA.families);

  return Promise.resolve(null);
}

async function detectDemoMode() {
  try {
    const res = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(3000) });
    DEMO_MODE = !res.ok;
  } catch {
    DEMO_MODE = true;
  }
  if (DEMO_MODE) {
    document.getElementById('demoBanner')?.classList.add('visible');
    token = 'demo-token';
    admin = DEMO_ADMIN;
    DEMO_INITIALIZED = true;
  }
  return DEMO_MODE;
}

function locale() { return adminLang === 'ar' ? 'ar-DZ' : adminLang === 'en' ? 'en-US' : 'fr-FR'; }
let token = null;
localStorage.removeItem('benshop_admin_token');
let admin = JSON.parse(localStorage.getItem('benshop_admin_user') || 'null');

// Product images state
let productImages = [];

// ==========================================
// LANGUAGE SWITCHER
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('adminLangToggle');
  const langDropdown = document.getElementById('adminLangDropdown');

  if (langToggle && langDropdown) {
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
    });

    langDropdown.querySelectorAll('button[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        applyAdminTranslations(lang);
        langDropdown.classList.remove('active');
        renderPage(); // Re-render dynamic content with new language
      });
    });

    document.addEventListener('click', () => {
      langDropdown.classList.remove('active');
    });

    // Apply saved language on load
    applyAdminTranslations(adminLang);
  }
});

// HTML escaping to prevent XSS
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ==========================================
// ROUTING
// ==========================================
function getPage() {
  const hash = window.location.hash.slice(1) || '/';
  if (hash === '/' || hash === '') return 'dashboard';
  if (hash.startsWith('/products')) return 'products';
  if (hash.startsWith('/families')) return 'families';
  if (hash.startsWith('/orders')) return 'orders';
  if (hash.startsWith('/messages')) return 'messages';
  if (hash.startsWith('/customers')) return 'dashboard';
  return 'dashboard';
}

function navigate(page) {
  window.location.hash = '/' + (page === 'dashboard' ? '' : page);
}

window.addEventListener('hashchange', renderPage);

// ==========================================
// API HELPER
// ==========================================
async function apiFetch(path, options = {}) {
  if (DEMO_MODE) return demoApiFetch(path, options);
  const headers = {};
  if (options.body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(API + path, { ...options, headers, credentials: 'same-origin' });
    if (res.status === 401) { logout(); return null; }
    if (!res.ok && res.status !== 400 && res.status !== 404 && res.status !== 409) {
      showToast(ta('server_error') || 'Erreur serveur', 'error');
      return null;
    }
    return res.json();
  } catch (err) {
    showToast(ta('login_error_generic') || 'Erreur de connexion', 'error');
    return null;
  }
}

// ==========================================
// TOAST
// ==========================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${esc(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

// ==========================================
// AUTH
// ==========================================
const loginForm = document.getElementById('loginForm');
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');

async function checkAuth() {
  if (DEMO_MODE) {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    document.getElementById('adminName').textContent = admin.name || admin.email;
    renderPage();
    return;
  }

  if (admin && admin.role === 'admin') {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        admin = data.user;
        localStorage.setItem('benshop_admin_user', JSON.stringify(admin));
      } else {
        admin = null;
        localStorage.removeItem('benshop_admin_user');
      }
    } catch {
      admin = null;
      localStorage.removeItem('benshop_admin_user');
    }
  }

  if (token && admin && admin.role === 'admin') {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    document.getElementById('adminName').textContent = admin.name || admin.email;
    renderPage();
  } else if (admin && admin.role === 'admin') {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    document.getElementById('adminName').textContent = admin.name || admin.email;
    renderPage();
  } else {
    loginScreen.style.display = 'flex';
    appScreen.style.display = 'none';
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (DEMO_MODE) {
      admin = DEMO_ADMIN;
      token = 'demo-token';
      checkAuth();
      return;
    }
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    errorEl.style.display = 'none';
    btn.textContent = ta('login_btn_loading');
    btn.disabled = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.error) {
        errorEl.textContent = data.error;
        errorEl.style.display = 'block';
        btn.textContent = ta('login_btn');
        btn.disabled = false;
        return;
      }

      if (data.user.role !== 'admin') {
        errorEl.textContent = ta('login_error_auth');
        errorEl.style.display = 'block';
        btn.textContent = ta('login_btn');
        btn.disabled = false;
        return;
      }

      token = data.token || null;
      admin = data.user;
      localStorage.setItem('benshop_admin_user', JSON.stringify(admin));
      checkAuth();
    } catch (err) {
      errorEl.textContent = ta('login_error_server');
      errorEl.style.display = 'block';
      btn.textContent = ta('login_btn');
      btn.disabled = false;
    }
  });
}

async function logout() {
  token = null;
  admin = null;
  localStorage.removeItem('benshop_admin_user');
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  } catch {}
  checkAuth();
}

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================
document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
  link.addEventListener('click', () => {
    // Close sidebar on mobile
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('visible');
  });
});

document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('visible', sidebar.classList.contains('open'));
});

document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('visible');
});

// ==========================================
// RENDER PAGE
// ==========================================
async function renderPage() {
  const page = getPage();
  const content = document.getElementById('contentArea');
  const title = document.getElementById('pageTitle');

  // Update active sidebar link
  document.querySelectorAll('.sidebar-link[data-page]').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });

  switch (page) {
    case 'dashboard': title.textContent = ta('dashboard_title'); await renderDashboard(content); break;
    case 'products': title.textContent = ta('products_title'); await renderProducts(content); break;
    case 'families': title.textContent = ta('families_title'); await renderFamilies(content); break;
    case 'orders': title.textContent = ta('orders_title'); await renderOrders(content); break;
    case 'messages': title.textContent = ta('messages_title'); await renderMessages(content); break;
    default: title.textContent = ta('dashboard_title'); await renderDashboard(content);
  }
}

// ==========================================
// DASHBOARD
// ==========================================
async function renderDashboard(container) {
  const data = await apiFetch('/dashboard');
  if (!data) return;

  const { stats, recentOrders, topProducts } = data;

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card__icon accent"><i class="fas fa-shopping-bag"></i></div>
        <div class="stat-card__value">${stats.totalOrders}</div>
        <div class="stat-card__label">${ta('stat_orders')}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon success"><i class="fas fa-coins"></i></div>
        <div class="stat-card__value">${stats.totalRevenue.toLocaleString(locale())} ${ta('currency')}</div>
        <div class="stat-card__label">${ta('stat_revenue')}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon warning"><i class="fas fa-clock"></i></div>
        <div class="stat-card__value">${stats.pendingOrders}</div>
        <div class="stat-card__label">${ta('stat_pending')}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon info"><i class="fas fa-envelope"></i></div>
        <div class="stat-card__value">${stats.unreadMessages}</div>
        <div class="stat-card__label">${ta('stat_unread')}</div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header"><h3>${ta('recent_orders')}</h3></div>
      ${recentOrders.length > 0 ? `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>${ta('th_id')}</th><th>${ta('th_client')}</th><th>${ta('th_wilaya')}</th><th>${ta('th_total')}</th><th>${ta('th_status')}</th><th>${ta('th_date')}</th></tr></thead>
          <tbody>
            ${recentOrders.map(o => `
              <tr style="cursor:pointer" onclick="showOrderDetail('${esc(o.id)}')">
                <td><strong>#${esc(o.id)}</strong></td>
                <td>${esc(o.customer_name)}</td>
                <td>${esc(o.customer_wilaya)}</td>
                <td><strong>${o.total.toLocaleString(locale())} ${ta('currency')}</strong></td>
                <td><span class="badge badge-${esc(o.status)}">${esc(statusLabel(o.status))}</span></td>
                <td>${new Date(o.created_at).toLocaleDateString(locale())}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : `<div class="empty-state"><i class="fas fa-shopping-bag"></i><h4>${ta('no_orders')}</h4><p>${ta('no_orders_desc')}</p></div>`}
    </div>

    ${topProducts && topProducts.length > 0 ? `
    <div class="table-card">
      <div class="table-header"><h3>${ta('top_products')}</h3></div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>${ta('th_product')}</th><th>${ta('th_qty_sold')}</th><th>${ta('th_revenue')}</th></tr></thead>
          <tbody>
            ${topProducts.map(p => `
              <tr><td>${esc(p.product_name)}</td><td>${p.total_sold}</td><td>${p.revenue.toLocaleString(locale())} ${ta('currency')}</td></tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}
  `;
}

function statusLabel(status) {
  const key = 'status_' + status;
  return ta(key) !== key ? ta(key) : status;
}

// ==========================================
// PRODUCTS
// ==========================================
async function renderProducts(container) {
  const products = await apiFetch('/products');
  if (!products) return;

  container.innerHTML = `
    <div class="table-card">
      <div class="table-header">
        <h3>${ta('products_title')} (${products.length})</h3>
        <button class="btn btn-primary btn-sm" onclick="openProductModal()"><i class="fas fa-plus"></i> ${ta('btn_add')}</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>${ta('th_image')}</th><th>${ta('th_name')}</th><th>${ta('th_category')}</th><th>${ta('th_price')}</th><th>${ta('th_stock')}</th><th>${ta('th_status')}</th><th>${ta('th_actions')}</th></tr></thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td><img src="/${esc(p.image)}" alt="" class="prod-thumb" onerror="this.style.display='none'"></td>
                <td><strong>${esc(p.name)}</strong></td>
                <td>${esc(p.category)}</td>
                <td>${p.price.toLocaleString(locale())} ${ta('currency')}${p.old_price ? ` <span style="text-decoration:line-through;color:var(--color-text-muted);font-size:0.75em">${p.old_price.toLocaleString(locale())} ${ta('currency')}</span>` : ''}</td>
                <td>${p.stock}</td>
                <td><span class="badge ${p.is_active ? 'badge-active' : 'badge-inactive'}">${p.is_active ? ta('status_active') : ta('status_inactive')}</span></td>
                <td class="action-group">
                  <button class="btn btn-secondary btn-sm" onclick="openProductModal('${esc(p.id)}')"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-danger btn-sm" onclick="toggleProduct('${esc(p.id)}', ${p.is_active})">${p.is_active ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>'}</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteProduct('${esc(p.id)}')"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function openProductModal(editId) {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  const title = document.getElementById('productModalTitle');

  // Reset image upload state
  resetImageUpload();

  await populateFamilySelect();

  if (editId) {
    title.textContent = ta('modal_edit_product');
    const product = await apiFetch(`/products/${editId}`);
    if (!product) return;
    document.getElementById('productEditId').value = product.id;
    document.getElementById('prodId').value = product.id;
    document.getElementById('prodId').disabled = true;
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodOldPrice').value = product.old_price || '';
    document.getElementById('prodBadge').value = product.badge || '';
    document.getElementById('prodStock').value = product.stock || 100;
    document.getElementById('prodImage').value = product.image;
    document.getElementById('prodDescription').value = product.description || '';
    document.getElementById('prodFamily').value = product.family || '';
    // Populate images
    productImages = product.images && product.images.length > 0 ? [...product.images] : (product.image ? [product.image] : []);
    renderImageGallery();
  } else {
    title.textContent = ta('modal_add_product');
    form.reset();
    document.getElementById('productEditId').value = '';
    document.getElementById('prodId').disabled = false;
    document.getElementById('prodImage').value = '';
    productImages = [];
    renderImageGallery();
  }

  modal.style.display = 'flex';
}

function resetImageUpload() {
  document.getElementById('prodImageFile').value = '';
  document.getElementById('prodImage').value = '';
  pendingImageFiles.forEach(p => URL.revokeObjectURL(p.previewUrl));
  pendingImageFiles = [];
}

// ==========================================
// IMAGE GALLERY
// ==========================================

function renderImageGallery() {
  const container = document.getElementById('imageGallery');
  if (!container) return;
  container.innerHTML = '';
  productImages.forEach((img, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-preview-wrapper';
    wrapper.innerHTML = `
      <img src="/${esc(img)}" alt="Image ${i + 1}" class="image-preview-img">
      <button type="button" class="image-remove-btn" data-idx="${i}"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(wrapper);
  });
  // Attach remove listeners
  container.querySelectorAll('.image-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx);
      const imagePath = productImages[idx];
      const editId = document.getElementById('productEditId').value;
      if (editId) {
        // Remove from server
        try {
          await apiFetch(`/products/${editId}/images`, { method: 'DELETE', body: JSON.stringify({ imagePath }) });
        } catch (e) {}
      }
      productImages.splice(idx, 1);
      if (productImages.length > 0) {
        document.getElementById('prodImage').value = productImages[0];
      } else {
        document.getElementById('prodImage').value = '';
      }
      renderImageGallery();
    });
  });
}

// Pending files for new products (uploaded after save)
let pendingImageFiles = [];

// File input — support multiple files
document.getElementById('prodImageFile')?.addEventListener('change', async function() {
  const files = Array.from(this.files);
  if (files.length === 0) return;
  const editId = document.getElementById('productEditId').value;

  if (editId) {
    // Existing product — upload directly
    for (const file of files) {
      if (DEMO_MODE) {
        showToast(ta('demo_upload_disabled') || 'Demo: image upload is not available', 'error');
        continue;
      }
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(editId)}/image`, {
          method: 'POST',
          credentials: 'same-origin',
          body: formData,
        });
        const data = await res.json();
        if (data.error) { showToast(data.error, 'error'); continue; }
        productImages.push(data.path);
      } catch (err) {
        showToast(ta('image_upload_error') || 'Erreur lors du téléchargement de l\'image', 'error');
      }
    }
    if (productImages.length > 0) {
      document.getElementById('prodImage').value = productImages[0];
    }
    renderImageGallery();
  } else {
    // New product — store files as pending, show previews
    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      pendingImageFiles.push({ file, previewUrl });
    }
    renderPendingImageGallery();
  }
  this.value = '';
});

function renderPendingImageGallery() {
  const container = document.getElementById('imageGallery');
  if (!container) return;
  container.innerHTML = '';
  // Show existing uploaded images
  productImages.forEach((img, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-preview-wrapper';
    wrapper.innerHTML = `
      <img src="/${esc(img)}" alt="Image ${i + 1}" class="image-preview-img">
      <button type="button" class="image-remove-btn" data-idx="${i}" data-type="uploaded"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(wrapper);
  });
  // Show pending images (not yet uploaded)
  pendingImageFiles.forEach((pending, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-preview-wrapper';
    wrapper.innerHTML = `
      <img src="${pending.previewUrl}" alt="Pending ${i + 1}" class="image-preview-img">
      <button type="button" class="image-remove-btn" data-idx="${i}" data-type="pending"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(wrapper);
  });
  // Attach remove listeners
  container.querySelectorAll('.image-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const type = btn.dataset.type;
      if (type === 'pending') {
        URL.revokeObjectURL(pendingImageFiles[idx].previewUrl);
        pendingImageFiles.splice(idx, 1);
      } else {
        const imagePath = productImages[idx];
        const editId = document.getElementById('productEditId').value;
        if (editId) {
          apiFetch(`/products/${editId}/images`, { method: 'DELETE', body: JSON.stringify({ imagePath }) }).catch(() => {});
        }
        productImages.splice(idx, 1);
        if (productImages.length > 0) {
          document.getElementById('prodImage').value = productImages[0];
        } else {
          document.getElementById('prodImage').value = '';
        }
      }
      renderPendingImageGallery();
    });
  });
}

async function uploadPendingImages(productId) {
  if (DEMO_MODE) return;
  for (const pending of pendingImageFiles) {
    const formData = new FormData();
    formData.append('image', pending.file);
    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/image`, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      });
      const data = await res.json();
      if (data.error) { showToast(data.error, 'error'); continue; }
      productImages.push(data.path);
    } catch (err) {
      showToast(ta('image_upload_error') || 'Erreur lors du téléchargement de l\'image', 'error');
    }
    URL.revokeObjectURL(pending.previewUrl);
  }
  pendingImageFiles = [];
}

document.getElementById('closeProductModal')?.addEventListener('click', () => {
  document.getElementById('productModal').style.display = 'none';
});

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const editId = document.getElementById('productEditId').value;
  const data = {
    id: document.getElementById('prodId').value.trim(),
    name: document.getElementById('prodName').value.trim(),
    category: document.getElementById('prodCategory').value,
    price: parseInt(document.getElementById('prodPrice').value),
    old_price: document.getElementById('prodOldPrice').value ? parseInt(document.getElementById('prodOldPrice').value) : null,
    image: productImages.length > 0 ? productImages[0] : 'assets/images/placeholder.svg',
    images: productImages.length > 0 ? productImages : [],
    badge: document.getElementById('prodBadge').value || null,
    description: document.getElementById('prodDescription').value.trim(),
    stock: parseInt(document.getElementById('prodStock').value) || 100,
    family: document.getElementById('prodFamily').value || null,
  };

  try {
    let result;
    if (editId) {
      result = await apiFetch(`/products/${editId}`, { method: 'PUT', body: JSON.stringify(data) });
    } else {
      result = await apiFetch('/products', { method: 'POST', body: JSON.stringify(data) });
    }

    if (!result) return;
    if (result.error) { showToast(result.error, 'error'); return; }

    // Upload any pending images for new products
    if (!editId && pendingImageFiles.length > 0) {
      await uploadPendingImages(data.id);
      // Refresh product data with uploaded images
      const updated = await apiFetch(`/products/${data.id}`);
      if (updated && updated.images) {
        productImages = updated.images;
        if (productImages.length > 0) {
          document.getElementById('prodImage').value = productImages[0];
        }
        renderImageGallery();
      }
    }

    showToast(editId ? ta('product_updated') : ta('product_created'), 'success');

    if (!editId) {
      // Switch to edit mode after creation
      document.getElementById('productEditId').value = data.id;
      document.getElementById('prodId').disabled = true;
    } else {
      document.getElementById('productModal').style.display = 'none';
      renderPage();
    }
  } catch (err) {
    showToast(`${ta('product_error')}${err.message}`, 'error');
  }
});

async function toggleProduct(id, isActive) {
  const action = isActive ? ta('toggle_disable') : ta('toggle_enable');
  if (!confirm(ta('toggle_confirm').replace('${action}', action))) return;
  const result = await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify({ is_active: isActive ? 0 : 1 }) });
  if (!result) return;
  if (result.error) { showToast(result.error, 'error'); return; }
  showToast(isActive ? ta('product_disabled') : ta('product_enabled'), 'success');
  renderPage();
}

async function deleteProduct(id) {
  if (!confirm(ta('product_delete_confirm'))) return;
  const result = await apiFetch(`/products/${id}/permanent`, { method: 'DELETE' });
  if (!result) return;
  if (result.error) { showToast(result.error, 'error'); return; }
  showToast(ta('product_deleted'), 'success');
  renderPage();
}

// ==========================================
// ORDERS
// ==========================================
let currentOrderFilter = 'all';

async function renderOrders(container) {
  const status = currentOrderFilter !== 'all' ? `?status=${currentOrderFilter}` : '';
  const data = await apiFetch(`/orders${status}`);
  if (!data) return;

  container.innerHTML = `
    <div class="table-card">
      <div class="table-header">
        <h3>${ta('orders_title')}</h3>
        <div class="table-filters">
          <button class="filter-btn ${currentOrderFilter === 'all' ? 'active' : ''}" onclick="filterOrders('all')">${ta('filter_all')}</button>
          <button class="filter-btn ${currentOrderFilter === 'pending' ? 'active' : ''}" onclick="filterOrders('pending')">${ta('filter_pending')}</button>
          <button class="filter-btn ${currentOrderFilter === 'confirmed' ? 'active' : ''}" onclick="filterOrders('confirmed')">${ta('filter_confirmed')}</button>
          <button class="filter-btn ${currentOrderFilter === 'shipped' ? 'active' : ''}" onclick="filterOrders('shipped')">${ta('filter_shipped')}</button>
          <button class="filter-btn ${currentOrderFilter === 'delivered' ? 'active' : ''}" onclick="filterOrders('delivered')">${ta('filter_delivered')}</button>
          <button class="filter-btn ${currentOrderFilter === 'cancelled' ? 'active' : ''}" onclick="filterOrders('cancelled')">${ta('filter_cancelled')}</button>
          <button class="btn btn-secondary btn-sm" onclick="exportOrdersCSV()" style="margin-left:auto;"><i class="fas fa-download"></i> ${ta('btn_export_csv')}</button>
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>${ta('th_id')}</th><th>${ta('th_client')}</th><th>${ta('th_phone')}</th><th>${ta('th_wilaya')}</th><th>${ta('th_total')}</th><th>${ta('th_status')}</th><th>${ta('th_date')}</th><th>${ta('th_actions')}</th></tr></thead>
          <tbody>
            ${data.orders.map(o => `
              <tr>
                <td><strong>#${esc(o.id)}</strong></td>
                <td>${esc(o.customer_name)}</td>
                <td>${esc(o.customer_phone)}</td>
                <td>${esc(o.customer_wilaya)}</td>
                <td><strong>${o.total.toLocaleString(locale())} ${ta('currency')}</strong></td>
                <td><span class="badge badge-${esc(o.status)}">${esc(statusLabel(o.status))}</span></td>
                <td>${new Date(o.created_at).toLocaleDateString(locale())}</td>
                <td class="action-group">
                  <button class="btn btn-secondary btn-sm" onclick="showOrderDetail('${esc(o.id)}')"><i class="fas fa-eye"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function filterOrders(status) { currentOrderFilter = status; renderPage(); }

async function showOrderDetail(orderId) {
  const order = await apiFetch(`/orders/${orderId}`);
  if (!order) return;

  const modal = document.getElementById('orderModal');
  document.getElementById('orderModalId').textContent = '#' + order.id;
  const status = order.status;
  const items = order.items || [];

  // Format phone for WhatsApp: strip leading 0, add 213 country code
  let phone = (order.customer_phone || '').replace(/\s/g, '');
  if (phone.startsWith('0')) phone = '213' + phone.substring(1);

  document.getElementById('orderModalBody').innerHTML = `
    <div class="order-info-grid">
      <div><div class="order-info-label">${ta('th_client')}</div><div class="order-info-value">${esc(order.customer_name)}</div></div>
      <div><div class="order-info-label">${ta('th_phone')}</div><div class="order-info-value">${esc(order.customer_phone)}</div></div>
      <div><div class="order-info-label">${ta('th_wilaya')}</div><div class="order-info-value">${esc(order.customer_wilaya)}</div></div>
      ${order.delivery_type ? `<div><div class="order-info-label">${ta('order_delivery_type')}</div><div class="order-info-value">${esc(order.delivery_type === 'domicile' ? ta('checkout_delivery_home') : ta('checkout_delivery_office'))}</div></div>` : ''}
      ${order.customer_commune ? `<div><div class="order-info-label">${ta('checkout_commune')}</div><div class="order-info-value">${esc(order.customer_commune)}</div></div>` : ''}
      <div><div class="order-info-label">${ta('th_address')}</div><div class="order-info-value">${esc(order.customer_address)}</div></div>
      <div><div class="order-info-label">${ta('th_date')}</div><div class="order-info-value">${new Date(order.created_at).toLocaleDateString(locale(), {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div></div>
      <div><div class="order-info-label">${ta('th_status')}</div><div class="order-info-value"><span class="badge badge-${esc(status)}">${esc(statusLabel(status))}</span></div></div>
    </div>
    <div style="border-top:1px solid var(--color-border-soft);padding-top:16px;">
      <h4 style="font-size:0.8125rem;font-weight:600;margin-bottom:8px;">${ta('order_articles')}</h4>
      ${items.map(i => `
        <div class="order-item"><span>${esc(i.product_name)} x${i.quantity}</span><span>${(i.product_price * i.quantity).toLocaleString(locale())} ${ta('currency')}</span></div>
      `).join('')}
      ${order.delivery_fee ? `<div class="order-item"><span>${ta('cart_delivery')}</span><span>${order.delivery_fee.toLocaleString(locale())} ${ta('currency')}</span></div>` : ''}
      <div class="order-total"><span>${ta('th_total')}</span><span style="color:var(--color-accent)">${order.total.toLocaleString(locale())} ${ta('currency')}</span></div>
    </div>
    <div class="order-actions">
      ${status === 'pending' ? '<button class="btn btn-success btn-sm" onclick="updateOrderStatus(\'' + esc(order.id) + '\', \'confirmed\')"><i class="fas fa-check"></i> ' + ta('btn_confirm') + '</button><button class="btn btn-danger btn-sm" onclick="confirmCancelOrder(\'' + esc(order.id) + '\')"><i class="fas fa-times"></i> ' + ta('btn_reject') + '</button>' : ''}
      ${status === 'confirmed' ? '<button class="btn btn-primary btn-sm" onclick="updateOrderStatus(\'' + esc(order.id) + '\', \'shipped\')"><i class="fas fa-truck"></i> ' + ta('btn_ship') + '</button>' : ''}
      ${status === 'shipped' ? '<button class="btn btn-success btn-sm" onclick="updateOrderStatus(\'' + esc(order.id) + '\', \'delivered\')"><i class="fas fa-box-open"></i> ' + ta('btn_delivered') + '</button>' : ''}
      <a href="https://wa.me/${esc(phone)}?text=${encodeURIComponent(ta('wa_order_status') + order.id + ' ' + ta('wa_order_on') + statusLabel(status))}" target="_blank" class="btn btn-secondary btn-sm" style="background:#25D366;color:#FFF;border:none;"><i class="fab fa-whatsapp"></i> ${ta('btn_whatsapp')}</a>
    </div>
  `;

  modal.style.display = 'flex';
}

function confirmCancelOrder(orderId) {
  if (!confirm(ta('cancel_confirm'))) return;
  updateOrderStatus(orderId, 'cancelled');
}

document.getElementById('closeOrderModal')?.addEventListener('click', () => {
  document.getElementById('orderModal').style.display = 'none';
});

async function updateOrderStatus(orderId, status) {
  const result = await apiFetch(`/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  if (!result) return;
  if (result.error) { showToast(result.error, 'error'); return; }
  showToast(`${ta('order_updated')}: ${statusLabel(status)}`, 'success');
  document.getElementById('orderModal').style.display = 'none';
  renderPage();
}

// ==========================================
// MESSAGES
// ==========================================
async function exportOrdersCSV() {
  if (DEMO_MODE) {
    showToast(ta('demo_export_disabled') || 'Demo: CSV export is not available', 'error');
    return;
  }
  try {
    const res = await fetch('/api/admin/orders/export', {
      credentials: 'same-origin'
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes_benshop_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(ta('export_success'));
  } catch (err) {
    console.error('CSV export error:', err);
    showToast(ta('export_error'), 'error');
  }
}

async function renderMessages(container) {
  const messages = await apiFetch('/contact');
  if (!messages) return;
  window._adminMessagesCache = messages;

  container.innerHTML = `
    <div class="table-card">
      <div class="table-header"><h3>${ta('messages_title')} (${messages.length})</h3></div>
      ${messages.length > 0 ? `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>${ta('th_from')}</th><th>${ta('th_email')}</th><th>${ta('th_message')}</th><th>${ta('th_date')}</th><th>${ta('th_status')}</th><th>${ta('th_actions')}</th></tr></thead>
          <tbody>
            ${messages.map(m => `
              <tr>
                <td><strong>${esc(m.name)}</strong></td>
                <td>${esc(m.email)}</td>
                <td style="max-width:300px;">
                  <div class="msg-cell">
                    <div class="msg-preview">${esc(m.message.length > 60 ? m.message.substring(0, 60) + '...' : m.message)}</div>
                    ${m.message.length > 60 ? `<button class="btn btn-secondary btn-sm" onclick="viewMessage('${esc(m.id)}')" title="${ta('view_msg') || 'Voir'}"><i class="fas fa-eye"></i></button>` : ''}
                  </div>
                </td>
                <td>${new Date(m.created_at).toLocaleDateString(locale())}</td>
                <td><span class="badge ${m.is_read ? 'badge-active' : 'badge-pending'}">${m.is_read ? ta('msg_read') : ta('msg_unread')}</span></td>
                <td class="action-group">${!m.is_read ? `<button class="btn btn-secondary btn-sm" onclick="markMessageRead('${esc(m.id)}')" title="${ta('mark_read')}"><i class="fas fa-check"></i></button>` : ''}<button class="btn btn-danger btn-sm" onclick="deleteMessage('${esc(m.id)}')" title="${ta('delete_msg')}"><i class="fas fa-trash"></i></button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : `<div class="empty-state"><i class="fas fa-envelope"></i><h4>${ta('no_messages')}</h4></div>`}
    </div>
  `;
}

function viewMessage(id) {
  const messages = window._adminMessagesCache;
  if (!messages) return;
  const msg = messages.find(m => m.id === id);
  if (!msg) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;max-width:500px;width:100%;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;font-size:1.1rem;">${esc(msg.name)}</h3>
        <button onclick="this.closest('div[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;">&times;</button>
      </div>
      <div style="font-size:0.85rem;color:#888;margin-bottom:12px;">${esc(msg.email)} &middot; ${new Date(msg.created_at).toLocaleDateString(locale())}</div>
      <div style="font-size:0.95rem;line-height:1.6;color:#333;white-space:pre-wrap;word-break:break-word;">${esc(msg.message)}</div>
      <div style="margin-top:16px;text-align:right;">
        ${!msg.is_read ? `<button class="btn btn-secondary" onclick="markMessageRead('${esc(msg.id)}');this.closest('div[style*=fixed]').remove();" style="margin-right:8px;"><i class="fas fa-check"></i> ${ta('mark_read')}</button>` : ''}
        <button class="btn btn-primary" onclick="this.closest('div[style*=fixed]').remove();">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

async function markMessageRead(id) {
  const result = await apiFetch(`/contact/${id}/read`, { method: 'PUT' });
  if (!result) return;
  if (result.error) { showToast(result.error, 'error'); return; }
  showToast(ta('msg_marked_read'), 'success');
  renderPage();
}

async function deleteMessage(id) {
  if (!confirm(ta('delete_confirm'))) return;
  const result = await apiFetch(`/contact/${id}`, { method: 'DELETE' });
  if (!result) return;
  if (result.error) { showToast(result.error, 'error'); return; }
  showToast(ta('msg_deleted'), 'success');
  renderPage();
}

// ==========================================
// FAMILIES
// ==========================================
async function renderFamilies(container) {
  const families = await apiFetch('/families');
  if (!families) return;

  container.innerHTML = `
    <div class="table-card">
      <div class="table-header">
        <h3>${ta('families_title')} (${families.length})</h3>
        <button class="btn btn-primary btn-sm" onclick="openFamilyModal()"><i class="fas fa-plus"></i> ${ta('btn_add')}</button>
      </div>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>${ta('th_id')}</th><th>${ta('th_label')}</th><th>${ta('th_order')}</th><th>${ta('th_actions')}</th></tr></thead>
          <tbody>
            ${families.map(f => `
              <tr>
                <td><code>${esc(f.id)}</code></td>
                <td><strong>${esc(f.label)}</strong></td>
                <td>${f.sort_order}</td>
                <td class="action-group">
                  <button class="btn btn-secondary btn-sm" onclick="openFamilyModal('${esc(f.id)}')"><i class="fas fa-edit"></i></button>
                  <button class="btn btn-danger btn-sm" onclick="deleteFamily('${esc(f.id)}')"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openFamilyModal(editId) {
  const modal = document.getElementById('familyModal');
  const title = document.getElementById('familyModalTitle');
  const idInput = document.getElementById('familyId');
  const labelInput = document.getElementById('familyLabel');
  const orderInput = document.getElementById('familyOrder');

  if (editId) {
    title.textContent = ta('modal_edit_family');
    idInput.value = editId;
    idInput.readOnly = true;
    document.getElementById('familyEditId').value = editId;
    // Fetch family data from API
    apiFetch('/families').then(families => {
      const family = families && !families.error ? families.find(f => f.id === editId) : null;
      if (family) {
        labelInput.value = family.label || '';
        orderInput.value = family.sort_order != null ? family.sort_order : '0';
      } else {
        // Fallback to DOM
        const row = document.querySelector(`button[onclick*="${editId}"]`)?.closest('tr');
        labelInput.value = row ? row.cells[1].textContent.trim() : '';
        orderInput.value = row ? row.cells[2].textContent.trim() : '0';
      }
    });
  } else {
    title.textContent = ta('modal_add_family');
    idInput.value = '';
    idInput.readOnly = false;
    labelInput.value = '';
    orderInput.value = '0';
    document.getElementById('familyEditId').value = '';
  }
  modal.style.display = 'flex';
}

document.getElementById('closeFamilyModal')?.addEventListener('click', () => {
  document.getElementById('familyModal').style.display = 'none';
});

document.getElementById('familyModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'familyModal') e.target.style.display = 'none';
});

document.getElementById('familyForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const editId = document.getElementById('familyEditId').value;
  const data = {
    id: document.getElementById('familyId').value.trim(),
    label: document.getElementById('familyLabel').value.trim(),
    sort_order: parseInt(document.getElementById('familyOrder').value) || 0
  };

  if (!data.id || !data.label) {
    showToast(ta('family_required'), 'error');
    return;
  }

  const result = editId
    ? await apiFetch(`/families/${encodeURIComponent(data.id)}`, { method: 'PUT', body: JSON.stringify(data) })
    : await apiFetch('/families', { method: 'POST', body: JSON.stringify(data) });

  if (!result) return;
  if (result.error) { showToast(result.error, 'error'); return; }

  showToast(editId ? ta('family_updated') : ta('family_created'), 'success');
  document.getElementById('familyModal').style.display = 'none';
  renderPage();
});

async function deleteFamily(id) {
  if (!confirm(ta('family_delete_confirm'))) return;
  const result = await apiFetch(`/families/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!result) return;
  if (result.error) { showToast(result.error, 'error'); return; }
  showToast(ta('family_deleted'), 'success');
  renderPage();
}

// Populate product form family select dynamically
async function populateFamilySelect() {
  const select = document.getElementById('prodFamily');
  if (!select) return;
  const families = await apiFetch('/families');
  if (!families) return;
  const currentVal = select.value;
  select.innerHTML = '<option value="">' + ta('ph_family_none') + '</option>';
  families.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.label;
    select.appendChild(opt);
  });
  if (currentVal) select.value = currentVal;
}

// ==========================================
// INITIALIZE
// ==========================================
detectDemoMode().then(() => checkAuth());
