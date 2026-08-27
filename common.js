/* ==========================================================================
   EasyPDF — shared helpers + night/day mode
   ========================================================================== */

const $ = id => document.getElementById(id);
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

/* ---------- Night / Day mode (persists via localStorage) ---------- */
function getSavedTheme() {
  try { return localStorage.getItem('easypdf-theme'); } catch (e) { return null; }
}
function saveTheme(t) {
  try { localStorage.setItem('easypdf-theme', t); } catch (e) { /* storage unavailable */ }
}
if (getSavedTheme() === 'dark') document.body.classList.add('dark');

document.addEventListener('DOMContentLoaded', () => {
  const toggle = $('modeToggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    saveTheme(isDark ? 'dark' : 'light');
  });
});

/* ---------- Shared UI helpers ---------- */
function setupDropzone(dz, input, onFiles) {
  dz.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { onFiles([...input.files]); input.value = ''; });
  ['dragover', 'dragenter'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('dragover'); }));
  dz.addEventListener('drop', e => onFiles([...e.dataTransfer.files]));
}
function showError(el, msg) { el.textContent = msg; el.classList.add('show'); }
function hideError(el) { el.classList.remove('show'); }
function setProgress(fill, text, pct, msg) { fill.style.width = pct + '%'; text.textContent = msg; }
