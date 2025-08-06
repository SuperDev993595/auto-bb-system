import { Customer } from '../../../utils/CustomerTypes'

type Props = {
    customer: Customer
}

export default function OverviewSection({ customer }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm text-gray-700">
            {/* Contact Info */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Contact</h3>
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
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Account</h3>
                <div className="space-y-2">
                    <div>
                        <p className="text-xs text-gray-400">Account Number</p>
                        <p className="font-medium tracking-wide">{customer.accountNumber}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Vehicle</p>
                        <p className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                            {customer.vehicle}
                        </p>
                    </div>
                </div>
            </div>

            {/* Debt Info */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Debt</h3>
                <div className="space-y-2">
                    <div>
                        <p className="text-xs text-gray-400">Original Debt</p>
                        <p className="font-medium text-gray-800">${customer.originalDebt.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Current Debt</p>
                        <p className="font-bold text-red-600 text-lg">
                            ${customer.currentDebt.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
