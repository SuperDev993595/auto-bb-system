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
  User,
  DollarSign,
  FileText,
  Calendar,
  Truck,
  Phone
} from '../../utils/icons'
import { Edit, Trash2, Car } from '../../utils/icons'

const tabs = [
  { key: 'Overview', label: 'Overview', icon: User },
  { key: 'Payments', label: 'Payments', icon: DollarSign },
  { key: 'Arrangements', label: 'Arrangements', icon: FileText },
  { key: 'Appointments', label: 'Appointments', icon: Calendar },
  { key: 'Towing', label: 'Towing', icon: Truck },
  { key: 'Call Logs', label: 'Call Logs', icon: Phone }
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
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading customer information...</p>
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
        <div className="p-8 text-center text-red-600 font-medium">
          Customer not found. Please check the URL or try refreshing the page.
        </div>
      </div>
    )
  }

  // Debug: Log customer data for troubleshooting
  console.log('Customer data loaded:', customer)

  // Handle nested customer data structure (API might return {customer: {...}})
  let actualCustomer = customer;
  if (customer && typeof customer === 'object' && 'customer' in customer && customer.customer) {
    console.log('Found nested customer structure, extracting customer data');
    actualCustomer = customer.customer as any;
  }

  // Additional debugging for unexpected data structures
  if (actualCustomer && typeof actualCustomer === 'object') {
    console.log('Customer keys:', Object.keys(actualCustomer));
    console.log('Customer _id:', actualCustomer._id);
    console.log('Customer name:', actualCustomer.name);
  }

  // Validate required customer fields
  if (!actualCustomer._id || !actualCustomer.name) {
    console.error('Invalid customer data:', actualCustomer)
    console.error('Original customer object:', customer)
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="p-8 text-center text-red-600 font-medium">
          Invalid customer data. Some required information is missing.
          <br />
          <span className="text-sm">Please check the console for debugging information.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Top Profile Header */}
      <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {actualCustomer.name || actualCustomer.businessName || 'Unnamed Customer'}
          </h1>
          <div className="space-y-1 mt-2">
            {actualCustomer.businessName && actualCustomer.name !== actualCustomer.businessName && (
              <p className="text-sm text-gray-600">Contact: {actualCustomer.name}</p>
            )}
            <p className="text-sm text-gray-500">
              Customer ID: {actualCustomer._id || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button 
            onClick={() => setShowEditModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 transition-all duration-200 font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button 
            onClick={() => setShowAddVehicleModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 transition-all duration-200 font-medium"
          >
            <Car className="w-4 h-4" />
            Add Vehicle
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 transition-all duration-200 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-lg rounded-2xl px-6 py-4 mb-8 overflow-x-auto border border-gray-100">
        <nav className="flex gap-6 whitespace-nowrap">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-3 text-sm font-medium px-4 py-3 border-b-2 transition-all duration-200 ${activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-500 hover:border-blue-200'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-8">
        {activeTab === 'Overview' && (
          <OverviewSection 
            customer={actualCustomer} 
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
        {activeTab === 'Payments' && (
          <div className="min-h-[200px]">
            <PaymentsSection customer={actualCustomer} />
          </div>
        )}
        {activeTab === 'Arrangements' && (
          <div className="min-h-[200px]">
            <ArrangementsSection customer={actualCustomer} />
          </div>
        )}
        {activeTab === 'Appointments' && (
          <div className="min-h-[200px]">
            <AppointmentsSection customer={actualCustomer} />
          </div>
        )}
        {activeTab === 'Towing' && (
          <div className="min-h-[200px]">
            <TowingSection customer={actualCustomer} />
          </div>
        )}
        {activeTab === 'Call Logs' && (
          <div className="min-h-[200px]">
            <CallLogsSection customer={actualCustomer} />
          </div>
        )}
      </div>

      {/* Modals */}
      {actualCustomer && (
        <>
          <EditCustomerModal
            customer={actualCustomer}
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
            customer={actualCustomer}
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
          />
          
          <AddVehicleModal
            customer={actualCustomer}
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
                customer={actualCustomer}
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
                customer={actualCustomer}
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
