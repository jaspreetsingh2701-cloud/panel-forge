---
title: PanelForge MVP Scope
status: Proposed
version: 0.1.0
last_updated: 2026-11-10
owner: Project maintainers
source_of_truth: true
related_adrs: []
---

# PanelForge MVP Scope

## 1. MVP objective

Prove that an organisation can connect data, configure a useful admin application visually, apply access controls, and publish a working application for its team.

The MVP is a complete vertical slice of the PanelForge platform. It is not intended to be a feature-complete no-code platform.

## 2. Primary demonstration scenario

The first demonstration application will be an **E-commerce Operations Panel**.

It will manage:
- Products
- Customers
- Orders

The demonstration is a sample use case, not a hard-coded product limitation. The platform's metadata, component, permission, and runtime layers must remain reusable for other domains.

## 3. MVP end-to-end journey

A successful MVP user should be able to:

1. Register and create an organisation.
2. Create an application within that organisation.
3. Add a supported data source.
4. Test the connection and inspect available schema, or define a resource using PanelForge-managed data.
5. Configure resource fields, including custom fields where supported.
6. Build a page with a data table and a create/edit form.
7. Add a basic KPI or chart component to a dashboard.
8. Configure at least two roles with meaningfully different access.
9. Preview the draft application.
10. Publish an immutable configuration version.
11. Invite or create a second organisation member.
12. Verify that the second member can only access the application and records/actions allowed by their permissions.

## 4. MVP feature priorities

### P0 — Required for MVP

| Capability | MVP requirement |
|---|---|
| Authentication | Secure sign-in and sign-out |
| Tenancy | Create organisation; enforce tenant isolation on server-side operations |
| Applications | Create and manage applications within an organisation |
| Data model | Define resources and typed fields |
| Managed data | CRUD for PanelForge-managed records |
| Metadata | Persist resource, field, page, and component configuration |
| Builder shell | Component palette, canvas, properties panel, save and load |
| Tables | Render data table with basic sorting, filtering, and pagination |
| Forms | Create and edit records with validation |
| Dashboard | Display basic KPI cards and at least one chart |
| Runtime | Render a published application from its configuration |
| RBAC | Roles with resource/action permissions and at least basic record/field restrictions |
| Publishing | Draft and immutable published versions |
| Audit | Record key administrative and publishing actions |
| Quality | Automated unit/integration tests and CI checks for core paths |

### P1 — Include if the P0 path is stable

- PostgreSQL data-source adapter for a controlled connection scenario.
- REST API data-source adapter with a limited, safe request configuration model.
- Relationship-aware resource views.
- Field-level visibility/edit restrictions.
- Record scope such as all records versus records assigned to the current user.
- Member invitations and application-level assignments.
- Publish history and rollback UI.
- More chart types and reusable page layouts.

### P2 — Post-MVP

- GraphQL connector.
- MySQL connector.
- Advanced workflow designer and background workflow execution.
- Conditional branching and multi-step approval flows.
- Advanced computed fields and formula builder.
- Marketplace and community component library.
- AI-assisted page generation.
- Custom domains and extensive white-labelling.
- Billing, plans, usage metering, and subscription management.
- Enterprise SSO and advanced identity federation.
- Dedicated database per tenant.
- Arbitrary user-authored JavaScript or SQL execution.

Priority labels are delivery guidance and may be revised after technical spikes and user feedback.

## 5. Deliberate MVP constraints

To protect delivery speed and security:

- Start with a modular monolith.
- Start with one primary database technology: PostgreSQL.
- Use PanelForge-managed records as the guaranteed end-to-end path.
- Treat external data-source support as a constrained connector capability, not unrestricted database access.
- Start with a curated component registry rather than arbitrary React components.
- Support a focused set of components: text, KPI, chart, table, form, and basic layout/navigation.
- Use a simple role and permission model before adding complex policy expressions.
- Publish immutable configuration snapshots; do not mutate a live published version in place.
- Do not execute arbitrary code supplied through the visual builder.
- Keep connector credentials server-side and encrypted or stored through a managed secret mechanism.

## 6. MVP acceptance criteria

The MVP is accepted when all of the following can be demonstrated in a clean environment:

1. Two organisations can be created and their data remains isolated.
2. An organisation can create an application and define a resource with typed fields.
3. A builder can create and edit records through a generated table and form.
4. A dashboard can display data-backed KPI and chart components.
5. Two users with different roles receive different permitted capabilities.
6. Backend API requests cannot bypass tenant, resource, field, or record restrictions.
7. A builder can publish a version and the runtime loads that exact version.
8. Later draft edits do not silently change the published version.
9. A failed publish validation does not replace the currently active version.
10. Core flows have automated tests and pass the required CI checks.
11. Important configuration and publishing operations are auditable.

## 7. Non-functional requirements

### Security
- Tenant context is derived from authenticated membership, not trusted from client input.
- All tenant-owned reads and writes are scoped server-side.
- Secrets are never exposed to the browser or logged.
- Permissions are checked at API/data-operation boundaries.
- Input validation and safe query construction are mandatory.
- Security tests cover cross-tenant access and permission bypass attempts.

### Reliability and data integrity
- Failed writes must not leave partially updated metadata.
- Publishing must be atomic from the runtime's perspective.
- Published configuration versions are immutable.
- Database migrations are version-controlled and repeatable.

### Performance
- Use pagination for potentially large tables.
- Avoid loading entire datasets into the browser.
- Establish measurable performance targets after the first working vertical slice and baseline measurements.

### Maintainability
- Keep domain modules separated within the modular monolith.
- Use typed contracts and runtime validation at trust boundaries.
- Maintain API documentation and architecture documentation alongside implementation.
- Require lint, type-check, tests, and build checks in CI.

### Usability
- The primary builder workflow should be understandable without editing code.
- Provide preview and clear validation errors before publication.
- Use consistent empty, loading, success, and error states.

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Scope expands into a full low-code platform | Protect P0 scope and defer P2 capabilities |
| Dynamic data model becomes difficult to query | Use typed metadata, JSONB selectively, and indexed access patterns |
| Tenant data leaks across organisations | Enforce tenant scope centrally and test cross-tenant access |
| Visual builder becomes too complex | Start with a small curated component set and explicit property schemas |
| External connectors introduce security risk | Keep secrets server-side and use constrained adapters and query policies |
| Published apps break when drafts change | Use immutable snapshots and runtime version pinning |

## 9. Open decisions

These decisions require explicit review before implementation:
- Whether the first external connector is PostgreSQL or REST.
- Exact authentication provider and session/token architecture between Next.js and NestJS.
- Whether invitations are in the first MVP or a later P1 increment.
- Exact minimum set of record-level and field-level permission rules.
- Initial deployment environment and secrets-management approach.

## 10. Scope-change rule

A feature is added to P0 only when its contribution to the end-to-end MVP journey is clear and the delivery, security, testing, and documentation impact is understood. Otherwise, it remains P1/P2 or is recorded as a future idea.
