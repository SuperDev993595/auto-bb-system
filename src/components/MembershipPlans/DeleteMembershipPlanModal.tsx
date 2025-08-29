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
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Delete Membership Plan"
      icon={<AlertTriangle className="w-5 h-5" />}
      submitText="Delete Plan"
      submitColor="bg-red-600 hover:bg-red-700"
      onSubmit={onConfirm}
      size="sm"
    >
      <div className="p-6 space-y-6">
        {/* Warning Message */}
        <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-red-700">
              This action cannot be undone. This will permanently delete the membership plan and all associated data.
            </p>
          </div>
        </div>

        {/* Plan Details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-gray-900 mb-3">Plan Details</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan Name:</span>
              <span className="font-medium text-gray-900">{plan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tier:</span>
              <span className="font-medium text-gray-900">
                {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Additional warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">
            <strong>Final Warning:</strong> Once deleted, this membership plan and all its associated data will be permanently removed from the system.
          </p>
        </div>
      </div>
    </ModalWrapper>
  )
}
