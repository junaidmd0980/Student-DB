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

export const createSection = async (payload, tenantId) => {
  try {
    const response = await api.post(
      "/sections",
      payload,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getSections = async (tenantIdOrParams = {}, maybeParams = {}) => {
  const tenantId =
    typeof tenantIdOrParams === "string" ? tenantIdOrParams : null;
  const params =
    typeof tenantIdOrParams === "object" && tenantIdOrParams !== null
      ? tenantIdOrParams
      : maybeParams;

  try {
    const response = await api.get(
      "/sections",
      tenantConfig(tenantId, { params })
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateSection = async (id, payload, tenantId) => {
  try {
    const response = await api.put(
      `/sections/${id}`,
      payload,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const deleteSection = async (id, tenantId) => {
  try {
    const response = await api.delete(
      `/sections/${id}`,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};