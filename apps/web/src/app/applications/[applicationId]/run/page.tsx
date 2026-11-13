'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/components/auth/auth-provider';
import { PlatformNavSection } from '@/components/navigation/platform-nav-section';
import type { BuilderComponent } from '@/features/builder/component-registry';

type Application = { id: string; name: string; description: string | null; status: 'DRAFT' | 'ARCHIVED' };
type Resource = { id: string; name: string; key: string; _count?: { records: number; fields: number } };
type ResourceField = { id: string; key: string; name: string; type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT' | 'RELATION'; required: boolean; options: string[] };
type ResourceRecord = { id: string; data: Record<string, unknown>; createdAt: string; updatedAt: string };
type Aggregate = { operation: string; value: number; groups: { label: string; value: number }[]; scanned: number; scanLimit: number };
type ResourceData = { fields: ResourceField[]; records: ResourceRecord[]; aggregate: Aggregate | null };
type BuilderConfiguration = { components: BuilderComponent[]; version: number };

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return new Intl.NumberFormat().format(value);
  return String(value);
}

function RuntimeComponent({ component, data }: { component: BuilderComponent; data?: ResourceData }) {
  const fields = data?.fields ?? [];
  const records = data?.records ?? [];
  const binding = component.dataBinding;
  const hasResource = Boolean(binding?.resourceId);
  if (component.type === 'text') {
    return <article className="runtime-component runtime-text"><p className="runtime-component-type">CONTENT</p><h2>{component.title}</h2><p className="runtime-description">{component.content}</p></article>;
  }
  if (component.type === 'metric') {
    return <article className="runtime-component runtime-metric"><p className="runtime-component-type">METRIC</p><p className="runtime-metric-label">{component.title}</p><strong>{hasResource ? data?.aggregate ? displayValue(data.aggregate.value) : '—' : displayValue(component.content)}</strong><p className="runtime-description">{component.description}</p></article>;
  }
  if (component.type === 'table') {
    const selected = binding?.columns?.length ? binding.columns : fields.map(field => field.key);
    const visibleFields = fields.filter(field => selected.includes(field.key));
    return <article className="runtime-component runtime-table"><p className="runtime-component-type">DATA TABLE</p><h2>{component.title}</h2><p className="runtime-description">{component.description}</p>
      {!hasResource ? <p className="runtime-empty">This table has no connected resource.</p> : !fields.length ? <p className="runtime-empty">No fields are configured for this resource yet.</p> : !records.length ? <p className="runtime-empty">No records to display yet.</p> :
        <div className="runtime-table-scroll"><table><thead><tr>{visibleFields.map(field => <th key={field.id}>{field.name}</th>)}</tr></thead><tbody>{records.map(record => <tr key={record.id}>{visibleFields.map(field => <td key={field.id}>{displayValue(record.data[field.key])}</td>)}</tr>)}</tbody></table></div>}
      {data && <p className="runtime-footnote">Showing {records.length} recent records</p>}
    </article>;
  }
  if (component.type === 'chart') {
    const groups = data?.aggregate?.groups ?? [];
    const maximum = Math.max(1, ...groups.map(group => group.value));
    return <article className="runtime-component runtime-chart"><p className="runtime-component-type">CHART</p><h2>{component.title}</h2><p className="runtime-description">{component.description}</p>
      {!hasResource ? <p className="runtime-empty">This chart has no connected resource.</p> : !data?.aggregate ? <p className="runtime-empty">Chart data is not available. Check the resource and aggregation settings.</p> : groups.length === 0 ? <p className="runtime-empty">No grouped values are available yet.</p> :
        <div className="runtime-bars" role="list" aria-label={component.title}>{groups.map(group => <div className="runtime-bar-row" role="listitem" key={group.label}><span title={group.label}>{group.label}</span><div className="runtime-bar-track"><div className="runtime-bar-fill" style={{ width: Math.max(2, group.value / maximum * 100) + '%' }} /></div><strong>{displayValue(group.value)}</strong></div>)}</div>}
      {data?.aggregate && <p className="runtime-footnote">Calculated from {data.aggregate.scanned} records (limit {data.aggregate.scanLimit})</p>}
    </article>;
  }
  return <article className="runtime-component runtime-form"><p className="runtime-component-type">FORM</p><h2>{component.title}</h2><p className="runtime-description">{component.description}</p>
    {!hasResource ? <p className="runtime-empty">This form has no connected resource.</p> : !fields.length ? <p className="runtime-empty">No fields are configured for this resource yet.</p> :
      <div className="runtime-form-fields">{fields.map(field => <label className="pf-field" key={field.id}><span className="pf-label">{field.name}{field.required ? ' *' : ''}</span>{field.type === 'SELECT' ? <select className="pf-input" disabled defaultValue=""><option value="">Choose {field.name.toLowerCase()}</option>{field.options.map(option => <option key={option}>{option}</option>)}</select> : field.type === 'BOOLEAN' ? <input type="checkbox" disabled aria-label={field.name} /> : <input className="pf-input" disabled type={field.type === 'NUMBER' ? 'number' : field.type === 'DATE' ? 'date' : 'text'} placeholder={field.type === 'RELATION' ? 'Related record' : field.name} />}</label>)}</div>}
    <p className="runtime-footnote">Form submission and record mutations will be enabled in the next runtime increment.</p>
  </article>;
}

export default function ApplicationRuntimePage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const router = useRouter();
  const { user, tenants, accessToken, isLoading, refreshSession } = useAuth();
  const tenant = tenants[0];
  const [application, setApplication] = useState<Application | null>(null);
  const [components, setComponents] = useState<BuilderComponent[]>([]);
  const [componentData, setComponentData] = useState<Record<string, ResourceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const greeting = user?.displayName?.trim() || user?.email.split('@')[0] || 'Account';

  useEffect(() => {
    if (!user) void refreshSession().then(authenticated => { if (!authenticated) router.replace('/login'); });
  }, [user, refreshSession, router]);

  useEffect(() => {
    if (!user || !tenant || !accessToken) return;
    let cancelled = false;
    const headers = { Authorization: 'Bearer ' + accessToken };
    const request = async <T,>(path: string): Promise<T> => {
      const response = await fetch(path, { headers, credentials: 'include', cache: 'no-store' });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
        const message = payload?.message;
        throw new Error(Array.isArray(message) ? message.join(' ') : message || 'Could not load this application.');
      }
      return response.json() as Promise<T>;
    };
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const base = '/api/v1/tenants/' + tenant.id + '/applications/' + applicationId;
        const applications = await request<Application[]>('/api/v1/tenants/' + tenant.id + '/applications');
        const current = applications.find(item => item.id === applicationId);
        if (!current) throw new Error('Application not found in this workspace.');
        const [configuration, resources] = await Promise.all([
          request<BuilderConfiguration>(base + '/builder'),
          request<Resource[]>(base + '/resources'),
        ]);
        const savedComponents = Array.isArray(configuration.components) ? configuration.components : [];
        const boundComponents = savedComponents.filter(component => component.dataBinding?.resourceId);
        const entries = await Promise.all(boundComponents.map(async component => {
          const resourceId = component.dataBinding?.resourceId;
          if (!resourceId) return [component.id, { fields: [], records: [], aggregate: null }] as const;
          const resource = resources.find(item => item.id === resourceId);
          if (!resource) return [component.id, { fields: [], records: [], aggregate: null }] as const;
          const resourceBase = base + '/resources/' + resourceId;
          const [fields, records, aggregate] = await Promise.all([
            request<ResourceField[]>(resourceBase + '/fields'),
            component.type === 'table' ? request<{ items?: ResourceRecord[] }>(resourceBase + '/records?page=1&pageSize=10').then(result => Array.isArray(result.items) ? result.items : []) : Promise.resolve([] as ResourceRecord[]),
            component.type === 'metric' || component.type === 'chart'
              ? (() => {
                  const params = new URLSearchParams({ operation: component.dataBinding?.aggregation ?? 'count' });
                  if (component.dataBinding?.field) params.set('field', component.dataBinding.field);
                  if (component.dataBinding?.groupBy) params.set('groupBy', component.dataBinding.groupBy);
                  return request<Aggregate>(resourceBase + '/aggregate?' + params.toString());
                })()
              : Promise.resolve(null),
          ]);
          return [component.id, { fields, records, aggregate }] as const;
        }));
        if (!cancelled) {
          setApplication(current);
          setComponents(savedComponents);
          setComponentData(Object.fromEntries(entries));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load this application.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [user, tenant, accessToken, applicationId]);

  const pageComponents = useMemo(() => components.filter(component => ['text', 'metric', 'table', 'form', 'chart'].includes(component.type)), [components]);

  if (!user) return <main className="app-loading page-shell"><p>{isLoading ? 'Restoring your session…' : 'Opening application…'}</p></main>;
  return <main className="app-shell">
    <aside className="app-sidebar">
      <Link className="brand" href="/"><span className="brand-mark">P</span><span>PanelForge</span></Link>
      <div className="sidebar-workspace"><span className="workspace-avatar">{tenant?.name?.slice(0, 1) ?? 'W'}</span><span><strong>{tenant?.name ?? 'Workspace'}</strong><small>{tenant?.role ?? 'Member'}</small></span></div>
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="sidebar-nav" aria-label="Workspace navigation"><Link className="sidebar-link" href="/app"><span>▦</span> Overview</Link><Link className="sidebar-link sidebar-link--active" href="/applications"><span>◫</span> Applications</Link><Link className="sidebar-link" href="/members"><span>♧</span> Members</Link></nav>
      <PlatformNavSection />
 <div className="sidebar-bottom"><p className="sidebar-label">ACCOUNT</p><div className="account-mini"><span className="user-avatar">{greeting.slice(0, 1).toUpperCase()}</span><span><strong>{greeting}</strong><small>{user.email}</small></span></div></div>
    </aside>
    <section className="app-main">
      <header className="app-topbar"><div><Link className="breadcrumb-muted" href="/applications">Applications</Link><span className="breadcrumb-divider">/</span><strong>{application?.name ?? 'Runtime'}</strong></div><div className="app-top-actions"><span className="pf-badge pf-badge--info">Workspace preview</span><ThemeToggle /></div></header>
      <div className="dashboard-content runtime-content">
        <div className="applications-heading"><div><p className="eyebrow">APPLICATION RUNTIME</p><h1>{application?.name ?? 'Application'} <span>preview.</span></h1><p>{application?.description || 'Run the saved application configuration using the approved component registry.'}</p></div><Link className="pf-button pf-button--ghost" href={'/applications/' + applicationId + '/builder'}>← Back to builder</Link></div>
        <div className="runtime-notice"><strong>Authenticated workspace preview</strong><span>This is the saved draft, visible to workspace members. Publishing and consumer access are not enabled yet.</span></div>
        {error && <p className="application-error" role="alert">{error}</p>}
        {loading ? <section className="applications-empty"><p>Loading saved application…</p></section> : error ? null : pageComponents.length === 0 ?
          <section className="applications-empty"><p className="eyebrow">EMPTY APPLICATION</p><h2>There is nothing to render yet.</h2><p>Add components in the builder, save your draft, then return here to see the runtime.</p><Link className="pf-button pf-button--primary" href={'/applications/' + applicationId + '/builder'}>Open builder →</Link></section> :
          <div className="runtime-grid">{pageComponents.map(component => <div className={'runtime-grid-item runtime-grid-item--' + component.layout.width} key={component.id}><RuntimeComponent component={component} data={componentData[component.id]} /></div>)}</div>}
      </div>
    </section>
  </main>;
}
