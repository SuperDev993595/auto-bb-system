import { useState, ChangeEvent } from "react";

type TaskData = {
    business: string;
    phone: string;
    contact: string;
    email: string;
    address: string;
    city: string;
    state: string;
    hours: string;
    followUp: string;
    outcome: string;
    proposalSent: boolean;
    notInterested: boolean;
};

type Props = {
    onClose: () => void;
    onSave: (data: TaskData) => void;
};

export default function TaskModal({ onClose, onSave }: Props) {
    const [formData, setFormData] = useState<TaskData>({
        business: "",
        phone: "",
        contact: "",
        email: "",
        address: "",
        city: "",
        state: "",
        hours: "",
        followUp: "",
        outcome: "",
        proposalSent: false,
        notInterested: false,
    });

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        const checked = target.checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = () => {
        if (!formData.business || !formData.phone || !formData.contact) {
            alert("Please fill in the required fields.");
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white w-full max-w-2xl rounded shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">New Task</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <input name="business" placeholder="Business Name*" className="p-2 border rounded" onChange={handleChange} />
                    <input name="phone" placeholder="Phone Number*" className="p-2 border rounded" onChange={handleChange} />
                    <input name="contact" placeholder="Contact Person*" className="p-2 border rounded" onChange={handleChange} />
                    <input name="email" placeholder="Email" className="p-2 border rounded" onChange={handleChange} />
                    <input name="address" placeholder="Address" className="p-2 border rounded" onChange={handleChange} />
                    <input name="city" placeholder="City" className="p-2 border rounded" onChange={handleChange} />
                    <input name="state" placeholder="State" className="p-2 border rounded" onChange={handleChange} />
                    <input name="hours" placeholder="Hours of Operation" className="p-2 border rounded" onChange={handleChange} />
                    <input type="datetime-local" name="followUp" className="p-2 border rounded md:col-span-2" onChange={handleChange} />
                    <textarea name="outcome" placeholder="Notes / Outcome" className="p-2 border rounded md:col-span-2" rows={3} onChange={handleChange} />
                </div>

                <div className="flex gap-4 mt-4 text-sm">
                    <label className="flex items-center">
                        <input type="checkbox" name="proposalSent" onChange={handleChange} className="mr-2" />
                        Sent Proposal
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="notInterested" onChange={handleChange} className="mr-2" />
                        Not Interested
                    </label>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-sm rounded hover:bg-gray-400">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300">
                        Save Task
                    </button>
                </div>
            </div>
        </div>
    );
}
