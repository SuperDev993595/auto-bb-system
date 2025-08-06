import PromotionCard from "../components/Promotions/PromotionCard";
import PageTitle from "../components/Shared/PageTitle";

export default function PromotionsPage() {
    const campaigns = [
        {
            title: "Summer Brake Check",
            description: "Free brake inspection for all vehicles in August!"
        },
        {
            title: "Referral Program",
            description: "Refer a customer, get $20 off your next visit!"
        }
    ];

    return (
        <div className="p-6">
            <PageTitle title="Marketing & Promotions" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((c, i) => (
                    <PromotionCard key={i} {...c} />
                ))}
            </div>
        </div>
    );
}
