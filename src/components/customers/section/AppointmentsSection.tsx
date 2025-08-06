import { useState } from 'react'
import { HiCalendar } from 'react-icons/hi'
import { Customer } from '../../../utils/CustomerTypes'
import Pagination from '../../../utils/Pagination'
import NewAppointmentModal from '../modal/NewAppointmentModal'

export default function AppointmentsSection({ customer }: { customer: Customer }) {
    const appointments = Array.from({ length: 8 }).map((_, i) => ({
        date: `2025-09-${i + 1}`,
        time: `${9 + i}:00 AM`,
        type: i % 2 === 0 ? 'Phone Call' : 'Meeting'
    }))

    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 4
    const totalPages = Math.ceil(appointments.length / itemsPerPage)
    const paginated = appointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div>
            {open && <NewAppointmentModal onClose={() => setOpen(false)} />}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><HiCalendar className="text-indigo-600" /> Appointments</h3>
                <button onClick={() => setOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm">+ Add Appointment</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {paginated.map((a, i) => (
                    <div key={i} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">{a.date} • {a.time}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{a.type}</span>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
    )
}
