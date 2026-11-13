'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AppDashboardPage() {
  const router = useRouter();
  const { user, tenants, accessToken, isLoading, refreshSession, logout } = useAuth();
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      void refreshSession().then((authenticated) => {
        if (!authenticated) router.replace('/login');
      });
    }
  }, [user, refreshSession, router]);

  useEffect(() => {
    const tenant = tenants[0];
    if (!user || !tenant || !accessToken) return;

    let cancelled = false;
    void fetch('/api/v1/tenants/' + tenant.id + '/applications', {
      headers: { Authorization: 'Bearer ' + accessToken },
      credentials: 'include',
      cache: 'no-store',
    }).then(async (response) => {
      if (!response.ok) throw new Error('Could not load application count.');
      return response.json() as Promise<unknown>;
    }).then((applications) => {
      if (!cancelled) setApplicationsCount(Array.isArray(applications) ? applications.length : 0);
    }).catch(() => {
      if (!cancelled) setApplicationsCount(null);
    });

    return () => { cancelled = true; };
  }, [user, tenants, accessToken]);

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  if (!user) {
    return (
      <main className="app-loading page-shell">
        <span className="brand-mark">P</span>
        <p>{isLoading ? 'Restoring your session…' : 'Opening your workspace…'}</p>
      </main>
    );
  }

  const activeTenant = tenants[0];
  const greeting = user.displayName?.trim() || user.email.split('@')[0];
  const isSuperAdmin = user.platformRole === 'SUPER_ADMIN';

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">P</span>
          <span>PanelForge</span>
        </Link>
        <div className="sidebar-workspace">
          <span className="workspace-avatar">
            {activeTenant?.name?.slice(0, 1).toUpperCase() ?? 'W'}
          </span>
          <span>
            <strong>{activeTenant?.name ?? 'Your workspace'}</strong>
            <small>{activeTenant?.role ?? 'Member'}</small>
          </span>
          <span className="workspace-chevron">⌄</span>
        </div>
        <p className="sidebar-label">WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <a className="sidebar-link sidebar-link--active" href="/app">
            <span>▦</span> Overview
          </a>
          <Link className="sidebar-link" href="/applications">
            <span>◫</span> Applications
          </Link>
          <a className="sidebar-link sidebar-link--disabled" href="#data-sources">
            <span>⌘</span> Data sources <Badge>Coming soon</Badge>
          </a>
          <a className="sidebar-link" href="/members">
            <span>♧</span> Members <Badge>Coming soon</Badge>
          </a>
        </nav>
        {isSuperAdmin && <><p className="sidebar-label">PLATFORM</p><nav className="sidebar-nav" aria-label="Platform administration"><Link className="sidebar-link" href="/platform/docs"><span>▤</span> Documentation</Link><Link className="sidebar-link" href="/platform/api-reference"><span>⌘</span> API Reference</Link></nav></>}
        <div className="sidebar-bottom">
          <p className="sidebar-label">ACCOUNT</p>
          <div className="account-mini">
            <span className="user-avatar">{greeting.slice(0, 1).toUpperCase()}</span>
            <span>
              <strong>{greeting}</strong>
              <small>{user.email}</small>
            </span>
          </div>
          <Button variant="ghost" size="sm" className="signout-button" onClick={handleLogout}>
            Sign out ↗
          </Button>
        </div>
      </aside>
      <section className="app-main">
        <header className="app-topbar">
          <div>
            <span className="breadcrumb-muted">Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Overview</strong>
          </div>
          <div className="app-top-actions">
            <span className="topbar-user">{user.email}</span>
            <ThemeToggle />
          </div>
        </header>
        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <div>
              <p className="eyebrow">WORKSPACE OVERVIEW</p>
              <h1>
                Good to have you here, <span>{greeting.split(' ')[0]}.</span>
              </h1>
              <p>Here&apos;s the starting point for your team&apos;s admin applications.</p>
            </div>
            <Badge tone="success">Workspace active</Badge>
          </div>
          <div className="metric-grid">
            <article className="metric-card">
              <span className="metric-icon">▦</span>
              <span className="metric-label">Applications</span>
              <strong>{applicationsCount === null ? '—' : applicationsCount}</strong>
              <small>{applicationsCount === 1 ? '1 application in this workspace' : applicationsCount === null ? 'Application count unavailable' : applicationsCount + ' applications in this workspace'}</small>
            </article>
            <article className="metric-card">
              <span className="metric-icon metric-icon--cyan">⌘</span>
              <span className="metric-label">Data sources</span>
              <strong>0</strong>
              <small>No connections yet</small>
            </article>
            <article className="metric-card">
              <span className="metric-icon metric-icon--green">♧</span>
              <span className="metric-label">Workspace members</span>
              <strong>{tenants.length ? '1' : '0'}</strong>
              <small>You&apos;re the first one here</small>
            </article>
          </div>
          <section className="empty-app-card" id="applications">
            <div className="empty-illustration">
              <span>▦</span>
              <i />
              <b />
            </div>
            {applicationsCount === 0 ? (
              <>
                <p className="eyebrow">YOUR FIRST APPLICATION</p>
                <h2>Your workspace is ready for its first build.</h2>
                <p>
                  Create an application, define its resources and build an admin experience that fits
                  the way your team works.
                </p>
                <Link className="pf-button pf-button--primary" href="/applications">
                  Explore applications <span aria-hidden="true">→</span>
                </Link>
                <small>Start by creating an application in your workspace.</small>
              </>
            ) : (
              <>
                <p className="eyebrow">YOUR WORKSPACE</p>
                <h2>Your applications are ready.</h2>
                <p>
                  {applicationsCount === null
                    ? 'Open your application library to view and manage your workspace applications.'
                    : 'You have ' + applicationsCount + (applicationsCount === 1 ? ' application' : ' applications') + ' in this workspace. Continue building or manage your application data.'}
                </p>
                <Link className="pf-button pf-button--primary" href="/applications">
                  View applications <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </section>
          <footer className="dashboard-footer">
            PanelForge <span>·</span> Building the foundation, one layer at a time.
          </footer>
        </div>
      </section>
    </main>
  );
}
