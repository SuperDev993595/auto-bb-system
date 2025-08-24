import React, { useState } from 'react';
import ModalWrapper from '../../utils/ModalWrapper';

type Props = {
    onClose: () => void;
};

export default function CRMNoteModal({ onClose }: Props) {
    const [note, setNote] = useState('');
    const [followUpRequired, setFollowUpRequired] = useState(false);
    const [followUpDate, setFollowUpDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle save logic here
        onClose();
    };

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            title="CRM Notes"
            submitText="Save"
            onSubmit={handleSubmit}
        >
            <div className="p-4 space-y-4">
                <div>
                    <label className="form-label">Note</label>
                    <textarea 
                        className="form-textarea" 
                        placeholder="Enter note here..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                    />
                </div>
                
                <div className="flex items-center space-x-3 pt-2">
                    <input 
                        type="checkbox" 
                        id="followUp"
                        checked={followUpRequired}
                        onChange={(e) => setFollowUpRequired(e.target.checked)}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="followUp" className="text-sm text-secondary-700">
                        Follow-Up Required
                    </label>
                </div>
                
                {followUpRequired && (
                    <div>
                        <label className="form-label">Follow-Up Date</label>
                        <input 
                            type="datetime-local" 
                            className="form-input"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </ModalWrapper>
    );
}
