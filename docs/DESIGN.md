# Design System

## Visual identity

TheLocal uses an American-proud color palette expressed through design — not copy. Community-focused language throughout; no patriotic slogans in text.

## Color tokens

Defined in `src/app/globals.css`:

| Token | Hex | Usage |
|-------|-----|-------|
| `sage` | #002868 | Navy — headers, links, primary accents |
| `terracotta` | #BF0A30 | Red — CTAs, paid badges, emphasis |
| `cream` | #FFFFFF | Card backgrounds |
| `cream-dark` | #EEF2F8 | Page background |
| `ink` | #0A1628 | Primary text |
| `ink-muted` | #4A5D75 | Secondary text |
| `stone` | #C5D4E8 | Borders, dividers |

Tailwind classes: `bg-sage`, `text-terracotta`, `bg-cream-dark`, etc.

## Brand utilities

```css
.brand-bar    /* 4px red-white-blue gradient stripe */
.brand-hero   /* Subtle patriotic background pattern for hero sections */
```

## Typography

| Role | Font | Class |
|------|------|-------|
| Body / UI | Libre Franklin | `font-sans` |
| Headlines | Merriweather | `font-serif` |

Configured in `src/app/layout.tsx` via `next/font`.

## Badges

Component: `src/components/ui/badge.tsx`

| Variant | Use |
|---------|-----|
| `paid` | PAID EVENT with price range |
| `nature` | Nature tag (Individual, Gathering, etc.) |
| `type` | Listing type |
| `interest` | Interest category |
| `verified` | Verification tier |

## ListingTags (required)

`src/components/listings/listing-tags.tsx` must appear on every listing card and detail page:

1. **Paid badge** — `PAID EVENT · $X–$Y` when `isPaid`
2. **Nature badge** — single tag from LISTING_NATURE_TAGS
3. Type and interest badges as secondary context

## Layout patterns

- Mobile-first responsive design
- Header with `brand-bar` stripe at top
- Cards with cream background, stone borders, subtle shadow
- CTAs use `terracotta` background

## Map

Leaflet map in `listing-map.tsx` — dynamically imported, client-only (no SSR).

## Copy guidelines

- Use `APP_NAME`, `APP_TAGLINE`, `APP_DESCRIPTION` from `src/lib/constants.ts`
- Community-focused: "near you", "gatherings", "neighbors", "local"
- Avoid: patriotic slogans, flag references, "Made in America" text
- Paid events: show price upfront, not buried in description