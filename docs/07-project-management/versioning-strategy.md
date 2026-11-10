---
title: PanelForge versioning strategy
status: Proposed
version: 0.1
last_updated: 2026-11-10
source_of_truth: true
---

# PanelForge versioning strategy

PanelForge has distinct package, platform, API, database and published-configuration versions. Do not conflate them.

## Packages
Use Changesets for independently releasable shared packages and Semantic Versioning:
- MAJOR: incompatible public API change.
- MINOR: backward-compatible capability.
- PATCH: backward-compatible fix.

Only independently consumed/released packages need independent versions initially.

## Platform and containers
Tag platform releases in Git (for example, v1.0.0). Tag container images with immutable release version and commit SHA. Do not rely on mutable latest for rollback identity.

## Public API
Start with URI versioning under /api/v1. Introduce a new major version for breaking public contract changes that cannot be introduced compatibly. Add optional fields compatibly; do not change existing field meaning/type without a versioning plan. Deprecate before removal where feasible.

## Published application configuration
Each application has monotonically increasing snapshot versions (1, 2, 3...). Each snapshot records its configuration schema version, publication time/actor and immutable payload. Rollback changes the active pointer; it never edits snapshot contents.

The runtime must support known older schema versions or reject unsupported versions safely. Never silently reinterpret unknown configuration.

## Database migrations
Use reviewed, ordered Prisma migrations. Apply through deployment automation, not ad-hoc production edits. Prefer additive/expand-and-contract migrations. Destructive changes require a migration plan, backup verification and explicit review.

## Related documents
- [API conventions](../05-api/api-conventions.md)
- [Deployment and CI/CD](../06-operations/deployment-and-ci-cd.md)
- [Data model](../02-database/data-model-and-storage.md)

## Change history
| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial versioning strategy |
