# Goldwagen Alberton — website

A nine-page static site for the Goldwagen Alberton branch. Plain HTML, Tailwind
(via CDN) and one hand-written brand stylesheet. The pages you deploy are ordinary
static files — they run on Netlify, Vercel, GitHub Pages, cPanel or any plain host.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `parts.html` | Parts we stock — 12 categories |
| `vehicles.html` | Vehicle coverage — 17 makes + VIN explainer |
| `brands.html` | Brands, grouped by what they do |
| `about.html` | About the branch + stats |
| `reviews.html` | Real Google reviews + "send it ahead" |
| `quote.html` | WhatsApp quote form |
| `faq.html` | Common questions |
| `visit.html` | Address, hours, contact, map |

---

## How it is put together

```
partials/       head, sprite, header+drawer, footer   <- shared chrome, edit here
pages/          the unique content of each page       <- edit here
build.js        stitches the two into root .html files
*.html          GENERATED — do not edit directly
assets/         brand.css + site.js
mediaa/         logo + your review screenshots
server.js       local preview only — do not deploy
```

Nine copies of a header would drift the first time a phone number changed, so the
chrome lives in `partials/` and gets stitched in. After editing anything in
`partials/` or `pages/`:

```bash
node build.js
```

Preview locally with:

```bash
node server.js
```

---

## Before you go live — replace these

Search the `partials/` and `pages/` folders for each marker, then rebuild.

| Marker | What to do |
|---|---|
| `data-whatsapp` (in `partials/head.html`) | Currently the landline `27118694478`. Put the real WhatsApp business number here — international format, no `+`, no spaces. Also update the four `wa.me/27118694478` links in `partials/footer.html`, `pages/quote.html`, `pages/reviews.html` and `pages/visit.html`. |
| `TODO:EMAIL` | No email is shown anywhere. See the note below. |
| `TODO:PHOTO` | The "Gateway Centre" panel on `pages/about.html` is a placeholder. Drop in a real storefront or counter photo. |
| `TODO:CONFIRM` | The FAQ answers, the brand groupings, and the review selection. |
| `SITE` (in `build.js`) | Set your real domain — it feeds canonical and Open Graph URLs. |

### Why there is no email address on the site

The branch email is not published anywhere public. The address on Goldwagen's
Facebook and Instagram pages, `info@goldwagen.com`, is **head office** — as is
`012 748 3800` and the WhatsApp number listed there. Pointing Alberton parts
enquiries at head office would misdirect them, and a guessed address like
`alberton@goldwagen.com` would simply bounce. So the site currently offers phone,
WhatsApp and the quote form. Commented-out markup is in place in
`partials/footer.html` and `pages/visit.html` — fill in the real address and
uncomment.

### About the reviews

`pages/reviews.html` uses **seven real 5-star Google reviews**, transcribed
verbatim from your screenshots — spelling and phrasing untouched, because editing
a review would misrepresent it. Three of them also appear on the home page.

Deliberately left off:

- **Two negative reviews** (1★ and 2★) about queue length, staffing levels and
  price consistency between the phone and the counter. Not published, but they are
  worth acting on — and they are the reason `reviews.html` carries a "Busy counter?
  Send it ahead" panel, which turns the queue complaint into a reason to WhatsApp
  first.
- **One 5★ review that also criticises staff diversity.** Quoting only its
  complimentary first half while dropping the criticism would be misleading, so it
  is excluded entirely rather than trimmed.

No star-rating average is hard-coded anywhere. Google ratings drift, and a number
baked into HTML goes stale and quietly becomes untrue; the page links to Google for
the live rating instead.

Social links point at the national Goldwagen accounts you supplied
(facebook.com/goldwagen, instagram.com/goldwagensa) and are labelled as such.

---

## Design system

Colours were sampled directly from `mediaa/logo.png`, so they are your actual brand
values rather than an approximation.

| Token | Value | Use |
|---|---|---|
| `--gw-red` | `#D9272E` | Primary buttons, accents, fills |
| `--gw-red-soft` | `#FF6B70` | Small accent text on dark (6.9:1) |
| `--gw-blue` | `#001689` | Deep brand surfaces, Wolf panel |
| `--bg` | `#070B18` | Page background |
| `--surface` | `#0E1430` | Cards |
| `--muted` | `#A5ADC6` | Body text on dark (8.6:1) |

Type: **Barlow Condensed** for headings, **Inter** for body, both from Google Fonts
with `display=swap`. Spacing runs on an 8pt scale (`--space-1` … `--space-8`).

**The WhatsApp green** is `#16854A`, not WhatsApp's `#25D366`. White on the official
brand green is only 3.2:1, which fails WCAG AA; the darker green reaches 4.68:1 and
still reads unmistakably as WhatsApp.

### The logo

`mediaa/logo.png` shipped with a solid white background. `mediaa/logo-transparent.png`
is generated from it: the white was flood-filled **inward from the edges only**, so
background white is gone while the white "GW" lettering and the highlight sweep —
both enclosed by the blue oval, and therefore unreachable from the border — survive
untouched. Anti-aliased edge pixels are feathered to alpha so there is no white halo
on the dark UI, and the empty margins are trimmed (197×97 → 167×63).

The original is untouched and still used where transparency is a liability:

| Use | File | Why |
|---|---|---|
| Header, drawer, footer, About panel | `logo-transparent.png` | Sits directly on the dark UI |
| Favicon | `logo-transparent.png` | Adapts to light and dark browser chrome |
| `apple-touch-icon` | `logo.png` | iOS flattens transparency to black |
| `og:image` | `logo.png` | Social cards render more reliably on a solid ground |

It is still only 167×63, so it is soft on high-density screens. **A vector (SVG) or a
larger original would sharpen it noticeably** — drop it in, update the four `<img>`
references in `partials/` and `pages/about.html`, and rebuild.

---

## Accessibility

Checked and passing across all nine pages:

- All text meets WCAG AA contrast, verified against rendered colours
- Every tap target ≥24×24px, primary actions ≥44px; the only exception is an
  inline link inside a sentence, which WCAG explicitly exempts
- Full keyboard support: skip link, visible focus rings, drawer focus trap, Escape
  to close, focus returned to the trigger
- One `<h1>` per page, breadcrumbs, and `aria-current="page"` in both navs
- Form errors appear inline *and* in a focusable summary linked to each field;
  validation runs on blur, not on every keystroke
- `prefers-reduced-motion` disables all animation, including the brand marquee,
  which also has an explicit pause/play control
- No horizontal scroll at 375px

An audit script checks every page for broken links, missing assets, duplicate ids,
stray anchors and unreplaced placeholders. All nine pass.

---

## Going to production

The pages load Tailwind from `cdn.tailwindcss.com`, which prints a console warning
and ships ~300KB of JavaScript. It works, but for a faster site compile Tailwind
once and swap the two `<script>` tags in `partials/head.html` for a `<link>`.
`brand.css` does not depend on Tailwind, so nothing else changes.

Also before launch:

- Set `SITE` in `build.js` to the real domain
- Add a proper favicon (currently reusing the logo PNG)
- Confirm the `AutoPartsStore` structured data in `partials/head.html` still matches
  your hours and address
- Do not upload `server.js`, `build.js`, `partials/` or `pages/` — only the nine
  `.html` files, `assets/` and `mediaa/` are needed to serve the site
