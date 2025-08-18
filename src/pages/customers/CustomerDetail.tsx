import { useParams } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../redux'
import { useState, useEffect } from 'react'
import { fetchCustomer } from '../../redux/actions/customers'

import OverviewSection from '../../components/customers/section/OverviewSection'
import PaymentsSection from '../../components/customers/section/PaymentsSection'
import ArrangementsSection from '../../components/customers/section/ArrangementsSection'
import AppointmentsSection from '../../components/customers/section/AppointmentsSection'
import TowingSection from '../../components/customers/section/TowingSection'
import CallLogsSection from '../../components/customers/section/CallLogsSection'

import EditCustomerModal from '../../components/customers/modal/EditCustomerModal'
import DeleteCustomerModal from '../../components/customers/modal/DeleteCustomerModal'
import AddVehicleModal from '../../components/customers/modal/AddVehicleModal'
import EditVehicleModal from '../../components/customers/modal/EditVehicleModal'
import DeleteVehicleModal from '../../components/customers/modal/DeleteVehicleModal'

import {
  HiOutlineUserCircle,
  HiOutlineCash,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineTruck,
  HiOutlinePhone
} from 'react-icons/hi'
import { FaEdit, FaTrash, FaCar } from 'react-icons/fa'

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
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState('Overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false)
  const [showDeleteVehicleModal, setShowDeleteVehicleModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)

  const { selectedCustomer: customer, loading, error } = useAppSelector(state => state.customers)

  // Fetch customer data when component mounts
  useEffect(() => {
    if (id) {
      dispatch(fetchCustomer(id))
    }
  }, [dispatch, id])

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="p-8 text-center text-red-600 font-medium">
          Error loading customer: {error}
        </div>
      </div>
    )
  }

  // Customer not found
  if (!customer) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="p-8 text-center text-red-600 font-medium">Customer not found.</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Top Profile Header */}
      <div className="bg-white shadow rounded-xl p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
          <p className="text-sm text-gray-500">Customer ID: {customer._id}</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button 
            onClick={() => setShowEditModal(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow-sm flex items-center gap-2"
          >
            <FaEdit className="w-4 h-4" />
            Edit
          </button>
          <button 
            onClick={() => setShowAddVehicleModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-sm flex items-center gap-2"
          >
            <FaCar className="w-4 h-4" />
            Add Vehicle
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-sm flex items-center gap-2"
          >
            <FaTrash className="w-4 h-4" />
            Delete
          </button>
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
        {activeTab === 'Overview' && (
          <OverviewSection 
            customer={customer} 
            onEditVehicle={(vehicle) => {
              setSelectedVehicle(vehicle)
              setShowEditVehicleModal(true)
            }}
            onDeleteVehicle={(vehicle) => {
              setSelectedVehicle(vehicle)
              setShowDeleteVehicleModal(true)
            }}
          />
        )}
        {activeTab === 'Payments' && <PaymentsSection customer={customer} />}
        {activeTab === 'Arrangements' && <ArrangementsSection customer={customer} />}
        {activeTab === 'Appointments' && <AppointmentsSection customer={customer} />}
        {activeTab === 'Towing' && <TowingSection customer={customer} />}
        {activeTab === 'Call Logs' && <CallLogsSection customer={customer} />}
      </div>

      {/* Modals */}
      {customer && (
        <>
          <EditCustomerModal
            customer={customer}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => {
              // Refresh customer data after successful edit
              if (id) {
                dispatch(fetchCustomer(id))
              }
            }}
          />
          
          <DeleteCustomerModal
            customer={customer}
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
          />
          
          <AddVehicleModal
            customer={customer}
            isOpen={showAddVehicleModal}
            onClose={() => setShowAddVehicleModal(false)}
            onSuccess={() => {
              // Refresh customer data after successful vehicle addition
              if (id) {
                dispatch(fetchCustomer(id))
              }
            }}
          />
          
          {selectedVehicle && (
            <>
              <EditVehicleModal
                customer={customer}
                vehicle={selectedVehicle}
                isOpen={showEditVehicleModal}
                onClose={() => {
                  setShowEditVehicleModal(false)
                  setSelectedVehicle(null)
                }}
                onSuccess={() => {
                  // Refresh customer data after successful vehicle edit
                  if (id) {
                    dispatch(fetchCustomer(id))
                  }
                }}
              />
              
              <DeleteVehicleModal
                customer={customer}
                vehicle={selectedVehicle}
                isOpen={showDeleteVehicleModal}
                onClose={() => {
                  setShowDeleteVehicleModal(false)
                  setSelectedVehicle(null)
                }}
                onSuccess={() => {
                  // Refresh customer data after successful vehicle deletion
                  if (id) {
                    dispatch(fetchCustomer(id))
                  }
                }}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}
