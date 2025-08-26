import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { customerApiService, Vehicle as VehicleType } from '../../services/customerApi';
import ConfirmDialog from '../../components/Shared/ConfirmDialog';
import AddEditVehicleModal from '../../components/customers/modal/AddEditVehicleModal';
import { CheckCircle, FileText, Car, AlertTriangle, Wrench, TrendingUp, Droplets, RotateCcw, Shield, Clock, Wind, Zap } from '../../utils/icons';

interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  lastServiceDate?: string;
  nextServiceDate?: string;
  status: 'active' | 'inactive';
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
}

interface VehicleFormData {
  year: string;
  make: string;
  model: string;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  status: string;
}

interface MaintenanceAlert {
  id: string;
  vehicleId: string;
  type: 'oil_change' | 'tire_rotation' | 'brake_service' | 'timing_belt' | 'air_filter' | 'spark_plugs';
  title: string;
  description: string;
  dueMileage: number;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  isOverdue: boolean;
}

interface ServiceHistory {
  id: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  date: string;
  mileage: number;
  cost: number;
  technician: string;
  notes: string;
}

export default function CustomerVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleType | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'history'>('overview');
  const [formData, setFormData] = useState<VehicleFormData>({
    year: '',
    make: '',
    model: '',
    vin: '',
    licensePlate: '',
    color: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    status: 'active'
  });

  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      generateMaintenanceAlerts();
      generateServiceHistory();
    }
  }, [vehicles]);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
          const response = await customerApiService.getVehicles();
    if (response.success) {
      setVehicles(response.data.vehicles);
    } else {
      toast.error(response.message || 'Failed to load vehicles');
    }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          toast.error('Please login again to access your vehicles');
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          toast.error('Server error. Please try again later.');
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          toast.error('Cannot connect to server. Please check your connection.');
        } else {
          toast.error(`Failed to load vehicles: ${error.message}`);
        }
      } else {
        toast.error('Failed to load vehicles');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateMaintenanceAlerts = () => {
    const alerts: MaintenanceAlert[] = [];
    
    vehicles.forEach(vehicle => {
      const currentMileage = vehicle.mileage;
      
      // Oil change every 5,000 miles
      if (currentMileage % 5000 < 500) {
        alerts.push({
          id: `oil_${vehicle.id}`,
          vehicleId: vehicle.id,
          type: 'oil_change',
          title: 'Oil Change Due',
          description: `${vehicle.year} ${vehicle.make} ${vehicle.model} is due for an oil change`,
          dueMileage: Math.ceil(currentMileage / 5000) * 5000,
          priority: currentMileage % 5000 < 100 ? 'urgent' : 'high',
          estimatedCost: 35,
          isOverdue: currentMileage % 5000 > 1000
        });
      }
      
      // Tire rotation every 6,000 miles
      if (currentMileage % 6000 < 500) {
        alerts.push({
          id: `tire_${vehicle.id}`,
          vehicleId: vehicle.id,
          type: 'tire_rotation',
          title: 'Tire Rotation Due',
          description: `${vehicle.year} ${vehicle.make} ${vehicle.model} needs tire rotation`,
          dueMileage: Math.ceil(currentMileage / 6000) * 6000,
          priority: currentMileage % 6000 < 100 ? 'high' : 'medium',
          estimatedCost: 45,
          isOverdue: currentMileage % 6000 > 1000
        });
      }
      
      // Brake service every 20,000 miles
      if (currentMileage % 20000 < 1000) {
        alerts.push({
          id: `brake_${vehicle.id}`,
          vehicleId: vehicle.id,
          type: 'brake_service',
          title: 'Brake Service Due',
          description: `${vehicle.year} ${vehicle.make} ${vehicle.model} brake inspection needed`,
          dueMileage: Math.ceil(currentMileage / 20000) * 20000,
          priority: currentMileage % 20000 < 500 ? 'urgent' : 'high',
          estimatedCost: 120,
          isOverdue: currentMileage % 20000 > 2000
        });
      }
    });
    
    setMaintenanceAlerts(alerts);
  };

  const generateServiceHistory = () => {
    const history: ServiceHistory[] = [];
    
    vehicles.forEach(vehicle => {
      if (vehicle.lastServiceDate) {
        history.push({
          id: `service_${vehicle.id}_1`,
          vehicleId: vehicle.id,
          serviceType: 'Oil Change & Inspection',
          description: 'Regular maintenance service',
          date: vehicle.lastServiceDate,
          mileage: vehicle.mileage - 5000,
          cost: 85,
          technician: 'Mike Johnson',
          notes: 'All systems checked, vehicle in good condition'
        });
      }
    });
    
    setServiceHistory(history);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.year || !formData.make || !formData.model || !formData.vin || !formData.licensePlate || !formData.color || !formData.mileage) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (formData.vin.length !== 17) {
      toast.error('VIN must be 17 characters long');
      return false;
    }
    
    // Check for duplicate VIN (only for new vehicles)
    if (!editingVehicle) {
      const existingVehicle = vehicles.find(v => v.vin.toUpperCase() === formData.vin.toUpperCase());
      if (existingVehicle) {
        toast.error('A vehicle with this VIN already exists');
        return false;
      }
    }
    
    // Validate year
    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.year);
    if (year < 1900 || year > currentYear + 1) {
      toast.error(`Year must be between 1900 and ${currentYear + 1}`);
      return false;
    }
    
    // Validate mileage
    const mileage = parseInt(formData.mileage);
    if (mileage < 0) {
      toast.error('Mileage must be a positive number');
      return false;
    }
    
    return true;
  };

  const validateFormData = (data: VehicleFormData) => {
    if (!data.year || !data.make || !data.model || !data.vin || !data.licensePlate || !data.color || !data.mileage) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (data.vin.length !== 17) {
      toast.error('VIN must be 17 characters long');
      return false;
    }
    
    // Check for duplicate VIN (only for new vehicles)
    if (!editingVehicle) {
      const existingVehicle = vehicles.find(v => v.vin.toUpperCase() === data.vin.toUpperCase());
      if (existingVehicle) {
        toast.error('A vehicle with this VIN already exists');
        return false;
      }
    }
    
    // Validate year
    const currentYear = new Date().getFullYear();
    const year = parseInt(data.year);
    if (year < 1900 || year > currentYear + 1) {
      toast.error(`Year must be between 1900 and ${currentYear + 1}`);
      return false;
    }
    
    // Validate mileage
    const mileage = parseInt(data.mileage);
    if (mileage < 0) {
      toast.error('Mileage must be a positive number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const vehicleData = {
        year: parseInt(formData.year),
        make: formData.make,
        model: formData.model,
        vin: formData.vin.toUpperCase(),
        licensePlate: formData.licensePlate.toUpperCase(),
        color: formData.color,
        mileage: parseInt(formData.mileage),
        status: formData.status as 'active' | 'inactive' | 'maintenance'
      };

      if (editingVehicle) {
        const response = await customerApiService.updateVehicle(editingVehicle.id, vehicleData);
        if (response.success) {
          toast.success('Vehicle updated successfully');
        } else {
          toast.error(response.message || 'Failed to update vehicle');
        }
      } else {
        const response = await customerApiService.addVehicle(vehicleData);
        if (response.success) {
          toast.success('Vehicle added successfully');
        } else {
          toast.error(response.message || 'Failed to add vehicle');
        }
      }

      await loadVehicles();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid vehicle data';
        console.log('Validation error details:', error.response.data);
        toast.error(`Validation Error: ${errorMessage}`);
      } else if (error.response?.status === 409) {
        toast.error('A vehicle with this VIN already exists');
      } else if (error.message?.includes('E11000') || error.message?.includes('duplicate key')) {
        toast.error('A vehicle with this VIN already exists in the database');
      } else {
        toast.error('Failed to save vehicle. Please try again.');
      }
    }
  };

  const handleModalSubmit = (data: VehicleFormData) => {
    // Validate the data directly
    if (!validateFormData(data)) return;

    const submitData = async () => {
      try {
        const vehicleData = {
          year: parseInt(data.year),
          make: data.make,
          model: data.model,
          vin: data.vin.toUpperCase(),
          licensePlate: data.licensePlate.toUpperCase(),
          color: data.color,
          mileage: parseInt(data.mileage),
          fuelType: data.fuelType,
          transmission: data.transmission,
          status: data.status as 'active' | 'inactive' | 'maintenance'
        };

        if (editingVehicle) {
          const response = await customerApiService.updateVehicle(editingVehicle.id, vehicleData);
          if (response.success) {
            toast.success('Vehicle updated successfully');
          } else {
            toast.error(response.message || 'Failed to update vehicle');
          }
        } else {
          const response = await customerApiService.addVehicle(vehicleData);
          if (response.success) {
            toast.success('Vehicle added successfully');
          } else {
            toast.error(response.message || 'Failed to add vehicle');
          }
        }

        await loadVehicles();
        handleCloseModal();
      } catch (error) {
        console.error('Error submitting vehicle:', error);
        toast.error('An error occurred while saving the vehicle');
      }
    };

    submitData();
  };

  const handleEdit = (vehicle: VehicleType) => {
    setEditingVehicle(vehicle);
    setFormData({
      year: vehicle.year.toString(),
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate,
      color: vehicle.color,
      mileage: vehicle.mileage.toString(),
      fuelType: vehicle.fuelType || '',
      transmission: vehicle.transmission || '',
      status: vehicle.status || 'active'
    });
    setShowAddModal(true);
  };

  const handleDelete = async (vehicleId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Vehicle',
      message: 'Are you sure you want to delete this vehicle? This action cannot be undone and will remove all associated data.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await customerApiService.deleteVehicle(vehicleId);
          if (response.success) {
            await loadVehicles();
            toast.success('Vehicle deleted successfully');
          } else {
            toast.error(response.message || 'Failed to delete vehicle');
          }
        } catch (error) {
          console.error('Error deleting vehicle:', error);
          toast.error('Failed to delete vehicle');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingVehicle(null);
    setFormData({
      year: '',
      make: '',
      model: '',
      vin: '',
      licensePlate: '',
      color: '',
      mileage: '',
      fuelType: '',
      transmission: '',
      status: 'active'
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMaintenanceIcon = (type: string) => {
    switch (type) {
      case 'oil_change': return <Droplets className="w-6 h-6 text-blue-600" />;
      case 'tire_rotation': return <RotateCcw className="w-6 h-6 text-green-600" />;
      case 'brake_service': return <Shield className="w-6 h-6 text-red-600" />;
      case 'timing_belt': return <Clock className="w-6 h-6 text-orange-600" />;
      case 'air_filter': return <Wind className="w-6 h-6 text-gray-600" />;
      case 'spark_plugs': return <Zap className="w-6 h-6 text-yellow-600" />;
      default: return <Wrench className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
            <p className="text-gray-600">Manage your registered vehicles and maintenance</p>
            
            {/* Smart Alerts Summary */}
            {maintenanceAlerts.length > 0 && (
              <div className="mt-3 flex items-center space-x-4">
                <div className="flex items-center text-sm text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {maintenanceAlerts.filter(a => a.priority === 'urgent').length} urgent maintenance items
                </div>
                <div className="flex items-center text-sm text-orange-700 bg-orange-100 px-3 py-2 rounded-lg">
                  <Wrench className="w-4 h-4 mr-2" />
                  {maintenanceAlerts.length} total maintenance alerts
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Car className="w-5 h-5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Due for Service</p>
              <p className="text-2xl font-bold text-gray-900">
                {maintenanceAlerts.filter(a => a.isOverdue).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Mileage</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.length > 0 
                  ? Math.round(vehicles.reduce((sum, v) => sum + v.mileage, 0) / vehicles.length).toLocaleString()
                  : '0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="tab-header">
          <nav className="tab-buttons">
            <button
              onClick={() => setActiveTab('overview')}
              className={`tab-button ${activeTab === 'overview' ? 'tab-button-active' : 'tab-button-inactive'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`tab-button ${activeTab === 'maintenance' ? 'tab-button-active' : 'tab-button-inactive'}`}
            >
              Maintenance Alerts
              {maintenanceAlerts.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {maintenanceAlerts.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`tab-button ${activeTab === 'history' ? 'tab-button-active' : 'tab-button-inactive'}`}
            >
              Service History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Vehicles List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr key="header">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VIN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        License Plate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mileage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Service
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
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">{vehicle.color}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {vehicle.vin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {vehicle.licensePlate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle.mileage.toLocaleString()} mi
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vehicle.nextServiceDate ? (
                            <span className={new Date(vehicle.nextServiceDate) <= new Date() ? 'text-red-600 font-medium' : ''}>
                              {new Date(vehicle.nextServiceDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not scheduled</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Empty State */}
                {vehicles.length === 0 && (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Car className="w-12 h-12 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                    <p className="text-gray-600 mb-6">You haven't added any vehicles yet. Add your first vehicle to get started.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto"
                    >
                      <Car className="w-5 h-5" />
                      <span>Add Your First Vehicle</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Alerts</h3>
              
              {maintenanceAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-600">No maintenance items due at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceAlerts
                    .sort((a, b) => {
                      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map((alert) => {
                      const vehicle = vehicles.find(v => v.id === alert.vehicleId);
                      return (
                        <div key={alert.id} className={`border rounded-lg p-4 ${
                          alert.isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                        }`}>
                          <div className="flex items-start justify-between">
                                                      <div className="flex items-start space-x-3">
                            {getMaintenanceIcon(alert.type)}
                              <div>
                                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                                <p className="text-sm text-gray-600">{alert.description}</p>
                                {vehicle && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Due at: {alert.dueMileage.toLocaleString()} miles
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(alert.priority)}`}>
                                {alert.priority}
                              </span>
                              <div className="text-right">
                                <p className="text-sm font-medium text-green-600">
                                  Est. {formatCurrency(alert.estimatedCost)}
                                </p>
                                {alert.isOverdue && (
                                  <p className="text-xs text-red-600 font-medium">Overdue</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service History</h3>
              
              {serviceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No service history</h3>
                  <p className="text-gray-600">Service records will appear here after your first visit.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceHistory.map((service) => {
                    const vehicle = vehicles.find(v => v.id === service.vehicleId);
                    return (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{service.serviceType}</h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                            {vehicle && (
                              <p className="text-xs text-gray-500 mt-1">
                                Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Technician: {service.technician}
                            </p>
                            {service.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">"{service.notes}"</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              {formatCurrency(service.cost)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(service.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {service.mileage.toLocaleString()} mi
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Add/Edit Vehicle Modal */}
      {showAddModal && (
        <AddEditVehicleModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
          vehicle={editingVehicle ? {
            year: editingVehicle.year.toString(),
            make: editingVehicle.make,
            model: editingVehicle.model,
            vin: editingVehicle.vin,
            licensePlate: editingVehicle.licensePlate,
            color: editingVehicle.color,
            mileage: editingVehicle.mileage.toString(),
            fuelType: editingVehicle.fuelType || '',
            transmission: editingVehicle.transmission || '',
            status: editingVehicle.status
          } : null}
          isEditing={!!editingVehicle}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={handleCloseConfirmDialog}
        type={confirmDialog.type}
      />
    </div>
  );
}
