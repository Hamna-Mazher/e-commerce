import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { getProductById, deleteProduct } from "../services/productService";

import {
  ArrowLeft,
  Pencil,
  Trash2,
} from "lucide-react";

import DeleteModal from "../components/dashboard/DeleteModal";
import AddProductModal from "../components/dashboard/AddProductModal";

function ProductDetails() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);


 const fetchProduct = useCallback(async () => {
  if (!id) {
    console.error("❌ Product ID is missing!");
    setProduct(null);
    setLoading(false);
    return;
  }

  try {
    setLoading(true);

    console.log("✅ Product ID from URL:", id);

    const res = await getProductById(id);

    console.log("✅ Product received:", res.data);

    setProduct(res.data);
  } catch (err) {
    console.error("❌ Get Product Error:", err);
    setProduct(null);
  } finally {
    setLoading(false);
  }
}, [id]);

useEffect(() => {
  fetchProduct();
}, [fetchProduct]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-white">Loading...</p>
      </DashboardLayout>
    );
  }

  // Product not found / API error
  if (!product) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            Product not found
          </h2>

          <button
            onClick={() => navigate("/products")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      // PostgreSQL uses id, not _id
      await deleteProduct(product.id);

      navigate("/products");
    } catch (err) {
      console.log(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-white hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid gap-10 lg:grid-cols-2">

          {/* Image */}
          <div>
            {product.image ? (
              <img
                src={`http://localhost:5000/uploads/${product.image}`}
                alt={product.name}
                className="h-[450px] w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-[450px] w-full items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Details */}
          <div>

            <span className="rounded-full bg-blue-500/10 px-4 py-2 text-blue-400">
              {product.category}
            </span>

            <h1 className="mt-5 text-4xl font-bold text-white">
              {product.name}
            </h1>

            <p className="mt-6 text-slate-400">
              {product.description || "No description available."}
            </p>

            <h2 className="mt-8 text-4xl font-bold text-emerald-400">
              ${product.price}
            </h2>

            <div className="mt-10 space-y-4 rounded-xl border border-slate-700 p-5">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Created By
                </span>

                <span className="text-white">
                  {product.creatorName || "Unknown"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Email
                </span>

                <span className="text-white">
                  {product.creatorEmail || "Not available"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Role
                </span>

                <span className="text-white">
                  {product.creatorRole || "Not available"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Added On
                </span>

                <span className="text-white">
                  {product.createdAt
                    ? new Date(
                        product.createdAt
                      ).toLocaleDateString()
                    : "Not available"}
                </span>
              </div>

              {/* Admin Only Actions */}
              {user?.role === "Admin" && (
                <div className="mt-8 flex gap-4">

                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-white hover:bg-yellow-600"
                  >
                    <Pencil size={18} />
                    Edit Product
                  </button>

                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-white hover:bg-red-700"
                  >
                    <Trash2 size={18} />
                    Delete Product
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        productName={product.name}
      />

      {/* Edit Modal */}
      <AddProductModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        isEdit={true}
        product={product}
        fetchProducts={fetchProduct}
        currentPage={1}
      />

    </DashboardLayout>
  );
}

export default ProductDetails;