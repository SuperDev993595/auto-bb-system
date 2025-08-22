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
    <div className="page-container">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <PageTitle title="YellowPages Integration" icon={HiSearch} />
          <div className="flex items-center space-x-4">
            <div className="text-sm text-secondary-600">
              Welcome, <span className="font-medium text-secondary-900">{currentUser.name}</span>
              <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                {currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <button
              onClick={() => authService.logout()}
              className="px-3 py-1 text-sm text-error-600 hover:text-error-800 hover:bg-error-50 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Search Section */}
      <div className="card">
        <h3 className="page-subtitle mb-4">Search YellowPages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Keywords</label>
            <input
              type="text"
              value={searchParams.keywords}
              onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
              placeholder="e.g., auto repair, mechanic"
              className="input-field"
            />
          </div>
          <div>
            <label className="form-label">Location</label>
            <input
              type="text"
              value={searchParams.location}
              onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              placeholder="e.g., New York, NY"
              className="input-field"
            />
          </div>
          <div>
            <label className="form-label">Radius (miles)</label>
            <select
              value={searchParams.radius}
              onChange={(e) => setSearchParams({ ...searchParams, radius: parseInt(e.target.value) })}
              className="select-field"
            >
              <option value={5}>5 miles</option>
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
              <option value={100}>100 miles</option>
            </select>
          </div>
          <div>
            <label className="form-label">Category</label>
            <input
              type="text"
              value={searchParams.category}
              onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
              placeholder="e.g., Automotive"
              className="input-field"
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary"
          >
            <HiSearch className="h-5 w-5 mr-2" />
            Search YellowPages
          </button>
          <button
            onClick={() => {
              setSearchParams({ keywords: '', location: '', radius: 25, category: '' });
              setFilters({ status: '', priority: '', assignedTo: '', search: '' });
              setPagination({ ...pagination, currentPage: 1 });
            }}
            className="btn-secondary"
          >
            <HiRefresh className="h-5 w-5 mr-2" />
            Clear All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="page-subtitle mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="select-field"
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
            className="select-field"
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
            className="input-field"
          />

          <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-600">
              Total: {pagination.totalRecords}
            </span>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Business</th>
                <th className="table-header-cell">Contact</th>
                <th className="table-header-cell">Location</th>
                <th className="table-header-cell">Lead Status</th>
                <th className="table-header-cell">Quality Score</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-secondary-500">
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner"></div>
                      <span className="ml-2">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-secondary-500">No records found</td>
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
                        <button 
                          onClick={() => handleViewRecord(record)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <HiEye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleEditRecord(record)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                          title="Edit Lead"
                        >
                          <HiPencil className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleAddContact(record)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Add Contact Attempt"
                        >
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
