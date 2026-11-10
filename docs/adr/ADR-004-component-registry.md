---
title: Curated component registry
status: Proposed
date: 2026-11-10
---

# ADR-004: Curated component registry

## Context
User-configured applications need extensibility without arbitrary code execution or unbounded compatibility risk.

## Proposed decision
Use a curated registry of typed components. Each entry has a stable type ID, versioned validation schema, supported properties, data requirements and renderer. Persisted config selects registered types and validated declarative properties only.

## Alternatives
- Arbitrary customer JavaScript/React: rejected for security and reliability.
- Plugin marketplace in MVP: deferred due to sandboxing/review complexity.
- Hardcoded e-commerce pages: rejected because the engine must remain generic.

## Consequences
Predictable and accessible runtime; component capabilities are bounded by the registry and new types require platform releases.

## Status
Proposed pending architecture review.

## References
- [Engine contracts](../01-architecture/engine-contracts.md)
