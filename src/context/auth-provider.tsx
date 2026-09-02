import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { AccessType, AuthSession, User } from "../types";
import { AuthContext } from "./auth-context";
import { getAuthenticatedUser } from "@/api/generated/endpoints/authentication/authentication";
import { refreshAccessToken } from "@/api/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessType, setAccessType] = useState<AccessType | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const initialized = useRef(false);

  const setAuth = (auth: AuthSession) => {
    setUser(auth.user ?? null);
    setAccessType(auth.accessType ?? null);
  };

  const clearAuth = () => {
    setUser(null);
    setAccessType(null);
  };

  const initializeAuth = async () => {
    try {
      // The refresh token (and access token) live in httpOnly cookies, so we
      // silently refresh on every page load and then fetch the current user.
      await refreshAccessToken();

      const response = await getAuthenticatedUser();
      const auth = response.data;
      if (auth) {
        setUser(auth.user ?? null);
        setAccessType(auth.accessType ?? null);
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      clearAuth();
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    // StrictMode double-invokes effects in dev; guard so refresh/me run once.
    if (initialized.current) return;
    initialized.current = true;
    initializeAuth();
  }, []);

  const value = {
    user,
    accessType,
    isAuthenticated: !!user,
    isInitializing,
    setAuth,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}