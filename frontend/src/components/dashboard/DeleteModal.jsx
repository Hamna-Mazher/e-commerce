import { AlertTriangle } from "lucide-react";

function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  productName,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6">

        <div className="flex justify-center">
          <div className="rounded-full bg-red-500/20 p-4">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
        </div>

        <h2 className="mt-5 text-center text-2xl font-bold">
          Delete Product
        </h2>

        <p className="mt-3 text-center text-gray-400">
          Are you sure you want to delete
          <span className="font-semibold text-white">
            {" "}{productName}
          </span>
          ?
        </p>

        <div className="mt-8 flex gap-4">

          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-700 py-3 hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-600 py-3 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default DeleteModal;