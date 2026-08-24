import { useCallback, useEffect, useState } from "react";

import DashboardLayout from "../components/layouts/DashboardLayout";
import ProductCard from "../components/dashboard/ProductCard";
import Pagination from "../components/dashboard/Pagination";
import DeleteModal from "../components/dashboard/DeleteModal";
import AddProductModal from "../components/dashboard/AddProductModal";

import {
  getProducts,
  deleteProduct,
} from "../services/productService";

import toast from "react-hot-toast";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selectedEditProduct, setSelectedEditProduct] = useState(null);
  const [selectedDeleteProduct, setSelectedDeleteProduct] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // =========================
  // Fetch Products
  // =========================
  const fetchProducts = useCallback(
    async (page = 1, searchTerm = "") => {
      try {
        setLoading(true);
        setError("");

        const res = await getProducts(page, searchTerm);

        setProducts(res.data.products || []);
        setCurrentPage(res.data.currentPage || 1);
        setTotalPages(res.data.totalPages || 1);
        setTotalProducts(res.data.totalProducts || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load products."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // =========================
  // Fetch when page/search changes
  // =========================
  useEffect(() => {
    fetchProducts(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchProducts]);

  // =========================
  // Search Debounce
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // =========================
  // Edit Product
  // =========================
  const handleEditClick = (product) => {
    setSelectedEditProduct(product);
    setEditOpen(true);
  };

  // =========================
  // Delete Product
  // =========================
  const handleDeleteClick = (product) => {
    setSelectedDeleteProduct(product);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDeleteProduct?.id) {
      toast.error("Product ID not found.");
      return;
    }

    try {
      setDeleteLoading(true);

      // PostgreSQL uses `id`, not MongoDB's `_id`
      await deleteProduct(selectedDeleteProduct.id);

      toast.success("Product deleted successfully!");

      setDeleteOpen(false);
      setSelectedDeleteProduct(null);

      await fetchProducts(currentPage, debouncedSearch);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to delete product."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <h2 className="text-xl font-semibold">
            Loading products...
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // Error
  // =========================
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <h2 className="text-xl text-red-500">
            {error}
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <DashboardLayout
      showSearch={true}
      search={search}
      setSearch={setSearch}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="mt-2 text-gray-400">
            Total Products: {totalProducts}
          </p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {/* Products */}
      <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDeleteClick}
              onEdit={handleEditClick}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="mt-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedDeleteProduct(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        productName={selectedDeleteProduct?.name}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        fetchProducts={fetchProducts}
        currentPage={currentPage}
      />

      {/* Edit Product Modal */}
      <AddProductModal
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedEditProduct(null);
        }}
        fetchProducts={fetchProducts}
        currentPage={currentPage}
        isEdit={true}
        product={selectedEditProduct}
      />
    </DashboardLayout>
  );
}

export default Products;