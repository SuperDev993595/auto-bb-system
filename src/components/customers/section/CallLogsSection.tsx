import { useState, useEffect } from 'react'
import { Customer } from '../../../services/customers'
import { customerService } from '../../../services/customers'
import Pagination from '../../../utils/Pagination'
import NewCallLogModal from '../modal/NewCallLogModal'
import { Phone, Edit, Trash2 } from '../../../utils/icons'
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

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                        <Phone className="text-teal-600 w-5 h-5" />
                    </div>
                    Call Logs
                    {pagination.totalCallLogs > 0 && (
                        <span className="text-sm text-gray-500">
                            ({pagination.totalCallLogs} calls)
                        </span>
                    )}
                </h3>
                <button 
                    onClick={() => setOpen(true)} 
                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {callLogs.map((log) => (
                            <div key={log._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex gap-2 mb-2">
                                            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getTypeColor(log.type)}`}>
                                                {formatType(log.type)}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
                                                {formatDuration(log.duration)}
                                            </span>
                                        </div>
                                        {log.followUpRequired && (
                                            <span className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg">
                                                Follow-up Required
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCallLog(log._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                        title="Delete Call Log"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    📅 {new Date(log.date).toLocaleDateString()}
                                </p>
                                {log.phoneNumber && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        📞 {log.phoneNumber}
                                    </p>
                                )}
                                {log.summary && (
                                    <p className="text-sm text-gray-700 mb-2">
                                        {log.summary}
                                    </p>
                                )}
                                {log.notes && (
                                    <p className="text-sm italic text-gray-500">
                                        {log.notes}
                                    </p>
                                )}
                                {log.followUpDate && (
                                    <p className="text-sm text-blue-600 mt-2">
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
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-6">📞</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No call logs found</h3>
                    <p className="text-gray-600 mb-8">This customer hasn't had any calls logged yet.</p>
                    <button 
                        onClick={() => setOpen(true)} 
                        className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl inline-flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    >
                        <Phone className="w-5 h-5" />
                        Add First Call Log
                    </button>
                </div>
            )}
        </div>
    )
}
