import api from './api'

export interface ReportFilters {
  startDate: string
  endDate: string
  customerId?: string
  membershipTier?: string
  warrantyType?: string
  status?: string
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year'
}

export interface MembershipReport {
  totalMemberships: number
  activeMemberships: number
  expiredMemberships: number
  newMemberships: number
  cancelledMemberships: number
  revenueByTier: Array<{
    tier: string
    count: number
    revenue: number
    percentage: number
  }>
  growthRate: number
  averageRetentionRate: number
  topCustomers: Array<{
    customerId: string
    customerName: string
    membershipCount: number
    totalSpent: number
    joinDate: string
  }>
  monthlyTrends: Array<{
    month: string
    newMemberships: number
    cancellations: number
    revenue: number
  }>
}

export interface WarrantyReport {
  totalWarranties: number
  activeWarranties: number
  expiredWarranties: number
  totalClaims: number
  totalClaimAmount: number
  averageClaimAmount: number
  claimsByType: Array<{
    warrantyType: string
    claimCount: number
    totalAmount: number
    averageAmount: number
  }>
  claimsByStatus: Array<{
    status: string
    count: number
    amount: number
  }>
  expiringWarranties: Array<{
    warrantyId: string
    customerName: string
    vehicleInfo: string
    expiryDate: string
    daysUntilExpiry: number
  }>
  monthlyTrends: Array<{
    month: string
    newWarranties: number
    expirations: number
    claims: number
    claimAmount: number
  }>
}

export interface CustomerInsightsReport {
  totalCustomers: number
  customersWithMemberships: number
  customersWithWarranties: number
  customersWithBoth: number
  averageMembershipsPerCustomer: number
  averageWarrantiesPerCustomer: number
  customerLifetimeValue: Array<{
    customerId: string
    customerName: string
    totalSpent: number
    membershipCount: number
    warrantyCount: number
    lastActivity: string
  }>
  customerSegments: Array<{
    segment: string
    count: number
    averageValue: number
    characteristics: string[]
  }>
  retentionAnalysis: Array<{
    period: string
    retentionRate: number
    churnRate: number
    newCustomers: number
  }>
}

export interface FinancialReport {
  totalRevenue: number
  membershipRevenue: number
  warrantyRevenue: number
  claimCosts: number
  netProfit: number
  profitMargin: number
  revenueByPeriod: Array<{
    period: string
    revenue: number
    costs: number
    profit: number
    margin: number
  }>
  topRevenueSources: Array<{
    source: string
    revenue: number
    percentage: number
    growth: number
  }>
  costAnalysis: Array<{
    category: string
    amount: number
    percentage: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
}

export interface PerformanceMetrics {
  customerSatisfaction: number
  responseTime: number
  resolutionRate: number
  renewalRate: number
  claimProcessingTime: number
  customerRetentionRate: number
  averageCustomerLifetime: number
  customerAcquisitionCost: number
  customerLifetimeValue: number
}

class ReportingService {
  private baseUrl = '/reports'

  // Get membership analytics report
  async getMembershipReport(filters: ReportFilters): Promise<MembershipReport> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await api.get(`${this.baseUrl}/memberships?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching membership report:', error)
      throw error
    }
  }

  // Get warranty analytics report
  async getWarrantyReport(filters: ReportFilters): Promise<WarrantyReport> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await api.get(`${this.baseUrl}/warranties?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching warranty report:', error)
      throw error
    }
  }

  // Get customer insights report
  async getCustomerInsightsReport(filters: ReportFilters): Promise<CustomerInsightsReport> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await api.get(`${this.baseUrl}/customer-insights?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching customer insights report:', error)
      throw error
    }
  }

  // Get financial report
  async getFinancialReport(filters: ReportFilters): Promise<FinancialReport> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await api.get(`${this.baseUrl}/financial?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching financial report:', error)
      throw error
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(filters: ReportFilters): Promise<PerformanceMetrics> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await api.get(`${this.baseUrl}/performance?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
      throw error
    }
  }

  // Generate custom report
  async generateCustomReport(config: {
    metrics: string[]
    filters: ReportFilters
    format: 'pdf' | 'excel' | 'csv'
    groupBy?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ downloadUrl: string; reportId: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/custom`, config)
      return response.data
    } catch (error) {
      console.error('Error generating custom report:', error)
      throw error
    }
  }

  // Schedule recurring report
  async scheduleRecurringReport(config: {
    name: string
    description: string
    metrics: string[]
    filters: ReportFilters
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    recipients: string[]
    format: 'pdf' | 'excel' | 'csv'
    startDate: string
    endDate?: string
  }): Promise<{ scheduleId: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/schedule`, config)
      return response.data
    } catch (error) {
      console.error('Error scheduling recurring report:', error)
      throw error
    }
  }

  // Get scheduled reports
  async getScheduledReports(): Promise<Array<{
    id: string
    name: string
    description: string
    frequency: string
    nextRun: string
    status: 'active' | 'paused' | 'completed'
    recipients: string[]
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/scheduled`)
      return response.data
    } catch (error) {
      console.error('Error fetching scheduled reports:', error)
      return []
    }
  }

  // Update scheduled report
  async updateScheduledReport(scheduleId: string, updates: Partial<{
    name: string
    description: string
    frequency: string
    recipients: string[]
    status: string
  }>): Promise<boolean> {
    try {
      await api.put(`${this.baseUrl}/scheduled/${scheduleId}`, updates)
      return true
    } catch (error) {
      console.error('Error updating scheduled report:', error)
      return false
    }
  }

  // Delete scheduled report
  async deleteScheduledReport(scheduleId: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/scheduled/${scheduleId}`)
      return true
    } catch (error) {
      console.error('Error deleting scheduled report:', error)
      return false
    }
  }

  // Get report history
  async getReportHistory(filters?: {
    reportType?: string
    startDate?: string
    endDate?: string
    generatedBy?: string
    page?: number
    limit?: number
  }): Promise<{
    reports: Array<{
      id: string
      type: string
      name: string
      generatedBy: string
      generatedAt: string
      downloadUrl: string
      size: number
    }>
    total: number
    page: number
    totalPages: number
  }> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString())
          }
        })
      }
      
      const response = await api.get(`${this.baseUrl}/history?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching report history:', error)
      return { reports: [], total: 0, page: 1, totalPages: 1 }
    }
  }

  // Export report data
  async exportReportData(reportId: string, format: 'excel' | 'csv' | 'json'): Promise<{ downloadUrl: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/${reportId}/export`, { format })
      return response.data
    } catch (error) {
      console.error('Error exporting report data:', error)
      throw error
    }
  }

  // Get report templates
  async getReportTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    category: string
    metrics: string[]
    defaultFilters: Partial<ReportFilters>
    isCustomizable: boolean
  }>> {
    try {
      const response = await api.get(`${this.baseUrl}/templates`)
      return response.data
    } catch (error) {
      console.error('Error fetching report templates:', error)
      return []
    }
  }

  // Save custom report template
  async saveReportTemplate(template: {
    name: string
    description: string
    category: string
    metrics: string[]
    defaultFilters: Partial<ReportFilters>
    isCustomizable: boolean
  }): Promise<{ templateId: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/templates`, template)
      return response.data
    } catch (error) {
      console.error('Error saving report template:', error)
      throw error
    }
  }

  // Get real-time dashboard data
  async getDashboardData(): Promise<{
    memberships: {
      total: number
      active: number
      expiring: number
      newToday: number
    }
    warranties: {
      total: number
      active: number
      expiring: number
      claimsToday: number
    }
    revenue: {
      today: number
      thisWeek: number
      thisMonth: number
      trend: number
    }
    alerts: Array<{
      id: string
      type: string
      message: string
      priority: 'low' | 'medium' | 'high'
      timestamp: string
    }>
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/dashboard`)
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  }
}

export const reportingService = new ReportingService()
export default reportingService
