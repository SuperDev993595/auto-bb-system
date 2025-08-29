import React from 'react';
import { X, DollarSign, Calendar, User, Package, FileText } from 'lucide-react';
import { SalesRecord } from '../../services/salesRecords';

interface ViewSalesRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesRecord: SalesRecord;
}

const ViewSalesRecordModal: React.FC<ViewSalesRecordModalProps> = ({
  isOpen,
  onClose,
  salesRecord
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sales Record Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{salesRecord.recordNumber}</h3>
                <p className="text-sm text-gray-600">Record Number</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{formatDate(salesRecord.saleDate)}</h3>
                <p className="text-sm text-gray-600">Sale Date</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{formatCurrency(salesRecord.total)}</h3>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Customer Information
            </h3>
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Customer Name</p>
                  <p className="text-gray-900">{salesRecord.customer.businessName || salesRecord.customer.contactPerson.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-gray-900">{salesRecord.customer.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Sales Details
            </h3>
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Sales Type</p>
                  <p className="text-gray-900 capitalize">{salesRecord.salesType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Sales Source</p>
                  <p className="text-gray-900 capitalize">{salesRecord.salesSource.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Sales Person</p>
                  <p className="text-gray-900">{salesRecord.salesPerson.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Items ({salesRecord.items.length})
            </h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {salesRecord.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

                     {/* Financial Summary */}
           <div className="border-t pt-6">
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
               <DollarSign className="w-5 h-5 text-green-600" />
               Financial Summary
             </h3>
             <div className="bg-white border rounded-lg p-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                   <div className="flex justify-between">
                     <span className="text-gray-700">Subtotal:</span>
                     <span className="font-medium">{formatCurrency(salesRecord.subtotal)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-700">Tax:</span>
                     <span className="font-medium">{formatCurrency(salesRecord.tax)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-700">Discount:</span>
                     <span className="font-medium">{formatCurrency(salesRecord.discount)}</span>
                   </div>
                   <div className="flex justify-between border-t pt-2">
                     <span className="text-lg font-semibold text-gray-900">Total:</span>
                     <span className="text-lg font-semibold text-gray-900">{formatCurrency(salesRecord.total)}</span>
                   </div>
                 </div>
                 <div className="space-y-3">
                   <div>
                     <p className="text-sm font-medium text-gray-700">Status</p>
                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(salesRecord.status)}`}>
                       {salesRecord.status}
                     </span>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-700">Payment Status</p>
                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(salesRecord.paymentStatus)}`}>
                       {salesRecord.paymentStatus}
                     </span>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Payment Information */}
           {salesRecord.paymentStatus === 'paid' && (
             <div className="border-t pt-6">
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                 <DollarSign className="w-5 h-5 text-blue-600" />
                 Payment Information
               </h3>
               <div className="bg-white border rounded-lg p-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <p className="text-sm font-medium text-gray-700">Payment Method</p>
                     <p className="text-gray-900 capitalize">{salesRecord.paymentMethod?.replace('_', ' ')}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-700">Payment Date</p>
                     <p className="text-gray-900">{salesRecord.paymentDate ? formatDate(salesRecord.paymentDate) : 'N/A'}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-700">Payment Reference</p>
                     <p className="text-gray-900">{salesRecord.paymentReference || 'N/A'}</p>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* Lead Conversion */}
           {salesRecord.convertedFromLead && (
             <div className="border-t pt-6">
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                 <User className="w-5 h-5 text-purple-600" />
                 Lead Conversion
               </h3>
               <div className="bg-white border rounded-lg p-4">
                 <div className="space-y-2">
                   <div>
                     <p className="text-sm font-medium text-gray-700">Converted from Lead</p>
                     <p className="text-gray-900">Yes</p>
                   </div>
                   {salesRecord.originalLeadId && (
                     <div>
                       <p className="text-sm font-medium text-gray-700">Original Lead ID</p>
                       <p className="text-gray-900">{salesRecord.originalLeadId}</p>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           )}

           {/* Follow-up Information */}
           {(salesRecord.nextFollowUp || salesRecord.followUpStatus) && (
             <div className="border-t pt-6">
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-orange-600" />
                 Follow-up Information
               </h3>
               <div className="bg-white border rounded-lg p-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {salesRecord.nextFollowUp && (
                     <div>
                       <p className="text-sm font-medium text-gray-700">Next Follow-up Date</p>
                       <p className="text-gray-900">{formatDate(salesRecord.nextFollowUp)}</p>
                     </div>
                   )}
                   {salesRecord.followUpStatus && (
                     <div>
                       <p className="text-sm font-medium text-gray-700">Follow-up Status</p>
                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(salesRecord.followUpStatus)}`}>
                         {salesRecord.followUpStatus}
                       </span>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           )}

           {/* Customer Satisfaction */}
           {salesRecord.customerSatisfaction && (
             <div className="border-t pt-6">
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                 <User className="w-5 h-5 text-yellow-600" />
                 Customer Satisfaction
               </h3>
               <div className="bg-white border rounded-lg p-4">
                 <div className="space-y-3">
                   {salesRecord.customerSatisfaction.rating && (
                     <div>
                       <p className="text-sm font-medium text-gray-700">Rating</p>
                       <div className="flex items-center gap-2">
                         <span className="text-lg font-semibold text-gray-900">{salesRecord.customerSatisfaction.rating}/5</span>
                         <div className="flex">
                           {[1, 2, 3, 4, 5].map((star) => (
                             <span
                               key={star}
                               className={`text-lg ${star <= (salesRecord.customerSatisfaction.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                             >
                               ★
                             </span>
                           ))}
                         </div>
                       </div>
                     </div>
                   )}
                   {salesRecord.customerSatisfaction.feedback && (
                     <div>
                       <p className="text-sm font-medium text-gray-700">Feedback</p>
                       <p className="text-gray-900">{salesRecord.customerSatisfaction.feedback}</p>
                     </div>
                   )}
                   {salesRecord.customerSatisfaction.date && (
                     <div>
                       <p className="text-sm font-medium text-gray-700">Feedback Date</p>
                       <p className="text-gray-900">{formatDate(salesRecord.customerSatisfaction.date)}</p>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           )}

           {/* Warranty Information */}
           {salesRecord.warranty?.hasWarranty && (
             <div className="border-t pt-6">
               <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                 <Package className="w-5 h-5 text-green-600" />
                 Warranty Information
               </h3>
               <div className="bg-white border rounded-lg p-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {salesRecord.warranty.warrantyPeriod && (
                     <div>
                       <p className="text-sm font-medium text-gray-700">Warranty Period</p>
                       <p className="text-gray-900">{salesRecord.warranty.warrantyPeriod} months</p>
                     </div>
                   )}
                   {salesRecord.warranty.warrantyExpiry && (
                     <div>
                       <p className="text-sm font-medium text-gray-700">Warranty Expiry</p>
                       <p className="text-gray-900">{formatDate(salesRecord.warranty.warrantyExpiry)}</p>
                     </div>
                   )}
                   {salesRecord.warranty.warrantyNotes && (
                     <div>
                       <p className="text-sm font-medium text-gray-700">Warranty Notes</p>
                       <p className="text-gray-900">{salesRecord.warranty.warrantyNotes}</p>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           )}

          {/* Notes */}
          {salesRecord.notes && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Notes
              </h3>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{salesRecord.notes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              Record Information
            </h3>
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-gray-900">{formatDate(salesRecord.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Updated</p>
                  <p className="text-gray-900">{formatDate(salesRecord.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSalesRecordModal;
