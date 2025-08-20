const SMS = require('../models/SMS');
const SMSTemplate = require('../models/SMSTemplate');

class SMSService {
  constructor() {
    this.provider = 'mock'; // Can be changed to 'twilio', 'aws-sns', etc.
  }

  // Send single SMS
  async sendSMS(smsData, userId) {
    try {
      const sms = new SMS({
        ...smsData,
        createdBy: userId,
        provider: this.provider
      });

      await sms.save();

      // Simulate SMS sending with mock provider
      const result = await this.sendViaProvider(sms);
      
      // Update SMS status based on provider response
      await sms.updateStatus(result.status, {
        providerMessageId: result.messageId,
        errorMessage: result.error,
        cost: result.cost
      });

      return {
        success: true,
        data: sms,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      throw error;
    }
  }

  // Send bulk SMS
  async sendBulkSMS(recipients, message, options = {}, userId) {
    try {
      const smsPromises = recipients.map(recipient => {
        const smsData = {
          to: recipient.phone || recipient,
          message,
          priority: options.priority || 'normal',
          scheduledAt: options.scheduledAt || null
        };
        return this.sendSMS(smsData, userId);
      });

      const results = await Promise.allSettled(smsPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: true,
        data: {
          total: recipients.length,
          successful,
          failed,
          results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
        }
      };
    } catch (error) {
      console.error('Bulk SMS sending error:', error);
      throw error;
    }
  }

  // Mock SMS provider (replace with real provider)
  async sendViaProvider(sms) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate different outcomes
    const random = Math.random();
    
    if (random < 0.8) {
      // 80% success rate
      return {
        status: 'delivered',
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cost: 0.05,
        error: null
      };
    } else if (random < 0.9) {
      // 10% sent but not delivered
      return {
        status: 'sent',
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cost: 0.05,
        error: null
      };
    } else {
      // 10% failed
      const errors = [
        'Invalid phone number',
        'Number not reachable',
        'Insufficient credits',
        'Service temporarily unavailable'
      ];
      return {
        status: 'failed',
        messageId: null,
        cost: 0,
        error: errors[Math.floor(Math.random() * errors.length)]
      };
    }
  }

  // Get SMS statistics
  async getStats() {
    try {
      const [stats, deliveryRate] = await Promise.all([
        SMS.getStats(),
        SMS.getDeliveryRate()
      ]);

      const statsData = stats[0] || {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        pending: 0,
        totalCost: 0
      };

      const rateData = deliveryRate[0] || { deliveryRate: 0 };

      return {
        totalSent: statsData.totalSent,
        delivered: statsData.delivered,
        failed: statsData.failed,
        pending: statsData.pending,
        deliveryRate: rateData.deliveryRate || 0,
        totalCost: statsData.totalCost
      };
    } catch (error) {
      console.error('Error getting SMS stats:', error);
      throw error;
    }
  }

  // Get SMS history
  async getHistory(filters = {}, page = 1, limit = 20) {
    try {
      const query = { isActive: true };
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.to) {
        query.to = { $regex: filters.to, $options: 'i' };
      }

      const skip = (page - 1) * limit;
      
      const [smsRecords, total] = await Promise.all([
        SMS.find(query)
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        SMS.countDocuments(query)
      ]);

      return {
        data: smsRecords,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error getting SMS history:', error);
      throw error;
    }
  }

  // Template management
  async createTemplate(templateData, userId) {
    try {
      const template = new SMSTemplate({
        ...templateData,
        createdBy: userId
      });
      
      await template.save();
      return template;
    } catch (error) {
      console.error('Error creating SMS template:', error);
      throw error;
    }
  }

  async getTemplates(filters = {}) {
    try {
      const query = { isActive: true };
      
      if (filters.category) {
        query.category = filters.category;
      }

      const templates = await SMSTemplate.find(query)
        .populate('createdBy', 'name email')
        .sort({ usageCount: -1, name: 1 });

      return templates;
    } catch (error) {
      console.error('Error getting SMS templates:', error);
      throw error;
    }
  }

  async useTemplate(templateId, variables = {}) {
    try {
      const template = await SMSTemplate.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const message = template.renderMessage(variables);
      await template.incrementUsage();

      return {
        message,
        template: {
          id: template._id,
          name: template.name,
          category: template.category
        }
      };
    } catch (error) {
      console.error('Error using SMS template:', error);
      throw error;
    }
  }
}

module.exports = new SMSService();
