import DebtorCard from "../components/Collections/DebtorCard";
import PageTitle from "../components/Shared/PageTitle";

export default function CollectionsPage() {
    const debtors = [
        { name: "Tina Gray", vehicle: "Chevy Malibu 2017", amount: "$460" },
        { name: "Robert V.", vehicle: "Honda Civic 2018", amount: "$230" }
    ];

    return (
        <div className="p-6">
            <PageTitle title="Collections" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {debtors.map((d, i) => (
                    <DebtorCard key={i} {...d} />
                ))}
            </div>
        </div>
    );
}
