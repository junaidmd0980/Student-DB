import api from "../../../shared/services/api";

const tenantConfig = (tenantId, config = {}) => {
  if (!tenantId) return config;
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      "X-Tenant-Id": tenantId,
      "x-tenant-id": tenantId,
    },
  };
};

export const createDepartment = async (payload, tenantId) => {
  try {
    const response = await api.post(
      "/departments",
      payload,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getDepartments = async (tenantIdOrParams = {}, maybeParams = {}) => {
  const tenantId =
    typeof tenantIdOrParams === "string" ? tenantIdOrParams : null;
  const params =
    typeof tenantIdOrParams === "object" && tenantIdOrParams !== null
      ? tenantIdOrParams
      : maybeParams;

  try {
    const response = await api.get(
      "/departments",
      tenantConfig(tenantId, { params })
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateDepartment = async (id, payload, tenantId) => {
  try {
    const response = await api.put(
      `/departments/${id}`,
      payload,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const deleteDepartment = async (id, tenantId) => {
  try {
    const response = await api.delete(
      `/departments/${id}`,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};