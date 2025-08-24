import React from 'react';
import { HiExclamation } from 'react-icons/hi';
import ModalWrapper from '../../utils/ModalWrapper';

interface DeleteCommunicationLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteCommunicationLogModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false 
}: DeleteCommunicationLogModalModalProps) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Delete"
      icon={<HiExclamation className="w-5 h-5" />}
      submitText={isLoading ? 'Deleting...' : 'Delete'}
      onSubmit={onConfirm}
      submitColor="bg-red-600"
    >
      <div className="p-4 space-y-4">
        <p className="text-secondary-600">Are you sure you want to delete this communication log? This action cannot be undone.</p>
      </div>
    </ModalWrapper>
  );
}
