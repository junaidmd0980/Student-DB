import api from "../../../shared/services/api";

export const createBatch = async (payload) => {
  const response = await api.post("/batches", payload);
  return response.data;
};

export const getBatches = async (params = {}) => {
  const response = await api.get("/batches", { params });
  return response.data;
};

export const updateBatch = async (id, payload) => {
  const response = await api.put(`/batches/${id}`, payload);
  return response.data;
};

export const deleteBatch = async (id) => {
  const response = await api.delete(`/batches/${id}`);
  return response.data;
};