---
title: PanelForge API conventions
status: Proposed
version: 0.1
last_updated: 2026-11-10
source_of_truth: true
---

# PanelForge API conventions

## Base conventions
- REST API under `/api/v1`; use resource-oriented nouns and standard HTTP methods.
- NestJS DTOs validate all external input. Reject unknown fields where appropriate.
- Authentication is validated by the API; tenant context is resolved from authenticated membership, never trusted from request payloads.
- Verify tenant ownership for every application, resource and record lookup.
- Swagger UI: `/api/docs`; OpenAPI JSON: `/api/docs-json` (final paths configured in NestJS).
- Swagger documents PanelForge's API, not customer-connected external APIs.

## HTTP semantics
- GET reads; POST creates or initiates operations; PUT replaces; PATCH partially updates; DELETE removes/deactivates according to retention rules.
- Use 200 for successful reads/updates, 201 for creation, 202 for accepted async work, 204 for no-content success.
- Use 400 for malformed input, 401 unauthenticated, 403 forbidden, 404 inaccessible/not found, 409 conflict, 422 semantic validation where used, and 429 rate limiting.

## Route examples
- `GET /api/v1/tenants`
- `POST /api/v1/tenants`
- `GET /api/v1/applications/:applicationId/resources`
- `POST /api/v1/applications/:applicationId/resources`
- `GET /api/v1/resources/:resourceId/records`
- `POST /api/v1/resources/:resourceId/records`
- `POST /api/v1/applications/:applicationId/publish`

These are examples, not a frozen endpoint inventory.

## Pagination and filtering
- Page numbering starts at 1; default page size 25; maximum 100 initially, subject to load testing.
- List response shape:

~~~json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "totalItems": 0,
    "totalPages": 0
  }
}
~~~

- Sorting and filtering use typed allowlisted field identifiers and operators.
- Unknown fields/operators are rejected.
- Server-side record/field permission constraints are always applied; client filters cannot weaken them.
- Do not accept raw SQL or arbitrary query expressions.

## Error format
~~~json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request could not be validated.",
    "details": [],
    "requestId": "correlation-id"
  }
}
~~~

Never return stack traces, SQL details, secrets, internal policy expressions or cross-tenant information.

## Concurrency and idempotency
Use draft version/timestamp or ETag checks to detect stale updates and return 409 on conflict. Use idempotency keys for retryable operations with side effects. Publishing must atomically activate a complete snapshot.

## OpenAPI requirements
Document endpoint purpose, tags, auth, DTOs, response schemas, error codes, pagination/filtering and permission requirements using `@nestjs/swagger`. Generate and validate OpenAPI in CI. Keep the contract aligned with runtime behaviour.

## Initial endpoint groups
Identity/current user; tenants/memberships; applications; data sources; resources/fields/relationships; draft configuration/pages/views/widgets; dynamic records; roles/permissions; publish/snapshots/rollback; audit.

## Related documents
- [System architecture](../01-architecture/system-architecture.md)
- [Security and tenant isolation](../01-architecture/security-and-tenant-isolation.md)
- [Testing strategy](../06-operations/testing-strategy.md)

## Change history
| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial API conventions |
