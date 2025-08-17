import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Activity, Database, FileText, HardDrive, Monitor, Server } from 'lucide-react';
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
    { id: 'overview', label: 'Overview', icon: <Activity size={20} /> },
    { id: 'system', label: 'System Info', icon: <Server size={20} /> }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className={`text-2xl font-bold ${getStatusColor(systemHealth?.status || 'unknown')}`}>
                {systemHealth?.status || 'Unknown'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${getStatusBgColor(systemHealth?.status || 'unknown')}`}>
              <Activity size={24} className={getStatusColor(systemHealth?.status || 'unknown')} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemHealth?.metrics?.cpu?.usage?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Monitor size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemHealth?.metrics?.memory?.usage?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Database size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disk Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {systemHealth?.metrics?.disk?.usage?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <HardDrive size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemInfo = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        {systemInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Platform</span>
                <span className="text-sm font-medium">{systemInfo.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Architecture</span>
                <span className="text-sm font-medium">{systemInfo.arch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Release</span>
                <span className="text-sm font-medium">{systemInfo.release}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hostname</span>
                <span className="text-sm font-medium">{systemInfo.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium">{formatUptime(systemInfo.uptime)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Memory</span>
                <span className="text-sm font-medium">{formatBytes(systemInfo.totalMemory)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Free Memory</span>
                <span className="text-sm font-medium">{formatBytes(systemInfo.freeMemory)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CPU Cores</span>
                <span className="text-sm font-medium">{systemInfo.cpus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Node Version</span>
                <span className="text-sm font-medium">{systemInfo.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Environment</span>
                <span className="text-sm font-medium">{systemInfo.environment}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {databaseInfo && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Database Name</span>
                <span className="text-sm font-medium">{databaseInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Version</span>
                <span className="text-sm font-medium">{databaseInfo.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Collections</span>
                <span className="text-sm font-medium">{databaseInfo.storage?.collections || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Documents</span>
                <span className="text-sm font-medium">{(databaseInfo.storage?.objects || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Connections</span>
                <span className="text-sm font-medium">{databaseInfo.connections?.current || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Available Connections</span>
                <span className="text-sm font-medium">{databaseInfo.connections?.available || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Queries</span>
                <span className="text-sm font-medium">{(databaseInfo.operations?.query || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Updates</span>
                <span className="text-sm font-medium">{(databaseInfo.operations?.update || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
          <p className="mt-2 text-gray-600">
            Monitor system health and view system information
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'system' && renderSystemInfo()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemAdminPage;
