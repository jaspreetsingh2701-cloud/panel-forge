---
title: Immutable published application snapshots
status: Proposed
date: 2026-11-10
---

# ADR-005: Immutable published application snapshots

## Context
Builders must be able to edit drafts without changing the live application unexpectedly. Rollback/audit require reliable history.

## Proposed decision
Separate mutable drafts from immutable published snapshots. Validate draft, create snapshot and atomically update active snapshot pointer. Rollback reactivates a prior snapshot without editing it. Runtime always evaluates current permissions; snapshots do not freeze authorisation.

## Alternatives
- Runtime reads live draft: exposes in-progress edits.
- Mutate one published config row: loses reliable history.
- Snapshot customer business data: unnecessary; snapshot app configuration only.

## Consequences
Predictable releases and rollback; snapshot compatibility and transactional activation are required.

## Status
Proposed pending publishing lifecycle review.

## References
- [Data model](../02-database/data-model-and-storage.md)
