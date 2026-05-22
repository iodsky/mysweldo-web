import axios from "axios";
import type { AccessToken, ApiError, ApiResponse } from "@/types";

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
    if (!originalRequest) return Promise.reject(error);

    // Prevent infinite refresh loops - don't retry refresh endpoint itself
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/logout") ||
      originalRequest.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
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
    const data = error.response?.data;

    if (
      typeof data === "object" &&
      typeof data.message === "string" &&
      typeof data.status === "number"
    ) {
      return Promise.reject(data);
    }

    // fallback: normalize unknown error into ApiError
    return Promise.reject<ApiError>({
      timestamp: new Date().toISOString(),
      status: error.response?.status ?? 0,
      message: error.message || "Unexpected error",
    });
  },
);

export default client;
