import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Car, 
  DollarSign, 
  FileText, 
  Download, 
  Eye, 
  Plus,
  Filter,
  Search,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Wrench,
  Zap,
  Settings
} from '../../utils/icons';

interface Warranty {
  id: string;
  name: string;
  type: 'manufacturer' | 'extended' | 'powertrain' | 'bumper_to_bumper' | 'custom';
  vehicle: {
    make: string;
    model: string;
    year: number;
    vin: string;
  };
  startDate: string;
  endDate: string;
  mileageLimit?: number;
  currentMileage: number;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  coverage: {
    engine: boolean;
    transmission: boolean;
    electrical: boolean;
    suspension: boolean;
    brakes: boolean;
    cooling: boolean;
    fuel: boolean;
    exhaust: boolean;
    interior: boolean;
    exterior: boolean;
  };
  deductible: number;
  maxClaimAmount?: number;
  totalClaims: number;
  totalClaimAmount: number;
  provider: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  daysUntilExpiration: number;
  mileageRemaining?: number;
}

interface WarrantyClaim {
  id: string;
  warrantyId: string;
  date: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  serviceProvider: string;
  notes?: string;
}

export default function CustomerWarranties() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadWarranties();
  }, []);

  const loadWarranties = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockWarranties: Warranty[] = [
        {
          id: '1',
          name: 'Premium Extended Warranty',
          type: 'extended',
          vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            vin: '1HGBH41JXMN109186'
          },
          startDate: '2020-03-15',
          endDate: '2025-03-15',
          mileageLimit: 100000,
          currentMileage: 45000,
          status: 'active',
          coverage: {
            engine: true,
            transmission: true,
            electrical: true,
            suspension: true,
            brakes: true,
            cooling: true,
            fuel: true,
            exhaust: true,
            interior: false,
            exterior: false
          },
          deductible: 100,
          maxClaimAmount: 5000,
          totalClaims: 2,
          totalClaimAmount: 1200,
          provider: {
            name: 'AutoShield Warranty Co.',
            phone: '1-800-WARRANTY',
            email: 'claims@autoshield.com',
            address: '123 Warranty St, Coverage City, CA 90210'
          },
          daysUntilExpiration: 365,
          mileageRemaining: 55000
        },
        {
          id: '2',
          name: 'Manufacturer Warranty',
          type: 'manufacturer',
          vehicle: {
            make: 'Honda',
            model: 'Civic',
            year: 2022,
            vin: '2T1BURHE0JC123456'
          },
          startDate: '2022-01-10',
          endDate: '2027-01-10',
          mileageLimit: 60000,
          currentMileage: 18000,
          status: 'active',
          coverage: {
            engine: true,
            transmission: true,
            electrical: true,
            suspension: true,
            brakes: true,
            cooling: true,
            fuel: true,
            exhaust: true,
            interior: true,
            exterior: true
          },
          deductible: 0,
          maxClaimAmount: 10000,
          totalClaims: 0,
          totalClaimAmount: 0,
          provider: {
            name: 'Honda Motor Co.',
            phone: '1-800-HONDA',
            email: 'warranty@honda.com',
            address: '1919 Torrance Blvd, Torrance, CA 90501'
          },
          daysUntilExpiration: 1095,
          mileageRemaining: 42000
        }
      ];

      const mockClaims: WarrantyClaim[] = [
        {
          id: '1',
          warrantyId: '1',
          date: '2024-01-15',
          description: 'Engine oil leak repair',
          amount: 800,
          status: 'completed',
          serviceProvider: 'ABC Auto Repair',
          notes: 'Replaced valve cover gasket and oil pan gasket'
        },
        {
          id: '2',
          warrantyId: '1',
          date: '2024-02-01',
          description: 'Transmission fluid leak',
          amount: 400,
          status: 'approved',
          serviceProvider: 'ABC Auto Repair',
          notes: 'Replaced transmission pan gasket'
        }
      ];

      setWarranties(mockWarranties);
      setClaims(mockClaims);
    } catch (error) {
      console.error('Error loading warranties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClaimStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCoverageIcon = (coverageType: string) => {
    switch (coverageType) {
      case 'engine':
        return <Settings className="w-4 h-4" />;
      case 'transmission':
        return <Wrench className="w-4 h-4" />;
      case 'electrical':
        return <Zap className="w-4 h-4" />;
      case 'brakes':
        return <Wrench className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredWarranties = warranties.filter(warranty => {
    const matchesSearch = warranty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || warranty.status === filterStatus;
    const matchesType = filterType === 'all' || warranty.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
      return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
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
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Warranties</h1>
              <p className="text-gray-600">Manage and track your vehicle warranties and claims</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-gray-500">
                <Shield className="w-4 h-4 mr-1" />
                {warranties.filter(w => w.status === 'active').length} Active Warranties
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search warranties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="extended">Extended</option>
              <option value="powertrain">Powertrain</option>
              <option value="bumper_to_bumper">Bumper to Bumper</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Warranties Grid */}
        <div className="grid gap-6 mb-8">
          {filteredWarranties.map((warranty) => (
            <div
              key={warranty.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{warranty.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(warranty.status)}`}>
                      {warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Car className="w-4 h-4 mr-1" />
                      {warranty.vehicle.year} {warranty.vehicle.make} {warranty.vehicle.model}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Expires {formatDate(warranty.endDate)}
                    </div>
                    {warranty.mileageLimit && (
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {warranty.currentMileage.toLocaleString()}/{warranty.mileageLimit.toLocaleString()} miles
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedWarranty(warranty)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Coverage Summary */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Coverage Includes:</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(warranty.coverage).map(([key, covered]) => (
                    <div key={key} className="flex items-center space-x-1">
                      {covered ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-600 capitalize">{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{warranty.provider.name}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {warranty.provider.phone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {warranty.provider.phone}
                          </div>
                        )}
                        {warranty.provider.email && (
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {warranty.provider.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Deductible</p>
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(warranty.deductible)}</p>
                  </div>
                </div>
              </div>

              {/* Claims Summary */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Claims History</p>
                    <p className="text-sm text-gray-500">{warranty.totalClaims} claims • {formatCurrency(warranty.totalClaimAmount)} total</p>
                  </div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Plus className="w-4 h-4 mr-2" />
                    File Claim
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Claims History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Claims History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(claim.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{claim.description}</div>
                        {claim.notes && (
                          <div className="text-sm text-gray-500">{claim.notes}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(claim.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClaimStatusColor(claim.status)}`}>
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {claim.serviceProvider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
