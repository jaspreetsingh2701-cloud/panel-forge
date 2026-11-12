'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Tenant = { id: string; name: string; slug: string; role: string };
type User = { id: string; email: string; displayName: string | null; emailVerifiedAt: string | null; tenants: Tenant[] };
type AuthContextValue = {
  accessToken: string | null;
  user: User | null;
  tenants: Tenant[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; displayName: string; tenantName: string }) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

async function readError(response: Response): Promise<string> {
  try {
    const payload = await response.json() as { message?: string | string[] };
    if (Array.isArray(payload.message)) return payload.message.join(' ');
    if (payload.message) return payload.message;
  } catch {
    // Use the generic message below for non-JSON responses.
  }
  return response.status === 401 ? 'Your session has expired. Please sign in again.' : 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProfile = useCallback(async (token: string) => {
    const headers = { Authorization: `Bearer ${token}` };
    const [profileResponse, tenantsResponse] = await Promise.all([
      fetch('/api/v1/auth/me', { headers, credentials: 'include', cache: 'no-store' }),
      fetch('/api/v1/tenants', { headers, credentials: 'include', cache: 'no-store' }),
    ]);
    if (!profileResponse.ok) throw new Error(await readError(profileResponse));
    if (!tenantsResponse.ok) throw new Error(await readError(tenantsResponse));
    const profile = await profileResponse.json() as User;
    const tenantList = await tenantsResponse.json() as Tenant[];
    setUser(profile);
    setTenants(tenantList);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const result = await response.json() as { accessToken: string };
      setAccessToken(result.accessToken);
      await loadProfile(result.accessToken);
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  const register = useCallback(async (input: { email: string; password: string; displayName: string; tenantName: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error(await readError(response));
      const result = await response.json() as { accessToken: string };
      setAccessToken(result.accessToken);
      await loadProfile(result.accessToken);
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST', credentials: 'include', cache: 'no-store',
      });
      if (!response.ok) {
        setAccessToken(null);
        setUser(null);
        setTenants([]);
        return false;
      }
      const result = await response.json() as { accessToken: string };
      setAccessToken(result.accessToken);
      await loadProfile(result.accessToken);
      return true;
    } catch {
      setAccessToken(null);
      setUser(null);
      setTenants([]);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  const logout = useCallback(async () => {
    const token = accessToken;
    setAccessToken(null);
    setUser(null);
    setTenants([]);
    if (token) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST', credentials: 'include', headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Local sign-out still completes if the API is unreachable.
      }
    }
  }, [accessToken]);

  const value = useMemo(() => ({
    accessToken, user, tenants, isLoading, login, register, refreshSession, logout,
  }), [accessToken, user, tenants, isLoading, login, register, refreshSession, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
