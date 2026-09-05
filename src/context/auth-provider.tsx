import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import type { AccessType, AuthSession, User } from "../types";
import { AuthContext } from "./auth-context";
import { getAuthenticatedUser } from "@/api/generated/endpoints/authentication/authentication";
import { refreshAccessToken, setOnSessionExpired } from "@/api/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessType, setAccessType] = useState<AccessType | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const initialized = useRef(false);
  const queryClient = useQueryClient();

  const setAuth = useCallback((auth: AuthSession) => {
    setUser(auth.user ?? null);
    setAccessType(auth.accessType ?? null);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessType(null);
  }, []);

  const handleSessionExpired = useCallback(() => {
    clearAuth();
    queryClient.clear();
    notifications.show({
      title: "Session expired",
      message: "Please sign in again to continue.",
      color: "red",
      withBorder: true,
    });
  }, [clearAuth, queryClient]);

  const initializeAuth = useCallback(async () => {
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
  }, [clearAuth]);

  useEffect(() => {
    // StrictMode double-invokes effects in dev; guard so refresh/me run once.
    if (initialized.current) return;
    initialized.current = true;
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const unsubscribe = setOnSessionExpired(handleSessionExpired);
    return unsubscribe;
  }, [handleSessionExpired]);

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