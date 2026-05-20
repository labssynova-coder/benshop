const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('../config');

const dbPath = path.resolve(config.dbPath);
let db = null;

async function initDB() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      old_price INTEGER,
      image TEXT NOT NULL,
      badge TEXT,
      description TEXT,
      stock INTEGER DEFAULT 100,
      family TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      wilaya TEXT,
      address TEXT,
      role TEXT DEFAULT 'customer',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_wilaya TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      customer_commune TEXT,
      customer_email TEXT,
      total INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT DEFAULT 'cod',
      notes TEXT,
      whatsapp_sent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(is_read)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`);

  // Schema migration versioning
  db.run(`CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY, applied_at TEXT DEFAULT (datetime('now')))`);
  const currentVersion = queryGet('SELECT MAX(version) as v FROM schema_version')?.v || 0;

  // Migration 1: Add family column to products, customer_email to orders
  if (currentVersion < 1) {
    const columns = db.exec("PRAGMA table_info(products)")[0]?.values.map(row => row[1]) || [];
    if (!columns.includes('family')) {
      db.run('ALTER TABLE products ADD COLUMN family TEXT');
    }
    const orderColumns = db.exec("PRAGMA table_info(orders)")[0]?.values.map(row => row[1]) || [];
    if (!orderColumns.includes('customer_email')) {
      db.run('ALTER TABLE orders ADD COLUMN customer_email TEXT');
    }
    db.run('INSERT INTO schema_version (version) VALUES (1)');
    console.log('Migration 1: Applied (family, customer_email columns)');
  }

  // Migration 2: Add customer_commune column to orders
  if (currentVersion < 2) {
    const orderColumns = db.exec("PRAGMA table_info(orders)")[0]?.values.map(row => row[1]) || [];
    if (!orderColumns.includes('customer_commune')) {
      db.run('ALTER TABLE orders ADD COLUMN customer_commune TEXT');
    }
    db.run('INSERT INTO schema_version (version) VALUES (2)');
    console.log('Migration 2: Applied (customer_commune column)');
  }

  // Migration 3: Add delivery_fee and delivery_type columns to orders
  if (currentVersion < 3) {
    const orderCols = db.exec("PRAGMA table_info(orders)")[0]?.values.map(row => row[1]) || [];
    if (!orderCols.includes('delivery_fee')) {
      db.run('ALTER TABLE orders ADD COLUMN delivery_fee INTEGER DEFAULT 0');
    }
    if (!orderCols.includes('delivery_type')) {
      db.run('ALTER TABLE orders ADD COLUMN delivery_type TEXT');
    }
    db.run('INSERT INTO schema_version (version) VALUES (3)');
    console.log('Migration 3: Applied (delivery_fee, delivery_type columns)');
  }

  // Migration 4: Add selected_size and selected_color columns to order_items
  if (currentVersion < 4) {
    const itemCols = db.exec("PRAGMA table_info(order_items)")[0]?.values.map(row => row[1]) || [];
    if (!itemCols.includes('selected_size')) {
      db.run('ALTER TABLE order_items ADD COLUMN selected_size TEXT');
    }
    if (!itemCols.includes('selected_color')) {
      db.run('ALTER TABLE order_items ADD COLUMN selected_color TEXT');
    }
    db.run('INSERT INTO schema_version (version) VALUES (4)');
    console.log('Migration 4: Applied (selected_size, selected_color columns on order_items)');
  }

  // Migration 5: Add variants column to products, add selected_image to order_items
  if (currentVersion < 5) {
    const prodCols = db.exec("PRAGMA table_info(products)")[0]?.values.map(row => row[1]) || [];
    if (!prodCols.includes('variants')) {
      db.run('ALTER TABLE products ADD COLUMN variants TEXT');
    }
    const itemCols2 = db.exec("PRAGMA table_info(order_items)")[0]?.values.map(row => row[1]) || [];
    if (!itemCols2.includes('selected_image')) {
      db.run('ALTER TABLE order_items ADD COLUMN selected_image TEXT');
    }
    // Migrate existing products: combine sizes/colors into variants format
    if (prodCols.includes('sizes') || prodCols.includes('colors')) {
      const selectCols = ['id', 'image'];
      if (prodCols.includes('sizes')) selectCols.push('sizes');
      if (prodCols.includes('colors')) selectCols.push('colors');
      const products = db.exec(`SELECT ${selectCols.join(', ')} FROM products`);
      if (products && products.length > 0) {
      const cols = products[0].columns;
      products[0].values.forEach(row => {
        const prod = {};
        cols.forEach((col, i) => { prod[col] = row[i]; });
        let sizes = [];
        let colors = [];
        try { sizes = prod.sizes ? JSON.parse(prod.sizes) : []; } catch { sizes = []; }
        try { colors = prod.colors ? JSON.parse(prod.colors) : []; } catch { colors = []; }
        if (sizes.length > 0 || colors.length > 0) {
          const variants = colors.length > 0
            ? colors.map(c => {
                const color = typeof c === 'object' ? { name: c.name, hex: c.hex } : { name: c, hex: c };
                return { image: prod.image || '', color, sizes: [...sizes] };
              })
            : [{ image: prod.image || '', color: null, sizes: [...sizes] }];
          db.run('UPDATE products SET variants = ? WHERE id = ?', [JSON.stringify(variants), prod.id]);
        }
      });
      }
    }
    db.run('INSERT INTO schema_version (version) VALUES (5)');
    console.log('Migration 5: Applied (variants column on products, selected_image on order_items, data migration)');
  }

  // Migration 6: Add images column to products (JSON array of image paths)
  if (currentVersion < 6) {
    const prodCols = db.exec("PRAGMA table_info(products)")[0]?.values.map(row => row[1]) || [];
    if (!prodCols.includes('images')) {
      db.run('ALTER TABLE products ADD COLUMN images TEXT');
    }
    // Migrate existing images: collect from variants or use single image
    const products = queryAll('SELECT id, image, variants, images FROM products');
    products.forEach(p => {
      if (p.images) return; // already migrated
      let imageList = [];
      // Try extracting from variants first
      try {
        const variants = JSON.parse(p.variants);
        if (Array.isArray(variants)) {
          variants.forEach(v => {
            if (v.image) imageList.push(v.image);
          });
        }
      } catch (e) {}
      // Fall back to single image
      if (imageList.length === 0 && p.image) {
        imageList = [p.image];
      }
      if (imageList.length > 0) {
        run('UPDATE products SET images = ? WHERE id = ?', [JSON.stringify(imageList), p.id]);
      }
    });
    db.run('INSERT INTO schema_version (version) VALUES (6)');
    console.log('Migration 6: Applied (images column on products, data migration)');
  }

  // Migration 7: Drop legacy sizes, colors, variants columns from products
  if (currentVersion < 7) {
    const prodCols = db.exec("PRAGMA table_info(products)")[0]?.values.map(row => row[1]) || [];
    if (prodCols.includes('sizes')) {
      db.run('ALTER TABLE products DROP COLUMN sizes');
    }
    if (prodCols.includes('colors')) {
      db.run('ALTER TABLE products DROP COLUMN colors');
    }
    if (prodCols.includes('variants')) {
      db.run('ALTER TABLE products DROP COLUMN variants');
    }
    // Also drop selected_size, selected_color, selected_image from order_items (legacy variant fields)
    const itemCols = db.exec("PRAGMA table_info(order_items)")[0]?.values.map(row => row[1]) || [];
    if (itemCols.includes('selected_size')) {
      db.run('ALTER TABLE order_items DROP COLUMN selected_size');
    }
    if (itemCols.includes('selected_color')) {
      db.run('ALTER TABLE order_items DROP COLUMN selected_color');
    }
    if (itemCols.includes('selected_image')) {
      db.run('ALTER TABLE order_items DROP COLUMN selected_image');
    }
    db.run('INSERT INTO schema_version (version) VALUES (7)');
    console.log('Migration 7: Applied (dropped legacy sizes, colors, variants from products; selected_size, selected_color, selected_image from order_items)');
  }

  // Seed products if empty
  const productCount = db.exec('SELECT COUNT(*) as count FROM products')[0]?.values[0]?.[0] || 0;
  if (productCount === 0) {
    const products = [
      { id: 'prod_invisible_1', name: 'Chaussettes Invisibles — Pack de 3', category: 'homme', price: 450, old_price: null, image: 'assets/images/prod-invisible.png', badge: 'Populaire', description: 'Lot de 3 paires de chaussettes invisibles pour homme, idéales pour les mocassins et baskets basses.', family: 'coupe' },
      { id: 'prod_dress_1', name: 'Chaussettes Classiques Noires', category: 'homme', price: 350, old_price: null, image: 'assets/images/prod-dress-noir.png', badge: null, description: 'Chaussettes de ville élégantes noires, parfaites pour le bureau et les occasions formelles.', family: 'classique' },
      { id: 'prod_sport_1', name: 'Chaussettes Sport — Blanc', category: 'homme', price: 300, old_price: null, image: 'assets/images/prod-sport.png', badge: 'Nouveau', description: "Chaussettes de sport confortables avec renfort au talon pour l'entraînement quotidien.", family: 'tige' },
      { id: 'prod_rayures_1', name: 'Chaussettes Rayées Marine', category: 'homme', price: 400, old_price: null, image: 'assets/images/prod-rayures.png', badge: null, description: 'Chaussettes casual à rayures bleu marine intemporelles.', family: 'classique' },
      { id: 'prod_coton_1', name: 'Chaussettes Coton Premium — Gris', category: 'homme', price: 380, old_price: null, image: 'assets/images/prod-coton-gris.png', badge: null, description: 'Chaussettes mi-mollet en coton gris anthracite haute qualité.', family: 'classique_coton' },
      { id: 'prod_pack_1', name: 'Pack Cadeau — 5 Paires Assorties', category: 'homme', price: 1500, old_price: 1800, image: 'assets/images/prod-pack.png', badge: 'Promo', description: 'Coffret cadeau comprenant 5 paires de chaussettes aux couleurs variées.', family: 'classique' },
      { id: 'prod_femme_1', name: 'Chaussettes Femme — Rose Élégant', category: 'femme', price: 320, old_price: null, image: 'assets/images/cat-femme.png', badge: 'Nouveau', description: 'Chaussettes fines et élégantes pour femme dans un ton rose pâle doux.', family: 'classique' },
      { id: 'prod_femme_inv_1', name: 'Chaussettes Invisibles Femme', category: 'femme', price: 400, old_price: null, image: 'assets/images/prod-invisible.png', badge: null, description: 'Chaussettes invisibles (no-show) pour femme, parfaites avec des ballerines.', family: 'coupe' },
      { id: 'prod_enfant_1', name: 'Chaussettes Colorées — Pack Enfants', category: 'enfants', price: 250, old_price: null, image: 'assets/images/prod-enfant-color.png', badge: 'Populaire', description: 'Pack de chaussettes enfants avec motifs amusants et couleurs vives.', family: 'classique' },
      { id: 'prod_enfant_ray_1', name: 'Chaussettes Rayées Enfants', category: 'enfants', price: 200, old_price: null, image: 'assets/images/cat-enfants.png', badge: null, description: 'Chaussettes rayées confortables pour enfants.', family: 'classique' },
      { id: 'prod_autres_1', name: 'Chaussettes Sport — Mixte', category: 'autres', price: 280, old_price: null, image: 'assets/images/cat-autres.png', badge: null, description: 'Chaussettes de sport athlétiques polyvalentes pour hommes et femmes.', family: 'tige' },
      { id: 'prod_autres_therm_1', name: 'Chaussettes Thermiques — Hiver', category: 'autres', price: 500, old_price: null, image: 'assets/images/cat-homme.png', badge: 'Hiver', description: 'Chaussettes épaisses et chaudes conçues spécialement pour les températures froides.', family: 'tige_longue' },
    ];

    const stmt = db.prepare('INSERT INTO products (id, name, category, price, old_price, image, badge, description, family) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const p of products) {
      stmt.bind([p.id, p.name, p.category, p.price, p.old_price, p.image, p.badge, p.description, p.family]);
      stmt.step();
      stmt.reset();
    }
    stmt.free();
    console.log(`Seeded ${products.length} products`);
  }

  // Seed families if empty
  const familyCount = db.exec('SELECT COUNT(*) as count FROM families')[0]?.values[0]?.[0] || 0;
  if (familyCount === 0) {
    const families = [
      { id: 'classique', label: 'Classique', sort_order: 1 },
      { id: 'classique_coton', label: 'Coton', sort_order: 2 },
      { id: 'coupe', label: 'Coupé', sort_order: 3 },
      { id: 'tige', label: 'Tige', sort_order: 4 },
      { id: 'tige_longue', label: 'Tige Longue', sort_order: 5 },
      { id: 'bamboo', label: 'Bamboo', sort_order: 6 },
      { id: 'socket_montante', label: 'Socket Montante', sort_order: 7 },
      { id: 'socket_basse', label: 'Socket Basse', sort_order: 8 },
      { id: 'silicone_coupe', label: 'Silicone Coupé', sort_order: 9 },
      { id: 'silicone_tige', label: 'Silicone Tige', sort_order: 10 },
    ];
    const famStmt = db.prepare('INSERT INTO families (id, label, sort_order) VALUES (?, ?, ?)');
    for (const f of families) {
      famStmt.bind([f.id, f.label, f.sort_order]);
      famStmt.step();
      famStmt.reset();
    }
    famStmt.free();
    console.log(`Seeded ${families.length} families`);
  }

  // Seed admin user if no admin exists
  const adminCount = db.exec("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")[0]?.values[0]?.[0] || 0;
  if (adminCount === 0) {
    if (!config.adminPassword) {
      console.warn('[WARN] No ADMIN_PASSWORD set. Skipping admin user creation.');
      console.warn('[WARN] Set ADMIN_PASSWORD in .env and run `npm run seed` to create an admin user.');
    } else {
      const { v4: uuidv4 } = require('uuid');
      const adminId = uuidv4();
      const hashedPassword = bcrypt.hashSync(config.adminPassword, config.bcryptSaltRounds);
      const stmt = db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
      stmt.bind([adminId, 'Admin BENSHOP', config.adminEmail, hashedPassword, 'admin']);
      stmt.step();
      stmt.free();
      console.log(`Created admin user: ${config.adminEmail}`);
    }
  }

  saveDB();
  console.log('Database initialized successfully');
  return db;
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  fs.writeFileSync(dbPath, buffer);
}

// Debounced save — batches rapid writes and saves once after 500ms of inactivity
let _saveTimer = null;
let _savePending = false;

function scheduleSave(delay = 500) {
  _savePending = true;
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    saveDB();
    _savePending = false;
    _saveTimer = null;
  }, delay);
}

function flushSave() {
  if (_saveTimer) clearTimeout(_saveTimer);
  if (_savePending) {
    saveDB();
    _savePending = false;
  }
}

// Flush pending saves before process exit (beforeExit is sufficient; SIGINT/SIGTERM handled in index.js)
process.on('beforeExit', flushSave);

// Helper to convert sql.js results to familiar format
function queryAll(sql, params) {
  const database = getDB();
  if (params && params.length > 0) {
    const stmt = database.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
  const result = database.exec(sql);
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

function queryGet(sql, params) {
  const results = queryAll(sql, params || []);
  return results.length > 0 ? results[0] : null;
}

function run(sql, params) {
  const database = getDB();
  if (params && params.length > 0) {
    database.run(sql, params);
  } else {
    database.run(sql);
  }
  scheduleSave();
}

function beginTransaction() {
  getDB().run('BEGIN TRANSACTION');
}

function commitTransaction() {
  getDB().run('COMMIT');
  scheduleSave();
}

function rollbackTransaction() {
  getDB().run('ROLLBACK');
}

module.exports = { initDB, getDB, saveDB, flushSave, queryAll, queryGet, run, beginTransaction, commitTransaction, rollbackTransaction };
