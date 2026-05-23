import api from "../../../shared/services/api";

export const createLabSession = async (payload) => {
  const response = await api.post("/lab-sessions", payload);
  return response.data;
};

export const getLabSessions = async (filters = {}) => {
  const response = await api.get("/lab-sessions", {
    params: filters,
  });
  return response.data;
};

export const getLabSessionById = async (id) => {
  const response = await api.get(`/lab-sessions/${id}`);
  return response.data;
};

export const updateLabSession = async (id, payload) => {
  const response = await api.put(`/lab-sessions/${id}`, payload);
  return response.data;
};

export const deleteLabSession = async (id) => {
  const response = await api.delete(`/lab-sessions/${id}`);
  return response.data;
};

export const updateLabSessionStatus = async (id, payload) => {
  const response = await api.patch(`/lab-sessions/${id}/status`, payload);
  return response.data;
};

export const getSessionAttendance = async (id) => {
  const response = await api.get(`/lab-sessions/${id}/attendance`);
  return response.data;
};

export const markLabAttendance = async (id, payload) => {
  const response = await api.post(`/lab-sessions/${id}/attendance`, payload);
  return response.data;
};

export const removeLabAttendance = async (sessionId, studentId) => {
  const response = await api.delete(
    `/lab-sessions/${sessionId}/attendance/${studentId}`
  );
  return response.data;
};