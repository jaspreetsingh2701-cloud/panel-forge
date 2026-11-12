# PanelForge UX Decisions

This document records decisions approved during the UX design review. Approval records the direction; it does not mean the UI has been implemented.

## Decision register

| ID | Status | Decision | Rationale | Affected areas |
|---|---|---|---|---|
| UX-001 | Approved | Dark-first theme with user-selectable light theme. | Supports the approved visual direction and user preference. | Public site, auth, workspace |
| UX-002 | Approved | Refine existing PanelForge brand and landing page; do not replace its content with a generic template. | Preserves product identity and approved messaging. | Landing page, shared header |
| UX-003 | Approved | Restrained premium glassmorphism with visible blur, layered depth and subtle purple/cyan glow. | Creates a distinctive visual language without sacrificing clarity. | Cards, navigation, dialogs |
| UX-004 | Approved | Refine the existing sidebar/dashboard hierarchy rather than reinvent navigation. | Avoids unnecessary workflow redesign. | Workspace shell, dashboard |
| UX-005 | Approved | Theme toggle in public and authenticated headers. | Makes theme choice discoverable and consistent. | Public/workspace headers |
| UX-006 | Approved | Same component hierarchy across dark and light themes. | Prevents theme-specific behavior drift. | All screens |
| UX-007 | Approved | Extended initial UX scope covering 12 screens/states. | Defines a coherent product experience. | Screen specifications |
| UX-008 | Approved | Internal /design route as a visual design-system showcase. | Makes tokens, components and states inspectable. | Internal design route |
| UX-009 | Approved | Before login, initialize theme from browser preference; after login, use profile preference. | Combines immediate local behavior with account-level consistency. | Theme persistence, auth |
| UX-010 | Approved | Theme changes apply immediately and persist, with cross-device profile synchronization. | Avoids delayed feedback and retains account preference. | Theme state/profile |
| UX-011 | Approved | Default to dark when no preference exists. | Provides a deterministic first-visit experience. | Public/workspace |

## Interaction and product boundaries

### Authentication and onboarding
- Login and registration are separate routes.
- Registration collects display name, email, password and workspace name.
- Registration creates the user, first tenant, OWNER membership and initial session in one backend transaction.
- Successful authentication leads to the workspace experience.
- Password recovery and email verification are future capabilities; do not present them as working flows until implemented.

### Workspace navigation
- The workspace shell contains a sidebar, top navigation and workspace selector.
- The dashboard provides a first-run empty state and a prominent Create Application action.
- Applications, Data Sources, Members and Settings remain distinct destinations.
- Tenant membership roles are OWNER, ADMIN and MEMBER. Application-level Editor/Viewer permissions are separate.

### Feedback and empty states
- Forms show inline validation and preserve entered values when safe.
- Async actions have loading, success and failure feedback.
- Empty states explain what is missing and offer a relevant next action.
- Destructive actions require explicit confirmation.
- Search/filter empty results are distinct from first-run empty states.

## Open implementation questions
These are not approved backend capabilities:
- Forgot-password and email-verification flows.
- Member invitation delivery and acceptance.
- Data-source credential creation, testing and secret storage.
- Application creation, editing and publishing.
- Billing and subscription management.
- Fine-grained application permissions and custom roles.
- Profile preference API and cross-device theme synchronization.

## Change control
Changes to approved decisions must update this register and affected screen/design-system documents in the same pull request. Record rationale and impact; do not silently change approved behavior during implementation.
