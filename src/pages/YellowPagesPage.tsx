import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiSearch, HiPhone, HiMail, HiGlobe, HiLocationMarker, HiStar, HiUserAdd, HiEye, HiPencil, HiX, HiPlus, HiRefresh } from 'react-icons/hi';
import PageTitle from '../components/Shared/PageTitle';
import api from '../services/api';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';

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
      _id: string;
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

interface ContactAttempt {
  method: 'phone' | 'email' | 'in_person' | 'social_media' | 'other';
  outcome: 'no_answer' | 'left_message' | 'spoke_to_decision_maker' | 'not_interested' | 'interested' | 'follow_up_needed' | 'converted';
  notes?: string;
  nextFollowUp?: string;
}

interface LeadUpdate {
  status?: 'new' | 'contacted' | 'interested' | 'not_interested' | 'converted' | 'lost';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

export default function YellowPagesPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<YellowPagesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<YellowPagesRecord | null>(null);
  const [contactAttempt, setContactAttempt] = useState<ContactAttempt>({
    method: 'phone',
    outcome: 'no_answer',
    notes: ''
  });
  const [leadUpdate, setLeadUpdate] = useState<LeadUpdate>({
    status: 'new',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchRecords();
    }
  }, [filters, pagination.currentPage, currentUser]);

  const checkAuthentication = () => {
    if (!authService.isAuthenticated()) {
      toast.error('Please login to access YellowPages management');
      navigate('/auth/login');
      return;
    }

    const user = authService.getCurrentUserFromStorage();
    if (!user) {
      toast.error('User information not found');
      navigate('/auth/login');
      return;
    }

    // Check if user has admin role
    if (user.role !== 'super_admin' && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/auth/login');
      return;
    }

    setCurrentUser(user);
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: pagination.currentPage.toString(),
        limit: '10'
      });

      const response = await api.get(`/yellowpages?${params}`);
      if (response.data.success) {
        setRecords(response.data.data.yellowPagesData);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      console.error('Error fetching YellowPages records:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/auth/login');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. You don\'t have permission to view YellowPages data.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch records');
      }
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
    } catch (error: any) {
      console.error('Error searching YellowPages:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/auth/login');
      } else {
        toast.error('Failed to search YellowPages');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!selectedRecord) return;

    try {
      const response = await api.put(`/yellowpages/${selectedRecord._id}/lead`, leadUpdate);
      if (response.data.success) {
        toast.success('Lead information updated successfully');
        setShowEditModal(false);
        fetchRecords();
      }
    } catch (error: any) {
      console.error('Error updating lead:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/auth/login');
      } else {
        toast.error('Failed to update lead information');
      }
    }
  };

  const handleAddContactAttempt = async () => {
    if (!selectedRecord) return;

    try {
      const response = await api.post(`/yellowpages/${selectedRecord._id}/contact-attempt`, contactAttempt);
      if (response.data.success) {
        toast.success('Contact attempt added successfully');
        setShowContactModal(false);
        setContactAttempt({ method: 'phone', outcome: 'no_answer', notes: '' });
        fetchRecords();
      }
    } catch (error: any) {
      console.error('Error adding contact attempt:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/auth/login');
      } else {
        toast.error('Failed to add contact attempt');
      }
    }
  };

  const handleViewRecord = (record: YellowPagesRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEditRecord = (record: YellowPagesRecord) => {
    setSelectedRecord(record);
    setLeadUpdate({
      status: record.leadInfo.status,
      priority: record.leadInfo.priority,
      notes: record.leadInfo.notes || ''
    });
    setShowEditModal(true);
  };

  const handleAddContact = (record: YellowPagesRecord) => {
    setSelectedRecord(record);
    setShowContactModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'status-info';
      case 'contacted': return 'status-warning';
      case 'interested': return 'status-success';
      case 'not_interested': return 'status-error';
      case 'converted': return 'status-primary';
      case 'lost': return 'status-secondary';
      default: return 'status-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-error-100 text-error-800';
      case 'high': return 'bg-warning-100 text-warning-800';
      case 'medium': return 'bg-primary-100 text-primary-800';
      case 'low': return 'bg-success-100 text-success-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'phone': return 'bg-info-100 text-info-800';
      case 'email': return 'bg-success-100 text-success-800';
      case 'in_person': return 'bg-primary-100 text-primary-800';
      case 'social_media': return 'bg-warning-100 text-warning-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'converted': return 'bg-success-100 text-success-800';
      case 'interested': return 'bg-info-100 text-info-800';
      case 'follow_up_needed': return 'bg-warning-100 text-warning-800';
      case 'not_interested': return 'bg-error-100 text-error-800';
      case 'spoke_to_decision_maker': return 'bg-primary-100 text-primary-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!currentUser) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yellow Pages Management</h1>
            <p className="text-gray-600">Manage business leads and contact information</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {/* Add new listing functionality */}}
              className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors"
              title="Add Listing"
            >
              <HiPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Total Records: {pagination.totalRecords}
            </span>
            <span className="text-sm text-gray-500">
              New Leads: {records.filter(record => record.leadInfo.status === 'new').length}
            </span>
            <span className="text-sm text-gray-500">
              Converted: {records.filter(record => record.leadInfo.status === 'converted').length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="not_interested">Not Interested</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Keywords</label>
            <input
              type="text"
              value={searchParams.keywords}
              onChange={(e) => setSearchParams(prev => ({ ...prev, keywords: e.target.value }))}
              placeholder="Business name, services..."
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Location</label>
            <input
              type="text"
              value={searchParams.location}
              onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, state, or zip"
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Category</label>
            <select
              value={searchParams.category}
              onChange={(e) => setSearchParams(prev => ({ ...prev, category: e.target.value }))}
              className="form-input"
            >
              <option value="">All Categories</option>
              <option value="automotive">Automotive</option>
              <option value="restaurant">Restaurant</option>
              <option value="retail">Retail</option>
              <option value="healthcare">Healthcare</option>
              <option value="professional">Professional Services</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="btn-primary w-full"
            >
              <HiSearch className="w-4 h-4 mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="not_interested">Not Interested</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value, page: 1 }))}
              className="form-input"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Assigned To</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value, page: 1 }))}
              className="form-input"
            >
              <option value="">All Users</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              placeholder="Search records..."
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-secondary-900">Business Records</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchParams({ keywords: '', location: '', radius: 25, category: '' });
                  setFilters({ status: '', priority: '', assignedTo: '', search: '' });
                  setPagination({ ...pagination, currentPage: 1 });
                }}
                className="btn-secondary"
              >
                <HiRefresh className="w-4 h-4 mr-2" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header-cell">Business</th>
                <th className="table-header-cell">Contact</th>
                <th className="table-header-cell">Location</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Priority</th>
                <th className="table-header-cell">Lead Score</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-secondary-500">Loading records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-secondary-500">No records found</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="hover:bg-secondary-50">
                    <td className="table-cell">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">{record.businessName}</div>
                        <div className="text-sm text-secondary-500">{record.category}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {record.contact.phone && <div>{record.contact.phone}</div>}
                        {record.contact.email && <div>{record.contact.email}</div>}
                        {record.contact.website && <div>{record.contact.website}</div>}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {record.address.city && record.address.state && (
                          <div>{record.address.city}, {record.address.state}</div>
                        )}
                        {record.address.zipCode && <div>{record.address.zipCode}</div>}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusColor(record.leadInfo.status)}`}>
                        {record.leadInfo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getPriorityColor(record.leadInfo.priority)}`}>
                        {record.leadInfo.priority}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <HiStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(record.leadQualityScore / 2)
                                  ? 'text-warning-500'
                                  : 'text-secondary-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-secondary-600">
                          {record.leadQualityScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleViewRecord(record)}
                          className="text-secondary-600 hover:text-secondary-900 transition-colors"
                          title="View Details"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditRecord(record)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="Edit Record"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddContact(record)}
                          className="text-success-600 hover:text-success-900 transition-colors"
                          title="Contact Business"
                        >
                          <HiPhone className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalRecords)} of {pagination.totalRecords} records
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Business Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedRecord.businessName}</h4>
                <p className="text-sm text-gray-600">{selectedRecord.category}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Contact Information</h5>
                  <div className="space-y-1 text-sm">
                    {selectedRecord.contact.phone && (
                      <div className="flex items-center">
                        <HiPhone className="h-4 w-4 mr-2" />
                        {selectedRecord.contact.phone}
                      </div>
                    )}
                    {selectedRecord.contact.email && (
                      <div className="flex items-center">
                        <HiMail className="h-4 w-4 mr-2" />
                        {selectedRecord.contact.email}
                      </div>
                    )}
                    {selectedRecord.contact.website && (
                      <div className="flex items-center">
                        <HiGlobe className="h-4 w-4 mr-2" />
                        <a href={selectedRecord.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedRecord.contact.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Address</h5>
                  <div className="text-sm text-gray-600">
                    {selectedRecord.address.street && <div>{selectedRecord.address.street}</div>}
                    <div>{selectedRecord.address.city}, {selectedRecord.address.state} {selectedRecord.address.zipCode}</div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Lead Information</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRecord.leadInfo.status)}`}>
                      {selectedRecord.leadInfo.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRecord.leadInfo.priority)}`}>
                      {selectedRecord.leadInfo.priority}
                    </span>
                  </div>
                  {selectedRecord.leadInfo.assignedTo && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Assigned to:</span>
                      <span className="ml-2">{selectedRecord.leadInfo.assignedTo.name}</span>
                    </div>
                  )}
                  {selectedRecord.leadInfo.notes && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Notes:</span>
                      <p className="mt-1 text-sm">{selectedRecord.leadInfo.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRecord.leadInfo.contactAttempts.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Contact Attempts</h5>
                  <div className="space-y-2">
                    {selectedRecord.leadInfo.contactAttempts.map((attempt, index) => (
                      <div key={index} className="border rounded p-3 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(attempt.method)}`}>
                              {attempt.method}
                            </span>
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(attempt.outcome)}`}>
                              {attempt.outcome}
                            </span>
                          </div>
                          <span className="text-gray-500">{formatDate(attempt.date)}</span>
                        </div>
                        {attempt.notes && (
                          <p className="mt-2 text-gray-600">{attempt.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Lead Information</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={leadUpdate.status}
                  onChange={(e) => setLeadUpdate({ ...leadUpdate, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={leadUpdate.priority}
                  onChange={(e) => setLeadUpdate({ ...leadUpdate, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={leadUpdate.notes}
                  onChange={(e) => setLeadUpdate({ ...leadUpdate, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about this lead..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLead}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Attempt Modal */}
      {showContactModal && selectedRecord && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Contact Attempt</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select
                  value={contactAttempt.method}
                  onChange={(e) => setContactAttempt({ ...contactAttempt, method: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="in_person">In Person</option>
                  <option value="social_media">Social Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                <select
                  value={contactAttempt.outcome}
                  onChange={(e) => setContactAttempt({ ...contactAttempt, outcome: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="no_answer">No Answer</option>
                  <option value="left_message">Left Message</option>
                  <option value="spoke_to_decision_maker">Spoke to Decision Maker</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="interested">Interested</option>
                  <option value="follow_up_needed">Follow Up Needed</option>
                  <option value="converted">Converted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={contactAttempt.notes}
                  onChange={(e) => setContactAttempt({ ...contactAttempt, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about this contact attempt..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow Up (Optional)</label>
                <input
                  type="date"
                  value={contactAttempt.nextFollowUp}
                  onChange={(e) => setContactAttempt({ ...contactAttempt, nextFollowUp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContactAttempt}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Contact Attempt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
