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
    approvalStatus: 'pending' | 'approved' | 'declined' | 'requires_followup';
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
        approvalStatus: 'pending',
        technicianId: "",
        technicianName: "",
        customerType: 'existing', // Always existing
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

    const [availableCustomers, setAvailableCustomers] = useState<Array<{id: string, name: string, email: string, phone?: string}>>([]);
    const [selectedCustomerVehicles, setSelectedCustomerVehicles] = useState<Vehicle[]>([]);
    const [isLoadingCustomerVehicles, setIsLoadingCustomerVehicles] = useState(false);
    
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
                // serviceType is just an ID string, we'll need to find the name later
                serviceTypeId = appointment.serviceType;
                serviceTypeName = ''; // Will be populated when service types are loaded
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
                approvalStatus: (appointment as any).approvalStatus || 'pending',
                technicianId: appointment.technicianId || appointment.technician?._id || (appointment as any).technician || "",
                technicianName: appointment.technicianName || appointment.technician?.name || (appointment as any).technicianName || "",
                customerType: 'existing',
                existingCustomerId: appointment.customerId,
                date: dateString || appointmentDate.toISOString().split('T')[0],
                time: timeString
            });
            
            // Set useExistingVehicle to true when editing an existing appointment
            // setUseExistingVehicle(true); // This state is removed
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
            console.log('Loading service types...');
            console.log('API endpoint:', `${API_ENDPOINTS.SERVICES}/types`);
            console.log('Auth headers:', getAuthHeaders());
            
            const response = await fetch(`${API_ENDPOINTS.SERVICES}/types`, {
                headers: getAuthHeaders()
            });
            console.log('Service types response status:', response.status);
            console.log('Service types response headers:', response.headers);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Service types response data:', data);
                if (data.success) {
                    console.log('Loaded service types:', data.data);
                    const serviceTypesData = Array.isArray(data.data) ? data.data : [];
                    console.log('Setting service types state:', serviceTypesData);
                    setServiceTypes(serviceTypesData);
                    
                    // If we're editing and have a serviceType name but no ID, try to find the matching service
                    if (isEditing && form.serviceType && !form.serviceTypeId) {
                        console.log('Looking for matching service:', {
                            serviceType: form.serviceType,
                            serviceTypeId: form.serviceTypeId,
                            availableServices: serviceTypesData.map((s: any) => ({ id: s._id || s.id, name: s.name }))
                        });
                        const matchingService = serviceTypesData.find((service: any) => 
                            service.name === form.serviceType
                        );
                        if (matchingService) {
                            console.log('Found matching service for ID:', matchingService);
                            setForm(prev => ({
                                ...prev,
                                serviceTypeId: matchingService._id || matchingService.id || ''
                            }));
                        } else {
                            console.log('No matching service found for:', form.serviceType);
                        }
                    }
                    
                    // If we're editing and have a serviceTypeId but no serviceType name, try to find the matching service
                    if (isEditing && form.serviceTypeId && !form.serviceType) {
                        console.log('Looking for matching service by ID:', {
                            serviceTypeId: form.serviceTypeId,
                            serviceType: form.serviceType,
                            availableServices: serviceTypesData.map((s: any) => ({ id: s._id || s.id, name: s.name }))
                        });
                        const matchingService = serviceTypesData.find((service: any) => 
                            (service._id || service.id) === form.serviceTypeId
                        );
                        if (matchingService) {
                            console.log('Found matching service by ID:', matchingService);
                            setForm(prev => ({
                                ...prev,
                                serviceType: matchingService.name || ''
                            }));
                        } else {
                            console.log('No matching service found for ID:', form.serviceTypeId);
                        }
                    }
                } else {
                    console.error('Service types response not successful:', data);
                    setServiceTypes([]);
                }
            } else {
                console.error('Failed to load service types:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                setServiceTypes([]);
            }
        } catch (error) {
            console.warn('Failed to load service types:', error);
            console.error('Error details:', error);
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
            setIsLoadingCustomerVehicles(true);
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
            setIsLoadingCustomerVehicles(false);
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
        if (form.vehicle && form.customerType === 'existing') {
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
    }, [form.vehicle, form.customerType, vehicleMakes]);



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
        // Handle service type selection
        else if (name === 'serviceType') {
            const selectedService = serviceTypes.find(service => 
                (service._id || service.id) === value
            );
            if (selectedService) {
                setForm(prev => ({ 
                    ...prev, 
                    serviceType: selectedService.name,
                    serviceTypeId: selectedService._id || selectedService.id,
                    estimatedDuration: selectedService.estimatedDuration || 60
                }));
            }
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
        // setUseExistingVehicle(false); // This state is removed
    };

    const handleExistingVehicleSelection = (vehicleId: string) => {
        if (vehicleId) {
            const vehicle = (selectedCustomerVehicles || []).find(v => v.id === vehicleId);
            if (vehicle) {
                setForm(prev => ({
                    ...prev,
                    vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                    vehicleId: vehicle.id,
                    vin: vehicle.vin || "",
                    licensePlate: vehicle.licensePlate || ""
                }));
            }
        } else {
            setForm(prev => ({
                ...prev,
                vehicle: "",
                vehicleId: "",
                vin: "",
                licensePlate: ""
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<AppointmentData> = {};

        // Customer validation - only existing customers allowed
        if (!form.existingCustomerId) {
            newErrors.existingCustomerId = 'Please select an existing customer';
        }

        // Vehicle validation - only existing vehicles allowed
        if (!form.vehicleId) {
            newErrors.vehicle = 'Please select a vehicle for this customer';
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

        if (!form.serviceTypeId) {
            newErrors.serviceType = 'Service type is required';
        }

        if (form.estimatedDuration < 15 || form.estimatedDuration > 480) {
            newErrors.estimatedDuration = 'Estimated duration must be between 15 and 480 minutes' as any;
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

            // Handle customer - only existing customers allowed
            let customerId = null;
            
            if (!appointmentData.existingCustomerId) {
                throw new Error('Please select an existing customer');
            }
            
            customerId = appointmentData.existingCustomerId;

            // Handle vehicle - only existing vehicles allowed
            let vehicleId = appointmentData.vehicleId;
            
            if (!vehicleId) {
                throw new Error('Please select a vehicle for this customer');
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
                scheduledDate: appointmentData.scheduledDate,
                scheduledTime: appointmentData.scheduledTime,
                estimatedDuration: appointmentData.estimatedDuration,
                assignedTo: assignedTo,
                priority: appointmentData.priority,
                status: appointmentData.status
            };

            // Only include serviceDescription if it's not empty
            if (appointmentData.serviceType && appointmentData.serviceType.trim()) {
                appointmentPayload.serviceDescription = appointmentData.serviceType.trim();
            }

            // Only include customerId when creating new appointments, not when updating
            if (!isEditing || !appointment?.id) {
                appointmentPayload.customerId = customerId;
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
            } else {
                toast.success('Appointment saved to database successfully!');
            }
            
            return savedAppointment;
        } catch (error) {
            console.error('Error saving appointment to database:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to save appointment to database');
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
                // The server returns the appointment data directly, not nested under data.appointment
                console.log('Saving appointment data to parent:', savedAppointment);
                onSave(savedAppointment.data.appointment);
                
            } catch (dbError) {
                console.warn('Database save failed:', dbError);
                
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

    // Remove unused functions
    const handleCustomerTypeChange = (customerType: 'new' | 'existing') => {
        // This function is no longer needed since we only allow existing customers
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
        
        // Clear vehicle selection when customer changes
        setForm(prev => ({
            ...prev,
            vehicle: "",
            vehicleId: "",
            vin: "",
            licensePlate: ""
        }));
    };

    // Remove unused functions
    const formatPhoneNumber = (value: string) => {
        // This function is no longer needed
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        // This function is no longer needed
    };

    const checkEmailAvailability = async (email: string) => {
        // This function is no longer needed
    };

    // Remove unused useEffect for email check
    useEffect(() => {
        // This effect is no longer needed
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
                {/* Customer Selection */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Customer & Vehicle Selection
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Select Customer *</label>
                            <select
                                value={form.existingCustomerId}
                                onChange={(e) => {
                                    const customerId = e.target.value;
                                    if (customerId) {
                                        const customer = (availableCustomers || []).find(c => c.id === customerId);
                                        if (customer) {
                                            selectCustomer(customer);
                                        }
                                    } else {
                                        setForm(prev => ({
                                            ...prev,
                                            customer: "",
                                            email: "",
                                            phone: "",
                                            existingCustomerId: "",
                                            vehicle: "",
                                            vehicleId: "",
                                            vin: "",
                                            licensePlate: ""
                                        }));
                                        setSelectedCustomerVehicles([]);
                                    }
                                }}
                                className="form-select"
                                required
                            >
                                <option value="">Select a customer</option>
                                {(availableCustomers || []).map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name} - {customer.email}
                                    </option>
                                ))}
                            </select>
                            {errors.existingCustomerId && (
                                <p className="text-red-500 text-sm mt-1">{errors.existingCustomerId}</p>
                            )}
                        </div>
                        
                        {form.existingCustomerId && (
                            <div>
                                <label className="form-label">Select Vehicle *</label>
                                <select
                                    value={form.vehicleId}
                                    onChange={(e) => handleExistingVehicleSelection(e.target.value)}
                                    className="form-select"
                                    disabled={isLoadingCustomerVehicles}
                                    required
                                >
                                    <option value="">
                                        {isLoadingCustomerVehicles ? 'Loading vehicles...' : 'Select a vehicle'}
                                    </option>
                                    {(selectedCustomerVehicles || []).map(vehicle => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate || 'No Plate'}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingCustomerVehicles && (
                                    <p className="text-sm text-gray-500 mt-1">Loading customer vehicles...</p>
                                )}
                                {!isLoadingCustomerVehicles && selectedCustomerVehicles.length === 0 && form.existingCustomerId && (
                                    <p className="text-sm text-gray-500 mt-1">No vehicles found for this customer</p>
                                )}
                                {errors.vehicle && (
                                    <p className="text-red-500 text-sm mt-1">{errors.vehicle}</p>
                                )}
                            </div>
                        )}
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
                                value={form.serviceTypeId}
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
                                <option value="pending_approval">Pending Approval</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="no-show">No Show</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Approval Status</label>
                            <select
                                name="approvalStatus"
                                className="form-select"
                                onChange={handleChange}
                                value={form.approvalStatus || 'pending'}
                                disabled={isLoading || isSavingToDatabase}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="declined">Declined</option>
                                <option value="requires_followup">Requires Follow-up</option>
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
