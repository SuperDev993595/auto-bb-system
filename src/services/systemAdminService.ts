import api from './api';

// Types
export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug' | 'security';
  category: 'auth' | 'user' | 'customer' | 'appointment' | 'task' | 'system' | 'security' | 'backup' | 'email' | 'sms';
  action: string;
  message: string;
  userId?: {
    id: string;
    email: string;
    role: string;
  };
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  resource: 'customer' | 'appointment' | 'task' | 'user' | 'system' | 'email' | 'sms' | 'backup';
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  sessionId?: string;
  requestId?: string;
}

export interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  size: number;
  location: string;
  format: 'json' | 'bson' | 'sql' | 'zip';
  compression: boolean;
  encryption: boolean;
  encryptionKey?: string;
  collections?: string[];
  excludedCollections?: string[];
  metadata: {
    totalDocuments?: number;
    totalCollections?: number;
    databaseVersion?: string;
    backupVersion?: string;
  };
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    enabled: boolean;
  };
  retention: {
    days: number;
    maxBackups: number;
  };
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  error?: {
    message: string;
    stack: string;
    code: string;
  };
  createdBy: {
    id: string;
    email: string;
    role: string;
  };
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: {
    id: string;
    email: string;
    role: string;
  };
  checksum?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemHealth {
  id: string;
  timestamp: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  metrics: {
    cpu: {
      usage: number;
      load: number;
      temperature: number;
    };
    memory: {
      total: number;
      used: number;
      free: number;
      usage: number;
    };
    disk: {
      total: number;
      used: number;
      free: number;
      usage: number;
    };
    network: {
      bytesIn: number;
      bytesOut: number;
      packetsIn: number;
      packetsOut: number;
      errors: number;
    };
    database: {
      connections: number;
      activeConnections: number;
      idleConnections: number;
      queryTime: number;
      slowQueries: number;
    };
    application: {
      uptime: number;
      memoryUsage: number;
      cpuUsage: number;
      activeUsers: number;
      requestsPerMinute: number;
      averageResponseTime: number;
      errorRate: number;
    };
  };
  alerts: Array<{
    type: 'cpu' | 'memory' | 'disk' | 'network' | 'database' | 'application';
    level: 'info' | 'warning' | 'critical';
    message: string;
    threshold?: number;
    currentValue?: number;
    timestamp: string;
  }>;
  services: Array<{
    name: string;
    status: 'running' | 'stopped' | 'error' | 'unknown';
    responseTime?: number;
    lastCheck: string;
    error?: string;
  }>;
  checks: {
    database: {
      status: 'healthy' | 'warning' | 'critical' | 'offline';
      responseTime?: number;
      lastCheck: string;
      error?: string;
    };
    email: {
      status: 'healthy' | 'warning' | 'critical' | 'offline';
      responseTime?: number;
      lastCheck: string;
      error?: string;
    };
    sms: {
      status: 'healthy' | 'warning' | 'critical' | 'offline';
      responseTime?: number;
      lastCheck: string;
      error?: string;
    };
    fileStorage: {
      status: 'healthy' | 'warning' | 'critical' | 'offline';
      responseTime?: number;
      lastCheck: string;
      error?: string;
    };
  };
  recommendations: Array<{
    type: 'optimization' | 'scaling' | 'maintenance' | 'security';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    action: string;
    estimatedImpact: string;
  }>;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  release: string;
  hostname: string;
  uptime: number;
  totalMemory: number;
  freeMemory: number;
  cpus: number;
  loadAverage: number[];
  nodeVersion: string;
  processUptime: number;
  processMemory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  environment: string;
}

export interface DatabaseInfo {
  name: string;
  version: string;
  connections: {
    current: number;
    available: number;
    pending: number;
  };
  operations: {
    insert: number;
    query: number;
    update: number;
    delete: number;
    getmore: number;
    command: number;
  };
  memory: {
    bits: number;
    resident: number;
    virtual: number;
    supported: boolean;
  };
  storage: {
    db: string;
    collections: number;
    views: number;
    objects: number;
    avgObjSize: number;
    dataSize: number;
    storageSize: number;
    indexes: number;
    indexSize: number;
  };
  collections: Array<{
    name: string;
    type: string;
    options: Record<string, any>;
    info: {
      readOnly: boolean;
      uuid: string;
    };
  }>;
}

export interface LogFilters {
  level?: string;
  category?: string;
  userId?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BackupCreateData {
  name: string;
  type?: 'full' | 'incremental' | 'differential';
  compression?: boolean;
  encryption?: boolean;
  encryptionKey?: string;
  collections?: string[];
  excludedCollections?: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    enabled: boolean;
  };
  retention?: {
    days: number;
    maxBackups: number;
  };
}

export interface MonitoringThresholds {
  cpu: {
    warning: number;
    critical: number;
  };
  memory: {
    warning: number;
    critical: number;
  };
  disk: {
    warning: number;
    critical: number;
  };
  responseTime: {
    warning: number;
    critical: number;
  };
  errorRate: {
    warning: number;
    critical: number;
  };
}

// System Logs
export const getSystemLogs = async (filters: LogFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  const response = await api.get(`/system-admin/logs?${params}`);
  return response.data;
};

export const getLogStatistics = async (days: number = 30) => {
  const response = await api.get(`/system-admin/logs/stats?days=${days}`);
  return response.data;
};

export const cleanOldLogs = async (daysToKeep: number = 90) => {
  const response = await api.delete(`/system-admin/logs/clean?days=${daysToKeep}`);
  return response.data;
};

// Backup Management
export const getBackups = async (page: number = 1, limit: number = 10, status?: string, type?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  if (status) params.append('status', status);
  if (type) params.append('type', type);

  const response = await api.get(`/system-admin/backups?${params}`);
  return response.data;
};

export const getBackupStatistics = async () => {
  const response = await api.get('/system-admin/backups/stats');
  return response.data;
};

export const createBackup = async (backupData: BackupCreateData) => {
  const response = await api.post('/system-admin/backups', backupData);
  return response.data;
};

export const restoreBackup = async (backupId: string) => {
  const response = await api.post(`/system-admin/backups/${backupId}/restore`);
  return response.data;
};

export const verifyBackup = async (backupId: string) => {
  const response = await api.post(`/system-admin/backups/${backupId}/verify`);
  return response.data;
};

export const deleteBackup = async (backupId: string) => {
  const response = await api.delete(`/system-admin/backups/${backupId}`);
  return response.data;
};

export const cleanOldBackups = async (daysToKeep: number = 90) => {
  const response = await api.delete(`/system-admin/backups/clean?days=${daysToKeep}`);
  return response.data;
};

// System Monitoring
export const getSystemHealth = async () => {
  const response = await api.get('/system-admin/health');
  return response.data;
};

export const getServiceStatus = async () => {
  const response = await api.get('/system-admin/health/services');
  return response.data;
};

export const startMonitoring = async (intervalMinutes: number = 5) => {
  const response = await api.post('/system-admin/monitoring/start', { intervalMinutes });
  return response.data;
};

export const stopMonitoring = async () => {
  const response = await api.post('/system-admin/monitoring/stop');
  return response.data;
};

export const getMonitoringStatus = async () => {
  const response = await api.get('/system-admin/monitoring/status');
  return response.data;
};

export const updateMonitoringThresholds = async (thresholds: MonitoringThresholds) => {
  const response = await api.put('/system-admin/monitoring/thresholds', thresholds);
  return response.data;
};

// System Information
export const getSystemInfo = async (): Promise<{ success: boolean; data: SystemInfo }> => {
  const response = await api.get('/system-admin/system/info');
  return response.data;
};

export const getDatabaseInfo = async (): Promise<{ success: boolean; data: DatabaseInfo }> => {
  const response = await api.get('/system-admin/system/database');
  return response.data;
};

export const testConnectivity = async () => {
  const response = await api.post('/system-admin/system/test-connectivity');
  return response.data;
};

// Utility functions
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy':
    case 'completed':
    case 'running':
      return 'text-green-600';
    case 'warning':
    case 'in_progress':
      return 'text-yellow-600';
    case 'critical':
    case 'failed':
    case 'error':
    case 'stopped':
      return 'text-red-600';
    case 'pending':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

export const getStatusBgColor = (status: string): string => {
  switch (status) {
    case 'healthy':
    case 'completed':
    case 'running':
      return 'bg-green-100';
    case 'warning':
    case 'in_progress':
      return 'bg-yellow-100';
    case 'critical':
    case 'failed':
    case 'error':
    case 'stopped':
      return 'bg-red-100';
    case 'pending':
      return 'bg-blue-100';
    default:
      return 'bg-gray-100';
  }
};

export const getLevelColor = (level: string): string => {
  switch (level) {
    case 'info':
      return 'text-blue-600';
    case 'warning':
      return 'text-yellow-600';
    case 'error':
    case 'critical':
      return 'text-red-600';
    case 'security':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
};
