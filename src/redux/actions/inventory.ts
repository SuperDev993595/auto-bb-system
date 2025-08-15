import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import {
  inventoryService,
  InventoryItem,
  InventoryTransaction,
  PurchaseOrder,
  Supplier,
  InventoryStats,
  TransactionStats,
  PurchaseOrderStats
} from '../../services/inventory';

// Async thunks for Inventory Items
export const fetchInventoryItems = createAsyncThunk(
  'inventory/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryItems();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory items');
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  'inventory/createItem',
  async (itemData: Partial<InventoryItem>, { rejectWithValue }) => {
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
  async ({ id, itemData }: { id: string; itemData: Partial<InventoryItem> }, { rejectWithValue }) => {
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
  async ({ itemId, quantity, type, reason }: { itemId: string; quantity: number; type: 'add' | 'remove'; reason: string }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.adjustStock(itemId, quantity, type, reason);
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
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventoryTransactions();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const createInventoryTransaction = createAsyncThunk(
  'inventory/createTransaction',
  async (transactionData: Partial<InventoryTransaction>, { rejectWithValue }) => {
    try {
      const response = await inventoryService.createInventoryTransaction(transactionData);
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
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getTransactionStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction stats');
    }
  }
);

// Async thunks for Purchase Orders
export const fetchPurchaseOrders = createAsyncThunk(
  'inventory/fetchPurchaseOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getPurchaseOrders();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase orders');
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  'inventory/createPurchaseOrder',
  async (orderData: Partial<PurchaseOrder>, { rejectWithValue }) => {
    try {
      const response = await inventoryService.createPurchaseOrder(orderData);
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
  async ({ id, orderData }: { id: string; orderData: Partial<PurchaseOrder> }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updatePurchaseOrder(id, orderData);
      toast.success('Purchase order updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update purchase order');
      return rejectWithValue(error.response?.data?.message || 'Failed to update purchase order');
    }
  }
);

export const receivePurchaseOrder = createAsyncThunk(
  'inventory/receivePurchaseOrder',
  async ({ id, receivedItems }: { id: string; receivedItems: any[] }, { rejectWithValue }) => {
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
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getPurchaseOrderStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase order stats');
    }
  }
);

// Async thunks for Suppliers
export const fetchSuppliers = createAsyncThunk(
  'inventory/fetchSuppliers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getSuppliers();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suppliers');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'inventory/createSupplier',
  async (supplierData: Partial<Supplier>, { rejectWithValue }) => {
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
  async ({ id, supplierData }: { id: string; supplierData: Partial<Supplier> }, { rejectWithValue }) => {
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
      const response = await inventoryService.getInventoryCategories();
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
      const response = await inventoryService.getInventoryLocations();
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
        state.items = action.payload;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.itemsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.itemId);
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
        state.transactions = action.payload;
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
        state.purchaseOrders = action.payload;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.purchaseOrdersLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.purchaseOrders.push(action.payload);
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        const index = state.purchaseOrders.findIndex(po => po.id === action.payload.id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
      })
      .addCase(receivePurchaseOrder.fulfilled, (state, action) => {
        const index = state.purchaseOrders.findIndex(po => po.id === action.payload.id);
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
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.suppliersLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.suppliers.push(action.payload);
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex(supplier => supplier.id === action.payload.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(supplier => supplier.id !== action.payload);
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
