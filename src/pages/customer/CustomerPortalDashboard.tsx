import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Calendar, 
  Car, 
  Shield, 
  CreditCard, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Wrench,
  FileText,
  Bell,
  Settings,
  Plus
} from 'lucide-react';
import { customerService } from '../../services/customers';

interface CustomerPortalData {
  customer: any;
  vehicles: any[];
  appointments: any[];
  invoices: any[];
  memberships: any[];
  warranties: any[];
  serviceHistory: any[];
  stats: {
    totalSpent: number;
    totalServices: number;
    activeWarranties: number;
    upcomingAppointments: number;
    overdueInvoices: number;
  };
}

export default function CustomerPortalDashboard() {
  const { customerId } = useParams<{ customerId: string }>();
  const [data, setData] = useState<CustomerPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (customerId) {
      fetchCustomerPortalData();
    }
  }, [customerId]);

  const fetchCustomerPortalData = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch comprehensive customer portal data
      // const response = await customerService.getCustomerPortalData(customerId);
      // setData(response.data);
      
      // Mock data for now
      setData({
        customer: {
          id: customerId,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1-555-0123',
          status: 'active'
        },
        vehicles: [
          {
            id: '1',
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            vin: '1HGBH41JXMN109186',
            mileage: 45000,
            nextService: '2024-02-15'
          }
        ],
        appointments: [
          {
            id: '1',
            serviceType: 'Oil Change',
            scheduledDate: '2024-01-20',
            scheduledTime: '10:00',
            status: 'confirmed'
          }
        ],
        invoices: [
          {
            id: '1',
            invoiceNumber: 'INV-001',
            total: 150.00,
            status: 'paid',
            dueDate: '2024-01-15'
          }
        ],
        memberships: [
          {
            id: '1',
            planName: 'Premium Maintenance',
            tier: 'premium',
            status: 'active',
            nextBilling: '2024-02-01',
            price: 99.99
          }
        ],
        warranties: [
          {
            id: '1',
            name: 'Extended Powertrain',
            type: 'extended',
            status: 'active',
            endDate: '2026-01-01',
            mileageLimit: 100000
          }
        ],
        serviceHistory: [
          {
            id: '1',
            serviceType: 'Brake Service',
            date: '2023-12-15',
            cost: 350.00,
            mileage: 42000
          }
        ],
        stats: {
          totalSpent: 2500.00,
          totalServices: 8,
          activeWarranties: 2,
          upcomingAppointments: 1,
          overdueInvoices: 0
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load customer portal data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Portal</h2>
          <p className="text-gray-600">{error || 'Unable to load customer portal data'}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'vehicles', label: 'Vehicles', icon: <Car className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'memberships', label: 'Memberships', icon: <Users className="w-4 h-4" /> },
    { id: 'warranties', label: 'Warranties', icon: <Shield className="w-4 h-4" /> },
    { id: 'services', label: 'Service History', icon: <Wrench className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome,</span>
                <span className="font-semibold text-gray-800">{data.customer.name}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'vehicles' && <VehiclesTab data={data} />}
        {activeTab === 'appointments' && <AppointmentsTab data={data} />}
        {activeTab === 'memberships' && <MembershipsTab data={data} />}
        {activeTab === 'warranties' && <WarrantiesTab data={data} />}
        {activeTab === 'services' && <ServicesTab data={data} />}
        {activeTab === 'billing' && <BillingTab data={data} />}
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ data }: { data: CustomerPortalData }) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${data.stats.totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Services</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalServices}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Warranties</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.activeWarranties}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.upcomingAppointments}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Book Appointment</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Car className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Add Vehicle</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-700">View Invoices</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {data.serviceHistory.slice(0, 3).map((service) => (
            <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Wrench className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{service.serviceType}</p>
                  <p className="text-sm text-gray-600">{service.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${service.cost}</p>
                <p className="text-sm text-gray-600">{service.mileage} miles</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VehiclesTab({ data }: { data: CustomerPortalData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Vehicles</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VIN:</span>
                <span className="font-medium text-gray-900">{vehicle.vin}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mileage:</span>
                <span className="font-medium text-gray-900">{vehicle.mileage.toLocaleString()} miles</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Service:</span>
                <span className="font-medium text-gray-900">{vehicle.nextService}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppointmentsTab({ data }: { data: CustomerPortalData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.serviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.scheduledDate}</div>
                    <div className="text-sm text-gray-500">{appointment.scheduledTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">Reschedule</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MembershipsTab({ data }: { data: CustomerPortalData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Memberships</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Upgrade Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.memberships.map((membership) => (
          <div key={membership.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{membership.planName}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                membership.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {membership.status}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tier:</span>
                <span className="font-medium text-gray-900 capitalize">{membership.tier}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-gray-900">${membership.price}/month</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next Billing:</span>
                <span className="font-medium text-gray-900">{membership.nextBilling}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Manage Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarrantiesTab({ data }: { data: CustomerPortalData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Warranties</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Warranty</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.warranties.map((warranty) => (
          <div key={warranty.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{warranty.name}</h3>
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900 capitalize">{warranty.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  warranty.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {warranty.status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium text-gray-900">{warranty.endDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mileage Limit:</span>
                <span className="font-medium text-gray-900">{warranty.mileageLimit?.toLocaleString()} miles</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="w-full py-2 px-4 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesTab({ data }: { data: CustomerPortalData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Service History</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FileText className="w-4 h-4" />
          <span>Download Report</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mileage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.serviceHistory.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.serviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{service.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{service.mileage.toLocaleString()} miles</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${service.cost}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BillingTab({ data }: { data: CustomerPortalData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Billing & Invoices</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <CreditCard className="w-4 h-4" />
          <span>Payment Methods</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${invoice.total}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.dueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">View</button>
                    <button className="text-green-600 hover:text-green-900">Pay</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
