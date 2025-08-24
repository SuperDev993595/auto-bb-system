import React from 'react';
import { HiExclamation, HiCheckCircle, HiInformationCircle } from 'react-icons/hi';
import ModalWrapper from '../../utils/ModalWrapper';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <HiExclamation className="w-5 h-5" />,
          submitColor: 'bg-red-600'
        };
      case 'warning':
        return {
          icon: <HiExclamation className="w-5 h-5" />,
          submitColor: 'bg-yellow-600'
        };
      case 'success':
        return {
          icon: <HiCheckCircle className="w-5 h-5" />,
          submitColor: 'bg-green-600'
        };
      default:
        return {
          icon: <HiInformationCircle className="w-5 h-5" />,
          submitColor: 'bg-blue-600'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      icon={config.icon}
      submitText={confirmText}
      onSubmit={onConfirm}
      submitColor={config.submitColor}
    >
      <div className="p-4">
        <p className="text-gray-600">{message}</p>
      </div>
    </ModalWrapper>
  );
}
