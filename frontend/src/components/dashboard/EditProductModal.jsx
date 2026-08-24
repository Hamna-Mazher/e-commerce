import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { updateProduct } from "../../services/productService";
import toast from "react-hot-toast";

function EditProductModal({
  isOpen,
  onClose,
  product,
  fetchProducts,
  currentPage,
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        price: product.price || "",
        description: product.description || "",
      });
    }
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
const handleSubmit = async () => {
  try {
    setLoading(true);

    await updateProduct(product._id, formData);

    toast.success("Product updated successfully");

    fetchProducts(currentPage);

    onClose();

  } catch (err) {

    toast.error(
      err.response?.data?.message ||
      "Failed to update product"
    );

  } finally {

    setLoading(false);

  }
};
 return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-white">
            Add New Product
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={22} />
          </button>

        </div>

        {/* Form */}

        <div className="space-y-5">

          <div>

            <label className="mb-2 block text-sm text-gray-300">
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-gray-300">
              Category
            </label>

            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Electronics"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-gray-300">
              Price
            </label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="1499"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-gray-300">
              Description
            </label>

            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write product description..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
            />

          </div>

   

        </div>

        {/* Footer */}

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-6 py-3 text-white hover:bg-slate-800"
          >
            Cancel
          </button>

         <button
  onClick={handleSubmit}
  disabled={loading}
  className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
>
  {loading ? "Updating..." : "Update Product"}
</button>
        </div>

      </div>

    </div>
  );
}
export default EditProductModal;
