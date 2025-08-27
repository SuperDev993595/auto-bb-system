import React from 'react';
import { 
  CheckCircle, 
  Schedule, 
  Pending, 
  Assignment,
  Build,
  Done
} from '@mui/icons-material';

interface ApprovalStep {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  description: string;
  timestamp?: Date;
  completedBy?: string;
}

interface ApprovalProgressProps {
  appointmentId: string;
  currentStep: string;
  steps: ApprovalStep[];
  estimatedTime?: number; // in minutes
}

const ApprovalProgress: React.FC<ApprovalProgressProps> = ({
  appointmentId,
  currentStep,
  steps,
  estimatedTime = 30
}) => {
  const getStepIcon = (step: ApprovalStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'current':
        return <Pending className="w-6 h-6 text-blue-600" />;
      case 'pending':
        return <Schedule className="w-6 h-6 text-gray-400" />;
      case 'skipped':
        return <Assignment className="w-6 h-6 text-gray-400" />;
      default:
        return <Schedule className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStepColor = (step: ApprovalStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-blue-500 bg-blue-50';
      case 'pending':
        return 'border-gray-300 bg-gray-50';
      case 'skipped':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getStepTextColor = (step: ApprovalStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-800';
      case 'current':
        return 'text-blue-800';
      case 'pending':
        return 'text-gray-500';
      case 'skipped':
        return 'text-gray-400';
      default:
        return 'text-gray-500';
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Approval Progress</h3>
          <p className="text-sm text-gray-600">
            Appointment ID: {appointmentId}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</div>
          <div className="text-sm text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {completedSteps} of {steps.length} steps
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 ${getStepColor(step)}`}
          >
            {/* Step Icon */}
            <div className="flex-shrink-0 mt-1">
              {getStepIcon(step)}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${getStepTextColor(step)}`}>
                  {step.name}
                </h4>
                {step.status === 'completed' && step.timestamp && (
                  <span className="text-xs text-gray-500">
                    {step.timestamp.toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <p className={`text-sm mt-1 ${getStepTextColor(step)}`}>
                {step.description}
              </p>
              
              {step.status === 'completed' && step.completedBy && (
                <p className="text-xs text-gray-500 mt-1">
                  Completed by: {step.completedBy}
                </p>
              )}
            </div>

            {/* Step Number */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : step.status === 'current'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Estimated Time */}
      {estimatedTime && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <Schedule className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Estimated Time</p>
              <p className="text-sm text-blue-600">
                {estimatedTime} minutes remaining
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-gray-800">Current Status</p>
            <p className="text-sm text-gray-600">
              {steps.find(step => step.status === 'current')?.name || 'Processing...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalProgress;
