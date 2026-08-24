function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="mt-12 flex items-center justify-center gap-4">

      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-lg bg-slate-800 px-4 py-2 disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-gray-300">
        {currentPage} / {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-lg bg-slate-800 px-4 py-2 disabled:opacity-40"
      >
        Next
      </button>

    </div>
  );
}

export default Pagination;