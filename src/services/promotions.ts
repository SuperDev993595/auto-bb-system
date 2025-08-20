import api, { apiResponse } from './api';

export interface Promotion {
  _id: string;
  title: string;
  description: string;
  type: 'discount' | 'service' | 'referral' | 'seasonal';
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'ended' | 'paused';
  targetAudience: string;
  usageCount: number;
  maxUsage?: number;
  conditions?: string;
  createdBy: string | { _id: string; name: string; email: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionData {
  title: string;
  description: string;
  type: 'discount' | 'service' | 'referral' | 'seasonal';
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  status?: 'active' | 'scheduled' | 'ended' | 'paused';
  targetAudience: string;
  maxUsage?: number;
  conditions?: string;
}

export interface UpdatePromotionData {
  title?: string;
  description?: string;
  type?: 'discount' | 'service' | 'referral' | 'seasonal';
  discountValue?: number;
  discountType?: 'percentage' | 'fixed';
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'scheduled' | 'ended' | 'paused';
  targetAudience?: string;
  maxUsage?: number;
  conditions?: string;
}

export interface PromotionFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PromotionStats {
  overview: {
    totalPromotions: number;
    activePromotions: number;
    scheduledPromotions: number;
    totalUsage: number;
    avgDiscountValue: number;
  };
}

// Promotions service
export const promotionService = {
  // Get all promotions with filtering and pagination
  async getPromotions(filters: PromotionFilters = {}): Promise<{
    success: boolean;
    data: {
      promotions: Promotion[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalPromotions: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiResponse(api.get(`/promotions?${params.toString()}`));
    return response;
  },

  // Get single promotion by ID
  async getPromotion(id: string): Promise<{
    success: boolean;
    data: { promotion: Promotion };
  }> {
    const response = await apiResponse(api.get(`/promotions/${id}`));
    return response;
  },

  // Create new promotion
  async createPromotion(promotionData: CreatePromotionData): Promise<{
    success: boolean;
    message: string;
    data: { promotion: Promotion };
  }> {
    const response = await apiResponse(api.post('/promotions', promotionData));
    return response;
  },

  // Update promotion
  async updatePromotion(id: string, promotionData: UpdatePromotionData): Promise<{
    success: boolean;
    message: string;
    data: { promotion: Promotion };
  }> {
    const response = await apiResponse(api.put(`/promotions/${id}`, promotionData));
    return response;
  },

  // Delete promotion
  async deletePromotion(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiResponse(api.delete(`/promotions/${id}`));
    return response;
  },

  // Update promotion status
  async updatePromotionStatus(id: string, status: Promotion['status']): Promise<{
    success: boolean;
    message: string;
    data: { promotion: Promotion };
  }> {
    const response = await apiResponse(api.put(`/promotions/${id}/status`, { status }));
    return response;
  },

  // Get promotion statistics
  async getPromotionStats(): Promise<{
    success: boolean;
    data: PromotionStats;
  }> {
    const response = await apiResponse(api.get('/promotions/stats/overview'));
    return response;
  },

  // Get active promotions
  async getActivePromotions(): Promise<{
    success: boolean;
    data: { activePromotions: Promotion[] };
  }> {
    const response = await apiResponse(api.get('/promotions/active'));
    return response;
  },

  // Search promotions
  async searchPromotions(query: string): Promise<{
    success: boolean;
    data: { promotions: Promotion[] };
  }> {
    const response = await apiResponse(api.get(`/promotions?search=${encodeURIComponent(query)}`));
    return response;
  }
};
