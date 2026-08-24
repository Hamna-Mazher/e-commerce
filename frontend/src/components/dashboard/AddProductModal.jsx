import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

import {
  addProduct,
  updateProduct,
} from "../../services/productService";

function AddProductModal({
  isOpen,
  onClose,
  fetchProducts,
  currentPage,
  isEdit = false,
  product = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const fileInputRef = useRef(null);

  // =========================
  // Load Product for Edit
  // =========================
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        price: product.price || "",
        description: product.description || "",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        price: "",
        description: "",
      });
    }

    setImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOpen, isEdit, product]);

  if (!isOpen) return null;

  // =========================
  // Input Change
  // =========================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================
  // Submit
  // =========================
  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.price ||
      (!isEdit && !image)
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Extra safety check for edit
    if (isEdit && !product?.id) {
      toast.error("Product ID is missing.");
      return;
    }

    try {
      setLoading(true);

 const data = new FormData();

data.append("name", formData.name);
data.append("category", formData.category);
data.append("price", formData.price);
data.append("description", formData.description);

if (image) {
  data.append("image", image);
}
      // =========================
      // UPDATE
      // =========================
      if (isEdit) {
        console.log("Updating product ID:", product.id);

        await updateProduct(product.id, data);

        toast.success("Product updated successfully!");
      }

      // =========================
      // CREATE
      // =========================
      else {
        await addProduct(data);

        toast.success("Product added successfully!");
      }

      // Reset form
      setFormData({
        name: "",
        category: "",
        price: "",
        description: "",
      });

      setImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onClose();

      // Refresh products
      await fetchProducts(currentPage);
    } catch (err) {
      console.error(
        isEdit
          ? "Update Product Error:"
          : "Add Product Error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          (isEdit
            ? "Failed to update product."
            : "Failed to add product.")
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
            {isEdit ? "Edit Product" : "Add New Product"}
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

          {/* Name */}
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

          {/* Category */}
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

          {/* Price */}
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

          {/* Description */}
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

          {/* Image */}
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Product Image
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files?.[0] || null)
              }
              className="hidden"
              id="product-image"
            />

            <label
              htmlFor="product-image"
              className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-600 bg-slate-800 px-4 py-6 text-gray-300 transition hover:border-blue-500 hover:bg-slate-700"
            >
              {isEdit
                ? "Change Image (Optional)"
                : "Choose Image"}
            </label>

            {image && (
              <p className="mt-3 text-sm text-green-400">
                ✅ {image.name}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-700 px-6 py-3 text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? isEdit
                ? "Updating..."
                : "Adding..."
              : isEdit
              ? "Update Product"
              : "Add Product"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default AddProductModal;