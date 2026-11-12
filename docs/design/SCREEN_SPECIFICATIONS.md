# PanelForge Screen Specifications

**Status:** The 12 screens/states below are approved UX scope.  
**Note:** These are requirements, not evidence that routes or components are implemented.

## Shared application shell
Authenticated screens use a workspace sidebar with active navigation, a top bar with workspace selector/page context/theme toggle, a responsive content grid, and shared buttons, inputs, cards, tables, badges, dialogs and toast feedback. Public and authenticated headers both expose the theme toggle. Both themes share the same hierarchy.

## 1. Public landing — /
**Purpose:** Explain PanelForge and guide visitors to registration or login.

- Navigation: Features, Solutions, Pricing and Docs.
- Login and Get Started actions; theme toggle.
- Retain the headline “Build the admin experience your team needs.”
- Preserve the existing supporting paragraph and brand identity.
- Feature concepts: Connect your data, Design your panel, Publish with control.
- Footer with relevant product/legal navigation.

**Acceptance:** Existing content remains recognizable; responsive layout and both themes work. Do not replace it with a generic dashboard.

## 2. Login — /login
**Purpose:** Authenticate an existing user.

- Email and password fields; password visibility toggle.
- Submit with loading state, registration link and theme toggle.
- Forgot-password entry point only when its future workflow is available.
- States: invalid fields, invalid credentials, API/network error, submitting and success.
- On success, establish authenticated browser state and navigate to the user's workspace.
- Access tokens stay in memory. Refresh credentials use the secure HttpOnly cookie flow, never browser local storage.

## 3. Registration — /register
**Purpose:** Create a user and their first workspace.

- Fields: display name, email, password and workspace name.
- Validate required fields and password policy; explain first-workspace creation.
- Prevent accidental duplicate submission; display field-level/server errors.
- Backend contract: create User, Tenant, OWNER membership, AuthSession and RefreshToken in one transaction. Raw refresh tokens are not stored.
- On success, enter the authenticated workspace experience.

## 4. Workspace dashboard — /app
**Purpose:** Provide a useful starting point after authentication.

- Shared sidebar/top navigation and workspace selector.
- Welcome/context area and Create Application primary action.
- Summary cards for Applications, Data Sources, Members and Activity.
- Recent activity when data exists.
- First-run state explains the next step and emphasizes Create Application. Never present fabricated metrics as real data.

## 5. Applications — /app/applications
**Purpose:** Browse and manage workspace applications.

- Table columns: application name, status, last updated and actions.
- Search, status filter and Create Application action.
- States: loading, populated, no applications, no search results and API error.
- Draft, Active and Archived are planned UI concepts; do not enable transitions before backend support exists.

## 6. Data Sources — /app/data-sources
**Purpose:** View data connections available to the workspace.

- Types: managed PostgreSQL, external PostgreSQL, MySQL and REST API.
- Show connection name, type, status and available actions.
- States: loading, connected, attention required, no data sources and error.
- Credential management, connection testing and secret storage are not implied by this specification. Disable or mark unavailable actions until supported.

## 7. Members and roles — /app/members
**Purpose:** Understand workspace membership and tenant roles.

- Table columns: member, email, role, joined date and actions.
- Roles: OWNER, ADMIN and MEMBER.
- Invite Member and member/role actions only when authorized and backed by implemented APIs.
- States: loading, populated, no additional members, future invitation-pending, filtered-empty and error.

## 8. Workspace settings — /app/settings
**Purpose:** Manage workspace-level configuration.

- General section: workspace name and slug.
- Members and roles section links to member management.
- Billing is a future section, not an active capability unless implemented.
- Show save state, validation and permission errors. Do not imply unavailable billing or workspace mutation.

## 9. Create Application dialog
**Entry point:** Dashboard and Applications page.

- Fields: application name and optional description.
- Actions: Cancel and Create.
- Validate required fields, show loading/error feedback, close only on confirmed success and refresh the application list.
- If creation API is unavailable, disable or clearly mark the action unavailable rather than simulating persistence.

## 10. Invite Member dialog
**Entry point:** Members page.

- Fields: email and role.
- Initial invite roles: ADMIN and MEMBER; OWNER is assigned during initial workspace creation and should not be offered casually.
- Actions: Cancel and Send Invitation.
- Invitation delivery/acceptance are future backend work. Never show success unless the API confirms it.

## 11. Role management reference
Explain the initial workspace role model:
- OWNER: full workspace ownership and control.
- ADMIN: workspace administration within product-granted permissions.
- MEMBER: standard workspace membership.

Distinguish tenant roles from application-level Editor/Viewer access. Custom roles are future scope.

## 12. Empty-state library
Provide consistent states for no applications, no data sources, no additional members and no search/filter results. Each includes a contextual icon/illustration, concise explanation and relevant next action when supported. Do not show actions the backend cannot complete.

## Cross-screen acceptance criteria
- All screens follow the shared design system.
- Dark/light themes retain the same hierarchy and behavior.
- Sidebar and top navigation are consistent across authenticated routes.
- Forms include labels, validation, loading and error feedback.
- First-run and filtered-empty states are distinct.
- Responsive behavior is defined for desktop, tablet and mobile.
- Keyboard access, visible focus, semantic structure and reduced motion are supported.
- UI never claims a future backend capability has succeeded.
