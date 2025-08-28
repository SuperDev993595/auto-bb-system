import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import AddEditWarrantyModal from '../components/Warranty/AddEditWarrantyModal'
import DeleteWarrantyModal from '../components/Warranty/DeleteWarrantyModal'
import WarrantyClaimModal from '../components/Warranty/WarrantyClaimModal'
import WarrantyStats from '../components/Warranty/WarrantyStats'
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  DollarSign,
  Calendar,
  Eye
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

interface WarrantyCardProps {
  warranty: Warranty
  onEdit: (warranty: Warranty) => void
  onDelete: (warranty: Warranty) => void
  onAddClaim: (warranty: Warranty) => void
}

const WarrantyCard: React.FC<WarrantyCardProps> = ({
  warranty,
  onEdit,
  onDelete,
  onAddClaim
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="w-4 h-4" />, label: 'Active' }
      case 'expired':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="w-4 h-4" />, label: 'Expired' }
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <XCircle className="w-4 h-4" />, label: 'Cancelled' }
      case 'suspended':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <AlertTriangle className="w-4 h-4" />, label: 'Suspended' }
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <Shield className="w-4 h-4" />, label: 'Unknown' }
    }
  }

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

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const statusConfig = getStatusConfig(warranty.status)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getTypeIcon(warranty.warrantyType)}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{warranty.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddClaim(warranty)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Add Claim"
            >
              <DollarSign className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(warranty)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(warranty)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{warranty.description}</p>

        {/* Customer & Vehicle */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">{warranty.customer.name}</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{warranty.customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Car className="w-4 h-4" />
            <span>{warranty.vehicle.year} {warranty.vehicle.make} {warranty.vehicle.model}</span>
          </div>
        </div>

        {/* Coverage Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Expires {new Date(warranty.endDate).toLocaleDateString()}</span>
            </div>
            {warranty.mileageLimit && (
              <div className="flex items-center gap-1 text-gray-600">
                <Car className="w-4 h-4" />
                <span>{warranty.currentMileage.toLocaleString()}/{warranty.mileageLimit.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="font-medium text-gray-900">${warranty.deductible}</div>
            <div className="text-xs text-gray-500">Deductible</div>
          </div>
        </div>
      </div>

      {/* Claims & Coverage */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-gray-900 text-sm mb-2">Claims</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Claims:</span>
                <span className="font-medium">{warranty.totalClaims}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">${warranty.totalClaimAmount.toLocaleString()}</span>
              </div>
              {warranty.maxClaimAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Claim:</span>
                  <span className="font-medium">${warranty.maxClaimAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 text-sm mb-2">Coverage</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(warranty.coverage).slice(0, 6).map(([key, covered]) => (
                <div key={key} className="flex items-center gap-1">
                  {covered ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="text-gray-600 capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isExpiringSoon(warranty.endDate) && (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <Clock className="w-3 h-3" />
                  <span>Expiring soon</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Provider: {warranty.provider.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WarrantyManagementPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [stats, setStats] = useState<WarrantyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

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

  const handleEdit = (warranty: Warranty) => {
    setSelectedWarranty(warranty)
    setShowEditModal(true)
  }

  const handleDelete = (warranty: Warranty) => {
    setSelectedWarranty(warranty)
    setShowDeleteModal(true)
  }

  const handleClaim = (warranty: Warranty) => {
    setSelectedWarranty(warranty)
    setShowClaimModal(true)
  }

  // Calculate stats
  const warrantyStats = {
    total: warranties.length,
    active: warranties.filter(w => w.status === 'active').length,
    expired: warranties.filter(w => w.status === 'expired').length,
    expiringSoon: warranties.filter(w => {
      const end = new Date(w.endDate)
      const now = new Date()
      const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }).length
  }

  if (loading && warranties.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warranty Management</h1>
          <p className="text-gray-600">Manage vehicle warranties and coverage</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchWarranties}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Warranty</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Warranties</p>
              <p className="text-2xl font-bold text-gray-900">{warrantyStats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{warrantyStats.active}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">{warrantyStats.expired}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">{warrantyStats.expiringSoon}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="extended">Extended</option>
              <option value="powertrain">Powertrain</option>
              <option value="bumper_to_bumper">Bumper to Bumper</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search warranties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Warranties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredWarranties.map((warranty) => (
          <WarrantyCard
            key={warranty._id}
            warranty={warranty}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddClaim={handleClaim}
          />
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredWarranties.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No warranties found</p>
          <p className="text-gray-400 mb-4">
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
