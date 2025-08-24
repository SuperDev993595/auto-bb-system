import { useState } from 'react'
import { useAppDispatch } from '../../redux'
import { createTechnician } from '../../redux/actions/services'
import { CreateTechnicianData } from '../../services/services'
import {
  X,
  User,
  Mail,
  Phone,
  DollarSign,
  Star,
  Check,
  Plus,
  Trash2
} from '../../utils/icons'

interface AddTechnicianModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddTechnicianModal({ onClose, onSuccess }: AddTechnicianModalProps) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<CreateTechnicianData>({
    name: '',
    email: '',
    phone: '',
    hourlyRate: 0,
    specializations: [],
    certifications: [],
    isActive: true
  })

  const [newSpecialization, setNewSpecialization] = useState('')
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: ''
  })

  const handleInputChange = (field: keyof CreateTechnicianData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }))
      setNewSpecialization('')
    }
  }

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }))
  }

  const addCertification = () => {
    if (newCertification.name.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, {
          name: newCertification.name.trim(),
          issuingAuthority: newCertification.issuingAuthority.trim(),
          issueDate: newCertification.issueDate || undefined,
          expiryDate: newCertification.expiryDate || undefined
        }]
      }))
      setNewCertification({
        name: '',
        issuingAuthority: '',
        issueDate: '',
        expiryDate: ''
      })
    }
  }

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await dispatch(createTechnician(formData)).unwrap()
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create technician')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Technician</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <label className="form-label">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              Specializations
            </h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                className="form-input flex-1"
                placeholder="Add specialization"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
              />
              <button
                type="button"
                onClick={addSpecialization}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            
            {formData.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg"
                  >
                    <span className="text-sm">{spec}</span>
                    <button
                      type="button"
                      onClick={() => removeSpecialization(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              Certifications
            </h3>
            
            <div className="space-y-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Certification name"
                />
                <input
                  type="text"
                  value={newCertification.issuingAuthority}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, issuingAuthority: e.target.value }))}
                  className="form-input"
                  placeholder="Issuing authority"
                />
                <input
                  type="date"
                  value={newCertification.issueDate}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, issueDate: e.target.value }))}
                  className="form-input"
                  placeholder="Issue date"
                />
                <input
                  type="date"
                  value={newCertification.expiryDate}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="form-input"
                  placeholder="Expiry date"
                />
              </div>
              <button
                type="button"
                onClick={addCertification}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </button>
            </div>
            
            {formData.certifications.length > 0 && (
              <div className="space-y-3">
                {formData.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{cert.name}</p>
                      <p className="text-sm text-gray-600">{cert.issuingAuthority}</p>
                      {cert.issueDate && (
                        <p className="text-xs text-gray-500">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md"
              />
              <span className="ml-2 text-sm text-gray-700">Active technician</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Technician
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
