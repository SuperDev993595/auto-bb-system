import { useState } from 'react'
import { HiTruck } from 'react-icons/hi'
import { Customer } from '../../../utils/CustomerTypes'
import Pagination from '../../../utils/Pagination'
import NewTowingModal from '../modal/NewTowingModal'

export default function TowingSection({ customer }: { customer: Customer }) {
    const records = Array.from({ length: 6 }).map((_, i) => ({
        date: `2025-07-${15 + i}`,
        location: `Yard ${i + 1}`,
        status: i % 2 === 0 ? 'Completed' : 'Scheduled'
    }))

    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 3
    const totalPages = Math.ceil(records.length / itemsPerPage)
    const paginated = records.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div>
            {open && <NewTowingModal onClose={() => setOpen(false)} />}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><HiTruck className="text-orange-600" /> Towing Records</h3>
                <button onClick={() => setOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded text-sm">+ Add Tow</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {paginated.map((r, i) => (
                    <div key={i} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between">
                            <span className="text-sm">{r.date}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {r.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700">{r.location}</p>
                    </div>
                ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
    )
}
