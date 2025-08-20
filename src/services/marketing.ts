import api, { apiResponse } from './api';

export interface MarketingCampaign {
  _id: string;
  name: string;
  type: 'email' | 'sms' | 'mailchimp';
  status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'paused';
  subject?: string;
  content: string;
  recipients: string[];
  recipientCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateCampaignData {
  name: string;
  type: 'email' | 'sms' | 'mailchimp';
  subject?: string;
  content: string;
  recipients?: string[];
}

export interface MarketingStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRecipients: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
}

export const marketingService = {
  async getCampaigns(filters: any = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiResponse(api.get(`/marketing/campaigns?${params.toString()}`));
    return response;
  },

  async createCampaign(campaignData: CreateCampaignData) {
    const response = await apiResponse(api.post('/marketing/campaigns', campaignData));
    return response;
  },

  async deleteCampaign(id: string) {
    const response = await apiResponse(api.delete(`/marketing/campaigns/${id}`));
    return response;
  },

  async updateCampaignStatus(id: string, status: MarketingCampaign['status']) {
    const response = await apiResponse(api.put(`/marketing/campaigns/${id}/status`, { status }));
    return response;
  },

  async getCampaignStats() {
    const response = await apiResponse(api.get('/marketing/campaigns/stats/overview'));
    return response;
  }
};
