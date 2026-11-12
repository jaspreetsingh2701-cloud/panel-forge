import { ThemeToggle } from '@/components/theme/theme-toggle';

export default function HomePage() {
  return (
    <main className="page-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="PanelForge home">
          <span className="brand-mark">P</span><span>PanelForge</span>
        </a>
        <div className="component-row">
          <span className="environment-label">Platform preview</span>
          <ThemeToggle />
        </div>
      </nav>
      <section className="hero">
        <p className="eyebrow">YOUR DATA. YOUR WORKSPACE. YOUR PANEL.</p>
        <h1>Build the admin experience <span>your team needs.</span></h1>
        <p className="hero-copy">
          PanelForge gives teams the building blocks to create, configure and
          publish powerful admin applications without starting from scratch.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="#getting-started">Explore the workspace <span aria-hidden="true">→</span></a>
          <span className="quiet-note">Early platform foundation</span>
        </div>
      </section>
      <section className="workspace" id="getting-started" aria-labelledby="workspace-title">
        <div className="section-heading">
          <div><p className="eyebrow">THE WORKSPACE</p><h2 id="workspace-title">Everything starts with an application.</h2></div>
          <span className="status-pill"><span /> Foundation online</span>
        </div>
        <div className="feature-grid">
          <article className="feature-card"><span className="feature-number">01</span><h3>Connect your data</h3><p>Bring your operational data into a secure, organised workspace.</p></article>
          <article className="feature-card"><span className="feature-number">02</span><h3>Design your panel</h3><p>Shape resources, forms, tables and dashboards around your team's needs.</p></article>
          <article className="feature-card"><span className="feature-number">03</span><h3>Publish with control</h3><p>Give every teammate the right access to the right application.</p></article>
        </div>
      </section>
      <footer>PanelForge <span>·</span> Building the foundation, one layer at a time.</footer>
    </main>
  );
}
