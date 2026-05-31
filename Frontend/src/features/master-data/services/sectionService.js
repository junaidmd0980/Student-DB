import api from "../../../shared/services/api";

export const createSection = async (payload) => {
  try {
    const response = await api.post("/sections", payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getSections = async (params = {}) => {
  try {
    const response = await api.get("/sections", { params });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateSection = async (id, payload) => {
  try {
    const response = await api.put(`/sections/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const deleteSection = async (id) => {
  try {
    const response = await api.delete(`/sections/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};