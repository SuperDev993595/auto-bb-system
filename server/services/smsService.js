const twilio = require('twilio');
const axios = require('axios');

class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio';
    this.config = this.loadConfig();
  }

  loadConfig() {
    switch (this.provider) {
      case 'twilio':
        return {
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
          fromNumber: process.env.TWILIO_FROM_NUMBER
        };
      case 'nexmo':
        return {
          apiKey: process.env.NEXMO_API_KEY,
          apiSecret: process.env.NEXMO_API_SECRET,
          fromNumber: process.env.NEXMO_FROM_NUMBER
        };
      case 'aws-sns':
        return {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1'
        };
      default:
        throw new Error(`Unsupported SMS provider: ${this.provider}`);
    }
  }

  async sendSMS(to, message, options = {}) {
    try {
      switch (this.provider) {
        case 'twilio':
          return await this.sendViaTwilio(to, message, options);
        case 'nexmo':
          return await this.sendViaNexmo(to, message, options);
        case 'aws-sns':
          return await this.sendViaAWSSNS(to, message, options);
        default:
          throw new Error(`Unsupported SMS provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      throw error;
    }
  }

  async sendViaTwilio(to, message, options = {}) {
    if (!this.config.accountSid || !this.config.authToken || !this.config.fromNumber) {
      throw new Error('Twilio configuration incomplete');
    }

    const client = twilio(this.config.accountSid, this.config.authToken);
    
    const result = await client.messages.create({
      body: message,
      from: this.config.fromNumber,
      to: to,
      ...options
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status,
      provider: 'twilio',
      timestamp: new Date()
    };
  }

  async sendViaNexmo(to, message, options = {}) {
    if (!this.config.apiKey || !this.config.apiSecret || !this.config.fromNumber) {
      throw new Error('Nexmo configuration incomplete');
    }

    const url = 'https://rest.nexmo.com/sms/json';
    const params = new URLSearchParams({
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
      to: to,
      from: this.config.fromNumber,
      text: message,
      ...options
    });

    const response = await axios.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.messages && response.data.messages[0].status === '0') {
      return {
        success: true,
        messageId: response.data.messages[0]['message-id'],
        status: 'sent',
        provider: 'nexmo',
        timestamp: new Date()
      };
    } else {
      throw new Error(`Nexmo error: ${response.data.messages[0]['error-text']}`);
    }
  }

  async sendViaAWSSNS(to, message, options = {}) {
    if (!this.config.accessKeyId || !this.config.secretAccessKey) {
      throw new Error('AWS SNS configuration incomplete');
    }

    // This is a simplified implementation
    // In a real application, you would use the AWS SDK
    const url = `https://sns.${this.config.region}.amazonaws.com/`;
    
    // Mock implementation - replace with actual AWS SDK
    console.log(`AWS SNS SMS to ${to}: ${message}`);
    
    return {
      success: true,
      messageId: `aws_${Date.now()}`,
      status: 'sent',
      provider: 'aws-sns',
      timestamp: new Date()
    };
  }

  async sendBulkSMS(recipients, message, options = {}) {
    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendSMS(recipient.phone, message, {
          ...options,
          customData: recipient.customData || {}
        });
        results.push({
          phone: recipient.phone,
          ...result
        });
      } catch (error) {
        errors.push({
          phone: recipient.phone,
          error: error.message
        });
      }
    }

    return {
      success: results.length > 0,
      results,
      errors,
      totalSent: results.length,
      totalErrors: errors.length
    };
  }

  async sendScheduledSMS(to, message, scheduledTime, options = {}) {
    // For scheduled SMS, you would typically:
    // 1. Store the SMS in a queue/database
    // 2. Use a cron job or scheduler to send at the specified time
    // 3. Update the status when sent
    
    const scheduledSMS = {
      to,
      message,
      scheduledTime: new Date(scheduledTime),
      status: 'scheduled',
      provider: this.provider,
      options,
      createdAt: new Date()
    };

    // In a real implementation, save to database
    console.log('Scheduled SMS:', scheduledSMS);

    return {
      success: true,
      scheduledId: `sched_${Date.now()}`,
      scheduledTime: scheduledSMS.scheduledTime,
      status: 'scheduled'
    };
  }

  validatePhoneNumber(phone) {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  formatPhoneNumber(phone) {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      cleaned = '+1' + cleaned; // Default to US
    }
    
    return cleaned;
  }

  async getDeliveryStatus(messageId) {
    // This would check the delivery status with the SMS provider
    // Implementation varies by provider
    
    switch (this.provider) {
      case 'twilio':
        return await this.getTwilioDeliveryStatus(messageId);
      case 'nexmo':
        return await this.getNexmoDeliveryStatus(messageId);
      default:
        return { status: 'unknown', provider: this.provider };
    }
  }

  async getTwilioDeliveryStatus(messageId) {
    if (!this.config.accountSid || !this.config.authToken) {
      throw new Error('Twilio configuration incomplete');
    }

    const client = twilio(this.config.accountSid, this.config.authToken);
    
    try {
      const message = await client.messages(messageId).fetch();
      return {
        status: message.status,
        provider: 'twilio',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get Twilio delivery status: ${error.message}`);
    }
  }

  async getNexmoDeliveryStatus(messageId) {
    // Nexmo delivery status check implementation
    // This would typically involve webhooks or API calls
    return {
      status: 'delivered',
      provider: 'nexmo',
      timestamp: new Date()
    };
  }
}

module.exports = new SMSService();
