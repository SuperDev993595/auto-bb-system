import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Building2, Car, AlertCircle, CheckCircle, Eye, EyeOff } from '../../utils/icons'

interface CustomerFormData {
  // Basic Information
  name: string
  email: string
  phone: string
  businessName: string
  status: 'active' | 'inactive' | 'prospect'
  
  // Address Information
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  
  // Additional Information
  dateOfBirth: string
  preferredContact: 'phone' | 'email' | 'sms'
  notes: string
  tags: string[]
  
  // Business Information
  businessType: 'individual' | 'business' | 'fleet' | 'dealer'
  industry: string
  website: string
  
  // Preferences
  marketingOptIn: boolean
  smsOptIn: boolean
  emailOptIn: boolean
}

interface ValidationErrors {
  [key: string]: string
}

interface Props {
  initialData?: Partial<CustomerFormData>
  onSubmit: (data: CustomerFormData) => void
  onCancel: () => void
  loading?: boolean
  mode: 'create' | 'edit'
}

export default function EnhancedCustomerForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false,
  mode 
}: Props) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    status: 'active',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    dateOfBirth: '',
    preferredContact: 'phone',
    notes: '',
    tags: [],
    businessType: 'individual',
    industry: '',
    website: '',
    marketingOptIn: false,
    smsOptIn: false,
    emailOptIn: false,
    ...initialData
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [showPassword, setShowPassword] = useState(false)

  // Validation rules
  const validationRules = {
    name: (value: string) => {
      if (!value.trim()) return 'Name is required'
      if (value.length < 2) return 'Name must be at least 2 characters'
      if (value.length > 50) return 'Name must be less than 50 characters'
      return null
    },
    email: (value: string) => {
      if (!value.trim()) return 'Email is required'
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) return 'Please enter a valid email address'
      return null
    },
    phone: (value: string) => {
      if (!value.trim()) return 'Phone number is required'
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '')
      if (!phoneRegex.test(cleanPhone)) return 'Please enter a valid phone number'
      return null
    },
    'address.street': (value: string) => {
      if (!value.trim()) return 'Street address is required'
      return null
    },
    'address.city': (value: string) => {
      if (!value.trim()) return 'City is required'
      return null
    },
    'address.state': (value: string) => {
      if (!value.trim()) return 'State is required'
      return null
    },
    'address.zipCode': (value: string) => {
      if (!value.trim()) return 'ZIP code is required'
      const zipRegex = /^\d{5}(-\d{4})?$/
      if (!zipRegex.test(value)) return 'Please enter a valid ZIP code'
      return null
    }
  }

  // Validate a single field
  const validateField = (field: string, value: any): string | null => {
    const rule = validationRules[field as keyof typeof validationRules]
    if (rule) {
      return rule(value)
    }
    
    // Handle nested address fields
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      const addressRule = validationRules[`address.${addressField}` as keyof typeof validationRules]
      if (addressRule) {
        return addressRule(value)
      }
    }
    
    return null
  }

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    Object.keys(validationRules).forEach(field => {
      const value = field.startsWith('address.') 
        ? formData.address[field.split('.')[1] as keyof typeof formData.address]
        : formData[field as keyof CustomerFormData]
      
      const error = validateField(field, value)
      if (error) {
        newErrors[field] = error
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      if (field.startsWith('address.')) {
        const addressField = field.split('.')[1]
        return {
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value
          }
        }
      }
      return {
        ...prev,
        [field]: value
      }
    })

    // Mark field as touched
    setTouched(prev => new Set(prev).add(field))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  // Handle field blur (validate on blur)
  const handleFieldBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field))
    
    const value = field.startsWith('address.') 
      ? formData.address[field.split('.')[1] as keyof typeof formData.address]
      : formData[field as keyof CustomerFormData]
    
    const error = validateField(field, value)
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Check if field has error
  const hasError = (field: string): boolean => {
    return touched.has(field) && !!errors[field]
  }

  // Get field error message
  const getFieldError = (field: string): string => {
    return touched.has(field) ? errors[field] || '' : ''
  }

  // Get field status (error, success, or neutral)
  const getFieldStatus = (field: string) => {
    if (hasError(field)) return 'error'
    if (touched.has(field) && !errors[field]) return 'success'
    return 'neutral'
  }

  // Render input field with validation
  const renderField = (
    field: string,
    label: string,
    type: string = 'text',
    placeholder?: string,
    options?: { value: string; label: string }[]
  ) => {
    const value = field.startsWith('address.') 
      ? formData.address[field.split('.')[1] as keyof typeof formData.address]
      : formData[field as keyof CustomerFormData]
    
    const status = getFieldStatus(field)
    const errorMessage = getFieldError(field)
    
    const baseClasses = "w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2"
    const statusClasses = {
      error: "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50",
      success: "border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50",
      neutral: "border-gray-200 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white"
    }
    
    const inputClasses = `${baseClasses} ${statusClasses[status]}`
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {validationRules[field as keyof typeof validationRules] && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        
        {type === 'select' ? (
          <select
            value={value as string}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            className={inputClasses}
          >
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={value as string}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            rows={4}
            placeholder={placeholder}
            className={inputClasses}
          />
        ) : type === 'checkbox' ? (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={field}
              checked={value as boolean}
              onChange={(e) => handleFieldChange(field, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={field} className="text-sm text-gray-700">
              {label}
            </label>
          </div>
        ) : (
          <input
            type={type}
            value={value as string}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            placeholder={placeholder}
            className={inputClasses}
          />
        )}
        
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            Looks good!
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('name', 'Full Name', 'text', 'Enter customer full name')}
          {renderField('email', 'Email Address', 'email', 'Enter email address')}
          {renderField('phone', 'Phone Number', 'tel', 'Enter phone number')}
          {renderField('businessName', 'Business Name', 'text', 'Enter business name (optional)')}
          {renderField('status', 'Status', 'select', undefined, [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'prospect', label: 'Prospect' }
          ])}
          {renderField('dateOfBirth', 'Date of Birth', 'date')}
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Address Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            {renderField('address.street', 'Street Address', 'text', 'Enter street address')}
          </div>
          {renderField('address.city', 'City', 'text', 'Enter city')}
          {renderField('address.state', 'State', 'text', 'Enter state')}
          {renderField('address.zipCode', 'ZIP Code', 'text', 'Enter ZIP code')}
          {renderField('address.country', 'Country', 'text', 'Enter country')}
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600" />
          Business Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('businessType', 'Business Type', 'select', undefined, [
            { value: 'individual', label: 'Individual' },
            { value: 'business', label: 'Business' },
            { value: 'fleet', label: 'Fleet' },
            { value: 'dealer', label: 'Dealer' }
          ])}
          {renderField('industry', 'Industry', 'text', 'Enter industry')}
          {renderField('website', 'Website', 'url', 'Enter website URL')}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Car className="w-5 h-5 text-orange-600" />
          Preferences & Communication
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('preferredContact', 'Preferred Contact Method', 'select', undefined, [
            { value: 'phone', label: 'Phone' },
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' }
          ])}
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Communication Preferences</label>
            {renderField('emailOptIn', 'Receive email communications', 'checkbox')}
            {renderField('smsOptIn', 'Receive SMS notifications', 'checkbox')}
            {renderField('marketingOptIn', 'Receive marketing communications', 'checkbox')}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h3>
        
        <div className="space-y-6">
          {renderField('notes', 'Notes', 'textarea', 'Enter any additional notes about the customer...')}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              placeholder="Enter tags separated by commas"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const value = (e.target as HTMLInputElement).value.trim()
                  if (value) {
                    setFormData(prev => ({
                      ...prev,
                      tags: [...prev.tags, value]
                    }))
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }
              }}
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.filter((_, i) => i !== index)
                      }))}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || Object.keys(errors).length > 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Customer' : 'Update Customer'}
        </button>
      </div>
    </form>
  )
}
