# EasyPDF — GitHub Pages ekata deploy karana widiya

Domain: **easypdf-converter.com**

---

## ⚠️ Mona wunada kiyala palamuwa

Oyage repo eke files okkoma **root eke flat wela** thibba (`style.css`, `common.js`, ... okkoma ekama thænaka). Eth HTML files hoyamin hitiye `assets/style.css` kiyala **`assets/` folder ekak athule**. E folder eka nathi nisa CSS eka 404 wela, browser eka plain HTML pennuwa (Times New Roman, nil links, loku SVG icons).

Meka wenne GitHub ge web uploader eken files drag karaddi folder structure eka nathi wena nisa.

**Me version eke okkoma flat** — oyage repo ekata hariyata ma gælapenawa. `assets/` folder ekak na, ithin aayeth kadenne na.

---

## STEP 1 — Files upload karanna

Repo eke **parana files okkoma delete karala**, me folder eke thiyena okkoma upload karanna. Files 14ක්:

```
index.html          Home page
jpg-to-pdf.html     Tool 1   →  /jpg-to-pdf
pdf-to-jpg.html     Tool 2   →  /pdf-to-jpg
style.css           Design system (tokens + components)
common.js           Night mode + shared helpers
jpg-to-pdf.js       Tool 1 logic
pdf-to-jpg.js       Tool 2 logic
favicon.svg         Browser tab icon
og-image.png        WhatsApp / Facebook share preview
robots.txt          Search engines walata
sitemap.xml         Google ta pages tika kiyanawa
.nojekyll           GitHub Pages ta "files as-is serve karanna" kiyanawa
DEPLOY-README.md    Me file eka
DESIGN-SYSTEM.md    Design system + linking network documentation
```

> **`.nojekyll` file eka amathaka karanna epa.** Eka his file ekak, eth GitHub Pages ta kiyanawa Jekyll eken process karanna epa kiyala. Nathnam sometimes files skip wenna puluwan. GitHub web UI eken dot ekakin patan ganna files upload karanna amaru nam, "Add file → Create new file" karala name eka `.nojekyll` kiyala type karala, his thiyagena commit karanna.

Upload karapu passe **Actions** tab eka balanna — workflow eka green tick ekak enakan innna. Ithin site eka live.

---

## STEP 2 — Domain eka connect karanna

### 2a. GitHub eke

Repo → **Settings → Pages → Custom domain** ekata `easypdf-converter.com` type karala Save karanna. Meken repo ekata `CNAME` file ekak auto add wenawa.

"Enforce HTTPS" checkbox ekath tick karanna (certificate eka hædenna පැයක් withara ganna puluwan).

### 2b. Domain provider eke (DNS records)

Domain eka gaththa thæna (Namecheap / GoDaddy / Cloudflare) DNS settings walata gihilla:

**A records 4ක්** — host `@`, values:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**AAAA records 4ක්** (IPv6) — host `@`, values:
```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**CNAME record ekak** — host `www`, value: `<oyage-github-username>.github.io`
(repo name eka **damanna epa** — username eka witharai)

DNS propagate wenna **paya 1–24ක්** ganna puluwan. Ikman wenna ba.

### 2c. www vs non-www — meka wædagath

Site eka `easypdf-converter.com` **saha** `www.easypdf-converter.com` kiyala thana dekakin load wenna puluwan. Google eka page dekak widiyata gaththoth ranking eka bedila yanawa (duplicate content).

Me setup eke canonical URLs okkoma **non-www** (`https://easypdf-converter.com`). GitHub Pages eke Custom domain eka `easypdf-converter.com` (www nathuwa) widiyata set kaloth, `www` eken enna kena auto redirect wenawa. Ithin uda 2a eke www **nathuwa** type karanna.

---

## STEP 3 — Google ta kiyanna

1. [Google Search Console](https://search.google.com/search-console) ekata gihilla `https://easypdf-converter.com` add karanna
2. Ownership verify karanna (DNS TXT record ekak lesima widiya)
3. **Sitemaps** section eke `sitemap.xml` submit karanna
4. **URL Inspection** eken pages 3ma ("/", "/jpg-to-pdf", "/pdf-to-jpg") "Request Indexing" karanna

Index wenna dawas **3–14ක්** withara ganawa.

---

## Live wunata passe check karanna

- `https://easypdf-converter.com` — CSS eka penenawada (sudu-grey background, red logo)
- Nav links deka wada karanawada
- Night mode toggle eka
- JPG ekak PDF ekakata convert wenawada
- PDF ekak JPG walata convert wenawada
- `https://easypdf-converter.com/robots.txt` saha `/sitemap.xml` open wenawada
- Link eka WhatsApp ekakata paste karala preview image eka enawada

CSS eka aayeth penne nathnam: browser eke **F12 → Network** tab eka open karala reload karanna. Red 404 ekak thiyenawada kiyala balanna — e file eka repo eke nathi eka thamai prashne.

---

## Danaganna

**`netlify.toml` ain kala.** Eka Netlify walata witharai; GitHub Pages ekata wædak na. Passe Netlify ekata maru wenawa nam kalin ZIP eken aayeth ganna puluwan.

**Clean URLs wada karanawa.** GitHub Pages `/jpg-to-pdf` illuwoth `jpg-to-pdf.html` serve karanawa, ithin canonical URLs okkoma hariyata gælapenawa.

**Colours wenas karanna:** `style.css` eke udin thiyena `LAYER 1 — TOKENS` section eke `--color-brand` line 3 witharak wenas karanna. Buttons, links, progress bars okkoma ekawara maru wenawa. Dark mode ekath ekathma.

**Content edit karanna:** HTML files wala text kelinma wenas karanna puluwan. Eth `<script type="application/ld+json">` blocks wala thiyena FAQ answers page eke penena FAQ answers ekka **ekama ekak** wenna ona — Google ta deka wenas nam structured data eka ignore karanawa.
