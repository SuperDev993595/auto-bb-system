type PaginationProps = {
    currentPage: number
    totalPages: number
    setCurrentPage: (page: number) => void
}

export default function Pagination({
    currentPage,
    totalPages,
    setCurrentPage,
}: PaginationProps) {
    return (
        <div className="flex justify-center gap-2 mt-4">
            <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
            >
                Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded transition ${currentPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border hover:bg-blue-100'
                        }`}
                >
                    {i + 1}
                </button>
            ))}

            <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
            >
                Next
            </button>
        </div>
    )
}
