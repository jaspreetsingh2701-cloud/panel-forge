# PanelForge Design System

**Status:** Approved visual direction. Proposed values are subject to implementation and visual QA.  
**Scope:** Public marketing experience, authentication, workspace application, dialogs and internal design showcase.

## 1. Principles
1. Preserve the existing PanelForge brand and landing-page content; refine rather than replace.
2. Use a dark-first interface with a user-selectable light theme.
3. Use premium glassmorphism selectively: translucent panels, visible blur, layered depth and restrained purple/cyan light.
4. Keep hierarchy, navigation and behavior consistent across themes.
5. Prioritize clarity and task completion over decoration.
6. Build shared components and tokens once; screens and the internal /design showcase consume the same foundations.

## 2. Brand direction
PanelForge should feel like a modern, precise and trustworthy product-building workspace. The visual language combines deep navy, violet primary accents, cyan secondary accents, soft borders, rounded surfaces and clear typography.

Retain the existing landing-page headline:
> Build the admin experience your team needs.

Preserve its supporting product narrative and the three feature concepts:
- Connect your data
- Design your panel
- Publish with control

Do not replace the current public page with a generic template.

## 3. Dark theme tokens

| Token | Value | Usage |
|---|---|---|
| Background | #090D18 | App/page background |
| Surface | #111827 | Primary cards and panels |
| Elevated surface | #182236 | Menus, dialogs and raised surfaces |
| Primary | #8B7CFF | Primary actions and selected states |
| Secondary | #55D6D0 | Supporting accent |
| Success | #54D6A2 | Positive status |
| Warning | #F5B547 | Caution status |
| Error | #FF6B6B | Error and destructive status |
| Primary text | #F4F7FF | Main text |
| Muted text | #9AA6BB | Supporting text |
| Border | #2A3447 | Dividers and outlines |
| Focus | #A69CFF | Keyboard focus |

## 4. Light theme tokens

The following is a proposed starting palette. Contrast and visual QA are required before values are treated as final.

| Token | Proposed value | Usage |
|---|---|---|
| Background | #F5F7FC | App/page background |
| Surface | #FFFFFF | Primary cards and panels |
| Elevated surface | #EEF1FA | Menus, dialogs and raised surfaces |
| Primary | #6555E8 | Primary actions and selected states |
| Secondary | #168F91 | Supporting accent |
| Success | #16845B | Positive status |
| Warning | #986000 | Caution status |
| Error | #C83F4A | Error and destructive status |
| Primary text | #172033 | Main text |
| Muted text | #59657A | Supporting text |
| Border | #DCE2EE | Dividers and outlines |
| Focus | #6555E8 | Keyboard focus |

Use semantic token names in components; do not hardcode theme colors in individual screens. Status must remain understandable without color alone.

## 5. Typography
- Headings: Space Grotesk, weights 600–700.
- Body and UI: DM Sans, weights 400–600.
- Maintain a clear hierarchy for page titles, section titles, body, supporting text and compact metadata.
- Use tabular numerals for aligned metrics where useful.
- Provide a sans-serif fallback if preferred fonts cannot load.

## 6. Spacing, radii and elevation
Use a 4 px base spacing scale: 4, 8, 12, 16, 24, 32, 40 and 48 px.

Corner radii:
- Small: 8 px
- Medium: 12 px
- Large: 16 px
- Extra large: 20 px

Use elevation to establish hierarchy, not to make every card float. Shadows should be soft and theme-aware.

## 7. Glass surfaces
Reserve glassmorphism for selected panels, navigation, dialogs and highlighted cards.

Initial implementation guidance, to be tuned during visual QA:
- Dark glass surface opacity: approximately 65–80%.
- Light glass surface opacity: approximately 70–85%.
- Backdrop blur: approximately 12–20 px.
- Thin, low-contrast border; slightly stronger on hover and focus.
- Restrained violet/cyan glow; never place intense glow behind dense body text.
- Provide a solid-surface fallback where backdrop filters are unsupported or reduced transparency is preferred.

Avoid nested glass layers. Inputs and dense tables should prioritize legibility.

## 8. Shared component foundations
Implement reusable primitives for:
- Buttons: primary, secondary, subtle, destructive and icon-only, with hover/focus/disabled/loading states.
- Inputs: text, email, password, search and textarea, with labels, help, validation and disabled states.
- Select: keyboard-operable options and visible focus.
- Glass card: semantic variants rather than page-specific styling.
- Sidebar and top navigation: active route, workspace context, responsive collapse and theme toggle.
- Data table: loading, empty, error, sorting, selection and responsive overflow.
- Status badge: text plus semantic treatment; color is not the only signal.
- Dialog: focus trap, Escape behavior, labelled title and destructive confirmation.
- Toast/notice: concise feedback and appropriate live-region semantics.
- Theme toggle: accessible name and clear current state.

## 9. Theme behavior
- Dark is the default when no preference exists.
- Before login, initialize from the browser's saved preference.
- After login, load the user's profile preference and synchronize it across devices.
- Theme changes update the UI immediately and then persist.
- If profile persistence fails, retain the local selection and communicate the save failure without unexpected reversion.
- Public and authenticated headers both expose the theme toggle.
- Both themes use the same component hierarchy and interaction behavior.

## 10. Responsive behavior
- Desktop: persistent workspace sidebar and full content canvas.
- Tablet: compact/collapsible sidebar and flexible content grids.
- Mobile: compact drawer or equivalent accessible navigation; tables scroll or adapt to stacked rows.
- Dialogs fit the viewport and remain keyboard accessible.
- Essential actions must not depend on hover.

## 11. Accessibility and motion
- Use semantic landmarks, heading order, labels and accessible button names.
- All actions are keyboard accessible with a visible focus indicator.
- Meet WCAG AA contrast targets for text and meaningful UI states.
- Do not communicate status by color alone.
- Respect prefers-reduced-motion; avoid large motion by default.
- Glass blur, glow and transparency must not compromise contrast.
- Announce form errors and async feedback to assistive technology.

## 12. Internal /design showcase
The approved future /design route should demonstrate both themes, tokens, typography, spacing, radii, buttons, controls, cards, badges, tables, dialogs, notifications and loading/empty/error/disabled/focus states.

It must import real design tokens and shared components. Do not create a separate hardcoded visual system.

## 13. Implementation acceptance criteria
- Semantic tokens are the only source of theme colors.
- Both themes are contrast-checked and visually coherent.
- Shared components cover documented states.
- Keyboard navigation and reduced-motion behavior are verified.
- Desktop, tablet and mobile layouts are checked.
- Public landing content and brand identity remain intact.
- The /design showcase uses production tokens/components, not duplicated CSS.
