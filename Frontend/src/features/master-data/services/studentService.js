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

export const createStudent = async (payload, tenantId) => {
  try {
    const response = await api.post(
      "/students",
      payload,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getStudents = async (tenantIdOrFilters = {}, maybeFilters = {}) => {
  const tenantId =
    typeof tenantIdOrFilters === "string" ? tenantIdOrFilters : null;
  const filters =
    typeof tenantIdOrFilters === "object" && tenantIdOrFilters !== null
      ? tenantIdOrFilters
      : maybeFilters;

  try {
    const response = await api.get(
      "/students",
      tenantConfig(tenantId, { params: filters })
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getStudentById = async (id, tenantId) => {
  try {
    const response = await api.get(
      `/students/${id}`,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const updateStudent = async (id, payload, tenantId) => {
  try {
    const response = await api.put(
      `/students/${id}`,
      payload,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const deleteStudent = async (id, tenantId) => {
  try {
    const response = await api.delete(
      `/students/${id}`,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};

export const getDepartmentStudents = async (departmentId, tenantId) => {
  try {
    const response = await api.get(
      `/students/department/${departmentId}`,
      tenantConfig(tenantId)
    );
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message);
  }
};