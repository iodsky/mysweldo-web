import { createContext } from "react";
import type { AccessType, AuthSession, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  accessType: AccessType | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (auth: AuthSession) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  accessType: null,
  isAuthenticated: false,
  isInitializing: true,
  setAuth: () => {},
  clearAuth: () => {},
});