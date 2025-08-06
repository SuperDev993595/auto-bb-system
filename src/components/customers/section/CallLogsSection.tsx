import { useState } from 'react'
import { HiPhone } from 'react-icons/hi'
import { Customer } from '../../../utils/CustomerTypes'
import Pagination from '../../../utils/Pagination'
import NewCallLogModal from '../modal/NewCallLogModal'

export default function CallLogsSection({ customer }: { customer: Customer }) {
    const logs = Array.from({ length: 8 }).map((_, i) => ({
        date: `2025-07-${20 + i}`,
        type: i % 2 === 0 ? 'Inbound' : 'Outbound',
        duration: `${3 + i} min`,
        notes: `Spoke about case #${100 + i}`
    }))

    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4
    const totalPages = Math.ceil(logs.length / itemsPerPage)
    const paginated = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div>
            {open && <NewCallLogModal onClose={() => setOpen(false)} />}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><HiPhone className="text-teal-600" /> Call Logs</h3>
                <button onClick={() => setOpen(true)} className="bg-teal-600 text-white px-4 py-2 rounded text-sm">+ Add Call</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {paginated.map((log, i) => (
                    <div key={i} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-600">{log.date}</span>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{log.type}</span>
                        </div>
                        <p className="text-sm text-gray-700">{log.duration}</p>
                        <p className="text-sm italic text-gray-500 mt-1">{log.notes}</p>
                    </div>
                ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
    )
}
