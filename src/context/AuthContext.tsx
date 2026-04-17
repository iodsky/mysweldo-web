import { createContext } from "react";
import type { AccessType, AuthSession, User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  accessType: AccessType | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (auth: AuthSession) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  accessType: null,
  isAuthenticated: false,
  isInitializing: true,
  setAuth: () => {},
  clearAuth: () => {},
});
