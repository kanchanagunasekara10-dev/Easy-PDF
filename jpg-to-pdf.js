/* ==========================================================================
   EasyPDF — JPG / PNG to PDF converter (uses pdf-lib, runs fully in browser)
   ========================================================================== */

let images = []; // { file, url }

function handleImageFiles(files) {
  hideError($('err1')); $('res1').classList.remove('show');
  const valid = files.filter(f => ['image/jpeg', 'image/png'].includes(f.type));
  if (valid.length !== files.length) showError($('err1'), 'Only JPG and PNG images are supported. Other files were skipped.');
  for (const f of valid) {
    if (f.size > MAX_SIZE) { showError($('err1'), `"${f.name}" is larger than 50MB and was skipped.`); continue; }
    images.push({ file: f, url: URL.createObjectURL(f) });
  }
  renderThumbs();
}

function renderThumbs() {
  const wrap = $('thumbs1');
  wrap.innerHTML = '';
  images.forEach((img, i) => {
    const div = document.createElement('div');
    div.className = 'thumb';
    div.innerHTML = `
      <img src="${img.url}" alt="Preview of ${img.file.name}">
      <div class="t-name">${img.file.name}</div>
      <div class="t-tools">
        <button title="Move left" data-act="left" data-i="${i}">&larr;</button>
        <button title="Move right" data-act="right" data-i="${i}">&rarr;</button>
        <button title="Remove" data-act="del" data-i="${i}">&times;</button>
      </div>`;
    wrap.appendChild(div);
  });
  $('panel1').classList.toggle('show', images.length > 0);
}

document.addEventListener('DOMContentLoaded', () => {
  setupDropzone($('dz1'), $('input1'), handleImageFiles);

  $('thumbs1').addEventListener('click', e => {
    const btn = e.target.closest('button'); if (!btn) return;
    const i = +btn.dataset.i, act = btn.dataset.act;
    if (act === 'del') { URL.revokeObjectURL(images[i].url); images.splice(i, 1); }
    if (act === 'left' && i > 0) [images[i - 1], images[i]] = [images[i], images[i - 1]];
    if (act === 'right' && i < images.length - 1) [images[i + 1], images[i]] = [images[i], images[i + 1]];
    renderThumbs();
  });

  $('clear1').addEventListener('click', () => {
    images.forEach(im => URL.revokeObjectURL(im.url));
    images = []; renderThumbs();
    $('res1').classList.remove('show'); hideError($('err1'));
  });

  $('convert1').addEventListener('click', async () => {
    if (!images.length) return;
    const btn = $('convert1');
    btn.disabled = true; hideError($('err1')); $('res1').classList.remove('show');
    $('prog1').classList.add('show');
    try {
      const { PDFDocument } = PDFLib;
      const pdfDoc = await PDFDocument.create();
      const sizeOpt = $('pageSize').value;
      const landscape = $('orientation').value === 'landscape';
      const margin = +$('margin').value;
      const SIZES = { a4: [595.28, 841.89], letter: [612, 792] };

      for (let i = 0; i < images.length; i++) {
        setProgress($('fill1'), $('ptext1'), (i / images.length) * 100, `Adding image ${i + 1} of ${images.length}...`);
        const bytes = await images[i].file.arrayBuffer();
        const img = images[i].file.type === 'image/png'
          ? await pdfDoc.embedPng(bytes)
          : await pdfDoc.embedJpg(bytes);

        let pw, ph;
        if (sizeOpt === 'fit') { pw = img.width + margin * 2; ph = img.height + margin * 2; }
        else { [pw, ph] = SIZES[sizeOpt]; if (landscape) [pw, ph] = [ph, pw]; }

        const page = pdfDoc.addPage([pw, ph]);
        const availW = pw - margin * 2, availH = ph - margin * 2;
        const scale = Math.min(availW / img.width, availH / img.height, 1);
        const w = img.width * scale, h = img.height * scale;
        page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
        await new Promise(r => setTimeout(r)); // keep UI responsive
      }

      setProgress($('fill1'), $('ptext1'), 100, 'Saving PDF...');
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      $('dl1').href = URL.createObjectURL(blob);
      $('res1').classList.add('show');
    } catch (err) {
      console.error(err);
      showError($('err1'), 'Something went wrong while creating the PDF. Please try again.');
    } finally {
      btn.disabled = false;
      $('prog1').classList.remove('show');
    }
  });
});
