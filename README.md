# PanelForge

PanelForge is a multi-tenant SaaS platform for visually building, configuring and publishing dynamic admin applications.

Teams connect data sources, define resources and custom fields, design forms, tables and dashboards, configure access policies, and publish versioned admin experiences.

> **Project status:** Phase 0 documentation baseline drafted; review and approval remain before implementation.
> **Current focus:** Architecture, data model, API, security and engineering delivery standards.

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
├── docs/
│   ├── 00-product/
│   ├── 01-architecture/
│   ├── 02-database/
│   ├── 03-engines/
│   ├── 04-features/
│   ├── 05-api/
│   ├── 06-operations/
│   ├── 07-project-management/
│   └── adr/
├── .gitignore
└── README.md
```

## Start here
- [Documentation index](docs/README.md)
- [Product definition](docs/00-product/product-definition.md)
- [MVP scope](docs/00-product/mvp-scope.md)
- [Phase 0 tracker](docs/07-project-management/phase-0-architecture-baseline.md)
- [Roadmap](docs/07-project-management/roadmap.md)

## Development status
The repository currently contains the documentation baseline. Implementation begins after Phase 0 decisions are reviewed and approved. See [project progress](docs/07-project-management/progress.md).

## License
No open-source license has been selected. Until one is added, all rights are reserved by the project owner.
