import React, { createContext, useContext, useEffect, useState } from "react";
import {
  findDemoAccount,
  getStoredDemoUser,
  setStoredDemoUser,
  clearDemoStorage,
} from "./demoAuth";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: "job_seeker" | "employer" | "admin";
  avatarUrl?: string;
  emailVerified?: boolean;
};

interface AuthContextType {
  user: AppUser | null;
  session: null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string; role?: AppUser["role"] }>;
  signUpWithPassword: (
    email: string,
    password: string,
    name: string,
    role: "job_seeker" | "employer",
    linkedinUrl?: string,
  ) => Promise<{ error?: string; needsVerification?: boolean; devVerificationLink?: string }>;
  logout: () => Promise<void>;
  updateRole: (role: string) => void;
  login: (token: string, user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_KEY = "bridgepath_user_role";
const NAME_KEY = "bridgepath_user_name";
export const TOKEN_KEY = "bridgepath_token";
const USER_KEY = "bridgepath_user";
const API_BASE = "/api";

/** Returns the stored auth token, or null if absent/expired. */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Returns Authorization headers for fetch calls, or empty object for demo/unauthenticated users. */
export function buildAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Lightweight client-side check: parse the issuedAt timestamp from the base64url token
 * (format: base64url(userId:issuedAt:hmacSig)) and return true if the token is past its
 * 90-day TTL. Cannot verify the HMAC — server is authoritative — but avoids pointless
 * API calls with obviously stale sessions.
 */
function isClientTokenExpired(token: string): boolean {
  try {
    // base64url → base64 → string
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(b64);
    const parts = decoded.split(":");
    // parts: [userId, issuedAt, ...hmacHex (may contain colons)]
    if (parts.length < 3) return true;
    const issuedAt = parseInt(parts[1], 10);
    if (isNaN(issuedAt)) return true;
    const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000;
    return Date.now() - issuedAt > TOKEN_TTL_MS;
  } catch {
    return true; // treat unparseable tokens as expired
  }
}

function getStoredUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}

function setStoredUser(user: AppUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const demoUser = getStoredDemoUser();
    if (demoUser) {
      setUser(demoUser);
      setIsLoading(false);
      return;
    }
    const stored = getStoredUser();
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (stored && storedToken) {
      if (isClientTokenExpired(storedToken)) {
        // Token is past its 90-day TTL — clear session silently
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ROLE_KEY);
        localStorage.removeItem(NAME_KEY);
      } else {
        setUser(stored);
      }
    }
    setIsLoading(false);
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    const demoUser = findDemoAccount(email, password);
    if (demoUser) {
      setStoredDemoUser(demoUser);
      localStorage.setItem(ROLE_KEY, demoUser.role);
      localStorage.setItem(NAME_KEY, demoUser.name);
      setUser(demoUser);
      return { role: demoUser.role };
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "EmailNotVerified") {
          return { error: `EmailNotVerified: ${data.message}` };
        }
        return { error: data.message ?? "Login failed" };
      }
      const appUser: AppUser = {
        id: String(data.user.id),
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as AppUser["role"],
        emailVerified: data.user.emailVerified,
      };
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(ROLE_KEY, appUser.role);
      localStorage.setItem(NAME_KEY, appUser.name);
      setStoredUser(appUser);
      setUser(appUser);
      return { role: appUser.role };
    } catch {
      return { error: "Network error. Please try again." };
    }
  };

  const signUpWithPassword = async (
    email: string,
    password: string,
    name: string,
    role: "job_seeker" | "employer",
    linkedinUrl?: string,
  ) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, name: name.trim(), role, linkedinUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.message ?? "Registration failed" };
      }
      if (data.needsVerification) {
        return { needsVerification: true, devVerificationLink: data.devVerificationLink };
      }
      const appUser: AppUser = {
        id: String(data.user.id),
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as AppUser["role"],
        emailVerified: data.user.emailVerified,
      };
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(ROLE_KEY, appUser.role);
      localStorage.setItem(NAME_KEY, appUser.name);
      setStoredUser(appUser);
      setUser(appUser);
      return {};
    } catch {
      return { error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    const wasDemo = !!getStoredDemoUser();
    clearDemoStorage();
    if (!wasDemo) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(NAME_KEY);
    setUser(null);
    window.location.href = "/auth/login";
  };

  const updateRole = (role: string) => {
    localStorage.setItem(ROLE_KEY, role);
    if (user) {
      const updated = { ...user, role: role as AppUser["role"] };
      setUser(updated);
      setStoredUser(updated);
    }
  };

  const login = (token: string, backendUser: any) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (backendUser) {
      const appUser: AppUser = {
        id: String(backendUser.id),
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role as AppUser["role"],
        emailVerified: backendUser.emailVerified,
      };
      localStorage.setItem(ROLE_KEY, appUser.role);
      localStorage.setItem(NAME_KEY, appUser.name);
      setStoredUser(appUser);
      setUser(appUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        isLoading,
        isAuthenticated: !!user,
        signInWithPassword,
        signUpWithPassword,
        logout,
        updateRole,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
