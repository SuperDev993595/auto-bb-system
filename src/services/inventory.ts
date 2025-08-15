import api, { apiResponse } from './api';

// Inventory Item Interfaces
export interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  partNumber: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  year?: string;
  location: string;
  quantityOnHand: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  supplier: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  isActive: boolean;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemData {
  name: string;
  description: string;
  partNumber: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  year?: string;
  location: string;
  quantityOnHand: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  supplierId: string;
  isActive?: boolean;
}

export interface UpdateInventoryItemData {
  name?: string;
  description?: string;
  partNumber?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  year?: string;
  location?: string;
  quantityOnHand?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  costPrice?: number;
  sellingPrice?: number;
  supplierId?: string;
  isActive?: boolean;
}

// Inventory Transaction Interfaces
export interface InventoryTransaction {
  _id: string;
  item: {
    _id: string;
    name: string;
    partNumber: string;
  };
  type: 'in' | 'out' | 'adjustment' | 'return' | 'damage' | 'transfer';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string;
  notes?: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  cost?: number;
  location?: string;
  createdAt: string;
}

export interface CreateTransactionData {
  itemId: string;
  type: InventoryTransaction['type'];
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
  cost?: number;
  location?: string;
}

// Purchase Order Interfaces
export interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplier: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: {
    item: {
      _id: string;
      name: string;
      partNumber: string;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    receivedQuantity: number;
  }[];
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled' | 'partial';
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderData {
  supplierId: string;
  items: {
    itemId: string;
    quantity: number;
    unitPrice: number;
  }[];
  expectedDeliveryDate: string;
  notes?: string;
}

export interface UpdatePurchaseOrderData {
  supplierId?: string;
  items?: {
    itemId: string;
    quantity: number;
    unitPrice: number;
  }[];
  status?: PurchaseOrder['status'];
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
}

// Supplier Interfaces
export interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson: string;
  website?: string;
  paymentTerms: string;
  isActive: boolean;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierData {
  name: string;
  email: string;
  phone: string;
  address: Supplier['address'];
  contactPerson: string;
  website?: string;
  paymentTerms: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

export interface UpdateSupplierData {
  name?: string;
  email?: string;
  phone?: string;
  address?: Supplier['address'];
  contactPerson?: string;
  website?: string;
  paymentTerms?: string;
  isActive?: boolean;
  rating?: number;
  notes?: string;
}

// Filter Interfaces
export interface InventoryItemFilters {
  category?: string;
  location?: string;
  supplierId?: string;
  isActive?: boolean;
  stockStatus?: 'low' | 'out' | 'overstock' | 'normal';
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionFilters {
  itemId?: string;
  type?: InventoryTransaction['type'];
  startDate?: string;
  endDate?: string;
  performedBy?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PurchaseOrderFilters {
  supplierId?: string;
  status?: PurchaseOrder['status'];
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SupplierFilters {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Statistics Interfaces
export interface InventoryStats {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  totalValue: number;
  avgCostPrice: number;
  avgSellingPrice: number;
  byCategory: { category: string; count: number; value: number }[];
  byLocation: { location: string; count: number; value: number }[];
}

export interface TransactionStats {
  totalTransactions: number;
  inTransactions: number;
  outTransactions: number;
  adjustmentTransactions: number;
  returnTransactions: number;
  damageTransactions: number;
  transferTransactions: number;
  totalValue: number;
  byType: { type: string; count: number; value: number }[];
  byMonth: { month: string; count: number; value: number }[];
}

export interface PurchaseOrderStats {
  totalOrders: number;
  draftOrders: number;
  sentOrders: number;
  confirmedOrders: number;
  receivedOrders: number;
  cancelledOrders: number;
  partialOrders: number;
  totalValue: number;
  avgOrderValue: number;
  byStatus: { status: string; count: number; value: number }[];
  bySupplier: { supplier: string; count: number; value: number }[];
}

class InventoryService {
  // Inventory Item Methods
  async getInventoryItems(filters: InventoryItemFilters = {}): Promise<apiResponse<{ data: InventoryItem[]; pagination: any }>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return api.get(`/inventory/items?${params.toString()}`);
  }

  async getInventoryItem(id: string): Promise<apiResponse<InventoryItem>> {
    return api.get(`/inventory/items/${id}`);
  }

  async createInventoryItem(data: CreateInventoryItemData): Promise<apiResponse<InventoryItem>> {
    return api.post('/inventory/items', data);
  }

  async updateInventoryItem(id: string, data: UpdateInventoryItemData): Promise<apiResponse<InventoryItem>> {
    return api.put(`/inventory/items/${id}`, data);
  }

  async deleteInventoryItem(id: string): Promise<apiResponse<{ message: string }>> {
    return api.delete(`/inventory/items/${id}`);
  }

  async adjustStock(id: string, quantity: number, reason: string, notes?: string): Promise<apiResponse<InventoryItem>> {
    return api.post(`/inventory/items/${id}/adjust-stock`, { quantity, reason, notes });
  }

  async getLowStockItems(): Promise<apiResponse<InventoryItem[]>> {
    return api.get('/inventory/items/low-stock');
  }

  async getOutOfStockItems(): Promise<apiResponse<InventoryItem[]>> {
    return api.get('/inventory/items/out-of-stock');
  }

  async getInventoryStats(): Promise<apiResponse<InventoryStats>> {
    return api.get('/inventory/items/stats/overview');
  }

  // Transaction Methods
  async getTransactions(filters: TransactionFilters = {}): Promise<apiResponse<{ data: InventoryTransaction[]; pagination: any }>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return api.get(`/inventory/transactions?${params.toString()}`);
  }

  async getTransaction(id: string): Promise<apiResponse<InventoryTransaction>> {
    return api.get(`/inventory/transactions/${id}`);
  }

  async createTransaction(data: CreateTransactionData): Promise<apiResponse<InventoryTransaction>> {
    return api.post('/inventory/transactions', data);
  }

  async getTransactionStats(startDate?: string, endDate?: string): Promise<apiResponse<TransactionStats>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/inventory/transactions/stats/overview?${params.toString()}`);
  }

  // Purchase Order Methods
  async getPurchaseOrders(filters: PurchaseOrderFilters = {}): Promise<apiResponse<{ data: PurchaseOrder[]; pagination: any }>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return api.get(`/inventory/purchase-orders?${params.toString()}`);
  }

  async getPurchaseOrder(id: string): Promise<apiResponse<PurchaseOrder>> {
    return api.get(`/inventory/purchase-orders/${id}`);
  }

  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<apiResponse<PurchaseOrder>> {
    return api.post('/inventory/purchase-orders', data);
  }

  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderData): Promise<apiResponse<PurchaseOrder>> {
    return api.put(`/inventory/purchase-orders/${id}`, data);
  }

  async deletePurchaseOrder(id: string): Promise<apiResponse<{ message: string }>> {
    return api.delete(`/inventory/purchase-orders/${id}`);
  }

  async updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status']): Promise<apiResponse<PurchaseOrder>> {
    return api.patch(`/inventory/purchase-orders/${id}/status`, { status });
  }

  async receivePurchaseOrder(id: string, receivedItems: { itemId: string; receivedQuantity: number }[]): Promise<apiResponse<PurchaseOrder>> {
    return api.post(`/inventory/purchase-orders/${id}/receive`, { receivedItems });
  }

  async getPurchaseOrderStats(startDate?: string, endDate?: string): Promise<apiResponse<PurchaseOrderStats>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/inventory/purchase-orders/stats/overview?${params.toString()}`);
  }

  // Supplier Methods
  async getSuppliers(filters: SupplierFilters = {}): Promise<apiResponse<{ data: Supplier[]; pagination: any }>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return api.get(`/inventory/suppliers?${params.toString()}`);
  }

  async getSupplier(id: string): Promise<apiResponse<Supplier>> {
    return api.get(`/inventory/suppliers/${id}`);
  }

  async createSupplier(data: CreateSupplierData): Promise<apiResponse<Supplier>> {
    return api.post('/inventory/suppliers', data);
  }

  async updateSupplier(id: string, data: UpdateSupplierData): Promise<apiResponse<Supplier>> {
    return api.put(`/inventory/suppliers/${id}`, data);
  }

  async deleteSupplier(id: string): Promise<apiResponse<{ message: string }>> {
    return api.delete(`/inventory/suppliers/${id}`);
  }

  // General Inventory Methods
  async getCategories(): Promise<apiResponse<string[]>> {
    return api.get('/inventory/categories');
  }

  async getLocations(): Promise<apiResponse<string[]>> {
    return api.get('/inventory/locations');
  }

  async exportInventory(format: 'csv' | 'excel' = 'csv'): Promise<apiResponse<{ downloadUrl: string }>> {
    return api.get(`/inventory/export?format=${format}`);
  }

  async importInventory(file: File): Promise<apiResponse<{ message: string; imported: number; errors: any[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/inventory/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
