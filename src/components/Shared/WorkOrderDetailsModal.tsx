import React from 'react';
import { X, User, Car, Wrench, FileText, Clock, DollarSign } from '../../utils/icons';
import { WorkOrder } from '../../services/workOrders';

interface WorkOrderDetailsModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
}

const WorkOrderDetailsModal: React.FC<WorkOrderDetailsModalProps> = ({
  workOrder,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
                         <div>
               <h3 className="text-xl font-bold text-gray-900">Work Order Details</h3>
               <p className="text-sm text-gray-600">#{workOrder.workOrderNumber}</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Status and Priority Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                                     <h4 className="font-medium text-gray-900 text-sm">Status</h4>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full font-medium border ${getStatusColor(workOrder.status)}`}>
                  {formatStatus(workOrder.status)}
                </span>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                                     <h4 className="font-medium text-gray-900 text-sm">Total Cost</h4>
                </div>
                                 <p className="text-2xl font-bold text-green-700">${workOrder.totalCost.toFixed(2)}</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                                     <h4 className="font-medium text-gray-900 text-sm">Labor Hours</h4>
                </div>
                                 <p className="text-2xl font-bold text-purple-700">{workOrder.totalLaborHours}h</p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                                     <h4 className="font-medium text-gray-900">Customer Information</h4>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                                         <p className="font-medium text-gray-900">{workOrder.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{workOrder.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{workOrder.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer ID</p>
                    <p className="font-medium text-gray-900">#{workOrder.customer._id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Car className="w-5 h-5 text-gray-600" />
                                     <h4 className="font-medium text-gray-900">Vehicle Information</h4>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Vehicle</p>
                                         <p className="font-medium text-gray-900">
                       {workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}
                     </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">License Plate</p>
                    <p className="font-medium text-gray-900">{workOrder.vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">VIN</p>
                    <p className="font-medium text-gray-900 font-mono text-sm">{workOrder.vehicle.vin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mileage</p>
                    <p className="font-medium text-gray-900">{workOrder.vehicle.mileage.toLocaleString()} miles</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-gray-600" />
                                     <h4 className="font-medium text-gray-900">Services ({workOrder.services.length})</h4>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {workOrder.services.map((service, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                                                 <h5 className="font-medium text-gray-900">{service.service.name}</h5>
                                                 <span className="text-lg font-bold text-blue-600">${service.totalCost.toFixed(2)}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Labor: {service.laborHours}h</span>
                        <span className="text-gray-500">Parts: ${(service.totalCost - (service.laborHours * 50)).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            {workOrder.notes && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                                         <h4 className="font-medium text-gray-900">Notes</h4>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{workOrder.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetailsModal;
