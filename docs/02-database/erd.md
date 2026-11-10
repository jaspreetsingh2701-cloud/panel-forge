---
title: PanelForge logical entity relationship diagram
status: Proposed
version: 0.2
last_updated: 2026-11-10
source_of_truth: true
---

# PanelForge logical ERD

This is the logical MVP model. Exact Prisma models, composite foreign keys, delete rules and migrations are finalised during implementation review.

## Initial implementation slice

The first database migration is intentionally limited to platform identity and tenancy. The Prisma schema defines these relationships:

```mermaid
erDiagram
  USERS ||--o{ TENANT_MEMBERS : joins
  TENANTS ||--o{ TENANT_MEMBERS : has

  USERS {
    uuid id PK
    string email UK
    string display_name
    datetime created_at
    datetime updated_at
  }

  TENANTS {
    uuid id PK
    string name
    string slug UK
    string status
    datetime created_at
    datetime updated_at
  }

  TENANT_MEMBERS {
    uuid id PK
    uuid tenant_id FK
    uuid user_id FK
    string status
    datetime created_at
    datetime updated_at
  }
```

The Prisma schema and generated migration are the implementation source for this initial slice. The broader logical model below is a forward-looking MVP model; it is not a claim that all entities have already been implemented or migrated.

## Logical MVP model

```mermaid
erDiagram
  USERS ||--o{ TENANT_MEMBERS : joins
  TENANTS ||--o{ TENANT_MEMBERS : has
  TENANTS ||--o{ APPLICATIONS : owns
  TENANTS ||--o{ DATA_SOURCES : configures
  APPLICATIONS ||--o{ RESOURCES : defines
  APPLICATIONS ||--o{ PAGES : contains
  APPLICATIONS ||--o{ VIEWS : contains
  RESOURCES ||--o{ FIELDS : has
  RESOURCES ||--o{ RELATIONSHIPS : source
  RESOURCES ||--o{ DYNAMIC_RECORDS : stores
  APPLICATIONS ||--o{ DYNAMIC_RECORDS : scopes
  TENANTS ||--o{ DYNAMIC_RECORDS : isolates
  PAGES ||--o{ WIDGETS : contains
  APPLICATIONS ||--o{ CONFIGURATIONS : drafts
  APPLICATIONS ||--o{ PUBLISHED_SNAPSHOTS : publishes
  TENANTS ||--o{ ROLES : defines
  ROLES ||--o{ ROLE_PERMISSIONS : grants
  PERMISSIONS ||--o{ ROLE_PERMISSIONS : assigned
  USERS ||--o{ USER_ROLE_ASSIGNMENTS : receives
  ROLES ||--o{ USER_ROLE_ASSIGNMENTS : assigned
  TENANTS ||--o{ AUDIT_LOGS : records
  USERS ||--o{ AUDIT_LOGS : performs

  USERS {
    uuid id PK
    string email
    string display_name
  }
  TENANTS {
    uuid id PK
    string name
    string slug UK
    string status
  }
  TENANT_MEMBERS {
    uuid id PK
    uuid tenant_id FK
    uuid user_id FK
    string status
  }
  APPLICATIONS {
    uuid id PK
    uuid tenant_id FK
    string name
    string slug
    uuid active_snapshot_id
  }
  DATA_SOURCES {
    uuid id PK
    uuid tenant_id FK
    uuid application_id FK
    string type
    string secret_reference
  }
  RESOURCES {
    uuid id PK
    uuid application_id FK
    string key
    int schema_version
  }
  FIELDS {
    uuid id PK
    uuid resource_id FK
    string key
    string field_type
  }
  RELATIONSHIPS {
    uuid id PK
    uuid source_resource_id FK
    uuid target_resource_id FK
    string cardinality
  }
  DYNAMIC_RECORDS {
    uuid id PK
    uuid tenant_id FK
    uuid application_id FK
    uuid resource_id FK
    jsonb data
  }
  PAGES {
    uuid id PK
    uuid application_id FK
    string key
    jsonb layout
  }
  WIDGETS {
    uuid id PK
    uuid page_id FK
    string component_type
    jsonb config
  }
  VIEWS {
    uuid id PK
    uuid application_id FK
    uuid resource_id FK
    jsonb definition
  }
  CONFIGURATIONS {
    uuid id PK
    uuid application_id FK
    int draft_version
    jsonb payload
  }
  PUBLISHED_SNAPSHOTS {
    uuid id PK
    uuid application_id FK
    int version
    int config_schema_version
    jsonb payload
  }
  ROLES {
    uuid id PK
    uuid tenant_id FK
    uuid application_id
    string name
  }
  PERMISSIONS {
    uuid id PK
    string resource_action
    string scope
  }
  ROLE_PERMISSIONS {
    uuid role_id FK
    uuid permission_id FK
  }
  USER_ROLE_ASSIGNMENTS {
    uuid id PK
    uuid user_id FK
    uuid role_id FK
    uuid tenant_id FK
    uuid application_id
  }
  AUDIT_LOGS {
    uuid id PK
    uuid tenant_id FK
    uuid actor_user_id FK
    string event_type
    jsonb safe_metadata
  }
```

## Integrity and uniqueness rules

- Membership unique on (tenant_id, user_id).
- Application slug unique within tenant.
- Resource key unique within application.
- Field key unique within resource.
- Snapshot version unique within application.
- Dynamic records carry tenant, application and resource scope; all ownership references must agree.
- Relationships connect resources in the same application.
- The active snapshot pointer references a snapshot in that application.
- Application-scoped roles and assignments must be tenant/application consistent.
- Audit records are tenant-scoped; actor may be nullable for system events.
- Index tenant/application/resource scope and frequently joined foreign keys.
- Use composite constraints where practical to prevent cross-tenant references.
- Avoid cascading deletion of audit history or published snapshots.

## Deliberately deferred

Workflow executions, API credentials, role inheritance, external schema caches and per-tenant physical tables are not required for the first migration.

## Related documents

- [Data model and storage](data-model-and-storage.md)
- [Security and tenant isolation](../01-architecture/security-and-tenant-isolation.md)

## Change history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial logical ERD |
| 0.2 | 2026-11-10 | Add the initial identity and tenancy implementation slice |
