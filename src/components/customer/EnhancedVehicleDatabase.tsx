import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Wrench, 
  Calendar, 
  Gauge, 
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  mileage: number;
  color: string;
  lastServiceDate: string;
  nextServiceDate: string;
  estimatedValue: number;
  status: 'active' | 'inactive' | 'maintenance';
  serviceHistory: ServiceRecord[];
}

interface ServiceRecord {
  id: string;
  date: string;
  serviceType: string;
  description: string;
  cost: number;
  mileage: number;
}

interface EnhancedVehicleDatabaseProps {
  customerId: string;
}

export default function EnhancedVehicleDatabase({ 
  customerId 
}: EnhancedVehicleDatabaseProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadVehicles();
  }, [customerId]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockVehicles: Vehicle[] = [
        {
          id: '1',
          make: 'Honda',
          model: 'Civic',
          year: 2020,
          vin: '1HGBH41JXMN109186',
          licensePlate: 'ABC123',
          mileage: 45000,
          color: 'Blue',
          lastServiceDate: '2024-01-15',
          nextServiceDate: '2024-04-15',
          estimatedValue: 18500,
          status: 'active',
          serviceHistory: [
            {
              id: '1',
              date: '2024-01-15',
              serviceType: 'Oil Change',
              description: 'Synthetic oil change and filter replacement',
              cost: 45.00,
              mileage: 45000
            },
            {
              id: '2',
              date: '2023-10-20',
              serviceType: 'Brake Service',
              description: 'Front brake pad replacement',
              cost: 285.00,
              mileage: 42000
            }
          ]
        },
        {
          id: '2',
          make: 'Toyota',
          model: 'Camry',
          year: 2018,
          vin: '4T1B11HK5JU123456',
          licensePlate: 'XYZ789',
          mileage: 78000,
          color: 'Silver',
          lastServiceDate: '2024-01-10',
          nextServiceDate: '2024-03-10',
          estimatedValue: 16500,
          status: 'maintenance',
          serviceHistory: [
            {
              id: '3',
              date: '2024-01-10',
              serviceType: 'Timing Belt',
              description: 'Timing belt replacement',
              cost: 650.00,
              mileage: 78000
            }
          ]
        }
      ];
      
      setVehicles(mockVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getTotalServiceCost = (vehicle: Vehicle) => {
    return vehicle.serviceHistory.reduce((sum, service) => sum + service.cost, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Database</h2>
          <p className="text-gray-600">Manage your vehicle fleet and maintenance schedules</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Vehicle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {vehicles.filter(v => v.status === 'active').length} active
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(vehicles.reduce((sum, v) => sum + v.estimatedValue, 0))}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Average: {formatCurrency(vehicles.reduce((sum, v) => sum + v.estimatedValue, 0) / vehicles.length)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mileage</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.reduce((sum, v) => sum + v.mileage, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Gauge className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Average: {Math.round(vehicles.reduce((sum, v) => sum + v.mileage, 0) / vehicles.length).toLocaleString()} miles
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Service Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(vehicles.reduce((sum, v) => sum + getTotalServiceCost(v), 0))}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Across all vehicles
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vehicles by make, model, or license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="space-y-4">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Car className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {vehicle.licensePlate} • {vehicle.color} • {vehicle.mileage.toLocaleString()} miles
                    </p>
                    <p className="text-xs text-gray-500">
                      VIN: {vehicle.vin}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Estimated Value</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(vehicle.estimatedValue)}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Last Service</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(vehicle.lastServiceDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Next Service</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(vehicle.nextServiceDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Service Count</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle.serviceHistory.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Service Cost</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(getTotalServiceCost(vehicle))}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    View Details
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    <Edit className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Service History
                  </button>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Cost Analysis */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Cost Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Service Cost</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(getTotalServiceCost(vehicle))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Service Count</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicle.serviceHistory.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Cost per Service</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(getTotalServiceCost(vehicle) / vehicle.serviceHistory.length)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
