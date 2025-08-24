import React, { useState } from 'react'
import { WorkOrder } from '../../services/services'
import ModalWrapper from '../../utils/ModalWrapper'

interface AddWorkOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (workOrder: Partial<WorkOrder>) => Promise<void>
}

const AddWorkOrderModal: React.FC<AddWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    workOrderNumber: '',
    customerName: '',
    vehicleInfo: '',
    description: '',
    estimatedHours: 0,
    priority: 'medium',
    status: 'pending',
    assignedTechnician: '',
    dueDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await onSubmit(formData)
      onClose()
      setFormData({
        workOrderNumber: '',
        customerName: '',
        vehicleInfo: '',
        description: '',
        estimatedHours: 0,
        priority: 'medium',
        status: 'pending',
        assignedTechnician: '',
        dueDate: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create work order')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Work Order"
      submitText="Create Work Order"
      onSubmit={handleSubmit}
      isLoading={loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="workOrderNumber" className="form-label">
              Work Order Number *
            </label>
            <input
              type="text"
              id="workOrderNumber"
              name="workOrderNumber"
              value={formData.workOrderNumber}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter work order number"
            />
          </div>

          <div>
            <label htmlFor="customerName" className="form-label">
              Customer Name *
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter customer name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="vehicleInfo" className="form-label">
            Vehicle Information *
          </label>
          <input
            type="text"
            id="vehicleInfo"
            name="vehicleInfo"
            value={formData.vehicleInfo}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter vehicle make, model, year"
          />
        </div>

        <div>
          <label htmlFor="description" className="form-label">
            Work Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="form-textarea"
            placeholder="Describe the work to be performed"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="estimatedHours" className="form-label">
              Estimated Hours
            </label>
            <input
              type="number"
              id="estimatedHours"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="form-input"
              placeholder="0.0"
            />
          </div>

          <div>
            <label htmlFor="priority" className="form-label">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="assignedTechnician" className="form-label">
              Assigned Technician
            </label>
            <input
              type="text"
              id="assignedTechnician"
              name="assignedTechnician"
              value={formData.assignedTechnician}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter technician name"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="form-label">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  )
}

export default AddWorkOrderModal
