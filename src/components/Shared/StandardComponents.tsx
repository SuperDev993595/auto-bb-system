import React from 'react';
import { Loader2, AlertCircle, CheckCircle, Info, X } from 'lucide-react';

// Standard Button Components
export const Button = {
  Primary: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className="btn-primary" {...props}>
      {children}
    </button>
  ),
  
  Secondary: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className="btn-secondary" {...props}>
      {children}
    </button>
  ),
  
  Success: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className="btn-success" {...props}>
      {children}
    </button>
  ),
  
  Warning: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className="btn-warning" {...props}>
      {children}
    </button>
  ),
  
  Error: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className="btn-error" {...props}>
      {children}
    </button>
  ),
  
  Info: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className="btn-info" {...props}>
      {children}
    </button>
  ),
  
  PrimaryOutline: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className="btn-primary-outline" {...props}>
      {children}
    </button>
  ),
  
  Small: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className="btn-secondary btn-sm" {...props}>
      {children}
    </button>
  ),
  
  Large: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className="btn-primary btn-lg" {...props}>
      {children}
    </button>
  ),
};

// Standard Status Badge Components
export const StatusBadge = {
  Active: ({ children }: { children: React.ReactNode }) => (
    <span className="status-badge status-active">{children}</span>
  ),
  
  Pending: ({ children }: { children: React.ReactNode }) => (
    <span className="status-badge status-pending">{children}</span>
  ),
  
  Inactive: ({ children }: { children: React.ReactNode }) => (
    <span className="status-badge status-inactive">{children}</span>
  ),
  
  Completed: ({ children }: { children: React.ReactNode }) => (
    <span className="status-badge status-completed">{children}</span>
  ),
  
  Cancelled: ({ children }: { children: React.ReactNode }) => (
    <span className="status-badge status-cancelled">{children}</span>
  ),
  
  InProgress: ({ children }: { children: React.ReactNode }) => (
    <span className="status-badge status-in-progress">{children}</span>
  ),
};

// Standard Priority Badge Components
export const PriorityBadge = {
  Urgent: ({ children }: { children: React.ReactNode }) => (
    <span className="status-badge priority-urgent">{children}</span>
  ),
  
  High: ({ children }: { children: React.ReactNode }) => (
    <span className="status-badge priority-high">{children}</span>
  ),
  
  Medium: ({ children }: { children: React.ReactNode }) => (
    <span className="status-badge priority-medium">{children}</span>
  ),
  
  Low: ({ children }: { children: React.ReactNode }) => (
    <span className="status-badge priority-low">{children}</span>
  ),
};

// Standard Loading Components
export const Loading = {
  Spinner: ({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) => {
    const sizeClass = size === 'small' ? 'loading-spinner-small' : 
                     size === 'large' ? 'loading-spinner-large' : 'loading-spinner';
    return <Loader2 className={sizeClass} />;
  },
  
  Container: ({ children }: { children: React.ReactNode }) => (
    <div className="loading-container">
      <div className="text-center">
        {children}
      </div>
    </div>
  ),
  
  Text: ({ children }: { children: React.ReactNode }) => (
    <p className="loading-text">{children}</p>
  ),
};

// Standard Empty State Components
export const EmptyState = {
  Container: ({ children }: { children: React.ReactNode }) => (
    <div className="empty-state">
      {children}
    </div>
  ),
  
  Icon: ({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) => (
    <Icon className="empty-state-icon" />
  ),
  
  Title: ({ children }: { children: React.ReactNode }) => (
    <h3 className="empty-state-title">{children}</h3>
  ),
  
  Description: ({ children }: { children: React.ReactNode }) => (
    <p className="empty-state-description">{children}</p>
  ),
};

// Standard Card Components
export const Card = {
  Container: ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`card ${className}`}>
      {children}
    </div>
  ),
  
  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="card-header">
      {children}
    </div>
  ),
  
  Body: ({ children }: { children: React.ReactNode }) => (
    <div className="card-body">
      {children}
    </div>
  ),
  
  Footer: ({ children }: { children: React.ReactNode }) => (
    <div className="card-footer">
      {children}
    </div>
  ),
};

// Standard Stats Card Components
export const StatsCard = {
  Container: ({ children }: { children: React.ReactNode }) => (
    <div className="stats-card">
      {children}
    </div>
  ),
  
  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="stats-card-header">
      {children}
    </div>
  ),
  
  Icon: ({ children }: { children: React.ReactNode }) => (
    <div className="stats-card-icon">
      {children}
    </div>
  ),
  
  Value: ({ children }: { children: React.ReactNode }) => (
    <p className="stats-card-value">{children}</p>
  ),
  
  Label: ({ children }: { children: React.ReactNode }) => (
    <p className="stats-card-label">{children}</p>
  ),
  
  Subtitle: ({ children }: { children: React.ReactNode }) => (
    <p className="stats-card-subtitle">{children}</p>
  ),
  
  Subvalue: ({ children }: { children: React.ReactNode }) => (
    <p className="stats-card-subvalue">{children}</p>
  ),
};

// Standard Form Components
export const Form = {
  Input: ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input className="input-field" {...props} />
  ),
  
  InputWithIcon: ({ icon: Icon, ...props }: { icon: React.ComponentType<{ className?: string }> } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="relative">
      <div className="input-icon">
        <Icon className="w-5 h-5" />
      </div>
      <input className="input-field-with-icon" {...props} />
    </div>
  ),
  
  Select: ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select className="select-field" {...props}>
      {children}
    </select>
  ),
  
  Textarea: ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea className="textarea-field" {...props} />
  ),
  
  Label: ({ children }: { children: React.ReactNode }) => (
    <label className="form-label">{children}</label>
  ),
};

// Standard Modal Components
export const Modal = {
  Overlay: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div className="modal-overlay" onClick={onClick}>
      {children}
    </div>
  ),
  
  Container: ({ children, size = 'md' }: { children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
    const sizeClass = size === 'sm' ? 'modal-container-sm' : 
                     size === 'lg' ? 'modal-container-lg' : 
                     size === 'xl' ? 'modal-container-xl' : 'modal-container';
    return (
      <div className={sizeClass}>
        {children}
      </div>
    );
  },
  
  Header: ({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) => (
    <div className="modal-header">
      <div className="flex items-center gap-3">
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} className="modal-close">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  ),
  
  Title: ({ children }: { children: React.ReactNode }) => (
    <h2 className="modal-title">{children}</h2>
  ),
  
  Body: ({ children }: { children: React.ReactNode }) => (
    <div className="modal-body">
      {children}
    </div>
  ),
  
  Footer: ({ children }: { children: React.ReactNode }) => (
    <div className="modal-footer">
      {children}
    </div>
  ),
};

// Standard Table Components
export const Table = {
  Container: ({ children }: { children: React.ReactNode }) => (
    <div className="table-container">
      {children}
    </div>
  ),
  
  Table: ({ children }: { children: React.ReactNode }) => (
    <table className="table">
      {children}
    </table>
  ),
  
  Header: ({ children }: { children: React.ReactNode }) => (
    <thead className="table-header">
      {children}
    </thead>
  ),
  
  HeaderCell: ({ children }: { children: React.ReactNode }) => (
    <th className="table-header-cell">{children}</th>
  ),
  
  Body: ({ children }: { children: React.ReactNode }) => (
    <tbody className="table-body">
      {children}
    </tbody>
  ),
  
  Row: ({ children }: { children: React.ReactNode }) => (
    <tr className="table-row">
      {children}
    </tr>
  ),
  
  Cell: ({ children }: { children: React.ReactNode }) => (
    <td className="table-cell">{children}</td>
  ),
};

// Standard Page Layout Components
export const PageLayout = {
  Container: ({ children }: { children: React.ReactNode }) => (
    <div className="page-container">
      {children}
    </div>
  ),
  
  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="page-header">
      {children}
    </div>
  ),
  
  HeaderContent: ({ children }: { children: React.ReactNode }) => (
    <div className="page-header-content">
      {children}
    </div>
  ),
  
  HeaderText: ({ children }: { children: React.ReactNode }) => (
    <div className="page-header-text">
      {children}
    </div>
  ),
  
  Title: ({ children }: { children: React.ReactNode }) => (
    <h1 className="page-title">{children}</h1>
  ),
  
  Subtitle: ({ children }: { children: React.ReactNode }) => (
    <p className="page-subtitle">{children}</p>
  ),
  
  HeaderActions: ({ children }: { children: React.ReactNode }) => (
    <div className="page-header-actions">
      {children}
    </div>
  ),
};

// Standard Tab Components
export const Tab = {
  Container: ({ children }: { children: React.ReactNode }) => (
    <div className="tab-container">
      {children}
    </div>
  ),
  
  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="tab-header">
      {children}
    </div>
  ),
  
  Buttons: ({ children }: { children: React.ReactNode }) => (
    <div className="tab-buttons">
      {children}
    </div>
  ),
  
  Button: ({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`tab-button ${active ? 'tab-button-active' : 'tab-button-inactive'}`}
    >
      {children}
    </button>
  ),
};
