import { useParams } from 'react-router-dom'
import { useAppSelector } from '../../redux'
import { useState } from 'react'

import OverviewSection from '../../components/customers/section/OverviewSection'
import PaymentsSection from '../../components/customers/section/PaymentsSection'
import ArrangementsSection from '../../components/customers/section/ArrangementsSection'
import AppointmentsSection from '../../components/customers/section/AppointmentsSection'
import TowingSection from '../../components/customers/section/TowingSection'
import CallLogsSection from '../../components/customers/section/CallLogsSection'

import {
  HiOutlineUserCircle,
  HiOutlineCash,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineTruck,
  HiOutlinePhone
} from 'react-icons/hi'

const tabs = [
  { key: 'Overview', label: 'Overview', icon: HiOutlineUserCircle },
  { key: 'Payments', label: 'Payments', icon: HiOutlineCash },
  { key: 'Arrangements', label: 'Arrangements', icon: HiOutlineDocumentText },
  { key: 'Appointments', label: 'Appointments', icon: HiOutlineCalendar },
  { key: 'Towing', label: 'Towing', icon: HiOutlineTruck },
  { key: 'Call Logs', label: 'Call Logs', icon: HiOutlinePhone }
]

export default function CustomerDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('Overview')

  const customer = useAppSelector(state =>
    state.customers.list.find(c => c.id === id)
  )

  if (!customer) {
    return <div className="p-8 text-center text-red-600 font-medium">Customer not found.</div>
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Top Profile Header */}
      <div className="bg-white shadow rounded-xl p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
          <p className="text-sm text-gray-500">Customer ID: {customer.id}</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow-sm">✏️ Edit</button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-sm">🗑️ Delete</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm rounded-lg px-4 py-2 mb-6 overflow-x-auto">
        <nav className="flex gap-4 whitespace-nowrap">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 border-b-2 transition ${activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-500'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border rounded-xl shadow p-6">
        {activeTab === 'Overview' && <OverviewSection customer={customer} />}
        {activeTab === 'Payments' && <PaymentsSection customer={customer} />}
        {activeTab === 'Arrangements' && <ArrangementsSection customer={customer} />}
        {activeTab === 'Appointments' && <AppointmentsSection customer={customer} />}
        {activeTab === 'Towing' && <TowingSection customer={customer} />}
        {activeTab === 'Call Logs' && <CallLogsSection customer={customer} />}
      </div>
    </div>
  )
}
