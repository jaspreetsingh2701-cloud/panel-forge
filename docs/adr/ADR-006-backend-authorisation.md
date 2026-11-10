---
title: Backend enforcement of tenant and role permissions
status: Proposed
date: 2026-11-10
---

# ADR-006: Backend enforcement of tenant and role permissions

## Context
Frontend-only permission checks can be bypassed by direct API calls and are not a security boundary.

## Proposed decision
The backend is authoritative for tenant membership, application access, resource actions, field permissions and record scopes. The frontend may hide controls for usability, but every API read and mutation checks access independently. Deny by default.

## Alternatives
- Frontend-only checks: insecure.
- Trust browser tenant/role claims: client-controlled.
- Database RLS alone: insufficient for all product policy context; consider as defence in depth.

## Consequences
Consistent enforcement and testable boundaries; every query/mutation must apply policy and permission caching needs care.

## Status
Proposed pending security review.

## References
- [Security and tenant isolation](../01-architecture/security-and-tenant-isolation.md)
- [Testing strategy](../06-operations/testing-strategy.md)
