import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Prefer IPv4 to avoid network issues
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        grams INTEGER NOT NULL,
        liter DECIMAL(10, 2) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        image VARCHAR(500) NOT NULL,
        badge VARCHAR(100),
        delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 49,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(255),
        delivery_address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        landmark VARCHAR(255),
        subtotal DECIMAL(10, 2) NOT NULL,
        delivery_charge DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price_per_unit DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)
    `);

    // Create trigger function for updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create triggers
    await client.query(`
      DROP TRIGGER IF EXISTS update_products_updated_at ON products
    `);
    await client.query(`
      CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_orders_updated_at ON orders
    `);
    await client.query(`
      CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✓ Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Seed initial products if table is empty
export async function seedProducts() {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT COUNT(*) as count FROM products');
    const count = parseInt(result.rows[0].count);
    
    if (count === 0) {
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

      for (const product of products) {
        await client.query(
          `INSERT INTO products (name, grams, liter, price, description, image, badge, delivery_charge)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            product.name,
            product.grams,
            product.liter,
            product.price,
            product.description,
            product.image,
            product.badge,
            product.delivery_charge
          ]
        );
      }

      console.log('✓ Products seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Helper function to check if order is delivered
export function isOrderDelivered(status) {
  return status === 'delivered';
}

// Query helper functions
export const db = {
  // Execute a query
  async query(text, params) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  },

  // Get single row
  async get(text, params) {
    const result = await this.query(text, params);
    return result.rows[0];
  },

  // Get all rows
  async all(text, params) {
    const result = await this.query(text, params);
    return result.rows;
  },

  // Execute statement (insert, update, delete)
  async run(text, params) {
    const result = await this.query(text, params);
    return {
      lastInsertId: result.rows[0]?.id,
      changes: result.rowCount
    };
  }
};

export default db;

