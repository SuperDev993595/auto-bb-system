import { useState } from 'react'
import { HiDocumentText } from 'react-icons/hi'
import { Customer } from '../../../utils/CustomerTypes'
import Pagination from '../../../utils/Pagination'
import NewArrangementModal from '../modal/NewArrangementModal'

export default function ArrangementsSection({ customer }: { customer: Customer }) {
    const arrangements = Array.from({ length: 10 }).map((_, i) => ({
        date: `2025-08-${i + 2}`,
        amount: 150 + i * 10,
        note: `Installment ${i + 1}`
    }))

    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4
    const totalPages = Math.ceil(arrangements.length / itemsPerPage)
    const paginated = arrangements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div>
            {open && <NewArrangementModal onClose={() => setOpen(false)} />}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><HiDocumentText className="text-purple-600" /> Payment Arrangements</h3>
                <button onClick={() => setOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded text-sm">+ Add Arrangement</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {paginated.map((a, i) => (
                    <div key={i} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between">
                            <span className="text-sm">{a.date}</span>
                            <span className="font-bold text-green-700">${a.amount.toFixed(2)}</span>
                        </div>
                        <p className="text-sm italic text-gray-500">{a.note}</p>
                    </div>
                ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
    )
}
