import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'amma-fresh.db'));

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize database tables
export function initializeDatabase() {
  // Products table - stores all product information
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grams INTEGER NOT NULL,
      liter REAL NOT NULL,
      price REAL NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      badge TEXT,
      delivery_charge REAL NOT NULL DEFAULT 49,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table - stores customer orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      delivery_address TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      landmark TEXT,
      subtotal REAL NOT NULL,
      delivery_charge REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Order items table - stores individual items in each order
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_per_unit REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `);

  console.log('✓ Database initialized successfully');
}

// Helper function to check if order is delivered
export function isOrderDelivered(status) {
  return status === 'delivered';
}

// Seed initial products if table is empty
export function seedProducts() {
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
  
  if (count.count === 0) {
    const products = [
      {
        name: 'Pure Cow Ghee',
        grams: 100,
        liter: 0.1,
        price: 120,
        description: 'Pure cow ghee made from traditional bilona method. Perfect for small families or first-time buyers.',
        image: '/bottle-100g.svg',
        badge: null,
        delivery_charge: 49
      },
      {
        name: 'Pure Cow Ghee',
        grams: 250,
        liter: 0.25,
        price: 300,
        description: 'Handcrafted pure cow ghee with rich aroma. Ideal for daily cooking and traditional recipes.',
        image: '/bottle-250g.svg',
        badge: null,
        delivery_charge: 49
      },
      {
        name: 'Pure Cow Ghee',
        grams: 500,
        liter: 0.5,
        price: 600,
        description: 'Premium quality cow ghee. No preservatives, no chemicals. Traditional goodness in every spoon.',
        image: '/bottle-500g.svg',
        badge: 'Popular',
        delivery_charge: 49
      },
      {
        name: 'Pure Cow Ghee',
        grams: 750,
        liter: 0.75,
        price: 900,
        description: 'Authentic cow ghee prepared using age-old methods. Rich taste and maximum purity guaranteed.',
        image: '/bottle-750g.svg',
        badge: null,
        delivery_charge: 49
      },
      {
        name: 'Pure Cow Ghee',
        grams: 1000,
        liter: 1,
        price: 1200,
        description: 'Best value 1 KG pack! Pure cow ghee with authentic granular texture. Free delivery included.',
        image: '/bottle-1kg.svg',
        badge: 'Free Delivery',
        delivery_charge: 0
      },
      {
        name: 'Premium Cow Ghee Pack',
        grams: 2000,
        liter: 2,
        price: 2400,
        description: 'Premium 2 KG family pack of pure cow ghee. Best value for regular use. Free delivery included.',
        image: '/bottle-2kg.svg',
        badge: 'Premium Pack',
        delivery_charge: 0
      }
    ];

    const insert = db.prepare(`
      INSERT INTO products (name, grams, liter, price, description, image, badge, delivery_charge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((products) => {
      for (const product of products) {
        insert.run(
          product.name,
          product.grams,
          product.liter,
          product.price,
          product.description,
          product.image,
          product.badge,
          product.delivery_charge
        );
      }
    });

    insertMany(products);
    console.log('✓ Products seeded successfully');
  }
}

export default db;

