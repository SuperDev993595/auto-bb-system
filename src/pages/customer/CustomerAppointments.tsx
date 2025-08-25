import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { customerApiService, Appointment as AppointmentType, Vehicle as VehicleType } from '../../services/customerApi';
import ConfirmDialog from '../../components/Shared/ConfirmDialog';
import { Calendar, Clock, Truck, Cog, User, Flag, FileText, Lightbulb, AlertTriangle, CheckCircle, Wrench, DollarSign, X, Clipboard } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../redux';
import ModalWrapper from '../../utils/ModalWrapper';

interface Appointment {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceType: string;
  vehicleId: string;
  vehicleInfo?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  estimatedDuration?: string;
  notes?: string;
  technician?: string;
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentFormData {
  scheduledDate: string;
  scheduledTime: string;
  serviceType: string;
  vehicleId: string;
  notes: string;
  status: string;
  estimatedDuration: string;
  priority: string;
  technicianId: string;
}

export default function CustomerAppointments() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentType | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);
  const [formData, setFormData] = useState<AppointmentFormData>({
    scheduledDate: '',
    scheduledTime: '',
    serviceType: '',
    vehicleId: '',
    notes: '',
    status: 'scheduled',
    estimatedDuration: '60',
    priority: 'medium',
    technicianId: ''
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

  const serviceTypes = [
    'Oil Change & Inspection',
    'Brake Service',
    'Tire Rotation',
    'Tire Replacement',
    'Battery Replacement',
    'Air Filter Replacement',
    'Spark Plug Replacement',
    'Transmission Service',
    'Coolant Flush',
    'Power Steering Service',
    'Suspension Service',
    'Exhaust System Repair',
    'Electrical System Repair',
    'AC/Heating Service',
    'Diagnostic Service',
    'Custom Service'
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const response = await customerApiService.getTechnicians();
        if (response.success) {
          setTechnicians(response.data.technicians || []);
        } else {
          console.error('Failed to load technicians:', response.message);
          setTechnicians([]);
        }
      } catch (error) {
        console.error('Error loading technicians:', error);
        setTechnicians([]); // Set empty array instead of mock data
      }
    };

    if (technicians.length === 0) {
      loadTechnicians();
    }
  }, [technicians.length]);

  useEffect(() => {
    if (vehicles.length > 0 && appointments.length > 0) {
      generateSmartSuggestions();
    }
  }, [vehicles, appointments]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsResponse, vehiclesResponse] = await Promise.all([
        customerApiService.getAppointments(),
        customerApiService.getVehicles()
      ]);
      
      if (appointmentsResponse.success) {
        setAppointments(appointmentsResponse.data.appointments);
      } else {
        toast.error(appointmentsResponse.message || 'Failed to load appointments');
      }
      
      if (vehiclesResponse.success) {
        setVehicles(vehiclesResponse.data.vehicles);
      } else {
        toast.error(vehiclesResponse.message || 'Failed to load vehicles');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load appointments and vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSmartSuggestions = () => {
    const suggestions: any[] = [];
    const now = new Date();
    
    // Check for vehicles due for service
    vehicles.forEach(vehicle => {
      if (vehicle.nextServiceDate && new Date(vehicle.nextServiceDate) <= now) {
        suggestions.push({
          id: `service_${vehicle.id}`,
          type: 'service_due',
          title: 'Service Due Soon',
          description: `${vehicle.year} ${vehicle.make} ${vehicle.model} is due for service`,
          priority: 'high',
          action: 'Schedule Service',
          vehicleId: vehicle.id
        });
      }
    });
    
    // Check for upcoming appointments that need confirmation
    appointments.forEach(appointment => {
      if (appointment.status === 'scheduled') {
        const appointmentDate = new Date(`${appointment.scheduledDate}T${appointment.scheduledTime}`);
        const daysUntil = Math.ceil((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntil <= 2 && daysUntil > 0) {
          suggestions.push({
            id: `confirm_${appointment.id}`,
            type: 'confirmation_needed',
            title: 'Confirm Appointment',
            description: `Please confirm your appointment for ${appointment.scheduledDate}`,
            priority: 'medium',
            action: 'Confirm',
            appointmentId: appointment.id
          });
        }
      }
    });
    
    setSmartSuggestions(suggestions);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.scheduledDate || !formData.scheduledTime || !formData.serviceType || !formData.vehicleId) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    if (vehicles.length === 0) {
      toast.error('Please add a vehicle first before scheduling an appointment');
      return false;
    }
    
    const selectedDate = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const now = new Date();
    
    if (selectedDate <= now) {
      toast.error('Please select a future date and time');
      return false;
    }

    // Validate duration
    const duration = parseInt(formData.estimatedDuration);
    if (isNaN(duration) || duration < 15 || duration > 480) {
      toast.error('Duration must be between 15 and 480 minutes');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const appointmentData = {
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        serviceType: formData.serviceType,
        vehicleId: formData.vehicleId,
        notes: formData.notes.trim() || undefined,
        status: formData.status as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
        estimatedDuration: formData.estimatedDuration,
        priority: formData.priority,
        technicianId: formData.technicianId || undefined
      };

      if (editingAppointment) {
        // Update existing appointment
        const response = await customerApiService.updateAppointment(editingAppointment.id, appointmentData);
        if (response.success) {
          toast.success('Appointment updated successfully');
        } else {
          toast.error(response.message || 'Failed to update appointment');
        }
      } else {
        // Add new appointment
        const response = await customerApiService.createAppointment(appointmentData);
        if (response.success) {
          toast.success('Appointment scheduled successfully');
        } else {
          toast.error(response.message || 'Failed to create appointment');
        }
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Failed to save appointment');
    }
  };

  const handleEdit = (appointment: AppointmentType) => {
    setEditingAppointment(appointment);
    setFormData({
      scheduledDate: appointment.scheduledDate.split('T')[0],
      scheduledTime: appointment.scheduledTime,
      serviceType: appointment.serviceType,
      vehicleId: appointment.vehicleId,
      notes: appointment.notes || '',
      status: appointment.status,
      estimatedDuration: appointment.estimatedDuration || '60',
      priority: 'medium',
      technicianId: appointment.technician || ''
    });
    setShowAddModal(true);
  };

  const handleCancel = async (appointmentId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment? This action cannot be undone.',
      type: 'warning',
      onConfirm: async () => {
        try {
          const response = await customerApiService.cancelAppointment(appointmentId);
          if (response.success) {
            await loadData();
            toast.success('Appointment cancelled successfully');
          } else {
            toast.error(response.message || 'Failed to cancel appointment');
          }
        } catch (error) {
          console.error('Error cancelling appointment:', error);
          toast.error('Failed to cancel appointment');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSuggestionAction = async (suggestion: any) => {
    try {
      switch (suggestion.type) {
        case 'service_due':
          // Navigate to appointment creation with pre-filled vehicle
          setFormData({
            scheduledDate: '',
            scheduledTime: '',
            serviceType: '',
            vehicleId: suggestion.vehicleId,
            notes: `Service due for ${vehicles.find(v => v.id === suggestion.vehicleId)?.year} ${vehicles.find(v => v.id === suggestion.vehicleId)?.make} ${vehicles.find(v => v.id === suggestion.vehicleId)?.model}`,
            status: 'scheduled',
            estimatedDuration: '60',
            priority: 'medium',
            technicianId: ''
          });
          setShowAddModal(true);
          break;
          
        case 'confirmation_needed':
          // Confirm the appointment
          const appointmentDate = suggestion.description.split('for ')[1];
          setConfirmDialog({
            isOpen: true,
            title: 'Confirm Appointment',
            message: `Please confirm your appointment for ${appointmentDate}. This will mark your appointment as confirmed.`,
            type: 'info',
            onConfirm: async () => {
              try {
                const response = await customerApiService.confirmAppointment(suggestion.appointmentId);
                if (response.success) {
                  toast.success('Appointment confirmed successfully!');
                  // Reload data to update the appointment status
                  await loadData();
                  // Remove the suggestion from the list
                  setSmartSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                } else {
                  toast.error(response.message || 'Failed to confirm appointment');
                }
              } catch (error) {
                console.error('Error confirming appointment:', error);
                toast.error('Failed to confirm appointment');
              }
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            }
          });
          break;
          
        default:
          console.log('Unknown suggestion type:', suggestion.type);
      }
    } catch (error) {
      console.error('Error handling suggestion action:', error);
      toast.error('Failed to process action');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingAppointment(null);
    setFormData({
      scheduledDate: '',
      scheduledTime: '',
      serviceType: '',
      vehicleId: '',
      notes: '',
      status: 'scheduled',
      estimatedDuration: '60',
      priority: 'medium',
      technicianId: ''
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-6 h-6 text-blue-600" />;
      case 'in-progress': return <Wrench className="w-6 h-6 text-yellow-600" />;
      case 'completed': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled': return <X className="w-6 h-6 text-red-600" />;
      default: return <Clipboard className="w-6 h-6 text-gray-600" />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(`${appointment.scheduledDate}T${appointment.scheduledTime}`);
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return appointmentDate > now && appointment.status !== 'cancelled';
      case 'past':
        return appointmentDate <= now || appointment.status === 'completed';
      case 'all':
        return true;
      default:
        return true;
    }
  });

  const upcomingAppointments = appointments.filter(a => {
    const appointmentDate = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
    return appointmentDate > new Date() && a.status !== 'cancelled';
  });

  const pastAppointments = appointments.filter(a => {
    const appointmentDate = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
    return appointmentDate <= new Date() || a.status === 'completed';
  });

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
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-l-4 border-green-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">Schedule and manage your service appointments</p>
            
            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                {smartSuggestions.slice(0, 2).map((suggestion) => (
                  <div key={suggestion.id} className="flex items-center text-sm text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {suggestion.description}
                    <button 
                      className="ml-2 text-amber-800 underline hover:text-amber-900"
                      onClick={() => handleSuggestionAction(suggestion)}
                    >
                      {suggestion.action}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* No Vehicles Warning */}
            {vehicles.length === 0 && (
              <div className="mt-3 flex items-center text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4 mr-2" />
                No vehicles found. Please add a vehicle first to schedule appointments.
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            disabled={vehicles.length === 0}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg transition-all duration-200 ${
              vehicles.length === 0 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>
              {vehicles.length === 0 ? 'No Vehicles Available' : 'Schedule Appointment'}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wrench className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${appointments
                  .filter(a => a.status === 'completed' && a.totalCost)
                  .reduce((sum, a) => sum + (a.totalCost || 0), 0)
                  .toFixed(2)
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'upcoming', label: 'Upcoming', count: upcomingAppointments.length },
              { key: 'past', label: 'Past', count: pastAppointments.length },
              { key: 'all', label: 'All', count: appointments.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Appointments List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
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
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(appointment.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          #{appointment.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.estimatedDuration}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(() => {
                      const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
                      return vehicle ? (
                        <div>
                          <div className="font-medium">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {vehicle.licensePlate} • {vehicle.mileage.toLocaleString()} mi
                          </div>
                        </div>
                      ) : (
                        <span className="text-red-600">Unknown Vehicle</span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.serviceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {new Date(appointment.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        {appointment.scheduledTime}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {appointment.totalCost ? `$${appointment.totalCost.toFixed(2)}` : 'TBD'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {appointment.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {appointment.status === 'completed' && (
                      <button className="text-green-600 hover:text-green-900">
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' 
                ? vehicles.length === 0 
                  ? 'Add a vehicle first to schedule appointments'
                  : 'Schedule your first appointment to get started'
                : 'Your completed appointments will appear here'
              }
            </p>
            {activeTab === 'upcoming' && (
              <div className="space-y-2">
                {vehicles.length === 0 ? (
                  <button
                    onClick={() => window.location.href = '/customer/vehicles'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Vehicle
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Schedule Appointment
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Appointment Modal */}
      {showAddModal && (
        <ModalWrapper
          isOpen={showAddModal}
          onClose={handleCloseModal}
          title={editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
          icon={<Calendar className="w-5 h-5" />}
          submitText={editingAppointment ? 'Update Appointment' : 'Schedule Appointment'}
          onSubmit={handleSubmit}
          submitColor="bg-blue-600"
          size="xl"
                 >
           <div className="p-6 space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time *
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                />
              </div>
            </div>
            
            {/* Vehicle Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Vehicle *
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                disabled={vehicles.length === 0}
              >
                <option value="">
                  {vehicles.length === 0 ? 'No vehicles available' : 'Select a vehicle'}
                </option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate} ({vehicle.mileage.toLocaleString()} mi)
                  </option>
                ))}
              </select>
              {vehicles.length === 0 && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Please add a vehicle first before scheduling an appointment.
                </p>
              )}
            </div>
            
            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Cog className="w-4 h-4" />
                Service Type *
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
              >
                <option value="">Select a service</option>
                {serviceTypes.map(service => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            {/* Technician Assignment */}
            <div> 
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assign Technician
              </label>
              <select
                name="technicianId"
                value={formData.technicianId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
              >
                <option value="">Select a technician (optional)</option>
                {technicians.filter(tech => tech.isActive).map((technician) => {
                  const techId = (technician as any).id || (technician as any)._id;
                  const specializations = (technician as any).specializations || (technician as any).specialization || [];
                  return (
                    <option key={techId} value={techId}>
                      {technician.name} - {Array.isArray(specializations) ? specializations.join(', ') : specializations}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-500 mt-2">Choose a technician to assign to this appointment</p>
            </div>

            {/* Duration and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="estimatedDuration"
                  min="15"
                  max="480"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                  placeholder="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clipboard className="w-4 h-4" />
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white resize-none"
                placeholder="Any special requests or additional information..."
              />
            </div>
          </div>
        </ModalWrapper>
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
