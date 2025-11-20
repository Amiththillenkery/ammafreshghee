// Frontend Keep-Alive Service
// Pings backend every 2 minutes to prevent it from sleeping

const BACKEND_URL = 'https://ammafreshghee.onrender.com';
const PING_INTERVAL = 2 * 60 * 1000; // 2 minutes

let pingInterval: number | null = null;

async function pingHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    if (response.ok) {
      console.log(`✅ Backend keep-alive ping successful at ${new Date().toLocaleTimeString()}`);
    } else {
      console.warn(`⚠️  Backend ping returned status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Backend keep-alive ping failed:', error);
  }
}

export function startKeepAlive() {
  // Don't start if already running
  if (pingInterval !== null) {
    return;
  }

  console.log('🔄 Starting backend keep-alive service (ping every 2 minutes)');
  
  // Ping immediately
  pingHealth();
  
  // Then ping every 2 minutes
  pingInterval = window.setInterval(pingHealth, PING_INTERVAL);
}

export function stopKeepAlive() {
  if (pingInterval !== null) {
    console.log('⏹️  Stopping backend keep-alive service');
    window.clearInterval(pingInterval);
    pingInterval = null;
  }
}

