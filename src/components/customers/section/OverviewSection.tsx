import { Customer } from '../../../utils/CustomerTypes'

type Props = {
    customer: Customer
}

export default function OverviewSection({ customer }: Props) {
    return (
        <div className="space-y-6">
            {/* Contact & Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm text-gray-700">
                {/* Contact Info */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Contact Information</h3>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-gray-400">Phone</p>
                            <p className="font-medium">{customer.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Email</p>
                            <p className="font-medium">{customer.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Address</p>
                            <p className="font-medium">{customer.address}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Preferred Contact</p>
                            <p className="font-medium capitalize">{customer.preferences?.preferredContactMethod || 'Phone'}</p>
                        </div>
                    </div>
                </div>

                {/* Account Info */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Account Details</h3>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-gray-400">Customer Since</p>
                            <p className="font-medium">{new Date(customer.dateCreated).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Last Visit</p>
                            <p className="font-medium">{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Total Vehicles</p>
                            <p className="font-medium">{customer.vehicles?.length || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Service Records</p>
                            <p className="font-medium">{customer.serviceHistory?.length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Preferences</h3>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-gray-400">Appointment Reminders</p>
                            <p className="font-medium">{customer.preferences?.reminderPreferences?.appointmentReminders ? '✅ Enabled' : '❌ Disabled'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Service Reminders</p>
                            <p className="font-medium">{customer.preferences?.reminderPreferences?.serviceReminders ? '✅ Enabled' : '❌ Disabled'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Follow-up Reminders</p>
                            <p className="font-medium">{customer.preferences?.reminderPreferences?.followUpReminders ? '✅ Enabled' : '❌ Disabled'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicles Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Vehicles</h3>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        + Add Vehicle
                    </button>
                </div>
                {customer.vehicles && customer.vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customer.vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-gray-800">
                                        {vehicle.year} {vehicle.make} {vehicle.model}
                                    </h4>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {vehicle.color}
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p><span className="font-medium">VIN:</span> {vehicle.vin}</p>
                                    <p><span className="font-medium">License:</span> {vehicle.licensePlate}</p>
                                    <p><span className="font-medium">Mileage:</span> {vehicle.mileage.toLocaleString()} miles</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No vehicles registered for this customer.</p>
                    </div>
                )}
            </div>

            {/* Recent Service History */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Recent Service History</h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View All
                    </button>
                </div>
                {customer.serviceHistory && customer.serviceHistory.length > 0 ? (
                    <div className="space-y-3">
                        {customer.serviceHistory.slice(0, 3).map((service) => (
                            <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-medium text-gray-800">{service.serviceType}</h4>
                                        <p className="text-sm text-gray-600">{service.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-800">${service.totalCost.toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{new Date(service.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>Technician: {service.technicianName}</span>
                                    <span className={`px-2 py-1 rounded-full ${
                                        service.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        service.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {service.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No service history available.</p>
                    </div>
                )}
            </div>

            {/* Notes Section */}
            {customer.notes && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Notes</h3>
                    <p className="text-gray-600">{customer.notes}</p>
                </div>
            )}
        </div>
    )
}
