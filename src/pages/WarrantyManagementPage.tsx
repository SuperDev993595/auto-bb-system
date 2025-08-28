import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import PageTitle from '../components/Shared/PageTitle'
import AddEditWarrantyModal from '../components/Warranty/AddEditWarrantyModal'
import DeleteWarrantyModal from '../components/Warranty/DeleteWarrantyModal'
import WarrantyClaimModal from '../components/Warranty/WarrantyClaimModal'
import WarrantyStats from '../components/Warranty/WarrantyStats'
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  DollarSign,
  Calendar
} from '../utils/icons'
import api from '../services/api'

interface Warranty {
  _id: string
  customer: {
    _id: string
    name: string
    email: string
    phone: string
  }
  vehicle: {
    _id: string
    make: string
    model: string
    year: number
    vin: string
    mileage: number
  }
  warrantyType: 'manufacturer' | 'extended' | 'powertrain' | 'bumper_to_bumper' | 'custom'
  name: string
  description: string
  startDate: string
  endDate: string
  mileageLimit?: number
  currentMileage: number
  coverage: {
    engine: boolean
    transmission: boolean
    electrical: boolean
    suspension: boolean
    brakes: boolean
    cooling: boolean
    fuel: boolean
    exhaust: boolean
    interior: boolean
    exterior: boolean
  }
  deductible: number
  maxClaimAmount?: number
  totalClaims: number
  totalClaimAmount: number
  status: 'active' | 'expired' | 'cancelled' | 'suspended'
  provider: {
    name: string
    contact: {
      phone: string
      email: string
      address: string
    }
  }
  terms: string
  exclusions: string[]
  notes: string
  createdBy: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface WarrantyStats {
  totalWarranties: number
  activeWarranties: number
  expiringSoon: number
  mileageExpiring: number
  statusBreakdown: Array<{
    _id: string
    count: number
    totalClaims: number
    totalClaimAmount: number
  }>
}

export default function WarrantyManagementPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [stats, setStats] = useState<WarrantyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [customerFilter, setCustomerFilter] = useState('')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null)

  // Fetch warranties
  const fetchWarranties = async () => {
    try {
      setLoading(true)
      const response = await api.get('/warranties')
      setWarranties(response.data)
    } catch (error) {
      console.error('Error fetching warranties:', error)
      toast.error('Failed to fetch warranties')
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/warranties/stats/overview')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching warranty stats:', error)
    }
  }

  useEffect(() => {
    fetchWarranties()
    fetchStats()
  }, [])

  // Filter warranties
  const filteredWarranties = warranties.filter(warranty => {
    const matchesSearch = warranty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || warranty.status === statusFilter
    const matchesType = typeFilter === 'all' || warranty.warrantyType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Handle warranty operations
  const handleCreateWarranty = async (warrantyData: any) => {
    try {
      await api.post('/warranties', warrantyData)
      toast.success('Warranty created successfully')
      fetchWarranties()
      fetchStats()
      setShowAddModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create warranty')
    }
  }

  const handleUpdateWarranty = async (warrantyData: any) => {
    if (!selectedWarranty) return
    
    try {
      await api.put(`/warranties/${selectedWarranty._id}`, warrantyData)
      toast.success('Warranty updated successfully')
      fetchWarranties()
      fetchStats()
      setShowEditModal(false)
      setSelectedWarranty(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update warranty')
    }
  }

  const handleDeleteWarranty = async () => {
    if (!selectedWarranty) return
    
    try {
      await api.delete(`/warranties/${selectedWarranty._id}`)
      toast.success('Warranty deleted successfully')
      fetchWarranties()
      fetchStats()
      setShowDeleteModal(false)
      setSelectedWarranty(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete warranty')
    }
  }

  const handleAddClaim = async (claimData: any) => {
    if (!selectedWarranty) return
    
    try {
      await api.patch(`/warranties/${selectedWarranty._id}/claim`, claimData)
      toast.success('Claim added successfully')
      fetchWarranties()
      fetchStats()
      setShowClaimModal(false)
      setSelectedWarranty(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add claim')
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'manufacturer':
        return <Shield className="w-5 h-5 text-blue-500" />
      case 'extended':
        return <Shield className="w-5 h-5 text-green-500" />
      case 'powertrain':
        return <Car className="w-5 h-5 text-purple-500" />
      case 'bumper_to_bumper':
        return <Shield className="w-5 h-5 text-orange-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  // Check if warranty is expiring soon
  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Warranty Management" subtitle="Manage vehicle warranties and coverage" />
      
      {/* Statistics */}
      {stats && <WarrantyStats stats={stats} />}

      {/* Header with actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Warranty
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search warranties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="suspended">Suspended</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="extended">Extended</option>
                <option value="powertrain">Powertrain</option>
                <option value="bumper_to_bumper">Bumper to Bumper</option>
                <option value="custom">Custom</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warranties Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warranty Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage & Limits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claims
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
                {filteredWarranties.map((warranty) => (
                  <tr key={warranty._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(warranty.warrantyType)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{warranty.name}</div>
                          <div className="text-sm text-gray-500">{warranty.warrantyType.replace('_', ' ')}</div>
                          {isExpiringSoon(warranty.endDate) && (
                            <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                              <Clock className="w-3 h-3" />
                              Expiring soon
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{warranty.customer.name}</div>
                        <div className="text-sm text-gray-500">{warranty.customer.email}</div>
                        <div className="text-sm text-gray-500">
                          {warranty.vehicle.year} {warranty.vehicle.make} {warranty.vehicle.model}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>Start: {new Date(warranty.startDate).toLocaleDateString()}</div>
                        <div>End: {new Date(warranty.endDate).toLocaleDateString()}</div>
                        {warranty.mileageLimit && (
                          <div className="text-gray-500">
                            Mileage: {warranty.currentMileage.toLocaleString()}/{warranty.mileageLimit.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>Claims: {warranty.totalClaims}</div>
                        <div className="text-gray-500">
                          Total: ${warranty.totalClaimAmount.toLocaleString()}
                        </div>
                        {warranty.maxClaimAmount && (
                          <div className="text-xs text-gray-400">
                            Max: ${warranty.maxClaimAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(warranty.status)}`}>
                        {warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedWarranty(warranty)
                            setShowClaimModal(true)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Add Claim"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWarranty(warranty)
                            setShowEditModal(true)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWarranty(warranty)
                            setShowDeleteModal(true)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
      )}

      {/* Empty State */}
      {!loading && filteredWarranties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Shield className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No warranties found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first warranty.'}
          </p>
          {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create First Warranty
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddEditWarrantyModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateWarranty}
          mode="create"
        />
      )}

      {showEditModal && selectedWarranty && (
        <AddEditWarrantyModal
          onClose={() => {
            setShowEditModal(false)
            setSelectedWarranty(null)
          }}
          onSubmit={handleUpdateWarranty}
          mode="edit"
          warranty={selectedWarranty}
        />
      )}

      {showDeleteModal && selectedWarranty && (
        <DeleteWarrantyModal
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedWarranty(null)
          }}
          onConfirm={handleDeleteWarranty}
          warranty={selectedWarranty}
        />
      )}

      {showClaimModal && selectedWarranty && (
        <WarrantyClaimModal
          onClose={() => {
            setShowClaimModal(false)
            setSelectedWarranty(null)
          }}
          onSubmit={handleAddClaim}
          warranty={selectedWarranty}
        />
      )}
    </div>
  )
}
