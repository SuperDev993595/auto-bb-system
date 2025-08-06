import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import { 
  adjustInventoryQuantity,
  updatePurchaseOrderStatus,
  addPurchaseOrder,
  type Supplier,
  type PurchaseOrder
} from '../redux/reducer/inventoryReducer'
import { InventoryItem, InventoryTransaction } from '../utils/CustomerTypes'
import PageTitle from '../components/Shared/PageTitle'
import {
  HiCube,
  HiTruck,
  HiUsers,
  HiClipboardList,
  HiExclamation,
  HiTrendingDown,
  HiTrendingUp,
  HiSearch,
  HiFilter,
  HiPlus,
  HiEye,
  HiPencil,
  HiTrash,
  HiDownload,
  HiUpload,
  HiRefresh,
  HiLocationMarker,
  HiTag
} from 'react-icons/hi'

type TabType = 'inventory' | 'transactions' | 'suppliers' | 'purchase-orders'

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('inventory')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  
  const { items, transactions, suppliers, purchaseOrders, categories, locations } = useAppSelector(state => state.inventory)
  const dispatch = useAppDispatch()

  // Filter inventory items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && item.quantityOnHand <= item.minStockLevel) ||
                        (stockFilter === 'out' && item.quantityOnHand === 0) ||
                        (stockFilter === 'overstock' && item.quantityOnHand > item.maxStockLevel)
    
    return matchesSearch && matchesCategory && matchesLocation && matchesStock && item.isActive
  })

  // Calculate metrics
  const lowStockItems = items.filter(item => item.quantityOnHand <= item.minStockLevel && item.isActive)
  const outOfStockItems = items.filter(item => item.quantityOnHand === 0 && item.isActive)
  const totalValue = items.reduce((sum, item) => sum + (item.quantityOnHand * item.costPrice), 0)
  const pendingOrders = purchaseOrders.filter(po => po.status === 'sent' || po.status === 'confirmed')

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantityOnHand === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' }
    if (item.quantityOnHand <= item.minStockLevel) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' }
    if (item.quantityOnHand > item.maxStockLevel) return { status: 'Overstock', color: 'text-purple-600 bg-purple-100' }
    return { status: 'In Stock', color: 'text-green-600 bg-green-100' }
  }

  const handleQuantityAdjustment = (itemId: string, newQuantity: number, reason: string) => {
    dispatch(adjustInventoryQuantity({ itemId, newQuantity, reason }))
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
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <HiDownload className="w-4 h-4" />
            Export
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <HiPlus className="w-4 h-4" />
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
              <p className="text-2xl font-bold text-gray-900">{items.filter(i => i.isActive).length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <HiCube className="w-6 h-6 text-blue-600" />
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
              <HiExclamation className="w-6 h-6 text-yellow-600" />
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
              <HiTrendingDown className="w-6 h-6 text-red-600" />
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
              <HiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="flex-1">
            <div className="relative">
              <HiSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
              {categories.map(category => (
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
              {locations.map(location => (
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
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
              <HiRefresh className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
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
              {filteredItems.map(item => {
                const stockStatus = getStockStatus(item)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">#{item.partNumber}</div>
                        <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <HiTag className="w-3 h-3" />
                          {item.category}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <HiLocationMarker className="w-3 h-3" />
                          {item.location}
                        </div>
                        <div className="text-xs text-gray-400">{item.supplier}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          On Hand: {item.quantityOnHand}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {item.minStockLevel} | Max: {item.maxStockLevel}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.quantityOnHand <= item.minStockLevel ? 'bg-red-500' :
                              item.quantityOnHand > item.maxStockLevel ? 'bg-purple-500' :
                              'bg-green-500'
                            }`}
                            style={{ 
                              width: `${Math.min((item.quantityOnHand / item.maxStockLevel) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          Cost: ${item.costPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-900">
                          Sell: ${item.sellPrice.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Value: ${(item.quantityOnHand * item.costPrice).toFixed(2)}
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
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Edit">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900" title="Adjust quantity">
                          <HiRefresh className="w-4 h-4" />
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
    </div>
  )

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Inventory Transactions</h2>
          <p className="text-gray-600">Track all inventory movements and adjustments</p>
        </div>
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
              {transactions.slice(0, 50).map(transaction => {
                const item = items.find(i => i.id === transaction.itemId)
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
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
                        {transaction.totalCost ? `$${transaction.totalCost.toFixed(2)}` : 
                         transaction.unitCost ? `$${transaction.unitCost.toFixed(2)} ea` : '-'}
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
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <HiPlus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.filter(s => s.isActive).map(supplier => (
          <div key={supplier.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{supplier.name}</h3>
                <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
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
                {items.filter(item => item.supplier === supplier.name).length} items
              </span>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-900 text-sm">Edit</button>
                <button className="text-green-600 hover:text-green-900 text-sm">Order</button>
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
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <HiPlus className="w-4 h-4" />
          Create PO
        </button>
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
              {purchaseOrders.map(po => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{po.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{po.supplierName}</div>
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
                    <div className="text-sm text-gray-900">{po.items.length} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${po.total.toFixed(2)}</div>
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
                      <button className="text-blue-600 hover:text-blue-900" title="View">
                        <HiEye className="w-4 h-4" />
                      </button>
                      {po.status !== 'received' && (
                        <button className="text-green-600 hover:text-green-900" title="Mark received">
                          <HiDownload className="w-4 h-4" />
                        </button>
                      )}
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
    <div className="p-6 space-y-6">
      <PageTitle title="Inventory Management" />

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'inventory', label: 'Inventory', count: items.filter(i => i.isActive).length, icon: HiCube },
              { key: 'transactions', label: 'Transactions', count: transactions.length, icon: HiClipboardList },
              { key: 'suppliers', label: 'Suppliers', count: suppliers.filter(s => s.isActive).length, icon: HiUsers },
              { key: 'purchase-orders', label: 'Purchase Orders', count: purchaseOrders.length, icon: HiTruck }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'inventory' && renderInventory()}
          {activeTab === 'transactions' && renderTransactions()}
          {activeTab === 'suppliers' && renderSuppliers()}
          {activeTab === 'purchase-orders' && renderPurchaseOrders()}
        </div>
      </div>
    </div>
  )
}
