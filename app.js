const SAMPLE_SHA256 = 'a90b93a2ea2288fd6efb886b0344f519a301e1901e5daf3da73f3bd7c3b94214';
const fileInput = document.querySelector('#fileInput');
const result = document.querySelector('#scanResult');
const sampleButton = document.querySelector('#sampleButton');
const dropZone = document.querySelector('#dropZone');

function showResult(level, title, detail) {
  result.className = `scan-result ${level}`;
  result.querySelector('.result-icon').textContent = level === 'high' ? '!' : level === 'medium' ? '!' : level === 'low' ? '?' : '✓';
  result.querySelector('b').textContent = title;
  result.querySelector('p').textContent = detail;
}

async function checkFile(file) {
  if (!file) return;
  showResult('low', 'Scanning locally…', `${file.name} · ${formatBytes(file.size)}`);
  try {
    if (!globalThis.crypto?.subtle) throw new Error('Secure fingerprinting is unavailable in this browser context.');
    if (file.size > 80 * 1024 * 1024) {
      showResult('low', 'Unable to scan file', 'This demo has an 80 MB local scan limit. Please choose a smaller file.');
      return;
    }
    const bytes = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const fingerprint = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    if (fingerprint === SAMPLE_SHA256) {
      showResult('high', 'HIGH RISK · Exact sample match', `${file.name} has the same SHA-256 fingerprint as the registered demo sample.`);
    } else if (/\.(pdf|docx?|pptx?|xlsx?|txt|rtf|odt|ods|odp)$/i.test(file.name)) {
      showResult('medium', 'MEDIUM RISK · Review suggested', `${file.name} is a common document type. This rule does not confirm that it contains an exam paper.`);
    } else {
      showResult('low', 'LOW CONFIDENCE · Manual review', `No exact sample match found for ${file.name}. This demo cannot determine whether it contains confidential material.`);
    }
  } catch (error) {
    showResult('low', 'Unable to scan file', error?.message || 'The browser could not read this file. Please try another one.');
  }
}

function formatBytes(size) {
  if (size < 1024) return `${size} bytes`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

fileInput.addEventListener('change', () => checkFile(fileInput.files?.[0]));
sampleButton.addEventListener('click', async () => {
  try {
    const response = await fetch('MOCK-042.png');
    if (!response.ok) throw new Error('The registered sample could not be loaded.');
    const blob = await response.blob();
    await checkFile(new File([blob], 'MOCK-042.png', { type: blob.type }));
  } catch (error) {
    showResult('low', 'Unable to scan sample', error?.message || 'Please check that the website assets were published.');
  }
});

dropZone.addEventListener('dragover', event => { event.preventDefault(); dropZone.classList.add('dragging'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', event => {
  event.preventDefault();
  dropZone.classList.remove('dragging');
  checkFile(event.dataTransfer?.files?.[0]);
});

const menuToggle = document.querySelector('#menuToggle');
const mainNav = document.querySelector('#mainNav');
menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

