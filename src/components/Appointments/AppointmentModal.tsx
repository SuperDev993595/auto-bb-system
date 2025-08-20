import { useState, ChangeEvent, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";
import { authService } from "../../services/auth";
import { Appointment } from "../../utils/CustomerTypes";
import { useAppDispatch, useAppSelector } from "../../redux";
import { deleteAppointment } from "../../redux/actions/appointments";

type AppointmentData = {
    customer: string;
    email: string;
    phone: string;
    businessName?: string;
    vehicle: string;
    vehicleId?: string; // Add vehicle ID for existing vehicles
    vin: string;
    licensePlate: string;
    scheduledDate: string;
    scheduledTime: string;
    serviceType: string;
    notes: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedDuration: number;
    status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
    technicianId?: string;
    technicianName?: string;
    customerType: 'existing' | 'new';
    existingCustomerId?: string;
    // Add these fields for form handling
    date?: string;
    time?: string;
};

type Vehicle = {
    id: string;
    year: number;
    make: string;
    model: string;
    vin: string;
    licensePlate: string;
};

type Props = {
    onClose: () => void;
    onSave: (data: AppointmentData) => void;
    isLoading?: boolean;
    appointment?: Appointment;
    isEditing?: boolean;
    selectedDate?: Date;
    selectedTime?: string;
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

export default function AppointmentModal({ onClose, onSave, isLoading = false, appointment, isEditing = false, selectedDate, selectedTime }: Props) {
    const [form, setForm] = useState<AppointmentData>({
        customer: "",
        email: "",
        phone: "",
        businessName: "",
        vehicle: "",
        vehicleId: "",
        vin: "",
        licensePlate: "",
        scheduledDate: selectedDate ? selectedDate.toISOString().split('T')[0] : "",
        scheduledTime: selectedTime || "09:00",
        serviceType: "",
        notes: "",
        priority: 'medium',
        estimatedDuration: 60,
        status: 'scheduled',
        technicianId: "",
        technicianName: "",
        customerType: 'new',
        existingCustomerId: "",
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : "",
        time: selectedTime || "09:00"
    });

    const [errors, setErrors] = useState<Partial<AppointmentData>>({});
    const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
    const [filteredVehicles, setFilteredVehicles] = useState<string[]>([]);
    const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
    
    const dispatch = useAppDispatch();
    const [technicians, setTechnicians] = useState<any[]>([]);

    const [useExistingVehicle, setUseExistingVehicle] = useState(false);
    const [availableCustomers, setAvailableCustomers] = useState<Array<{id: string, name: string, email: string, phone?: string}>>([]);
    const [selectedCustomerVehicles, setSelectedCustomerVehicles] = useState<Vehicle[]>([]);
    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'exists'>('idle');
    
    const vehicleInputRef = useRef<HTMLInputElement>(null);

    // Set default date to tomorrow at 9 AM or populate form for editing
    useEffect(() => {
        if (isEditing && appointment) {
            // Populate form with existing appointment data
            let appointmentDate: Date;
            
            // Validate and create date safely
            if (appointment.scheduledDate && appointment.scheduledTime) {
                appointmentDate = new Date(`${appointment.scheduledDate}T${appointment.scheduledTime}`);
                // Check if the date is valid
                if (isNaN(appointmentDate.getTime())) {
                    // Fallback to current date if invalid
                    appointmentDate = new Date();
                    appointmentDate.setDate(appointmentDate.getDate() + 1);
                    appointmentDate.setHours(9, 0, 0, 0);
                }
            } else {
                // Fallback to tomorrow at 9 AM if date/time is missing
                appointmentDate = new Date();
                appointmentDate.setDate(appointmentDate.getDate() + 1);
                appointmentDate.setHours(9, 0, 0, 0);
            }
            
            setForm({
                customer: appointment.customerName,
                email: "", // Will be populated from customer data
                phone: "", // Will be populated from customer data
                businessName: "",
                vehicle: appointment.vehicleInfo || "",
                vehicleId: appointment.vehicleId || "",
                vin: appointment.vehicle?.vin || "", // Use vehicle data if available
                licensePlate: appointment.vehicle?.licensePlate || "", // Use vehicle data if available
                scheduledDate: appointmentDate.toISOString().split('T')[0],
                scheduledTime: appointmentDate.toTimeString().slice(0, 5),
                serviceType: appointment.serviceType,
                notes: appointment.notes || "",
                priority: appointment.priority,
                estimatedDuration: appointment.estimatedDuration,
                status: appointment.status,
                technicianId: appointment.technicianId || "",
                technicianName: appointment.technicianName || "",
                customerType: 'existing',
                existingCustomerId: appointment.customerId,
                date: appointmentDate.toISOString().split('T')[0],
                time: appointmentDate.toTimeString().slice(0, 5)
            });
        } else {
            // Set date based on selected date from calendar or default to tomorrow
            let targetDate: Date;
            if (selectedDate) {
                // Use the selected date from calendar
                targetDate = new Date(selectedDate);
                // Set the time to the selected time or default to 9:00 AM
                const [hours, minutes] = (selectedTime || '09:00').split(':').map(Number);
                targetDate.setHours(hours, minutes, 0, 0);
            } else {
                // Default to tomorrow at 9 AM
                targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + 1);
                targetDate.setHours(9, 0, 0, 0);
            }
            
        setForm(prev => ({
            ...prev,
                scheduledDate: targetDate.toISOString().split('T')[0],
                scheduledTime: selectedTime || targetDate.toTimeString().slice(0, 5)
        }));
        }
    }, [isEditing, appointment, selectedDate, selectedTime]);

    // Load vehicle information when editing an appointment
    useEffect(() => {
        if (isEditing && appointment && appointment.vehicleId) {
            loadVehicleDetails(appointment.vehicleId);
        }
        if (isEditing && appointment && appointment.customerId) {
            loadCustomerDetails(appointment.customerId);
        }
    }, [isEditing, appointment]);

    // Load available vehicles and customers
    useEffect(() => {
        loadAvailableVehicles();
        loadAvailableCustomers();
    }, []);

    // Fetch technicians when modal loads
    useEffect(() => {
        const loadTechnicians = async () => {
            try {
                const response = await fetch(`${API_ENDPOINTS.CUSTOMERS}/technicians`, {
                    headers: getAuthHeaders()
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setTechnicians(data.data.technicians || []);
                    }
                }
            } catch (error) {
                console.error('Error loading technicians:', error);
                setTechnicians([]);
            }
        };

        if (technicians.length === 0) {
            loadTechnicians();
        }
    }, [technicians.length]);

    const loadAvailableVehicles = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/vehicles`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAvailableVehicles(data.data.vehicles || []);
                }
            }
        } catch (error) {
            console.warn('Failed to load vehicles:', error);
        }
    };

    const loadAvailableCustomers = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/customers?limit=100`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAvailableCustomers(data.data.customers || []);
                }
            }
        } catch (error) {
            console.warn('Failed to load customers:', error);
        }
    };

    const loadCustomerVehicles = async (customerId: string) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/vehicles?customer=${customerId}`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSelectedCustomerVehicles(data.data.vehicles || []);
                }
            }
        } catch (error) {
            console.warn('Failed to load customer vehicles:', error);
            setSelectedCustomerVehicles([]);
        }
    };

    const loadVehicleDetails = async (vehicleId: string) => {
        try {
            // First, try to get the vehicle from the vehicles list
            const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/vehicles?limit=1000`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.vehicles) {
                    const vehicle = data.data.vehicles.find((v: any) => v.id === vehicleId);
                    if (vehicle) {
                        setForm(prev => ({
                            ...prev,
                            vin: vehicle.vin || "",
                            licensePlate: vehicle.licensePlate || ""
                        }));
                        return;
                    }
                }
            }
            
            // If not found in the list, try to get it directly by ID
            const directResponse = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/vehicles?search=${vehicleId}`, {
                headers: getAuthHeaders()
            });
            if (directResponse.ok) {
                const directData = await directResponse.json();
                if (directData.success && directData.data.vehicles) {
                    const vehicle = directData.data.vehicles.find((v: any) => v.id === vehicleId);
                    if (vehicle) {
                        setForm(prev => ({
                            ...prev,
                            vin: vehicle.vin || "",
                            licensePlate: vehicle.licensePlate || ""
                        }));
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load vehicle details:', error);
        }
    };

    const loadCustomerDetails = async (customerId: string) => {
        try {
            const response = await fetch(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.customer) {
                    const customer = data.data.customer;
                    setForm(prev => ({
                        ...prev,
                        email: customer.email || "",
                        phone: customer.phone || "",
                        businessName: customer.businessName || ""
                    }));
                }
            }
        } catch (error) {
            console.warn('Failed to load customer details:', error);
        }
    };

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



    // Filter vehicles based on input
    useEffect(() => {
        if (form.vehicle && !useExistingVehicle) {
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
            const uniqueSuggestions = Array.from(new Set(suggestions)).slice(0, 15);
            
            setFilteredVehicles(uniqueSuggestions);
            setShowVehicleSuggestions(uniqueSuggestions.length > 0);
        } else {
            setShowVehicleSuggestions(false);
        }
    }, [form.vehicle, useExistingVehicle]);



    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Handle datetime-local input
        if (name === 'date' && e.target.type === 'datetime-local') {
            const [datePart, timePart] = value.split('T');
            setForm(prev => ({ 
                ...prev, 
                date: datePart,
                time: timePart || '09:00'
            }));
        }
        // Handle number fields
        else if (name === 'estimatedDuration') {
            const numValue = parseInt(value) || 0;
            setForm(prev => ({ ...prev, [name]: numValue }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
        
        // Clear error when user starts typing
        if (errors[name as keyof AppointmentData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleVehicleSelection = (vehicle: Vehicle) => {
        setForm(prev => ({
            ...prev,
            vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            vehicleId: vehicle.id,
            vin: vehicle.vin,
            licensePlate: vehicle.licensePlate
        }));
        setUseExistingVehicle(false);
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<AppointmentData> = {};

        if (!form.customer.trim()) {
            newErrors.customer = 'Customer name is required';
        } else if (form.customer.trim().length < 2) {
            newErrors.customer = 'Customer name must be at least 2 characters';
        }

        // Email validation for new customers
        if (form.customerType === 'new') {
            if (!form.email.trim()) {
                newErrors.email = 'Email address is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
                newErrors.email = 'Please enter a valid email address';
            } else if (emailStatus === 'exists') {
                newErrors.email = 'This email is already registered. Please use a different email or select "Existing Customer" instead.';
            } else if (emailStatus === 'checking') {
                newErrors.email = 'Checking email availability...';
            }
        }

        if (!form.vehicle.trim()) {
            newErrors.vehicle = 'Vehicle information is required';
        } else if (form.customerType === 'new' || !useExistingVehicle) {
            // Basic vehicle validation for new vehicles
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

        if (form.estimatedDuration < 15 || form.estimatedDuration > 480) {
            newErrors.estimatedDuration = 'Estimated duration must be between 15 and 480 minutes' as any;
        }

        // Phone validation (optional but if provided, validate format)
        if (form.phone.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone.replace(/[\s\-\(\)]/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // VIN validation (optional but if provided, validate format)
        if (form.vin.trim() && (form.vin.trim().length < 8 || form.vin.trim().length > 17)) {
            newErrors.vin = 'VIN must be between 8 and 17 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

            // Handle customer creation/finding based on customer type
            let customerId = null;
            let userId = null;
            
            try {
                if (appointmentData.customerType === 'existing' && appointmentData.existingCustomerId) {
                    // Use existing customer
                    customerId = appointmentData.existingCustomerId;
                } else {
                    // Create new customer and user
                    const currentUser = authService.getCurrentUserFromStorage();
                    
                                         // Check if email already exists before creating user
                     const emailCheckResponse = await fetch(`${API_ENDPOINTS.AUTH}/check-email`, {
                         method: 'POST',
                         headers: {
                             'Content-Type': 'application/json'
                         },
                         body: JSON.stringify({
                             email: appointmentData.email
                         })
                     });

                     if (emailCheckResponse.ok) {
                         const emailCheckData = await emailCheckResponse.json();
                         if (emailCheckData.exists) {
                             throw new Error(`A user with email ${appointmentData.email} already exists. Please use a different email or select "Existing Customer" instead.`);
                         }
                     }

                     // First, create a new user account
                     const userResponse = await fetch(`${API_ENDPOINTS.AUTH}/register`, {
                        method: 'POST',
                         headers: {
                             'Content-Type': 'application/json'
                         },
                        body: JSON.stringify({
                            name: appointmentData.customer,
                             email: appointmentData.email,
                             password: 'customer123', // Default password
                             role: 'customer',
                            phone: appointmentData.phone || '',
                             businessName: appointmentData.businessName || ''
                        })
                    });

                     if (userResponse.ok) {
                         const userData = await userResponse.json();
                         if (userData.success) {
                             userId = userData.data.user._id || userData.data.user.id;
                         } 
                     } else {
                         const errorData = await userResponse.json().catch(() => ({}));
                         if (errorData.message && errorData.message.includes('already exists')) {
                             throw new Error(`A user with email ${appointmentData.email} already exists. Please use a different email or select "Existing Customer" instead.`);
                         }
                         throw new Error(errorData.message || `Failed to create user account (${userResponse.status})`);
                     }

                                         // Customer record is automatically created during user registration
                     // We need to fetch the customer ID that was created
                     const customerResponse = await fetch(`${API_ENDPOINTS.CUSTOMERS}?email=${encodeURIComponent(appointmentData.email)}`, {
                         headers: getAuthHeaders()
                     });

                     if (!customerResponse.ok) {
                         throw new Error(`Failed to fetch customer data after user registration (${customerResponse.status})`);
                     }

                        const customerData = await customerResponse.json();
                     if (!customerData.success) {
                         throw new Error(customerData.message || 'Failed to fetch customer data after user registration');
                     }

                     if (!customerData.data.customers || customerData.data.customers.length === 0) {
                         throw new Error('Customer record was not found after user registration. Please try again or contact support.');
                     }

                     customerId = customerData.data.customers[0]._id || customerData.data.customers[0].id;
                     
                     if (!customerId) {
                         throw new Error('Customer ID is missing from the customer record. Please try again or contact support.');
                    }
                }
            } catch (error) {
                console.warn('Customer creation/finding failed:', error);
                throw new Error('Failed to create or find customer. Please try again.');
            }

            // Handle vehicle - use existing vehicle ID if available, otherwise create new vehicle
            let vehicleId = appointmentData.vehicleId;
            
            // Create new vehicle if:
            // 1. No vehicle ID is provided AND
            // 2. Either it's a new customer (who must have new vehicles) OR
            // 3. It's an existing customer who selected "New Vehicle" option
            // 4. OR if we're editing and the user changed to "New Vehicle" option
            const shouldCreateNewVehicle = !vehicleId && (appointmentData.customerType === 'new' || !useExistingVehicle);
            
            if (shouldCreateNewVehicle) {
                // Validate that we have vehicle information
                if (!appointmentData.vehicle.trim()) {
                    throw new Error('Vehicle information is required when creating a new vehicle');
                }
                
                // Parse vehicle info for new vehicle creation
                const vehicleText = appointmentData.vehicle.trim();
                
                let make = '';
                let model = '';
                let year = new Date().getFullYear();
                
                const yearMatch = vehicleText.match(/\b(19|20)\d{2}\b/);
                if (yearMatch) {
                    year = parseInt(yearMatch[0]);
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
                    const parts = vehicleText.split(' ').filter(part => part.length > 0);
                    if (parts.length >= 2) {
                        make = parts[0];
                        model = parts.slice(1).join(' ');
                    } else if (parts.length === 1) {
                        make = parts[0];
                        model = 'Unknown Model';
                    }
                }

                if (!make.trim()) {
                    throw new Error('Please enter a vehicle make (e.g., Toyota, Honda, Ford)');
                }

                if (year < 1900 || year > new Date().getFullYear() + 1) {
                    throw new Error(`Invalid vehicle year: ${year}. Please enter a year between 1900 and ${new Date().getFullYear() + 1}`);
                }

                // Create new vehicle
                try {
                    console.log('Creating new vehicle for customer:', customerId);
                    console.log('Vehicle data:', {
                        year,
                        make: make.trim(),
                        model: model.trim(),
                        vin: appointmentData.vin.trim() || 'N/A',
                        licensePlate: appointmentData.licensePlate.trim() || 'N/A',
                        customer: customerId
                    });

                    const vehicleResponse = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/vehicles`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                            year,
                            make: make.trim(),
                            model: model.trim(),
                            vin: appointmentData.vin.trim() || 'N/A',
                            licensePlate: appointmentData.licensePlate.trim() || 'N/A',
                            color: 'Unknown',
                            mileage: 0,
                            status: 'active',
                            customer: customerId // Associate with the customer (new or existing)
                        })
                    });

                        const vehicleData = await vehicleResponse.json();
                    console.log('Vehicle response status:', vehicleResponse.status);
                    console.log('Vehicle response data:', vehicleData);
                    
                    if (vehicleResponse.ok && vehicleData.success) {
                        // Both HTTP status and business logic are successful
                            vehicleId = vehicleData.data.vehicle._id || vehicleData.data.vehicle.id;
                        console.log('Vehicle created successfully with ID:', vehicleId);
                    } else {
                        // Either HTTP error or business logic error
                        console.error('Vehicle creation failed:', {
                            status: vehicleResponse.status,
                            ok: vehicleResponse.ok,
                            success: vehicleData.success,
                            message: vehicleData.message
                        });
                        
                        // Handle specific VIN duplicate error
                        if (vehicleData.message && vehicleData.message.includes('already exists')) {
                            throw new Error(`Vehicle with this VIN already exists. Please use a different VIN or leave it blank to generate one automatically.`);
                        }
                        
                        throw new Error(vehicleData.message || `Failed to create vehicle (${vehicleResponse.status})`);
                    }
                } catch (error) {
                    console.warn('Vehicle creation failed:', error);
                    // Show specific error message and re-throw to cancel appointment creation
                    if (error instanceof Error) {
                        throw new Error(`Vehicle creation failed: ${error.message}. Appointment creation cancelled.`);
                    } else {
                        throw new Error('Vehicle creation failed. Appointment creation cancelled.');
                    }
                }
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

            if (!vehicleId) {
                throw new Error('Failed to create or find vehicle. Please try again.');
            }

            if (!assignedTo) {
                throw new Error('User authentication required. Please login again.');
            }

            // Prepare appointment data
            const appointmentPayload: any = {
                customer: customerId,
                vehicle: vehicleId,
                serviceType: mappedServiceType,
                serviceDescription: appointmentData.serviceType,
                scheduledDate: appointmentData.date?.split('T')[0] || appointmentData.scheduledDate,
                scheduledTime: appointmentData.date?.split('T')[1]?.substring(0, 5) || appointmentData.time || appointmentData.scheduledTime || '09:00',
                estimatedDuration: appointmentData.estimatedDuration,
                assignedTo: assignedTo,
                priority: appointmentData.priority,
                status: appointmentData.status
            };

            // Add technician if selected
            if (appointmentData.technicianId && appointmentData.technicianId.trim()) {
                appointmentPayload.technician = appointmentData.technicianId;
            }

            // Add optional fields
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
            
            // Show appropriate success message
            if (shouldCreateNewVehicle) {
                toast.success('Appointment saved and new vehicle created successfully!');
            } else {
            toast.success('Appointment saved to database successfully!');
            }
            
            return savedAppointment;
        } catch (error) {
            console.error('Error saving appointment to database:', error);
            
            // Show specific error message for vehicle creation failures
            if (error instanceof Error && error.message.includes('Vehicle creation failed')) {
                toast.error(error.message);
            } else {
            toast.error(error instanceof Error ? error.message : 'Failed to save appointment to database');
            }
            
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!appointment?.id) {
            toast.error('No appointment to delete');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await dispatch(deleteAppointment(appointment.id)).unwrap();
            onClose();
        } catch (error) {
            console.error('Failed to delete appointment:', error);
        } finally {
            setIsDeleting(false);
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
                
                // Pass the saved appointment data (with real database ID) to the calendar
                onSave(savedAppointment.data.appointment);
                
            } catch (dbError) {
                console.warn('Database save failed:', dbError);
                
                // Check if it's a vehicle creation failure - don't save locally
                if (dbError instanceof Error && dbError.message.includes('Vehicle creation failed')) {
                    // Vehicle creation failed - don't save appointment locally
                    console.log('Vehicle creation failed - appointment creation cancelled');
                    return; // Exit without saving locally
                }
                
                // Check if it's an authentication error
                if (dbError instanceof Error && dbError.message.includes('login')) {
                    toast.error('Please login to save appointments to the database');
                    // Redirect to login page
                    setTimeout(() => {
                        window.location.href = '/admin/login';
                    }, 2000);
                    return; // Exit without saving locally
                } else if (dbError instanceof Error && dbError.message.includes('Backend server')) {
                    toast.error('Backend server is not running. Please start the server and try again.');
                    return; // Exit without saving locally
                } else {
                    // For other database errors, fallback to local storage
                    toast.error('Database unavailable. Appointment saved locally.');
                    onSave(form); // Pass form data for local storage
                }
            }
            
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            toast.error('Failed to create appointment. Please try again.');
        } finally {
            setIsSavingToDatabase(false);
        }
    };



    const selectVehicle = (vehicle: string) => {
        setForm(prev => ({ ...prev, vehicle: vehicle }));
        setShowVehicleSuggestions(false);
        vehicleInputRef.current?.focus();
    };

    const selectCustomer = (customer: {id: string, name: string, email: string, phone?: string}) => {
        setForm(prev => ({ 
            ...prev, 
            customer: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            existingCustomerId: customer.id,
            customerType: 'existing'
        }));
        
        // Load vehicles for the selected customer
        loadCustomerVehicles(customer.id);
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

    // Check email availability
    const checkEmailAvailability = async (email: string) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailStatus('idle');
            return;
        }

        setEmailStatus('checking');
        
        try {
            const response = await fetch(`${API_ENDPOINTS.AUTH}/check-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                const data = await response.json();
                setEmailStatus(data.exists ? 'exists' : 'available');
            } else {
                setEmailStatus('idle');
            }
        } catch (error) {
            console.warn('Email check failed:', error);
            setEmailStatus('idle');
        }
    };

    // Debounced email check
    useEffect(() => {
        if (form.customerType === 'new' && form.email) {
            const timeoutId = setTimeout(() => {
                checkEmailAvailability(form.email);
            }, 500); // Wait 500ms after user stops typing

            return () => clearTimeout(timeoutId);
        } else {
            setEmailStatus('idle');
        }
    }, [form.email, form.customerType]);

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
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? 'Edit Appointment' : 'New Appointment'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {isEditing ? 'Update appointment details' : 'Schedule a new appointment for a customer'}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer Type Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
                        
                        {/* Customer Type Toggle */}
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="customerType"
                                    checked={form.customerType === 'new'}
                                    onChange={() => {
                                        setForm(prev => ({ 
                                            ...prev, 
                                            customerType: 'new',
                                            existingCustomerId: '',
                                            customer: '',
                                            email: '',
                                            phone: ''
                                        }));
                                        setUseExistingVehicle(false);
                                        setSelectedCustomerVehicles([]);
                                    }}
                                    className="mr-2"
                                />
                                <span className="font-medium">New Customer</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="customerType"
                                    checked={form.customerType === 'existing'}
                                    onChange={() => {
                                        setForm(prev => ({ 
                                            ...prev, 
                                            customerType: 'existing',
                                            customer: '',
                                            email: '',
                                            phone: ''
                                        }));
                                        setUseExistingVehicle(false);
                                        setSelectedCustomerVehicles([]);
                                    }}
                                    className="mr-2"
                                />
                                <span className="font-medium">Existing Customer</span>
                            </label>
                        </div>

                        {/* Customer Name/Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                {form.customerType === 'existing' ? 'Select Customer *' : 'Customer Name *'}
                        </label>
                            {form.customerType === 'existing' ? (
                                <select
                                    name="customer"
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        errors.customer ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    onChange={(e) => {
                                        const selectedCustomer = availableCustomers.find(c => c.id === e.target.value);
                                        if (selectedCustomer) {
                                            selectCustomer(selectedCustomer);
                                        }
                                    }}
                                    value={form.existingCustomerId || ''}
                                    disabled={isLoading || isSavingToDatabase}
                                >
                                    <option value="">Select a customer</option>
                                    {availableCustomers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name} - {customer.email}
                                        </option>
                                    ))}
                                </select>
                            ) : (
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
                            )}
                        {errors.customer && (
                            <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
                        )}
                    </div>
                    
                                                 {/* Email Field (for new customers) */}
                         {form.customerType === 'new' && (
                             <div className="mt-4">
                                 <label className="block text-sm font-medium text-gray-700 mb-1">
                                     Email Address *
                                 </label>
                                 <div className="relative">
                                     <input
                                         name="email"
                                         type="email"
                                         placeholder="customer@example.com"
                                         className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                             errors.email ? 'border-red-500' : 
                                             emailStatus === 'available' ? 'border-green-500' :
                                             emailStatus === 'exists' ? 'border-red-500' :
                                             emailStatus === 'checking' ? 'border-yellow-500' :
                                             'border-gray-300'
                                         }`}
                                         onChange={handleChange}
                                         value={form.email}
                                         disabled={isLoading || isSavingToDatabase}
                                     />
                                     {/* Email status indicator */}
                                     {emailStatus === 'checking' && (
                                         <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                         </div>
                                     )}
                                     {emailStatus === 'available' && (
                                         <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                             <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                             </svg>
                                         </div>
                                     )}
                                     {emailStatus === 'exists' && (
                                         <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                             <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                             </svg>
                                         </div>
                                     )}
                                 </div>
                                 {errors.email && (
                                     <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                 )}
                                 {emailStatus === 'available' && !errors.email && (
                                     <p className="text-green-600 text-sm mt-1">✓ Email is available</p>
                                 )}
                                 {emailStatus === 'exists' && !errors.email && (
                                     <p className="text-red-500 text-sm mt-1">⚠ This email is already registered</p>
                                 )}
                             </div>
                         )}

                        {/* Business Name Field (for new customers) */}
                        {form.customerType === 'new' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Name (Optional)
                                </label>
                                <input
                                    name="businessName"
                                    placeholder="Company or business name"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onChange={handleChange}
                                    value={form.businessName}
                                    disabled={isLoading || isSavingToDatabase}
                                />
                            </div>
                        )}
                        {/* Phone Number (only for new customers) */}
                        {form.customerType === 'new' && (
                            <div className="mt-4">
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
                        )}
                    </div>

                    {/* Vehicle Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Information</h3>
                        
                        {/* Vehicle Type Toggle */}
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="vehicleType"
                                    checked={!useExistingVehicle}
                                    onChange={() => setUseExistingVehicle(false)}
                                    className="mr-2"
                                    disabled={form.customerType === 'new'}
                                />
                                <span className={`font-medium ${form.customerType === 'new' ? 'text-gray-400' : ''}`}>
                                New Vehicle
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="vehicleType"
                                    checked={useExistingVehicle}
                                    onChange={() => setUseExistingVehicle(true)}
                                    className="mr-2"
                                    disabled={form.customerType === 'new'}
                                />
                                <span className={`font-medium ${form.customerType === 'new' ? 'text-gray-400' : ''}`}>
                                Existing Vehicle
                                </span>
                            </label>
                        </div>
                        
                        {form.customerType === 'new' && (
                            <p className="text-sm text-gray-500 mb-4">
                                New customers must have new vehicles. Select "Existing Customer" to use existing vehicles.
                            </p>
                        )}

                        {useExistingVehicle ? (
                            /* Existing Vehicle Selection */
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Vehicle *
                                </label>
                                <select
                                    name="vehicleId"
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        errors.vehicle ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    onChange={(e) => {
                                        const selectedVehicle = selectedCustomerVehicles.find(v => v.id === e.target.value);
                                        if (selectedVehicle) {
                                            setForm(prev => ({
                                                ...prev,
                                                vehicleId: selectedVehicle.id,
                                                vehicle: `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`,
                                                vin: selectedVehicle.vin,
                                                licensePlate: selectedVehicle.licensePlate
                                            }));
                                        } else {
                                            setForm(prev => ({
                                                ...prev,
                                                vehicleId: '',
                                                vehicle: '',
                                                vin: '',
                                                licensePlate: ''
                                            }));
                                        }
                                    }}
                                    value={form.vehicleId}
                                    disabled={isLoading || isSavingToDatabase || !form.existingCustomerId}
                                >
                                    <option value="">
                                        {!form.existingCustomerId 
                                            ? 'Please select a customer first' 
                                            : 'Select a vehicle'
                                        }
                                    </option>
                                    {selectedCustomerVehicles.map((vehicle) => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                                        </option>
                                    ))}
                                </select>
                                {!form.existingCustomerId && (
                                    <p className="text-sm text-gray-500 mt-1">Please select a customer to see their vehicles.</p>
                                )}
                                {form.existingCustomerId && selectedCustomerVehicles.length === 0 && (
                                    <p className="text-sm text-gray-500 mt-1">This customer has no vehicles. Please add a vehicle first.</p>
                                )}
                            </div>
                        ) : (
                            /* New Vehicle Input */
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vehicle Description *
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
                        )}
                    </div>

                    {/* VIN Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            VIN Number (Optional)
                        </label>
                        <input
                            name="vin"
                            placeholder="8-17 character VIN (e.g., 1HGBH41JXMN109186)"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onChange={handleChange}
                            value={form.vin}
                            disabled={isLoading || isSavingToDatabase}
                            maxLength={17}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Vehicle Identification Number - found on dashboard, door jamb, or registration. Must be 8-17 characters. Leave blank to generate automatically if you don't have the VIN.
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
                            value={`${form.date}T${form.time}`}
                            min={new Date().toISOString().slice(0, 16)}
                            disabled={isLoading || isSavingToDatabase}
                        />
                        {errors.date && (
                            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                        )}
                    </div>
                    
                    {/* Service Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Type *
                        </label>
                        <select
                            name="serviceType"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors.serviceType ? 'border-red-500' : 'border-gray-300'
                            }`}
                            onChange={handleChange}
                            value={form.serviceType}
                            disabled={isLoading || isSavingToDatabase}
                        >
                            <option value="">Select a service type</option>
                            {COMMON_SERVICES.map((service) => (
                                <option key={service} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                        {errors.serviceType && (
                            <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
                        )}
                    </div>

                    {/* Technician */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assign Technician
                        </label>
                        <select
                            name="technicianId"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onChange={(e) => {
                                const selectedTech = technicians.find(tech => tech._id === e.target.value);
                                setForm(prev => ({
                                    ...prev,
                                    technicianId: e.target.value,
                                    technicianName: selectedTech?.name || ""
                                }));
                            }}
                            value={form.technicianId}
                            disabled={isLoading || isSavingToDatabase}
                        >
                            <option value="">Select a technician (optional)</option>
                            {technicians.filter(tech => tech.isActive).map((technician) => {
                                const specializations = technician.specializations || [];
                                return (
                                    <option key={technician._id} value={technician._id}>
                                        {technician.name} - {Array.isArray(specializations) ? specializations.join(', ') : specializations}
                                    </option>
                                );
                            })}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Choose a technician to assign to this appointment</p>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Priority *
                        </label>
                        <select
                            name="priority"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onChange={handleChange}
                            value={form.priority}
                            disabled={isLoading || isSavingToDatabase}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    {/* Estimated Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Duration (minutes) *
                        </label>
                        <input
                            type="number"
                            name="estimatedDuration"
                            min="15"
                            max="480"
                            placeholder="60"
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                errors.estimatedDuration ? 'border-red-500' : 'border-gray-300'
                            }`}
                            onChange={handleChange}
                            value={form.estimatedDuration}
                            disabled={isLoading || isSavingToDatabase}
                        />
                        {errors.estimatedDuration && (
                            <p className="text-red-500 text-sm mt-1">{errors.estimatedDuration}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Duration between 15 minutes and 8 hours</p>
                    </div>



                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status *
                        </label>
                        <select
                            name="status"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onChange={handleChange}
                            value={form.status}
                            disabled={isLoading || isSavingToDatabase}
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
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
                    <div className="flex justify-between items-center">
                        {isEditing && (
                            <button
                                onClick={handleDelete}
                                disabled={isLoading || isSavingToDatabase || isDeleting}
                                className="px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Appointment'}
                            </button>
                        )}
                        <div className="flex gap-3 ml-auto">
                        <button
                            onClick={onClose}
                                disabled={isLoading || isSavingToDatabase || isDeleting}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                                disabled={isLoading || isSavingToDatabase || isDeleting}
                            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                                {isLoading || isSavingToDatabase 
                                    ? (isEditing ? 'Updating...' : 'Saving to Database...') 
                                    : (isEditing ? 'Update Appointment' : 'Create Appointment')
                                }
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
