type Props = {
    onClose: () => void;
};

export default function CRMNoteModal({ onClose }: Props) {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white w-full max-w-md p-6 rounded shadow-lg relative">
                <h3 className="text-lg font-semibold mb-4">CRM Notes</h3>
                <textarea className="w-full h-24 border p-2 mb-4" placeholder="Enter note here..."></textarea>
                <label className="block mb-2">
                    <input type="checkbox" className="mr-2" />
                    Follow-Up Required
                </label>
                <input type="datetime-local" className="w-full border p-2 mb-4" />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                    <button className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded">Save</button>
                </div>
            </div>
        </div>
    );
}
