import { useState } from 'react';
import { useAppDispatch } from '../../redux';
import { deleteAppointment } from '../../redux/actions/appointments';
import { Appointment } from '../../utils/CustomerTypes';
import { HiTrash, HiPencil, HiEye } from 'react-icons/hi';

type AppointmentCardProps = {
    appointment: Appointment;
    onEdit?: (appointment: Appointment) => void;
    onView?: (appointment: Appointment) => void;
    onDelete?: (appointment: Appointment) => void;
};

export default function AppointmentCard({
    appointment,
    onEdit,
    onView,
    onDelete
}: AppointmentCardProps) {
    const dispatch = useAppDispatch();
    const [isDeleting, setIsDeleting] = useState(false);

    // Debug logging to help identify data issues
    console.log('AppointmentCard rendering with appointment:', {
        id: appointment.id,
        customerName: appointment.customerName,
        vehicleInfo: appointment.vehicleInfo,
        serviceType: appointment.serviceType,
        scheduledDate: appointment.scheduledDate,
        scheduledTime: appointment.scheduledTime,
        status: appointment.status,
        priority: appointment.priority
    });

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
            setIsDeleting(true);
            try {
                await dispatch(deleteAppointment(appointment.id)).unwrap();
            } catch (error) {
                console.error('Failed to delete appointment:', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const getStatusColor = (status: Appointment['status']) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'in-progress': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'no-show': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: Appointment['priority']) => {
        switch (priority) {
            case 'urgent': return 'border-l-red-500';
            case 'high': return 'border-l-orange-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-green-500';
            default: return 'border-l-gray-400';
        }
    };

    // Add error boundary for this component
    try {
        return (
            <div className={`bg-white rounded-lg shadow-md p-4 text-sm border-l-4 ${getPriorityColor(appointment.priority || 'medium')} hover:shadow-lg transition-shadow`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{appointment.customerName || 'Unknown Customer'}</h3>
                        <p className="text-gray-600 text-xs">{appointment.vehicleInfo || 'Unknown Vehicle'}</p>
                    </div>
                    <div className="flex gap-1">
                        {onView && (
                            <button
                                onClick={() => onView(appointment)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View details"
                            >
                                <HiEye className="w-4 h-4" />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => onEdit(appointment)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit appointment"
                            >
                                <HiPencil className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={onDelete ? () => onDelete(appointment) : handleDelete}
                            disabled={isDeleting}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete appointment"
                        >
                            <HiTrash className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Date & Time:</span>
                        <span className="font-medium">
                            {appointment.scheduledDate || 'No date'} at {appointment.scheduledTime || 'No time'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">
                            {typeof appointment.serviceType === 'string' 
                                ? appointment.serviceType 
                                : appointment.serviceType?.name || 'Unknown Service'
                            }
                        </span>
                    </div>

                    {appointment.technicianName && appointment.technicianName.trim() && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Technician:</span>
                            <span className="font-medium">{appointment.technicianName}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{appointment.estimatedDuration || 0} min</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status || 'scheduled')}`}>
                            {(appointment.status || 'scheduled').replace('-', ' ')}
                        </span>
                    </div>

                    {appointment.notes && appointment.notes.trim() && (
                        <div className="mt-2">
                            <span className="text-gray-600 text-xs">Notes:</span>
                            <p className="text-gray-800 text-xs mt-1">{appointment.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error rendering AppointmentCard:', error, appointment);
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                <div className="text-red-600 font-medium mb-2">Error displaying appointment</div>
                <div className="text-red-500 text-xs">
                    <div>ID: {appointment.id || 'Unknown'}</div>
                    <div>Customer: {appointment.customerName || 'Unknown'}</div>
                    <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
                </div>
            </div>
        );
    }
}
