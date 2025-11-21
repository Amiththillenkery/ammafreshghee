import db from './database.js';

/**
 * Keep-Alive Service
 * Updates database every 3 minutes to prevent free-tier sleep
 * Counter resets to 1 when it reaches 100
 */
class KeepAliveService {
  constructor() {
    this.interval = null;
    this.updateFrequency = 3 * 60 * 1000; // 3 minutes in milliseconds
    this.maxCount = 100;
  }

  /**
   * Start the keep-alive service
   */
  start() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🔄 Keep-Alive Service Started      ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  Update Frequency: Every 3 minutes    ║`);
    console.log(`║  Max Count: ${this.maxCount}                      ║`);
    console.log(`║  Purpose: Prevent DB/Server sleep     ║`);
    console.log('╚════════════════════════════════════════╝\n');

    // Run immediately on start
    this.updateCounter();

    // Then run every 3 minutes
    this.interval = setInterval(() => {
      this.updateCounter();
    }, this.updateFrequency);
  }

  /**
   * Update the counter in database
   */
  async updateCounter() {
    try {
      // Get current count
      const result = await db.get('SELECT count, last_updated FROM keep_alive WHERE id = 1');
      
      if (!result) {
        // If no record exists, create one
        await db.query('INSERT INTO keep_alive (count) VALUES (1)');
        console.log('⏰ Keep-alive: Counter initialized to 1');
        return;
      }

      let currentCount = parseInt(result.count);
      let newCount = currentCount + 1;

      // Reset to 1 if reached max
      if (newCount > this.maxCount) {
        newCount = 1;
      }

      // Update the counter
      await db.query(
        'UPDATE keep_alive SET count = $1, last_updated = CURRENT_TIMESTAMP WHERE id = 1',
        [newCount]
      );

      const action = newCount === 1 ? 'RESET' : 'updated';
      console.log(`⏰ Keep-alive: Counter ${action} to ${newCount}/${this.maxCount} at ${new Date().toLocaleTimeString()}`);

    } catch (error) {
      console.error('❌ Keep-alive update failed:', error.message);
      // Don't throw - we don't want to crash the server if keep-alive fails
    }
  }

  /**
   * Stop the keep-alive service
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('🛑 Keep-alive service stopped');
    }
  }

  /**
   * Get current keep-alive status
   */
  async getStatus() {
    try {
      const result = await db.get('SELECT count, last_updated FROM keep_alive WHERE id = 1');
      
      if (!result) {
        return {
          active: false,
          message: 'Keep-alive not initialized'
        };
      }

      const lastUpdate = new Date(result.last_updated);
      const now = new Date();
      const minutesSinceUpdate = Math.floor((now - lastUpdate) / 60000);

      return {
        active: true,
        count: parseInt(result.count),
        maxCount: this.maxCount,
        lastUpdated: lastUpdate.toISOString(),
        minutesSinceUpdate,
        nextUpdateIn: Math.max(0, 3 - minutesSinceUpdate),
        isHealthy: minutesSinceUpdate < 5 // Considered healthy if updated in last 5 minutes
      };
    } catch (error) {
      return {
        active: false,
        error: error.message
      };
    }
  }
}

// Create and export singleton instance
export const keepAliveService = new KeepAliveService();

