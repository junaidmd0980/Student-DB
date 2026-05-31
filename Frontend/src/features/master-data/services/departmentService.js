import api from "../../../shared/services/api";

export const createDepartment = async (payload) => {
  try {
    const response = await api.post("/departments", payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getDepartments = async () => {
  try {
    const response = await api.get("/departments");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateDepartment = async (id, payload) => {
  try {
    const response = await api.put(`/departments/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};