import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign,
  Calendar,
  User,
  Package,
  RefreshCw
} from '../utils/icons';
import { useAppSelector, useAppDispatch } from '../redux';
import { 
  fetchSalesRecords, 
  deleteSalesRecordAction 
} from '../redux/actions/salesRecords';
import { SalesRecord } from '../services/salesRecords';
import CreateSalesRecordModal from '../components/SalesRecords/CreateSalesRecordModal';
import EditSalesRecordModal from '../components/SalesRecords/EditSalesRecordModal';
import DeleteSalesRecordModal from '../components/SalesRecords/DeleteSalesRecordModal';
import ViewSalesRecordModal from '../components/SalesRecords/ViewSalesRecordModal';

export default function SalesRecordsPage() {
  const dispatch = useAppDispatch();
  const { salesRecords, loading, pagination } = useAppSelector(state => state.salesRecords);
  
  // State for filters and modals
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [salesTypeFilter, setSalesTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Load sales records on component mount
  useEffect(() => {
    loadSalesRecords();
  }, [currentPage, statusFilter, paymentStatusFilter, salesTypeFilter, searchTerm]);

  const loadSalesRecords = () => {
    const params: any = {
      page: currentPage,
      limit: 10
    };

    if (statusFilter !== 'all') params.status = statusFilter;
    if (paymentStatusFilter !== 'all') params.paymentStatus = paymentStatusFilter;
    if (salesTypeFilter !== 'all') params.salesType = salesTypeFilter;
    if (searchTerm) params.search = searchTerm;

    dispatch(fetchSalesRecords(params));
  };

  const handleCreateRecord = () => {
    setShowCreateModal(true);
  };

  const handleEditRecord = (record: SalesRecord) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const handleViewRecord = (record: SalesRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleDeleteRecord = (record: SalesRecord) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRecord) {
      try {
        await dispatch(deleteSalesRecordAction(selectedRecord._id)).unwrap();
        setShowDeleteModal(false);
        setSelectedRecord(null);
        loadSalesRecords();
      } catch (error) {
        console.error('Error deleting sales record:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSalesTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="w-4 h-4" />;
      case 'service': return <DollarSign className="w-4 h-4" />;
      case 'package': return <Package className="w-4 h-4" />;
      case 'consultation': return <User className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && salesRecords.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading sales records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Records</h1>
            <p className="text-gray-600">Manage and track all sales transactions</p>
          </div>
          <button
            onClick={handleCreateRecord}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Sales Record
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(salesRecords.reduce((sum, record) => sum + record.total, 0))}
            </p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>

          <div className="card p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{salesRecords.length}</p>
            <p className="text-sm text-gray-600">Total Records</p>
          </div>

          <div className="card p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl mx-auto mb-4">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {salesRecords.filter(r => r.paymentStatus === 'paid').length}
            </p>
            <p className="text-sm text-gray-600">Paid Records</p>
          </div>

          <div className="card p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mx-auto mb-4">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(salesRecords.map(r => r.customer._id)).size}
            </p>
            <p className="text-sm text-gray-600">Unique Customers</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="form-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Sales Type</label>
            <select
              value={salesTypeFilter}
              onChange={(e) => setSalesTypeFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Types</option>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="package">Package</option>
              <option value="consultation">Consultation</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search records..."
              className="form-input"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('all');
                setPaymentStatusFilter('all');
                setSalesTypeFilter('all');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Sales Records Table */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Sales Records</h2>
            <div className="text-sm text-gray-500">
              Showing {salesRecords.length} of {pagination.totalRecords} records
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header-cell">Record #</th>
                <th className="table-header-cell">Customer</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Items</th>
                <th className="table-header-cell">Total</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Payment</th>
                <th className="table-header-cell">Date</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No sales records found. Create your first sales record to get started.
                  </td>
                </tr>
              ) : (
                salesRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="text-xs font-medium text-gray-900">{record.recordNumber}</div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="text-xs font-medium text-gray-900">
                          {record.customer?.businessName || record.customer?.contactPerson?.name || 'Unknown Customer'}
                        </div>
                        <div className="text-xs text-gray-500">{record.customer?.email || 'No email'}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {getSalesTypeIcon(record.salesType)}
                        <span className="text-xs text-gray-900 capitalize">{record.salesType}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-xs text-gray-900">
                        {record.items.length} item{record.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.items[0]?.name}
                        {record.items.length > 1 && ` +${record.items.length - 1} more`}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-xs font-medium text-gray-900">
                        {formatCurrency(record.total)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(record.paymentStatus)}`}>
                        {record.paymentStatus}
                      </span>
                    </td>
                    <td className="table-cell text-xs text-gray-500">
                      {formatDate(record.saleDate)}
                    </td>
                    <td className="table-cell text-right text-xs font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewRecord(record)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Edit Record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateSalesRecordModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadSalesRecords();
        }}
      />

      {selectedRecord && (
        <>
          <EditSalesRecordModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRecord(null);
            }}
            onSave={() => {
              setShowEditModal(false);
              setSelectedRecord(null);
              loadSalesRecords();
            }}
            salesRecord={selectedRecord}
          />

          <DeleteSalesRecordModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedRecord(null);
            }}
            onDelete={handleDeleteConfirm}
            salesRecord={selectedRecord}
          />

          <ViewSalesRecordModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedRecord(null);
            }}
            salesRecord={selectedRecord}
          />
        </>
      )}
    </div>
  );
}
