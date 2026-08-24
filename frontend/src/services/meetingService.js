import api from "./api";

export const getMeetings = (page = 1, limit = 10) => {
  return api.get(`/meetings?page=${page}&limit=${limit}`);
};

export const getMeetingById = (id) => {
  return api.get(`/meetings/${id}`);
};

export const createMeeting = (data) => {
  return api.post("/meetings", data);
};

export const updateMeeting = (id, data) => {
  return api.put(`/meetings/${id}`, data);
};

export const softDeleteMeeting = (id) => {
  return api.patch(`/meetings/${id}/soft-delete`);
};

export const deleteMeeting = (id) => {
  return api.delete(`/meetings/${id}`);
};