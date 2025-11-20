import fetch from 'node-fetch';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ammafreshghee.onrender.com';
const PING_INTERVAL = 2 * 60 * 1000; // 2 minutes in milliseconds

console.log(`
╔════════════════════════════════════════╗
║   🔄 Keep-Alive Service Started       ║
╠════════════════════════════════════════╣
║  Backend: ${BACKEND_URL}
║  Interval: Every 2 minutes
║  Purpose: Keep server awake on Render
╚════════════════════════════════════════╝
`);

async function pingHealth() {
  try {
    const startTime = Date.now();
    const response = await fetch(`${BACKEND_URL}/api/health`);
    const data = await response.json();
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      console.log(`✅ [${new Date().toLocaleTimeString()}] Health check OK - ${responseTime}ms - Status: ${data.status}`);
    } else {
      console.log(`⚠️  [${new Date().toLocaleTimeString()}] Health check failed - ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ [${new Date().toLocaleTimeString()}] Health check error:`, error.message);
  }
}

// Ping immediately on start
pingHealth();

// Then ping every 2 minutes
setInterval(pingHealth, PING_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Keep-Alive service stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Keep-Alive service stopped');
  process.exit(0);
});

