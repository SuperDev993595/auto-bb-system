import { useState } from 'react'
import { HiCash } from 'react-icons/hi'
import { Customer } from '../../../utils/CustomerTypes'
import Pagination from '../../../utils/Pagination'
import PostPaymentModal from '../modal/PostPaymentModal'

export default function PaymentsSection({ customer }: { customer: Customer }) {
    const payments = Array.from({ length: 12 }).map((_, i) => ({
        amount: 200 + i * 20,
        date: `2025-07-${i + 1}`,
        method: i % 2 === 0 ? 'Card' : 'Check',
        notes: `Payment #${i + 1}`
    }))

    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4
    const totalPages = Math.ceil(payments.length / itemsPerPage)
    const paginated = payments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div>
            {open && <PostPaymentModal onClose={() => setOpen(false)} />}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><HiCash className="text-blue-600" /> Payment History</h3>
                <button onClick={() => setOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">+ Add Payment</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {paginated.map((p, i) => (
                    <div key={i} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between">
                            <span className="font-bold text-green-700">${p.amount.toFixed(2)}</span>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{p.method}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">📅 {p.date}</p>
                        <p className="text-sm italic text-gray-500">{p.notes}</p>
                    </div>
                ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
    )
}
