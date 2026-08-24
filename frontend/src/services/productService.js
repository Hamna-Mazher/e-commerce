import api from "./api";

export const getProducts = (
  page = 1,
  search = ""
) => {
  return api.get(
    `/products?page=${page}&search=${encodeURIComponent(search)}`
  );
};

export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};

export const addProduct = (formData) => {
  return api.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateProduct = (id, data) => {
  return api.put(`/products/${id}`, data);
};