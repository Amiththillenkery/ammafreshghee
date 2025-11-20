// Test PostgreSQL connection to Supabase
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = 'postgresql://postgres:Amith@154698738@db.uggqnfwdhbcvqyjssivw.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  console.log('🔌 Testing PostgreSQL connection to Supabase...\n');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully!\n');
    
    // Test query
    const result = await client.query('SELECT NOW() as time, version() as version');
    console.log('📊 Database info:');
    console.log('  Time:', result.rows[0].time);
    console.log('  Version:', result.rows[0].version.split(' ')[0], result.rows[0].version.split(' ')[1]);
    
    // Check existing tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Existing tables:', tables.rows.length > 0 ? '' : 'None');
    tables.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    client.release();
    
    console.log('\n✅ Connection test passed!');
    console.log('\n🚀 Next steps:');
    console.log('  1. Copy backend/.env.example to backend/.env');
    console.log('  2. Update the DATABASE_URL in .env');
    console.log('  3. Run: npm start');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  - Check your DATABASE_URL is correct');
    console.log('  - Verify your Supabase database is active');
    console.log('  - Check your network/firewall settings');
  } finally {
    await pool.end();
    process.exit();
  }
}

testConnection();

