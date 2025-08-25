import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { customerApiService, ServiceRecord as ServiceRecordType, Vehicle as VehicleType } from '../../services/customerApi';
import { Wrench, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface ServiceRecord {
  id: string;
  date: string;
  vehicleId: string;
  vehicleInfo: string;
  serviceType: string;
  description: string;
  technician: string;
  mileage: number;
  cost: number;
  nextServiceDate?: string;
  nextServiceMileage?: number;
  status: 'completed' | 'in-progress' | 'scheduled';
  parts?: string[];
  notes?: string;
  warranty?: string;
}

interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  vehicleInfo: string;
  serviceType: string;
  recommendedInterval: string;
  lastServiceDate: string;
  lastServiceMileage: number;
  nextServiceDate: string;
  nextServiceMileage: number;
  status: 'due' | 'upcoming' | 'overdue';
}

export default function CustomerServices() {
  const { user } = useAuth();
  const [serviceRecords, setServiceRecords] = useState<ServiceRecordType[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule[]>([]);
  const [smartRecommendations, setSmartRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'schedule' | 'recommendations'>('history');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0 && serviceRecords.length > 0) {
      generateSmartRecommendations();
    }
  }, [vehicles, serviceRecords]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [servicesResponse, vehiclesResponse] = await Promise.all([
        customerApiService.getServices(),
        customerApiService.getVehicles()
      ]);
      
      if (servicesResponse.success) {
        setServiceRecords(servicesResponse.data.services);
      } else {
        toast.error(servicesResponse.message || 'Failed to load services');
      }
      
      if (vehiclesResponse.success) {
        setVehicles(vehiclesResponse.data.vehicles);
      } else {
        toast.error(vehiclesResponse.message || 'Failed to load vehicles');
      }
      
      // Generate maintenance schedule from vehicles and services
      const vehicles = vehiclesResponse.success ? vehiclesResponse.data.vehicles : [];
      const services = servicesResponse.success ? servicesResponse.data.services : [];
      const schedule = generateMaintenanceSchedule(vehicles, services);
      setMaintenanceSchedule(schedule);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load service data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMaintenanceSchedule = (vehicles: VehicleType[], services: ServiceRecordType[]): MaintenanceSchedule[] => {
    const schedule: MaintenanceSchedule[] = [];
    
    vehicles.forEach(vehicle => {
      const vehicleServices = services.filter(s => s.vehicleId === vehicle.id);
      const lastService = vehicleServices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      // Generate maintenance schedule based on vehicle and last service
      const oilChangeSchedule: MaintenanceSchedule = {
        id: `oil-${vehicle.id}`,
        vehicleId: vehicle.id,
        vehicleInfo: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        serviceType: 'Oil Change & Inspection',
        recommendedInterval: 'Every 3,000 miles or 3 months',
        lastServiceDate: lastService?.date || vehicle.lastServiceDate || new Date().toISOString().split('T')[0],
        lastServiceMileage: lastService?.mileage || vehicle.lastServiceMileage || vehicle.mileage,
        nextServiceDate: vehicle.nextServiceDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextServiceMileage: vehicle.nextServiceMileage || (vehicle.mileage + 3000),
        status: vehicle.nextServiceDate && new Date(vehicle.nextServiceDate) <= new Date() ? 'overdue' : 'upcoming'
      };
      
      schedule.push(oilChangeSchedule);
    });
    
    return schedule;
  };

  const generateSmartRecommendations = () => {
    const recommendations: any[] = [];
    
    vehicles.forEach(vehicle => {
      const vehicleServices = serviceRecords.filter(s => s.vehicleId === vehicle.id);
      const lastService = vehicleServices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      // Check if vehicle needs immediate attention
      if (vehicle.nextServiceDate && new Date(vehicle.nextServiceDate) <= new Date()) {
        recommendations.push({
          id: `urgent_${vehicle.id}`,
          type: 'urgent_service',
          title: 'Service Overdue',
          description: `${vehicle.year} ${vehicle.make} ${vehicle.model} is overdue for service`,
          priority: 'urgent',
          estimatedCost: 150,
          action: 'Schedule Now',
          vehicleId: vehicle.id
        });
      }
      
      // Check for seasonal maintenance
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 8 || currentMonth <= 2) { // Fall/Winter
        recommendations.push({
          id: `seasonal_${vehicle.id}`,
          type: 'seasonal_maintenance',
          title: 'Winter Preparation',
          description: 'Prepare your vehicle for winter conditions',
          priority: 'medium',
          estimatedCost: 200,
          action: 'Learn More',
          vehicleId: vehicle.id
        });
      }
      
      // Check for high-mileage services
      if (vehicle.mileage > 100000) {
        recommendations.push({
          id: `high_mileage_${vehicle.id}`,
          type: 'high_mileage',
          title: 'High Mileage Service',
          description: 'Your vehicle may need additional attention due to high mileage',
          priority: 'high',
          estimatedCost: 300,
          action: 'Schedule Inspection',
          vehicleId: vehicle.id
        });
      }
    });
    
    setSmartRecommendations(recommendations);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'due': return 'text-orange-600 bg-orange-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔧';
      case 'scheduled': return '📅';
      case 'due': return '⚠️';
      case 'upcoming': return '📋';
      case 'overdue': return '🚨';
      default: return '📋';
    }
  };

  const filteredServiceRecords = selectedVehicle === 'all' 
    ? serviceRecords 
    : serviceRecords.filter(record => record.vehicleId === selectedVehicle);

  const filteredMaintenanceSchedule = selectedVehicle === 'all'
    ? maintenanceSchedule
    : maintenanceSchedule.filter(schedule => schedule.vehicleId === selectedVehicle);

  const totalSpent = serviceRecords.reduce((sum, record) => sum + record.cost, 0);
  const completedServices = serviceRecords.filter(record => record.status === 'completed').length;
  const upcomingServices = maintenanceSchedule.filter(schedule => schedule.status === 'upcoming').length;
  const overdueServices = maintenanceSchedule.filter(schedule => schedule.status === 'overdue').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service History</h1>
          <p className="text-gray-600">View your vehicle maintenance records and schedules</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🔧</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{serviceRecords.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedServices}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingServices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="tab-header">
          <nav className="tab-buttons">
            {[
              { key: 'history', label: 'Service History', count: filteredServiceRecords.length },
              { key: 'schedule', label: 'Maintenance Schedule', count: filteredMaintenanceSchedule.length },
              { key: 'recommendations', label: 'Recommendations', count: overdueServices }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`tab-button ${activeTab === tab.key ? 'tab-button-active' : 'tab-button-inactive'}`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'history' && (
            <div className="space-y-4">
              {filteredServiceRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStatusIcon(record.status)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{record.serviceType}</h3>
                        <p className="text-sm text-gray-600">
                          {(() => {
                            const vehicle = vehicles.find(v => v.id === record.vehicleId);
                            return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">${record.cost.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{record.mileage.toLocaleString()} mi</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Technician</p>
                      <p className="font-medium">{record.technician}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-medium">{record.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  {record.parts && record.parts.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Parts Used:</p>
                      <div className="flex flex-wrap gap-2">
                        {record.parts.map((part, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {record.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {record.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div>
                      {record.warranty && (
                        <span>Warranty: {record.warranty}</span>
                      )}
                    </div>
                    <div>
                      {record.nextServiceDate && (
                        <span>Next Service: {new Date(record.nextServiceDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredServiceRecords.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Wrench className="w-12 h-12 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No service records found</h3>
                  <p className="text-gray-600">Your service history will appear here after your first service appointment.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {filteredMaintenanceSchedule.map((schedule) => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStatusIcon(schedule.status)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{schedule.serviceType}</h3>
                        <p className="text-sm text-gray-600">{schedule.vehicleInfo}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(schedule.status)}`}>
                      {schedule.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Recommended Interval</p>
                      <p className="font-medium">{schedule.recommendedInterval}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Service</p>
                      <p className="font-medium">
                        {new Date(schedule.lastServiceDate).toLocaleDateString()} 
                        <span className="text-gray-500 ml-2">({schedule.lastServiceMileage.toLocaleString()} mi)</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Service</p>
                      <p className="font-medium">
                        {new Date(schedule.nextServiceDate).toLocaleDateString()}
                        <span className="text-gray-500 ml-2">({schedule.nextServiceMileage.toLocaleString()} mi)</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium capitalize">{schedule.status}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                      Schedule Service
                    </button>
                  </div>
                </div>
              ))}

              {filteredMaintenanceSchedule.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-12 h-12 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance schedule found</h3>
                  <p className="text-gray-600">Your maintenance schedule will be created based on your vehicle and service history.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              {overdueServices > 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="w-6 h-6 mr-3 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-yellow-800">Maintenance Recommendations</h3>
                  </div>
                  <p className="text-yellow-700 mb-4">
                    You have {overdueServices} service(s) that are overdue. We recommend scheduling these services soon to maintain your vehicle's performance and safety.
                  </p>
                  <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg">
                    Schedule Overdue Services
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">All Up to Date</h3>
                  </div>
                  <p className="text-green-700">
                    Great job! Your vehicle maintenance is current. Continue following the recommended service intervals to keep your vehicle in optimal condition.
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Service Tips</h3>
                <ul className="space-y-2 text-blue-700">
                  <li>• Regular oil changes help maintain engine performance and longevity</li>
                  <li>• Brake inspections every 6 months ensure safety</li>
                  <li>• Tire rotations every 6,000 miles promote even wear</li>
                  <li>• Keep records of all services for warranty purposes</li>
                  <li>• Address warning lights promptly to prevent costly repairs</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
