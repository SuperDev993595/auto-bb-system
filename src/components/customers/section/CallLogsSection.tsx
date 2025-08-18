import { useState, useEffect } from 'react'
import { HiPhone } from 'react-icons/hi'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { Customer } from '../../../services/customers'
import { customerService } from '../../../services/customers'
import Pagination from '../../../utils/Pagination'
import NewCallLogModal from '../modal/NewCallLogModal'
import { toast } from 'react-hot-toast'

interface CallLog {
    _id: string
    date: string
    type: string
    duration: number
    notes?: string
    summary?: string
    followUpDate?: string
    followUpRequired: boolean
    phoneNumber?: string
    createdAt: string
}

export default function CallLogsSection({ customer }: { customer: Customer }) {
    const [callLogs, setCallLogs] = useState<CallLog[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCallLogs: 0,
        hasNextPage: false,
        hasPrevPage: false
    })
    const itemsPerPage = 8

    // Fetch call logs
    const fetchCallLogs = async () => {
        setLoading(true)
        try {
            const response = await customerService.getCustomerCallLogs(customer._id, {
                page: currentPage,
                limit: itemsPerPage,
                sortBy: 'date',
                sortOrder: 'desc'
            })
            setCallLogs(response.data.callLogs)
            setPagination(response.data.pagination)
        } catch (error: any) {
            toast.error('Failed to fetch call logs')
            console.error('Error fetching call logs:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCallLogs()
    }, [customer._id, currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleCallLogSuccess = () => {
        fetchCallLogs()
    }

    const handleDeleteCallLog = async (callLogId: string) => {
        if (!window.confirm('Are you sure you want to delete this call log?')) {
            return
        }

        try {
            await customerService.deleteCallLog(customer._id, callLogId)
            toast.success('Call log deleted successfully')
            fetchCallLogs()
        } catch (error: any) {
            toast.error('Failed to delete call log')
            console.error('Error deleting call log:', error)
        }
    }

    const formatType = (type: string) => {
        const typeMap: { [key: string]: string } = {
            'inbound': 'Inbound',
            'outbound': 'Outbound',
            'missed': 'Missed',
            'voicemail': 'Voicemail'
        }
        return typeMap[type] || type
    }

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'inbound':
                return 'bg-green-100 text-green-700'
            case 'outbound':
                return 'bg-blue-100 text-blue-700'
            case 'missed':
                return 'bg-red-100 text-red-700'
            case 'voicemail':
                return 'bg-yellow-100 text-yellow-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div>
            {open && (
                <NewCallLogModal 
                    customerId={customer._id}
                    onClose={() => setOpen(false)} 
                    onSuccess={handleCallLogSuccess}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HiPhone className="text-teal-600" /> 
                    Call Logs
                    {pagination.totalCallLogs > 0 && (
                        <span className="text-sm text-gray-500">
                            ({pagination.totalCallLogs} calls)
                        </span>
                    )}
                </h3>
                <button 
                    onClick={() => setOpen(true)} 
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                    + Add Call
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                </div>
            ) : callLogs.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        {callLogs.map((log) => (
                            <div key={log._id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <div className="flex gap-2 mb-1">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(log.type)}`}>
                                                {formatType(log.type)}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                {formatDuration(log.duration)}
                                            </span>
                                        </div>
                                        {log.followUpRequired && (
                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                                Follow-up Required
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCallLog(log._id)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete Call Log"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                    📅 {new Date(log.date).toLocaleDateString()}
                                </p>
                                {log.phoneNumber && (
                                    <p className="text-sm text-gray-600 mb-1">
                                        📞 {log.phoneNumber}
                                    </p>
                                )}
                                {log.summary && (
                                    <p className="text-sm text-gray-700 mb-1">
                                        {log.summary}
                                    </p>
                                )}
                                {log.notes && (
                                    <p className="text-sm italic text-gray-500">
                                        {log.notes}
                                    </p>
                                )}
                                {log.followUpDate && (
                                    <p className="text-sm text-blue-600 mt-1">
                                        🔄 Follow-up: {new Date(log.followUpDate).toLocaleDateString()}
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
                    <div className="text-gray-400 text-6xl mb-4">📞</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No call logs found</h3>
                    <p className="text-gray-600 mb-6">This customer hasn't had any calls logged yet.</p>
                    <button 
                        onClick={() => setOpen(true)} 
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                        <HiPhone className="w-4 h-4" />
                        Add First Call Log
                    </button>
                </div>
            )}
        </div>
    )
}
