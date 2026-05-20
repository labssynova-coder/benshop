/* ==========================================
   BENSHOP — API Module
   Fetches products from backend with fallback to hardcoded data
   ========================================== */

// Fallback product data (used when API is unreachable)
// NOTE: This data must be kept in sync with the seed data in server/db/init.js.
// When products are added/changed on the server, update this array too.
const FALLBACK_PRODUCTS = [
  { id: "prod_invisible_1", name: "Chaussettes Invisibles — Pack de 3", category: "homme", price: 450, oldPrice: null, image: "assets/images/prod-invisible.png", badge: "Populaire", desc: "Lot de 3 paires de chaussettes invisibles pour homme, idéales pour les mocassins et baskets basses.", family: "coupe" },
  { id: "prod_dress_1", name: "Chaussettes Classiques Noires", category: "homme", price: 350, oldPrice: null, image: "assets/images/prod-dress-noir.png", badge: null, desc: "Chaussettes de ville élégantes noires, parfaites pour le bureau et les occasions formelles.", family: "classique" },
  { id: "prod_sport_1", name: "Chaussettes Sport — Blanc", category: "homme", price: 300, oldPrice: null, image: "assets/images/prod-sport.png", badge: "Nouveau", desc: "Chaussettes de sport confortables avec renfort au talon pour l'entraînement quotidien.", family: "tige" },
  { id: "prod_rayures_1", name: "Chaussettes Rayées Marine", category: "homme", price: 400, oldPrice: null, image: "assets/images/prod-rayures.png", badge: null, desc: "Chaussettes casual à rayures bleu marine intemporelles.", family: "classique" },
  { id: "prod_coton_1", name: "Chaussettes Coton Premium — Gris", category: "homme", price: 380, oldPrice: null, image: "assets/images/prod-coton-gris.png", badge: null, desc: "Chaussettes mi-mollet en coton gris anthracite haute qualité.", family: "classique_coton" },
  { id: "prod_pack_1", name: "Pack Cadeau — 5 Paires Assorties", category: "homme", price: 1500, oldPrice: 1800, image: "assets/images/prod-pack.png", badge: "Promo", desc: "Coffret cadeau comprenant 5 paires de chaussettes aux couleurs variées.", family: "classique" },
  { id: "prod_femme_1", name: "Chaussettes Femme — Rose Élégant", category: "femme", price: 320, oldPrice: null, image: "assets/images/cat-femme.png", badge: "Nouveau", desc: "Chaussettes fines et élégantes pour femme dans un ton rose pâle doux.", family: "classique" },
  { id: "prod_femme_inv_1", name: "Chaussettes Invisibles Femme", category: "femme", price: 400, oldPrice: null, image: "assets/images/prod-invisible.png", badge: null, desc: "Chaussettes invisibles (no-show) pour femme, parfaites avec des ballerines.", family: "coupe" },
  { id: "prod_enfant_1", name: "Chaussettes Colorées — Pack Enfants", category: "enfants", price: 250, oldPrice: null, image: "assets/images/prod-enfant-color.png", badge: "Populaire", desc: "Pack de chaussettes enfants avec motifs amusants et couleurs vives.", family: "classique" },
  { id: "prod_enfant_ray_1", name: "Chaussettes Rayées Enfants", category: "enfants", price: 200, oldPrice: null, image: "assets/images/cat-enfants.png", badge: null, desc: "Chaussettes rayées confortables pour enfants.", family: "classique" },
  { id: "prod_autres_1", name: "Chaussettes Sport — Mixte", category: "autres", price: 280, oldPrice: null, image: "assets/images/cat-autres.png", badge: null, desc: "Chaussettes de sport athlétiques polyvalentes pour hommes et femmes.", family: "tige" },
  { id: "prod_autres_therm_1", name: "Chaussettes Thermiques — Hiver", category: "autres", price: 500, oldPrice: null, image: "assets/images/cat-homme.png", badge: "Hiver", desc: "Chaussettes épaisses et chaudes conçues spécialement pour les températures froides.", family: "tige_longue" }
];

// Global products array (populated from API or fallback)
let products = [];
let _productsReady = false;
let _apiAvailable = false;

// API base URL
const API_BASE = window.location.origin;

// Fetch products from API, fallback to hardcoded data
async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    // Normalize: map old_price to oldPrice, description to desc
    products = data.map(p => ({
      ...p,
      oldPrice: p.oldPrice || p.old_price || null,
      desc: p.desc || p.description || '',
    }));
    _apiAvailable = true;
    _productsReady = true;
  } catch (err) {
    console.warn('[BENSHOP] API unavailable, using fallback data');
    products = FALLBACK_PRODUCTS;
    _productsReady = true;
  }
  // Dispatch custom event so script.js knows products are ready
  window.dispatchEvent(new CustomEvent('productsLoaded'));
}

// API helper functions
const Api = {
  // Orders (guest only)
  async placeOrder(orderData) {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return res.json();
  },

  async getOrder(orderId) {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
    return res.json();
  },

  // Contact
  async sendContactMessage(name, email, message) {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });
    return res.json();
  },

  // Wilayas
  async getWilayas() {
    const res = await fetch(`${API_BASE}/api/wilayas`);
    return res.json();
  },

  // Families
  async getFamilies() {
    const res = await fetch(`${API_BASE}/api/products/families`);
    return res.json();
  },
};

// Start loading products immediately
loadProducts();