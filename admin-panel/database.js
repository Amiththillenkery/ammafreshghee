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
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  console.error('Error details:', err.message);
});

// Database helper functions
export const db = {
  // Execute a query
  async query(text, params) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Query error:', error.message);
      console.error('Query:', text);
      console.error('Params:', params);
      throw error;
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

  // Test connection
  async testConnection() {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      console.log('✓ Database connection test successful');
      console.log('  Server time:', result.rows[0].current_time);
      return true;
    } catch (error) {
      console.error('✗ Database connection test failed');
      console.error('  Error:', error.message);
      return false;
    }
  }
};

export default db;

