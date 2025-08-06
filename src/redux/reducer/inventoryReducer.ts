import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { InventoryItem } from '../../utils/CustomerTypes'

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
  contactPerson: string
  email: string
  phone: string
  address: string
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
  items: [
    {
      id: 'inv1',
      partNumber: 'OF-123',
      name: 'Oil Filter - Standard',
      description: 'Standard oil filter for most vehicles',
      category: 'Filters',
      supplier: 'AutoParts Plus',
      costPrice: 12.99,
      sellPrice: 19.99,
      quantityOnHand: 45,
      minStockLevel: 10,
      maxStockLevel: 100,
      location: 'A1-B2',
      isActive: true,
      lastUpdated: '2025-08-03T10:00:00Z'
    },
    {
      id: 'inv2',
      partNumber: 'OIL-5W30',
      name: 'Motor Oil 5W-30 (5qt)',
      description: 'Premium synthetic motor oil 5W-30',
      category: 'Fluids',
      supplier: 'Oil Express',
      costPrice: 28.99,
      sellPrice: 39.99,
      quantityOnHand: 25,
      minStockLevel: 15,
      maxStockLevel: 50,
      location: 'B1-C3',
      isActive: true,
      lastUpdated: '2025-08-03T10:00:00Z'
    },
    {
      id: 'inv3',
      partNumber: 'BP-456',
      name: 'Brake Pads - Front Set',
      description: 'Ceramic brake pads for front wheels',
      category: 'Brakes',
      supplier: 'Brake Masters',
      costPrice: 45.99,
      sellPrice: 79.99,
      quantityOnHand: 8,
      minStockLevel: 5,
      maxStockLevel: 30,
      location: 'C2-D1',
      isActive: true,
      lastUpdated: '2025-08-03T10:00:00Z'
    },
    {
      id: 'inv4',
      partNumber: 'TF-789',
      name: 'Transmission Filter',
      description: 'Automatic transmission filter',
      category: 'Filters',
      supplier: 'Trans Tech',
      costPrice: 35.99,
      sellPrice: 59.99,
      quantityOnHand: 2,
      minStockLevel: 5,
      maxStockLevel: 20,
      location: 'A2-B1',
      isActive: true,
      lastUpdated: '2025-08-03T10:00:00Z'
    }
  ],
  transactions: [
    {
      id: 'txn1',
      itemId: 'inv1',
      type: 'usage',
      quantity: -1,
      date: '2025-08-01T14:30:00Z',
      reference: 'WO-001',
      notes: 'Used for oil change - John Smith',
      employeeId: 'emp1',
      employeeName: 'Mike Johnson'
    },
    {
      id: 'txn2',
      itemId: 'inv2',
      type: 'usage',
      quantity: -1,
      date: '2025-08-01T14:30:00Z',
      reference: 'WO-001',
      notes: 'Used for oil change - John Smith',
      employeeId: 'emp1',
      employeeName: 'Mike Johnson'
    },
    {
      id: 'txn3',
      itemId: 'inv1',
      type: 'purchase',
      quantity: 50,
      unitCost: 12.99,
      totalCost: 649.50,
      date: '2025-07-30T09:00:00Z',
      reference: 'PO-001',
      notes: 'Monthly stock replenishment',
      employeeId: 'emp2',
      employeeName: 'Sarah Davis'
    }
  ],
  suppliers: [
    {
      id: 'sup1',
      name: 'AutoParts Plus',
      contactPerson: 'John Martinez',
      email: 'john@autopartsplus.com',
      phone: '(555) 234-5678',
      address: '456 Industrial Blvd, Parts City, ST 67890',
      website: 'https://autopartsplus.com',
      paymentTerms: 'Net 30',
      isActive: true,
      rating: 4,
      notes: 'Reliable supplier for filters and basic parts'
    },
    {
      id: 'sup2',
      name: 'Oil Express',
      contactPerson: 'Maria Rodriguez',
      email: 'maria@oilexpress.com',
      phone: '(555) 345-6789',
      address: '789 Oil Way, Fluid Town, ST 78901',
      paymentTerms: 'Net 15',
      isActive: true,
      rating: 5,
      notes: 'Best prices on synthetic oils and fluids'
    },
    {
      id: 'sup3',
      name: 'Brake Masters',
      contactPerson: 'David Chen',
      email: 'david@brakemasters.com',
      phone: '(555) 456-7890',
      address: '321 Brake Street, Stop City, ST 89012',
      paymentTerms: 'Net 30',
      isActive: true,
      rating: 4,
      notes: 'Specializes in brake components and suspension parts'
    }
  ],
  purchaseOrders: [
    {
      id: 'po1',
      supplierId: 'sup1',
      supplierName: 'AutoParts Plus',
      orderDate: '2025-08-01T10:00:00Z',
      expectedDate: '2025-08-05T00:00:00Z',
      status: 'sent',
      items: [
        {
          itemId: 'inv1',
          partNumber: 'OF-123',
          name: 'Oil Filter - Standard',
          quantity: 50,
          unitCost: 12.99,
          totalCost: 649.50
        },
        {
          itemId: 'inv4',
          partNumber: 'TF-789',
          name: 'Transmission Filter',
          quantity: 15,
          unitCost: 35.99,
          totalCost: 539.85
        }
      ],
      subtotal: 1189.35,
      tax: 95.15,
      shipping: 25.00,
      total: 1309.50,
      notes: 'Rush order for low stock items'
    }
  ],
  categories: ['Filters', 'Fluids', 'Brakes', 'Engine', 'Transmission', 'Electrical', 'Belts & Hoses', 'Suspension', 'Tools', 'Accessories'],
  locations: ['A1-B1', 'A1-B2', 'A2-B1', 'A2-B2', 'B1-C1', 'B1-C2', 'B1-C3', 'C1-D1', 'C2-D1', 'C2-D2'],
  loading: false,
  error: null
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Inventory Item Actions
    addInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
      state.items.push(action.payload)
    },
    updateInventoryItem: (state, action: PayloadAction<InventoryItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = { ...action.payload, lastUpdated: new Date().toISOString() }
      }
    },
    deleteInventoryItem: (state, action: PayloadAction<string>) => {
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
    addSupplier: (state, action: PayloadAction<Supplier>) => {
      state.suppliers.push(action.payload)
    },
    updateSupplier: (state, action: PayloadAction<Supplier>) => {
      const index = state.suppliers.findIndex(supplier => supplier.id === action.payload.id)
      if (index !== -1) {
        state.suppliers[index] = action.payload
      }
    },
    deleteSupplier: (state, action: PayloadAction<string>) => {
      state.suppliers = state.suppliers.filter(supplier => supplier.id !== action.payload)
    },
    
    // Purchase Order Actions
    addPurchaseOrder: (state, action: PayloadAction<PurchaseOrder>) => {
      state.purchaseOrders.push(action.payload)
    },
    updatePurchaseOrder: (state, action: PayloadAction<PurchaseOrder>) => {
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
    deletePurchaseOrder: (state, action: PayloadAction<string>) => {
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
  }
})

export const {
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryQuantity,
  addTransaction,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  addPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
  addCategory,
  removeCategory,
  addLocation,
  removeLocation,
  setLoading,
  setError
} = inventorySlice.actions

export default inventorySlice.reducer
