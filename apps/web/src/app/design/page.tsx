import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function DesignShowcasePage() {
  return (
    <main className="design-page page-shell">
      <header className="design-header">
        <a className="brand" href="/"><span className="brand-mark">P</span><span>PanelForge</span></a>
        <ThemeToggle />
      </header>
      <section className="design-intro">
        <p className="eyebrow">INTERNAL REFERENCE</p>
        <h1>Design system <span>showcase.</span></h1>
        <p className="hero-copy">A living reference for shared tokens and UI primitives. Switch themes to review the same components in both appearances.</p>
      </section>
      <section className="design-section" aria-labelledby="tokens-heading">
        <div className="design-section-heading"><div><p className="eyebrow">FOUNDATIONS</p><h2 id="tokens-heading">Color tokens</h2></div><Badge tone="success">Semantic tokens</Badge></div>
        <div className="token-grid">
          {[
            ['Background', 'var(--background)'], ['Surface', 'var(--surface)'],
            ['Elevated', 'var(--surface-elevated)'], ['Primary', 'var(--primary)'],
            ['Secondary', 'var(--secondary)'], ['Success', 'var(--success)'],
            ['Warning', 'var(--warning)'], ['Error', 'var(--error)'],
          ].map(([name, value]) => <Card className="token-card" key={name}><span className="token-swatch" style={{ background: value }} /><span>{name}</span><code>{value}</code></Card>)}
        </div>
      </section>
      <section className="design-section" aria-labelledby="components-heading">
        <p className="eyebrow">COMPONENTS</p><h2 id="components-heading">Buttons and status</h2>
        <Card className="showcase-panel">
          <div className="component-row"><Button>Primary action</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Destructive</Button><Button disabled>Disabled</Button></div>
          <div className="component-row"><Badge tone="success">Connected</Badge><Badge tone="warning">Needs attention</Badge><Badge tone="danger">Failed</Badge><Badge tone="info">In progress</Badge><Badge>Draft</Badge></div>
        </Card>
      </section>
      <section className="design-section" aria-labelledby="forms-heading">
        <p className="eyebrow">FORM ELEMENTS</p><h2 id="forms-heading">Inputs and surfaces</h2>
        <div className="showcase-grid">
          <Card className="showcase-panel"><Input label="Workspace name" name="workspace" placeholder="e.g. Acme Operations" hint="Visible to workspace members." /><Input label="Email address" name="email" type="email" placeholder="you@company.com" error="Enter a valid email address." /></Card>
          <Card className="showcase-panel showcase-copy"><Badge tone="info">Glass surface</Badge><h3>Build with clarity.</h3><p>Shared components keep the interface consistent, accessible and easier to evolve.</p><p className="quiet-note">This page uses the same semantic CSS variables as the product UI.</p></Card>
        </div>
      </section>
      <footer>PanelForge <span>·</span> Internal design reference</footer>
    </main>
  );
}
