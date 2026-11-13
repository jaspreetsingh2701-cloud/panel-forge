'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/components/auth/auth-provider';
import { COMPONENT_REGISTRY, createBuilderComponent, getBuilderComponentDefinition, moveBuilderComponent, type BuilderComponent, type BuilderComponentType, type BuilderPropertyKey, type BuilderLayoutWidth, type BuilderLayoutSpacing } from '@/features/builder/component-registry';
type Application = { id: string; name: string; description: string | null; status: 'DRAFT' | 'ARCHIVED' };
const categories = Array.from(new Set(COMPONENT_REGISTRY.map((definition) => definition.category)));

function ComponentPreview({ component }: { component: BuilderComponent }) {
  if (component.type === 'metric') return <div className="builder-preview-metric"><span>{component.title}</span><strong>{component.content || '—'}</strong><small>{component.description}</small></div>;
  if (component.type === 'table') return <div className="builder-preview-table-wrap"><h4>{component.title}</h4><p>{component.description}</p><table className="builder-preview-table"><thead><tr><th>Name</th><th>Status</th><th>Updated</th></tr></thead><tbody><tr><td>Sample record</td><td><span className="pf-badge pf-badge--success">Active</span></td><td>Today</td></tr><tr><td>Another record</td><td><span className="pf-badge">Draft</span></td><td>Yesterday</td></tr></tbody></table></div>;
  if (component.type === 'form') return <div className="builder-preview-form"><h4>{component.title}</h4><p>{component.description}</p><label className="pf-field"><span className="pf-label">Example field</span><input className="pf-input" disabled placeholder="Generated from resource fields" /></label><button className="pf-button pf-button--primary pf-button--sm" type="button" disabled>Submit preview</button></div>;
  if (component.type === 'chart') return <div className="builder-preview-chart"><h4>{component.title}</h4><p>{component.description}</p><div className="builder-chart-bars" aria-label="Illustrative chart preview">{[42, 68, 54, 82, 61, 94, 72].map((height, index) => <span key={index} style={{ height: height + '%' }} />)}</div><small>{component.content}</small></div>;
  return <div className="builder-preview-text"><h3>{component.title}</h3><p>{component.content}</p></div>;
}

export default function BuilderPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const router = useRouter();
  const { user, tenants, accessToken, isLoading, refreshSession } = useAuth();
  const tenant = tenants[0];
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoadingApplication, setIsLoadingApplication] = useState(true);
  const [error, setError] = useState('');
  const [components, setComponents] = useState<BuilderComponent[]>([]);
  const [savedComponents, setSavedComponents] = useState<BuilderComponent[]>([]);
  const [builderVersion, setBuilderVersion] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveConflict, setSaveConflict] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [interactionMessage, setInteractionMessage] = useState('');

  useEffect(() => {
    if (!user) void refreshSession().then((authenticated) => { if (!authenticated) router.replace('/login'); });
  }, [user, refreshSession, router]);

  useEffect(() => {
    if (!user || !tenant || !accessToken) return;
    let cancelled = false;
    const loadApplication = async () => {
      try {
        const response = await fetch('/api/v1/tenants/' + tenant.id + '/applications', {
          headers: { Authorization: 'Bearer ' + accessToken }, credentials: 'include', cache: 'no-store',
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { message?: string | string[]; error?: { message?: string | string[] } } | null;
          const responseMessage = payload?.error?.message ?? payload?.message;
          throw new Error(Array.isArray(responseMessage) ? responseMessage.join(' ') : responseMessage || 'Could not load this application.');
        }
        const applications = await response.json() as Application[];
        const current = applications.find((item) => item.id === applicationId);
        if (!current) throw new Error('Application not found in this workspace.');
        const builderResponse = await fetch('/api/v1/tenants/' + tenant.id + '/applications/' + applicationId + '/builder', {
          headers: { Authorization: 'Bearer ' + accessToken }, credentials: 'include', cache: 'no-store',
        });
        if (!builderResponse.ok) {
          const payload = await builderResponse.json().catch(() => null) as { message?: string | string[]; error?: { message?: string | string[] } } | null;
          const responseMessage = payload?.error?.message ?? payload?.message;
          throw new Error(Array.isArray(responseMessage) ? responseMessage.join(' ') : responseMessage || 'Could not restore the saved builder configuration.');
        }
        const builderConfig = await builderResponse.json() as { components: BuilderComponent[]; version: number };
        const restoredComponents = Array.isArray(builderConfig.components) ? builderConfig.components : [];
        if (!cancelled) {
          setApplication(current);
          setComponents(restoredComponents);
          setSavedComponents(restoredComponents);
          setBuilderVersion(builderConfig.version);
          setError('');
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load this application.');
      } finally {
        if (!cancelled) setIsLoadingApplication(false);
      }
    };
    void loadApplication();
    return () => { cancelled = true; };
  }, [user, tenant, accessToken, applicationId]);

  const hasUnsavedChanges = JSON.stringify(components) !== JSON.stringify(savedComponents);
  const canSave = tenant?.role === 'OWNER' || tenant?.role === 'ADMIN';
  const selectedComponent = components.find((component) => component.id === selectedId) ?? null;
  const selectedDefinition = selectedComponent ? getBuilderComponentDefinition(selectedComponent.type) : undefined;
  const selectedIndex = selectedId ? components.findIndex((component) => component.id === selectedId) : -1;

  async function saveConfiguration() {
    if (!tenant || !accessToken || builderVersion === null || !canSave || !hasUnsavedChanges || isSaving) return;
    setIsSaving(true);
    setSaveError('');
    setSaveConflict(false);
    setSaveMessage('');
    try {
      const response = await fetch('/api/v1/tenants/' + tenant.id + '/applications/' + applicationId + '/builder', {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ expectedVersion: builderVersion, components }),
      });
      const payload = await response.json().catch(() => null) as { message?: string | string[]; error?: { message?: string | string[] }; components?: BuilderComponent[]; version?: number } | null;
      if (!response.ok) {
        const responseMessage = payload?.error?.message ?? payload?.message;
        const message = Array.isArray(responseMessage) ? responseMessage.join(' ') : responseMessage || 'Could not save the builder configuration.';
        if (response.status === 409) setSaveConflict(true);
        throw new Error(message);
      }
      if (!payload || !Array.isArray(payload.components) || !payload.version) {
        throw new Error('The server returned an invalid save response. Reload the builder before continuing.');
      }
      setSavedComponents(payload.components);
      setBuilderVersion(payload.version);
      setSaveMessage('All changes saved.');
      setInteractionMessage('Builder configuration saved.');
    } catch (saveError) {
      setSaveError(saveError instanceof Error ? saveError.message : 'Could not save the builder configuration.');
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hasUnsavedChanges]);

  function addComponent(type: BuilderComponentType) {
    const component = createBuilderComponent(type, crypto.randomUUID());
    setComponents((current) => [...current, component]);
    setSelectedId(component.id);
    setInteractionMessage(component.title + ' added to canvas.');
  }
  function updateLayout(key: 'width' | 'spacing', value: BuilderLayoutWidth | BuilderLayoutSpacing) {
    if (!selectedComponent) return;
    setComponents((current) => current.map((component) => {
      if (component.id !== selectedComponent.id) return component;
      const layout = key === 'width'
        ? { ...component.layout, width: value as BuilderLayoutWidth }
        : { ...component.layout, spacing: value as BuilderLayoutSpacing };
      return { ...component, layout };
    }));
  }
  function updateSelected(key: BuilderPropertyKey, value: string) {
    if (!selectedComponent) return;
    setComponents((current) => current.map((component) => component.id === selectedComponent.id ? { ...component, [key]: value } : component));
  }
  function moveComponent(sourceIndex: number, destinationIndex: number) {
    if (sourceIndex < 0 || destinationIndex < 0 || sourceIndex >= components.length || destinationIndex >= components.length || sourceIndex === destinationIndex) return;
    const moving = components[sourceIndex];
    setComponents((current) => moveBuilderComponent(current, sourceIndex, destinationIndex));
    setSelectedId(moving.id);
    setInteractionMessage(moving.title + ' moved to position ' + (destinationIndex + 1) + '.');
  }
  function removeSelected() {
    if (!selectedComponent) return;
    const removedTitle = selectedComponent.title;
    const remaining = components.filter((component) => component.id !== selectedComponent.id);
    setComponents(remaining);
    setSelectedId(remaining[Math.min(selectedIndex, remaining.length - 1)]?.id ?? null);
    setInteractionMessage(removedTitle + ' removed from canvas.');
  }
  function handleDrop(targetIndex: number) {
    if (!draggedId) return;
    const sourceIndex = components.findIndex((component) => component.id === draggedId);
    moveComponent(sourceIndex, targetIndex);
    setDraggedId(null);
  }

  if (!user) return <main className="app-loading page-shell"><p>{isLoading ? 'Restoring your session…' : 'Opening workspace…'}</p></main>;
  if (isLoadingApplication) return <main className="app-loading page-shell"><p>Loading application builder…</p></main>;
  if (!application) return <main className="app-loading page-shell"><p className="application-error" role="alert">{error || 'Application not found.'}</p><Link className="pf-button pf-button--ghost" href="/applications">Back to applications</Link></main>;

  return (
    <main className="builder-page">
      <header className="builder-topbar">
        <div className="builder-topbar-title"><Link className="brand" href="/applications" onClick={(event) => { if (hasUnsavedChanges && !window.confirm('You have unsaved builder changes. Leave without saving?')) event.preventDefault(); }}><span className="brand-mark">P</span><span>PanelForge</span></Link><span className="builder-topbar-divider">/</span><Link className="breadcrumb-muted" href={'/applications/' + applicationId + '/resources'} onClick={(event) => { if (hasUnsavedChanges && !window.confirm('You have unsaved builder changes. Leave without saving?')) event.preventDefault(); }}>{application.name}</Link><span className="builder-topbar-divider">/</span><strong>Builder</strong></div>
        <div className="builder-topbar-actions">
          <span className={'pf-badge ' + (hasUnsavedChanges ? 'pf-badge--warning' : 'pf-badge--success')}>{hasUnsavedChanges ? 'Unsaved changes' : 'Saved draft'}</span>
          <button className="pf-button pf-button--primary pf-button--sm" type="button" onClick={() => void saveConfiguration()} disabled={!canSave || !hasUnsavedChanges || isSaving || builderVersion === null}>{isSaving ? 'Saving…' : 'Save changes'}</button>
          <ThemeToggle />
        </div>
      </header>
      {error && <p className="application-error builder-error" role="alert">{error}</p>}
      <div className="builder-workspace">
        <aside className="builder-panel builder-palette" aria-label="Component palette">
          <div className="builder-panel-heading"><p className="eyebrow">BUILD</p><h2>Components</h2><p>Choose a block to add it to your page.</p></div>
          {categories.map((category) => <section className="builder-palette-group" key={category}><h3>{category}</h3><div className="builder-component-list">
            {COMPONENT_REGISTRY.filter((definition) => definition.category === category).map((definition) => <button className="builder-component-option" key={definition.type} type="button" onClick={() => addComponent(definition.type)}><span className="builder-component-icon" aria-hidden="true">{definition.icon}</span><span><strong>{definition.label}</strong><small>{definition.description}</small></span><span className="builder-component-add" aria-hidden="true">＋</span></button>)}
          </div></section>)}
          <p className="builder-palette-note">Only registered component types can be added. More layout and data components arrive in the next builder batches.</p>
        </aside>
        <section className="builder-canvas-area" aria-label="Page canvas">
          <div className="builder-canvas-toolbar"><div><p className="eyebrow">PAGE 01</p><h1>{application.name}</h1></div><span className="pf-badge">Canvas preview</span></div>
          <div className="builder-canvas-board">
            {components.length === 0 ? <div className="builder-canvas-empty"><span className="builder-empty-icon">＋</span><h2>Your canvas is ready.</h2><p>Add a component from the left panel to start shaping this page.</p></div> : <div className="builder-canvas-components">
              {components.map((component, index) => <article
                className={'builder-canvas-node builder-canvas-node--width-' + component.layout.width + ' builder-canvas-node--spacing-' + component.layout.spacing + (component.id === selectedId ? ' builder-canvas-node--selected' : '') + (component.id === draggedId ? ' builder-canvas-node--dragging' : '')}
                key={component.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(index)}
              >
                <div className="builder-node-toolbar">
                  <button className="builder-node-select" type="button" aria-pressed={component.id === selectedId} onClick={() => setSelectedId(component.id)}><span>{index + 1}. {component.title}</span><small>{component.type}</small></button>
                  <div className="builder-node-actions">
                    <button className="builder-reorder-button" type="button" aria-label={'Move ' + component.title + ' up'} title="Move up" disabled={index === 0} onClick={() => moveComponent(index, index - 1)}>↑</button>
                    <button className="builder-reorder-button" type="button" aria-label={'Move ' + component.title + ' down'} title="Move down" disabled={index === components.length - 1} onClick={() => moveComponent(index, index + 1)}>↓</button>
                    <button className="builder-drag-handle" type="button" draggable="true" aria-label={'Drag to reorder ' + component.title} title="Drag to reorder" onDragStart={() => { setDraggedId(component.id); setSelectedId(component.id); }} onDragEnd={() => setDraggedId(null)}>⠿</button>
                  </div>
                  {component.id === selectedId && <span className="builder-selected-label">Selected</span>}
                </div>
                <div className="builder-node-preview" onClick={() => setSelectedId(component.id)}><ComponentPreview component={component} /></div>
              </article>)}
            </div>}
          </div>
          <p className="builder-canvas-footnote">Reorder with the arrow controls or drag handle. Changes are saved to this application's draft configuration; publishing is not available yet.</p>
          {saveError && <p className="application-error builder-error" role="alert">{saveError} {saveConflict && <button className="pf-button pf-button--ghost pf-button--sm" type="button" onClick={() => window.location.reload()}>Reload saved version</button>}</p>}
          {saveMessage && !hasUnsavedChanges && <p className="builder-save-message" role="status">{saveMessage}</p>}
          {!canSave && hasUnsavedChanges && <p className="builder-save-message" role="status">Only workspace owners and admins can save application changes.</p>}
          <p className="builder-interaction-status" role="status" aria-live="polite">{interactionMessage}</p>
        </section>
        <aside className="builder-panel builder-inspector" aria-label="Component properties">
          <div className="builder-panel-heading"><p className="eyebrow">CONFIGURE</p><h2>Properties</h2><p>{selectedComponent ? 'Edit the selected component.' : 'Select a component on the canvas.'}</p></div>
          {!selectedComponent || !selectedDefinition ? <div className="builder-inspector-empty"><span>◇</span><p>No component selected</p><small>Choose a component on the canvas to inspect its properties.</small></div> : <>
            <div className="builder-inspector-type"><span className="builder-component-icon">{selectedDefinition.icon}</span><span><strong>{selectedDefinition.label}</strong><small>{selectedDefinition.type}</small></span></div>
            {selectedDefinition.properties.map((property) => <label className="pf-field builder-property-field" key={property.key}><span className="pf-label">{property.label}</span>{property.control === 'textarea' ? <textarea className="pf-input builder-property-textarea" value={selectedComponent[property.key]} onChange={(event) => updateSelected(property.key, event.target.value)} /> : <input className="pf-input" value={selectedComponent[property.key]} onChange={(event) => updateSelected(property.key, event.target.value)} />}</label>)}
            <div className="builder-layout-controls">
              <p className="eyebrow">LAYOUT</p>
              <label className="pf-field builder-property-field"><span className="pf-label">Column width</span><select className="pf-input" value={selectedComponent.layout.width} onChange={(event) => updateLayout('width', event.target.value as BuilderLayoutWidth)}><option value="full">Full width</option><option value="half">Half width</option><option value="third">One third</option></select></label>
              <label className="pf-field builder-property-field"><span className="pf-label">Content spacing</span><select className="pf-input" value={selectedComponent.layout.spacing} onChange={(event) => updateLayout('spacing', event.target.value as BuilderLayoutSpacing)}><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="spacious">Spacious</option></select></label>
              <small className="builder-layout-help">Columns automatically stack on smaller screens.</small>
            </div>
            <button className="pf-button pf-button--danger builder-remove-button" type="button" onClick={removeSelected}>Remove component</button>
          </>}
        </aside>
      </div>
    </main>
  );
}
