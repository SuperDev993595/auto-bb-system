import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Car, 
  Wrench, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Filter,
  Plus,
  X
} from '../../utils/icons';

interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  technician?: string;
}

interface BookingForm {
  vehicleId: string;
  serviceTypeId: string;
  date: string;
  time: string;
  notes: string;
}

export default function CustomerOnlineBooking() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    vehicleId: '',
    serviceTypeId: '',
    date: '',
    time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    loadServiceTypes();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadServiceTypes = async () => {
    try {
      setLoading(true);
      const mockServices: ServiceType[] = [
        {
          id: '1',
          name: 'Oil Change',
          description: 'Synthetic oil change with multi-point inspection',
          duration: 60,
          price: 89.99,
          category: 'Maintenance'
        },
        {
          id: '2',
          name: 'Brake Service',
          description: 'Brake pad replacement and rotor inspection',
          duration: 120,
          price: 189.99,
          category: 'Repair'
        },
        {
          id: '3',
          name: 'Tire Rotation',
          description: 'Tire rotation and balance',
          duration: 45,
          price: 45.00,
          category: 'Maintenance'
        },
        {
          id: '4',
          name: 'Full Inspection',
          description: 'Comprehensive vehicle inspection',
          duration: 90,
          price: 129.99,
          category: 'Inspection'
        }
      ];
      setServiceTypes(mockServices);
    } catch (error) {
      console.error('Error loading service types:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async (date: string) => {
    // Mock time slots - in real app, this would come from API
    const slots: TimeSlot[] = [
      { time: '09:00', available: true, technician: 'John Smith' },
      { time: '10:00', available: false },
      { time: '11:00', available: true, technician: 'Mike Johnson' },
      { time: '12:00', available: true, technician: 'Sarah Wilson' },
      { time: '13:00', available: false },
      { time: '14:00', available: true, technician: 'John Smith' },
      { time: '15:00', available: true, technician: 'Mike Johnson' },
      { time: '16:00', available: false }
    ];
    setTimeSlots(slots);
  };

  const handleServiceSelect = (serviceId: string) => {
    setBookingForm(prev => ({ ...prev, serviceTypeId: serviceId }));
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setBookingForm(prev => ({ ...prev, date }));
  };

  const handleTimeSelect = (time: string) => {
    setBookingForm(prev => ({ ...prev, time }));
    setStep(3);
  };

  const handleSubmit = async () => {
    try {
      // Mock API call
      console.log('Booking submitted:', bookingForm);
      // In real app, send booking to API
      alert('Booking submitted successfully!');
    } catch (error) {
      console.error('Error submitting booking:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Book Service</h1>
        <p className="text-gray-600">Schedule your vehicle service appointment</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Select Service</span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Choose Date & Time</span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Confirm Booking</span>
          </div>
        </div>
      </div>

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Service Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceTypes.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h6 className="font-medium text-gray-900">{service.name}</h6>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(service.price)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(service.duration)}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{service.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time Selection */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Choose Date & Time</h2>
            <button
              onClick={() => setStep(1)}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Services
            </button>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Select Date</h3>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = selectedDate === dateStr;
                const isToday = i === 0;
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDateSelect(dateStr)}
                    className={`p-3 rounded-lg border text-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold">
                      {date.getDate()}
                    </div>
                    {isToday && (
                      <div className="text-xs text-blue-600">Today</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Select Time</h3>
              <div className="grid grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border text-center ${
                      slot.available
                        ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-medium">{slot.time}</div>
                    {slot.available && slot.technician && (
                      <div className="text-xs text-gray-500">{slot.technician}</div>
                    )}
                    {!slot.available && (
                      <div className="text-xs">Unavailable</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Confirm Booking</h2>
            <button
              onClick={() => setStep(2)}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Time Selection
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Booking Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">
                  {serviceTypes.find(s => s.id === bookingForm.serviceTypeId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(bookingForm.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{bookingForm.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {formatDuration(serviceTypes.find(s => s.id === bookingForm.serviceTypeId)?.duration || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(serviceTypes.find(s => s.id === bookingForm.serviceTypeId)?.price || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={bookingForm.notes}
              onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special requests or concerns..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
              Free cancellation up to 24 hours before appointment
            </div>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
