import { useParams } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../redux'
import { useState, useEffect } from 'react'
import { fetchCustomer, deleteVehicle } from '../../redux/actions/customers'

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
  Phone,
  Edit,
  Trash2,
  Car,
  ArrowLeft,
  Settings,
  Activity
} from '../../utils/icons'

const tabs = [
  { key: 'Overview', label: 'Overview', icon: User, color: 'from-blue-500 to-indigo-500' },
  { key: 'Payments', label: 'Payments', icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
  { key: 'Arrangements', label: 'Arrangements', icon: FileText, color: 'from-purple-500 to-pink-500' },
  { key: 'Appointments', label: 'Appointments', icon: Calendar, color: 'from-orange-500 to-red-500' },
  { key: 'Towing', label: 'Towing', icon: Truck, color: 'from-amber-500 to-yellow-500' },
  { key: 'Call Logs', label: 'Call Logs', icon: Phone, color: 'from-cyan-500 to-blue-500' }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Customer Information</h3>
            <p className="text-gray-500">Please wait while we fetch the details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Customer</h3>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Customer not found
  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Customer Not Found</h3>
            <p className="text-gray-600 mb-4">The customer you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle nested customer data structure (API might return {customer: {...}})
  let actualCustomer = customer;
  if (customer && typeof customer === 'object' && 'customer' in customer && customer.customer) {
    actualCustomer = customer.customer as any;
  }

  // Validate required customer fields
  if (!actualCustomer._id || !actualCustomer.name) {
    console.error('Invalid customer data:', actualCustomer)
    console.error('Original customer object:', customer)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Invalid Customer Data</h3>
            <p className="text-red-600 font-medium mb-2">Some required information is missing.</p>
            <p className="text-sm text-gray-500 mb-4">Please check the console for debugging information.</p>
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back Navigation */}
      <div className="p-6">
        <button 
          onClick={() => window.history.back()}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back to Customers</span>
        </button>
      </div>

      {/* Hero Profile Header */}
      <div className="px-6 mb-8">
        <div className="min-h-48 flex flex-col lg:flex-row justify-between items-start lg:items-center p-8">
          <div className="flex items-center space-x-6 mb-6 lg:mb-0">
            <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center border border-secondary-200">
              <User className="w-12 h-12 text-secondary-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-secondary-900 mb-3">
                {actualCustomer.name || actualCustomer.businessName || 'Unnamed Customer'}
              </h1>
              <div className="space-y-2">
                {actualCustomer.businessName && actualCustomer.name !== actualCustomer.businessName && (
                  <p className="text-secondary-600 text-lg">Contact: {actualCustomer.name}</p>
                )}
                <p className="text-secondary-500 text-sm">
                  Customer ID: {actualCustomer._id || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowEditModal(true)}
              className="btn-primary px-6 py-3"
            >
              <Edit className="w-4 h-4" />
              Edit Customer
            </button>
            <button 
              onClick={() => setShowAddVehicleModal(true)}
              className="btn-success px-6 py-3"
            >
              <Car className="w-4 h-4" />
              Add Vehicle
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="btn-error px-6 py-3"
            >
              <Trash2 className="w-4 h-4" />
              Delete Customer
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xl px-6 py-4 border border-gray-100 overflow-x-auto">
          <nav className="flex gap-2 whitespace-nowrap">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`tab-button-alt ${activeTab === key ? 'tab-button-alt-active' : 'tab-button-alt-inactive'}`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
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
                onAddVehicle={() => setShowAddVehicleModal(true)}
              />
            )}
            {activeTab === 'Payments' && (
              <div className="min-h-[400px]">
                <PaymentsSection customer={actualCustomer} />
              </div>
            )}
            {activeTab === 'Arrangements' && (
              <div className="min-h-[400px]">
                <ArrangementsSection customer={actualCustomer} />
              </div>
            )}
            {activeTab === 'Appointments' && (
              <div className="min-h-[400px]">
                <AppointmentsSection customer={actualCustomer} />
              </div>
            )}
            {activeTab === 'Towing' && (
              <div className="min-h-[400px]">
                <TowingSection customer={actualCustomer} />
              </div>
            )}
            {activeTab === 'Call Logs' && (
              <div className="min-h-[400px]">
                <CallLogsSection customer={actualCustomer} />
              </div>
            )}
          </div>
        </div>
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
            customer={actualCustomer as any}
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onDelete={async (customerId: string) => {
              // This will be handled by the DeleteCustomerModal internally
              // The modal will dispatch the delete action
            }}
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
                vehicle={selectedVehicle}
                isOpen={showDeleteVehicleModal}
                onClose={() => {
                  setShowDeleteVehicleModal(false)
                  setSelectedVehicle(null)
                }}
                onDelete={async (vehicleId: string) => {
                  if (id) {
                    await dispatch(deleteVehicle({ customerId: id, vehicleId }))
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
