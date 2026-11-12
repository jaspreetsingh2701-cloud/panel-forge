---
title: PanelForge data model and storage
status: Proposed
version: 0.3
last_updated: 2026-11-12
owner: Project maintainers
source_of_truth: true
related_adrs: [ADR-002, ADR-007]
---

# PanelForge data model and storage

## 1. Purpose

This document proposes the logical data model and storage strategy for the PanelForge MVP. It is a design baseline, not a replacement for the Prisma schema, migrations or reviewed ERD.

The design uses PostgreSQL for platform data and managed application records. Relational columns represent stable platform concepts; JSONB stores validated user-defined attributes and suitable versioned configuration documents.

## 2. Storage principles

- PostgreSQL is the managed platform database for the MVP.
- Model platform identity, ownership and relationships relationally.
- Use JSONB for flexible user-defined record values and configuration payloads.
- Store stable IDs for resources and fields; do not depend on display labels.
- Scope every tenant-owned object to a tenant.
- Enforce relationships with foreign keys and database constraints.
- Use transactions for multi-step operations such as publishing.
- Keep secrets out of ordinary metadata and application configuration JSON.
- Add indexes based on real query patterns and measured performance.

## 3. Logical entity groups

### Identity and tenancy

| Entity | Purpose |
|---|---|
| users | Platform user identity and password hash |
| tenants | Organisation/workspace |
| tenant_members | User membership, status and tenant-scoped role |
| auth_sessions | Browser/device login session with expiry and revocation state |
| refresh_tokens | Hashed refresh-token records supporting rotation and replay detection |
| invitations | Future invitation lifecycle, inviter and invitee details |

### Application and metadata

| Entity | Purpose |
|---|---|
| applications | Configurable admin applications owned by a tenant |
| data_sources | Connector definitions and secure credential references |
| resources | Logical data collections |
| fields | Typed attributes of resources |
| relationships | Links between resources |
| views | Saved table/list/query configurations |
| pages | Application page definitions |
| widgets | Page component configurations |

### Records, security and release

| Entity | Purpose |
|---|---|
| dynamic_records | Managed user/application data |
| roles | Named permission bundles |
| permissions | Permission definitions |
| role_permissions | Role-to-permission mapping |
| user_role_assignments | User role assignment scoped to tenant/application |
| configurations | Mutable draft configuration |
| published_snapshots | Immutable published configuration versions |
| audit_logs | Security and administrative event history |

The final ERD will resolve exact foreign keys, cardinality, uniqueness and cascade behaviour.

## 4. Tenant ownership

Every tenant-owned entity must have a direct tenant identifier or an enforceable ownership path through a parent record.

Recommended explicit tenant ownership for high-risk/query-heavy entities includes applications, data_sources, dynamic_records, published_snapshots and audit_logs.

For child entities such as fields and widgets, enforce that their parent belongs to the same tenant/application. Consider composite foreign keys such as (tenant_id, application_id) to prevent cross-tenant references at the database layer.

The API must derive tenant context from authenticated membership. A tenant ID in a URL or request body is only a selector that must be checked, never proof of access.

## 5. Managed dynamic record storage

### 5.1 Proposed table

The initial managed-record model uses a shared table conceptually shaped like:

~~~sql
CREATE TABLE dynamic_records (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  application_id UUID NOT NULL,
  resource_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
~~~

This is illustrative SQL. The production schema must include appropriate foreign keys, tenant-consistent composite constraints, indexes and migration decisions.

### 5.2 Why JSONB

JSONB supports tenant-defined fields without requiring a physical database migration every time a builder adds a custom field. The metadata engine defines the allowed shape and types; the query engine validates incoming values against that metadata.

JSONB does not eliminate schema validation. It is not permission to store arbitrary unbounded or unvalidated payloads.

### 5.3 Indexing

Start with indexes that support mandatory scoping and common lookups:
- (tenant_id, application_id, resource_id)
- Primary key on id
- Foreign-key supporting indexes where required

Add targeted JSONB expression or GIN indexes only for fields and operators that are actually queried. Avoid indexing every JSONB key by default because it increases write and storage costs.

### 5.4 Query constraints

The query engine must:
- Validate filter field IDs against resource metadata.
- Validate operators against the field type.
- Validate and normalise values.
- Enforce pagination and maximum page size.
- Apply record-level permissions before returning rows.
- Select only permitted fields.
- Use parameterised database operations.

Do not expose raw SQL or arbitrary JSONPath expressions to application builders.

## 6. Metadata and schema evolution

A resource and each field have stable IDs. Field keys and labels are mutable display/schema properties and must not be used as permanent identity.

Metadata should record resource ID and stable key, schema version, field ID/key/type/options, required/default/validation settings, and timestamps.

When a field is renamed or its type changes, the platform must define a migration or compatibility policy. Incompatible type changes must not silently reinterpret existing JSONB values.

For the MVP:
- Support adding fields.
- Support safe label/key changes with reference updates.
- Support field removal only with an explicit impact check.
- Defer complex background data migrations and arbitrary type conversions.

## 7. Draft configuration and published snapshots

Draft configuration is mutable and belongs to an application. A published snapshot is immutable and records the complete validated configuration needed by the runtime, plus the schema/configuration version and publication metadata.

Conceptual snapshot fields:
- id
- tenant_id
- application_id
- version number
- configuration schema version
- snapshot payload
- published_by
- published_at
- optional content hash for integrity checking

Maintain an application pointer to its active published snapshot. Create the snapshot and update the pointer in a transaction. A failed publish must not change the active pointer.

Rollback selects an earlier snapshot as active; it does not edit that snapshot.

## 8. Indexing and performance principles

- Index tenant and application scoping columns.
- Index foreign keys used in joins.
- Add unique constraints for tenant-scoped slugs and resource/field keys.
- Use pagination for dynamic tables.
- Set query timeouts and page-size limits.
- Measure real queries before adding broad JSONB indexes.
- Review query plans as data volume grows.

## 9. Data retention and audit

Audit events should capture membership and role changes, data-source changes, resource and field changes, publish and rollback, sensitive record mutations and administrative actions.

Avoid storing passwords, access tokens, connector secrets or unnecessary personal data in audit payloads. Define retention and deletion policy before commercial production launch.

## 10. Database security

- Use parameterised queries.
- Apply least-privilege database credentials.
- Keep migrations controlled and reviewed.
- Do not expose database credentials to the browser.
- Test tenant isolation and permission enforcement at the API and query layers.
- Evaluate PostgreSQL row-level security as defence in depth, not as a substitute for application checks.
- Back up the database and test restoration before production use.

## 11. Initial implementation slice

The first Prisma schema intentionally establishes only the identity and tenancy foundation:

| Prisma model | PostgreSQL table | Purpose |
|---|---|---|
| `User` | `users` | Platform user identity, unique email and optional display name |
| `Tenant` | `tenants` | Organisation/workspace with unique slug and lifecycle status |
| `TenantMember` | `tenant_members` | User-to-tenant membership with status and unique tenant/user pair |

The initial schema uses UUID primary keys, timestamp columns and relational foreign keys. Membership records reference both a user and tenant. Deleting a user or tenant cascades to its membership rows; audit history and published snapshots will use stricter retention rules when those models are introduced.

The Prisma schema is the implementation source for these models. The initial migration created User, Tenant and TenantMember. The Phase 2.1 migration adds password/email-verification fields, tenant roles, AuthSession and RefreshToken. These schema and migration changes are awaiting local Prisma validation and review; the broader logical model remains forward-looking, not a claim that every listed entity exists in the database.

### Authentication model

The existing Prisma schema already establishes User, Tenant and TenantMember. Phase 2.1 extends these models rather than replacing them.

| Prisma model | Key fields | Notes |
|---|---|---|
| User | email, passwordHash, displayName, emailVerifiedAt | Normalized unique email; nullable Argon2id hash to permit future OIDC-only identities |
| Tenant | name, slug, status | First tenant is created during registration |
| TenantMember | tenantId, userId, role, status | Unique tenant/user pair; registration explicitly assigns OWNER (schema default is MEMBER) |
| AuthSession | userId, createdAt, expiresAt, revokedAt, lastUsedAt | One row per device/browser session |
| RefreshToken | sessionId, tokenHash, expiresAt, consumedAt, revokedAt | Store hash only; retain consumed-token evidence for replay detection |

Initial tenant roles are OWNER, ADMIN and MEMBER. These are tenant-administration roles, not the future application-level Editor/Viewer permission model. Fine-grained resource, field and record permissions will be designed with the permission engine.

A refresh token is a high-entropy opaque random secret. Store a SHA-256 hash rather than the raw token. Passwords are human-chosen and require a deliberately slow password hash such as Argon2id; machine-generated refresh tokens have high entropy and can use a fast cryptographic hash.

A refresh operation must atomically consume the presented token and create its replacement. If a consumed token is presented again, treat it as possible token theft and revoke the affected session/token family. Multiple devices create independent sessions.

## 12. Authentication transaction and session lifecycle

Registration is a single database transaction:

1. Validate and normalize email and validate the requested tenant name.
2. Hash the password with Argon2id before entering the transaction where practical.
3. Create the user.
4. Create the first tenant and a collision-safe slug.
5. Create tenant membership with OWNER role.
6. Create the authentication session.
7. Create the initial refresh-token hash record.
8. Commit, then issue the access JWT and set the refresh cookie.

A failure at any database step rolls back all database records. Do not create a user without the associated first tenant and OWNER membership.

Refresh rotation must use a transaction and conditional consume/update so concurrent refresh requests cannot both successfully rotate the same token. Keep enough token history to detect replay until the session retention window expires.
## 13. Deferred storage approaches

Not part of the first MVP:
- Dedicated physical tables for every tenant-defined resource.
- Database-per-tenant.
- Multi-region write architecture.
- Arbitrary customer SQL.
- Automatic complex type migration.
- Full data warehouse or event-streaming platform.

These options may be reconsidered when workload, compliance or customer isolation requirements justify their operational cost.

## 14. Related documents

- [System architecture](../01-architecture/system-architecture.md)
- [Engine contracts](../01-architecture/engine-contracts.md)
- [Technology stack](../01-architecture/technology-stack.md)
- [MVP scope](../00-product/mvp-scope.md)

---

## Change history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial proposed logical data model and storage strategy |
| 0.2 | 2026-11-10 | Record the initial Prisma identity and tenancy schema slice |
| 0.3 | 2026-11-12 | Add custom authentication, tenant roles, session and refresh-token storage design |
