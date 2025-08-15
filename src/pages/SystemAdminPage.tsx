import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { 
  FaUsers, 
  FaCog, 
  FaShieldAlt, 
  FaDatabase, 
  FaChartLine,
  FaBell,
  FaKey,
  FaTrash,
  FaEdit,
  FaPlus,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaUpload,
  FaSync,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'sub_admin' | 'technician' | 'receptionist';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

interface SystemSettings {
  companyName: string;
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    taskReminders: boolean;
  };
  securitySettings: {
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    loginAttempts: number;
  };
}

const SystemAdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: 'Auto Repair Pro',
    emailSettings: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: ''
    },
    notificationSettings: {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      taskReminders: true
    },
    securitySettings: {
      passwordMinLength: 8,
      sessionTimeout: 30,
      twoFactorAuth: false,
      loginAttempts: 5
    }
  });
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    role: 'technician' as const,
    password: ''
  });

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setUsers([
      {
        id: '1',
        username: 'admin',
        email: 'admin@autorepair.com',
        role: 'super_admin',
        status: 'active',
        lastLogin: '2024-01-15T10:30:00Z',
        createdAt: '2023-01-01T00:00:00Z'
      },
      {
        id: '2',
        username: 'manager',
        email: 'manager@autorepair.com',
        role: 'sub_admin',
        status: 'active',
        lastLogin: '2024-01-14T15:45:00Z',
        createdAt: '2023-02-01T00:00:00Z'
      },
      {
        id: '3',
        username: 'john_tech',
        email: 'john@autorepair.com',
        role: 'technician',
        status: 'active',
        lastLogin: '2024-01-15T08:20:00Z',
        createdAt: '2023-03-01T00:00:00Z'
      },
      {
        id: '4',
        username: 'sarah_reception',
        email: 'sarah@autorepair.com',
        role: 'receptionist',
        status: 'active',
        lastLogin: '2024-01-15T09:15:00Z',
        createdAt: '2023-04-01T00:00:00Z'
      }
    ]);
  }, []);

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      lastLogin: '',
      createdAt: new Date().toISOString()
    };

    setUsers([...users, user]);
    setNewUser({ username: '', email: '', role: 'technician', password: '' });
    setShowAddUser(false);
    toast.success('User added successfully');
  };

  const handleUpdateUser = (user: User) => {
    setUsers(users.map(u => u.id === user.id ? user : u));
    setEditingUser(null);
    toast.success('User updated successfully');
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    }
  };

  const handleSaveSettings = () => {
    // In real app, this would save to backend
    toast.success('Settings saved successfully');
  };

  const handleBackup = () => {
    // In real app, this would trigger backup
    toast.success('Backup initiated successfully');
  };

  const handleRestore = () => {
    // In real app, this would trigger restore
    toast.success('Restore initiated successfully');
  };

  const tabs = [
    { id: 'users', name: 'User Management', icon: FaUsers },
    { id: 'settings', name: 'System Settings', icon: FaCog },
    { id: 'security', name: 'Security', icon: FaShieldAlt },
    { id: 'backup', name: 'Backup & Restore', icon: FaDatabase },
    { id: 'monitoring', name: 'System Monitoring', icon: FaChartLine }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
          <p className="text-gray-600">Manage users, settings, and system configuration</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLoading(!loading)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* User Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <FaPlus />
                Add User
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'sub_admin' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'technician' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Settings */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.emailSettings.smtpHost}
                      onChange={(e) => setSettings({
                        ...settings, 
                        emailSettings: {...settings.emailSettings, smtpHost: e.target.value}
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={settings.emailSettings.smtpPort}
                      onChange={(e) => setSettings({
                        ...settings, 
                        emailSettings: {...settings.emailSettings, smtpPort: parseInt(e.target.value)}
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notificationSettings.emailNotifications}
                      onChange={(e) => setSettings({
                        ...settings,
                        notificationSettings: {...settings.notificationSettings, emailNotifications: e.target.checked}
                      })}
                      className="mr-2"
                    />
                    Email Notifications
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notificationSettings.smsNotifications}
                      onChange={(e) => setSettings({
                        ...settings,
                        notificationSettings: {...settings.notificationSettings, smsNotifications: e.target.checked}
                      })}
                      className="mr-2"
                    />
                    SMS Notifications
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notificationSettings.appointmentReminders}
                      onChange={(e) => setSettings({
                        ...settings,
                        notificationSettings: {...settings.notificationSettings, appointmentReminders: e.target.checked}
                      })}
                      className="mr-2"
                    />
                    Appointment Reminders
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      value={settings.securitySettings.passwordMinLength}
                      onChange={(e) => setSettings({
                        ...settings,
                        securitySettings: {...settings.securitySettings, passwordMinLength: parseInt(e.target.value)}
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.securitySettings.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        securitySettings: {...settings.securitySettings, sessionTimeout: parseInt(e.target.value)}
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.securitySettings.twoFactorAuth}
                      onChange={(e) => setSettings({
                        ...settings,
                        securitySettings: {...settings.securitySettings, twoFactorAuth: e.target.checked}
                      })}
                      className="mr-2"
                    />
                    Enable Two-Factor Authentication
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.securitySettings.loginAttempts}
                      onChange={(e) => setSettings({
                        ...settings,
                        securitySettings: {...settings.securitySettings, loginAttempts: parseInt(e.target.value)}
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Backup & Restore</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Database Backup</h3>
                <p className="text-gray-600 mb-4">
                  Create a backup of your database to prevent data loss.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={handleBackup}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <FaDownload />
                    Create Backup
                  </button>
                  <div className="text-sm text-gray-500">
                    Last backup: 2024-01-15 10:30 AM
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Restore Database</h3>
                <p className="text-gray-600 mb-4">
                  Restore your database from a previous backup.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={handleRestore}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <FaUpload />
                    Restore from Backup
                  </button>
                  <div className="text-sm text-gray-500">
                    Warning: This will overwrite current data
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Monitoring */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Monitoring</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                    <p className="text-2xl font-bold text-gray-900">45%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaChartLine className="text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                    <p className="text-2xl font-bold text-gray-900">62%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaDatabase className="text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Disk Space</p>
                    <p className="text-2xl font-bold text-gray-900">78%</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <FaExclamationTriangle className="text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent System Events</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Database backup completed</p>
                    <p className="text-sm text-gray-500">2024-01-15 10:30 AM</p>
                  </div>
                  <span className="text-green-600 text-sm">Success</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">User login failed</p>
                    <p className="text-sm text-gray-500">2024-01-15 09:15 AM</p>
                  </div>
                  <span className="text-red-600 text-sm">Warning</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">System update completed</p>
                    <p className="text-sm text-gray-500">2024-01-14 11:45 PM</p>
                  </div>
                  <span className="text-green-600 text-sm">Success</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="technician">Technician</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="sub_admin">Sub Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddUser}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add User
              </button>
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAdminPage;
