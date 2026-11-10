# PanelForge

PanelForge is a multi-tenant SaaS platform for visually building and publishing dynamic, plug-and-play admin applications.

Teams will be able to connect data sources, define resources and custom fields, design forms, tables and dashboards, configure role-based access, and publish versioned admin experiences.

> **Project status:** Phase 0 — Architecture and documentation baseline  
> **Current milestone:** Batch 1 — Repository and documentation foundation

## Product direction

PanelForge is a platform for building admin applications, not a prebuilt admin dashboard.

The initial MVP is intended to demonstrate this end-to-end journey:

1. A tenant creates an organisation and an application.
2. The tenant connects a supported data source.
3. The tenant defines resources and custom fields.
4. The tenant visually builds forms, tables and a dashboard.
5. The tenant configures roles and permissions.
6. The tenant publishes the application.
7. Another team member signs in and sees only the data and actions they are authorised to access.

## Project principles

- **Documentation-driven development:** important decisions are documented and reviewed alongside implementation.
- **Security by design:** tenant isolation and server-side authorisation are foundational requirements.
- **Modular monolith first:** keep deployment and operations manageable while preserving clear module boundaries.
- **Configuration over arbitrary code:** user-created panels are defined through validated, versioned metadata and configuration.
- **Quality is part of the feature:** tests, documentation and CI checks are included in feature completion.

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

The `docs/README.md` file is the documentation index and explains the intended contents of each section.

## Getting started

This repository currently contains the project documentation foundation. Application setup instructions will be added when the technology stack and monorepo structure are approved.

Start with:

1. [`docs/README.md`](docs/README.md) — documentation map.
2. [`docs/documentation-conventions.md`](docs/documentation-conventions.md) — how project documentation is maintained.
3. [`docs/adr/README.md`](docs/adr/README.md) — architecture decision record process.

## Project status

See the project roadmap and progress tracker once they are created in Phase 0.

## License

No open-source license has been selected. Until one is added, all rights are reserved by the project owner.
