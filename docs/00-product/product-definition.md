---
title: PanelForge Product Definition
status: Approved
version: 1.0.0
last_updated: 2026-11-10
owner: Project maintainers
source_of_truth: true
related_adrs: []
---

# PanelForge Product Definition

## 1. Product vision

PanelForge is a multi-tenant SaaS platform that enables teams to visually build, configure, and publish dynamic admin applications using their own data sources.

The product is not a collection of prebuilt dashboard templates. It is a platform for creating operational software: teams define their data, design the interface, configure access, and publish a working application.

**Product promise:** Build the admin application your team needs without building every admin interface from scratch.

## 2. Problem statement

Teams often need internal tools and admin applications to manage customers, orders, inventory, operations, content, and business workflows.

Building these tools repeatedly can require substantial frontend and backend effort. Existing dashboard templates provide a starting UI, but teams still need to implement data access, forms, tables, permissions, workflows, and deployment.

PanelForge aims to reduce this repeated engineering effort through a reusable visual builder and a secure runtime.

## 3. Target customers and users

### Initial target customers

- Startups and small-to-medium product teams that need internal admin tools.
- Software agencies building operational panels for multiple clients.
- Engineering teams that want to give business teams controlled self-service configuration.
- Product teams that need custom admin experiences connected to existing systems.

The initial MVP should prioritise technical teams and product builders. More advanced non-technical self-service can follow after the core platform is proven.

### User personas

| Persona | Main goal | Typical capabilities |
|---|---|---|
| Platform administrator | Operate the PanelForge service | Manage platform-level settings and tenant lifecycle |
| Organisation administrator | Set up an organisation and its applications | Manage members, applications, data sources and roles |
| Application builder | Create and maintain an admin application | Define resources, design pages, configure components and publish |
| Application user | Complete day-to-day work in a published application | View permitted records and perform permitted actions |

A person may hold more than one persona in a small organisation. Permissions must be based on assigned roles, not assumed from a person's job title.

## 4. Core user journey

The primary MVP journey is:

1. **Sign up and create an organisation** — a user registers and establishes a tenant workspace.
2. **Create an application** — the organisation creates an admin application.
3. **Connect data** — a builder configures a supported data source and verifies the connection.
4. **Define resources** — the builder discovers or defines resources, fields, and relationships.
5. **Design the experience** — the builder creates pages using tables, forms, charts, and layout components.
6. **Configure access** — the organisation assigns roles and configures resource, action, field, and record-level access.
7. **Preview and validate** — the builder checks the application before publishing.
8. **Publish** — PanelForge creates an immutable application configuration version.
9. **Use the application** — invited team members access the published runtime and see only the data and actions they are authorised to use.

## 5. Core product capabilities

### Organisation and application management
- Tenant-isolated organisation workspaces.
- Multiple applications per organisation.
- Member invitations and application assignments.

### Data connectivity and metadata
- Connect supported databases and APIs.
- Test connections and inspect available schemas.
- Define resources, fields, custom fields, and relationships.
- Store connection secrets securely on the server side.

### Visual application builder
- Compose pages using a component palette and canvas.
- Configure tables, forms, charts, navigation, and layouts.
- Edit component properties through a configuration panel.
- Preview the application before publication.

### Permissions and governance
- Configure roles and application access.
- Control resource actions, field visibility/editability, and record scope.
- Enforce permissions in backend data and action paths, not only in the UI.
- Maintain an audit trail for important administrative actions.

### Runtime and publishing
- Render published application configurations.
- Keep drafts separate from published versions.
- Preserve immutable versions and support rollback.
- Load the published configuration independently of ongoing builder edits.

## 6. Product principles

1. **Configuration over repetitive code:** common admin experiences should be assembled from governed components and metadata.
2. **Secure by default:** tenant isolation and server-side authorisation are foundational requirements.
3. **Real data, not demo-only screens:** the MVP should prove a complete path from data connection to usable application.
4. **Composable and extensible:** components and data-source adapters should have clear contracts.
5. **Draft safely, publish deliberately:** editing must not unexpectedly change a live application.
6. **Progressive complexity:** make the common path easy while allowing advanced configuration over time.
7. **Observable and testable:** important operations should be traceable and covered by automated tests.

## 7. Initial success signals

The MVP should demonstrate that a first-time organisation builder can:

- Create an organisation and an application.
- Connect at least one supported data source.
- Define or select a resource.
- Build a working table and form.
- Configure a meaningful role restriction.
- Publish a versioned application.
- Invite a second user who can access only the permitted application capabilities.

Product success should be measured by completion of this end-to-end journey, setup time, successful data operations, permission-test results, and builder usability feedback. Numeric targets will be defined after the MVP scope and validation approach are agreed.

## 8. Explicit non-goals for this definition

This document defines the product direction, not the final delivery commitment. The exact MVP feature list, supported connector order, detailed functional requirements, and deferred capabilities will be specified in the MVP scope document.

PanelForge will not initially attempt to be a general-purpose website builder, a replacement for every enterprise workflow platform, or an unrestricted code-execution environment.
