---
title: PanelForge delivery roadmap
status: Proposed
version: 0.2
last_updated: 2026-11-12
source_of_truth: true
---

# PanelForge delivery roadmap

## Phase 0 — Architecture and documentation baseline
**Outcome:** reviewed product, architecture, data, API, security, quality and delivery baseline.
- Product definition and MVP scope.
- Technology stack and system architecture.
- Engine contracts and tenant security model.
- Logical data model and ERD.
- API conventions.
- Testing, CI/CD and versioning strategy.
- ADRs, roadmap, backlog and progress tracker.
Exit when blocking choices for Phase 1 are resolved and docs are internally consistent.

## Phase 1 — Monorepo and infrastructure
**Outcome:** reproducible local environment and running web/API skeleton.
- pnpm workspace and Turborepo.
- Next.js web and NestJS API.
- Shared TypeScript, lint and format configuration.
- PostgreSQL and Prisma.
- Docker Compose, health endpoints, environment validation.
- Initial GitHub Actions CI and test harness.

## Phase 2 — Identity, tenancy and first vertical slice
**Outcome:** user registers/signs in, creates a tenant/application and only accesses their own workspace.
- Custom NestJS email/password authentication for the MVP.
- Users, tenant memberships, tenant-scoped roles and revocable refresh sessions.
- Next.js same-origin API proxy to the separately deployable NestJS API.
- Tenant-aware service/repository patterns.
- Cross-tenant negative tests and basic workspace UI.
- Google/OIDC and managed identity providers are post-MVP learning options, not Phase 2 dependencies.

## Phase 2.5 — Engineering quality foundation
ESLint, Prettier, Husky, lint-staged, Commitlint, Conventional Commits, Changesets, Jest, RTL, Playwright, coverage, Swagger/OpenAPI, CI, staging baseline and security scanning.

## Phase 3 — Metadata and dynamic records
Resources, fields, stable IDs, schema versions, JSONB records, dynamic CRUD, typed query grammar and permission foundations.

## Phase 4 — Visual builder
Curated component registry, canvas, property panel, drag/drop, forms, tables, draft persistence and preview.

## Phase 5 — Data-source adapters
Managed PostgreSQL first; REST next. GraphQL and MySQL remain later.

## Phase 6 — Dynamic RBAC
Tenant/application roles, resource/action permissions, field restrictions, record scopes and security regression tests.

## Phase 7 — Page builder and dashboards
Navigation, layouts, KPI cards, charts, filters and responsive runtime states.

## Phase 8 — Actions, publishing and audit
Predefined safe actions, immutable snapshots, atomic activation, rollback, audit and published runtime access.

## Phase 9 — Production hardening
Observability, backups/restore drills, rate/query limits, security review, deployment rollback, performance and accessibility.

## Post-MVP engineering learning

After the end-to-end MVP works, revisit cloud deployment alternatives (AWS, Google Cloud and Azure), Nginx/reverse proxies, DNS/TLS/HTTPS, OAuth/OIDC/Google sign-in, managed identity providers, WCAG accessibility, Core Web Vitals, observability, reliability, infrastructure as code, Kubernetes and backend architecture alternatives.

Track practical experiments, comparisons and decisions in the [Post-MVP engineering learning checklist](post-mvp-engineering-learning-checklist.md). These topics are not MVP blockers.

## Scope protection
Defer billing, marketplace, AI generation, arbitrary JS, advanced workflow branching, enterprise SSO/SCIM, custom domains, dedicated databases and multi-region deployment unless validated customer needs change priorities.

## Planning estimate
A substantial MVP may take roughly 16–24 weeks of focused part-time work, potentially longer while learning/debugging. This is a planning range, not a commitment; update using actual velocity.

## Related documents
- [MVP scope](../00-product/mvp-scope.md)
- [Backlog](backlog.md)
- [Progress](progress.md)
