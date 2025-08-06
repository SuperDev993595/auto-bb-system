import PageTitle from "../components/Shared/PageTitle";
import { useState } from "react";
import CRMNoteModal from "../components/CRM/CRMNoteModal";

export default function ContactLogsPage() {
    const [openModal, setOpenModal] = useState(false);

    const logs = [
        { name: "James Auto", topic: "Feedback", time: "2025-07-20", outcome: "Satisfied" },
        { name: "Elite Motors", topic: "Warranty Offer", time: "2025-07-22", outcome: "Follow-Up Needed" }
    ];

    return (
        <div className="p-6">
            <PageTitle title="Contact Logs" />
            <table className="table-auto w-full text-sm mt-4">
                <thead className="bg-gray-100 text-gray-600">
                    <tr>
                        <th className="p-2">Shop</th>
                        <th className="p-2">Topic</th>
                        <th className="p-2">Time</th>
                        <th className="p-2">Outcome</th>
                        <th className="p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, i) => (
                        <tr key={i} className="border-b">
                            <td className="p-2">{log.name}</td>
                            <td className="p-2">{log.topic}</td>
                            <td className="p-2">{log.time}</td>
                            <td className="p-2">{log.outcome}</td>
                            <td className="p-2">
                                <button
                                    onClick={() => setOpenModal(true)}
                                    className="text-blue-600 underline text-xs"
                                >
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {openModal && <CRMNoteModal onClose={() => setOpenModal(false)} />}
        </div>
    );
}
