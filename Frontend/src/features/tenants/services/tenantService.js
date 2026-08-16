import api from "../../../shared/services/api";

export const createTenant = async (payload) => {
  try {
    const response = await api.post("/tenants", payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getMyTenants = async () => {
  try {
    const response = await api.get("/tenants");
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getTenantById = async (id, payload) => {
  try {
    const response = await api.get(`/tenants/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateTenant = async (id, payload) => {
  try {
    const response = await api.patch(`/tenants/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const deleteTenant = async (id) => {
  try {
    const response = await api.delete(`/tenants/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const addTenantUser = async (tenantId, payload) => {
  try {
    const response = await api.post(`/tenants/${tenantId}/users`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const removeTenantUser = async (tenantId, userId) => {
  try {
    const response = await api.delete(`/tenants/${tenantId}/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const changeTenantUserRole = async (tenantId, userId, role) => {
  try {
    const response = await api.patch(`/tenants/${tenantId}/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};