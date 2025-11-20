import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PhonePe Payment Gateway Service
 * Handles payment initialization, callback verification, and status checks
 */
class PhonePeService {
  constructor() {
    // PhonePe Test/Production Configuration
    this.merchantId = process.env.PHONEPE_MERCHANT_ID || 'M23H2V31G7L3S_2511201935';
    this.saltKey = process.env.PHONEPE_SALT_KEY || 'NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0';
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    
    // API URLs
    // Use test URL for development, production URL for live
    this.baseUrl = process.env.PHONEPE_ENV === 'production' 
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    
    // Redirect URLs - Update these with your actual domain
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL || 'http://localhost:5173/payment/callback';
    this.callbackUrl = process.env.PHONEPE_CALLBACK_URL || 'https://ammafreshghee.onrender.com/api/payment/callback';
  }

  /**
   * Generate checksum for PhonePe API request
   * Formula: SHA256(base64(payload) + endpoint + saltKey) + ### + saltIndex
   */
  generateChecksum(payload, endpoint = '/pg/v1/pay') {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const string = base64Payload + endpoint + this.saltKey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    return sha256 + '###' + this.saltIndex;
  }

  /**
   * Verify checksum from PhonePe callback
   */
  verifyChecksum(base64Response, receivedChecksum) {
    const string = base64Response + this.saltKey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const expectedChecksum = sha256 + '###' + this.saltIndex;
    return expectedChecksum === receivedChecksum;
  }

  /**
   * Initialize PhonePe payment
   * @param {Object} orderDetails - Order details including amount, orderId, customer info
   * @returns {Promise} Payment initialization response
   */
  async initiatePayment(orderDetails) {
    try {
      const { orderId, amount, customerPhone, customerName, customerEmail } = orderDetails;
      
      // Generate unique transaction ID
      const merchantTransactionId = `TXN_${orderId}_${Date.now()}`;
      
      // Prepare payment payload
      const payload = {
        merchantId: this.merchantId,
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

      // Generate checksum
      const checksum = this.generateChecksum(payload);
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

      // Make API request to PhonePe
      const response = await fetch(`${this.baseUrl}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        },
        body: JSON.stringify({
          request: base64Payload
        })
      });

      const responseData = await response.json();

      if (responseData.success) {
        return {
          success: true,
          merchantTransactionId,
          paymentUrl: responseData.data.instrumentResponse.redirectInfo.url,
          message: 'Payment initiated successfully'
        };
      } else {
        throw new Error(responseData.message || 'Payment initiation failed');
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
   * Check payment status
   * @param {String} merchantTransactionId - Transaction ID
   * @returns {Promise} Payment status
   */
  async checkPaymentStatus(merchantTransactionId) {
    try {
      const endpoint = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
      
      // Generate checksum for status check
      const string = endpoint + this.saltKey;
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      const checksum = sha256 + '###' + this.saltIndex;

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': this.merchantId
        }
      });

      const responseData = await response.json();

      if (responseData.success) {
        return {
          success: true,
          status: responseData.code,
          message: responseData.message,
          data: responseData.data
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          message: responseData.message || 'Payment failed'
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
   * Handle PhonePe callback
   * @param {Object} callbackData - Callback data from PhonePe
   * @returns {Object} Processed callback result
   */
  async handleCallback(callbackData) {
    try {
      const { response: base64Response, checksum } = callbackData;

      // Verify checksum
      if (!this.verifyChecksum(base64Response, checksum)) {
        return {
          success: false,
          message: 'Invalid checksum',
          verified: false
        };
      }

      // Decode response
      const decodedResponse = JSON.parse(
        Buffer.from(base64Response, 'base64').toString('utf-8')
      );

      return {
        success: true,
        verified: true,
        data: decodedResponse,
        paymentStatus: decodedResponse.code,
        transactionId: decodedResponse.data?.merchantTransactionId
      };
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
   * Test PhonePe configuration
   */
  testConfiguration() {
    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║   💳 PhonePe Payment Configuration  ║');
    console.log('╠═══════════════════════════════════════╣');
    console.log(`║  Environment: ${process.env.PHONEPE_ENV || 'test (sandbox)'}`);
    console.log(`║  Merchant ID: ${this.merchantId}`);
    console.log(`║  Base URL: ${this.baseUrl}`);
    console.log(`║  Redirect URL: ${this.redirectUrl}`);
    console.log(`║  Callback URL: ${this.callbackUrl}`);
    console.log('╚═══════════════════════════════════════╝\n');
  }
}

export const phonePeService = new PhonePeService();

