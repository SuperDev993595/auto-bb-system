type Task = {
    business: string;
    phone: string;
    contact: string;
    followUp: string;
    outcome: string;
};

const tasks: Task[] = [
    {
        business: "FastFix Auto",
        phone: "555-123-4567",
        contact: "John Manager",
        followUp: "2025-08-03 10:00 AM",
        outcome: "Proposal Sent"
    },
    {
        business: "DriveTime Repair",
        phone: "555-987-6543",
        contact: "Rachel Owner",
        followUp: "2025-08-04 2:00 PM",
        outcome: "Not Interested"
    }
];

export default function TaskTable() {
    return (
        <div className="overflow-x-auto bg-white shadow rounded">
            <table className="table-auto w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="p-3">Business</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Follow-Up</th>
                        <th className="p-3">Outcome</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((t, i) => (
                        <tr key={i} className="border-b">
                            <td className="p-3">{t.business}</td>
                            <td className="p-3">{t.phone}</td>
                            <td className="p-3">{t.contact}</td>
                            <td className="p-3">{t.followUp}</td>
                            <td className="p-3">{t.outcome}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
