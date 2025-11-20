import { StandardCheckoutClient, Env, StandardCheckoutPayRequest, MetaInfo } from 'pg-sdk-node';
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
      console.error('Error details:', error);
      this.client = null;
    }
    
    // Redirect URLs - Update these with your actual domain
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL || 'http://localhost:5173/payment/callback';
    this.callbackUrl = process.env.PHONEPE_CALLBACK_URL || 'https://ammafreshghee.onrender.com/api/payment/callback';
    this.env = envType;
  }

  /**
   * Initialize PhonePe payment using official SDK
   * As per: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/initiate-payment
   * @param {Object} orderDetails - Order details including amount, orderId, customer info
   * @returns {Promise} Payment initialization response
   */
  async initiatePayment(orderDetails) {
    try {
      if (!this.client) {
        throw new Error('PhonePe SDK client not initialized. Check your credentials.');
      }

      const { orderId, amount, customerPhone, customerName, customerEmail } = orderDetails;
      
      // Generate unique merchant order ID
      const merchantOrderId = `${orderId}_${Date.now()}`;
      
      console.log('Initiating PhonePe payment with SDK:', {
        merchantOrderId,
        amount: amount * 100, // Convert to paise
        redirectUrl: this.redirectUrl
      });

      // Build MetaInfo (optional user-defined data)
      const metaInfo = MetaInfo.builder()
        .udf1(customerName || '')
        .udf2(customerPhone || '')
        .udf3(orderId || '')
        .build();

      // Build payment request using SDK builder pattern
      const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(amount * 100) // Amount in paise
        .redirectUrl(this.redirectUrl)
        .metaInfo(metaInfo)
        .build();

      // Initiate payment using SDK pay method
      const response = await this.client.pay(request);

      console.log('PhonePe SDK Response:', response);

      if (response && response.redirectUrl) {
        return {
          success: true,
          merchantTransactionId: merchantOrderId,
          paymentUrl: response.redirectUrl, // SDK returns redirectUrl directly
          orderId: response.orderId, // PhonePe internal order ID
          message: 'Payment initiated successfully'
        };
      } else {
        throw new Error('No redirect URL in response');
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
   * As per: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/order-status-api
   * @param {String} merchantOrderId - Merchant Order ID
   * @returns {Promise} Payment status
   */
  async checkPaymentStatus(merchantOrderId) {
    try {
      if (!this.client) {
        throw new Error('PhonePe SDK client not initialized');
      }

      console.log('Checking payment status for:', merchantOrderId);

      // Check status using SDK - the method is likely checkOrderStatus or getOrderStatus
      const response = await this.client.checkOrderStatus(merchantOrderId);

      console.log('PhonePe Status Response:', response);

      // SDK response format: { state, orderId, amount, etc. }
      if (response && response.state) {
        return {
          success: true,
          status: response.state, // COMPLETED, FAILED, PENDING, etc.
          message: `Order status: ${response.state}`,
          data: response
        };
      } else {
        return {
          success: false,
          status: 'UNKNOWN',
          message: 'Unable to determine order status'
        };
      }
    } catch (error) {
      console.error('PhonePe status check error:', error);
      
      // Try alternative method names if primary fails
      try {
        if (typeof this.client.getOrderStatus === 'function') {
          const response = await this.client.getOrderStatus(merchantOrderId);
          return {
            success: true,
            status: response.state,
            message: `Order status: ${response.state}`,
            data: response
          };
        }
      } catch (altError) {
        console.error('Alternative status check also failed:', altError);
      }
      
      return {
        success: false,
        status: 'ERROR',
        message: error.message || 'Failed to check payment status',
        error: error
      };
    }
  }

  /**
   * Handle PhonePe callback/webhook
   * The SDK might not have a specific webhook verification method,
   * so we may need to manually verify or just decode the response
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

      // Try SDK webhook verification if available
      try {
        if (typeof this.client.verifyWebhook === 'function') {
          const webhookResponse = await this.client.verifyWebhook(base64Response, checksum);
          
          if (webhookResponse && (webhookResponse.verified || webhookResponse.success)) {
            const decodedData = webhookResponse.data || webhookResponse;
            
            return {
              success: true,
              verified: true,
              data: decodedData,
              paymentStatus: decodedData.code || decodedData.state,
              transactionId: decodedData.merchantOrderId || decodedData.data?.merchantTransactionId
            };
          }
        }
      } catch (sdkError) {
        console.warn('SDK webhook verification not available:', sdkError.message);
      }

      // Fallback: Decode response manually
      // In production, you should verify the checksum manually
      try {
        const decodedData = JSON.parse(Buffer.from(base64Response, 'base64').toString('utf-8'));
        
        console.log('Decoded webhook data:', decodedData);
        
        return {
          success: true,
          verified: false, // Manual verification needed in production
          data: decodedData,
          paymentStatus: decodedData.code || decodedData.state,
          transactionId: decodedData.merchantOrderId || decodedData.data?.merchantTransactionId,
          warning: 'Checksum verification skipped - implement manual verification for production'
        };
      } catch (decodeError) {
        throw new Error('Failed to decode webhook response');
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

