# EasyPDF Design System + Internal Linking Network

Design eka penuma wenas karala na — dan thibba widiyata ma thiyenawa. Wenas une eka pitipasse thiyena code eka: dan okkoma **design tokens** walin hadanawa, ithin alut page ekak hadanawa nam hari, colours okkoma wenas karanawa nam hari, minutes kihipayak withara ganawa.

---

## 1. Design System

`assets/style.css` eka layers 4kata bedala thiyenawa:

```
LAYER 1  TOKENS       Design decisions okkoma variables widiyata (69k)
LAYER 2  PRIMITIVES   Reset + base element styles
LAYER 3  COMPONENTS   Reusable blocks (button, card, dropzone, faq, ...)
LAYER 4  LAYOUT       Page shell, grids, responsive rules
```

**Rule eka:** Layer 3 eke components kisima welawaka colour ekak, size ekak, duration ekak hardcode karanne na. Ewa `var(--token)` witharai use karanne. Meka thamai hema page ekakma ekapata penna hetuwa, saha site eke colour scheme eka mulinma wenas karanna ona nam Layer 1 eka witharak edit kalata athi wenne.

### Token categories

| Category | Tokens | Examples |
|---|---|---|
| Brand palette | 9 | `--color-brand`, `--color-success`, `--color-danger` |
| Surfaces & text | 13 | `--color-bg`, `--color-surface`, `--color-text-muted` |
| Typography | 15 | `--text-base`, `--weight-bold`, `--leading-relaxed` |
| Spacing (4px scale) | 11 | `--space-4`, `--space-8`, `--space-15` |
| Radius | 5 | `--radius-md`, `--radius-xl`, `--radius-full` |
| Elevation | 2 | `--shadow-knob`, `--shadow-lift` |
| Motion | 4 | `--ease-out`, `--ease-theme`, `--ease-knob` |
| Layout | 3 | `--container`, `--measure`, `--z-header` |

### Night mode kohomada wada karanne

Dark theme eka `body.dark` eke tokens **16k** witharak override karanawa — surfaces, text, borders, states. Component ekakwath dark mode ekata wenma liyanna ona nathi wela thiyenawa. Alut component ekak hadanawa nam tokens use kaloth, dark mode eka automatic ma wada karanawa.

```css
body.dark {
  --color-bg:      #0f1115;   /* light: #f7f7fb */
  --color-surface: #1a1d24;   /* light: #ffffff */
  --color-text:    #e5e7eb;   /* light: #1f2430 */
  /* ...16 tokens */
}
```

### Components list

`.site-header` `.site-nav` `.tab-btn` `.mode-toggle` `.breadcrumb` `.hero-title` `.hero-sub` `.card` `.dropzone` `.btn` (`.btn-primary` `.btn-ghost` `.btn-success` `.btn-lg`) `.panel` `.thumbs`/`.thumb` `.options`/`.opt` `.progress-bar` `.result` `.error` `.section` `.steps`/`.step` `.features`/`.feature` `.faq` `.link-cards`/`.link-card` `.callout` `.site-footer` `.page` `.link`

### Colour scheme eka wenas karanna

Site eka mulinma re-skin karanna ona nam, Layer 1 eke line 3k witharak wenas karanna:

```css
--color-brand:       #e5322d;   /* oyage colour eka */
--color-brand-hover: #c4271f;   /* podda dark karapu eka */
--color-brand-tint:  #fff5f5;   /* godak light karapu eka (hover washes) */
```

Buttons, links, progress bar, step numbers, focus states, callout border — okkoma automatic ma wenas wenawa.

---

## 2. Internal Linking Network

Pages 3ma **ekakin anith okkoma ekata** link wenawa (complete graph ekak). Link ekak gaane anchor text eka wenas — Google keyword-stuffing widiyata ganne na, saha link ekakin monawada labenne kiyala hariyata therenawa.

### Link graph

```
                    ┌──────────────┐
          ┌────────►│     HOME     │◄────────┐
          │  x3     │      /       │   x3    │
          │         └──────┬───────┘         │
          │           x9 │ │ x9              │
          │              ▼ ▼                 │
   ┌──────┴───────┐            ┌─────────────┴─┐
   │  JPG to PDF  │───── x7 ──►│  PDF to JPG   │
   │ /jpg-to-pdf  │◄──── x8 ───│ /pdf-to-jpg   │
   └──────────────┘            └───────────────┘
```

Page ekakata ena/yana links: home **19**, jpg-to-pdf **14**, pdf-to-jpg **15**.

### Link types 7k

Hema page ekakma link types kihipayakin anith pages walata link wenawa — meka thamai "network" ekak, list ekak nemei:

1. **Header nav** — page 3ma → tools 2ma (persistent, crawler ta hoyaganna lesi)
2. **Logo** — page 3ma → home
3. **Breadcrumb** — tool pages → home (visual + BreadcrumbList structured data ekath ekka)
4. **Hub cards** — home → tools 2ma, description + CTA ekka
5. **Contextual prose links** — paragraph athule sabhavika widiyata (`class="link"`). Meka thamai SEO walata balawathma link type eka, mokada Google balanne link eka wate thiyena wachana walata.
6. **Callout block** — tool ekaka uda kotase, anith tool ekata cross-link ekak
7. **FAQ answer links** — "How do I convert a PDF back into images?" wage prashna walata pilithuru athule
8. **Related-tool cards + footer grid** — page eke agata, columns 3ka footer link block ekak

### Anchor text variety

Ekama page ekata link kalath, wachana wenas karala thiyenawa. Udaharanayak — `/pdf-to-jpg` ekata link wena widi:

- "PDF to JPG converter"
- "PDF to JPG"
- "Convert PDF to images →"
- "turning the page into an image"
- "converting a PDF to images"
- "Extract images from a PDF"
- "Save a PDF page as a picture"

"Click here" wage generic anchor text ekakwath na (test ekakin check karanawa).

### Structured data eken network eka tikak thawa strong

- `ItemList` (home) — tools 2 list karanawa
- `isPartOf` (tool pages) — WebSite ekata connect karanawa
- `BreadcrumbList` — hierarchy eka Google ta kiyanawa, search results wala breadcrumbs pennanawa

---

## 3. Test coverage

`test-network.js` eken automated checks **60k** run wenawa:

- Page ekakin anith hama page ekakatama link ekak thiyenawada
- Page ekakata links 8k+, prose links 2k+, distinct anchor texts 6k+
- Generic anchor text ("click here") nathi bawa
- Internal links okkoma 200 return karanawada (broken links na)
- Tokens 50k+ define karala thiyenawada
- Components raw hex colours use karanne nathi bawa
- Reference karana tokens okkoma define karala thiyenawada
- Dark theme eken surface/text tokens 16ma override karanawada
- Pages design-system classes use karanawada, inline styles na
- SEO: title, description, h1, canonical, OG, word count, JSON-LD
- Conversion tools deka + theme persistence

Deploy karanna kalin `node test-network.js` run karanna puluwan.
