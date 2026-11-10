# Architecture Decision Records (ADRs)

ADRs capture important technical and architectural decisions, including their context, alternatives, consequences and status.

## When to create an ADR

Create an ADR when a decision materially affects one or more of:

- System architecture or module boundaries.
- Technology selection or replacement.
- Database strategy, tenancy or data ownership.
- Authentication, authorisation or security boundaries.
- Metadata, rendering or query execution models.
- API compatibility, publishing or versioning.
- Deployment, reliability or operational strategy.

Small implementation details do not need an ADR unless they establish a broader architectural constraint.

## Naming and numbering

Use:

```text
ADR-001-short-decision-title.md
ADR-002-short-decision-title.md
```

Numbers are sequential and never reused.

## Lifecycle

1. Draft the ADR using `ADR-TEMPLATE.md`.
2. Review the context, alternatives and consequences.
3. Mark it `Accepted` when approved.
4. Link it from affected architecture documents.
5. If replaced, mark it `Superseded` and link to the replacing ADR.

Do not delete or silently rewrite accepted ADRs.

## Initial ADR candidates

These are candidates, not yet approved decisions:

- Modular monolith as the initial deployment architecture.
- PostgreSQL as the primary platform database.
- JSONB for user-defined/custom field values.
