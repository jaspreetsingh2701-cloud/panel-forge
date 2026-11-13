---
title: PanelForge builder help
status: Active
version: 1.0
last_updated: 2026-11-13
source_of_truth: true
---

# PanelForge builder help

This is the canonical, reusable help content for the PanelForge builder. The future in-app `/help` area, tutorials, onboarding guides and contextual help should render or link to this file rather than maintain separate copies.

> **Current boundary:** the builder saves draft configurations and previews resource-backed components. Publishing and end-user form submissions are not available yet.

## What you can build

| Component | Current behaviour |
|---|---|
| Text block | Editable heading and copy preview |
| Metric card | Resource aggregation: count, sum, average, minimum or maximum |
| Data table | Read-only preview of resource records with configurable columns |
| Form | Schema preview only; submission is disabled |
| Chart | Grouped aggregate preview using up to 500 recent records |

## Create your first application

1. Sign in to your PanelForge workspace.
2. Open **Applications** and create an application.
3. Choose **Manage data** and create a resource.
4. Add fields. Use the **Number** type for values used by sum, average, minimum or maximum.
5. Add records so previews have data.
6. Return to the application and open **Builder**.

## Build a page

1. Choose a component from the left **Components** panel.
2. Select it on the canvas to open **Properties**.
3. Set a title and supporting text.
4. For a table, form, metric or chart, choose a resource from **Data source**.
5. For a table, select the visible fields.
6. For a metric or chart, select an aggregation. Every aggregation other than Count needs a Number field.
7. For a chart, optionally choose a **Group by** field.
8. Configure width and spacing under **Layout**.
9. Reorder components using the arrow controls or drag handle.

## Edit efficiently

| Action | Shortcut |
|---|---|
| Undo | Ctrl/Cmd + Z |
| Redo | Ctrl/Cmd + Shift + Z |
| Duplicate selected component | Ctrl/Cmd + D |
| Remove selected component | Delete or Backspace |

Shortcuts are ignored while focus is inside an input, text area or select. Undo/redo history is in-memory for the current editing session and limited to 50 steps. The inspector also provides Duplicate and Remove actions.

## Validate and save

- Give every component a title.
- Bind each data component to a resource in the current application.
- Select a numeric field for Sum, Average, Minimum and Maximum.
- Components with incomplete configuration are marked **Needs setup**.
- The validation summary explains what needs attention.
- **Save changes** remains disabled while validation issues exist.
- Save explicitly; the status changes from **Unsaved changes** to **Saved draft**.
- Refresh to verify component order, properties, layout and bindings restore.
- If a newer version was saved by another editor, reload it before continuing. Do not overwrite a newer version blindly.

## Preview limitations

- Tables show a small read-only page of records.
- Metric and chart previews use at most 500 recent records.
- Forms are schema previews; Submit is disabled until the runtime phase.
- A saved draft is not a published application.
- A component preview does not grant runtime data permissions. Runtime permissions must be enforced by the API.

## Troubleshooting

**Metric shows a dash:** confirm a resource is selected, choose a Number field for non-count operations, and confirm records exist.

**Table has no records:** add records under Manage data and verify the selected resource.

**Save is disabled:** resolve the validation summary and confirm you have workspace Owner or Admin access.

**Save conflict:** choose Reload saved version, then reapply your changes to the latest configuration.

## Roles and access

PanelForge separates platform operators, tenant/workspace administrators, application builders and consumers. See the [Authorization and role model](../01-architecture/authorization-and-role-model.md) for the hierarchy, permission boundaries and current implementation status.

## What's next

The application runtime phase will render saved applications and enable forms, record CRUD and application navigation. Publishing and consumer access follow after runtime validation and permission enforcement.

---

## Reuse contract

- Keep this file as the canonical builder help source.
- The future `/help` route should render this content rather than copy/paste it.
- Tutorials may link directly to these headings.
- Update this file in the same PR when builder behaviour changes.
