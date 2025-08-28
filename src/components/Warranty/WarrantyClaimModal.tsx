import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { DollarSign, X } from '../../utils/icons'

interface Warranty {
  _id: string
  name: string
  customer: {
    name: string
  }
  vehicle: {
    make: string
    model: string
    year: number
  }
  maxClaimAmount?: number
  totalClaimAmount: number
}

interface Props {
  onClose: () => void
  onSubmit: (data: any) => void
  warranty: Warranty
}

export default function WarrantyClaimModal({ onClose, onSubmit, warranty }: Props) {
  const [claimAmount, setClaimAmount] = useState('')
  const [claimDescription, setClaimDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!claimAmount || !claimDescription) {
      toast.error('Please fill in all required fields')
      return
    }

    const amount = parseFloat(claimAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid claim amount')
      return
    }

    if (warranty.maxClaimAmount && amount > warranty.maxClaimAmount) {
      toast.error(`Claim amount cannot exceed maximum claim amount of $${warranty.maxClaimAmount}`)
      return
    }

    onSubmit({
      claimAmount: amount,
      claimDescription
    })
  }

  return (
    <ModalWrapper onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Add Warranty Claim</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warranty Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{warranty.name}</h3>
            <p className="text-sm text-gray-600">
              Customer: {warranty.customer.name}
            </p>
            <p className="text-sm text-gray-600">
              Vehicle: {warranty.vehicle.year} {warranty.vehicle.make} {warranty.vehicle.model}
            </p>
            <p className="text-sm text-gray-600">
              Total Claims: ${warranty.totalClaimAmount.toLocaleString()}
            </p>
            {warranty.maxClaimAmount && (
              <p className="text-sm text-gray-600">
                Max Claim Amount: ${warranty.maxClaimAmount.toLocaleString()}
              </p>
            )}
          </div>

          {/* Claim Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claim Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Claim Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Claim Description *
            </label>
            <textarea
              value={claimDescription}
              onChange={(e) => setClaimDescription(e.target.value)}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the issue or repair needed..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Claim
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  )
}
