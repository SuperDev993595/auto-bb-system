import React, { useState, useEffect } from 'react';
import { Badge, Tooltip } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { appointmentService } from '../../services/appointments';

interface PendingApprovalsCounterProps {
  className?: string;
  color?: 'black' | 'white' | 'default';
}

const PendingApprovalsCounter: React.FC<PendingApprovalsCounterProps> = ({ className, color = 'white' }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCount();
    
    // Refresh count every 1 minutes
    const interval = setInterval(fetchPendingCount, 1 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const response = await appointmentService.getPendingApprovals(1, 1);
      
      if (response.success) {
        setCount(response.data.pagination.totalAppointments || 0);
      }
    } catch (error) {
      console.error('Error fetching pending approvals count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (count === 0) {
    return null; // Don't show badge if no pending approvals
  }

  return (
    <Tooltip title={`${count} appointment(s) pending approval`}>
      <Badge 
        badgeContent={count > 99 ? '99+' : count} 
        color="error"
        className={className}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.75rem',
            height: '20px',
            minWidth: '20px',
            borderRadius: '10px',
          }
        }}
      >
        <Notifications className={`w-5 h-5 ${
          color === 'black' ? 'text-black' : 
          color === 'white' ? 'text-white' : 
          'text-gray-600'
        }`} />
      </Badge>
    </Tooltip>
  );
};

export default PendingApprovalsCounter;
