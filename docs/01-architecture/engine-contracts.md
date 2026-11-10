---
title: PanelForge engine contracts
status: Proposed
version: 0.1
last_updated: 2026-11-10
owner: Project maintainers
source_of_truth: true
related_adrs: []
---

# PanelForge engine contracts

## 1. Purpose

This document defines the responsibilities and interaction contracts between PanelForge's core engines. It complements the [system architecture](system-architecture.md) and [technology stack](technology-stack.md).

The goal is to prevent the visual builder, runtime renderer, metadata services, query execution and authorisation logic from becoming tightly coupled.

## 2. Contract principles

- Contracts describe intent and data, not executable customer code.
- Validate data at every trust boundary.
- Use stable identifiers for resources, fields, components and configuration versions.
- Include tenant and application context in server-side service calls.
- Never let a frontend-provided tenant identifier establish authority.
- Keep policy evaluation separate from presentation.
- Return typed success and failure results; do not hide failures behind empty data.
- Version persisted configuration and externally consumed contracts deliberately.

## 3. Engine responsibilities

| Engine | Input | Output | Owns |
|---|---|---|---|
| Metadata | Resource, field and page definitions | Validated metadata and schema versions | Metadata lifecycle |
| Component registry | Component type and configuration | Validated component definition | Allowlisted component catalogue |
| Renderer | Published page configuration | Rendered UI tree | UI composition |
| Query | Resource query and trusted context | Authorised records and pagination | Safe data access |
| Permission | Principal, application, action and target | Allow/deny and applicable constraints | Policy evaluation |
| Publishing | Draft configuration and dependencies | Immutable published snapshot | Publication lifecycle |
| Data-source adapter | Validated connector operation | Normalised result or typed error | Connector-specific protocol |

## 4. Shared request context

Backend engine calls that operate on tenant-owned data must receive a trusted context produced by authentication and membership resolution.

Illustrative TypeScript contract:

~~~ts
type RequestContext = {
  userId: string;
  tenantId: string;
  applicationId?: string;
  correlationId: string;
};
~~~

This is a conceptual contract, not a final implementation schema. The API constructs this context. It must never copy an untrusted tenant identifier directly from a request body into the context.

A service must verify that the application belongs to the tenant before using the application identifier.

## 5. Metadata contract

Metadata describes an application's schema and presentation configuration.

Core concepts:
- Resource: a logical collection such as products or orders.
- Field: a typed attribute belonging to a resource.
- Relationship: a declared link between resources.
- View: a configured presentation/query definition.
- Page: a composition of layouts and components.
- Configuration version: the version of the metadata or configuration schema.

Every resource and field receives a stable identifier. Human-readable keys may be renamed, but stable IDs must remain unchanged. Renames must update or migrate dependent references in a controlled manner.

Metadata validation checks:
- Unique resource and field keys within their defined scope.
- Supported field types and valid type-specific options.
- Valid relationship endpoints and cardinality.
- Valid references from views and components.
- Supported configuration version.
- No unknown or executable configuration properties.

## 6. Component registry contract

A registry entry conceptually contains:

~~~ts
type ComponentDefinition<Props, DataRequirements> = {
  type: string;
  configVersion: number;
  validate: (input: unknown) => Props;
  dataRequirements: DataRequirements;
  render: (props: Props) => React.ReactNode;
};
~~~

The exact TypeScript API will be finalised during implementation. The registry is an allowlist: customer configuration can select registered component types but cannot register arbitrary executable components.

Initial component types may include table, form, metric-card, chart, text, container and tabs. Each type has a strict schema and an explicit set of supported properties.

## 7. Renderer contract

The renderer accepts validated published configuration and runtime services. It must not query the database directly or decide authorisation.

Responsibilities:
1. Resolve a component type through the registry.
2. Validate or receive already validated component configuration.
3. Resolve declared data requirements through the API.
4. Render loading, empty, success or error states.
5. Handle unsupported configuration safely.

The renderer must not evaluate dynamic JavaScript or execute arbitrary expressions from stored configuration.

## 8. Query engine contract

A query request describes the intended operation; it is not SQL.

Illustrative request:

~~~ts
type ResourceQuery = {
  resourceId: string;
  fields?: string[];
  filters?: FilterExpression[];
  sort?: SortExpression[];
  page: number;
  pageSize: number;
};
~~~

The backend must:
- Resolve the resource inside the authenticated tenant and application.
- Validate field identifiers, operators and value types.
- Enforce maximum page size and query complexity limits.
- Ask the permission engine for applicable row and field constraints.
- Apply constraints before data leaves the trusted data layer.
- Use parameterised database operations.
- Return only permitted fields and records.

The exact filter grammar and limits will be defined in the API and query-engine specifications.

## 9. Permission engine contract

The permission engine evaluates a principal's access to a target action and may return constraints in addition to an allow/deny result.

Illustrative result:

~~~ts
type PermissionDecision =
  | { allowed: false; reasonCode: string }
  | {
      allowed: true;
      readableFieldIds: string[];
      editableFieldIds: string[];
      recordScope: RecordScope;
    };
~~~

Do not expose internal policy details or sensitive reasons to unauthorised clients. The API maps decisions to safe response errors.

The query engine must apply field and record constraints to the actual query. A permission check that only hides UI controls is insufficient.

## 10. Publishing contract

Publishing receives a draft identifier and trusted request context. It must not accept a browser-supplied snapshot as already trusted.

The publishing service:
1. Loads the draft in tenant/application scope.
2. Validates the configuration schema.
3. Validates component registry references.
4. Validates resource, field and data-source dependencies.
5. Creates an immutable snapshot.
6. Activates the new version atomically.
7. Emits an audit event.

A failed publish must leave the current active version unchanged. A rollback activates a previous immutable snapshot; it does not rewrite its contents.

## 11. Data-source adapter contract

The adapter boundary normalises connector-specific operations.

Illustrative interface:

~~~ts
interface DataSourceAdapter {
  testConnection(): Promise<ConnectionTestResult>;
  discoverSchema(): Promise<DiscoveredSchema>;
  execute(query: ValidatedConnectorQuery): Promise<ConnectorResult>;
}
~~~

Adapters must not bypass tenant/application authorisation. Credentials are resolved server-side from secure references and never returned to the browser.

The managed PostgreSQL implementation is the first data path. REST is the next planned connector. GraphQL and MySQL are deferred.

## 12. Error contract

Use stable error codes and safe messages.

| Code | Meaning |
|---|---|
| UNAUTHENTICATED | Valid authentication is required |
| FORBIDDEN | Caller is not authorised |
| RESOURCE_NOT_FOUND | Resource does not exist in the caller's accessible scope |
| VALIDATION_FAILED | Input or configuration failed validation |
| UNSUPPORTED_COMPONENT | Component type or version is not supported |
| CONFIGURATION_VERSION_UNSUPPORTED | Configuration schema cannot be interpreted |
| QUERY_LIMIT_EXCEEDED | Query exceeds configured safety limits |
| DATA_SOURCE_UNAVAILABLE | Connector could not complete the operation |
| PUBLISH_VALIDATION_FAILED | Draft cannot be published |
| CONFLICT | Concurrent or stale update detected |

Avoid disclosing whether a resource exists in another tenant. Return safe not-found or forbidden responses according to the API security policy.

## 13. Contract testing

Each engine should have:
- Unit tests for validation and business rules.
- Contract tests for its public inputs and outputs.
- Negative tests for malformed and unsupported input.
- Integration tests where persistence or another engine is involved.
- Security tests for tenant and permission boundaries.

Changes to a shared contract must update consumers and tests in the same pull request.

## 14. Related documents

- [System architecture](system-architecture.md)
- [Technology stack](technology-stack.md)
- [MVP scope](../00-product/mvp-scope.md)
- [Documentation conventions](../documentation-conventions.md)

---

## Change history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial proposed core-engine contracts |
