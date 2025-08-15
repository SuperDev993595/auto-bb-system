import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiSearch, HiPhone, HiMail, HiGlobe, HiLocationMarker, HiStar, HiUserAdd, HiEye, HiPencil } from 'react-icons/hi';
import PageTitle from '../components/Shared/PageTitle';
import api from '../services/api';

interface YellowPagesRecord {
  _id: string;
  businessName: string;
  category: string;
  subcategory?: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    fullAddress?: string;
  };
  businessInfo: {
    yearsInBusiness?: number;
    employeeCount?: string;
    services?: string[];
    specialties?: string[];
  };
  reviews: {
    averageRating?: number;
    totalReviews?: number;
  };
  leadInfo: {
    status: 'new' | 'contacted' | 'interested' | 'not_interested' | 'converted' | 'lost';
    assignedTo?: {
      name: string;
      email: string;
    };
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
    contactAttempts: Array<{
      date: string;
      method: string;
      outcome: string;
      notes?: string;
    }>;
  };
  createdAt: string;
  leadQualityScore: number;
}

export default function YellowPagesPage() {
  const [records, setRecords] = useState<YellowPagesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    location: '',
    radius: 25,
    category: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    search: ''
  });

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters
      });

      const response = await api.get(`/yellowpages?${params}`);
      if (response.data.success) {
        setRecords(response.data.data.yellowPagesData);
      }
    } catch (error) {
      console.error('Error fetching YellowPages records:', error);
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await api.post('/yellowpages/search', searchParams);
      if (response.data.success) {
        setRecords(response.data.data.results);
        toast.success(`Found ${response.data.data.results.length} businesses`);
      }
    } catch (error) {
      console.error('Error searching YellowPages:', error);
      toast.error('Failed to search YellowPages');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async (recordId: string, updates: any) => {
    try {
      const response = await api.put(`/yellowpages/${recordId}/lead`, updates);
      if (response.data.success) {
        toast.success('Lead information updated successfully');
        fetchRecords();
      }
    } catch (error) {
      toast.error('Failed to update lead information');
    }
  };

  const handleAddContactAttempt = async (recordId: string, attempt: any) => {
    try {
      const response = await api.post(`/yellowpages/${recordId}/contact-attempt`, attempt);
      if (response.data.success) {
        toast.success('Contact attempt added successfully');
        fetchRecords();
      }
    } catch (error) {
      toast.error('Failed to add contact attempt');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-green-100 text-green-800';
      case 'not_interested': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="YellowPages Integration" icon={HiSearch} />
      
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Search YellowPages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <input
              type="text"
              value={searchParams.keywords}
              onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
              placeholder="e.g., auto repair, mechanic"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={searchParams.location}
              onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              placeholder="e.g., New York, NY"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Radius (miles)</label>
            <select
              value={searchParams.radius}
              onChange={(e) => setSearchParams({ ...searchParams, radius: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 miles</option>
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
              <option value={100}>100 miles</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={searchParams.category}
              onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
              placeholder="e.g., Automotive"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSearch}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <HiSearch className="h-5 w-5 mr-2" />
            Search YellowPages
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="not_interested">Not Interested</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <input
            type="text"
            placeholder="Search businesses..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality Score</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No records found</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.businessName}</div>
                        <div className="text-sm text-gray-500">{record.category}</div>
                        {record.businessInfo.yearsInBusiness && (
                          <div className="text-xs text-gray-400">
                            {record.businessInfo.yearsInBusiness} years in business
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {record.contact.phone && (
                          <div className="flex items-center text-sm text-gray-900">
                            <HiPhone className="h-4 w-4 mr-1" />
                            {record.contact.phone}
                          </div>
                        )}
                        {record.contact.email && (
                          <div className="flex items-center text-sm text-gray-900">
                            <HiMail className="h-4 w-4 mr-1" />
                            {record.contact.email}
                          </div>
                        )}
                        {record.contact.website && (
                          <div className="flex items-center text-sm text-gray-900">
                            <HiGlobe className="h-4 w-4 mr-1" />
                            {record.contact.website}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                                                        <HiLocationMarker className="h-4 w-4 mr-1" />
                        {record.address.city}, {record.address.state}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.leadInfo.status)}`}>
                          {record.leadInfo.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(record.leadInfo.priority)}`}>
                          {record.leadInfo.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <HiStar className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{record.leadQualityScore}/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <HiEye className="h-5 w-5" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <HiPencil className="h-5 w-5" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <HiUserAdd className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
