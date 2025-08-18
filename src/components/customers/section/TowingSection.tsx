import { useState, useEffect } from 'react'
import { HiTruck } from 'react-icons/hi'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { Customer } from '../../../services/customers'
import { customerService } from '../../../services/customers'
import Pagination from '../../../utils/Pagination'
import NewTowingModal from '../modal/NewTowingModal'
import { toast } from 'react-hot-toast'

interface TowingRecord {
    _id: string
    date: string
    location: string
    destination?: string
    status: string
    notes?: string
    cost: number
    vehicle?: string
    createdAt: string
}

export default function TowingSection({ customer }: { customer: Customer }) {
    const [towingRecords, setTowingRecords] = useState<TowingRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalTowingRecords: 0,
        hasNextPage: false,
        hasPrevPage: false
    })
    const itemsPerPage = 8

    // Fetch towing records
    const fetchTowingRecords = async () => {
        setLoading(true)
        try {
            const response = await customerService.getCustomerTowing(customer._id, {
                page: currentPage,
                limit: itemsPerPage,
                sortBy: 'date',
                sortOrder: 'desc'
            })
            setTowingRecords(response.data.towingRecords)
            setPagination(response.data.pagination)
        } catch (error: any) {
            toast.error('Failed to fetch towing records')
            console.error('Error fetching towing records:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTowingRecords()
    }, [customer._id, currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleTowingSuccess = () => {
        fetchTowingRecords()
    }

    const handleDeleteTowing = async (towingId: string) => {
        if (!window.confirm('Are you sure you want to delete this towing record?')) {
            return
        }

        try {
            await customerService.deleteTowing(customer._id, towingId)
            toast.success('Towing record deleted successfully')
            fetchTowingRecords()
        } catch (error: any) {
            toast.error('Failed to delete towing record')
            console.error('Error deleting towing record:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'scheduled':
                return 'bg-yellow-100 text-yellow-800'
            case 'in_progress':
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
                <NewTowingModal 
                    customerId={customer._id}
                    onClose={() => setOpen(false)} 
                    onSuccess={handleTowingSuccess}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HiTruck className="text-orange-600" /> 
                    Towing Records
                    {pagination.totalTowingRecords > 0 && (
                        <span className="text-sm text-gray-500">
                            ({pagination.totalTowingRecords} records)
                        </span>
                    )}
                </h3>
                <button 
                    onClick={() => setOpen(true)} 
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                    + Add Tow
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
            ) : towingRecords.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        {towingRecords.map((record) => (
                            <div key={record._id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-800 mb-1">{record.location}</h4>
                                        <div className="flex gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                            {record.cost > 0 && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                    ${record.cost.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTowing(record._id)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete Towing Record"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    📅 {new Date(record.date).toLocaleDateString()}
                                </p>
                                {record.destination && (
                                    <p className="text-sm text-gray-600 mb-1">
                                        To: {record.destination}
                                    </p>
                                )}
                                {record.vehicle && (
                                    <p className="text-sm text-gray-600 mb-1">
                                        Vehicle: {record.vehicle}
                                    </p>
                                )}
                                {record.notes && (
                                    <p className="text-sm italic text-gray-500">
                                        {record.notes}
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
                    <div className="text-gray-400 text-6xl mb-4">🚛</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No towing records found</h3>
                    <p className="text-gray-600 mb-6">This customer hasn't had any towing services yet.</p>
                    <button 
                        onClick={() => setOpen(true)} 
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                        <HiTruck className="w-4 h-4" />
                        Add First Towing Record
                    </button>
                </div>
            )}
        </div>
    )
}
