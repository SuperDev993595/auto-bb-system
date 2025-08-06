import PageTitle from "../components/Shared/PageTitle";

export default function WarrantySalesPage() {
    const warranties = [
        { name: "Amanda Torres", plan: "Gold 2-Year", vehicle: "Hyundai Elantra 2021", date: "2025-07-10" },
        { name: "Carlos M.", plan: "Silver 1-Year", vehicle: "Ford F-150 2022", date: "2025-07-25" }
    ];

    return (
        <div className="p-6">
            <PageTitle title="Warranty Sales" />
            <table className="table-auto w-full text-sm mt-4">
                <thead className="bg-gray-100 text-gray-600">
                    <tr>
                        <th className="p-2">Customer</th>
                        <th className="p-2">Plan</th>
                        <th className="p-2">Vehicle</th>
                        <th className="p-2">Sale Date</th>
                    </tr>
                </thead>
                <tbody>
                    {warranties.map((w, i) => (
                        <tr key={i} className="border-b">
                            <td className="p-2">{w.name}</td>
                            <td className="p-2">{w.plan}</td>
                            <td className="p-2">{w.vehicle}</td>
                            <td className="p-2">{w.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
