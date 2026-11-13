---
title: PanelForge delivery roadmap
status: Active
version: 0.4
last_updated: 2026-11-13
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
Delivered in small, verifiable batches. See the [Phase 2.5 engineering quality plan](../06-operations/phase-2-5-engineering-quality-plan.md).
- CI, frozen-lockfile install, API/web typechecks and production builds.
- ESLint, Prettier, Husky, lint-staged and Commitlint.
- Jest, React Testing Library, PostgreSQL integration tests and coverage thresholds.
- Playwright, Swagger/OpenAPI and security scanning.
- Protected staging workflow, smoke tests and rollback checklist.
Staging deployment remains intentionally deferred.

## Phase 3 — Metadata and dynamic records
**Outcome:** tenant-scoped application data model and safe managed-record APIs.
- Resources, fields, stable IDs, schema versions and JSONB records.
- Dynamic CRUD and typed query grammar.
- Tenant ownership and permission foundations.

## Phase 4 — Visual builder
**Outcome:** author and persist a validated application draft.
- Curated component registry, canvas, property panel and responsive layouts.
- Resource-bound forms and tables; data-driven metrics and charts.
- Draft save/restore, validation, undo/redo and duplicate.
- Authenticated saved-draft runtime preview.
- Super Admin documentation and API reference.

## Phase 5 — Application runtime
**Outcome:** a workspace application can be used for real work, not only previewed.
- 5.0 Runtime access smoke tests and hardening: browser tests for unauthenticated access, login failure states and route protection.
- 5.1 Runtime data operations: safe record creation, reading, editing and deletion through resource-bound forms/tables.
- 5.2 Runtime navigation and pages: multiple pages, application navigation and responsive route handling.
- Loading, empty, validation, success and error states throughout.
Exit when a tenant member can complete an authorised end-to-end record workflow in the runtime.

## Phase 6 — Dynamic RBAC
**Outcome:** permissions are explicit and enforced by the API.
- Platform, tenant and application role boundaries.
- Builder/editor and consumer/viewer application assignments.
- Resource/action permissions, field restrictions and record scopes.
- Negative authorization tests for cross-tenant and cross-role access.
Exit when every runtime read and mutation is authorised server-side and covered by security tests.

## Phase 7 — Publishing and access control
**Outcome:** users can safely release and roll back application versions.
- Draft versus immutable published configuration snapshots.
- Publish-time validation and atomic activation.
- Runtime resolves the active immutable snapshot.
- Current permissions are evaluated at request time, not frozen into snapshots.
- Version history, rollback and audit events.
Follow [ADR-005: Immutable published application snapshots](../adr/ADR-005-immutable-publishing.md); revisit its proposed status before implementation.

## Phase 8 — Production hardening
**Outcome:** operational readiness for a controlled production launch.
- Observability, structured logs, error tracking and service health.
- Audit coverage, backups and restore drills.
- Rate/query limits, security review and performance budgets.
- Deployment rollback, accessibility and reliability checks.
- Staging smoke tests and release checklist.

## Future enhancements
- Data-source adapters: REST first, then GraphQL/MySQL where validated demand exists.
- Relationships and advanced field/record restrictions beyond MVP requirements.
- Billing, marketplace, AI generation, arbitrary JS, advanced workflow branching, enterprise SSO/SCIM, custom domains, dedicated databases and multi-region deployment.

## Post-MVP engineering learning
After the end-to-end MVP works, revisit cloud deployment alternatives (AWS, Google Cloud and Azure), Nginx/reverse proxies, DNS/TLS/HTTPS, OAuth/OIDC/Google sign-in, managed identity providers, WCAG accessibility, Core Web Vitals, observability, reliability, infrastructure as code, Kubernetes and backend architecture alternatives.

Track practical experiments, comparisons and decisions in the [Post-MVP engineering learning checklist](post-mvp-engineering-learning-checklist.md). These topics are not MVP blockers.

## Planning estimate
A substantial MVP may take roughly 16–24 weeks of focused part-time work, potentially longer while learning/debugging. This is a planning range, not a commitment; update using actual velocity.

## Related documents
- [MVP scope](../00-product/mvp-scope.md)
- [Backlog](backlog.md)
- [Progress](progress.md)
