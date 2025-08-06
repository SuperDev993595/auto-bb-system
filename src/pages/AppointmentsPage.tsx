import AppointmentCard from "../components/Appointments/AppointmentCard";
import PageTitle from "../components/Shared/PageTitle";

export default function AppointmentsPage() {
    const mockData = [
        { customer: "John Smith", vehicle: "Toyota Camry 2020", date: "2025-08-01", service: "Oil Change" },
        { customer: "Lisa Brown", vehicle: "Ford Escape 2019", date: "2025-08-02", service: "Tire Rotation" }
    ];

    return (
        <div className="p-6">
            <PageTitle title="Appointments" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockData.map((appt, idx) => (
                    <AppointmentCard key={idx} {...appt} />
                ))}
            </div>
        </div>
    );
}
