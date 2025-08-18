import { useState, useEffect } from 'react'
import { HiDocumentText } from 'react-icons/hi'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { Customer } from '../../../services/customers'
import { customerService } from '../../../services/customers'
import Pagination from '../../../utils/Pagination'
import NewArrangementModal from '../modal/NewArrangementModal'
import { toast } from 'react-hot-toast'

interface Arrangement {
    _id: string
    date: string
    amount: number
    notes?: string
    status: string
    type: string
    dueDate: string
    createdAt: string
}

export default function ArrangementsSection({ customer }: { customer: Customer }) {
    const [arrangements, setArrangements] = useState<Arrangement[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalArrangements: 0,
        hasNextPage: false,
        hasPrevPage: false
    })
    const itemsPerPage = 8

    // Fetch arrangements
    const fetchArrangements = async () => {
        setLoading(true)
        try {
            const response = await customerService.getCustomerArrangements(customer._id, {
                page: currentPage,
                limit: itemsPerPage,
                sortBy: 'date',
                sortOrder: 'desc'
            })
            setArrangements(response.data.arrangements)
            setPagination(response.data.pagination)
        } catch (error: any) {
            toast.error('Failed to fetch arrangements')
            console.error('Error fetching arrangements:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchArrangements()
    }, [customer._id, currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleArrangementSuccess = () => {
        fetchArrangements()
    }

    const handleDeleteArrangement = async (arrangementId: string) => {
        if (!window.confirm('Are you sure you want to delete this arrangement?')) {
            return
        }

        try {
            await customerService.deleteArrangement(customer._id, arrangementId)
            toast.success('Arrangement deleted successfully')
            fetchArrangements()
        } catch (error: any) {
            toast.error('Failed to delete arrangement')
            console.error('Error deleting arrangement:', error)
        }
    }

    const formatType = (type: string) => {
        const typeMap: { [key: string]: string } = {
            'installment': 'Installment',
            'payment_plan': 'Payment Plan',
            'deferred': 'Deferred',
            'other': 'Other'
        }
        return typeMap[type] || type
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'completed':
                return 'bg-blue-100 text-blue-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div>
            {open && (
                <NewArrangementModal 
                    customerId={customer._id}
                    onClose={() => setOpen(false)} 
                    onSuccess={handleArrangementSuccess}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HiDocumentText className="text-purple-600" /> 
                    Payment Arrangements
                    {pagination.totalArrangements > 0 && (
                        <span className="text-sm text-gray-500">
                            ({pagination.totalArrangements} arrangements)
                        </span>
                    )}
                </h3>
                <button 
                    onClick={() => setOpen(true)} 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                    + Add Arrangement
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : arrangements.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        {arrangements.map((arrangement) => (
                            <div key={arrangement._id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <span className="font-bold text-green-700 text-lg">
                                            ${arrangement.amount.toFixed(2)}
                                        </span>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {formatType(arrangement.type)}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(arrangement.status)}`}>
                                                {arrangement.status}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteArrangement(arrangement._id)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete Arrangement"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    📅 {new Date(arrangement.date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600 mb-1">
                                    Due: {new Date(arrangement.dueDate).toLocaleDateString()}
                                </p>
                                {arrangement.notes && (
                                    <p className="text-sm italic text-gray-500">
                                        {arrangement.notes}
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
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No arrangements found</h3>
                    <p className="text-gray-600 mb-6">This customer hasn't made any payment arrangements yet.</p>
                    <button 
                        onClick={() => setOpen(true)} 
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                        <HiDocumentText className="w-4 h-4" />
                        Add First Arrangement
                    </button>
                </div>
            )}
        </div>
    )
}
