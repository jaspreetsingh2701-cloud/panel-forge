# Documentation conventions

**Status:** Approved baseline for Phase 0  
**Applies to:** All documentation in this repository

## 1. General rules

- Use Markdown (`.md`) for project documentation.
- Write in clear, direct language. Define specialised terms in the glossary.
- Prefer one authoritative document per subject.
- Link to related documents rather than copying large sections.
- Keep examples consistent with the currently approved architecture.
- Mark unresolved decisions explicitly; do not present assumptions as facts.

## 2. Document metadata

Use this frontmatter for substantive design documents:

```yaml
---
title: Document title
status: Proposed
version: 0.1
last_updated: YYYY-MM-DD
owner: Project maintainers
source_of_truth: true
related_adrs: []
---
```

For a document that is not authoritative, set `source_of_truth: false` and link to the authoritative document.

## 3. Status lifecycle

- `Proposed`: awaiting review.
- `Approved`: current accepted design.
- `Implemented`: implementation and verification are complete.
- `Superseded`: replaced by a newer decision or document.

Do not use `Implemented` to mean merely that a document has been written.

## 4. Updating documentation

For every meaningful change:

1. Identify the affected product, architecture, database, API, security, operations and project-management documents.
2. Update the authoritative document(s).
3. Create an ADR if the change materially alters an architectural decision.
4. Update the documentation change log when that tracker is introduced.
5. Include documentation changes in the same pull request as the related implementation.
6. Review links and examples for consistency.

## 5. Writing and formatting

- Use sentence case for headings.
- Use fenced code blocks with a language identifier where applicable.
- Use relative links for files within this repository.
- Use tables for compact comparisons; use prose for reasoning.
- Include diagrams when they materially improve understanding.
- Avoid duplicating API schemas that can be generated from the implementation.

## 6. Architecture Decision Records

ADRs are numbered sequentially: `ADR-001`, `ADR-002`, and so on.

Once an ADR is accepted, preserve its history. If the decision changes, create a new ADR and mark the older record as `Superseded` with a link to the replacement.

See [`adr/README.md`](adr/README.md) and [`adr/ADR-TEMPLATE.md`](adr/ADR-TEMPLATE.md).

## 7. Review checklist

- [ ] The document has a clear purpose and status.
- [ ] Assumptions and unresolved questions are identified.
- [ ] Related documents are linked.
- [ ] Examples match the current approved design.
- [ ] No secrets, credentials or personal data are included.
- [ ] Material architecture decisions have an ADR.
