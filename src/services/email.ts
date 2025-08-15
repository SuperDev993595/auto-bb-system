import api from './api';

// Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables?: string[];
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  scheduledAt?: string;
  createdAt: string;
  sentAt?: string;
}

export interface EmailData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  content: string;
  template?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface EmailAnalytics {
  overview: {
    totalEmails: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  metrics: {
    openRate: number;
    clickRate: number;
    bounceRate: number;
    unsubscribeRate: number;
  };
}

// Email Service Class
class EmailService {
  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const response = await api.get('/email/templates');
    return response.data.data;
  }

  async createEmailTemplate(templateData: any): Promise<EmailTemplate> {
    const response = await api.post('/email/templates', templateData);
    return response.data.data;
  }

  async updateEmailTemplate(id: string, templateData: any): Promise<EmailTemplate> {
    const response = await api.put(`/email/templates/${id}`, templateData);
    return response.data.data;
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    await api.delete(`/email/templates/${id}`);
  }

  // Email Campaigns
  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    const response = await api.get('/email/campaigns');
    return response.data.data;
  }

  async createEmailCampaign(campaignData: any): Promise<EmailCampaign> {
    const response = await api.post('/email/campaigns', campaignData);
    return response.data.data;
  }

  async sendEmailCampaign(id: string): Promise<EmailCampaign> {
    const response = await api.post(`/email/campaigns/${id}/send`);
    return response.data.data;
  }

  // Send Email
  async sendEmail(emailData: EmailData): Promise<any> {
    const response = await api.post('/email/send', emailData);
    return response.data.data;
  }

  // Email Analytics
  async getEmailAnalytics(): Promise<EmailAnalytics> {
    const response = await api.get('/email/analytics');
    return response.data.data;
  }
}

export default new EmailService();
