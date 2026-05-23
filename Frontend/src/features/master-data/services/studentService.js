import api from "../../../shared/services/api";

export const createStudent = async (payload) => {
  const response = await api.post("/students", payload);
  return response.data;
};

export const getStudents = async (filters = {}) => {
  const response = await api.get("/students", {
    params: filters,
  });
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const updateStudent = async (id, payload) => {
  const response = await api.put(`/students/${id}`, payload);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const getDepartmentStudents = async (departmentId) => {
  const response = await api.get(`/students/department/${departmentId}`);
  return response.data;
};