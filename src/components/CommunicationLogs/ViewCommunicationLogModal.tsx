import React from 'react';
import { HiChatAlt } from 'react-icons/hi';
import ModalWrapper from '../../utils/ModalWrapper';
import { CommunicationLog } from '../../utils/CustomerTypes';

interface ViewCommunicationLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: CommunicationLog;
  getCustomerName: (customerId: string) => string;
  getTypeIcon: (type: string) => React.ReactNode;
}

export default function ViewCommunicationLogModal({ 
  isOpen, 
  onClose, 
  log, 
  getCustomerName, 
  getTypeIcon 
}: ViewCommunicationLogModalProps) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Communication Details"
      icon={<HiChatAlt className="w-5 h-5" />}
    >
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Customer</label>
            <p className="text-secondary-900">{getCustomerName(log.customerId)}</p>
          </div>
          <div>
            <label className="form-label">Employee</label>
            <p className="text-secondary-900">{log.employeeName}</p>
          </div>
          <div>
            <label className="form-label">Date</label>
            <p className="text-secondary-900">{log.date}</p>
          </div>
          <div>
            <label className="form-label">Type</label>
            <div className="flex items-center gap-2 mt-1">
              {getTypeIcon(log.type)}
              <span className="text-sm text-secondary-900 capitalize">{log.type}</span>
            </div>
          </div>
        </div>
        
        <div>
          <label className="form-label">Subject</label>
          <p className="text-secondary-900">{log.subject || 'No Subject'}</p>
        </div>
        
        <div>
          <label className="form-label">Content</label>
          <p className="text-secondary-900 bg-secondary-50 p-3 rounded-lg">{log.content}</p>
        </div>
      </div>
    </ModalWrapper>
  );
}
