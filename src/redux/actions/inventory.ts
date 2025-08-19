import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import inventoryService, {
  InventoryItem,
  InventoryTransaction,
  PurchaseOrder,
  Supplier,
  InventoryStats,
  TransactionStats,
  PurchaseOrderStats,
  CreateInventoryItemData,
  UpdateInventoryItemData,
  CreateSupplierData,
  UpdateSupplierData,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  InventoryItemFilters,
  TransactionFilters,
  PurchaseOrderFilters,
  SupplierFilters
} from '../../services/inventory';

// Async thunks for Inventory Items
export const fetchInventoryItems = createAsyncThunk(
  'inventory/fetchItems',
  async (filters: InventoryItemFilters = {}, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryItems(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory items');
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  'inventory/createItem',
  async (itemData: CreateInventoryItemData, { rejectWithValue }) => {
    try {
      const response = await inventoryService.createInventoryItem(itemData);
      toast.success('Inventory item created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create inventory item');
      return rejectWithValue(error.response?.data?.message || 'Failed to create inventory item');
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateItem',
  async ({ id, itemData }: { id: string; itemData: UpdateInventoryItemData }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updateInventoryItem(id, itemData);
      toast.success('Inventory item updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update inventory item');
      return rejectWithValue(error.response?.data?.message || 'Failed to update inventory item');
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await inventoryService.deleteInventoryItem(id);
      toast.success('Inventory item deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete inventory item');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete inventory item');
    }
  }
);

export const adjustStock = createAsyncThunk(
  'inventory/adjustStock',
  async ({ itemId, quantity, reason, notes }: { itemId: string; quantity: number; reason: string; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.adjustStock(itemId, quantity, reason, notes);
      toast.success('Stock adjusted successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to adjust stock');
      return rejectWithValue(error.response?.data?.message || 'Failed to adjust stock');
    }
  }
);

export const fetchInventoryStats = createAsyncThunk(
  'inventory/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory stats');
    }
  }
);

// Async thunks for Inventory Transactions
export const fetchInventoryTransactions = createAsyncThunk(
  'inventory/fetchTransactions',
  async (filters: TransactionFilters = {}, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getTransactions(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const createInventoryTransaction = createAsyncThunk(
  'inventory/createTransaction',
  async (transactionData: any, { rejectWithValue }) => {
    try {
      const response = await inventoryService.createTransaction(transactionData);
      toast.success('Transaction created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create transaction');
      return rejectWithValue(error.response?.data?.message || 'Failed to create transaction');
    }
  }
);

export const fetchTransactionStats = createAsyncThunk(
  'inventory/fetchTransactionStats',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getTransactionStats(startDate, endDate);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction stats');
    }
  }
);

// Async thunks for Purchase Orders
export const fetchPurchaseOrders = createAsyncThunk(
  'inventory/fetchPurchaseOrders',
  async (filters: PurchaseOrderFilters = {}, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getPurchaseOrders(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase orders');
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  'inventory/createPurchaseOrder',
  async (purchaseOrderData: CreatePurchaseOrderData, { rejectWithValue }) => {
    try {
      const response = await inventoryService.createPurchaseOrder(purchaseOrderData);
      toast.success('Purchase order created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create purchase order');
      return rejectWithValue(error.response?.data?.message || 'Failed to create purchase order');
    }
  }
);

export const updatePurchaseOrder = createAsyncThunk(
  'inventory/updatePurchaseOrder',
  async ({ id, purchaseOrderData }: { id: string; purchaseOrderData: UpdatePurchaseOrderData }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updatePurchaseOrder(id, purchaseOrderData);
      toast.success('Purchase order updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update purchase order');
      return rejectWithValue(error.response?.data?.message || 'Failed to update purchase order');
    }
  }
);

export const deletePurchaseOrder = createAsyncThunk(
  'inventory/deletePurchaseOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await inventoryService.deletePurchaseOrder(id);
      toast.success('Purchase order deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete purchase order');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete purchase order');
    }
  }
);

export const receivePurchaseOrder = createAsyncThunk(
  'inventory/receivePurchaseOrder',
  async ({ id, receivedItems }: { id: string; receivedItems: { itemId: string; receivedQuantity: number }[] }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.receivePurchaseOrder(id, receivedItems);
      toast.success('Purchase order received successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to receive purchase order');
      return rejectWithValue(error.response?.data?.message || 'Failed to receive purchase order');
    }
  }
);

export const fetchPurchaseOrderStats = createAsyncThunk(
  'inventory/fetchPurchaseOrderStats',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getPurchaseOrderStats(startDate, endDate);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase order stats');
    }
  }
);

// Async thunks for Suppliers
export const fetchSuppliers = createAsyncThunk(
  'inventory/fetchSuppliers',
  async (filters: SupplierFilters = {}, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getSuppliers(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'inventory/createSupplier',
  async (supplierData: CreateSupplierData, { rejectWithValue }) => {
    try {
      const response = await inventoryService.createSupplier(supplierData);
      toast.success('Supplier created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create supplier');
      return rejectWithValue(error.response?.data?.message || 'Failed to create supplier');
    }
  }
);

export const updateSupplier = createAsyncThunk(
  'inventory/updateSupplier',
  async ({ id, supplierData }: { id: string; supplierData: UpdateSupplierData }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updateSupplier(id, supplierData);
      toast.success('Supplier updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update supplier');
      return rejectWithValue(error.response?.data?.message || 'Failed to update supplier');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'inventory/deleteSupplier',
  async (id: string, { rejectWithValue }) => {
    try {
      await inventoryService.deleteSupplier(id);
      toast.success('Supplier deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete supplier');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete supplier');
    }
  }
);

// Async thunks for general inventory data
export const fetchInventoryCategories = createAsyncThunk(
  'inventory/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchInventoryLocations = createAsyncThunk(
  'inventory/fetchLocations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getLocations();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch locations');
    }
  }
);

interface InventoryState {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  categories: string[];
  locations: string[];
  stats: InventoryStats | null;
  transactionStats: TransactionStats | null;
  purchaseOrderStats: PurchaseOrderStats | null;
  itemsLoading: boolean;
  transactionsLoading: boolean;
  suppliersLoading: boolean;
  purchaseOrdersLoading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  transactions: [],
  suppliers: [],
  purchaseOrders: [],
  categories: [],
  locations: [],
  stats: null,
  transactionStats: null,
  purchaseOrderStats: null,
  itemsLoading: false,
  transactionsLoading: false,
  suppliersLoading: false,
  purchaseOrdersLoading: false,
  statsLoading: false,
  error: null
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearInventoryError: (state) => {
      state.error = null;
    },
    clearInventoryItems: (state) => {
      state.items = [];
    },
    clearInventoryTransactions: (state) => {
      state.transactions = [];
    },
    clearSuppliers: (state) => {
      state.suppliers = [];
    },
    clearPurchaseOrders: (state) => {
      state.purchaseOrders = [];
    }
  },
  extraReducers: (builder) => {
    // Inventory Items
    builder
      .addCase(fetchInventoryItems.pending, (state) => {
        state.itemsLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.itemsLoading = false;
        state.items = action.payload.data || action.payload;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.itemsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });

    // Inventory Transactions
    builder
      .addCase(fetchInventoryTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.transactions = action.payload.data || action.payload;
      })
      .addCase(fetchInventoryTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createInventoryTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      });

    // Purchase Orders
    builder
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.purchaseOrdersLoading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.purchaseOrdersLoading = false;
        state.purchaseOrders = action.payload.data || action.payload;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.purchaseOrdersLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.purchaseOrders.push(action.payload);
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        const index = state.purchaseOrders.findIndex(po => po._id === action.payload._id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
      })
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        state.purchaseOrders = state.purchaseOrders.filter(po => po._id !== action.payload);
      })
      .addCase(receivePurchaseOrder.fulfilled, (state, action) => {
        const index = state.purchaseOrders.findIndex(po => po._id === action.payload._id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
      });

    // Suppliers
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.suppliersLoading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliersLoading = false;
        state.suppliers = action.payload.data || action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.suppliersLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.suppliers.push(action.payload);
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex(supplier => supplier._id === action.payload._id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(supplier => supplier._id !== action.payload);
      });

    // Stats
    builder
      .addCase(fetchInventoryStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchInventoryStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchInventoryStats.rejected, (state) => {
        state.statsLoading = false;
      })
      .addCase(fetchTransactionStats.fulfilled, (state, action) => {
        state.transactionStats = action.payload;
      })
      .addCase(fetchPurchaseOrderStats.fulfilled, (state, action) => {
        state.purchaseOrderStats = action.payload;
      });

    // Categories and Locations
    builder
      .addCase(fetchInventoryCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchInventoryLocations.fulfilled, (state, action) => {
        state.locations = action.payload;
      });
  }
});

export const {
  clearInventoryError,
  clearInventoryItems,
  clearInventoryTransactions,
  clearSuppliers,
  clearPurchaseOrders
} = inventorySlice.actions;

export default inventorySlice.reducer;
