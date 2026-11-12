'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';

type DraftApplication = { id: string; name: string; description: string; template: string };

const templates = [
  { id: 'blank', name: 'Blank application', description: 'Start with a clean canvas.', icon: '＋' },
  { id: 'operations', name: 'Operations dashboard', description: 'Manage processes, teams and records.', icon: '▦' },
  { id: 'crm', name: 'Customer management', description: 'Organise customers and sales activity.', icon: '◎' },
];

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, tenants, isLoading, refreshSession } = useAuth();
  const [applications, setApplications] = useState<DraftApplication[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('blank');

  useEffect(() => {
    if (!user) void refreshSession().then((authenticated) => { if (!authenticated) router.replace('/login'); });
  }, [user, refreshSession, router]);

  function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setApplications((current) => [{ id: crypto.randomUUID(), name: trimmedName, description: description.trim(), template }, ...current]);
    setName('');
    setDescription('');
    setTemplate('blank');
    setIsCreating(false);
  }

  if (!user) return <main className="app-loading page-shell"><span className="brand-mark">P</span><p>{isLoading ? 'Restoring your session…' : 'Opening your workspace…'}</p></main>;

  const tenant = tenants[0];
  const greeting = user.displayName || user.email;

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>PanelForge</span></Link>
        <div className="sidebar-workspace">
          <span className="workspace-avatar">{tenant?.name?.slice(0, 1).toUpperCase() ?? 'W'}</span>
          <span><strong>{tenant?.name ?? 'Your workspace'}</strong><small>{tenant?.role ?? 'Member'}</small></span>
          <span className="workspace-chevron">⌄</span>
        </div>
        <p className="sidebar-label">WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <Link className="sidebar-link" href="/app"><span>▦</span> Overview</Link>
          <Link className="sidebar-link sidebar-link--active" href="/applications" aria-current="page"><span>◫</span> Applications</Link>
          <a className="sidebar-link sidebar-link--disabled" href="#data-sources"><span>⌘</span> Data sources <span className="pf-badge">Coming soon</span></a>
          <a className="sidebar-link sidebar-link--disabled" href="#members"><span>♧</span> Members <span className="pf-badge">Coming soon</span></a>
        </nav>
        <div className="sidebar-bottom">
          <p className="sidebar-label">ACCOUNT</p>
          <div className="account-mini"><span className="user-avatar">{greeting.slice(0, 1).toUpperCase()}</span><span><strong>{greeting}</strong><small>{user.email}</small></span></div>
        </div>
      </aside>
      <section className="app-main">
        <header className="app-topbar">
          <div><Link className="breadcrumb-muted" href="/app">Workspace</Link><span className="breadcrumb-divider">/</span><strong>Applications</strong></div>
          <div className="app-top-actions"><span className="topbar-user">{user.email}</span><ThemeToggle /></div>
        </header>
        <div className="dashboard-content">
          <div className="applications-heading">
            <div><p className="eyebrow">YOUR WORKSPACE</p><h1>Applications <span>library.</span></h1><p>Build and organise the admin experiences your team relies on.</p></div>
            <button className="pf-button pf-button--primary" type="button" onClick={() => setIsCreating(true)}>＋ New application</button>
          </div>
          <div className="applications-toolbar"><div><strong>{applications.length}</strong> {applications.length === 1 ? 'application' : 'applications'} <span>·</span> {tenant?.name ?? 'Workspace'}</div><span className="pf-badge pf-badge--info">Draft workspace</span></div>
          {applications.length === 0 ? (
            <section className="applications-empty">
              <div className="empty-illustration"><span>◫</span><i /><b /></div>
              <p className="eyebrow">A CLEAN CANVAS</p>
              <h2>Your first application starts here.</h2>
              <p>Create an application for inventory, customer management, operations or any workflow your team needs. You can shape its data and interface as you go.</p>
              <button className="pf-button pf-button--primary" type="button" onClick={() => setIsCreating(true)}>Create your first application <span aria-hidden="true">→</span></button>
            </section>
          ) : (
            <div className="application-card-grid">{applications.map((application) => (
              <article className="application-card" key={application.id}>
                <div className="application-card-top"><span className="application-icon">◫</span><span className="pf-badge pf-badge--warning">Draft</span></div>
                <h2>{application.name}</h2><p>{application.description || 'No description added yet.'}</p>
                <div className="application-card-meta"><span>{templates.find((item) => item.id === application.template)?.name}</span><span>Created just now</span></div>
                <button className="pf-button pf-button--ghost pf-button--sm" type="button" disabled>Open builder <span aria-hidden="true">→</span></button>
              </article>
            ))}</div>
          )}
          <p className="prototype-note"><strong>Early access:</strong> this first builder milestone previews the application creation experience. Drafts currently live in this page session; database persistence and the visual builder arrive in the next batches.</p>
          <footer className="dashboard-footer">PanelForge <span>·</span> Your workspace, your applications, your rules.</footer>
        </div>
      </section>
      {isCreating && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreating(false); }}>
          <section className="application-modal" role="dialog" aria-modal="true" aria-labelledby="create-application-title">
            <div className="application-modal-heading"><div><p className="eyebrow">NEW PROJECT</p><h2 id="create-application-title">Create an application</h2><p>Give your admin panel a name and choose a starting point.</p></div><button className="modal-close" type="button" aria-label="Close" onClick={() => setIsCreating(false)}>×</button></div>
            <form onSubmit={createDraft}>
              <label className="pf-field"><span className="pf-label">Application name</span><input className="pf-input" autoFocus required maxLength={80} placeholder="e.g. Inventory manager" value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label className="pf-field"><span className="pf-label">Description <span className="optional-label">Optional</span></span><textarea className="pf-input application-textarea" maxLength={240} placeholder="What will this application help your team manage?" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              <fieldset className="template-picker"><legend className="pf-label">Choose a starting point</legend>{templates.map((item) => <button className={template === item.id ? 'template-option template-option--selected' : 'template-option'} type="button" key={item.id} onClick={() => setTemplate(item.id)}><span className="template-option-icon">{item.icon}</span><span><strong>{item.name}</strong><small>{item.description}</small></span><span className="template-radio" aria-hidden="true">{template === item.id ? '●' : '○'}</span></button>)}</fieldset>
              <div className="application-modal-actions"><button className="pf-button pf-button--ghost" type="button" onClick={() => setIsCreating(false)}>Cancel</button><button className="pf-button pf-button--primary" type="submit">Create draft <span aria-hidden="true">→</span></button></div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
