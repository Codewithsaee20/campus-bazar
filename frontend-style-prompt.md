# Antigravity Prompt — Dark High-Contrast Restyle (per page)

Copy the block below into Antigravity. Replace `{PAGE_FILE}` with one page at a time,
in this order (from `frontendtask.md`): Tier A pages first, then B, then C, then D last.

---

## PROMPT

You are restyling one page of a React + Vite app (Campus_Bazzar). Do NOT change any
component logic, state, props, routing, or API calls — CSS/className/style changes only.

**File to restyle:** `{PAGE_FILE}`
**Global stylesheet (edit tokens here, not per-page inline styles):** `frontend/src/index.css`
**Also relevant:** `frontend/src/App.css`, theme switching in `frontend/src/utils/theme.js`
and `frontend/src/hooks/useTheme.js` — keep the existing `data-theme="dark"` mechanism intact,
do not introduce a second theming system.

### Visual direction: dark, high-contrast, "crazy dark" theme

- Background: near-black bases (e.g. `#0a0a0f`, `#0f0f16`), NOT flat pure black — use 2-3
  layered dark shades for depth (page bg vs. card bg vs. elevated surface bg).
- Accent colors: pick 1 primary vivid accent (electric violet, cyan, or magenta — stay
  consistent with whatever accent already exists in `index.css`'s `--color-violet` etc.,
  don't introduce a clashing second brand color) + 1 secondary accent for contrast/highlights.
- Text colors — enforce real contrast, not just "white on dark":
  - Primary text: near-white, high contrast (~15:1+ against page bg) for headings/body copy.
  - Secondary/muted text: a mid-gray with enough contrast to stay readable (~7:1 minimum),
    never rely on opacity alone to fake a muted color — use an actual muted hex/HSL value.
  - Never place mid-gray text on mid-gray backgrounds; check every text/background pair.
- Borders/dividers: low-opacity light borders (e.g. `rgba(255,255,255,0.08)`) to separate
  surfaces without harsh lines.

### Hover / interactive states (every clickable element must have one)

- Buttons/links: on hover, shift background or add a glow/shadow using the accent color,
  add a smooth transform (slight scale or lift, e.g. `translateY(-2px)`), transition
  duration 150–250ms, easing `ease-out`.
- Cards/list items: on hover, elevate with a subtle shadow + border color shift to accent,
  no jarring color inversion.
- Inputs: on focus, accent-colored border/outline, not the browser default.
- Disabled states: visibly desaturated/dimmed, no hover effect.
- Respect `prefers-reduced-motion` — if a transition exists, keep it functional but skip
  large transforms for users with that preference.

### Constraints

- Reuse existing CSS custom properties in `index.css`'s `:root` / `:root[data-theme='dark']`
  blocks where they already fit — extend the token list, don't duplicate a parallel set.
- Do not remove or resize layout structure — this is a color/contrast/hover pass, not a
  layout redesign.
- Keep existing responsive breakpoints working; do not hardcode pixel widths that break
  the page below 768px.
- If this page renders order-status badges/steps (MyOrdersPage, SellerOrdersPage), only
  restyle color/hover — do not change which status maps to which badge, that mapping comes
  from `useOrderStore.js` and must stay untouched.

### Output

Return only the CSS/className changes needed for `{PAGE_FILE}` (and any new/edited tokens
in `index.css` if this is the first page run). Do not touch unrelated pages' rules in the
global stylesheet.
