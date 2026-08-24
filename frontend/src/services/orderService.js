import api from "./api";

export const getOrders = (page = 1, limit = 10) => {
  return api.get(`/orders?page=${page}&limit=${limit}`);
};

export const getOrderById = (id) => {
  return api.get(`/orders/${id}`);
};

export const createOrder = (data) => {
  return api.post("/orders", data);
};

export const updateOrderStatus = (id, status) => {
  return api.put(`/orders/${id}`, { status });
};

export const cancelOrder = (id) => {
  return api.patch(`/orders/${id}/cancel`);
};

export const deleteOrder = (id) => {
  return api.delete(`/orders/${id}`);
};