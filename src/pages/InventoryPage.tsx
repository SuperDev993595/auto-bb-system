import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import {
  fetchInventoryItems,
  fetchInventoryTransactions,
  fetchSuppliers,
  fetchPurchaseOrders,
  fetchInventoryStats,
  fetchTransactionStats,
  fetchPurchaseOrderStats,
  fetchInventoryCategories,
  fetchInventoryLocations,
  adjustStock
} from '../redux/actions/inventory'
import { InventoryItem } from '../utils/CustomerTypes'
import type { InventoryTransaction, Supplier, PurchaseOrder } from '../redux/reducer/inventoryReducer'
import PageTitle from '../components/Shared/PageTitle'
import AddEditInventoryModal from '../components/inventory/AddEditInventoryModal'
import DeleteInventoryModal from '../components/inventory/DeleteInventoryModal'
import AddEditSupplierModal from '../components/inventory/AddEditSupplierModal'
import DeleteSupplierModal from '../components/inventory/DeleteSupplierModal'
import AddEditPurchaseOrderModal from '../components/inventory/AddEditPurchaseOrderModal'
import DeletePurchaseOrderModal from '../components/inventory/DeletePurchaseOrderModal'
import {
  Cube,
  Truck,
  Users,
  ClipboardList,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  MapPin,
  Tag,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  Loader2
} from 'lucide-react'

type TabType = 'inventory' | 'transactions' | 'suppliers' | 'purchase-orders'

// Helper function to convert data to CSV
const convertToCSV = (data: any[], headers: string[]): string => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || row[header.toLowerCase()] || ''
        // Escape commas and quotes in the value
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}

// Helper function to download CSV file
const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('inventory')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  
  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  
  // Supplier modal states
  const [isAddEditSupplierModalOpen, setIsAddEditSupplierModalOpen] = useState(false)
  const [isDeleteSupplierModalOpen, setIsDeleteSupplierModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [supplierModalMode, setSupplierModalMode] = useState<'add' | 'edit'>('add')
  
  // Purchase Order modal states
  const [isAddEditPurchaseOrderModalOpen, setIsAddEditPurchaseOrderModalOpen] = useState(false)
  const [isDeletePurchaseOrderModalOpen, setIsDeletePurchaseOrderModalOpen] = useState(false)
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [purchaseOrderModalMode, setPurchaseOrderModalMode] = useState<'add' | 'edit'>('add')
  
  const { 
    items, 
    transactions, 
    suppliers, 
    purchaseOrders, 
    categories, 
    locations,
    loading,
    error
  } = useAppSelector(state => state.inventory)
  const dispatch = useAppDispatch()

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchInventoryItems({}))
    dispatch(fetchInventoryTransactions({}))
    dispatch(fetchSuppliers({}))
    dispatch(fetchPurchaseOrders({}))
    dispatch(fetchInventoryStats())
    dispatch(fetchTransactionStats({}))
    dispatch(fetchPurchaseOrderStats({}))
    dispatch(fetchInventoryCategories())
    dispatch(fetchInventoryLocations())
  }, [dispatch])

  // Export functionality
  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    
    switch (activeTab) {
      case 'inventory':
        exportInventoryItems(timestamp)
        break
      case 'transactions':
        exportTransactions(timestamp)
        break
      case 'suppliers':
        exportSuppliers(timestamp)
        break
      case 'purchase-orders':
        exportPurchaseOrders(timestamp)
        break
    }
  }

  const exportInventoryItems = (timestamp: string) => {
    const activeItems = (items && Array.isArray(items) ? items : []).filter(item => item.isActive)
    const headers = [
      'Name',
      'Part Number',
      'Description',
      'Category',
      'Location',
      'Supplier',
      'Quantity On Hand',
      'Min Stock Level',
      'Max Stock Level',
      'Cost Price',
      'Selling Price',
      'Total Value',
      'Status'
    ]
    
    const csvData = activeItems.map(item => ({
      'Name': item.name || '',
      'Part Number': item.partNumber || '',
      'Description': item.description || '',
      'Category': item.category || '',
      'Location': typeof item.location === 'object' && item.location 
        ? `${item.location.warehouse || ''} ${item.location.shelf || ''} ${item.location.bin || ''}`.trim()
        : item.location || '',
      'Supplier': typeof item.supplier === 'object' && item.supplier 
        ? (item.supplier as any).name 
        : item.supplier || '',
      'Quantity On Hand': item.currentStock || 0,
      'Min Stock Level': item.minimumStock || 0,
      'Max Stock Level': item.maximumStock || 0,
      'Cost Price': item.costPrice || 0,
      'Selling Price': item.sellingPrice || 0,
      'Total Value': ((item.currentStock || 0) * (item.costPrice || 0)).toFixed(2),
      'Status': getStockStatus(item).status
    }))
    
    const csvContent = convertToCSV(csvData, headers)
    downloadCSV(csvContent, `inventory-items-${timestamp}.csv`)
  }

  const exportTransactions = (timestamp: string) => {
    const recentTransactions = (transactions && Array.isArray(transactions) ? transactions : []).slice(0, 1000)
    const headers = [
      'Date',
      'Time',
      'Item Name',
      'Part Number',
      'Type',
      'Quantity',
      'Unit Cost',
      'Total Cost',
      'Reference',
      'Notes',
      'Employee'
    ]
    
    const csvData = recentTransactions.map(transaction => {
      const item = (items && Array.isArray(items) ? items : []).find(i => (i._id || i.id) === transaction.itemId)
      const date = new Date(transaction.date)
      return {
        'Date': date.toLocaleDateString(),
        'Time': date.toLocaleTimeString(),
        'Item Name': item?.name || 'Unknown Item',
        'Part Number': item?.partNumber || 'N/A',
        'Type': transaction.type,
        'Quantity': transaction.quantity,
        'Unit Cost': transaction.unitCost || 0,
        'Total Cost': transaction.totalCost || 0,
        'Reference': transaction.reference,
        'Notes': transaction.notes || '',
        'Employee': transaction.employeeName
      }
    })
    
    const csvContent = convertToCSV(csvData, headers)
    downloadCSV(csvContent, `inventory-transactions-${timestamp}.csv`)
  }

  const exportSuppliers = (timestamp: string) => {
    const activeSuppliers = (suppliers && Array.isArray(suppliers) ? suppliers : []).filter(s => s.isActive)
    const headers = [
      'Name',
      'Contact Person',
      'Email',
      'Phone',
      'Address',
      'Website',
      'Payment Terms',
      'Rating',
      'Notes',
      'Item Count'
    ]
    
    const csvData = activeSuppliers.map(supplier => ({
      'Name': supplier.name,
      'Contact Person': supplier.contactPerson?.name || '',
      'Email': supplier.email,
      'Phone': supplier.phone,
      'Address': typeof supplier.address === 'object' && supplier.address
        ? `${supplier.address.street || ''}, ${supplier.address.city || ''}, ${supplier.address.state || ''} ${supplier.address.zipCode || ''}`
        : supplier.address || '',
      'Website': supplier.website || '',
      'Payment Terms': supplier.paymentTerms,
      'Rating': supplier.rating,
      'Notes': supplier.notes || '',
      'Item Count': (items && Array.isArray(items) ? items : []).filter(item => 
        typeof item.supplier === 'object' && item.supplier 
          ? (item.supplier as any).name === supplier.name
          : item.supplier === supplier.name
      ).length
    }))
    
    const csvContent = convertToCSV(csvData, headers)
    downloadCSV(csvContent, `suppliers-${timestamp}.csv`)
  }

  const exportPurchaseOrders = (timestamp: string) => {
    const allPurchaseOrders = (purchaseOrders && Array.isArray(purchaseOrders) ? purchaseOrders : [])
    const headers = [
      'PO Number',
      'Supplier',
      'Order Date',
      'Expected Date',
      'Items Count',
      'Subtotal',
      'Tax',
      'Shipping',
      'Total',
      'Status',
      'Notes'
    ]
    
    const csvData = allPurchaseOrders.map(po => ({
      'PO Number': po.poNumber || po.id,
      'Supplier': po.supplierName || '',
      'Order Date': new Date(po.orderDate).toLocaleDateString(),
      'Expected Date': po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : '',
      'Items Count': (po.items && Array.isArray(po.items) ? po.items : []).length,
      'Subtotal': po.subtotal || 0,
      'Tax': po.tax || 0,
      'Shipping': po.shipping || 0,
      'Total': po.total || 0,
      'Status': po.status,
      'Notes': po.notes || ''
    }))
    
    const csvContent = convertToCSV(csvData, headers)
    downloadCSV(csvContent, `purchase-orders-${timestamp}.csv`)
  }

  // Filter inventory items
  const filteredItems = (items && Array.isArray(items) ? items : []).filter(item => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.partNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesLocation = locationFilter === 'all' || 
                           (typeof item.location === 'object' && item.location 
                             ? `${(item.location as any).warehouse || ''} ${(item.location as any).shelf || ''} ${(item.location as any).bin || ''}`.trim() === locationFilter
                             : item.location === locationFilter)
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && (item.currentStock || 0) <= (item.minimumStock || 0)) ||
                        (stockFilter === 'out' && (item.currentStock || 0) === 0) ||
                        (stockFilter === 'overstock' && (item.currentStock || 0) > (item.maximumStock || 0))
    
    return matchesSearch && matchesCategory && matchesLocation && matchesStock && item.isActive
  })

  // Calculate metrics
  const lowStockItems = (items && Array.isArray(items) ? items : []).filter(item => (item.currentStock || 0) <= (item.minimumStock || 0) && item.isActive)
  const outOfStockItems = (items && Array.isArray(items) ? items : []).filter(item => (item.currentStock || 0) === 0 && item.isActive)
  const totalValue = (items && Array.isArray(items) ? items : []).reduce((sum, item) => {
    const quantity = item.currentStock || 0
    const cost = item.costPrice || 0
    return sum + (quantity * cost)
  }, 0)
  const pendingOrders = (purchaseOrders && Array.isArray(purchaseOrders) ? purchaseOrders : []).filter(po => po.status === 'sent' || po.status === 'confirmed')

  const getStockStatus = (item: InventoryItem) => {
    const quantity = item.currentStock || 0
    const minLevel = item.minimumStock || 0
    const maxLevel = item.maximumStock || 0
    
    if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' }
    if (quantity <= minLevel) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' }
    if (quantity > maxLevel) return { status: 'Overstock', color: 'text-purple-600 bg-purple-100' }
    return { status: 'In Stock', color: 'text-green-600 bg-green-100' }
  }

  const handleQuantityAdjustment = (itemId: string, newQuantity: number, reason: string) => {
    // This would need to be implemented with a modal or form
    // For now, we'll use the adjustStock action
    const currentItem = items.find(item => (item._id || item.id) === itemId)
    if (currentItem) {
      const difference = newQuantity - (currentItem.currentStock || 0)
      dispatch(adjustStock({ itemId, quantity: difference, reason }))
    }
  }

  // Modal handlers
  const handleAddItem = () => {
    setModalMode('add')
    setSelectedItem(null)
    setIsAddEditModalOpen(true)
  }

  const handleEditItem = (item: InventoryItem) => {
    setModalMode('edit')
    setSelectedItem(item)
    setIsAddEditModalOpen(true)
  }

  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleCloseAddEditModal = () => {
    setIsAddEditModalOpen(false)
    setSelectedItem(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedItem(null)
  }

  // Supplier modal handlers
  const handleAddSupplier = () => {
    setSupplierModalMode('add')
    setSelectedSupplier(null)
    setIsAddEditSupplierModalOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierModalMode('edit')
    setSelectedSupplier(supplier)
    setIsAddEditSupplierModalOpen(true)
  }

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteSupplierModalOpen(true)
  }

  const handleCloseAddEditSupplierModal = () => {
    setIsAddEditSupplierModalOpen(false)
    setSelectedSupplier(null)
  }

  const handleCloseDeleteSupplierModal = () => {
    setIsDeleteSupplierModalOpen(false)
    setSelectedSupplier(null)
  }

  // Purchase Order modal handlers
  const handleAddPurchaseOrder = () => {
    setPurchaseOrderModalMode('add')
    setSelectedPurchaseOrder(null)
    setIsAddEditPurchaseOrderModalOpen(true)
  }

  const handleEditPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setPurchaseOrderModalMode('edit')
    setSelectedPurchaseOrder(purchaseOrder)
    setIsAddEditPurchaseOrderModalOpen(true)
  }

  const handleDeletePurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder)
    setIsDeletePurchaseOrderModalOpen(true)
  }

  const handleCloseAddEditPurchaseOrderModal = () => {
    setIsAddEditPurchaseOrderModalOpen(false)
    setSelectedPurchaseOrder(null)
  }

  const handleCloseDeletePurchaseOrderModal = () => {
    setIsDeletePurchaseOrderModalOpen(false)
    setSelectedPurchaseOrder(null)
  }

  const renderInventory = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Inventory Management</h2>
          <p className="text-gray-600">Track parts, supplies, and stock levels</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={handleAddItem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{(items && Array.isArray(items) ? items : []).filter(i => i.isActive).length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Categories</option>
              {categories && Array.isArray(categories) && categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Locations</option>
              {locations && Array.isArray(locations) && locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="overstock">Overstock</option>
            </select>
          </div>
          
          <div>
            <button 
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setLocationFilter('all')
                setStockFilter('all')
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Part Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Levels
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item, index) => {
                  const stockStatus = getStockStatus(item)
                  return (
                    <tr key={item._id || item.id || `item-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">#{item.partNumber || 'N/A'}</div>
                          <div className="text-xs text-gray-400 mt-1">{item.description || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Tag className="w-3 h-3" />
                            {item.category || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {typeof item.location === 'object' && item.location 
                              ? `${item.location.warehouse || ''} ${item.location.shelf || ''} ${item.location.bin || ''}`.trim()
                              : item.location || 'N/A'
                            }
                          </div>
                                                     <div className="text-xs text-gray-400">{typeof item.supplier === 'object' && item.supplier 
                             ? (item.supplier as any).name 
                             : item.supplier || 'N/A'
                           }</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            On Hand: {item.currentStock || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            Min: {item.minimumStock || 0} | Max: {item.maximumStock || 0}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (item.currentStock || 0) <= (item.minimumStock || 0) ? 'bg-red-500' :
                                (item.currentStock || 0) > (item.maximumStock || 0) ? 'bg-purple-500' :
                                'bg-green-500'
                              }`}
                              style={{ 
                                width: `${Math.min(((item.currentStock || 0) / (item.maximumStock || 1)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            Cost: ${(item.costPrice || 0).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-900">
                            Sell: ${(item.sellingPrice || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Value: ${(((item.currentStock || 0) * (item.costPrice || 0))).toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-900" title="View details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditItem(item)}
                            className="text-gray-600 hover:text-gray-900" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item)}
                            className="text-red-600 hover:text-red-900" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Inventory Transactions</h2>
          <p className="text-gray-600">Track all inventory movements and adjustments</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(transactions && Array.isArray(transactions) ? transactions : []).slice(0, 50).map((transaction, index) => {
                const item = (items && Array.isArray(items) ? items : []).find(i => (i._id || i.id) === transaction.itemId)
                return (
                  <tr key={transaction.id || `transaction-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item?.name || 'Unknown Item'}</div>
                        <div className="text-sm text-gray-500">#{item?.partNumber || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'purchase' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'usage' ? 'bg-red-100 text-red-800' :
                        transaction.type === 'adjustment' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.totalCost ? `$${(transaction.totalCost || 0).toFixed(2)}` : 
                         transaction.unitCost ? `$${(transaction.unitCost || 0).toFixed(2)} ea` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.reference}</div>
                      {transaction.notes && (
                        <div className="text-xs text-gray-500">{transaction.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.employeeName}</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSuppliers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Suppliers</h2>
          <p className="text-gray-600">Manage your parts suppliers and vendors</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={handleAddSupplier}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(suppliers && Array.isArray(suppliers) ? suppliers : []).filter(s => s.isActive).map((supplier, index) => (
          <div key={supplier.id || `supplier-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{supplier.name}</h3>
                                 <p className="text-sm text-gray-600">
                  {supplier.contactPerson?.name || 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < supplier.rating ? 'bg-yellow-400' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4">📧</span>
                <span className="text-gray-600">{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4">📞</span>
                <span className="text-gray-600">{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4">💰</span>
                <span className="text-gray-600">{supplier.paymentTerms}</span>
              </div>
            </div>
            
            {supplier.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{supplier.notes}</p>
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                                 {(items && Array.isArray(items) ? items : []).filter(item => 
                   typeof item.supplier === 'object' && item.supplier 
                     ? (item.supplier as any).name === supplier.name
                     : item.supplier === supplier.name
                 ).length} items
              </span>
                             <div className="flex gap-2">
                 <button 
                   onClick={() => handleEditSupplier(supplier)}
                   className="text-blue-600 hover:text-blue-900 text-sm"
                 >
                   Edit
                 </button>
                 <button 
                   onClick={() => handleDeleteSupplier(supplier)}
                   className="text-red-600 hover:text-red-900 text-sm"
                 >
                   Delete
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPurchaseOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Purchase Orders</h2>
          <p className="text-gray-600">Track and manage purchase orders</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={handleAddPurchaseOrder}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create PO
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PO Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(purchaseOrders && Array.isArray(purchaseOrders) ? purchaseOrders : []).map((po, index) => (
                <tr key={po.id || `po-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{po.poNumber || po.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {typeof po.supplier === 'object' && po.supplier 
                        ? (po.supplier as any).name 
                        : po.supplierName || po.supplier || 'N/A'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(po.orderDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{(po.items && Array.isArray(po.items) ? po.items : []).length} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${(po.total || 0).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      po.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      po.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      po.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                      po.status === 'received' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleEditPurchaseOrder(po)}
                         className="text-blue-600 hover:text-blue-900" 
                         title="Edit"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDeletePurchaseOrder(po)}
                         className="text-red-600 hover:text-red-900" 
                         title="Delete"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold mb-1">Inventory Management</h1>
            <p className="text-orange-100 text-base">Manage inventory, suppliers, and purchase orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const timestamp = new Date().toISOString().split('T')[0]
                if (activeTab === 'inventory') exportInventory(timestamp)
                else if (activeTab === 'transactions') exportTransactions(timestamp)
                else if (activeTab === 'suppliers') exportSuppliers(timestamp)
                else if (activeTab === 'purchase-orders') exportPurchaseOrders(timestamp)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => {
                if (activeTab === 'inventory') handleAddItem()
                else if (activeTab === 'suppliers') handleAddSupplier()
                else if (activeTab === 'purchase-orders') handleAddPurchaseOrder()
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-white/30 hover:border-white/50"
            >
              <Plus className="w-5 h-5" />
              {activeTab === 'inventory' ? 'Add Item' : 
               activeTab === 'suppliers' ? 'Add Supplier' : 'Add Purchase Order'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{(items && Array.isArray(items) ? items : []).filter(i => i.isActive).length}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Active Items</p>
            <p className="text-lg font-semibold text-orange-600">
              ${(items && Array.isArray(items) ? items : []).reduce((sum, item) => sum + (item.totalValue || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{(transactions && Array.isArray(transactions) ? transactions : []).length}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Transactions</p>
            <p className="text-lg font-semibold text-blue-600">This Month</p>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{(suppliers && Array.isArray(suppliers) ? suppliers : []).filter(s => s.isActive).length}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Active Suppliers</p>
            <p className="text-lg font-semibold text-emerald-600">Partners</p>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{(purchaseOrders && Array.isArray(purchaseOrders) ? purchaseOrders : []).length}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Purchase Orders</p>
            <p className="text-lg font-semibold text-purple-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-800">Inventory Management</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  dispatch(fetchInventoryItems({}))
                  dispatch(fetchInventoryTransactions({}))
                  dispatch(fetchSuppliers({}))
                  dispatch(fetchPurchaseOrders({}))
                }}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Refresh data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6">
            {[
              { key: 'inventory', label: 'Inventory', count: (items && Array.isArray(items) ? items : []).filter(i => i.isActive).length, icon: Package },
              { key: 'transactions', label: 'Transactions', count: (transactions && Array.isArray(transactions) ? transactions : []).length, icon: ClipboardList },
              { key: 'suppliers', label: 'Suppliers', count: (suppliers && Array.isArray(suppliers) ? suppliers : []).filter(s => s.isActive).length, icon: Users },
              { key: 'purchase-orders', label: 'Purchase Orders', count: (purchaseOrders && Array.isArray(purchaseOrders) ? purchaseOrders : []).length, icon: Truck }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'transactions' && renderTransactions()}
            {activeTab === 'suppliers' && renderSuppliers()}
            {activeTab === 'purchase-orders' && renderPurchaseOrders()}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddEditInventoryModal
        isOpen={isAddEditModalOpen}
        onClose={handleCloseAddEditModal}
        item={selectedItem}
        mode={modalMode}
      />

             <DeleteInventoryModal
         isOpen={isDeleteModalOpen}
         onClose={handleCloseDeleteModal}
         item={selectedItem}
       />

       {/* Supplier Modals */}
       <AddEditSupplierModal
         isOpen={isAddEditSupplierModalOpen}
         onClose={handleCloseAddEditSupplierModal}
         supplier={selectedSupplier}
         mode={supplierModalMode}
       />

       <DeleteSupplierModal
         isOpen={isDeleteSupplierModalOpen}
         onClose={handleCloseDeleteSupplierModal}
         supplier={selectedSupplier}
       />

       {/* Purchase Order Modals */}
       <AddEditPurchaseOrderModal
         isOpen={isAddEditPurchaseOrderModalOpen}
         onClose={handleCloseAddEditPurchaseOrderModal}
         purchaseOrder={selectedPurchaseOrder}
         mode={purchaseOrderModalMode}
       />

       <DeletePurchaseOrderModal
         isOpen={isDeletePurchaseOrderModalOpen}
         onClose={handleCloseDeletePurchaseOrderModal}
         purchaseOrder={selectedPurchaseOrder}
       />
     </div>
   )
 }
