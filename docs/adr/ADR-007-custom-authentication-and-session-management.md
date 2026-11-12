# ADR-007: Custom authentication and session management

- **Status:** Proposed
- **Date:** 2026-11-12
- **Related:** [Security and tenant isolation](../01-architecture/security-and-tenant-isolation.md), [Data model and storage](../02-database/data-model-and-storage.md)

## Context

PanelForge is both a SaaS product and a deliberate learning project. The first working version should implement a complete identity lifecycle inside NestJS so the project can teach password hashing, token validation, session persistence, refresh rotation, revocation and tenant membership.

Managed identity services remain valuable alternatives to study after the baseline works. They are not the initial implementation because we want to understand the identity boundary before comparing managed providers.

## Decision

Use custom email/password authentication in NestJS for the MVP.

- Hash passwords with Argon2id.
- Normalize email addresses and enforce a unique database constraint.
- Issue a short-lived signed JWT access token (initial target: 15 minutes).
- Issue a cryptographically random opaque refresh token.
- Store only a SHA-256 hash of the refresh token in PostgreSQL.
- Rotate refresh tokens on every successful refresh.
- Detect reuse of consumed tokens and revoke the associated session/token family.
- Use one session per device/browser, with explicit expiry and revocation.
- Initial absolute session lifetime: 30 days; revisit after threat modelling.
- Keep the access token in browser memory; never store bearer or refresh tokens in localStorage/sessionStorage.
- Deliver the refresh token through a Secure, HttpOnly, SameSite=Lax cookie.
- Require email verification and password recovery before production launch, even though they are deferred from the first implementation slice.
- Create the user, first tenant, OWNER membership and initial session in one database transaction.

Google sign-in and other OIDC integrations are deferred. The User record remains the platform identity; future provider identities should link to it.

## Alternatives considered

| Option | Benefits | Costs / trade-offs | Decision |
|---|---|---|---|
| Custom NestJS auth | Maximum learning; full control of user/session model; no identity vendor dependency | We own secure implementation, abuse prevention, recovery, verification, monitoring and maintenance | **Selected for MVP** |
| Managed provider such as Clerk/Auth0 | Mature identity features; faster production identity, MFA and recovery | Vendor cost/lock-in; provider integration and tenant mapping still required | Revisit after MVP |
| AWS Cognito | Managed AWS-native identity; useful AWS learning | AWS-specific configuration and provider coupling; application membership and authorisation remain ours | Post-MVP comparison |
| Google OAuth/OIDC | Convenient sign-in and protocol learning | External identity linking, callback/state/nonce handling and account lifecycle complexity | Deferred |

## Consequences

### Positive
- Learn identity fundamentals and own the initial user/session data model.
- Authentication remains independent from tenant and application authorisation.
- Provider integrations can be added behind an identity boundary later.
- Local development does not require an external identity tenant.

### Negative and risks
- Authentication is security-sensitive and easy to implement incorrectly.
- We must build email verification, password reset, rate limiting, abuse controls, account recovery and monitoring before production.
- Token rotation and concurrent refresh requests require careful transactional handling.
- Custom implementation must receive a security review before real customer data is used.

## Acceptance and revisit criteria

- Registration creates user, tenant and OWNER membership atomically.
- Passwords are stored only as Argon2id hashes.
- Access JWT validation checks signature, issuer, audience and expiry.
- Refresh tokens are stored only as hashes, rotated atomically and revocable.
- Reuse of a consumed refresh token is detected.
- Logout revokes the current session.
- Cross-tenant access is denied independently of successful authentication.
- Revisit managed identity options after the MVP vertical slice works and before production launch if operational/security requirements warrant it.

## Learning follow-up

After the baseline works, complete the identity-provider comparison in [Post-MVP engineering learning checklist](../07-project-management/post-mvp-engineering-learning-checklist.md): custom auth hardening, Google OAuth/OIDC, Clerk/Auth0 and Cognito. A learning experiment is not production-ready without security review.
