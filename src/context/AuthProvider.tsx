import type React from "react";
import { useEffect, useState } from "react";
import type { AccessType, AuthSession, User } from "../types";
import { AuthContext } from "./AuthContext";
import { me } from "../api/auth";

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
      const token = localStorage.getItem("token");
      if (!token) return;

      setToken(token);

      const currentAuth = await me();
      setUser(currentAuth.user);
      setAccessType(currentAuth.accessType);
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
