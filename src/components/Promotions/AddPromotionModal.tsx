import { useState } from "react";

type Promotion = {
    title: string;
    description: string;
};

type Props = {
    onClose: () => void;
    onSave: (data: Promotion) => void;
};

export default function AddPromotionModal({ onClose, onSave }: Props) {
    const [formData, setFormData] = useState<Promotion>({
        title: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.description) {
            alert("Please fill in both fields.");
            return;
        }

        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Promotion</h2>

                <div className="space-y-4 text-sm">
                    <input
                        name="title"
                        placeholder="Promotion Title"
                        className="w-full p-2 border border-gray-300 rounded"
                        onChange={handleChange}
                    />
                    <textarea
                        name="description"
                        placeholder="Promotion Description"
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded"
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded text-sm hover:bg-gray-400">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-yellow-400 rounded text-black font-semibold text-sm hover:bg-yellow-300"
                    >
                        Save Promotion
                    </button>
                </div>
            </div>
        </div>
    );
}
