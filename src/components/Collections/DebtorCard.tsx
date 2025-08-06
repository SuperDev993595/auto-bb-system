type Props = {
    name: string;
    vehicle: string;
    amount: string;
    status?: string;
};

export default function DebtorCard({ name, vehicle, amount }: Props) {
    return (
        <div className="bg-white p-4 rounded shadow text-sm">
            <h3 className="font-bold text-red-600">{name}</h3>
            <p>{vehicle}</p>
            <p className="text-red-500 font-semibold">Owes: {amount}</p>
            <textarea placeholder="Notes..." className="w-full mt-2 p-2 border border-gray-300 rounded" />
            <div className="mt-2 flex items-center gap-3">
                <label><input type="checkbox" className="mr-1" /> Sent Proposal</label>
                <label><input type="checkbox" className="mr-1" /> Not Interested</label>
            </div>
        </div>
    );
}
