import { FaCheckCircle } from "react-icons/fa"; // Install react-icons if not yet: npm i react-icons
import { useEffect, useRef } from "react";

const services = [
    {
        title: "Appointment Scheduling",
        desc: "We schedule repairs, towing, shuttle pickups, and more for your customers.",
    },
    {
        title: "Debt Collection",
        desc: "Recover unpaid bills through flexible arrangements with our team.",
    },
    {
        title: "Marketing & Campaigns",
        desc: "Promote services and loyalty offers through email and SMS.",
    },
    {
        title: "Customer Feedback",
        desc: "Improve retention with real follow-ups and satisfaction tracking.",
    },
];

export default function ServicesOverview() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && ref.current) {
                    ref.current.classList.add("fade-in-visible");
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 opacity-0 transform translate-y-6 transition-all duration-700 fade-in-section"
        >
            {services.map((s, i) => (
                <div
                    key={i}
                    className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                >
                    <div className="flex items-start gap-3 mb-3">
                        <FaCheckCircle className="text-yellow-400 mt-1 text-lg group-hover:scale-110 transition-transform duration-300" />
                        <h4 className="text-lg font-semibold text-white">{s.title}</h4>
                    </div>
                    <p className="text-sm text-gray-300">{s.desc}</p>
                </div>
            ))}
        </div>
    );
}
