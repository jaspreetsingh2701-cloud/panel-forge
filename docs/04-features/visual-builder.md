---
title: Visual builder
status: Proposed
version: 0.1
last_updated: 2026-11-13
source_of_truth: true
related_adrs: []
---

# Visual builder

## Purpose
Give workspace members a visual, declarative way to compose an application page from approved components. The builder must remain separate from the runtime renderer and must never execute customer-supplied JavaScript.

## Initial delivery boundary — Phase 4.1
- Provide an application-scoped builder route.
- Present a component palette, central canvas and properties inspector.
- Register curated component identifiers: text, metric, table, form and chart.
- Allow users to add components, select them, edit basic properties and remove them.
- Render illustrative previews using safe, built-in React components.
- Resolve the application through the authenticated tenant-scoped applications API.
- Keep editor state in memory only and label it as an unsaved local preview.

This first increment does not persist page configuration and does not claim to publish or preview a live application.

## Component registry contract
Each registry entry declares a stable type identifier, label, category, description, safe defaults and supported property controls. The registry is an allowlist. Unknown component types must not be rendered. Configuration contains data only; it cannot contain React component references, JavaScript, HTML injection or executable expressions.

The initial registry lives in apps/web/src/features/builder/component-registry.ts. It may move to packages/component-registry when the runtime renderer consumes the same contract across application boundaries.

## Editor layout
- **Palette:** discover and add registered components.
- **Canvas:** select and inspect the current in-memory page composition.
- **Inspector:** edit the selected component's supported properties.

The canvas is not a freeform layout engine. Phase 4.1 provides the editor shell; Phase 4.2 adds ordering through keyboard-accessible move controls and native drag-and-drop. Resource binding, field mapping and persistence remain separate follow-up increments.

## Security and tenancy
- The builder route loads the application from the authenticated tenant-scoped applications endpoint.
- A client-supplied application ID is only a lookup key; the API response must prove that the application belongs to the current tenant.
- The registry is a fixed allowlist, never a plugin execution mechanism.
- Preview content is rendered as React text, not injected HTML.
- Backend authorisation remains authoritative for every future save, resource binding and publish operation.

## Acceptance criteria
1. A signed-in workspace member can open the builder for an application returned by their tenant-scoped applications API.
2. An application outside the current tenant is not loaded; the UI shows a safe not-found state.
3. The editor displays palette, canvas and inspector regions.
4. Users can add each registered component type, select it, edit supported properties and remove it.
5. Unknown component identifiers are rejected by registry helpers.
6. The UI clearly communicates that changes are not persisted.
7. Registry unit tests, web typecheck, lint and production build pass in CI.

## Phase 4.2 — Canvas interactions and ordering
- Select a component from its canvas toolbar or preview surface.
- Move components up and down with labelled, keyboard-operable controls.
- Reorder components by dragging the dedicated drag handle onto another component.
- Keep the selected component selected after a move and choose a predictable neighbouring component after deletion.
- Announce add, move and remove actions through a polite live region.
- Keep ordering in memory only; do not imply that the composition has been saved.

## Phase 4.3 — Responsive layout primitives
- Configure each canvas component as full-width, half-width or one-third width on larger screens.
- Use a 12-column CSS grid with tablet adjustments and a single-column mobile layout.
- Configure compact, comfortable or spacious internal component spacing.
- Expose layout settings through labelled inspector controls.
- Preserve layout settings as data-only in-memory configuration; no custom CSS or executable values are accepted.
- Keep the existing unsaved local-preview boundary.


## Phase 4.5 — Draft configuration persistence and restore

- Persist the builder's ordered component configuration as JSONB on the owning application.
- Restore the saved component list and layout settings when the builder is opened.
- Save explicitly; do not auto-save or imply that a draft has been published.
- Restrict writes to active workspace owners and admins. Active workspace members may load the saved configuration.
- Validate every component against the fixed registry contract at the API boundary: component IDs, type allowlist, supported text properties, layout width and spacing, and a maximum of 100 components.
- Use a dedicated, monotonically increasing `builderVersion` as an optimistic concurrency token. Reject stale saves with HTTP 409 instead of overwriting a newer version.
- Warn before the browser tab is closed or refreshed while local edits are unsaved. On a stale-save conflict, ask the user to reload the saved version before continuing.
- Keep configuration data-only. Do not accept executable code, arbitrary HTML, custom component names or arbitrary CSS.
- Saving persists a draft configuration only. Publishing, runtime rendering and resource binding remain separate capabilities.

### API contract

- `GET /api/v1/tenants/:tenantId/applications/:applicationId/builder` returns `components` and the current `version` token.
- `PUT /api/v1/tenants/:tenantId/applications/:applicationId/builder` accepts `expectedVersion` and `components`, and returns the saved configuration with its incremented `version` token.
- A stale `expectedUpdatedAt` returns HTTP 409. The client must not silently retry with a newer token.

### Acceptance criteria

1. Reopening an application restores component types, properties, order, widths and spacing.
2. Explicit save persists the current composition and updates the saved state indicator.
3. An unsaved edit is indicated and browser unload displays the native confirmation prompt.
4. Workspace members can read the saved configuration; only owners and admins can write it.
5. Invalid component types, malformed layout values, unknown properties and more than 100 components are rejected.
6. Concurrent edits cannot silently overwrite one another.
7. Migration, API service tests, web typecheck, lint and production build pass in CI.

## Follow-up increments
- 4.4 Resource-bound forms and tables.
- 4.5 Draft configuration persistence and restore — delivered in the current implementation.
- 4.6 Preview and validation feedback.
