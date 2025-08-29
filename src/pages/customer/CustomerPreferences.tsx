import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Settings, 
  Bell, 
  Shield, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  Wrench,
  CreditCard,
  Save,
  RefreshCw,
  Check,
  AlertCircle
} from '../../utils/icons';
import { customerService } from '../../services/customers';
import { useAuth } from '../../context/AuthContext';
import { Customer } from '../../utils/CustomerTypes';

interface PreferencesForm {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  reminders: {
    appointments: boolean;
    maintenance: boolean;
    payments: boolean;
  };
  privacy: {
    shareData: boolean;
    marketing: boolean;
  };
  preferredContactMethod: 'phone' | 'email' | 'sms';
  reminderPreferences: {
    appointmentReminders: boolean;
    serviceReminders: boolean;
    followUpReminders: boolean;
  };
}

export default function CustomerPreferences() {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PreferencesForm>({
    notifications: {
      email: true,
      sms: true,
      push: false,
    },
    reminders: {
      appointments: true,
      maintenance: true,
      payments: true,
    },
    privacy: {
      shareData: false,
      marketing: false,
    },
    preferredContactMethod: 'email',
    reminderPreferences: {
      appointmentReminders: true,
      serviceReminders: true,
      followUpReminders: true,
    },
  });

  useEffect(() => {
    if (user?.customerId) {
      fetchCustomerData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await customerService.getCustomer(user!.customerId!);
      if (response.success) {
        setCustomer(response.data);
        // Load existing preferences if available
        if (response.data.preferences) {
          setFormData({
            notifications: {
              email: response.data.preferences.notifications?.email ?? true,
              sms: response.data.preferences.notifications?.sms ?? true,
              push: response.data.preferences.notifications?.push ?? false,
            },
            reminders: {
              appointments: response.data.preferences.reminders?.appointments ?? true,
              maintenance: response.data.preferences.reminders?.maintenance ?? true,
              payments: response.data.preferences.reminders?.payments ?? true,
            },
            privacy: {
              shareData: response.data.preferences.privacy?.shareData ?? false,
              marketing: response.data.preferences.privacy?.marketing ?? false,
            },
            preferredContactMethod: response.data.preferences.preferredContactMethod ?? 'email',
            reminderPreferences: {
              appointmentReminders: response.data.preferences.reminderPreferences?.appointmentReminders ?? true,
              serviceReminders: response.data.preferences.reminderPreferences?.serviceReminders ?? true,
              followUpReminders: response.data.preferences.reminderPreferences?.followUpReminders ?? true,
            },
          });
        }
      } else {
        toast.error('Failed to load customer data');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: keyof PreferencesForm, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!user?.customerId) {
      toast.error('Customer ID not found');
      return;
    }

    try {
      setSaving(true);
      const response = await customerService.updateCustomer(user.customerId, {
        preferences: formData,
      });

      if (response.success) {
        toast.success('Preferences saved successfully!');
        setCustomer(response.data.customer);
      } else {
        toast.error(response.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (customer?.preferences) {
      setFormData({
        notifications: {
          email: customer.preferences.notifications?.email ?? true,
          sms: customer.preferences.notifications?.sms ?? true,
          push: customer.preferences.notifications?.push ?? false,
        },
        reminders: {
          appointments: customer.preferences.reminders?.appointments ?? true,
          maintenance: customer.preferences.reminders?.maintenance ?? true,
          payments: customer.preferences.reminders?.payments ?? true,
        },
        privacy: {
          shareData: customer.preferences.privacy?.shareData ?? false,
          marketing: customer.preferences.privacy?.marketing ?? false,
        },
        preferredContactMethod: customer.preferences.preferredContactMethod ?? 'email',
        reminderPreferences: {
          appointmentReminders: customer.preferences.reminderPreferences?.appointmentReminders ?? true,
          serviceReminders: customer.preferences.reminderPreferences?.serviceReminders ?? true,
          followUpReminders: customer.preferences.reminderPreferences?.followUpReminders ?? true,
        },
      });
      toast.success('Preferences reset to saved values');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 space-y-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
              <span className="ml-2 text-gray-600">Loading preferences...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.customerId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 space-y-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-500">You need to be logged in as a customer to access preferences.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Settings className="h-6 w-6 mr-3 text-blue-600" />
                Account Preferences
              </h1>
              <p className="text-gray-600 mt-1">Manage your notification settings, privacy preferences, and contact methods</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive updates and reminders via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications.email}
                    onChange={(e) => handleInputChange('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Receive updates and reminders via text message</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications.sms}
                    onChange={(e) => handleInputChange('notifications', 'sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                  <p className="text-sm text-gray-500">Receive real-time updates in your browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notifications.push}
                    onChange={(e) => handleInputChange('notifications', 'push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Reminder Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Reminder Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Appointment Reminders</label>
                  <p className="text-sm text-gray-500">Get reminded about upcoming appointments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminders.appointments}
                    onChange={(e) => handleInputChange('reminders', 'appointments', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Maintenance Reminders</label>
                  <p className="text-sm text-gray-500">Get notified about scheduled maintenance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminders.maintenance}
                    onChange={(e) => handleInputChange('reminders', 'maintenance', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Reminders</label>
                  <p className="text-sm text-gray-500">Get reminded about upcoming payments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminders.payments}
                    onChange={(e) => handleInputChange('reminders', 'payments', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Phone className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Contact Preferences</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Preferred Contact Method</label>
                <div className="space-y-2">
                  {[
                    { value: 'phone', label: 'Phone Call', icon: Phone },
                    { value: 'email', label: 'Email', icon: Mail },
                    { value: 'sms', label: 'Text Message', icon: MessageSquare },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContactMethod"
                        value={option.value}
                        checked={formData.preferredContactMethod === option.value}
                        onChange={(e) => handleInputChange('preferredContactMethod', '', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${
                        formData.preferredContactMethod === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {formData.preferredContactMethod === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <option.icon className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Share Data for Service Improvement</label>
                  <p className="text-sm text-gray-500">Allow us to use your data to improve our services (anonymized)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacy.shareData}
                    onChange={(e) => handleInputChange('privacy', 'shareData', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Marketing Communications</label>
                  <p className="text-sm text-gray-500">Receive promotional offers and newsletters</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacy.marketing}
                    onChange={(e) => handleInputChange('privacy', 'marketing', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Service Reminder Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Wrench className="h-5 w-5 text-orange-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Service Reminder Preferences</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Appointment Reminders</label>
                  <p className="text-sm text-gray-500">Get reminded about upcoming service appointments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminderPreferences.appointmentReminders}
                    onChange={(e) => handleInputChange('reminderPreferences', 'appointmentReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Service Reminders</label>
                  <p className="text-sm text-gray-500">Get notified about scheduled maintenance services</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminderPreferences.serviceReminders}
                    onChange={(e) => handleInputChange('reminderPreferences', 'serviceReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Follow-up Reminders</label>
                  <p className="text-sm text-gray-500">Get reminded about follow-up appointments and check-ins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminderPreferences.followUpReminders}
                    onChange={(e) => handleInputChange('reminderPreferences', 'followUpReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleReset}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Saved
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
