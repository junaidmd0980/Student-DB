import api from "../../../shared/services/api";

export const createBatch = async (payload) => {
  try {
    const response = await api.post("/batches", payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getBatches = async (params = {}) => {
  try {
    const response = await api.get("/batches", { params });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateBatch = async (id, payload) => {
  try {
    const response = await api.put(`/batches/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const deleteBatch = async (id) => {
  try {
    const response = await api.delete(`/batches/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};