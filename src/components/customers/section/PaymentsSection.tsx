import { useState, useEffect } from 'react'
import { HiCurrencyDollar } from 'react-icons/hi'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { Customer } from '../../../services/customers'
import { customerService } from '../../../services/customers'
import Pagination from '../../../utils/Pagination'
import PostPaymentModal from '../modal/PostPaymentModal'
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
        setLoading(true)
        try {
            const response = await customerService.getCustomerPayments(customer._id, {
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
    }, [customer._id, currentPage])

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

        try {
            await customerService.deletePayment(customer._id, paymentId)
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
                    customerId={customer._id}
                    onClose={() => setOpen(false)} 
                    onSuccess={handlePaymentSuccess}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HiCurrencyDollar className="text-blue-600" /> 
                    Payment History
                    {pagination.totalPayments > 0 && (
                        <span className="text-sm text-gray-500">
                            ({pagination.totalPayments} payments)
                        </span>
                    )}
                </h3>
                <button 
                    onClick={() => setOpen(true)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        {payments.map((payment) => (
                            <div key={payment._id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <span className="font-bold text-green-700 text-lg">
                                            ${payment.amount.toFixed(2)}
                                        </span>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {formatMethod(payment.method)}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePayment(payment._id)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete Payment"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    📅 {new Date(payment.date).toLocaleDateString()}
                                </p>
                                {payment.reference && (
                                    <p className="text-sm text-gray-600 mb-1">
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
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">💰</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                    <p className="text-gray-600 mb-6">This customer hasn't made any payments yet.</p>
                    <button 
                        onClick={() => setOpen(true)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                        <HiCurrencyDollar className="w-4 h-4" />
                        Add First Payment
                    </button>
                </div>
            )}
        </div>
    )
}
