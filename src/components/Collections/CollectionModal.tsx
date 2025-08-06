import { useState, ChangeEvent } from "react";

type CollectionData = {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    vehicle: string;
    mileage: string;
    amount: string;
    notes: string;
    proposalSent: boolean;
    notInterested: boolean;
};

type Props = {
    onClose: () => void;
    onSave: (data: CollectionData) => void;
};

export default function CollectionModal({ onClose, onSave }: Props) {
    const [formData, setFormData] = useState<CollectionData>({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        vehicle: "",
        mileage: "",
        amount: "",
        notes: "",
        proposalSent: false,
        notInterested: false,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        const checked = target.checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.amount || !formData.vehicle) {
            alert("Please fill in required fields.");
            return;
        }

        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white w-full max-w-2xl rounded shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Add Collection Entry</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <input name="name" placeholder="Debtor Name*" className="p-2 border rounded" onChange={handleChange} />
                    <input name="phone" placeholder="Phone Number" className="p-2 border rounded" onChange={handleChange} />
                    <input name="address" placeholder="Address" className="p-2 border rounded" onChange={handleChange} />
                    <input name="city" placeholder="City" className="p-2 border rounded" onChange={handleChange} />
                    <input name="state" placeholder="State" className="p-2 border rounded" onChange={handleChange} />
                    <input name="zip" placeholder="ZIP Code" className="p-2 border rounded" onChange={handleChange} />
                    <input name="vehicle" placeholder="Vehicle (Make/Model/Year)*" className="p-2 border rounded" onChange={handleChange} />
                    <input name="mileage" placeholder="Mileage" className="p-2 border rounded" onChange={handleChange} />
                    <input name="amount" placeholder="Amount Owed*" className="p-2 border rounded" onChange={handleChange} />
                    <textarea name="notes" placeholder="Notes" rows={3} className="p-2 border rounded md:col-span-2" onChange={handleChange} />
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
                    <button onClick={handleSubmit} className="px-4 py-2 bg-yellow-400 text-black font-semibold text-sm rounded hover:bg-yellow-300">
                        Save Collection
                    </button>
                </div>
            </div>
        </div>
    );
}
