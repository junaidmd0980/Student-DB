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

export const createBatch = async (payload, tenantId) => {
  try {
    const response = await api.post("/batches", payload, tenantConfig(tenantId));
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getBatches = async (tenantIdOrParams = {}, maybeParams = {}) => {
  const tenantId =
    typeof tenantIdOrParams === "string" ? tenantIdOrParams : null;
  const params =
    typeof tenantIdOrParams === "object" && tenantIdOrParams !== null
      ? tenantIdOrParams
      : maybeParams;

  try {
    const response = await api.get(
      "/batches",
      tenantConfig(tenantId, { params })
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateBatch = async (id, payload, tenantId) => {
  try {
    const response = await api.put(
      `/batches/${id}`,
      payload,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const deleteBatch = async (id, tenantId) => {
  try {
    const response = await api.delete(
      `/batches/${id}`,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};