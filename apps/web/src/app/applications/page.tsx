'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';

type Application = { id: string; name: string; description: string | null; template: string; status: 'DRAFT' | 'ARCHIVED'; createdAt: string; updatedAt: string };
const templates = [
  { id: 'blank', name: 'Blank application', description: 'Start with a clean canvas.', icon: '＋' },
  { id: 'operations', name: 'Operations dashboard', description: 'Manage processes, teams and records.', icon: '▦' },
  { id: 'crm', name: 'Customer management', description: 'Organise customers and sales activity.', icon: '◎' },
];

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, tenants, accessToken, isLoading, refreshSession } = useAuth();
  const tenant = tenants[0];
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('blank');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadApplications = useCallback(async () => {
    if (!tenant || !accessToken) return;
    setIsLoadingApplications(true);
    setError('');
    try {
      const response = await fetch(`/api/v1/tenants/${tenant.id}/applications`, {
        headers: { Authorization: `Bearer ${accessToken}` }, credentials: 'include', cache: 'no-store',
      });
      if (!response.ok) throw new Error('Could not load applications. Please try again.');
      setApplications(await response.json() as Application[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load applications.');
    } finally {
      setIsLoadingApplications(false);
    }
  }, [tenant, accessToken]);

  useEffect(() => {
    if (!user) void refreshSession().then((authenticated) => { if (!authenticated) router.replace('/login'); });
  }, [user, refreshSession, router]);

  useEffect(() => {
    if (!user || !accessToken || !tenant) return;

    // Defer the request so its loading/error state updates happen outside the effect body.
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) return loadApplications();
      return undefined;
    });

    return () => {
      cancelled = true;
    };
  }, [user, accessToken, tenant, loadApplications]);

  async function createApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tenant || !accessToken || !name.trim()) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/v1/tenants/${tenant.id}/applications`, {
        method: 'POST', credentials: 'include',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), template }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
        throw new Error(Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message || 'Could not create application.');
      }
      const created = await response.json() as Application;
      setApplications((current) => [created, ...current]);
      setName(''); setDescription(''); setTemplate('blank'); setIsCreating(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create application.');
    } finally {
      setIsSaving(false);
    }
  }

  async function archiveApplication(applicationId: string) {
    if (!tenant || !accessToken || !window.confirm('Archive this application?')) return;
    setError('');
    try {
      const response = await fetch(`/api/v1/tenants/${tenant.id}/applications/${applicationId}`, {
        method: 'DELETE', credentials: 'include', headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error('Could not archive this application.');
      setApplications((current) => current.filter((application) => application.id !== applicationId));
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Could not archive application.');
    }
  }

  if (!user) return <main className="app-loading page-shell"><span className="brand-mark">P</span><p>{isLoading ? 'Restoring your session…' : 'Opening your workspace…'}</p></main>;
  const greeting = user.displayName || user.email;
  const canManage = tenant?.role === 'OWNER' || tenant?.role === 'ADMIN';

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>PanelForge</span></Link>
        <div className="sidebar-workspace"><span className="workspace-avatar">{tenant?.name?.slice(0, 1).toUpperCase() ?? 'W'}</span><span><strong>{tenant?.name ?? 'Your workspace'}</strong><small>{tenant?.role ?? 'Member'}</small></span><span className="workspace-chevron">⌄</span></div>
        <p className="sidebar-label">WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <Link className="sidebar-link" href="/app"><span>▦</span> Overview</Link>
          <Link className="sidebar-link sidebar-link--active" href="/applications" aria-current="page"><span>◫</span> Applications</Link>
          <a className="sidebar-link sidebar-link--disabled" href="#data-sources"><span>⌘</span> Data sources <span className="pf-badge">Coming soon</span></a>
          <a className="sidebar-link" href="/members"><span>♧</span> Members <span className="pf-badge">Coming soon</span></a>
        </nav>
        <div className="sidebar-bottom"><p className="sidebar-label">ACCOUNT</p><div className="account-mini"><span className="user-avatar">{greeting.slice(0, 1).toUpperCase()}</span><span><strong>{greeting}</strong><small>{user.email}</small></span></div></div>
      </aside>
      <section className="app-main">
        <header className="app-topbar"><div><Link className="breadcrumb-muted" href="/app">Workspace</Link><span className="breadcrumb-divider">/</span><strong>Applications</strong></div><div className="app-top-actions"><span className="topbar-user">{user.email}</span><ThemeToggle /></div></header>
        <div className="dashboard-content">
          <div className="applications-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>Applications <span>library.</span></h1><p>Build and organise the admin experiences your team relies on.</p></div>{canManage && <button className="pf-button pf-button--primary" type="button" onClick={() => setIsCreating(true)}>＋ New application</button>}</div>
          <div className="applications-toolbar"><div><strong>{applications.length}</strong> {applications.length === 1 ? 'application' : 'applications'} <span>·</span> {tenant?.name ?? 'Workspace'}</div><span className="pf-badge pf-badge--info">Saved to workspace</span></div>
          {error && <p className="application-error" role="alert">{error}</p>}
          {isLoadingApplications ? <section className="applications-empty"><p>Loading your applications…</p></section> : applications.length === 0 ? (
            <section className="applications-empty"><div className="empty-illustration"><span>◫</span><i /><b /></div><p className="eyebrow">A CLEAN CANVAS</p><h2>Your first application starts here.</h2><p>Create an application for inventory, customer management, operations or any workflow your team needs. Your work is saved to this workspace.</p><button className="pf-button pf-button--primary" type="button" onClick={() => setIsCreating(true)}>Create your first application <span aria-hidden="true">→</span></button></section>
          ) : (
            <div className="application-card-grid">{applications.map((application) => (
              <article className="application-card" key={application.id}>
                <div className="application-card-top"><span className="application-icon">◫</span><span className="pf-badge pf-badge--warning">Draft</span></div>
                <h2>{application.name}</h2><p>{application.description || 'No description added yet.'}</p>
                <div className="application-card-meta"><span>{templates.find((item) => item.id === application.template)?.name ?? 'Custom application'}</span><span>Created {new Date(application.createdAt).toLocaleDateString()}</span></div>
                <div className="application-card-actions">
                  <Link className="pf-button pf-button--primary pf-button--sm" href={'/applications/' + application.id + '/builder'}>Open builder <span aria-hidden="true">→</span></Link>
                  <Link className="pf-button pf-button--ghost pf-button--sm" href={`/applications/${application.id}/resources`}>Manage data <span aria-hidden="true">→</span></Link>
                  <Link className="pf-button pf-button--ghost pf-button--sm" href={`/applications/${application.id}/run`}>Run preview <span aria-hidden="true">→</span></Link>
                </div>
                {canManage && <button className="application-archive" type="button" onClick={() => void archiveApplication(application.id)}>Archive</button>}
              </article>
            ))}</div>
          )}
          <footer className="dashboard-footer">PanelForge <span>·</span> Your workspace, your applications, your rules.</footer>
        </div>
      </section>
      {isCreating && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) setIsCreating(false); }}>
        <section className="application-modal" role="dialog" aria-modal="true" aria-labelledby="create-application-title">
          <div className="application-modal-heading"><div><p className="eyebrow">NEW PROJECT</p><h2 id="create-application-title">Create an application</h2><p>Give your admin panel a name and choose a starting point.</p></div><button className="modal-close" type="button" aria-label="Close" onClick={() => setIsCreating(false)}>×</button></div>
          <form onSubmit={createApplication}>
            <label className="pf-field"><span className="pf-label">Application name</span><input className="pf-input" autoFocus required maxLength={80} placeholder="e.g. Inventory manager" value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label className="pf-field"><span className="pf-label">Description <span className="optional-label">Optional</span></span><textarea className="pf-input application-textarea" maxLength={240} placeholder="What will this application help your team manage?" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
            <fieldset className="template-picker"><legend className="pf-label">Choose a starting point</legend>{templates.map((item) => <button className={template === item.id ? 'template-option template-option--selected' : 'template-option'} type="button" key={item.id} onClick={() => setTemplate(item.id)}><span className="template-option-icon">{item.icon}</span><span><strong>{item.name}</strong><small>{item.description}</small></span><span className="template-radio" aria-hidden="true">{template === item.id ? '●' : '○'}</span></button>)}</fieldset>
            <div className="application-modal-actions"><button className="pf-button pf-button--ghost" type="button" disabled={isSaving} onClick={() => setIsCreating(false)}>Cancel</button><button className="pf-button pf-button--primary" type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Create application'} <span aria-hidden="true">→</span></button></div>
          </form>
        </section>
      </div>}
    </main>
  );
}