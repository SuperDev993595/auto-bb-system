import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { InventoryItem } from '../../utils/CustomerTypes'
import {
  fetchInventoryItems,
  fetchInventoryTransactions,
  fetchSuppliers,
  fetchPurchaseOrders,
  fetchInventoryCategories,
  fetchInventoryLocations,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder
} from '../actions/inventory'

export interface InventoryTransaction {
  id: string
  itemId: string
  type: 'purchase' | 'usage' | 'adjustment' | 'return'
  quantity: number
  unitCost?: number
  totalCost?: number
  date: string
  reference: string // Work order ID, supplier invoice, etc.
  notes?: string
  employeeId: string
  employeeName: string
}

export interface Supplier {
  id: string
  name: string
  contactPerson: {
    name: string
    email: string
    phone?: string
    position?: string
  }
  email: string
  phone: string
  address: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  website?: string
  paymentTerms: string
  isActive: boolean
  rating: number // 1-5
  notes?: string
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  supplierName: string
  orderDate: string
  expectedDate?: string
  receivedDate?: string
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled'
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  notes?: string
}

export interface PurchaseOrderItem {
  itemId: string
  partNumber: string
  name: string
  quantity: number
  unitCost: number
  totalCost: number
}

interface InventoryState {
  items: InventoryItem[]
  transactions: InventoryTransaction[]
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  categories: string[]
  locations: string[]
  loading: boolean
  error: string | null
}

const initialState: InventoryState = {
  items: [],
  transactions: [],
  suppliers: [],
  purchaseOrders: [],
  categories: [],
  locations: [],
  loading: false,
  error: null
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Inventory Item Actions
    addInventoryItemLocal: (state, action: PayloadAction<InventoryItem>) => {
      state.items.push(action.payload)
    },
    updateInventoryItemLocal: (state, action: PayloadAction<InventoryItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = { ...action.payload, lastUpdated: new Date().toISOString() }
      }
    },
    deleteInventoryItemLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    adjustInventoryQuantity: (state, action: PayloadAction<{itemId: string, newQuantity: number, reason: string}>) => {
      const item = state.items.find(item => item.id === action.payload.itemId)
      if (item) {
        const oldQuantity = item.quantityOnHand
        item.quantityOnHand = action.payload.newQuantity
        item.lastUpdated = new Date().toISOString()
        
        // Create adjustment transaction
        const transaction: InventoryTransaction = {
          id: `txn_${Date.now()}`,
          itemId: action.payload.itemId,
          type: 'adjustment',
          quantity: action.payload.newQuantity - oldQuantity,
          date: new Date().toISOString(),
          reference: 'MANUAL_ADJ',
          notes: action.payload.reason,
          employeeId: 'system',
          employeeName: 'System'
        }
        state.transactions.push(transaction)
      }
    },
    
    // Transaction Actions
    addTransaction: (state, action: PayloadAction<InventoryTransaction>) => {
      state.transactions.push(action.payload)
      
      // Update inventory quantity based on transaction
      const item = state.items.find(item => item.id === action.payload.itemId)
      if (item) {
        item.quantityOnHand += action.payload.quantity
        item.lastUpdated = new Date().toISOString()
      }
    },
    
    // Supplier Actions
    addSupplierLocal: (state, action: PayloadAction<Supplier>) => {
      state.suppliers.push(action.payload)
    },
    updateSupplierLocal: (state, action: PayloadAction<Supplier>) => {
      const index = state.suppliers.findIndex(supplier => supplier.id === action.payload.id)
      if (index !== -1) {
        state.suppliers[index] = action.payload
      }
    },
    deleteSupplierLocal: (state, action: PayloadAction<string>) => {
      state.suppliers = state.suppliers.filter(supplier => supplier.id !== action.payload)
    },
    
    // Purchase Order Actions
    addPurchaseOrderLocal: (state, action: PayloadAction<PurchaseOrder>) => {
      state.purchaseOrders.push(action.payload)
    },
    updatePurchaseOrderLocal: (state, action: PayloadAction<PurchaseOrder>) => {
      const index = state.purchaseOrders.findIndex(po => po.id === action.payload.id)
      if (index !== -1) {
        state.purchaseOrders[index] = action.payload
      }
    },
    updatePurchaseOrderStatus: (state, action: PayloadAction<{id: string, status: PurchaseOrder['status']}>) => {
      const po = state.purchaseOrders.find(po => po.id === action.payload.id)
      if (po) {
        po.status = action.payload.status
        if (action.payload.status === 'received') {
          po.receivedDate = new Date().toISOString()
          
          // Add received items to inventory
          po.items.forEach(poItem => {
            const transaction: InventoryTransaction = {
              id: `txn_${Date.now()}_${poItem.itemId}`,
              itemId: poItem.itemId,
              type: 'purchase',
              quantity: poItem.quantity,
              unitCost: poItem.unitCost,
              totalCost: poItem.totalCost,
              date: new Date().toISOString(),
              reference: po.id,
              notes: `Received from ${po.supplierName}`,
              employeeId: 'system',
              employeeName: 'System'
            }
            state.transactions.push(transaction)
            
            // Update inventory quantity
            const item = state.items.find(item => item.id === poItem.itemId)
            if (item) {
              item.quantityOnHand += poItem.quantity
              item.lastUpdated = new Date().toISOString()
            }
          })
        }
      }
    },
    deletePurchaseOrderLocal: (state, action: PayloadAction<string>) => {
      state.purchaseOrders = state.purchaseOrders.filter(po => po.id !== action.payload)
    },
    
    // Category and Location Management
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload)
        state.categories.sort()
      }
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(cat => cat !== action.payload)
    },
    addLocation: (state, action: PayloadAction<string>) => {
      if (!state.locations.includes(action.payload)) {
        state.locations.push(action.payload)
        state.locations.sort()
      }
    },
    removeLocation: (state, action: PayloadAction<string>) => {
      state.locations = state.locations.filter(loc => loc !== action.payload)
    },
    
    // General Actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    // Fetch Inventory Items
    builder
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data?.items || action.payload.items || action.payload
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Inventory Transactions
    builder
      .addCase(fetchInventoryTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventoryTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload.data?.transactions || action.payload.transactions || action.payload
      })
      .addCase(fetchInventoryTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Suppliers
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false
        state.suppliers = action.payload.data?.suppliers || action.payload.suppliers || action.payload
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Purchase Orders
    builder
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false
        state.purchaseOrders = action.payload.data?.purchaseOrders || action.payload.purchaseOrders || action.payload
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Categories
    builder
      .addCase(fetchInventoryCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventoryCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload.data?.categories || action.payload.categories || action.payload
      })
      .addCase(fetchInventoryCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch Locations
    builder
      .addCase(fetchInventoryLocations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInventoryLocations.fulfilled, (state, action) => {
        state.loading = false
        state.locations = action.payload.data?.locations || action.payload.locations || action.payload
      })
      .addCase(fetchInventoryLocations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create Inventory Item
    builder
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.items.push(action.payload.data || action.payload)
      })

    // Update Inventory Item
    builder
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const updatedItem = action.payload.data || action.payload
        const index = state.items.findIndex(item => (item as any)._id === (updatedItem as any)._id || item.id === updatedItem.id)
        if (index !== -1) {
          state.items[index] = updatedItem
        }
      })

    // Delete Inventory Item
    builder
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        const deletedId = action.payload
        state.items = state.items.filter(item => (item as any)._id !== deletedId && item.id !== deletedId)
      })

    // Create Supplier
    builder
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.suppliers.push(action.payload.data?.supplier || action.payload.data || action.payload)
      })

    // Update Supplier
    builder
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const updatedSupplier = action.payload.data?.supplier || action.payload.data || action.payload
        const index = state.suppliers.findIndex(supplier => (supplier as any)._id === (updatedSupplier as any)._id || supplier.id === updatedSupplier.id)
        if (index !== -1) {
          state.suppliers[index] = updatedSupplier
        }
      })

    // Delete Supplier
    builder
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        const deletedId = action.payload
        state.suppliers = state.suppliers.filter(supplier => (supplier as any)._id !== deletedId && supplier.id !== deletedId)
      })

    // Create Purchase Order
    builder
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.purchaseOrders.push(action.payload.data || action.payload)
      })

    // Update Purchase Order
    builder
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        const updatedPO = action.payload.data || action.payload
        const index = state.purchaseOrders.findIndex(po => (po as any)._id === (updatedPO as any)._id || po.id === updatedPO.id)
        if (index !== -1) {
          state.purchaseOrders[index] = updatedPO
        }
      })

    // Delete Purchase Order
    builder
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        const deletedId = action.payload
        state.purchaseOrders = state.purchaseOrders.filter(po => (po as any)._id !== deletedId && po.id !== deletedId)
      })
  }
})

export const {
  addInventoryItemLocal,
  updateInventoryItemLocal,
  deleteInventoryItemLocal,
  adjustInventoryQuantity,
  addTransaction,
  addSupplierLocal,
  updateSupplierLocal,
  deleteSupplierLocal,
  addPurchaseOrderLocal,
  updatePurchaseOrderLocal,
  updatePurchaseOrderStatus,
  deletePurchaseOrderLocal,
  addCategory,
  removeCategory,
  addLocation,
  removeLocation,
  setLoading,
  setError
} = inventorySlice.actions

export default inventorySlice.reducer
