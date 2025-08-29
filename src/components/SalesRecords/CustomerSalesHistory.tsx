import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  DollarSign, 
  Calendar, 
  Package, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2
} from '../utils/icons';
import { 
  fetchCustomerSalesRecords, 
  deleteSalesRecordAction 
} from '../../redux/actions/salesRecords';
import { SalesRecord } from '../../services/salesRecords';
import ViewSalesRecordModal from './ViewSalesRecordModal';
import EditSalesRecordModal from './EditSalesRecordModal';
import DeleteSalesRecordModal from './DeleteSalesRecordModal';

interface CustomerSalesHistoryProps {
  customerId: string;
  customerName: string;
}

const CustomerSalesHistory: React.FC<CustomerSalesHistoryProps> = ({
  customerId,
  customerName
}) => {
  const dispatch = useDispatch();
  const { customerSalesRecords, customerPagination, loading } = useSelector((state: any) => state.salesRecords);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);

  useEffect(() => {
    if (customerId) {
      loadCustomerSalesRecords();
    }
  }, [customerId, currentPage]);

  const loadCustomerSalesRecords = () => {
    dispatch(fetchCustomerSalesRecords({ 
      customerId, 
      params: { page: currentPage, limit: 10 } 
    }));
  };

  const handleViewRecord = (record: SalesRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEditRecord = (record: SalesRecord) => {
    setSelectedRecord(record);
    setShowEditModal(true);
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
        loadCustomerSalesRecords();
      } catch (error) {
        console.error('Error deleting sales record:', error);
      }
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

  // Calculate customer sales statistics
  const totalSales = customerSalesRecords.length;
  const totalRevenue = customerSalesRecords.reduce((sum: number, record: SalesRecord) => sum + record.total, 0);
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;
  const paidSales = customerSalesRecords.filter((record: SalesRecord) => record.paymentStatus === 'paid').length;

  if (loading && customerSalesRecords.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sales History</h3>
          <p className="text-sm text-gray-600">Complete sales record for {customerName}</p>
        </div>
      </div>

      {/* Sales Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-lg font-semibold text-gray-900">{totalSales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Average Sale</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(averageSale)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Paid Sales</p>
              <p className="text-lg font-semibold text-gray-900">{paidSales}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">Sales Records</h4>
        </div>

        {customerSalesRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No sales records found for this customer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerSalesRecords.map((record: SalesRecord) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.recordNumber}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(record.saleDate)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.items.length} item{record.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.items[0]?.name}
                        {record.items.length > 1 && ` +${record.items.length - 1} more`}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(record.total)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(record.paymentStatus)}`}>
                        {record.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {customerPagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {customerPagination.currentPage} of {customerPagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(customerPagination.totalPages, currentPage + 1))}
                  disabled={currentPage === customerPagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedRecord && (
        <>
          <ViewSalesRecordModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedRecord(null);
            }}
            salesRecord={selectedRecord}
          />

          <EditSalesRecordModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRecord(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedRecord(null);
              loadCustomerSalesRecords();
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
        </>
      )}
    </div>
  );
};

export default CustomerSalesHistory;
