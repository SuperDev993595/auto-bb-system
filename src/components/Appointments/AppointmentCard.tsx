type AppointmentProps = {
    customer: string;
    vehicle: string;
    date: string;
    service: string;
    status?: string;
};

export default function AppointmentCard({
    customer,
    vehicle,
    date,
    service,
}: AppointmentProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 text-sm">
            <h3 className="font-semibold">{customer}</h3>
            <p>{vehicle}</p>
            <p className="text-gray-600">{date}</p>
            <p className="text-blue-600">{service}</p>
        </div>
    );
}
