import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const NOTIFICATION_METHOD = process.env.NOTIFICATION_METHOD || 'none'; // 'whatsapp', 'email', 'both', 'none'

/**
 * Notification Service to send order confirmations via WhatsApp and Email
 */

class NotificationService {
  constructor() {
    this.method = NOTIFICATION_METHOD;
    this.businessName = process.env.BUSINESS_NAME || 'Amma Fresh';
    this.businessPhone = process.env.BUSINESS_PHONE || '';
    this.emailTransporter = null;
    
    // Initialize email transporter if email is enabled
    if (this.method === 'email' || this.method === 'both') {
      this.initializeEmail();
    }
  }

  /**
   * Initialize email transporter (using Gmail or custom SMTP)
   */
  initializeEmail() {
    try {
      const emailConfig = {
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
        }
      };

      // If using custom SMTP
      if (process.env.SMTP_HOST) {
        emailConfig.host = process.env.SMTP_HOST;
        emailConfig.port = process.env.SMTP_PORT || 587;
        emailConfig.secure = process.env.SMTP_SECURE === 'true';
        delete emailConfig.service;
      }

      this.emailTransporter = nodemailer.createTransport(emailConfig);
      console.log('✅ Email transporter initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email:', error.message);
    }
  }

  /**
   * Send order confirmation notification
   * @param {Object} orderData - Order details
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async sendOrderConfirmation(orderData) {
    const { customerName, customerPhone, customerEmail, orderNumber, totalAmount, items } = orderData;

    try {
      if (this.method === 'none') {
        console.log('📱 Notifications disabled');
        console.log(`Order ${orderNumber} - Customer: ${customerName}, Amount: ₹${totalAmount}`);
        return { success: true, message: 'Notifications disabled' };
      }

      const results = {};

      // Send WhatsApp notification
      if (this.method === 'whatsapp' || this.method === 'both') {
        results.whatsapp = await this.sendWhatsAppNotification(
          customerPhone,
          customerName,
          orderNumber,
          totalAmount,
          items
        );
      }

      // Send Email notification
      if (this.method === 'email' || this.method === 'both') {
        if (customerEmail) {
          results.email = await this.sendEmailNotification(
            customerEmail,
            customerName,
            orderNumber,
            totalAmount,
            items
          );
        } else {
          results.email = { success: false, message: 'No email provided' };
        }
      }

      return {
        success: true,
        message: 'Notification sent',
        details: results
      };

    } catch (error) {
      console.error('❌ Notification failed:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Send WhatsApp notification using WhatsApp Business API or direct link
   */
  async sendWhatsAppNotification(phoneNumber, customerName, orderNumber, totalAmount, items) {
    try {
      const message = this.createWhatsAppMessage(customerName, orderNumber, totalAmount, items);
      
      // Format phone number for WhatsApp (remove spaces, add country code if needed)
      const formattedPhone = this.formatPhoneForWhatsApp(phoneNumber);

      const provider = process.env.WHATSAPP_PROVIDER || 'link';

      switch (provider.toLowerCase()) {
        case 'callmebot':
          return await this.sendViaCallMeBot(formattedPhone, message);
        
        case 'wati':
          return await this.sendViaWATI(formattedPhone, message);
        
        case 'interakt':
          return await this.sendViaInterakt(formattedPhone, message);
        
        case 'twilio':
          return await this.sendViaTwilioWhatsApp(formattedPhone, message);
        
        case 'link':
        default:
          // Generate WhatsApp Web link (fallback - requires manual click)
          const whatsappLink = this.generateWhatsAppLink(formattedPhone, message);
          console.log('\n📱 ============================================');
          console.log('📱 WHATSAPP MESSAGE READY');
          console.log('📱 ============================================');
          console.log('Customer:', customerName);
          console.log('Phone:', phoneNumber);
          console.log('Order:', orderNumber);
          console.log('\n🔗 Click this link to send WhatsApp message:');
          console.log(whatsappLink);
          console.log('📱 ============================================\n');
          
          return {
            success: true,
            message: 'WhatsApp link generated (manual send required)',
            link: whatsappLink,
            method: 'link'
          };
      }

    } catch (error) {
      console.error('❌ WhatsApp notification failed:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Send via CallMeBot (FREE - Easy setup)
   * Setup: https://www.callmebot.com/blog/free-api-whatsapp-messages/
   */
  async sendViaCallMeBot(phoneNumber, message) {
    const apiKey = process.env.CALLMEBOT_API_KEY;
    const myPhone = process.env.CALLMEBOT_PHONE;

    if (!apiKey || !myPhone) {
      throw new Error('CallMeBot not configured. Set CALLMEBOT_API_KEY and CALLMEBOT_PHONE in .env');
    }

    // CallMeBot API endpoint
    const url = `https://api.callmebot.com/whatsapp.php`;
    
    const params = new URLSearchParams({
      phone: myPhone, // Your phone number (where you'll receive and forward messages)
      text: `[ORDER NOTIFICATION]\n\nCustomer: ${phoneNumber}\n\n${message}`,
      apikey: apiKey
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET'
    });

    const text = await response.text();

    if (response.ok) {
      console.log('✅ WhatsApp notification sent via CallMeBot');
      console.log('⚠️  Note: Message sent to your number. Forward it to customer:', phoneNumber);
      return {
        success: true,
        message: 'WhatsApp sent via CallMeBot (check your phone)',
        method: 'callmebot',
        note: 'Message sent to your phone for forwarding'
      };
    } else {
      throw new Error(`CallMeBot failed: ${text}`);
    }
  }

  /**
   * Send via WATI (Professional WhatsApp Business API)
   */
  async sendViaWATI(phoneNumber, message) {
    const apiUrl = process.env.WATI_API_URL;
    const apiKey = process.env.WATI_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error('WATI not configured. Set WATI_API_URL and WATI_API_KEY in .env');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        whatsappNumber: phoneNumber,
        text: message
      })
    });

    const data = await response.json();

    if (response.ok && data.result) {
      console.log('✅ WhatsApp message sent via WATI to:', phoneNumber);
      return {
        success: true,
        message: 'WhatsApp sent via WATI',
        method: 'wati'
      };
    } else {
      throw new Error(data.message || 'WATI API failed');
    }
  }

  /**
   * Send via Interakt (Professional WhatsApp Business API)
   */
  async sendViaInterakt(phoneNumber, message) {
    const apiKey = process.env.INTERAKT_API_KEY;

    if (!apiKey) {
      throw new Error('Interakt not configured. Set INTERAKT_API_KEY in .env');
    }

    const response = await fetch('https://api.interakt.ai/v1/public/message/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        countryCode: '+91',
        phoneNumber: phoneNumber.replace(/^91/, ''),
        type: 'Text',
        data: {
          message: message
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ WhatsApp message sent via Interakt to:', phoneNumber);
      return {
        success: true,
        message: 'WhatsApp sent via Interakt',
        method: 'interakt'
      };
    } else {
      throw new Error(data.message || 'Interakt API failed');
    }
  }

  /**
   * Send via Twilio WhatsApp API
   */
  async sendViaTwilioWhatsApp(phoneNumber, message) {
    // Note: Requires twilio npm package and approved WhatsApp Business account
    throw new Error('Twilio WhatsApp requires twilio package: npm install twilio');
  }

  /**
   * Generate WhatsApp Web link
   */
  generateWhatsAppLink(phoneNumber, message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  }

  /**
   * Format phone number for WhatsApp (needs country code)
   */
  formatPhoneForWhatsApp(phone) {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add 91 (India) if not present and length is 10
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Create WhatsApp message text
   */
  createWhatsAppMessage(customerName, orderNumber, totalAmount, items) {
    let message = `🎉 *${this.businessName} Order Confirmed!*\n\n`;
    message += `Hello ${customerName},\n\n`;
    message += `Your order has been confirmed! 🧈\n\n`;
    message += `*Order Details:*\n`;
    message += `Order ID: ${orderNumber}\n`;
    message += `Total Amount: ₹${totalAmount}\n\n`;
    
    if (items && items.length > 0) {
      message += `*Items Ordered:*\n`;
      items.forEach(item => {
        message += `• ${item.productName} x ${item.quantity} - ₹${item.totalPrice}\n`;
      });
      message += `\n`;
    }
    
    message += `Thank you for your order! We'll deliver fresh homemade ghee to your doorstep. 🏠\n\n`;
    message += `Track your order with ID: ${orderNumber}\n\n`;
    
    if (this.businessPhone) {
      message += `For any queries, call: ${this.businessPhone}\n`;
    }
    
    message += `\n✨ ${this.businessName} - Pure & Fresh Homemade Ghee`;
    
    return message;
  }

  /**
   * Send Email notification
   */
  async sendEmailNotification(email, customerName, orderNumber, totalAmount, items) {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email transporter not initialized');
      }

      const htmlContent = this.createEmailHTML(customerName, orderNumber, totalAmount, items);
      const textContent = this.createEmailText(customerName, orderNumber, totalAmount, items);

      const mailOptions = {
        from: `"${this.businessName}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order Confirmed - ${orderNumber} | ${this.businessName}`,
        text: textContent,
        html: htmlContent
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully to:', email);
      console.log('Message ID:', info.messageId);

      return {
        success: true,
        message: 'Email sent successfully',
        messageId: info.messageId
      };

    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Create email HTML content
   */
  createEmailHTML(customerName, orderNumber, totalAmount, items) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
    .order-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .order-id { font-size: 24px; font-weight: bold; color: #d97706; }
    .items { margin: 20px 0; }
    .item { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .total { font-size: 20px; font-weight: bold; color: #059669; margin-top: 20px; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
    .button { background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧈 ${this.businessName}</h1>
      <p>Order Confirmation</p>
    </div>
    
    <div class="content">
      <h2>Hello ${customerName},</h2>
      <p>Thank you for your order! We're excited to deliver fresh, homemade ghee to your doorstep.</p>
      
      <div class="order-box">
        <div class="order-id">Order ID: ${orderNumber}</div>
        <p style="margin: 5px 0; color: #059669;">✅ Order Confirmed</p>
      </div>
      
      ${items && items.length > 0 ? `
      <div class="items">
        <h3>Order Items:</h3>
        ${items.map(item => `
          <div class="item">
            <strong>${item.productName}</strong><br>
            Quantity: ${item.quantity} × ₹${item.pricePerUnit} = ₹${item.totalPrice}
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      <div class="total">
        Total Amount: ₹${totalAmount}
      </div>
      
      <p>We'll process your order and deliver it soon. You can track your order using the Order ID: <strong>${orderNumber}</strong></p>
      
      ${this.businessPhone ? `
      <p>For any queries, feel free to call us at: <strong>${this.businessPhone}</strong></p>
      ` : ''}
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0; color: #6b7280;">Pure & Fresh Homemade Ghee</p>
      <p style="margin: 5px 0; color: #6b7280;">Thank you for choosing ${this.businessName}! ✨</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Create email plain text content
   */
  createEmailText(customerName, orderNumber, totalAmount, items) {
    let text = `${this.businessName} - Order Confirmation\n\n`;
    text += `Hello ${customerName},\n\n`;
    text += `Thank you for your order! We're excited to deliver fresh, homemade ghee to your doorstep.\n\n`;
    text += `Order ID: ${orderNumber}\n`;
    text += `Status: Order Confirmed ✅\n\n`;
    
    if (items && items.length > 0) {
      text += `Order Items:\n`;
      items.forEach(item => {
        text += `• ${item.productName} - Qty: ${item.quantity} × ₹${item.pricePerUnit} = ₹${item.totalPrice}\n`;
      });
      text += `\n`;
    }
    
    text += `Total Amount: ₹${totalAmount}\n\n`;
    text += `We'll process your order and deliver it soon.\n\n`;
    
    if (this.businessPhone) {
      text += `For any queries, call: ${this.businessPhone}\n\n`;
    }
    
    text += `Thank you for choosing ${this.businessName}!\n`;
    text += `Pure & Fresh Homemade Ghee ✨`;
    
    return text;
  }

  /**
   * Test notification configuration
   */
  async testConfiguration() {
    console.log('\n📧 Notification Configuration Test');
    console.log('===================================');
    console.log('Method:', this.method);
    console.log('Business Name:', this.businessName);
    console.log('Business Phone:', this.businessPhone);
    
    if (this.method === 'none') {
      console.log('⚠️  Notifications disabled. Set NOTIFICATION_METHOD in .env');
      return false;
    }

    if (this.method === 'email' || this.method === 'both') {
      console.log('\n📧 Email Configuration:');
      console.log('Email User:', process.env.EMAIL_USER ? '✅ Configured' : '❌ Missing');
      console.log('Email Password:', process.env.EMAIL_PASSWORD ? '✅ Configured' : '❌ Missing');
    }

    if (this.method === 'whatsapp' || this.method === 'both') {
      console.log('\n📱 WhatsApp Configuration:');
      const provider = process.env.WHATSAPP_PROVIDER || 'link';
      console.log('Provider:', provider);
      
      switch (provider.toLowerCase()) {
        case 'callmebot':
          console.log('CallMeBot API Key:', process.env.CALLMEBOT_API_KEY ? '✅ Configured' : '❌ Missing');
          console.log('CallMeBot Phone:', process.env.CALLMEBOT_PHONE ? '✅ Configured' : '❌ Missing');
          break;
        case 'wati':
          console.log('WATI API URL:', process.env.WATI_API_URL ? '✅ Configured' : '❌ Missing');
          console.log('WATI API Key:', process.env.WATI_API_KEY ? '✅ Configured' : '❌ Missing');
          break;
        case 'interakt':
          console.log('Interakt API Key:', process.env.INTERAKT_API_KEY ? '✅ Configured' : '❌ Missing');
          break;
        case 'link':
          console.log('Mode:', '⚠️  Link mode - messages require manual sending');
          break;
      }
    }

    console.log('');
    return true;
  }
}

export const notificationService = new NotificationService();

