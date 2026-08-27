const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'site');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let f = path.join(ROOT, p);
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f = f + '.html';
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end('404'); }
  res.setHeader('Content-Type', TYPES[path.extname(f)] || 'application/octet-stream');
  res.end(fs.readFileSync(f));
});

let fails = 0;
const check = (l, c, x = '') => { if (!c) fails++; console.log(`${c ? 'PASS' : 'FAIL'}  ${l}${x ? '  ' + x : ''}`); };

const PAGES = ['/', '/jpg-to-pdf', '/pdf-to-jpg'];

(async () => {
  await new Promise(r => server.listen(8899, r));
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.route('https://cdnjs.cloudflare.com/**', route => {
    const f = path.join(__dirname, 'libs', path.basename(new URL(route.request().url()).pathname));
    fs.existsSync(f) ? route.fulfill({ body: fs.readFileSync(f), contentType: 'application/javascript' }) : route.abort();
  });

  // ================= INTERNAL LINKING NETWORK =================
  console.log('=== Internal linking network ===');
  const graph = {};
  const allTargets = new Set();
  for (const url of PAGES) {
    await page.goto('http://localhost:8899' + url);
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href^="/"]')].map(a => ({
      href: new URL(a.getAttribute('href'), location.origin).pathname,
      text: a.textContent.trim().replace(/\s+/g, ' '),
      inProse: !!a.closest('p, li') && !a.closest('nav, footer')
    })));
    graph[url] = links;
    links.forEach(l => allTargets.add(l.href));
  }

  // Every page must link to every other page
  for (const from of PAGES) {
    for (const to of PAGES) {
      if (from === to) continue;
      const has = graph[from].some(l => l.href === to);
      check(`${from} links to ${to}`, has);
    }
  }

  // Link volume + prose links + anchor text variety
  for (const url of PAGES) {
    const links = graph[url];
    const prose = links.filter(l => l.inProse && l.href !== url);
    const anchors = new Set(links.map(l => l.text.toLowerCase()).filter(Boolean));
    const generic = links.filter(l => /^(click here|here|read more|link)$/i.test(l.text));
    check(`${url} has >= 8 internal links`, links.length >= 8, `(${links.length})`);
    check(`${url} has >= 2 contextual prose links`, prose.length >= 2, `(${prose.length})`);
    check(`${url} has >= 6 distinct anchor texts`, anchors.size >= 6, `(${anchors.size})`);
    check(`${url} has no generic anchor text`, generic.length === 0, generic.map(g => g.text).join(', '));
  }

  // No broken internal links anywhere
  console.log('\n=== Broken link crawl ===');
  for (const t of [...allTargets].sort()) {
    const r = await page.request.get('http://localhost:8899' + t);
    check(`${t} resolves`, r.status() === 200, String(r.status()));
  }

  // ================= DESIGN SYSTEM =================
  console.log('\n=== Design system ===');
  const css = fs.readFileSync(path.join(ROOT, 'assets/style.css'), 'utf8');
  const tokenNames = [...css.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map(m => m[1]);
  check('token layer defined', new Set(tokenNames).size >= 50, `(${new Set(tokenNames).size} tokens)`);

  // Component layer must not hardcode hex colours (tokens only).
  const componentCss = css.slice(css.indexOf('LAYER 3'));
  const rawHex = [...componentCss.matchAll(/#[0-9a-f]{3,8}\b/gi)].map(m => m[0]);
  check('components use tokens, not raw hex', rawHex.length <= 2, rawHex.join(' '));

  // Every token referenced must actually exist.
  const used = new Set([...css.matchAll(/var\((--[a-z0-9-]+)/g)].map(m => m[1]));
  const defined = new Set(tokenNames);
  const missing = [...used].filter(t => !defined.has(t));
  check('no undefined token references', missing.length === 0, missing.join(', '));

  // Dark theme must override every surface/text token that needs inverting.
  const darkBlock = css.slice(css.indexOf('body.dark {'), css.indexOf('LAYER 2'));
  const mustInvert = ['--color-bg', '--color-surface', '--color-surface-sunken', '--color-border',
    '--color-border-strong', '--color-text', '--color-text-muted', '--color-hover-wash',
    '--color-track', '--color-brand-tint', '--color-toggle-track', '--color-success-bg',
    '--color-success-border', '--color-danger', '--color-danger-bg', '--color-danger-border'];
  const notInverted = mustInvert.filter(t => !new RegExp(t + '\\s*:').test(darkBlock));
  check('dark theme overrides all surface/text tokens', notInverted.length === 0, notInverted.join(', '));

  // Pages must use design-system classes, not ad-hoc ones.
  for (const url of PAGES) {
    await page.goto('http://localhost:8899' + url);
    const ds = await page.evaluate(() => ({
      header: !!document.querySelector('.site-header'),
      footer: !!document.querySelector('.site-footer'),
      page: !!document.querySelector('.page'),
      btns: document.querySelectorAll('.btn').length,
      cards: document.querySelectorAll('.link-card').length,
      inlineStyles: [...document.querySelectorAll('[style]')].length
    }));
    check(`${url} uses .site-header/.site-footer/.page`, ds.header && ds.footer && ds.page);
    check(`${url} link cards present`, ds.cards >= 2, `(${ds.cards})`);
    check(`${url} inline styles <= 1`, ds.inlineStyles <= 1, `(${ds.inlineStyles})`);
  }

  // ================= SEO =================
  console.log('\n=== SEO ===');
  for (const url of PAGES) {
    await page.goto('http://localhost:8899' + url);
    const s = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name=description]').content,
      h1: document.querySelectorAll('h1').length,
      canonical: !!document.querySelector('link[rel=canonical]'),
      og: document.querySelectorAll('meta[property^="og:"]').length,
      words: document.body.innerText.trim().split(/\s+/).length,
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(x => x.textContent)
    }));
    check(`${url} title <= 65`, s.title.length <= 65, `(${s.title.length})`);
    check(`${url} desc 120-165`, s.desc.length >= 120 && s.desc.length <= 165, `(${s.desc.length})`);
    check(`${url} one h1`, s.h1 === 1);
    check(`${url} canonical + og`, s.canonical && s.og >= 6);
    check(`${url} words > 600`, s.words > 600, `(${s.words})`);
    let types = [], ok = true;
    try { JSON.parse(s.ld[0])['@graph'].forEach(n => types.push(n['@type'])); } catch (e) { ok = false; }
    check(`${url} JSON-LD valid`, ok, types.join(', '));
  }

  // ================= FUNCTIONALITY =================
  console.log('\n=== Converters + theme ===');
  await page.goto('http://localhost:8899/jpg-to-pdf');
  await page.setInputFiles('#input1', [path.join(__dirname, 'test1.jpg'), path.join(__dirname, 'test2.jpg')]);
  await page.waitForSelector('#panel1.show');
  await page.click('#convert1');
  await page.waitForSelector('#res1.show', { timeout: 30000 });
  const pdf = await page.evaluate(async () => {
    const b = await (await fetch(document.getElementById('dl1').href)).arrayBuffer();
    return { size: b.byteLength, head: String.fromCharCode(...new Uint8Array(b.slice(0, 5))) };
  });
  check('JPG to PDF works', pdf.head === '%PDF-', `${pdf.size} bytes`);

  await page.click('#modeToggle');
  await page.waitForTimeout(200);
  check('dark mode toggles', await page.evaluate(() => document.body.classList.contains('dark')));
  await page.goto('http://localhost:8899/pdf-to-jpg');
  await page.waitForTimeout(200);
  check('dark persists across pages', await page.evaluate(() => document.body.classList.contains('dark')));
  await page.screenshot({ path: 'ss-ds-dark.png' });
  await page.click('#modeToggle');

  await page.setInputFiles('#input2', path.join(__dirname, 'test.pdf'));
  await page.waitForSelector('#panel2.show');
  await page.click('#convert2');
  await page.waitForSelector('#res2.show', { timeout: 60000 });
  const zip = await page.evaluate(async () => {
    const a = document.getElementById('dl2');
    const b = await (await fetch(a.href)).arrayBuffer();
    return { name: a.download, size: b.byteLength, head: String.fromCharCode(...new Uint8Array(b.slice(0, 2))) };
  });
  check('PDF to JPG works', zip.head === 'PK', `${zip.name} ${zip.size} bytes`);

  check('no console/page errors', errors.length === 0, errors.join(' | '));

  await page.goto('http://localhost:8899/jpg-to-pdf');
  await page.screenshot({ path: 'ss-ds-light.png' });

  // ---- Print the link graph ----
  console.log('\n=== Link graph ===');
  for (const from of PAGES) {
    const counts = {};
    graph[from].forEach(l => { counts[l.href] = (counts[l.href] || 0) + 1; });
    console.log(`  ${from}`);
    Object.entries(counts).sort().forEach(([to, n]) => console.log(`     -> ${to}  x${n}`));
  }

  await browser.close();
  server.close();
  console.log(`\n${fails === 0 ? 'ALL CHECKS PASSED' : fails + ' CHECK(S) FAILED'}`);
})();
