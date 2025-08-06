type PromotionCardProps = {
    title: string;
    description: string;
    onEdit?: () => void;
    onDelete?: () => void;
};

export default function PromotionCard({ title, description, onEdit, onDelete }: PromotionCardProps) {
    return (
        <div className="bg-white p-4 rounded shadow hover:shadow-md transition text-sm flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-600 mt-2">{description}</p>
            </div>

            {(onEdit || onDelete) && (
                <div className="flex justify-end gap-2 mt-4">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="text-blue-600 hover:underline text-xs"
                        >
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="text-red-600 hover:underline text-xs"
                        >
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
