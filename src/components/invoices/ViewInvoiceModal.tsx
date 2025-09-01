import React from 'react'
import { Invoice } from '../../redux/reducer/invoicesReducer'
import ModalWrapper from '../../utils/ModalWrapper'
import { HiDocumentText, HiUser, HiTruck, HiCalendar, HiCurrencyDollar, HiCheck, HiX, HiDownload, HiMail } from 'react-icons/hi'

interface ViewInvoiceModalProps {
  invoice: Invoice | null
  onClose: () => void
  onDownload?: (id: string) => void
  onSendEmail?: (id: string) => void
}

const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({ invoice, onClose, onDownload, onSendEmail }) => {
  if (!invoice) return null

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const customerName = typeof invoice.customerId === 'object' ? invoice.customerId.name : 
                      invoice.customer?.name || invoice.customerName || 'Customer not available'
  
  const vehicleInfo = typeof invoice.vehicleId === 'object' ? invoice.vehicleId.fullName :
                     invoice.vehicle?.fullName || invoice.vehicleInfo || 'Vehicle info not available'

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Invoice Details"
      submitText="Close"
      onSubmit={onClose}
      submitColor="bg-blue-600"

    >
      <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Invoice #{invoice.invoiceNumber || invoice._id}
              </h3>
              <p className="text-sm text-gray-600">
                Automotive Service
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                <span className="capitalize">{invoice.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <HiUser className="w-5 h-5 text-blue-600 mr-2" />
              <h6 className="font-semibold text-gray-900">Customer Information</h6>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {customerName}</p>
              {typeof invoice.customerId === 'object' && (
                <>
                  <p><span className="font-medium">Email:</span> {invoice.customerId.email}</p>
                  <p><span className="font-medium">Phone:</span> {invoice.customerId.phone}</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <HiTruck className="w-5 h-5 text-green-600 mr-2" />
              <h6 className="font-semibold text-gray-900">Vehicle Information</h6>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Vehicle:</span> {vehicleInfo}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <HiCalendar className="w-5 h-5 text-purple-600 mr-2" />
            <h6 className="font-semibold text-gray-900">Important Dates</h6>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Created Date</p>
              <p className="text-gray-900">{new Date(invoice.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Due Date</p>
              <p className="text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
            {invoice.paidDate && (
              <div>
                <p className="font-medium text-gray-700">Paid Date</p>
                <p className="text-green-600">{new Date(invoice.paidDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <HiCurrencyDollar className="w-5 h-5 text-green-600 mr-2" />
            <h6 className="font-semibold text-gray-900">Financial Summary</h6>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">${invoice.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-lg text-gray-900">${invoice.total.toFixed(2)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-medium text-green-600">${invoice.paidAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h6 className="font-semibold text-gray-900 mb-2">Notes</h6>
            <p className="text-sm text-gray-700">{invoice.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onDownload && (
            <button
              onClick={() => onDownload(invoice._id)}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <HiDownload className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          )}
          {onSendEmail && (
            <button
              onClick={() => onSendEmail(invoice._id)}
              className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <HiMail className="w-4 h-4 mr-2" />
              Send Email
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  )
}

export default ViewInvoiceModal
