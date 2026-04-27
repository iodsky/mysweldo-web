import axios from "axios";
import type { AccessToken, ApiResponse } from "../types";
const baseURL = import.meta.env.VITE_API_BASE_URL;
const client = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken && accessToken !== "undefined" && accessToken !== "null") {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const originalRequest = error.config;
    // Prevent infinite refresh loops - don't retry refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        // The refreshToken is sent automatically as an httpOnly cookie.
        const { data } =
          await client.post<ApiResponse<AccessToken>>("/auth/refresh");
        const accessToken = data.data.token;
        localStorage.setItem("token", accessToken);
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return client(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("token");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default client;
