import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Gauge, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench,
  Calendar,
  DollarSign
} from '../../utils/icons';

interface VehicleHealth {
  id: string;
  vehicleName: string;
  overallHealth: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  mileage: number;
  alerts: Array<{
    id: string;
    type: 'warning' | 'critical' | 'info';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    estimatedCost: number;
    urgency: 'routine' | 'soon' | 'urgent';
  }>;
}

export default function CustomerVehicleHealth() {
  const [vehicles, setVehicles] = useState<VehicleHealth[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicleHealth();
  }, []);

  const loadVehicleHealth = async () => {
    try {
      setLoading(true);
      const mockVehicles: VehicleHealth[] = [
        {
          id: '1',
          vehicleName: '2020 Toyota Camry SE',
          overallHealth: 85,
          status: 'good',
          mileage: 45000,
          alerts: [
            {
              id: 'a1',
              type: 'warning',
              title: 'Brake Pads Wearing',
              description: 'Front brake pads at 30% remaining.',
              priority: 'medium'
            }
          ],
          recommendations: [
            {
              id: 'r1',
              title: 'Brake Pad Replacement',
              description: 'Replace front brake pads.',
              estimatedCost: 189.99,
              urgency: 'soon'
            }
          ]
        }
      ];

      setVehicles(mockVehicles);
      if (mockVehicles.length > 0) {
        setSelectedVehicle(mockVehicles[0]);
      }
    } catch (error) {
      console.error('Error loading vehicle health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600';
    if (health >= 75) return 'text-blue-600';
    if (health >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-lg font-semibold text-gray-900">Vehicle Health</h1>
          <p className="text-sm text-gray-600">Monitor your vehicle's health and get maintenance recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Vehicles</h2>
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedVehicle?.id === vehicle.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-gray-900">{vehicle.vehicleName}</h6>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className={`font-semibold ${getHealthColor(vehicle.overallHealth)}`}>
                        {vehicle.overallHealth}% Health
                      </span>
                      <span>{vehicle.mileage.toLocaleString()} miles</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          {selectedVehicle && (
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Health */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{selectedVehicle.vehicleName}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {selectedVehicle.overallHealth}%
                    </div>
                    <p className="text-sm text-gray-600">Overall Health</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedVehicle.mileage.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Current Mileage</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedVehicle.alerts.length}
                    </div>
                    <p className="text-sm text-gray-600">Active Alerts</p>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {selectedVehicle.alerts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
                  <div className="space-y-3">
                    {selectedVehicle.alerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <h6 className="font-medium text-gray-900">{alert.title}</h6>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selectedVehicle.recommendations.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Recommendations</h3>
                  <div className="space-y-4">
                    {selectedVehicle.recommendations.map((rec) => (
                      <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h6 className="font-medium text-gray-900">{rec.title}</h6>
                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ${rec.estimatedCost.toFixed(2)}
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {rec.urgency.charAt(0).toUpperCase() + rec.urgency.slice(1)}
                            </span>
                          </div>
                        </div>
                        <button className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <Wrench className="w-4 h-4 mr-2" />
                          Schedule Service
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
