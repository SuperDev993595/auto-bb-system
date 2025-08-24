import { useState, useEffect } from 'react'
import { Customer } from '../../../services/customers'
import { customerService } from '../../../services/customers'
import Pagination from '../../../utils/Pagination'
import PostPaymentModal from '../modal/PostPaymentModal'
import { DollarSign, Trash2 } from '../../../utils/icons'
import { toast } from 'react-hot-toast'

interface Payment {
    _id: string
    amount: number
    date: string
    method: string
    reference?: string
    notes?: string
    status: string
    createdAt: string
}

export default function PaymentsSection({ customer }: { customer: Customer }) {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalPayments: 0,
        hasNextPage: false,
        hasPrevPage: false
    })
    const itemsPerPage = 8

    // Fetch payments
    const fetchPayments = async () => {
        const customerId = customer._id || customer.id
        if (!customerId) {
            toast.error('Customer ID is required')
            return
        }
        
        setLoading(true)
        try {
            const response = await customerService.getCustomerPayments(customerId, {
                page: currentPage,
                limit: itemsPerPage,
                sortBy: 'date',
                sortOrder: 'desc'
            })
            setPayments(response.data.payments)
            setPagination(response.data.pagination)
        } catch (error: any) {
            toast.error('Failed to fetch payments')
            console.error('Error fetching payments:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments()
    }, [customer._id, customer.id, currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handlePaymentSuccess = () => {
        fetchPayments()
    }

    const handleDeletePayment = async (paymentId: string) => {
        if (!window.confirm('Are you sure you want to delete this payment?')) {
            return
        }

        const customerId = customer._id || customer.id
        if (!customerId) {
            toast.error('Customer ID is required')
            return
        }
        
        try {
            await customerService.deletePayment(customerId, paymentId)
            toast.success('Payment deleted successfully')
            fetchPayments()
        } catch (error: any) {
            toast.error('Failed to delete payment')
            console.error('Error deleting payment:', error)
        }
    }

    const formatMethod = (method: string) => {
        const methodMap: { [key: string]: string } = {
            'cash': 'Cash',
            'card': 'Card',
            'check': 'Check',
            'bank_transfer': 'Bank Transfer',
            'online': 'Online',
            'other': 'Other'
        }
        return methodMap[method] || method
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            case 'refunded':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div>
            {open && (
                <PostPaymentModal 
                    customerId={customer._id || customer.id || ''}
                    onClose={() => setOpen(false)} 
                    onSuccess={handlePaymentSuccess}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="text-green-600 w-5 h-5" />
                    </div>
                    Payment History
                    {pagination.totalPayments > 0 && (
                        <span className="text-sm text-gray-500">
                            ({pagination.totalPayments} payments)
                        </span>
                    )}
                </h3>
                <button 
                    onClick={() => setOpen(true)} 
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                    + Add Payment
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : payments.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {payments.map((payment) => (
                            <div key={payment._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <span className="font-bold text-green-700 text-xl">
                                            ${payment.amount.toFixed(2)}
                                        </span>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg">
                                                {formatMethod(payment.method)}
                                            </span>
                                            <span className={`text-xs px-3 py-1.5 rounded-lg ${getStatusColor(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePayment(payment._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                        title="Delete Payment"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    📅 {new Date(payment.date).toLocaleDateString()}
                                </p>
                                {payment.reference && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        Ref: {payment.reference}
                                    </p>
                                )}
                                {payment.notes && (
                                    <p className="text-sm italic text-gray-500">
                                        {payment.notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {pagination.totalPages > 1 && (
                        <Pagination 
                            currentPage={pagination.currentPage} 
                            totalPages={pagination.totalPages} 
                            setCurrentPage={handlePageChange} 
                        />
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-6">💰</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No payments found</h3>
                    <p className="text-gray-600 mb-8">This customer hasn't made any payments yet.</p>
                    <button 
                        onClick={() => setOpen(true)} 
                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl inline-flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    >
                        <DollarSign className="w-5 h-5" />
                        Add First Payment
                    </button>
                </div>
            )}
        </div>
    )
}
