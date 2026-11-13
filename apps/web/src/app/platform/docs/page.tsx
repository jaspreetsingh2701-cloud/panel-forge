'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { PlatformNavSection } from '@/components/navigation/platform-nav-section';
import { ThemeToggle } from '@/components/theme/theme-toggle';

type DocumentationEntry = { id: string; title: string; category: string; path: string };
type DocumentationFile = DocumentationEntry & { content: string };

function renderMarkdown(source: string): ReactNode[] {
  const lines = source.split(/\r?\n/);
  const output: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] = [];
  let inCode = false;
  const flushParagraph = () => { if (paragraph.length) { output.push(<p key={output.length}>{paragraph.join(' ')}</p>); paragraph = []; } };
  const flushList = () => { if (list.length) { output.push(<ul key={output.length}>{list.map((item, index) => <li key={index}>{item}</li>)}</ul>); list = []; } };
  lines.forEach((line) => {
    if (line.trim().startsWith('```')) { flushParagraph(); flushList(); if (inCode) output.push(<pre key={output.length}><code>{code.join('\n')}</code></pre>); code = []; inCode = !inCode; return; }
    if (inCode) { code.push(line); return; }
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) { flushParagraph(); flushList(); const level = heading[1].length; const text = heading[2]; output.push(level === 1 ? <h1 key={output.length}>{text}</h1> : level === 2 ? <h2 key={output.length}>{text}</h2> : <h3 key={output.length}>{text}</h3>); return; }
    const item = /^\s*[-*+]\s+(.+)$/.exec(line);
    if (item) { flushParagraph(); list.push(item[1]); return; }
    if (!line.trim()) { flushParagraph(); flushList(); return; }
    flushList(); paragraph.push(line.trim());
  });
  flushParagraph(); flushList();
  if (inCode) output.push(<pre key={output.length}><code>{code.join('\n')}</code></pre>);
  return output;
}

export default function PlatformDocumentationPage() {
  const router = useRouter();
  const { user, accessToken, refreshSession } = useAuth();
  const [entries, setEntries] = useState<DocumentationEntry[]>([]);
  const [selected, setSelected] = useState<DocumentationFile | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const isSuperAdmin = user?.platformRole === 'SUPER_ADMIN';

  const loadEntries = useCallback(async (token: string) => {
    const response = await fetch('/api/v1/platform/docs', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
    if (!response.ok) throw new Error(response.status === 403 ? 'Super Admin access is required.' : 'Could not load the documentation catalogue.');
    setEntries(await response.json() as DocumentationEntry[]);
  }, []);

  useEffect(() => {
    if (!user) { void refreshSession().then((ok) => { if (!ok) router.replace('/login'); }); return; }
    if (user.platformRole !== 'SUPER_ADMIN') return;
    if (accessToken) void Promise.resolve().then(() => loadEntries(accessToken)).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unable to load documentation.')).finally(() => setLoading(false));
  }, [user, accessToken, refreshSession, router, loadEntries]);

  const filtered = useMemo(() => entries.filter((entry) => (entry.title + ' ' + entry.path + ' ' + entry.category).toLowerCase().includes(search.toLowerCase())), [entries, search]);

  async function openDocument(entry: DocumentationEntry) {
    if (!accessToken) return;
    setLoadingDocument(true); setError('');
    try {
      const response = await fetch('/api/v1/platform/docs/document?path=' + encodeURIComponent(entry.path), { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store' });
      if (!response.ok) throw new Error(response.status === 403 ? 'Super Admin access is required.' : 'Could not open this document.');
      setSelected(await response.json() as DocumentationFile);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not open document.'); }
    finally { setLoadingDocument(false); }
  }

  if (!user) return <main className="app-loading page-shell"><span className="brand-mark">P</span><p>Restoring your session…</p></main>;
  return <main className="app-shell"><aside className="app-sidebar"><Link className="brand" href="/applications"><span className="brand-mark">P</span><span>PanelForge</span></Link><div className="sidebar-workspace"><span className="workspace-avatar">P</span><span><strong>Platform</strong><small>Super Admin</small></span></div><PlatformNavSection /><nav className="sidebar-nav" aria-label="Workspace navigation"><Link className="sidebar-link" href="/applications">← Workspace</Link></nav><div className="sidebar-bottom"><p className="sidebar-label">ACCOUNT</p><div className="account-mini"><span className="user-avatar">{user.email.slice(0,1).toUpperCase()}</span><span><strong>{user.displayName || user.email}</strong><small>{user.email}</small></span></div></div></aside><section className="app-main"><header className="app-topbar"><div><Link className="breadcrumb-muted" href="/applications">Platform</Link><span className="breadcrumb-divider">/</span><strong>Documentation</strong></div><div className="app-top-actions"><span className="topbar-user">Super Admin</span><ThemeToggle /></div></header><div className="dashboard-content docs-content"><div className="applications-heading"><div><p className="eyebrow">PLATFORM KNOWLEDGE BASE</p><h1>Documentation <span>centre.</span></h1><p>Browse the Markdown guides and engineering documents maintained in this repository.</p></div><span className="pf-badge pf-badge--info">{entries.length} documents</span></div>{error && <p className="application-error" role="alert">{error}</p>}{!isSuperAdmin ? <section className="applications-empty"><h2>Restricted area</h2><p>{error || 'Super Admin access is required.'}</p></section> : <div className="docs-layout"><aside className="docs-catalogue"><input className="pf-input docs-search" placeholder="Search documents…" value={search} onChange={(event) => setSearch(event.target.value)} /><p className="docs-count">{filtered.length} DOCUMENTS</p>{loading ? <p className="quiet-note">Loading catalogue…</p> : filtered.map((entry) => <button className={selected?.id === entry.id ? 'docs-entry docs-entry--active' : 'docs-entry'} key={entry.id} type="button" onClick={() => void openDocument(entry)}><strong>{entry.title}</strong><small>{entry.category} · {entry.path}</small></button>)}</aside><article className="docs-reader">{loadingDocument ? <p className="quiet-note">Opening document…</p> : selected ? <><div className="docs-reader-heading"><div><p className="eyebrow">{selected.category}</p><h2>{selected.title}</h2><small>{selected.path}</small></div><button className="pf-button pf-button--ghost pf-button--sm" type="button" onClick={() => setSelected(null)}>Close</button></div><div className="docs-markdown">{renderMarkdown(selected.content)}</div></> : <div className="docs-reader-empty"><span>▤</span><h2>Select a document</h2><p>Choose a file from the catalogue to read it here.</p></div>}</article></div>}<footer className="dashboard-footer">PanelForge <span>·</span> Platform documentation</footer></div></section></main>;
}
