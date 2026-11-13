'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function PlatformApiReferencePage() {
  const router = useRouter();
  const { user, accessToken, refreshSession } = useAuth();
  const [specification, setSpecification] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { void refreshSession().then((ok) => { if (!ok) router.replace('/login'); }); return; }
    if (user.platformRole !== 'SUPER_ADMIN') return;
    if (!accessToken) return;
    void fetch('/api/v1/platform/openapi.json', { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error(response.status === 403 ? 'Super Admin access is required.' : 'Could not load the OpenAPI specification.');
      setSpecification(JSON.stringify(await response.json(), null, 2));
    }).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load API reference.')).finally(() => setLoading(false));
  }, [user, accessToken, refreshSession, router]);
  if (!user) return <main className="app-loading page-shell"><span className="brand-mark">P</span><p>Restoring your session…</p></main>;
  return <main className="app-shell"><aside className="app-sidebar"><Link className="brand" href="/applications"><span className="brand-mark">P</span><span>PanelForge</span></Link><div className="sidebar-workspace"><span className="workspace-avatar">P</span><span><strong>Platform</strong><small>Super Admin</small></span></div><p className="sidebar-label">PLATFORM</p><nav className="sidebar-nav"><Link className="sidebar-link" href="/platform/docs">▤ Documentation</Link><Link className="sidebar-link sidebar-link--active" href="/platform/api-reference">⌘ API Reference</Link><Link className="sidebar-link" href="/applications">← Workspace</Link></nav></aside><section className="app-main"><header className="app-topbar"><div><Link className="breadcrumb-muted" href="/applications">Platform</Link><span className="breadcrumb-divider">/</span><strong>API Reference</strong></div><div className="app-top-actions"><span className="topbar-user">Super Admin</span><ThemeToggle /></div></header><div className="dashboard-content docs-content"><div className="applications-heading"><div><p className="eyebrow">PLATFORM API</p><h1>API <span>reference.</span></h1><p>Authenticated OpenAPI specification for the PanelForge backend.</p></div><span className="pf-badge pf-badge--info">OpenAPI JSON</span></div>{error && <p className="application-error" role="alert">{error}</p>}{user.platformRole !== 'SUPER_ADMIN' ? <section className="applications-empty"><h2>Restricted area</h2><p>{error || 'Super Admin access is required.'}</p></section> : loading ? <p className="quiet-note">Loading API specification…</p> : specification ? <><div className="docs-api-toolbar"><span>GET /api/v1/platform/openapi.json</span><button className="pf-button pf-button--ghost pf-button--sm" type="button" onClick={() => void navigator.clipboard.writeText(specification)}>Copy JSON</button></div><pre className="docs-openapi"><code>{specification}</code></pre></> : null}<footer className="dashboard-footer">PanelForge <span>·</span> API reference</footer></div></section></main>;
}
