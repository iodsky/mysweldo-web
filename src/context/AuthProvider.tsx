import type React from "react";
import { useEffect, useState } from "react";
import type {
  AccessToken,
  AccessType,
  ApiResponse,
  AuthSession,
  User,
} from "../types";
import { AuthContext } from "./AuthContext";
import { me } from "../api/auth";
import client from "../api/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [accessType, setAccessType] = useState<AccessType | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const setAuth = (auth: AuthSession) => {
    localStorage.setItem("token", auth.token);
    setUser(auth.user);
    setToken(auth.token);
    setAccessType(auth.accessType);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setAccessType(null);
  };

  const initializeAuth = async () => {
    try {
      let accessToken = localStorage.getItem("token");

      if (!accessToken) {
        const refreshResponse =
          await client.post<ApiResponse<AccessToken>>("/auth/refresh");
        accessToken = refreshResponse.data.data.token ?? null;

        if (accessToken) {
          localStorage.setItem("token", accessToken);
          setToken(accessToken);
        }
      } else {
        setToken(accessToken);
      }

      if (!accessToken) {
        clearAuth();
        return;
      }

      const { data } = await me();
      setUser(data.user);
      setAccessType(data.accessType);
    } catch (error) {
      console.error("Auth initialization failed:", error);
      clearAuth();
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const value = {
    user,
    token,
    accessType,
    isAuthenticated: !!token,
    isInitializing,
    setAuth,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
