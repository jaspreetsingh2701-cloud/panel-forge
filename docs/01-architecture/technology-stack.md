---
title: PanelForge technology stack
status: Proposed
version: 0.3
last_updated: 2026-11-10
owner: Project maintainers
source_of_truth: true
related_adrs: []
---

# PanelForge technology stack

## 1. Purpose

This document proposes the technology stack for the PanelForge MVP. It records the preferred tools, their responsibilities and the rationale for selecting them.

The stack is intentionally designed for a small team and a modular-monolith architecture. It favours type safety, fast product iteration, testability and a clear path to future separation of deployable services.

This document is **Proposed**. Choices marked as pending must be resolved before the relevant implementation begins.

## 2. Node.js runtime and package manager

- Use Node.js 24.x for the initial workspace. It is a supported LTS line with a mature ecosystem; keep the supported range within major 24 for reproducible development.
- Pin pnpm 11.28.11 through the root package.json packageManager field. This avoids developers silently using different package-manager majors.
- The repository includes .nvmrc with 24. On Windows, use a Node version manager such as nvm-windows or install a compatible Node 24 LTS release directly.
- Upgrade Node or pnpm only through a reviewed dependency/toolchain change, with lockfile and CI validation.

## 3. Architecture principles

- Prefer a modular monolith over microservices for the MVP.
- Keep the builder, runtime renderer, API and domain logic separated by clear module and package boundaries.
- Use TypeScript across the web and Node.js application layers.
- Keep customer configuration declarative and validated; do not execute arbitrary customer-supplied JavaScript or SQL.
- Enforce tenant isolation and permissions in the backend.
- Keep infrastructure and vendor-specific integrations behind replaceable interfaces where practical.
- Add infrastructure only when a concrete product requirement needs it.

## 4. Proposed stack at a glance

| Area | Proposed technology | Responsibility |
|---|---|---|
| Monorepo | Turborepo + pnpm | Workspace management, task orchestration and shared packages |
| Frontend | Next.js + React + TypeScript | Builder experience and published application routes |
| Styling and UI primitives | Tailwind CSS + shadcn/ui | Consistent, accessible interface components |
| Drag and drop | dnd-kit | Visual builder canvas interactions |
| Forms | React Hook Form + Zod | Form state and schema validation |
| Tables | TanStack Table | Configurable data tables |
| Charts | Apache ECharts | Dashboard visualisations |
| Server state | TanStack Query | API requests, caching and mutations |
| Builder state | Zustand | Local editor, selection and canvas state |
| Backend | NestJS + REST | Authentication integration, domain APIs and application services |
| Database | PostgreSQL | Tenant, application, metadata and managed-record storage |
| ORM and migrations | Prisma | Type-safe database access and schema migrations |
| API contract | Swagger / OpenAPI via @nestjs/swagger | API documentation and machine-readable contract |
| Unit and integration tests | Jest | Backend and shared-package testing |
| Component tests | React Testing Library | User-facing component behaviour |
| End-to-end tests | Playwright | Critical browser journeys |
| CI/CD | GitHub Actions | Automated checks and deployment workflows |
| Containerisation | Docker | Consistent local and deployment environments |
| Background jobs | Redis + BullMQ, when required | Deferred asynchronous processing |

## 5. Frontend

### 4.1 Next.js, React and TypeScript

Use one Next.js application for the MVP. It will provide:

- Organisation and application management.
- The visual builder experience.
- Preview routes.
- Published application routes rendered from immutable configuration snapshots.

Keep the published-app renderer in a dedicated shared package rather than embedding rendering rules in page components. This preserves the option to extract the runtime into a separately deployed application later.

### 4.2 UI and interaction libraries

- **Tailwind CSS:** utility-first styling and design tokens.
- **shadcn/ui:** accessible, composable UI primitives that the project owns and can customise.
- **dnd-kit:** drag-and-drop interactions for placing and arranging builder components.
- **React Hook Form + Zod:** form state, validation and typed schemas.
- **TanStack Table:** headless table behaviour with PanelForge-controlled rendering.
- **Apache ECharts:** charts for dashboard widgets.

The component registry remains the approved entry point for components that can be configured and rendered by customer applications. Installing a UI library does not mean exposing every library component to end users.

### 4.3 State management

Use the tools for distinct responsibilities:

- **TanStack Query:** remote API state, caching, invalidation and mutations.
- **Zustand:** transient builder state such as selected component, active panel, drag state and unsaved canvas interactions.
- **React component state:** local state that does not need to be shared.

Do not duplicate server data in Zustand without a specific reason.

## 6. Backend

### 5.1 NestJS

Use NestJS for the PanelForge API. Organise it as a modular monolith with domain-oriented modules, such as:

- Identity and membership
- Tenants and organisations
- Applications
- Data sources
- Resources and fields
- Metadata and configuration
- Dynamic records and query execution
- Permissions
- Publishing and version history
- Audit events

Modules should communicate through explicit service interfaces. Avoid creating a distributed service for each domain during the MVP.

### 5.2 REST API

Start with REST and version routes under `/api/v1`.

Use DTOs and validation at API boundaries. Document endpoints, authentication requirements, request and response schemas, pagination, filtering and error formats using Swagger / OpenAPI.

GraphQL is not part of the initial PanelForge API. Support for customer GraphQL data sources is a separate connector capability and can be considered later.

## 7. Data and persistence

### 6.1 PostgreSQL

PostgreSQL is the primary managed database for the MVP. It will store:

- Users, tenants and memberships.
- Applications and data-source metadata.
- Resources, fields and relationships.
- Builder drafts and published snapshots.
- Roles and permissions.
- Managed dynamic records.
- Audit events.

Use relational columns and constraints for core platform entities. Use JSONB for user-defined record attributes and suitable versioned configuration documents. Do not use JSONB as a reason to avoid relational modelling where relationships and constraints matter.

### 6.2 Prisma

Use Prisma for schema modelling, type-safe database access and migrations.

Database constraints and transaction boundaries remain important. Prisma does not replace database-level tenant integrity, indexes, foreign keys or security controls.

### 6.3 Tenant isolation

Tenant context must be derived from the authenticated user's validated membership. Never trust a tenant identifier supplied by the browser as proof of access.

Every tenant-owned read and write must be scoped and authorised by the backend. Add automated tests for cross-tenant access. Consider PostgreSQL row-level security as defence in depth after the application-level model is established.

## 8. Authentication and authorisation

### 7.1 Authentication — provider decision pending

The frontend and NestJS API are separate applications, so the authentication design must define how the browser obtains credentials and how the API validates them.

Preferred direction:

- Use an OpenID Connect (OIDC)-compatible identity provider.
- Use short-lived access tokens for API calls.
- Validate token signature, issuer, audience and expiry in NestJS.
- Resolve the current user and tenant membership on the server.
- Keep provider-specific implementation behind an identity integration boundary.

The specific provider is not selected in this document. Evaluate AWS Cognito and other suitable managed OIDC providers before implementation. Do not assume that a frontend session cookie is automatically a valid API access token.

### 7.2 Authorisation

Implement PanelForge's product-specific RBAC and policy checks in the backend. A helper library such as CASL may be evaluated, but it must not become the security boundary.

The backend must enforce application, resource, action, field and record-level restrictions. Hiding a button or field in the frontend is not sufficient authorisation.

## 9. Testing and quality

- **Jest:** unit and integration tests for API modules and shared packages.
- **React Testing Library:** component tests focused on user-observable behaviour.
- **Playwright:** end-to-end tests for registration, tenant isolation, building, publishing and runtime access.
- **Coverage:** begin with the agreed project thresholds; require stronger coverage for tenant isolation, permission evaluation and dynamic query execution.
- **Static quality:** ESLint, Prettier and TypeScript checks.
- **API contract:** validate generated OpenAPI output in CI.

Coverage percentages are quality signals, not proof that security or behaviour is correct. Critical flows also require meaningful assertions and negative tests.

## 10. Build, delivery and operations

- Use Docker for consistent local development and deployment packaging.
- Use GitHub Actions for pull-request checks and deployment workflows.
- Run lint, formatting, type checks, tests, coverage gates, builds and security checks in CI.
- Keep staging and production environments separate.
- Use environment variables or a secrets manager for credentials. Never commit secrets.
- Add Redis and BullMQ only when asynchronous processing is introduced.
- Add observability, backup and recovery controls before production launch.

Package versioning, API versioning and published application snapshot versioning are separate concerns. The detailed policy will be maintained in a dedicated versioning document.

## 11. Initial repository application boundaries

The initial monorepo should favour a small number of deployable applications:

```text
apps/
  web/          # Next.js: builder, preview and published runtime routes
  api/          # NestJS: modular PanelForge API
packages/
  ui/           # Shared design-system components
  component-registry/
  runtime-renderer/
  metadata-engine/
  permissions/
  validation/
  shared-types/
  database/
```

Additional packages and applications should be introduced when implementation needs them:

- `apps/worker` when background jobs are required.
- `packages/data-source-adapters/*` as connector implementations are added.
- Dedicated runtime deployment only when operational requirements justify it.

This is a logical starting boundary, not a requirement to create every package immediately. Create packages when there is real code to own.

## 12. Deferred technologies and capabilities

The following are intentionally not required for the first MVP:

- Microservices and Kubernetes.
- A separate runtime deployment.
- Redis and BullMQ before background jobs exist.
- GraphQL for the PanelForge platform API.
- Multiple database engines for managed platform storage.
- Arbitrary plugin execution or customer-supplied JavaScript.
- A general-purpose workflow orchestration platform.
- Complex event streaming infrastructure.

Customer data-source adapters for REST, GraphQL and MySQL are planned product capabilities, but they do not change PostgreSQL as the initial managed platform database.

## 13. Decisions still to confirm

| Decision | Current position | When to resolve |
|---|---|---|
| Identity provider | OIDC-compatible provider; Cognito is a candidate | Before authentication implementation |
| Hosting and deployment target | AWS is the likely target; service selection pending | Before infrastructure implementation |
| Prisma version and database deployment | Prisma + PostgreSQL proposed | At project setup |
| Redis/BullMQ | Deferred | Before first asynchronous job |
| Runtime extraction | Keep inside the Next.js app initially | Revisit against scale and deployment needs |

## 14. Related documents

- [Product definition](../00-product/product-definition.md)
- [MVP scope](../00-product/mvp-scope.md)
- [Documentation conventions](../documentation-conventions.md)
- [ADR index](../adr/README.md)

## 15. Initial application scaffold

The first application scaffold uses the following concrete setup:

- **Web application:** Next.js 16.4.2 with React 19.2.0 and TypeScript.
- **API application:** NestJS 11.x with TypeScript and the Express platform adapter.
- **Web routes:** the initial product shell is served from the Next.js root route.
- **API prefix:** platform endpoints begin under `/api/v1`.
- **Health endpoint:** `GET /api/v1/health` returns a small JSON status payload for local checks and future uptime monitoring.
- **Local ports:** Next.js uses port 3000 by default; the API uses port 4000 by default and can be overridden with `PORT`.
- **Workspace commands:** root scripts delegate development, builds and type checking to Turborepo.

These are implementation choices for the initial scaffold. They do not approve the still-proposed identity provider, database hosting or production deployment decisions. The initial page is a visual shell, not the completed builder.

Linting, automated tests, coverage gates and CI are deliberately introduced in the planned engineering-quality batch after the first application shell is running. They are not represented as working root commands until their tools and per-application scripts are configured.

---

## Change history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial proposed technology stack for the PanelForge MVP |
| 0.2 | 2026-11-10 | Pin Node.js 24 and pnpm 11 for the initial workspace |\n| 0.3 | 2026-11-10 | Record the initial Next.js and NestJS application scaffold and workspace commands |
