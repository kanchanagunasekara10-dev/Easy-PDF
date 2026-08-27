/* ==========================================================================
   EasyPDF — PDF to JPG converter (uses pdf.js + JSZip, runs fully in browser)
   ========================================================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfFile = null;

function handlePdfFiles(files) {
  hideError($('err2')); $('res2').classList.remove('show');
  const f = files[0];
  if (!f) return;
  if (f.type !== 'application/pdf') { showError($('err2'), 'Please select a PDF file.'); return; }
  if (f.size > MAX_SIZE) { showError($('err2'), 'File is larger than 50MB.'); return; }
  pdfFile = f;
  $('pdfInfo').textContent = `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`;
  $('panel2').classList.add('show');
}

document.addEventListener('DOMContentLoaded', () => {
  setupDropzone($('dz2'), $('input2'), handlePdfFiles);

  $('clear2').addEventListener('click', () => {
    pdfFile = null;
    $('panel2').classList.remove('show');
    $('res2').classList.remove('show'); hideError($('err2'));
  });

  $('convert2').addEventListener('click', async () => {
    if (!pdfFile) return;
    const btn = $('convert2');
    btn.disabled = true; hideError($('err2')); $('res2').classList.remove('show');
    $('prog2').classList.add('show');
    try {
      const data = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const scale = +$('quality').value;
      const baseName = pdfFile.name.replace(/\.pdf$/i, '');
      const blobs = [];

      for (let p = 1; p <= pdf.numPages; p++) {
        setProgress($('fill2'), $('ptext2'), ((p - 1) / pdf.numPages) * 100, `Converting page ${p} of ${pdf.numPages}...`);
        const page = await pdf.getPage(p);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
        blobs.push(blob);
        canvas.width = canvas.height = 0; // free memory
      }

      setProgress($('fill2'), $('ptext2'), 100, 'Preparing download...');
      if (blobs.length === 1) {
        $('dl2').href = URL.createObjectURL(blobs[0]);
        $('dl2').download = `${baseName}.jpg`;
        $('dl2').textContent = 'Download JPG';
      } else {
        const zip = new JSZip();
        blobs.forEach((b, i) => zip.file(`${baseName}_page_${i + 1}.jpg`, b));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        $('dl2').href = URL.createObjectURL(zipBlob);
        $('dl2').download = `${baseName}_images.zip`;
        $('dl2').textContent = `Download ZIP (${blobs.length} images)`;
      }
      $('res2').classList.add('show');
    } catch (err) {
      console.error(err);
      const msg = /password/i.test(err.message || '')
        ? 'This PDF is password-protected. Please unlock it first.'
        : 'Something went wrong while converting the PDF. Please try again.';
      showError($('err2'), msg);
    } finally {
      btn.disabled = false;
      $('prog2').classList.remove('show');
    }
  });
});
