import ModalWrapper from '../../utils/ModalWrapper'
import { AlertTriangle } from '../../utils/icons'

interface MembershipPlan {
  _id: string
  name: string
  tier: string
}

interface Props {
  onClose: () => void
  onConfirm: () => void
  plan: MembershipPlan
}

export default function DeleteMembershipPlanModal({ onClose, onConfirm, plan }: Props) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Membership Plan</h2>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone. This will permanently delete the membership plan.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Plan:</strong> {plan.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Tier:</strong> {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}
            </p>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete Plan
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
