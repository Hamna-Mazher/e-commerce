import api from "./api";

// Get users with server-side pagination
export const getUsers = (page = 1, limit = 10) => {
  return api.get(`/users?page=${page}&limit=${limit}`);
};

// Get single user profile
export const getUserById = (id) => {
  return api.get(`/users/${id}`);
};
export const getAllUsersForMeeting = () => {
  return api.get("/users?page=1&limit=100");
};