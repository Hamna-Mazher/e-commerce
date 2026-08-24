import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import Pagination from "../components/dashboard/Pagination";
import DeleteModal from "../components/dashboard/DeleteModal";
import toast from "react-hot-toast";

import {
  getOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
} from "../services/orderService";

function Orders() {
  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "Admin";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // =========================
  // Fetch Orders
  // =========================
  const fetchOrders = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const res = await getOrders(page, 10);

        setOrders(res.data.orders || []);
        setCurrentPage(res.data.currentPage || 1);
        setTotalPages(res.data.totalPages || 1);
        setTotalOrders(res.data.totalOrders || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  // =========================
  // Admin - Update Status
  // =========================
  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);

      toast.success("Order status updated successfully.");

      await fetchOrders(currentPage);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to update order status."
      );
    }
  };

  // =========================
  // User - Cancel Order
  // =========================
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);

      toast.success("Order cancelled successfully.");

      await fetchOrders(currentPage);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to cancel order."
      );
    }
  };

  // =========================
  // Admin - Delete Order
  // =========================
  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder?.id) {
      toast.error("Order ID not found.");
      return;
    }

    try {
      setDeleteLoading(true);

      await deleteOrder(selectedOrder.id);

      toast.success("Order deleted successfully.");

      setDeleteOpen(false);
      setSelectedOrder(null);

      // If last item on page was removed, go back a page
      if (
        orders.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchOrders(currentPage);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to delete order."
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
            Loading orders...
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Orders
          </h1>

          <p className="mt-2 text-gray-400">
            {isAdmin
              ? `All Orders: ${totalOrders}`
              : `My Orders: ${totalOrders}`}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
        {orders.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr className="text-left text-sm uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">
                    Order #
                  </th>

                  <th className="px-6 py-4">
                    Product
                  </th>

                  <th className="px-6 py-4">
                    Qty
                  </th>

                  <th className="px-6 py-4">
                    Total
                  </th>

                  {isAdmin && (
                    <th className="px-6 py-4">
                      Ordered By
                    </th>
                  )}

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Placed On
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-slate-800"
                  >
                    {/* Order # */}
                    <td className="px-6 py-5 font-semibold text-white">
                      {order.orderNumber}
                    </td>

                    {/* Product */}
                    <td className="px-6 py-5 text-slate-300">
                      {order.productName || "-"}
                    </td>

                    {/* Quantity */}
                    <td className="px-6 py-5 text-slate-300">
                      {order.quantity}
                    </td>

                    {/* Total */}
                    <td className="px-6 py-5 font-semibold text-emerald-400">
                      ${order.total}
                    </td>

                    {/* Ordered By - Admin only */}
                    {isAdmin && (
                      <td className="px-6 py-5">
                        <p className="font-medium text-white">
                          {order.orderedBy || "-"}
                        </p>

                        <p className="text-sm text-slate-500">
                          {order.userEmail || ""}
                        </p>
                      </td>
                    )}

                    {/* Status */}
                    <td className="px-6 py-5">
                      {isAdmin ? (
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value
                            )
                          }
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                        >
                          <option value="Pending">
                            Pending
                          </option>
                          <option value="Processing">
                            Processing
                          </option>
                          <option value="Completed">
                            Completed
                          </option>
                          <option value="Cancelled">
                            Cancelled
                          </option>
                        </select>
                      ) : (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            order.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : order.status ===
                                "Cancelled"
                              ? "bg-red-500/10 text-red-400"
                              : order.status ===
                                "Processing"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-blue-500/10 text-blue-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      )}
                    </td>

                    {/* Placed On */}
                    <td className="px-6 py-5 text-slate-400">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      {isAdmin ? (
                        <button
                          onClick={() =>
                            handleDeleteClick(order)
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleCancelOrder(order.id)
                          }
                          disabled={
                            order.status === "Cancelled"
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* Admin Delete Modal */}
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        productName={
          selectedOrder
            ? `Order ${selectedOrder.orderNumber}`
            : ""
        }
      />
    </DashboardLayout>
  );
}

export default Orders;