import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Gauge, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  FileText, 
  BarChart3, 
  TrendingUp,
  Droplets,
  Thermometer,
  Battery,
  Wrench,
  Cog,
  Zap,
  DollarSign,
  Fuel
} from '../../utils/icons';

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  engineType: string;
  transmission: string;
  fuelType: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  lastServiceMileage?: number;
  nextServiceMileage?: number;
  status: 'active' | 'inactive' | 'maintenance' | 'repair';
  notes?: string;
  specifications: {
    engineSize: string;
    horsepower: number;
    torque: number;
    fuelCapacity: number;
    mpgCity: number;
    mpgHighway: number;
  };
  maintenanceHistory: ServiceRecord[];
  createdAt: string;
  updatedAt: string;
}

interface ServiceRecord {
  id: string;
  date: string;
  serviceType: string;
  description: string;
  technician: string;
  mileage: number;
  cost: number;
  nextServiceDate?: string;
  nextServiceMileage?: number;
  status: 'completed' | 'in-progress' | 'scheduled';
  parts?: Array<{
    name: string;
    partNumber?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  notes?: string;
}

interface VehicleStats {
  totalVehicles: number;
  activeVehicles: number;
  totalMileage: number;
  averageAge: number;
  totalValue: number;
  upcomingServices: number;
  overdueServices: number;
}

export default function CustomerVehicleDatabase() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleStats, setVehicleStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMake, setFilterMake] = useState('all');
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockVehicles: Vehicle[] = [
        {
          id: '1',
          year: 2020,
          make: 'Toyota',
          model: 'Camry',
          trim: 'SE',
          vin: '1HGBH41JXMN109186',
          licensePlate: 'ABC123',
          color: 'Silver',
          mileage: 45000,
          engineType: '2.5L 4-Cylinder',
          transmission: '8-Speed Automatic',
          fuelType: 'Gasoline',
          lastServiceDate: '2024-01-15',
          nextServiceDate: '2024-04-15',
          lastServiceMileage: 44000,
          nextServiceMileage: 50000,
          status: 'active',
          notes: 'Primary family vehicle',
          specifications: {
            engineSize: '2.5L',
            horsepower: 203,
            torque: 184,
            fuelCapacity: 16,
            mpgCity: 28,
            mpgHighway: 39
          },
          maintenanceHistory: [
            {
              id: '1',
              date: '2024-01-15',
              serviceType: 'Oil Change & Inspection',
              description: 'Synthetic oil change, tire rotation, multi-point inspection',
              technician: 'John Smith',
              mileage: 44000,
              cost: 89.99,
              nextServiceDate: '2024-04-15',
              nextServiceMileage: 50000,
              status: 'completed',
              parts: [
                { name: 'Synthetic Oil', quantity: 1, unitPrice: 45.99, totalPrice: 45.99 },
                { name: 'Oil Filter', quantity: 1, unitPrice: 12.99, totalPrice: 12.99 }
              ],
              notes: 'Vehicle in excellent condition'
            }
          ],
          createdAt: '2020-03-15',
          updatedAt: '2024-01-15'
        },
        {
          id: '2',
          year: 2018,
          make: 'Honda',
          model: 'Civic',
          trim: 'EX',
          vin: '2T1BURHE0JC123456',
          licensePlate: 'XYZ789',
          color: 'Blue',
          mileage: 68000,
          engineType: '1.5L Turbo 4-Cylinder',
          transmission: 'CVT',
          fuelType: 'Gasoline',
          lastServiceDate: '2023-12-10',
          nextServiceDate: '2024-03-10',
          lastServiceMileage: 65000,
          nextServiceMileage: 70000,
          status: 'maintenance',
          notes: 'Secondary vehicle, needs brake inspection',
          specifications: {
            engineSize: '1.5L Turbo',
            horsepower: 174,
            torque: 162,
            fuelCapacity: 12.4,
            mpgCity: 30,
            mpgHighway: 38
          },
          maintenanceHistory: [
            {
              id: '2',
              date: '2023-12-10',
              serviceType: 'Brake Inspection',
              description: 'Brake pad replacement, rotor inspection',
              technician: 'Mike Johnson',
              mileage: 65000,
              cost: 245.50,
              nextServiceDate: '2024-03-10',
              nextServiceMileage: 70000,
              status: 'completed',
              parts: [
                { name: 'Brake Pads (Front)', quantity: 1, unitPrice: 89.99, totalPrice: 89.99 },
                { name: 'Brake Pads (Rear)', quantity: 1, unitPrice: 79.99, totalPrice: 79.99 }
              ],
              notes: 'Brakes at 30% remaining, recommend replacement'
            }
          ],
          createdAt: '2018-06-20',
          updatedAt: '2023-12-10'
        }
      ];

      const mockStats: VehicleStats = {
        totalVehicles: 2,
        activeVehicles: 1,
        totalMileage: 113000,
        averageAge: 4.5,
        totalValue: 45000,
        upcomingServices: 2,
        overdueServices: 1
      };

      setVehicles(mockVehicles);
      setVehicleStats(mockStats);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'repair':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const formatMileage = (mileage: number) => {
    return mileage.toLocaleString();
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    const matchesMake = filterMake === 'all' || vehicle.make === filterMake;
    return matchesSearch && matchesStatus && matchesMake;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vehicle Database</h1>
              <p className="text-gray-600">Comprehensive fleet management and vehicle tracking</p>
            </div>
            <button
              onClick={() => setShowAddVehicle(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search vehicles by make, model, plate, or VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
            </select>
            <select
              value={filterMake}
              onChange={(e) => setFilterMake(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Makes</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Ford">Ford</option>
              <option value="Chevrolet">Chevrolet</option>
            </select>
          </div>
        </div>

        {/* Vehicle Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleStats?.totalVehicles}</p>
                <p className="text-sm text-gray-500">{vehicleStats?.activeVehicles} active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Gauge className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Mileage</p>
                <p className="text-2xl font-bold text-gray-900">{formatMileage(vehicleStats?.totalMileage || 0)}</p>
                <p className="text-sm text-gray-500">Avg: {formatMileage(Math.round((vehicleStats?.totalMileage || 0) / (vehicleStats?.totalVehicles || 1)))}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Upcoming Services</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleStats?.upcomingServices}</p>
                <p className="text-sm text-gray-500">{vehicleStats?.overdueServices} overdue</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(vehicleStats?.totalValue || 0)}</p>
                <p className="text-sm text-gray-500">Avg Age: {vehicleStats?.averageAge} years</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid gap-6">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Car className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {vehicle.licensePlate}
                    </div>
                    <div className="flex items-center">
                      <Gauge className="w-4 h-4 mr-1" />
                      {formatMileage(vehicle.mileage)} miles
                    </div>
                    <div className="flex items-center">
                      <Fuel className="w-4 h-4 mr-1" />
                      {vehicle.fuelType}
                    </div>
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-1" />
                      {vehicle.engineType}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Vehicle Specifications */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Engine:</span>
                    <span className="ml-1 font-medium">{vehicle.specifications.engineSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">HP:</span>
                    <span className="ml-1 font-medium">{vehicle.specifications.horsepower}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">MPG City:</span>
                    <span className="ml-1 font-medium">{vehicle.specifications.mpgCity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">MPG Highway:</span>
                    <span className="ml-1 font-medium">{vehicle.specifications.mpgHighway}</span>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-sm text-gray-500">Last Service</p>
                      <p className="text-sm font-medium text-gray-900">
                        {vehicle.lastServiceDate ? formatDate(vehicle.lastServiceDate) : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Service</p>
                      <p className="text-sm font-medium text-gray-900">
                        {vehicle.nextServiceDate ? formatDate(vehicle.nextServiceDate) : 'Not scheduled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Service History</p>
                      <p className="text-sm font-medium text-gray-900">
                        {vehicle.maintenanceHistory.length} records
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <Wrench className="w-4 h-4 mr-2" />
                      Schedule Service
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <FileText className="w-4 h-4 mr-2" />
                      View History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
