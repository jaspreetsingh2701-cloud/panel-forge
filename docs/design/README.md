# PanelForge Design Documentation

This directory is the source of truth for the approved product experience and visual system.

## Documents
- [Design system](./DESIGN_SYSTEM.md) — visual foundations, tokens, themes, shared components and accessibility.
- [UX decisions](./UX_DECISIONS.md) — recorded product and interaction decisions with rationale and status.
- [Screen specifications](./SCREEN_SPECIFICATIONS.md) — requirements for the 12 approved screens and shared workflows.
- [Changelog](./CHANGELOG.md) — chronological record of design changes and approvals.

## Governance
Use these decision statuses:
- **Proposed** — under discussion; not a committed product decision.
- **Approved** — accepted direction; implementation should follow it.
- **Rejected** — explicitly not selected.
- **Superseded** — replaced by a later decision.

Material decisions should record an ID, date, status, rationale, affected screens and previous/new direction. Shared token changes must be reviewed against every affected screen and both themes.

## Implementation boundary
These documents capture the design direction approved during product design. They do not claim that the UI is implemented. The internal /design route is an approved future showcase and must use real shared tokens and components rather than a parallel set of hardcoded styles.
