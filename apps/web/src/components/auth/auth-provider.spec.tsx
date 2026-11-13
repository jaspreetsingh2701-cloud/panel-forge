import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './auth-provider';

describe('AuthProvider session restoration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shares one refresh-token rotation across concurrent callers', async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === '/api/v1/auth/refresh') {
        // Keep the request pending briefly so the second caller joins it.
        await Promise.resolve();
        return {
          ok: true,
          json: async () => ({ accessToken: 'fresh-access-token' }),
        } as Response;
      }

      if (url === '/api/v1/auth/me') {
        return {
          ok: true,
          json: async () => ({
            id: 'user-1',
            email: 'user@example.com',
            displayName: 'PanelForge User',
            emailVerifiedAt: null,
            tenants: [],
          }),
        } as Response;
      }

      if (url === '/api/v1/tenants') {
        return { ok: true, json: async () => [] } as Response;
      }

      throw new Error(`Unexpected request: ${url}`);
    });
    global.fetch = fetchMock;

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    let outcomes: boolean[] = [];
    await act(async () => {
      outcomes = await Promise.all([
        result.current.refreshSession(),
        result.current.refreshSession(),
      ]);
    });

    expect(outcomes).toEqual([true, true]);
    expect(
      fetchMock.mock.calls.filter(([url]) => String(url) === '/api/v1/auth/refresh'),
    ).toHaveLength(1);
    expect(result.current.accessToken).toBe('fresh-access-token');
    expect(result.current.user?.id).toBe('user-1');
  });
});
