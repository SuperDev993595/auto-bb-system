import { useState, ChangeEvent, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";
import { authService } from "../../services/auth";
import { Appointment } from "../../utils/CustomerTypes";
import { useAppDispatch, useAppSelector } from "../../redux";
import { deleteAppointment } from "../../redux/actions/appointments";
import ModalWrapper from "../../utils/ModalWrapper";

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
    serviceTypeId?: string; // Add service type ObjectId
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

export default function AppointmentModal({ onClose, onSave, isLoading = false, appointment, isEditing = false, selectedDate, selectedTime }: Props) {
    // Service types and vehicle makes will be loaded from database
    const [serviceTypes, setServiceTypes] = useState<Array<{_id?: string, id?: string, name: string, category: string, estimatedDuration: number}>>([]);
    const [vehicleMakes, setVehicleMakes] = useState<string[]>([]);
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
        serviceTypeId: "",
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
            console.log('Editing appointment data:', appointment);
            console.log('Appointment scheduledDate:', appointment.scheduledDate);
            console.log('Appointment scheduledTime:', appointment.scheduledTime);
            console.log('Appointment date field:', (appointment as any).date);
            console.log('Appointment time field:', (appointment as any).time);
            let appointmentDate: Date;
            let dateString = '';
            let timeString = '';
            
            // Validate and create date safely
            // Check for different possible date/time field names
            const appointmentDateField = appointment.scheduledDate || (appointment as any).date;
            const appointmentTimeField = appointment.scheduledTime || (appointment as any).time;
            
            if (appointmentDateField && appointmentTimeField) {
                // Ensure time is in HH:MM format
                timeString = appointmentTimeField;
                if (timeString.includes(':')) {
                    const timeParts = timeString.split(':');
                    if (timeParts.length >= 2) {
                        timeString = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
                    }
                }
                
                // Handle different date formats
                dateString = appointmentDateField;
                // If date is in ISO format with time, extract just the date part
                if (dateString.includes('T')) {
                    dateString = dateString.split('T')[0];
                }
                
                // Try to create date from appointment data
                appointmentDate = new Date(`${dateString}T${timeString}`);
                
                // Check if the date is valid
                if (isNaN(appointmentDate.getTime())) {
                    console.warn('Invalid appointment date, using fallback:', {
                        scheduledDate: appointment.scheduledDate,
                        scheduledTime: appointment.scheduledTime,
                        processedDate: dateString,
                        processedTime: timeString,
                        combined: `${dateString}T${timeString}`
                    });
                    // Fallback to current date if invalid
                    appointmentDate = new Date();
                    appointmentDate.setDate(appointmentDate.getDate() + 1);
                    appointmentDate.setHours(9, 0, 0, 0);
                }
            } else {
                console.warn('Missing appointment date/time, using fallback');
                // Fallback to tomorrow at 9 AM if date/time is missing
                appointmentDate = new Date();
                appointmentDate.setDate(appointmentDate.getDate() + 1);
                appointmentDate.setHours(9, 0, 0, 0);
            }
            
            // Ensure time is in HH:MM format for the form
            timeString = appointment.scheduledTime || '09:00';
            if (timeString.includes(':')) {
                const timeParts = timeString.split(':');
                if (timeParts.length >= 2) {
                    timeString = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
                }
            }
            
            console.log('Setting form with appointment data:', {
                originalDate: appointment.scheduledDate,
                originalTime: appointment.scheduledTime,
                alternativeDate: (appointment as any).date,
                alternativeTime: (appointment as any).time,
                processedDate: dateString || appointmentDate.toISOString().split('T')[0],
                processedTime: timeString,
                technicianId: appointment.technicianId,
                technicianObject: appointment.technician,
                technicianIdFromObject: appointment.technician?._id,
                technicianName: appointment.technicianName,
                technicianNameFromObject: appointment.technician?.name,
                appointment: appointment
            });
            
            // Ensure serviceType is properly extracted for editing
            let serviceTypeName = '';
            let serviceTypeId = '';
            
            if (typeof appointment.serviceType === 'object' && appointment.serviceType !== null) {
                serviceTypeName = appointment.serviceType.name || '';
                serviceTypeId = appointment.serviceType._id || '';
            } else if (typeof appointment.serviceType === 'string') {
                serviceTypeName = appointment.serviceType;
                // For string serviceType, we need to find the corresponding serviceTypeId
                // This will be handled when the service types are loaded
            }
            
            console.log('Service type processing:', {
                original: appointment.serviceType,
                extractedName: serviceTypeName,
                extractedId: serviceTypeId,
                isObject: typeof appointment.serviceType === 'object'
            });
            
            setForm({
                customer: appointment.customerName,
                email: "", // Will be populated from customer data
                phone: "", // Will be populated from customer data
                businessName: "",
                vehicle: appointment.vehicleInfo || "",
                vehicleId: appointment.vehicleId || "",
                vin: appointment.vehicle?.vin || "", // Use vehicle data if available
                licensePlate: appointment.vehicle?.licensePlate || "", // Use vehicle data if available
                scheduledDate: dateString || appointmentDate.toISOString().split('T')[0],
                scheduledTime: timeString,
                serviceType: serviceTypeName,
                serviceTypeId: serviceTypeId,
                notes: appointment.notes || "",
                priority: appointment.priority,
                estimatedDuration: appointment.estimatedDuration,
                status: appointment.status,
                technicianId: appointment.technicianId || appointment.technician?._id || (appointment as any).technician || "",
                technicianName: appointment.technicianName || appointment.technician?.name || (appointment as any).technicianName || "",
                customerType: 'existing',
                existingCustomerId: appointment.customerId,
                date: dateString || appointmentDate.toISOString().split('T')[0],
                time: timeString
            });
            
            // Set useExistingVehicle to true when editing an existing appointment
            setUseExistingVehicle(true);
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

    // Debug: Log form state changes
    useEffect(() => {
        if (isEditing) {
            console.log('Form state updated:', {
                technicianId: form.technicianId,
                technicianName: form.technicianName,
                techniciansCount: technicians.length,
                serviceType: form.serviceType,
                serviceTypeId: form.serviceTypeId
            });
        }
    }, [form.technicianId, form.technicianName, technicians.length, form.serviceType, form.serviceTypeId, isEditing]);

    // Auto-set serviceTypeId when serviceType changes and we have service types loaded
    useEffect(() => {
        if (isEditing && form.serviceType && !form.serviceTypeId && Array.isArray(serviceTypes) && serviceTypes.length > 0) {
            const matchingService = serviceTypes.find((service: any) => 
                service.name === form.serviceType
            );
            if (matchingService) {
                console.log('Auto-setting serviceTypeId:', matchingService._id || matchingService.id);
                setForm(prev => ({
                    ...prev,
                    serviceTypeId: matchingService._id || matchingService.id || ''
                }));
            }
        }
    }, [form.serviceType, serviceTypes, isEditing]);

    // Load vehicle information when editing an appointment
    useEffect(() => {
        if (isEditing && appointment && appointment.vehicleId) {
            loadVehicleDetails(appointment.vehicleId);
        }
        if (isEditing && appointment && appointment.customerId) {
            loadCustomerDetails(appointment.customerId);
            loadCustomerVehicles(appointment.customerId);
        }
    }, [isEditing, appointment]);

    // Load available vehicles and customers
    useEffect(() => {
        loadAvailableVehicles();
        loadAvailableCustomers();
        loadServiceTypes();
        loadVehicleMakes();
    }, []);

    // Fetch technicians when modal loads
    useEffect(() => {
        const loadTechnicians = async () => {
            try {
                let allTechnicians = [];
                
                if (isEditing) {
                    // When editing, load both active and inactive technicians to show the current assignment
                    const [activeResponse, inactiveResponse] = await Promise.all([
                        fetch(`${API_ENDPOINTS.CUSTOMERS}/technicians?isActive=true`, {
                            headers: getAuthHeaders()
                        }),
                        fetch(`${API_ENDPOINTS.CUSTOMERS}/technicians?isActive=false`, {
                            headers: getAuthHeaders()
                        })
                    ]);
                    
                    if (activeResponse.ok) {
                        const activeData = await activeResponse.json();
                        if (activeData.success) {
                            allTechnicians.push(...(activeData.data.technicians || []));
                        }
                    }
                    
                    if (inactiveResponse.ok) {
                        const inactiveData = await inactiveResponse.json();
                        if (inactiveData.success) {
                            allTechnicians.push(...(inactiveData.data.technicians || []));
                        }
                    }
                } else {
                    // For new appointments, only load active technicians
                    const response = await fetch(`${API_ENDPOINTS.CUSTOMERS}/technicians`, {
                        headers: getAuthHeaders()
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            allTechnicians = data.data.technicians || [];
                        }
                    }
                }
                
                console.log('Loaded technicians:', allTechnicians);
                const techniciansData = Array.isArray(allTechnicians) ? allTechnicians : [];
                setTechnicians(techniciansData);
                
            } catch (error) {
                console.error('Error loading technicians:', error);
                setTechnicians([]);
            } finally {
                setTechnicians(prev => Array.isArray(prev) ? prev : []);
            }
        };

        // Always load technicians when modal opens, especially for editing
        loadTechnicians();
    }, [isEditing, appointment]);

    const loadAvailableVehicles = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/vehicles`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const vehiclesData = Array.isArray(data.data?.vehicles) ? data.data.vehicles : [];
                    setAvailableVehicles(vehiclesData);
                }
            }
        } catch (error) {
            console.warn('Failed to load vehicles:', error);
            setAvailableVehicles([]);
        } finally {
            setAvailableVehicles(prev => Array.isArray(prev) ? prev : []);
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
                    const customersData = Array.isArray(data.data?.customers) ? data.data.customers : [];
                    setAvailableCustomers(customersData);
                }
            }
        } catch (error) {
            console.warn('Failed to load customers:', error);
            setAvailableCustomers([]);
        } finally {
            setAvailableCustomers(prev => Array.isArray(prev) ? prev : []);
        }
    };

    const loadServiceTypes = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.SERVICES}/types`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('Loaded service types:', data.data);
                    const serviceTypesData = Array.isArray(data.data) ? data.data : [];
                    setServiceTypes(serviceTypesData);
                    
                    // If we're editing and have a serviceType name but no ID, try to find the matching service
                    if (isEditing && form.serviceType && !form.serviceTypeId) {
                        const matchingService = serviceTypesData.find((service: any) => 
                            service.name === form.serviceType
                        );
                        if (matchingService) {
                            console.log('Found matching service for ID:', matchingService);
                            setForm(prev => ({
                                ...prev,
                                serviceTypeId: matchingService._id || matchingService.id || ''
                            }));
                        }
                    }
                }
            } else {
                console.error('Failed to load service types:', response.status, response.statusText);
            }
        } catch (error) {
            console.warn('Failed to load service types:', error);
            // Fallback to empty array
            setServiceTypes([]);
        } finally {
            // Ensure serviceTypes is always an array
            setServiceTypes(prev => Array.isArray(prev) ? prev : []);
        }
    };

    const loadVehicleMakes = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.SERVICES}/vehicle-makes`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const makesData = Array.isArray(data.data) ? data.data : [];
                    setVehicleMakes(makesData);
                }
            }
        } catch (error) {
            console.warn('Failed to load vehicle makes:', error);
            // Fallback to empty array
            setVehicleMakes([]);
        } finally {
            setVehicleMakes(prev => Array.isArray(prev) ? prev : []);
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
                    const vehiclesData = Array.isArray(data.data?.vehicles) ? data.data.vehicles : [];
                    setSelectedCustomerVehicles(vehiclesData);
                }
            }
        } catch (error) {
            console.warn('Failed to load customer vehicles:', error);
            setSelectedCustomerVehicles([]);
        } finally {
            setSelectedCustomerVehicles(prev => Array.isArray(prev) ? prev : []);
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
                if (data.success && data.data?.vehicles) {
                    const vehiclesData = Array.isArray(data.data.vehicles) ? data.data.vehicles : [];
                    const vehicle = vehiclesData.find((v: any) => v.id === vehicleId);
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
                if (directData.success && directData.data?.vehicles) {
                    const vehiclesData = Array.isArray(directData.data.vehicles) ? directData.data.vehicles : [];
                    const vehicle = vehiclesData.find((v: any) => v.id === vehicleId);
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
                if (data.success && data.data?.customer) {
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
            const matchingMakes = (vehicleMakes || []).filter((make: string) =>
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
    }, [form.vehicle, useExistingVehicle, vehicleMakes]);



    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Handle datetime-local input
        if (name === 'date' && e.target.type === 'datetime-local') {
            const [datePart, timePart] = value.split('T');
            setForm(prev => ({ 
                ...prev, 
                scheduledDate: datePart,
                scheduledTime: timePart || '09:00'
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

        if (!form.scheduledDate) {
            newErrors.date = 'Appointment date and time is required';
        } else {
            const selectedDate = new Date(`${form.scheduledDate}T${form.scheduledTime}`);
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
            let securePassword = ''; // Declare outside try block for scope
            
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

                     // Generate a secure random password
                     const generatePassword = () => {
                         const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
                         let password = '';
                         for (let i = 0; i < 12; i++) {
                             password += charset.charAt(Math.floor(Math.random() * charset.length));
                         }
                         return password;
                     };

                     securePassword = generatePassword();

                     // First, create a new user account
                     const userResponse = await fetch(`${API_ENDPOINTS.AUTH}/register`, {
                        method: 'POST',
                         headers: {
                             'Content-Type': 'application/json'
                         },
                        body: JSON.stringify({
                            name: appointmentData.customer,
                             email: appointmentData.email,
                             password: securePassword, // Secure random password
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
                        model = ''; // Leave empty instead of placeholder
                    }
                } else {
                    const parts = vehicleText.split(' ').filter(part => part.length > 0);
                    if (parts.length >= 2) {
                        make = parts[0];
                        model = parts.slice(1).join(' ');
                    } else if (parts.length === 1) {
                        make = parts[0];
                        model = ''; // Leave empty instead of placeholder
                    }
                }

                if (!make.trim()) {
                    throw new Error('Please enter a vehicle make (e.g., Toyota, Honda, Ford)');
                }

                // Validate that we have a model if make is provided
                if (!model.trim()) {
                    throw new Error('Please enter a vehicle model (e.g., Camry, Civic, F-150)');
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
                        vin: appointmentData.vin.trim() || '',
                        licensePlate: appointmentData.licensePlate.trim() || '',
                        customer: customerId
                    });

                    const vehicleResponse = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/vehicles`, {
                        method: 'POST',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({
                            year,
                            make: make.trim(),
                            model: model.trim(),
                            vin: appointmentData.vin.trim() || '',
                            licensePlate: appointmentData.licensePlate.trim() || '',
                            color: '',
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

            // Use the service type ObjectId from the form
            const serviceTypeId = appointmentData.serviceTypeId;
            
            if (!serviceTypeId) {
                throw new Error('Please select a valid service type');
            }

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
                vehicle: vehicleId,
                serviceType: serviceTypeId,
                serviceDescription: appointmentData.serviceType,
                scheduledDate: appointmentData.scheduledDate,
                scheduledTime: appointmentData.scheduledTime,
                estimatedDuration: appointmentData.estimatedDuration,
                assignedTo: assignedTo,
                priority: appointmentData.priority,
                status: appointmentData.status
            };

            // Only include customer field when creating new appointments
            if (!isEditing || !appointment?.id) {
                appointmentPayload.customer = customerId;
            }

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
            console.log('Service type details:', {
                serviceType: appointmentPayload.serviceType,
                serviceDescription: appointmentPayload.serviceDescription,
                originalServiceType: appointmentData.serviceType,
                originalServiceTypeId: appointmentData.serviceTypeId
            });

            const url = isEditing && appointment?.id 
                ? `${API_ENDPOINTS.APPOINTMENTS}/${appointment.id}`
                : API_ENDPOINTS.APPOINTMENTS;
                
            const response = await fetch(url, {
                method: isEditing && appointment?.id ? 'PUT' : 'POST',
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
            if (isEditing && appointment?.id) {
                toast.success('Appointment updated successfully!');
            } else if (shouldCreateNewVehicle) {
                toast.success('Appointment saved and new vehicle created successfully!');
            } else {
                toast.success('Appointment saved to database successfully!');
            }
            
            // If a new customer was created, show password information
            if (appointmentData.customerType === 'new') {
                toast.success(`New customer account created! Password: ${securePassword}`, {
                    duration: 8000, // Show for 8 seconds
                    icon: '🔑'
                });
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
        console.log('Form submission - current form state:', {
            serviceType: form.serviceType,
            serviceTypeId: form.serviceTypeId,
            isEditing,
            appointmentId: appointment?.id
        });
        
        if (!validateForm()) {
            return;
        }



        try {
            setIsSavingToDatabase(true);
            
            // Try to save to database first
            try {
                const savedAppointment = await saveAppointmentToDatabase(form);
                const message = isEditing && appointment?.id 
                    ? 'Appointment updated and saved to database!' 
                    : 'Appointment created and saved to database!';
                toast.success(message);
                
                // Pass the saved appointment data (with real database ID) to the calendar
                console.log('Saving appointment data to parent:', savedAppointment.data.appointment);
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
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            title={isEditing ? "Edit Appointment" : "New Appointment"}
            submitText={isLoading || isSavingToDatabase ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Appointment' : 'Create Appointment')}
            onSubmit={handleSubmit}
            submitColor="bg-blue-600"
        >
            <div className="p-6 space-y-6">
                {/* Customer Type Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Customer Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="customerType"
                                value="new"
                                checked={form.customerType === 'new'}
                                onChange={(e) => setForm(prev => ({ ...prev, customerType: e.target.value as 'new' | 'existing' }))}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">New Customer</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="customerType"
                                value="existing"
                                checked={form.customerType === 'existing'}
                                onChange={(e) => setForm(prev => ({ ...prev, customerType: e.target.value as 'new' | 'existing' }))}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Existing Customer</span>
                        </label>
                    </div>

                    {form.customerType === 'existing' ? (
                        <div>
                            <label className="form-label">Select Existing Customer</label>
                            <select
                                value={form.existingCustomerId}
                                onChange={(e) => {
                                    const customerId = e.target.value;
                                    setForm(prev => ({ ...prev, existingCustomerId: customerId }));
                                    if (customerId) {
                                        const customer = (availableCustomers || []).find(c => c.id === customerId);
                                        if (customer) {
                                            setForm(prev => ({
                                                ...prev,
                                                customer: customer.name,
                                                email: customer.email,
                                                phone: customer.phone || ''
                                            }));
                                        }
                                    }
                                }}
                                className="form-select"
                            >
                                <option value="">Select a customer</option>
                                {(availableCustomers || []).map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name} - {customer.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="form-label">Customer Name *</label>
                                <input
                                    type="text"
                                    name="customer"
                                    placeholder="Full name"
                                    className="form-input"
                                    onChange={handleChange}
                                    value={form.customer}
                                    disabled={isLoading || isSavingToDatabase}
                                    required
                                />
                                {errors.customer && (
                                    <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
                                )}
                            </div>
                            <div>
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className="form-input"
                                    onChange={handleChange}
                                    value={form.email}
                                    disabled={isLoading || isSavingToDatabase}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="form-label">Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="(555) 123-4567"
                                    className="form-input"
                                    onChange={handleChange}
                                    value={form.phone}
                                    disabled={isLoading || isSavingToDatabase}
                                    required
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Vehicle Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Vehicle Make *</label>
                            <input
                                type="text"
                                name="vehicle"
                                placeholder="e.g., Toyota"
                                className="form-input"
                                onChange={handleChange}
                                value={form.vehicle}
                                disabled={isLoading || isSavingToDatabase}
                                required
                            />
                            {errors.vehicle && (
                                <p className="text-red-500 text-sm mt-1">{errors.vehicle}</p>
                            )}
                        </div>
                        <div>
                            <label className="form-label">VIN</label>
                            <input
                                type="text"
                                name="vin"
                                placeholder="Vehicle Identification Number"
                                className="form-input"
                                onChange={handleChange}
                                value={form.vin}
                                disabled={isLoading || isSavingToDatabase}
                            />
                        </div>
                        <div>
                            <label className="form-label">License Plate</label>
                            <input
                                type="text"
                                name="licensePlate"
                                placeholder="ABC123"
                                className="form-input"
                                onChange={handleChange}
                                value={form.licensePlate}
                                disabled={isLoading || isSavingToDatabase}
                            />
                        </div>
                    </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Appointment Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Date *</label>
                            <input
                                type="date"
                                name="scheduledDate"
                                className="form-input"
                                onChange={handleChange}
                                value={form.scheduledDate}
                                disabled={isLoading || isSavingToDatabase}
                                required
                            />
                            {errors.scheduledDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Time *</label>
                            <input
                                type="time"
                                name="scheduledTime"
                                className="form-input"
                                onChange={handleChange}
                                value={form.scheduledTime}
                                disabled={isLoading || isSavingToDatabase}
                                required
                            />
                            {errors.scheduledTime && (
                                <p className="text-red-500 text-sm mt-1">{errors.scheduledTime}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Service Type *</label>
                            <select
                                name="serviceType"
                                className="form-select"
                                onChange={handleChange}
                                value={form.serviceType}
                                disabled={isLoading || isSavingToDatabase}
                                required
                            >
                                <option value="">Select service type</option>
                                {(serviceTypes || []).map(service => (
                                    <option key={service._id || service.id} value={service._id || service.id}>
                                        {service.name}
                                    </option>
                                ))}
                            </select>
                            {errors.serviceType && (
                                <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
                            )}
                        </div>
                        <div>
                            <label className="form-label">Priority</label>
                            <select
                                name="priority"
                                className="form-select"
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Estimated Duration (minutes) *</label>
                            <input
                                type="number"
                                name="estimatedDuration"
                                min="15"
                                max="480"
                                placeholder="60"
                                className="form-input"
                                onChange={handleChange}
                                value={form.estimatedDuration}
                                disabled={isLoading || isSavingToDatabase}
                                required
                            />
                            {errors.estimatedDuration && (
                                <p className="text-red-500 text-sm mt-1">{errors.estimatedDuration}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Duration between 15 minutes and 8 hours</p>
                        </div>
                        <div>
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
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
                    </div>
                    
                    <div>
                        <label className="form-label">Notes</label>
                        <textarea
                            name="notes"
                            placeholder="Any special instructions or notes"
                            className="form-textarea"
                            rows={3}
                            onChange={handleChange}
                            value={form.notes}
                            disabled={isLoading || isSavingToDatabase}
                        />
                    </div>
                </div>

                {/* Delete Button for Editing */}
                {isEditing && (
                    <div className="pt-4 border-t border-gray-200">
                        <button
                            onClick={handleDelete}
                            disabled={isLoading || isSavingToDatabase || isDeleting}
                            className="px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Appointment'}
                        </button>
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
}
