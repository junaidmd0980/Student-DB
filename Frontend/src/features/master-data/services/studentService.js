import api from "../../../shared/services/api";

export const createStudent = async (payload) => {
  try {
    const response = await api.post("/students", payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getStudents = async (filters = {}) => {
  try {
    const response = await api.get("/students", {params: filters,});
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getStudentById = async (id) => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateStudent = async (id, payload) => {
  try {
    const response = await api.put(`/students/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getDepartmentStudents = async (departmentId) => {
  try {
    const response = await api.get(`/students/department/${departmentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};