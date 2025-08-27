import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../redux'
import { createCustomer } from '../../redux/actions/customers'
import { toast } from 'react-hot-toast'
import PageTitle from '../../components/Shared/PageTitle'
import { User, Building2, Phone, Mail, MapPin, Save, ArrowLeft } from '../../utils/icons'

interface CustomerFormData {
  name: string
  email: string
  phone: string
  businessName: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  status: 'active' | 'inactive' | 'prospect'
  notes: string
}

export default function CustomerNew() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    status: 'active',
    notes: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Phone validation (basic)
    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }

    setIsLoading(true)

    try {
      await dispatch(createCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        businessName: formData.businessName,
        address: formData.address,
        status: formData.status,
        notes: formData.notes
      })).unwrap()

      toast.success('Customer created successfully!')
      navigate('/admin/dashboard/customers')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create customer')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="space-y-4">
          {/* Back Navigation */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/dashboard/customers')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Customers
            </button>
          </div>
          
          {/* Page Title */}
          <div className="border-b border-secondary-200 pb-4">
            <PageTitle title="Add New Customer" />
          </div>
        </div>

        {/* Form Container */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-3 border-b border-secondary-200 pb-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter customer's full name"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter business name (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-3 border-b border-secondary-200 pb-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-3 border-b border-secondary-200 pb-2">
                <div className="p-1.5 bg-red-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-600" />
                </div>
                Address Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="form-label">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter street address"
                  />
                </div>

                <div>
                  <label className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="form-label">
                    State
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="form-label">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-3 border-b border-secondary-200 pb-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                Additional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="prospect">Prospect</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="form-textarea"
                    placeholder="Enter any additional notes about this customer"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-8 border-t border-secondary-200">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard/customers')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Customer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
