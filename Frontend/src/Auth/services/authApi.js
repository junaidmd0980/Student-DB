import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_LOCAL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default authApi;