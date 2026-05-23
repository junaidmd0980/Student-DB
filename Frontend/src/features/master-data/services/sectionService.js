import api from "../../../shared/services/api";

export const createSection = async (payload) => {
  const response = await api.post("/sections", payload);
  return response.data;
};

export const getSections = async (params = {}) => {
  const response = await api.get("/sections", { params });
  return response.data;
};

export const updateSection = async (id, payload) => {
  const response = await api.put(`/sections/${id}`, payload);
  return response.data;
};

export const deleteSection = async (id) => {
  const response = await api.delete(`/sections/${id}`);
  return response.data;
};