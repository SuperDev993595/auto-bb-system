import { useState, ChangeEvent, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";
import { authService } from "../../services/auth";

type AppointmentData = {
    customer: string;
    phone: string;
    vehicle: string;
    vin: string;
    licensePlate: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    date: string;
    serviceType: string;
    notes: string;
};

type Props = {
    onClose: () => void;
    onSave: (data: AppointmentData) => void;
    isLoading?: boolean;
};

// Common service types for auto-suggestions
const COMMON_SERVICES = [
    'Oil Change',
    'Brake Inspection',
    'Tire Rotation',
    'Transmission Service',
    'Battery Replacement',
    'Air Filter Replacement',
    'Spark Plug Replacement',
    'Wheel Alignment',
    'AC Service',
    'Engine Tune-up',
    'Fuel Filter Replacement',
    'Timing Belt Replacement',
    'Water Pump Replacement',
    'Radiator Flush',
    'Power Steering Fluid',
    'Brake Fluid Change',
    'Coolant Flush',
    'Exhaust System Repair',
    'Suspension Repair',
    'Electrical Diagnostics'
];

// Common vehicle makes for auto-suggestions
const VEHICLE_MAKES = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
    'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Jeep',
    'Dodge', 'Chrysler', 'Lexus', 'Acura', 'Infiniti', 'Volvo', 'Porsche'
];

export default function AppointmentModal({ onClose, onSave, isLoading = false }: Props) {
    const [form, setForm] = useState<AppointmentData>({
        customer: "",
        phone: "",
        vehicle: "",
        vin: "",
        licensePlate: "",
        address: {
            street: "",
            city: "",
            state: "",
            zipCode: ""
        },
        date: "",
        serviceType: "",
        notes: "",
    });

    const [errors, setErrors] = useState<Partial<AppointmentData>>({});
    const [addressError, setAddressError] = useState<string>('');
    const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
    const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
    const [filteredServices, setFilteredServices] = useState<string[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<string[]>([]);
    const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);
    
    const serviceInputRef = useRef<HTMLInputElement>(null);
    const vehicleInputRef = useRef<HTMLInputElement>(null);

    // Set default date to tomorrow at 9 AM
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        setForm(prev => ({
            ...prev,
            date: tomorrow.toISOString().slice(0, 16)
        }));
    }, []);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Filter services based on input
    useEffect(() => {
        if (form.serviceType) {
            const filtered = COMMON_SERVICES.filter(service =>
                service.toLowerCase().includes(form.serviceType.toLowerCase())
            );
            setFilteredServices(filtered);
            setShowServiceSuggestions(filtered.length > 0 && filtered.length < COMMON_SERVICES.length);
        } else {
            setShowServiceSuggestions(false);
        }
    }, [form.serviceType]);

    // Filter vehicles based on input
    useEffect(() => {
        if (form.vehicle) {
            const input = form.vehicle.toLowerCase().trim();
            
            // First, filter makes that match the input
            const matchingMakes = VEHICLE_MAKES.filter(make =>
                make.toLowerCase().includes(input)
            );
            
            // If input contains a year pattern, filter by year too
            const yearMatch = input.match(/\b(19|20)\d{2}\b/);
            const currentYear = new Date().getFullYear();
            const years = yearMatch 
                ? [parseInt(yearMatch[0])] 
                : Array.from({ length: 30 }, (_, i) => currentYear - i);
            
            // Generate vehicle suggestions
            const suggestions = [];
            
            // Add exact year-make matches first
            if (yearMatch) {
                suggestions.push(...matchingMakes.map(make => `${yearMatch[0]} ${make}`));
            }
            
            // Add recent years for matching makes
            const recentYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
            suggestions.push(...matchingMakes.flatMap(make =>
                recentYears.map(year => `${year} ${make}`)
            ));
            
            // Remove duplicates and limit suggestions
            const uniqueSuggestions = [...new Set(suggestions)].slice(0, 15);
            
            setFilteredVehicles(uniqueSuggestions);
            setShowVehicleSuggestions(uniqueSuggestions.length > 0);
        } else {
            setShowVehicleSuggestions(false);
        }
    }, [form.vehicle]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name as keyof AppointmentData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<AppointmentData> = {};

        if (!form.customer.trim()) {
            newErrors.customer = 'Customer name is required';
        } else if (form.customer.trim().length < 2) {
            newErrors.customer = 'Customer name must be at least 2 characters';
        }

        if (!form.vehicle.trim()) {
            newErrors.vehicle = 'Vehicle information is required';
        } else {
            // Basic vehicle validation
            const vehicleText = form.vehicle.trim();
            const parts = vehicleText.split(' ').filter(part => part.length > 0);
            
            if (parts.length < 1) {
                newErrors.vehicle = 'Please enter at least a vehicle make (e.g., Toyota, Honda)';
            } else if (parts.length === 1) {
                // Only make provided, that's okay
            } else {
                // Check if first part could be a year
                const firstPart = parts[0];
                const yearMatch = firstPart.match(/^(19|20)\d{2}$/);
                
                if (yearMatch) {
                    const year = parseInt(firstPart);
                    if (year < 1900 || year > new Date().getFullYear() + 1) {
                        newErrors.vehicle = `Invalid year: ${year}. Please enter a year between 1900 and ${new Date().getFullYear() + 1}`;
                    }
                }
            }
        }

        if (!form.date) {
            newErrors.date = 'Appointment date and time is required';
        } else {
            const selectedDate = new Date(form.date);
            const now = new Date();
            if (selectedDate < now) {
                newErrors.date = 'Please select a future date and time';
            }
        }

        if (!form.serviceType.trim()) {
            newErrors.serviceType = 'Service type is required';
        }

        // Phone validation (optional but if provided, validate format)
        if (form.phone.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone.replace(/[\s\-\(\)]/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // VIN validation (optional but if provided, validate format)
        if (form.vin.trim() && form.vin.trim().length !== 17) {
            newErrors.vin = 'VIN must be exactly 17 characters long';
        }

        // Address validation (optional but if any field is provided, validate format)
        let addressErrorMsg = '';
        if (form.address.street.trim() || form.address.city.trim() || form.address.state.trim() || form.address.zipCode.trim()) {
            if (form.address.state.trim() && form.address.state.trim().length !== 2) {
                addressErrorMsg = 'State must be 2 characters (e.g., CA, NY)';
            }
            if (form.address.zipCode.trim() && !/^\d{5}(-\d{4})?$/.test(form.address.zipCode.trim())) {
                addressErrorMsg = 'ZIP code must be 5 digits or 5+4 format (e.g., 12345 or 12345-6789)';
            }
        }
        setAddressError(addressErrorMsg);

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && !addressErrorMsg;
    };

    const saveAppointmentToDatabase = async (appointmentData: AppointmentData) => {
        try {
            // Check if user is authenticated
            if (!authService.isAuthenticated()) {
                throw new Error('Please login to create appointments');
            }

            // Check if backend server is accessible
            try {
                const healthCheck = await fetch('http://localhost:3001/api/health');
                if (!healthCheck.ok) {
                    throw new Error('Backend server is not accessible');
                }
            } catch (error) {
                throw new Error('Backend server is not running. Please start the server with: npm run server');
            }

            // First, create or find customer
            let customerId = null;
            try {
                // Try to find existing customer first
                const searchResponse = await fetch(`${API_ENDPOINTS.CUSTOMERS}?search=${encodeURIComponent(appointmentData.customer)}`, {
                    headers: getAuthHeaders()
                });
                
                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    if (searchData.success && searchData.data.customers && searchData.data.customers.length > 0) {
                        customerId = searchData.data.customers[0]._id || searchData.data.customers[0].id;
                    }
                }

                // If no existing customer found, create a new one
                if (!customerId) {
                    // Get current user's email for contact person
                    const currentUser = authService.getCurrentUserFromStorage();
                    const contactEmail = currentUser?.email || 'admin@autobb.com'; // Fallback email
                    
                                         const customerResponse = await fetch(API_ENDPOINTS.CUSTOMERS, {
                         method: 'POST',
                         headers: getAuthHeaders(),
                         body: JSON.stringify({
                             businessName: appointmentData.customer,
                             contactPerson: {
                                 name: appointmentData.customer,
                                 phone: appointmentData.phone || '',
                                 email: contactEmail
                             },
                             address: {
                                 street: appointmentData.address.street.trim() || 'N/A',
                                 city: appointmentData.address.city.trim() || 'N/A',
                                 state: appointmentData.address.state.trim() || 'N/A',
                                 zipCode: appointmentData.address.zipCode.trim() || 'N/A'
                             },
                             notes: ''
                         })
                     });

                    if (customerResponse.ok) {
                        const customerData = await customerResponse.json();
                        if (customerData.success) {
                            customerId = customerData.data.customer._id || customerData.data.customer.id;
                        }
                    }
                }
            } catch (error) {
                console.warn('Customer creation/finding failed:', error);
                // Continue with appointment creation using customer name
            }

            // Parse vehicle info with improved validation
            const vehicleText = appointmentData.vehicle.trim();
            
            // More flexible vehicle parsing
            let make = '';
            let model = '';
            let year = new Date().getFullYear(); // Default to current year
            
            // Try to extract year from anywhere in the string
            const yearMatch = vehicleText.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) {
                year = parseInt(yearMatch[0]);
                // Remove year from text for make/model parsing
                const vehicleWithoutYear = vehicleText.replace(/\b(19|20)\d{2}\b/, '').trim();
                const parts = vehicleWithoutYear.split(' ').filter(part => part.length > 0);
                
                if (parts.length >= 2) {
                    make = parts[0];
                    model = parts.slice(1).join(' ');
                } else if (parts.length === 1) {
                    make = parts[0];
                    model = 'Unknown Model';
                }
            } else {
                // No year found, parse as make/model only
                const parts = vehicleText.split(' ').filter(part => part.length > 0);
                if (parts.length >= 2) {
                    make = parts[0];
                    model = parts.slice(1).join(' ');
                } else if (parts.length === 1) {
                    make = parts[0];
                    model = 'Unknown Model';
                }
            }

            // Validate vehicle data
            if (!make.trim()) {
                throw new Error('Please enter a vehicle make (e.g., Toyota, Honda, Ford)');
            }

            if (year < 1900 || year > new Date().getFullYear() + 1) {
                throw new Error(`Invalid vehicle year: ${year}. Please enter a year between 1900 and ${new Date().getFullYear() + 1}`);
            }

            // Map service type to backend enum
            const serviceTypeMap: { [key: string]: string } = {
                'Oil Change': 'oil_change',
                'Brake Inspection': 'brake_service',
                'Tire Rotation': 'tire_rotation',
                'Transmission Service': 'transmission_service',
                'Battery Replacement': 'maintenance',
                'Air Filter Replacement': 'maintenance',
                'Spark Plug Replacement': 'maintenance',
                'Wheel Alignment': 'maintenance',
                'AC Service': 'maintenance',
                'Engine Tune-up': 'engine_repair',
                'Fuel Filter Replacement': 'maintenance',
                'Timing Belt Replacement': 'engine_repair',
                'Water Pump Replacement': 'engine_repair',
                'Radiator Flush': 'maintenance',
                'Power Steering Fluid': 'maintenance',
                'Brake Fluid Change': 'brake_service',
                'Coolant Flush': 'maintenance',
                'Exhaust System Repair': 'engine_repair',
                'Suspension Repair': 'engine_repair',
                'Electrical Diagnostics': 'electrical_repair'
            };

            const mappedServiceType = serviceTypeMap[appointmentData.serviceType] || 'other';

            // Get current user ID from auth service
            const currentUser = authService.getCurrentUserFromStorage();
            const assignedTo = currentUser?.id || null;

            // Ensure we have required fields
            if (!customerId) {
                throw new Error('Failed to create or find customer. Please try again.');
            }

            if (!assignedTo) {
                throw new Error('User authentication required. Please login again.');
            }

            // Prepare appointment data
            const appointmentPayload: any = {
                customer: customerId, // Must be a valid ObjectId
                vehicle: {
                    make: make.trim(),
                    model: model.trim(),
                    year: year,
                    vin: appointmentData.vin.trim() || 'N/A', // Use provided VIN or 'N/A'
                    licensePlate: appointmentData.licensePlate.trim() || 'N/A', // Use provided license plate or 'N/A'
                    mileage: 0
                },
                serviceType: mappedServiceType,
                serviceDescription: appointmentData.serviceType,
                scheduledDate: appointmentData.date.split('T')[0],
                scheduledTime: appointmentData.date.split('T')[1]?.substring(0, 5) || '09:00',
                estimatedDuration: 60,
                assignedTo: assignedTo,
                priority: 'medium',
                status: 'scheduled'
            };

            // Only include notes if they have content
            if (appointmentData.notes && appointmentData.notes.trim()) {
                appointmentPayload.notes = appointmentData.notes.trim();
                appointmentPayload.customerNotes = appointmentData.notes.trim();
            }

            console.log('Sending appointment data:', appointmentPayload);

            const response = await fetch(API_ENDPOINTS.APPOINTMENTS, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(appointmentPayload)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Appointment creation failed:', errorData);
                throw new Error(errorData.message || `Failed to save appointment (${response.status})`);
            }

            const savedAppointment = await response.json();
            console.log('Appointment saved successfully:', savedAppointment);
            toast.success('Appointment saved to database successfully!');
            return savedAppointment;
        } catch (error) {
            console.error('Error saving appointment to database:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save appointment to database');
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsSavingToDatabase(true);
            
            // Try to save to database first
            try {
                const savedAppointment = await saveAppointmentToDatabase(form);
                toast.success('Appointment created and saved to database!');
            } catch (dbError) {
                console.warn('Database save failed, falling back to local storage:', dbError);
                // Check if it's an authentication error
                if (dbError instanceof Error && dbError.message.includes('login')) {
                    toast.error('Please login to save appointments to the database');
                    // Redirect to login page
                    setTimeout(() => {
                        window.location.href = '/admin/login';
                    }, 2000);
                } else if (dbError instanceof Error && dbError.message.includes('Backend server')) {
                    toast.error('Backend server is not running. Please start the server and try again.');
                } else {
                    // Fallback: save to local storage or just continue with local state
                    toast.error('Database unavailable. Appointment saved locally.');
                }
            }
            
            // Always call the parent's onSave to update local state
            onSave(form);
            
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            toast.error('Failed to create appointment. Please try again.');
        } finally {
            setIsSavingToDatabase(false);
        }
    };

    const selectService = (service: string) => {
        setForm(prev => ({ ...prev, serviceType: service }));
        setShowServiceSuggestions(false);
        serviceInputRef.current?.focus();
    };

    const selectVehicle = (vehicle: string) => {
        setForm(prev => ({ ...prev, vehicle: vehicle }));
        setShowVehicleSuggestions(false);
        vehicleInputRef.current?.focus();
    };

    const formatPhoneNumber = (value: string) => {
        // Remove all non-digits
        const phoneNumber = value.replace(/\D/g, '');
        
        // Format as (XXX) XXX-XXXX
        if (phoneNumber.length <= 3) {
            return phoneNumber;
        } else if (phoneNumber.length <= 6) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        } else {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        }
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setForm(prev => ({ ...prev, phone: formatted }));
        
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: undefined }));
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">New Appointment</h2>
                    <p className="text-sm text-gray-600 mt-1">Schedule a new appointment for a customer</p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Customer Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Name *
                        </label>
                        <input
                            name="customer"
                            placeholder="Enter customer name"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors.customer ? 'border-red-500' : 'border-gray-300'
                            }`}
                            onChange={handleChange}
                            value={form.customer}
                            disabled={isLoading || isSavingToDatabase}
                        />
                        {errors.customer && (
                            <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
                        )}
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <input
                            name="phone"
                            placeholder="(555) 123-4567"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            onChange={handlePhoneChange}
                            value={form.phone}
                            disabled={isLoading || isSavingToDatabase}
                            maxLength={14}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                        )}
                    </div>
                    
                                         {/* Vehicle */}
                     <div className="relative">
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                             Vehicle (Make/Model/Year) *
                         </label>
                                                  <input
                              ref={vehicleInputRef}
                              name="vehicle"
                              placeholder="e.g., Toyota Camry 2020, 2020 Honda Civic, Ford F-150, BMW X5"
                              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  errors.vehicle ? 'border-red-500' : 'border-gray-300'
                              }`}
                              onChange={handleChange}
                              value={form.vehicle}
                              disabled={isLoading || isSavingToDatabase}
                          />
                         {errors.vehicle && (
                             <p className="text-red-500 text-sm mt-1">{errors.vehicle}</p>
                         )}
                         
                         {/* Vehicle Suggestions */}
                         {showVehicleSuggestions && (
                             <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                 {filteredVehicles.map((vehicle, index) => (
                                     <button
                                         key={index}
                                         className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                         onClick={() => selectVehicle(vehicle)}
                                     >
                                         {vehicle}
                                     </button>
                                 ))}
                             </div>
                         )}
                     </div>

                     {/* VIN Number */}
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                             VIN Number (Optional)
                         </label>
                         <input
                             name="vin"
                             placeholder="17-character VIN (e.g., 1HGBH41JXMN109186)"
                             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                             onChange={handleChange}
                             value={form.vin}
                             disabled={isLoading || isSavingToDatabase}
                             maxLength={17}
                         />
                         <p className="text-xs text-gray-500 mt-1">
                             Vehicle Identification Number - found on dashboard, door jamb, or registration
                         </p>
                         {errors.vin && (
                             <p className="text-red-500 text-sm mt-1">{errors.vin}</p>
                         )}
                     </div>

                                           {/* License Plate */}
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              License Plate (Optional)
                          </label>
                          <input
                              name="licensePlate"
                              placeholder="e.g., ABC123, XYZ-789"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              onChange={handleChange}
                              value={form.licensePlate}
                              disabled={isLoading || isSavingToDatabase}
                              maxLength={10}
                          />
                      </div>

                      {/* Address Section */}
                      <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                              Address (Optional)
                          </label>
                          
                          {/* Street Address */}
                          <div>
                              <input
                                  name="address.street"
                                  placeholder="Street Address"
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                  onChange={(e) => {
                                      setForm(prev => ({
                                          ...prev,
                                          address: { ...prev.address, street: e.target.value }
                                      }));
                                      if (addressError) setAddressError('');
                                  }}
                                  value={form.address.street}
                                  disabled={isLoading || isSavingToDatabase}
                              />
                          </div>
                          
                          {/* City, State, ZIP */}
                          <div className="grid grid-cols-3 gap-3">
                              <div>
                                  <input
                                      name="address.city"
                                      placeholder="City"
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                      onChange={(e) => {
                                          setForm(prev => ({
                                              ...prev,
                                              address: { ...prev.address, city: e.target.value }
                                          }));
                                          if (addressError) setAddressError('');
                                      }}
                                      value={form.address.city}
                                      disabled={isLoading || isSavingToDatabase}
                                  />
                              </div>
                              <div>
                                  <input
                                      name="address.state"
                                      placeholder="State"
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                      onChange={(e) => {
                                          setForm(prev => ({
                                              ...prev,
                                              address: { ...prev.address, state: e.target.value }
                                          }));
                                          if (addressError) setAddressError('');
                                      }}
                                      value={form.address.state}
                                      disabled={isLoading || isSavingToDatabase}
                                      maxLength={2}
                                  />
                              </div>
                              <div>
                                  <input
                                      name="address.zipCode"
                                      placeholder="ZIP Code"
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                      onChange={(e) => {
                                          setForm(prev => ({
                                              ...prev,
                                              address: { ...prev.address, zipCode: e.target.value }
                                          }));
                                          if (addressError) setAddressError('');
                                      }}
                                      value={form.address.zipCode}
                                      disabled={isLoading || isSavingToDatabase}
                                      maxLength={10}
                                  />
                              </div>
                          </div>
                          {addressError && (
                              <p className="text-red-500 text-sm mt-1">{addressError}</p>
                          )}
                      </div>
                    
                    {/* Date & Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Appointment Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            name="date"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors.date ? 'border-red-500' : 'border-gray-300'
                            }`}
                            onChange={handleChange}
                            value={form.date}
                            min={new Date().toISOString().slice(0, 16)}
                            disabled={isLoading || isSavingToDatabase}
                        />
                        {errors.date && (
                            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                        )}
                    </div>
                    
                    {/* Service Type */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Type *
                        </label>
                        <input
                            ref={serviceInputRef}
                            name="serviceType"
                            placeholder="e.g., Oil Change, Brake Inspection"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors.serviceType ? 'border-red-500' : 'border-gray-300'
                            }`}
                            onChange={handleChange}
                            value={form.serviceType}
                            disabled={isLoading || isSavingToDatabase}
                        />
                        {errors.serviceType && (
                            <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
                        )}
                        
                        {/* Service Suggestions */}
                        {showServiceSuggestions && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredServices.map((service, index) => (
                                    <button
                                        key={index}
                                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                        onClick={() => selectService(service)}
                                    >
                                        {service}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Notes
                        </label>
                        <textarea
                            name="notes"
                            placeholder="Any special instructions or notes"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            rows={3}
                            onChange={handleChange}
                            value={form.notes}
                            disabled={isLoading || isSavingToDatabase}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading || isSavingToDatabase}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || isSavingToDatabase}
                            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading || isSavingToDatabase ? 'Saving to Database...' : 'Create Appointment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
