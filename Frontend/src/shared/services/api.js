import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error?.response?.data?.message || error.message || "Something went wrong";

        return Promise.reject({
            ...error,
            message,
        });
    }
);

export default api;