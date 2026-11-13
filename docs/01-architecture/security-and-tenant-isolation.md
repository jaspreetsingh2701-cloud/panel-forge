---
title: PanelForge security and tenant isolation
status: Proposed
version: 0.2
last_updated: 2026-11-12
owner: Project maintainers
source_of_truth: true
related_adrs: [ADR-007, ADR-008]
---

# PanelForge security and tenant isolation

## 1. Purpose

This document defines the security invariants for authentication, tenant isolation, authorisation, dynamic data access, connector credentials and published applications.

Security is a platform property. It cannot be delegated to frontend visibility rules or assumed from a successful login.

## 2. Security objectives

- Prevent users from accessing data outside their tenant and application scope.
- Prevent privilege escalation through manipulated requests or configuration.
- Enforce role, resource, action, field and record permissions in trusted backend code.
- Prevent unsafe query execution and arbitrary code execution.
- Protect connector credentials and platform secrets.
- Preserve auditability for important administrative and security events.

## 3. Trust boundaries

1. Browser to web application.
2. Browser/web application to API.
3. API to identity provider.
4. API to PostgreSQL.
5. API to external data-source adapters.
6. Builder-authored configuration to runtime renderer.

Treat browser input, URL parameters, stored customer configuration and external connector responses as untrusted until validated.

## 4. Authentication

### 4.1 MVP identity model

The MVP uses custom email/password authentication implemented in NestJS. Passwords are hashed with Argon2id; plaintext passwords are never stored or logged. Email is normalized consistently before uniqueness checks. Registration creates a user, first tenant and OWNER membership atomically.

Email verification and password recovery are deferred from the first implementation slice, but must be completed before production launch. Until then, registration is a controlled learning/MVP workflow, not a production-ready identity lifecycle.

### 4.2 Access and refresh tokens

- Access token: signed JWT with a 15-minute initial lifetime.
- Refresh token: cryptographically random opaque value, rotated on every refresh.
- Persistence: store only a SHA-256 hash of the refresh token. Its high entropy makes a fast cryptographic hash appropriate; passwords require a deliberately slow hash such as Argon2id.
- Replay detection: reuse of a consumed refresh token revokes the associated session/token family.
- Session lifetime: 30-day absolute lifetime initially, with explicit revocation and expiry.
- Device model: each device/browser login receives a separate session.
- Logout: revoke the current session and clear the cookie.
- JWT validation checks signature, issuer, audience, expiration and required claims.

The JWT identifies the user; it is not proof of tenant membership.

### 4.3 Browser storage and same-origin proxy

The browser holds the short-lived access token in memory only and sends it as a bearer token. Never place access or refresh tokens in localStorage or sessionStorage.

The refresh token is delivered as a Secure, HttpOnly, SameSite=Lax cookie. Browser requests go to the Next.js same-origin proxy, which forwards the request and required authentication headers/cookies to the trusted NestJS origin. NestJS remains the authority for authentication and authorisation.

For cookie-authenticated state-changing endpoints, validate Origin and apply CSRF protection appropriate to the deployment. Configure cookie domain/path deliberately. Never log token values or forward cookies to an untrusted upstream.

### 4.4 Tenant membership

Resolve the platform user and current tenant membership server-side. Authentication answers who the user is; it does not automatically establish access to every tenant or application. The active tenant is selected by the user but verified against current membership on every protected operation.

### 4.5 Deferred identity integrations

Google sign-in and other OIDC integrations are deferred until the email/password flow works. The platform User remains the primary identity; future provider identities should link to it rather than replacing it. See ADR-007.

## 5. Tenant isolation

### 5.1 Tenant resolution

- Resolve tenant context from authenticated membership.
- Verify the requested application belongs to that tenant.
- Do not trust a client-provided tenant ID.
- Require tenant context for every tenant-owned repository/query operation.

### 5.2 Data access

All reads and writes must include tenant and application scope where relevant. A request for a record by UUID alone is insufficient; the lookup must also enforce ownership and permission.

Cross-tenant relationships must be prevented with application validation and database constraints.

### 5.3 Defence in depth

Use multiple layers:
- API guards and membership resolution.
- Domain-service authorisation.
- Tenant-aware repositories and query builders.
- Foreign keys and tenant-consistent constraints.
- Automated negative tests.
- Consider PostgreSQL row-level security after connection and transaction context patterns are established.

Never assume that one layer makes the others unnecessary.

## 6. Authorisation model

The effective policy combines:
1. Application/module visibility.
2. Resource access.
3. Action permissions: create, read, update and delete.
4. Field visibility and editability.
5. Record-level scope, such as all records, assigned records or own records.

Role assignment is scoped to a tenant and, where applicable, an application. Deny by default when no applicable grant exists. Conflicting or malformed policy data must not grant access.

### 6.1 Current implementation versus target model

The current implementation has tenant-scoped `OWNER`, `ADMIN` and `MEMBER` roles. Builder draft writes are currently limited to owners/admins. These are not yet the complete Super Admin, Builder and Consumer model.

The target product model is documented in [Authorization and role model](authorization-and-role-model.md). It introduces a platform-level Super Admin boundary and tenant/application-scoped administration and consumer permissions. This is an architectural target, not a claim that platform Super Admin or fine-grained custom roles are already implemented.

A tenant Admin must never inherit platform Super Admin authority. Platform support access must be separately authenticated, narrowly scoped and audited.

## 7. Query enforcement

The API must enforce policy before returning data:
- Validate the target resource and fields.
- Resolve the user's effective permissions.
- Add record-scope constraints to the query.
- Select only readable fields.
- Validate filters, sort expressions and pagination.
- Use parameterised operations.
- Apply the same policy to exports, aggregates and dashboard metrics.

Do not fetch unrestricted data and merely remove unauthorised rows in the browser. Do not rely on a frontend-supplied filter to enforce record scope.

## 8. Dynamic configuration and code execution

Customer configuration is declarative data.

Allowed:
- Selecting registered component types.
- Setting validated component properties.
- Selecting declared fields and views.
- Selecting predefined safe actions.

Not allowed in the MVP:
- Arbitrary JavaScript execution.
- Arbitrary SQL execution.
- Dynamic imports or customer-supplied React components.
- Unrestricted server-side expressions.
- Unsafe template evaluation.

Validate configuration both when saving and when publishing. The runtime must fail safely for unsupported component types and configuration versions.

## 9. Connector credential protection

- Keep credentials server-side.
- Store secrets in a managed secret store or encrypted secret facility.
- Persist only a secure reference in ordinary data-source metadata where possible.
- Never include secrets in API responses, logs, error messages or published snapshots.
- Apply least-privilege connector credentials.
- Restrict outbound network destinations and guard against server-side request forgery for URL-based connectors.
- Apply connection timeouts, response-size limits and safe error handling.

The exact secrets manager and connector network policy will be selected during infrastructure and connector design.

## 10. Publishing and runtime safety

- Validate drafts before publishing.
- Store immutable snapshots.
- Do not mutate a published snapshot.
- Activate a new snapshot atomically.
- Preserve the previous active snapshot if publish fails.
- Re-evaluate current user permissions on each data request.
- Treat published configuration as untrusted input that must still conform to supported schemas.

## 11. Audit and monitoring

Record security-relevant events such as login and authentication failures where supported, membership and role changes, permission changes, data-source changes, publish and rollback, sensitive data mutations and administrative actions.

Logs must not contain raw credentials, tokens or unnecessary personal data. Add alerting for suspicious access patterns before production launch.

## 12. Security test requirements

Required negative tests include:
- User from tenant A cannot read tenant B's application.
- User cannot access a record by guessing its UUID in another tenant.
- Viewer cannot create, update or delete records.
- Field-restricted user cannot read or update restricted fields.
- Record-scoped user cannot access records outside their scope.
- A published app does not bypass a revoked role assignment.
- Malformed filters and unsupported operators are rejected.
- Raw SQL and executable configuration payloads are rejected.
- Connector secrets never appear in browser responses or logs.
- Failed publish does not replace the active snapshot.

## 13. Open decisions

- Email verification and password-reset delivery/provider.
- Production password policy, abuse controls and rate limits.
- Google/OIDC account linking and identity-provider integration.
- Secrets manager and encryption-key lifecycle.
- PostgreSQL row-level security adoption and transaction context strategy.
- Audit retention and data deletion policy.
- Rate limits and query complexity budgets.
- External connector egress allowlist and SSRF controls.

These must be resolved before the corresponding production-facing capabilities are released.

## 14. Related documents

- [System architecture](system-architecture.md)
- [Engine contracts](engine-contracts.md)
- [Data model and storage](../02-database/data-model-and-storage.md)
- [Technology stack](technology-stack.md)

---

## Change history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial proposed security and tenant-isolation model |
| 0.2 | 2026-11-12 | Define custom authentication, refresh-token rotation, browser storage and proxy security |
