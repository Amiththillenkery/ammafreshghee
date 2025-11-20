import { StandardCheckoutClient, Env } from 'pg-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PhonePe Payment Gateway Service (Official SDK)
 * Handles payment initialization, callback verification, and status checks
 */
class PhonePeService {
  constructor() {
    // PhonePe SDK Configuration
    // Note: In SDK, merchantId is called clientId
    this.clientId = process.env.PHONEPE_MERCHANT_ID || process.env.PHONEPE_CLIENT_ID || 'M23H2V31G7L3S_2511201935';
    this.clientSecret = process.env.PHONEPE_SALT_KEY || process.env.PHONEPE_CLIENT_SECRET || 'NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0';
    this.clientVersion = parseInt(process.env.PHONEPE_SALT_INDEX || process.env.PHONEPE_CLIENT_VERSION || '1');
    
    // Environment: SANDBOX or PRODUCTION
    const envType = process.env.PHONEPE_ENV === 'production' ? Env.PRODUCTION : Env.SANDBOX;
    
    // Initialize PhonePe SDK Client (singleton)
    try {
      this.client = StandardCheckoutClient.getInstance(
        this.clientId,
        this.clientSecret,
        this.clientVersion,
        envType
      );
      console.log('✓ PhonePe SDK initialized successfully');
    } catch (error) {
      console.error('✗ PhonePe SDK initialization failed:', error.message);
      this.client = null;
    }
    
    // Redirect URLs - Update these with your actual domain
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL || 'http://localhost:5173/payment/callback';
    this.callbackUrl = process.env.PHONEPE_CALLBACK_URL || 'https://ammafreshghee.onrender.com/api/payment/callback';
    this.env = envType;
  }

  /**
   * Initialize PhonePe payment using official SDK
   * @param {Object} orderDetails - Order details including amount, orderId, customer info
   * @returns {Promise} Payment initialization response
   */
  async initiatePayment(orderDetails) {
    try {
      if (!this.client) {
        throw new Error('PhonePe SDK client not initialized. Check your credentials.');
      }

      const { orderId, amount, customerPhone, customerName, customerEmail } = orderDetails;
      
      // Generate unique transaction ID
      const merchantTransactionId = `TXN_${orderId}_${Date.now()}`;
      
      // Create payment request using SDK
      const paymentRequest = {
        merchantTransactionId: merchantTransactionId,
        merchantUserId: `USER_${customerPhone}`,
        amount: amount * 100, // Convert to paise (smallest currency unit)
        redirectUrl: this.redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: this.callbackUrl,
        mobileNumber: customerPhone,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      console.log('Initiating PhonePe payment with SDK:', {
        merchantTransactionId,
        amount: amount * 100,
        redirectUrl: this.redirectUrl
      });

      // Initiate payment using SDK
      const response = await this.client.initiatePayment(paymentRequest);

      console.log('PhonePe SDK Response:', response);

      if (response && response.success && response.data) {
        return {
          success: true,
          merchantTransactionId,
          paymentUrl: response.data.instrumentResponse?.redirectInfo?.url || response.data.redirectUrl,
          message: 'Payment initiated successfully'
        };
      } else {
        throw new Error(response?.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('PhonePe payment initiation error:', error);
      return {
        success: false,
        message: error.message || 'Failed to initiate payment',
        error: error
      };
    }
  }

  /**
   * Check payment status using official SDK
   * @param {String} merchantTransactionId - Transaction ID
   * @returns {Promise} Payment status
   */
  async checkPaymentStatus(merchantTransactionId) {
    try {
      if (!this.client) {
        throw new Error('PhonePe SDK client not initialized');
      }

      console.log('Checking payment status for:', merchantTransactionId);

      // Check status using SDK
      const response = await this.client.checkOrderStatus(merchantTransactionId);

      console.log('PhonePe Status Response:', response);

      if (response && response.success) {
        return {
          success: true,
          status: response.code,
          message: response.message,
          data: response.data
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          message: response?.message || 'Payment failed'
        };
      }
    } catch (error) {
      console.error('PhonePe status check error:', error);
      return {
        success: false,
        status: 'ERROR',
        message: error.message || 'Failed to check payment status',
        error: error
      };
    }
  }

  /**
   * Handle PhonePe callback using official SDK
   * @param {Object} callbackData - Callback data from PhonePe
   * @returns {Object} Processed callback result
   */
  async handleCallback(callbackData) {
    try {
      if (!this.client) {
        throw new Error('PhonePe SDK client not initialized');
      }

      const { response: base64Response, checksum } = callbackData;

      console.log('Handling PhonePe callback...');

      // Verify and decode webhook using SDK
      const webhookResponse = await this.client.verifyWebhook(base64Response, checksum);

      if (webhookResponse && webhookResponse.verified) {
        const decodedData = webhookResponse.data;
        
        return {
          success: true,
          verified: true,
          data: decodedData,
          paymentStatus: decodedData.code,
          transactionId: decodedData.data?.merchantTransactionId
        };
      } else {
        return {
          success: false,
          message: 'Invalid webhook signature',
          verified: false
        };
      }
    } catch (error) {
      console.error('PhonePe callback handling error:', error);
      return {
        success: false,
        message: error.message || 'Failed to process callback',
        verified: false
      };
    }
  }

  /**
   * Test PhonePe SDK configuration
   */
  testConfiguration() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   💳 PhonePe SDK Configuration          ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  SDK Status: ${this.client ? '✓ Initialized' : '✗ Failed'}`);
    console.log(`║  Environment: ${this.env === Env.PRODUCTION ? 'PRODUCTION' : 'SANDBOX'}`);
    console.log(`║  Client ID (Merchant): ${this.clientId}`);
    console.log(`║  Client Version: ${this.clientVersion}`);
    console.log(`║  Redirect URL: ${this.redirectUrl}`);
    console.log(`║  Callback URL: ${this.callbackUrl}`);
    console.log('╚════════════════════════════════════════════╝\n');
    
    if (!this.client) {
      console.error('⚠️  PhonePe SDK initialization failed. Check your credentials!');
    }
  }
}

export const phonePeService = new PhonePeService();

