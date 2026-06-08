# Mobile responsive rules

**Goal:** Pixel-faithful to desktop aesthetic — same glass, colors, gradients — reflowed for narrow screens.

## Breakpoints (Tailwind defaults)

| Prefix | Min width |
|--------|-----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |

## Critical mobile patterns

### App navigation

- **&lt; md:** hide inline header links; show **bottom tab bar** (Search, Settings)
- **≥ md:** inline `AppNav` in header; hide bottom bar
- Main content: `pb-24` on mobile to clear bottom nav

### Marketing header

- Button label: **Sign up** on mobile, **Create account** on `sm+`
- Nav padding: `px-4` mobile, `px-6` desktop
- Logo text truncates if needed

### Landing CTAs

- Stack full-width buttons vertically on mobile
- `w-full sm:w-auto` on button links

### Glass cards

- Padding: `p-4 sm:p-6 md:p-8` (never `p-8` only on mobile)
- Avoid triple nesting: shell handles `px-4`, inner cards use `px-0` or minimal extra gutter

### Run summary stats

- `grid-cols-1 sm:grid-cols-3` — stack stat tiles on phone

### Job card header

- Stack title block and score row on mobile
- Score + freshness: horizontal row on mobile (`justify-between`), column align end on `sm+`
- Apply button: `w-full h-11` mobile, `w-auto h-9` desktop

### Past runs list

- Stack date row and badge row on mobile (`flex-col sm:flex-row`)

### Touch targets

- Minimum **44px** height for primary actions and checkboxes
- OAuth buttons: `h-12 w-full`
- Bottom nav tabs: `min-h-[52px]`

### Safe areas

- `env(safe-area-inset-top)` on fixed marketing header and auth header
- `env(safe-area-inset-bottom)` on bottom nav
- Viewport: `viewportFit: cover`

### iOS / scroll

- `overflow-x: hidden` on `html`
- No `background-attachment: fixed` on mobile body
- Decorative blobs stay inside `overflow-hidden` fixed container

## v0 checklist

When generating mobile layouts, verify:

- [ ] No horizontal scroll at 320px width
- [ ] Glass uses `bg-card/*` not `bg-white/*`
- [ ] Dark mode tokens still work
- [ ] Primary CTA reachable with thumb (bottom half of screen OK)
