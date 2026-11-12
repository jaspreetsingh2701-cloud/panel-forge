'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AppDashboardPage() {
  const router = useRouter();
  const { user, tenants, isLoading, refreshSession, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      void refreshSession().then(authenticated => {
        if (!authenticated) router.replace('/login');
      });
    }
  }, [user, refreshSession, router]);

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  if (!user) {
    return <main className="app-loading page-shell"><span className="brand-mark">P</span><p>{isLoading ? 'Restoring your session…' : 'Opening your workspace…'}</p></main>;
  }

  const activeTenant = tenants[0];
  const greeting = user.displayName?.trim() || user.email.split('@')[0];

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>PanelForge</span></Link>
        <div className="sidebar-workspace"><span className="workspace-avatar">{activeTenant?.name?.slice(0, 1).toUpperCase() ?? 'W'}</span><span><strong>{activeTenant?.name ?? 'Your workspace'}</strong><small>{activeTenant?.role ?? 'Member'}</small></span><span className="workspace-chevron">⌄</span></div>
        <p className="sidebar-label">WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <a className="sidebar-link sidebar-link--active" href="/app"><span>▦</span> Overview</a>
          <a className="sidebar-link sidebar-link--disabled" href="#applications"><span>◫</span> Applications <Badge>Coming soon</Badge></a>
          <a className="sidebar-link sidebar-link--disabled" href="#data-sources"><span>⌘</span> Data sources <Badge>Coming soon</Badge></a>
          <a className="sidebar-link sidebar-link--disabled" href="#members"><span>♧</span> Members <Badge>Coming soon</Badge></a>
        </nav>
        <div className="sidebar-bottom"><p className="sidebar-label">ACCOUNT</p><div className="account-mini"><span className="user-avatar">{greeting.slice(0, 1).toUpperCase()}</span><span><strong>{greeting}</strong><small>{user.email}</small></span></div><Button variant="ghost" size="sm" className="signout-button" onClick={handleLogout}>Sign out ↗</Button></div>
      </aside>
      <section className="app-main">
        <header className="app-topbar"><div><span className="breadcrumb-muted">Workspace</span><span className="breadcrumb-divider">/</span><strong>Overview</strong></div><div className="app-top-actions"><span className="topbar-user">{user.email}</span><ThemeToggle /></div></header>
        <div className="dashboard-content">
          <div className="dashboard-welcome"><div><p className="eyebrow">WORKSPACE OVERVIEW</p><h1>Good to have you here, <span>{greeting.split(' ')[0]}.</span></h1><p>Here's the starting point for your team's admin applications.</p></div><Badge tone="success">Workspace active</Badge></div>
          <div className="metric-grid">
            <article className="metric-card"><span className="metric-icon">▦</span><span className="metric-label">Applications</span><strong>0</strong><small>Ready when you are</small></article>
            <article className="metric-card"><span className="metric-icon metric-icon--cyan">⌘</span><span className="metric-label">Data sources</span><strong>0</strong><small>No connections yet</small></article>
            <article className="metric-card"><span className="metric-icon metric-icon--green">♧</span><span className="metric-label">Workspace members</span><strong>{tenants.length ? '1' : '0'}</strong><small>You're the first one here</small></article>
          </div>
          <section className="empty-app-card" id="applications"><div className="empty-illustration"><span>▦</span><i /><b /></div><p className="eyebrow">YOUR FIRST APPLICATION</p><h2>Your workspace is ready for its first build.</h2><p>Connect a data source, shape your resources and create an admin experience that fits the way your team works.</p><Button size="lg" disabled>Create your first application <span aria-hidden="true">→</span></Button><small>Application builder is coming in the next milestone.</small></section>
          <footer className="dashboard-footer">PanelForge <span>·</span> Building the foundation, one layer at a time.</footer>
        </div>
      </section>
    </main>
  );
}
