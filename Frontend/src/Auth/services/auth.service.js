import authApi from "./authApi";
import api from "../../shared/services/api.js";

export async function registerUser(userData) {
  const response = await authApi.post("/auth/register", userData);
  return response.data;
}

export async function loginUser(credentials) {
  const response = await authApi.post("/auth/login", credentials);
  return response.data;
}

export async function refreshAccessTokenRequest() {
  const response = await authApi.get("/auth/refresh-token");
  return response.data;
}

export async function getCurrentUser(accessToken) {
  const response = await api.get("/auth/get-me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function logoutUser() {
  const response = await authApi.get("/auth/logout");
  return response.data;
}

export async function logoutAllUsers() {
  const response = await authApi.get("/auth/logout-all");
  return response.data;
}

export async function verifyEmail(email, otp) {
  const response = await authApi.post("/auth/verify-email", {
    email,
    otp,
  });

  return response.data;
}