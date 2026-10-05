"use client";

import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import {
  AUTH_TOKEN_CHANGED_EVENT,
  authTokenStorage,
} from "@/endpoint/appAxios";
import { AuthUser } from "@/interface/auth";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
};

type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

type AuthContextValue = AuthState & {
  restoreSession: () => Promise<void>;
  setAuthenticatedSession: (session: AuthSession) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const setAuthenticatedSession = useCallback((session: AuthSession) => {
    authTokenStorage.setAccessToken(session.accessToken);
    setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  const clearSession = useCallback(() => {
    authTokenStorage.clearAccessToken();
    setAccessToken(null);
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    setIsInitializing(true);

    try {
      const response = await financeAPI.refreshSession();

      if (response.code === RESPONSE_CODES.success && response.data?.user) {
        setAuthenticatedSession({
          accessToken: response.data.accessToken,
          user: response.data.user,
        });
      } else if (response.code === RESPONSE_CODES.unauthenticated) {
        clearSession();
      } else {
        setAccessToken(authTokenStorage.getAccessToken());
      }
    } catch {
      setAccessToken(authTokenStorage.getAccessToken());
    } finally {
      setIsInitializing(false);
    }
  }, [clearSession, setAuthenticatedSession]);

  const logout = useCallback(async () => {
    try {
      await Promise.race([
        financeAPI.logout(),
        new Promise<never>((_, reject) => {
          window.setTimeout(
            () => reject(new Error("Logout request timed out")),
            5_000,
          );
        }),
      ]);
    } catch (error) {
      // The local session must still be cleared if the server is unavailable.
      console.warn("Logout request failed; clearing local session", error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleTokenChange = (event: Event) => {
      const nextAccessToken = (event as CustomEvent<{ accessToken: string | null }>)
        .detail.accessToken;

      setAccessToken(nextAccessToken);

      if (!nextAccessToken) {
        setUser(null);
      }
    };

    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, handleTokenChange);

    return () => {
      window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, handleTokenChange);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isInitializing,
      restoreSession,
      setAuthenticatedSession,
      logout,
    }),
    [
      accessToken,
      isInitializing,
      logout,
      restoreSession,
      setAuthenticatedSession,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
