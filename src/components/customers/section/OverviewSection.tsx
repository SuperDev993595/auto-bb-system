import { Customer } from '../../../services/customers'
import { Edit, Trash2, Phone, Mail, MapPin, Building2, Calendar, Car, Wrench, FileText, User, Shield, Star } from '../../../utils/icons'

type Props = {
    customer: Customer
    onEditVehicle?: (vehicle: any) => void
    onDeleteVehicle?: (vehicle: any) => void
}

export default function OverviewSection({ customer, onEditVehicle, onDeleteVehicle }: Props) {
    // Helper function to get the best available date
    const getCustomerDate = (customer: Customer, field: 'createdAt' | 'updatedAt' | 'dateCreated') => {
        return customer[field] || customer.createdAt || customer.updatedAt || new Date().toISOString()
    }

    return (
        <div className="space-y-8">
            {/* Contact & Basic Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Info Card */}
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                <Phone className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                            <Phone className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Phone</p>
                                <p className="font-semibold text-gray-800">{customer.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                            <Mail className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Email</p>
                                <p className="font-semibold text-gray-800">{customer.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Address</p>
                                <p className="font-semibold text-gray-800">
                                    {customer.address?.street || customer.address?.city || customer.address?.state 
                                      ? `${customer.address?.street || ''}${customer.address?.street && (customer.address?.city || customer.address?.state) ? ', ' : ''}${customer.address?.city || ''}${customer.address?.city && customer.address?.state ? ', ' : ''}${customer.address?.state || ''}${customer.address?.zipCode ? ` ${customer.address.zipCode}` : ''}`
                                      : 'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                        {customer.businessName && (
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                                <Building2 className="w-5 h-5 text-blue-500" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Business Name</p>
                                    <p className="font-semibold text-gray-800">{customer.businessName}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Info Card */}
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Account Details</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Customer Since</p>
                                <p className="font-semibold text-gray-800">{new Date(getCustomerDate(customer, 'dateCreated')).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Last Updated</p>
                                <p className="font-semibold text-gray-800">{new Date(getCustomerDate(customer, 'updatedAt')).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                            <Car className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Total Vehicles</p>
                                <p className="font-semibold text-gray-800">{customer.vehicles?.length || 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                            <Wrench className="w-5 h-5 text-emerald-500" />
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Service Records</p>
                                <p className="font-semibold text-gray-800">{customer.serviceHistory?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Card */}
                <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <Star className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Quick Stats</h3>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                            <p className="text-2xl font-bold">{customer.vehicles?.length || 0}</p>
                            <p className="text-sm opacity-90">Vehicles</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white">
                            <p className="text-2xl font-bold">{customer.serviceHistory?.length || 0}</p>
                            <p className="text-sm opacity-90">Services</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white">
                            <p className="text-2xl font-bold">{customer.status === 'active' ? 'Active' : 'Inactive'}</p>
                            <p className="text-sm opacity-90">Status</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicles Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                <Car className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Vehicles</h3>
                        </div>
                        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            + Add Vehicle
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    {customer.vehicles && customer.vehicles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {customer.vehicles.map((vehicle) => (
                                <div key={vehicle._id || vehicle.id} className="group bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-5 transition-all duration-300 hover:shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-lg mb-2">
                                                {vehicle.year} {vehicle.make} {vehicle.model}
                                            </h4>
                                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                                                {vehicle.color}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {onEditVehicle && (
                                                <button
                                                    onClick={() => onEditVehicle(vehicle)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                    title="Edit Vehicle"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            )}
                                            {onDeleteVehicle && (
                                                <button
                                                    onClick={() => onDeleteVehicle(vehicle)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                    title="Delete Vehicle"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                            <span className="font-medium text-gray-700">VIN:</span>
                                            <span className="font-mono text-xs">{vehicle.vin}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                            <span className="font-medium text-gray-700">License:</span>
                                            <span className="font-mono text-xs">{vehicle.licensePlate}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                            <span className="font-medium text-gray-700">Mileage:</span>
                                            <span className="font-mono text-xs">{vehicle.mileage.toLocaleString()} miles</span>
                                        </div>
                                        {vehicle.status && (
                                            <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                                <span className="font-medium text-gray-700">Status:</span>
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                    vehicle.status === 'active' 
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                                        : vehicle.status === 'inactive'
                                                        ? 'bg-red-100 text-red-800 border border-red-200'
                                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                }`}>
                                                    {vehicle.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Car className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-500 mb-2">No Vehicles Registered</h3>
                            <p className="text-gray-400">This customer hasn't registered any vehicles yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Service History */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                <Wrench className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Recent Service History</h3>
                        </div>
                        <button className="px-4 py-2 text-emerald-600 hover:text-emerald-700 text-sm font-semibold hover:bg-emerald-50 rounded-xl transition-all duration-200 border border-emerald-200 hover:border-emerald-300">
                            View All
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    {customer.serviceHistory && customer.serviceHistory.length > 0 ? (
                        <div className="space-y-4">
                            {customer.serviceHistory.slice(0, 3).map((service) => (
                                <div key={service._id || service.id} className="group bg-gray-50 hover:bg-white border border-gray-200 hover:border-emerald-300 rounded-xl p-5 transition-all duration-300 hover:shadow-lg">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-lg mb-1">{service.serviceType}</h4>
                                            <p className="text-gray-600">{service.description}</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-xl font-bold text-emerald-600">${service.totalCost.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">{new Date(service.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-500 pt-3 border-t border-gray-200">
                                        <span className="flex items-center space-x-1">
                                            <User className="w-4 h-4" />
                                            <span>Technician: {service.technician}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <Car className="w-4 h-4" />
                                            <span>Vehicle: {service.vehicleId}</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wrench className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-500 mb-2">No Service History</h3>
                            <p className="text-gray-400">No service records available for this customer.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Section */}
            {customer.notes && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Notes</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-gray-700 leading-relaxed">{customer.notes}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
