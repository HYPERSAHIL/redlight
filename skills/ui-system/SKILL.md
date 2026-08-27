---
name: redlight-ui-system
description: Consistent UI for the UP Red Light Areas map using Meta Astryx neutral theme + shadcn/ui zinc palette in a vanilla Vite + Leaflet stack. Use whenever creating or editing any UI in index.html or src/main.js — topbar, search, filters, drawer/sheet, story cards, map markers. Enforces one design system for humans and AI via shared tokens, primitives, and patterns.
---

# Redlight UI System

Vanilla Vite + Leaflet project at `/media/mint/WDC_WD10EZRX_932G/redlight`. Do NOT add React solely for UI — this system brings Astryx + shadcn principles to vanilla via CSS variables + composable primitives.

## Stack reality (don't fight it)
- Vanilla JS, Vite 5, Leaflet 1.9. No React in `src/` (Astryx `@astryxdesign/core` is React-only — use its **tokens/conventions** without pulling the package unless migrating).
- shadcn/ui pattern = Tailwind-style tokens + copy-paste `src/components/ui/*` — here mirrored as plain CSS with `--radius`, `--border`, etc.
- Astryx docs: https://astryx.atmeta.com · Storybook https://facebook.github.io/astryx/storybook/ · CLI `npx @astryxdesign/cli`

## Tokens — single source (Astryx neutral + shadcn zinc dark)
Define in `index.html <style>` `:root` and consume everywhere. Do not hardcode colors.

```css
:root{
  /* shadcn zinc dark = Astryx theme-neutral dark */
  --background: #09090b; --foreground: #fafafa;
  --card: #18181b; --card-foreground: #fafafa;
  --popover: #18181b; --popover-foreground: #fafafa;
  --primary: #e11d48; --primary-foreground: #fff; /* brand red, Astryx primary overridden */
  --secondary: #27272a; --secondary-foreground: #fafafa;
  --muted: #27272a; --muted-foreground: #a1a1aa;
  --accent: #27272a; --accent-foreground: #fafafa;
  --destructive: #e11d48;
  --border: rgba(255,255,255,.10); --input: rgba(255,255,255,.10);
  --ring: rgba(225,29,72,.45);
  --radius: .875rem; /* 14px Astryx default */
}
```

Theme is CSS custom-property overrides only — no wrapping, no forking (Astryx principle).

## Primitives (shadcn naming, Astryx behavior)
All primitives live in `index.html <style>` — keep open internals, compose at any level.

| Primitive | Class | Props / states |
|-----------|-------|----------------|
| Card/Panel | `.panel` | `background: var(--card)`; `backdrop-filter: blur(16px)`; `border: 1px solid var(--border)`; `border-radius: var(--radius)`; `box-shadow: 0 12px 40px rgba(0,0,0,.45)` |
| Button | `.btn` | variants: `.primary` (primary), `.icon` (h-32), `.ghost`; `focus-visible: ring`; `hover: bg/accent`; size h-36 default |
| Segment | `.seg` | wraps `.seg button` with `.active`; p-3, rounded-full |
| Input | `.search-input` | `bg: rgba(255,255,255,.05)`; `border: var(--border)`; `focus: border var(--ring) + shadow` |
| Badge | `.tag` | `.high/.medium/.low` with tint + border |
| Sheet/Drawer | `.drawer` | translateX, backdrop-blur, border-l |

Never create a new visual language — extend a primitive.

## Foundations (Astryx)
- **Typography**: system-ui, 14px h1, 11px meta, 13px body. One family.
- **Layout**: 4px scale (8/12/16 gaps). Topbar max 980px centered; searchcard 300px left 14px; bottombar centered; drawer 390px.
- **Accessibility**: `focus-visible` ring on all interactive; `aria-*` on segments; Leaflet tooltips stay.

## Patterns (project)
- **TopBar** = `.topbar.panel` + `.brand` + `.seg` (Sat/Street) + `.btn` (Heat/Lang/Full/Story)
- **Search** = `.searchcard.panel` + `.search-wrap` + `.search-input` + `.filter-row .seg` + `.results .result`
- **Drawer/Sheet** = `.drawer` + `.drawer-head` + `.drawer-body` + `.drawer-actions` — swipe-to-close on mobile
- **Story** = `.story.panel` + `.story-card` (min-w 150) — horizontal scroll

## Principles (Astryx promises — applied to vanilla)
1. **Guidance over enforcement** — components render what you pass; opinions live in docs, not guards.
2. **Strong, documented conventions** — every component same naming/prop pattern; learn one, predict others.
3. **One system for humans and AI** — CLI, docs, and code match so both build identically.
4. **Earned by measurement** — test conventions, revisit when wrong.

## When touching UI
1. Read `index.html` `<style>` — tokens → primitives → patterns. Reuse, don't duplicate.
2. Use `HI_DISTRICT` + `I18N` in `src/main.js` for any new string — keep EN/HI in sync.
3. Keep `lang` toggle, `filterMode`, `searchTerm` state in `src/main.js` — don't add new global state.
4. Verify: `~/.bun/bin/bun run build` then `wrangler pages deploy dist --project-name=redlight --branch=main`.
5. No venue-level pins, no building/lane geocoding — district/area centroid only.

## References
- Astryx: https://github.com/facebook/astryx · https://astryx.atmeta.com
- shadcn/ui: https://ui.shadcn.com (Radix + Tailwind, CLI `npx shadcn@latest add button`)
- Agent Skills spec: https://agentskills.io · template in this repo `template/`
