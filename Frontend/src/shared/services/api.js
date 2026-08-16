import axios from "axios";
import { getAccessToken } from "../../Auth/services/tokenStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_LOCAL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach Authorization header if access token is available
api.interceptors.request.use((config) => {
  try {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore
  }

  try {
    const tenantId = localStorage.getItem("currentTenantId");
    if (tenantId) {
      config.headers = config.headers || {};
      config.headers["X-Tenant-Id"] = tenantId;
      config.headers["x-tenant-id"] = tenantId;
    }
  } catch (err) {
    // ignore localStorage failures
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Something went wrong";

    error.message = message;

    return Promise.reject(error);
  }
);

export default api;