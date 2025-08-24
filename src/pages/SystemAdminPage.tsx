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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mx-auto mb-4">
            <HiChartBar className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">System Status</p>
          <p className={`text-2xl font-bold ${getStatusColor(systemHealth?.status || 'unknown')}`}>
            {systemHealth?.status || 'Unknown'}
          </p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">System Status</p>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-info-100 rounded-xl mx-auto mb-4">
            <HiDesktopComputer className="w-6 h-6 text-info-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">CPU Usage</p>
          <p className="text-2xl font-bold text-secondary-900">
            {systemHealth?.metrics?.cpu?.usage?.toFixed(1) || '0'}%
          </p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">CPU Usage</p>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl mx-auto mb-4">
            <HiDatabase className="w-6 h-6 text-success-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">Memory Usage</p>
          <p className="text-2xl font-bold text-secondary-900">
            {systemHealth?.metrics?.memory?.usage?.toFixed(1) || '0'}%
          </p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">Memory Usage</p>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl mx-auto mb-4">
            <HiChip className="w-6 h-6 text-warning-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">Disk Usage</p>
          <p className="text-2xl font-bold text-secondary-900">
            {systemHealth?.metrics?.disk?.usage?.toFixed(1) || '0'}%
          </p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">Disk Usage</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemInfo = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-secondary-900 mb-4">System Information</h3>
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
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">Database Information</h3>
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
    <div className="min-h-screen bg-secondary-50 p-6 space-y-8">
      {/* Page Header */}
      <div className="min-h-32 flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">System Administration</h1>
          <p className="text-secondary-600">Monitor system health and view system information</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="p-4 border-b border-secondary-200">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                    : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-96">
            <div className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600 border-2 border-primary-600 border-t-transparent rounded-full"></div>
            <p className="text-secondary-600">Loading system data...</p>
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
