import React, { useState, useEffect } from 'react';
import { Badge, Tooltip } from '@mui/material';
import { Notifications } from '@mui/icons-material';

interface PendingApprovalsCounterProps {
  className?: string;
}

const PendingApprovalsCounter: React.FC<PendingApprovalsCounterProps> = ({ className }) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCount();
    
    // Refresh count every 5 minutes
    const interval = setInterval(fetchPendingCount, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const response = await fetch('/api/appointments/pending-approval?page=1&limit=1');
      const data = await response.json();
      
      if (data.success) {
        setCount(data.data.pagination.totalAppointments || 0);
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
        <Notifications className="w-5 h-5 text-gray-600" />
      </Badge>
    </Tooltip>
  );
};

export default PendingApprovalsCounter;
