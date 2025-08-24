import React, { useState } from 'react'
import {
  HiExclamation,
  HiMail
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface MailChimpCampaign {
  _id: string;
  name: string;
  subject: string;
  status: string;
  type: string;
  analytics: {
    opens: number;
    openRate: number;
    clicks: number;
    clickRate: number;
  };
  recipients: {
    recipientCount: number;
    listId: string;
    listName: string;
  };
  settings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
  };
  content: {
    html: string;
    plainText: string;
  };
  createdAt: string;
  createdBy: {
    name: string;
  };
}

interface DeleteMailChimpCampaignModalProps {
  campaign: MailChimpCampaign
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteMailChimpCampaignModal: React.FC<DeleteMailChimpCampaignModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onDelete
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    try {
      setLoading(true)
      setError(null)
      await onDelete(campaign._id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete MailChimp campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete MailChimp Campaign"
      submitText="Delete Campaign"
      onSubmit={handleDelete}
      submitColor="bg-red-600"
    >
      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <HiExclamation className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h4 className="font-medium text-secondary-900">Are you sure?</h4>
            <p className="text-sm text-secondary-600">
              This action cannot be undone. This will permanently delete the MailChimp campaign.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Name:</span>
              <span className="text-sm font-medium text-secondary-900">{campaign.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Subject:</span>
              <span className="text-sm font-medium text-secondary-900">{campaign.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{campaign.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Type:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{campaign.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Audience:</span>
              <span className="text-sm font-medium text-secondary-900">{campaign.recipients.listName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Recipients:</span>
              <span className="text-sm font-medium text-secondary-900">{campaign.recipients.recipientCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Open Rate:</span>
              <span className="text-sm font-medium text-secondary-900">
                {campaign.analytics.openRate ? `${campaign.analytics.openRate}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Click Rate:</span>
              <span className="text-sm font-medium text-secondary-900">
                {campaign.analytics.clickRate ? `${campaign.analytics.clickRate}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">From:</span>
              <span className="text-sm font-medium text-secondary-900">
                {campaign.settings.fromName} ({campaign.settings.fromEmail})
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this MailChimp campaign will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Email marketing analytics</li>
            <li>Campaign performance data</li>
            <li>Audience engagement metrics</li>
            <li>Email automation workflows</li>
            <li>Marketing campaign history</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteMailChimpCampaignModal

