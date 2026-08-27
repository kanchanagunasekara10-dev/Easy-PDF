# EasyPDF — Deploy karana widiya (SEO version)

## ⚠️ Palamuwa kiyawanna: me site eka double-click karala open karanna epa

Me multi-page version eka **local server ekakin** open karanna ona. `index.html` eka kelinma double-click kaloth (`file:///...`) pages athara links wada karanne na — mokada links `/jpg-to-pdf` widiyata **absolute** paths (production ekata hariyata ona widiyata). File system eke `/` kiyanne oyage **drive eke root** eka, site folder eka nemei.

**Local server ekak start karana widi 2ක් — ekak thoranna:**

**1. VS Code + Live Server** *(lesima widiya)*
Extensions eken "Live Server" install karanna → `index.html` eka right-click → "Open with Live Server". Browser eka `http://127.0.0.1:5500` wage address ekakin open wenawa, okkoma hariyata wada karanawa.

**2. Terminal eken** *(Node.js thiyenawa nam)*
```
cd site
npx serve
```
Ithin penvana address eka (`http://localhost:3000` wage) browser eke open karanna.

> **Tools deka test karanna witharak ona nam**, `easypdf.html` (single file version eka) double-click karanna — eka file:// eken kelinma wada karanawa, server ekak ona na.

---

## File structure

```
site/
├── index.html            Home page (brand + tools deka link karanawa)
├── jpg-to-pdf.html       Tool 1  →  /jpg-to-pdf
├── pdf-to-jpg.html       Tool 2  →  /pdf-to-jpg
├── favicon.svg           Browser tab icon
├── robots.txt            Search engines walata instructions
├── sitemap.xml           Google ta pages tika kiyana file eka
├── netlify.toml          Clean URLs + redirects + cache headers
└── assets/
    ├── style.css         Okkoma pages walata shared CSS
    ├── common.js         Night mode + shared helpers
    ├── jpg-to-pdf.js     Tool 1 logic
    ├── pdf-to-jpg.js     Tool 2 logic
    └── og-image.png      Social share preview image (1200×630)
```

---

## STEP 1 — Domain eka (kara iwarai ✅)

Domain eka **`easypdf-converter.com`** widiyata set karala iwarai. Canonical URLs, Open Graph tags, structured data, `robots.txt` saha `sitemap.xml` okkoma me domain eka use karanawa.

Kawadahari domain eka wenas kaloth witharai aayeth karanna ona:
1. VS Code eke `Ctrl + Shift + H` (Replace in Files)
2. Search: `https://easypdf-converter.com`
3. Replace: alut domain eka — **agata `/` ekak damanna epa**

### ⚠️ www vs non-www — ekak thoranna

Site eka `easypdf-converter.com` **saha** `www.easypdf-converter.com` kiyala thana dekakin load wenna puluwan. Google eka page dekak widiyata gaththoth ranking eka bedila yanawa (duplicate content).

Me setup eke canonical eka **non-www** (`https://easypdf-converter.com`) ekata set karala. Ithin `www` ekath non-www ekata **301 redirect** karanna ona:

**Netlify:** Domain settings → Domain management → `www.easypdf-converter.com` add karala, `easypdf-converter.com` eka "Primary domain" widiyata set karanna. Netlify eken redirect eka auto hadanawa.

**Cloudflare / anith:** Redirect rule ekak hadanna, `www.*` → `https://easypdf-converter.com/$1`, status 301.

HTTPS ekath obligatory — Netlify/Vercel/Cloudflare walin free Let's Encrypt certificate ekak auto enawa.

---

## STEP 2 — Deploy karanna

### Netlify (recommended — `netlify.toml` eka meka sandaha hadala thiyenne)

1. GitHub eke repo ekak hadala `site/` folder eke content push karanna
2. netlify.com → "Add new site" → "Import an existing project" → GitHub repo eka thoranna
3. Build command: **his thiyanna**. Publish directory: **`.`** (nathnam `site` — repo eke structure eka anuwa)
4. Deploy click karanna. Minutes 2kin live!

`netlify.toml` eken auto ma karana dewal:
- `/jpg-to-pdf.html` → `/jpg-to-pdf` clean URL eka (duplicate content prashne nawaththanawa)
- Assets walata 1-year cache (page speed → SEO)
- Security headers

### Vercel / Cloudflare Pages
Meva ekath wada karanawa, eth clean URLs walata `netlify.toml` wenuwata eyalage config eka ona. Vercel eke `vercel.json` ekak, Cloudflare eke `_redirects` file ekak.

### Test karanna (local)
`file://` eken open karoth `/assets/style.css` wage absolute paths wada karanne na. VS Code eke **Live Server** extension eken open karanna.

---

## STEP 3 — Google ta site eka kiyanna

1. **Google Search Console** (search.google.com/search-console) → "Add property" → oyage domain eka
2. Ownership verify karanna (Netlify nam DNS record ekak hari HTML tag ekak hari)
3. **Sitemaps** section ekata gihilla `sitemap.xml` submit karanna
4. **URL Inspection** eken pages 3ma ekin eka "Request Indexing" karanna

Google index karanna dawas 3–14k withara ganawa. Ikman wenna ba — ithin patan gaththa pasu ithuru wada karamu.

---

## SEO checklist — dan thiyena dewal

| Item | Status |
|---|---|
| Tool ekakata wenwena URL ekak | ✅ `/jpg-to-pdf`, `/pdf-to-jpg` |
| Unique title tag (chars 50–60) | ✅ pages 3ma |
| Unique meta description (chars 150–160) | ✅ pages 3ma |
| Page ekakata `<h1>` ekak witharai | ✅ |
| Heading hierarchy (h1 → h2 → h3) | ✅ |
| Canonical URL | ✅ |
| Open Graph + Twitter Card tags | ✅ |
| JSON-LD structured data | ✅ WebApplication, HowTo, FAQPage, BreadcrumbList, WebSite, Organization |
| Breadcrumb navigation | ✅ visual + structured data |
| Internal linking | ✅ nav, footer, related-tool cards |
| Content depth | ✅ page ekakata wachana 535–671 |
| FAQ section (rich snippets walata) | ✅ 6 questions/page |
| robots.txt | ✅ |
| sitemap.xml | ✅ |
| Favicon | ✅ |
| Mobile responsive | ✅ |
| Scripts `defer` (render blocking na) | ✅ |
| Image alt text | ✅ |
| HTTPS | ✅ Netlify auto |
| Fast load (static, no server) | ✅ |

## Passe karanna puluwan dewal (rank eka thawa wadi karanna)

1. **`sitemap.xml` eke `lastmod` update karanna** — content change karana hama parama.
2. **Blog/guide pages tikak add karanna** — "How to scan documents with your phone", "PDF vs JPG: which should you use" wage. Meken long-tail keywords walin traffic enawa.
3. **Backlinks** — Reddit, Quora, Facebook groups wala tool eka share karanna. Backlinks thamai ranking walata loku ma factor eka.
4. **Google Analytics / Plausible** — traffic eka track karanna.
5. **Tools thawa tikak add karanna** — PNG to PDF, PDF merge, PDF compress. Tool ekakata page ekak = keyword ekak.
6. **`og-image.png` eka lassanata redesign karanna** — social share walata click rate eka wadi wenawa.
