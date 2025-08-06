import { useState, ChangeEvent } from "react";

type AppointmentData = {
    customer: string;
    phone: string;
    vehicle: string;
    date: string;
    serviceType: string;
    notes: string;
};

type Props = {
    onClose: () => void;
    onSave: (data: AppointmentData) => void;
};

export default function AppointmentModal({ onClose, onSave }: Props) {
    const [form, setForm] = useState<AppointmentData>({
        customer: "",
        phone: "",
        vehicle: "",
        date: "",
        serviceType: "",
        notes: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!form.customer || !form.vehicle || !form.date || !form.serviceType) {
            alert("Please fill in all required fields.");
            return;
        }

        onSave(form);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">New Appointment</h2>

                <div className="grid grid-cols-1 gap-4 text-sm">
                    <input
                        name="customer"
                        placeholder="Customer Name*"
                        className="p-2 border rounded"
                        onChange={handleChange}
                    />
                    <input
                        name="phone"
                        placeholder="Phone Number"
                        className="p-2 border rounded"
                        onChange={handleChange}
                    />
                    <input
                        name="vehicle"
                        placeholder="Vehicle (Make/Model/Year)*"
                        className="p-2 border rounded"
                        onChange={handleChange}
                    />
                    <input
                        type="datetime-local"
                        name="date"
                        className="p-2 border rounded"
                        onChange={handleChange}
                    />
                    <input
                        name="serviceType"
                        placeholder="Service Type (e.g. Oil Change)*"
                        className="p-2 border rounded"
                        onChange={handleChange}
                    />
                    <textarea
                        name="notes"
                        placeholder="Additional Notes"
                        className="p-2 border rounded"
                        rows={3}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-sm rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-yellow-400 text-sm font-semibold rounded hover:bg-yellow-300"
                    >
                        Save Appointment
                    </button>
                </div>
            </div>
        </div>
    );
}
