import { useState, useEffect } from 'react'
import { useAppDispatch } from '../../../redux'
import { updateCustomer } from '../../../redux/actions/customers'
import { Customer, UpdateCustomerData } from '../../../services/customers'
import { toast } from 'react-hot-toast'
import { User, Mail, Phone, Building2, MapPin } from '../../../utils/icons'
import ModalWrapper from '../../../utils/ModalWrapper'

interface EditCustomerModalProps {
  customer: Customer
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function EditCustomerModal({ customer, isOpen, onClose, onSuccess }: EditCustomerModalProps) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateCustomerData>({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    businessName: customer.businessName || '',
    address: {
      street: customer.address?.street || '',
      city: customer.address?.city || '',
      state: customer.address?.state || '',
      zipCode: customer.address?.zipCode || ''
    },
    status: customer.status || 'active'
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        businessName: customer.businessName || '',
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          zipCode: customer.address?.zipCode || ''
        },
        status: customer.status || 'active'
      })
    }
  }, [customer])

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      if (parent === 'address') {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value
          }
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleInputChange('phone', formatted);
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Clean phone number before sending to backend (remove formatting)
      const cleanedFormData = {
        ...formData,
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : ''
      }

      const customerId = customer._id || customer.id
      if (!customerId) {
        toast.error('Customer ID is required')
        return
      }
      await dispatch(updateCustomer({ id: customerId, customerData: cleanedFormData })).unwrap()
      toast.success('Customer updated successfully!')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Update customer error:', error)
      toast.error(error.message || 'Failed to update customer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Customer"
      submitText="Update Customer"
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
    >
      <div className="p-8 space-y-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="form-label">
                Contact Name *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="form-input pl-10"
                  placeholder="Enter contact name"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="form-label">
                Business Name *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="form-input pl-10"
                  placeholder="Enter business name"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="form-label">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="form-input pl-10"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="form-label">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="form-input pl-10"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Address Information
          </h3>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="form-label">
                Street Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  className="form-input pl-10"
                  placeholder="Enter street address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="form-label">
                  City
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className="form-input"
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-3">
                <label className="form-label">
                  State
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  className="form-input"
                  placeholder="Enter state"
                />
              </div>

              <div className="space-y-3">
                <label className="form-label">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  className="form-input"
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <label className="form-label">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="form-select"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
    </ModalWrapper>
  )
}
