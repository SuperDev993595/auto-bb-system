import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiChartBar, HiDatabase, HiDocumentText, HiChip, HiDesktopComputer, HiServer } from 'react-icons/hi';
import {
  getSystemHealth,
  getSystemInfo,
  getDatabaseInfo,
  formatBytes,
  formatUptime,
  getStatusColor,
  getStatusBgColor
} from '../services/systemAdminService';

const SystemAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [health, system, database] = await Promise.all([
        getSystemHealth(),
        getSystemInfo(),
        getDatabaseInfo()
      ]);
      setSystemHealth(health.data.current);
      setSystemInfo(system.data);
      setDatabaseInfo(database.data);
    } catch (error) {
      console.error('Error loading system data:', error);
      toast.error('Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <HiChartBar className="w-5 h-5" /> },
    { id: 'system', label: 'System Info', icon: <HiServer className="w-5 h-5" /> }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid-responsive">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">System Status</p>
              <p className={`text-2xl font-bold ${getStatusColor(systemHealth?.status || 'unknown')}`}>
                {systemHealth?.status || 'Unknown'}
              </p>
            </div>
            <div className={`stats-icon ${getStatusBgColor(systemHealth?.status || 'unknown')}`}>
              <HiChartBar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">CPU Usage</p>
              <p className="text-2xl font-bold text-secondary-900">
                {systemHealth?.metrics?.cpu?.usage?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="stats-icon bg-primary-100">
              <HiDesktopComputer className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Memory Usage</p>
              <p className="text-2xl font-bold text-secondary-900">
                {systemHealth?.metrics?.memory?.usage?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="stats-icon bg-success-100">
              <HiDatabase className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Disk Usage</p>
              <p className="text-2xl font-bold text-secondary-900">
                {systemHealth?.metrics?.disk?.usage?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="stats-icon bg-info-100">
              <HiChip className="w-6 h-6 text-info-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemInfo = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="page-subtitle mb-4">System Information</h3>
        {systemInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Platform</span>
                <span className="text-sm font-medium text-secondary-900">{systemInfo.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Architecture</span>
                <span className="text-sm font-medium text-secondary-900">{systemInfo.arch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Release</span>
                <span className="text-sm font-medium text-secondary-900">{systemInfo.release}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Hostname</span>
                <span className="text-sm font-medium text-secondary-900">{systemInfo.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Uptime</span>
                <span className="text-sm font-medium text-secondary-900">{formatUptime(systemInfo.uptime)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Total Memory</span>
                <span className="text-sm font-medium text-secondary-900">{formatBytes(systemInfo.totalMemory)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Free Memory</span>
                <span className="text-sm font-medium text-secondary-900">{formatBytes(systemInfo.freeMemory)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">CPU Cores</span>
                <span className="text-sm font-medium text-secondary-900">{systemInfo.cpus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Node Version</span>
                <span className="text-sm font-medium text-secondary-900">{systemInfo.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Environment</span>
                <span className="text-sm font-medium text-secondary-900">{systemInfo.environment}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {databaseInfo && (
        <div className="card">
          <h3 className="page-subtitle mb-4">Database Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Database Name</span>
                <span className="text-sm font-medium text-secondary-900">{databaseInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Version</span>
                <span className="text-sm font-medium text-secondary-900">{databaseInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Collections</span>
                <span className="text-sm font-medium text-secondary-900">{databaseInfo.storage?.collections || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Documents</span>
                <span className="text-sm font-medium text-secondary-900">{(databaseInfo.storage?.objects || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Current Connections</span>
                <span className="text-sm font-medium text-secondary-900">{databaseInfo.connections?.current || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Available Connections</span>
                <span className="text-sm font-medium text-secondary-900">{databaseInfo.connections?.available || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Total Queries</span>
                <span className="text-sm font-medium text-secondary-900">{(databaseInfo.operations?.query || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Total Updates</span>
                <span className="text-sm font-medium text-secondary-900">{(databaseInfo.operations?.update || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">System Administration</h1>
          <p className="mt-2 text-secondary-600">
            Monitor system health and view system information
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="tab-container">
          <div className="tab-header">
            <nav className="tab-buttons">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : 'tab-button-inactive'}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading system data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'system' && renderSystemInfo()}
          </>
        )}
      </div>
    </div>
  );
};

export default SystemAdminPage;
