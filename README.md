# PanelForge

PanelForge is a multi-tenant SaaS platform for visually building, configuring and publishing dynamic admin applications.

Teams connect data sources, define resources and custom fields, design forms, tables and dashboards, configure access policies, and publish versioned admin experiences.

> **Project status:** Phases 0–3 and the Phase 2.5 engineering-quality baseline are merged. The current focus is Phase 4 — Visual Builder.

## Product direction

PanelForge is a platform for building admin applications, not a prebuilt admin dashboard.

The initial MVP demonstration:
1. A tenant creates an organisation and application.
2. It uses the managed PanelForge PostgreSQL data source.
3. It defines resources and custom fields.
4. It visually builds forms, tables and a dashboard.
5. It configures Admin, Manager and Viewer access.
6. It publishes an application snapshot.
7. Another team member signs in and sees only permitted data and actions.

## Principles

- Documentation-driven development.
- Security and tenant isolation by design.
- Modular monolith first.
- Declarative, validated configuration instead of arbitrary customer code.
- Tests, documentation and CI are part of feature completion.

## Repository layout

```text
panelforge/
├── .github/
│   ├── workflows/
│   └── pull_request_template.md
├── apps/
│   ├── api/
│   └── web/
├── docs/
│   ├── 00-product/
│   ├── 01-architecture/
│   ├── 02-database/
│   ├── 04-features/
│   ├── 05-api/
│   ├── 06-operations/
│   ├── 07-project-management/
│   └── adr/
└── packages/
```

## Start here

- [Documentation index](docs/README.md)
- [Product definition](docs/00-product/product-definition.md)
- [MVP scope](docs/00-product/mvp-scope.md)
- [Visual builder specification](docs/04-features/visual-builder.md)
- [Roadmap](docs/07-project-management/roadmap.md)
- [Project progress](docs/07-project-management/progress.md)
- [Phase 2.5 engineering quality plan](docs/06-operations/phase-2-5-engineering-quality-plan.md)

## Development

Use the Node.js version in `.nvmrc` and the pnpm version declared in the root `package.json`.

- Install: `pnpm install`
- Run apps: `pnpm dev`
- Typecheck: `pnpm typecheck`
- Build: `pnpm build`

See [API setup](apps/api/README.md) and [web setup](apps/web/README.md) for application-specific instructions.

## License

No open-source license has been selected. Until one is added, all rights are reserved by the project owner.
