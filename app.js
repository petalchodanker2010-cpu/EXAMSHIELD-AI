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

// Small, device-friendly interactions make the showcase feel alive without a heavy 3D library.
const progress = document.querySelector('#scrollProgress');
const topbar = document.querySelector('.topbar');
function updateScrollChrome() {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  topbar?.classList.toggle('scrolled', scrollY > 12);
  document.documentElement.style.setProperty('--scene-shift', `${Math.round(scrollY * 0.08)}px`);
}
addEventListener('scroll', updateScrollChrome, { passive: true });
updateScrollChrome();

const revealItems = document.querySelectorAll('.section-heading, .problem-grid > *, .step, .insider-card, .demo-intro, .scan-panel, .level, .sdg-grid > *, .download-wrap > *, .limits-inner');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal', 'in-view');
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  revealItems.forEach(item => revealObserver.observe(item));
}

const workflowSteps = [...document.querySelectorAll('.steps .step')];
const stepDetail = document.querySelector('#stepDetail');
const workflowCopy = [
  ['01', 'Start with a controlled workspace.', 'The paper setter prepares the document where access can be supervised and recorded.'],
  ['02', 'Give the paper a protected identity.', 'Encryption and a unique document identifier are proposed safeguards that help protect and track the approved file.'],
  ['03', 'Separate creation from approval.', 'An independent examination controller reviews the paper. The creator cannot authorize its release alone.'],
  ['04', 'Keep a record and release on schedule.', 'Access events can be logged and reviewed. Authorized users receive the paper only at the approved time.']
];
workflowSteps.forEach((step, index) => {
  step.tabIndex = 0;
  step.setAttribute('role', 'button');
  step.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
  const selectStep = () => {
    workflowSteps.forEach(item => { item.classList.remove('selected'); item.setAttribute('aria-pressed', 'false'); });
    step.classList.add('selected');
    step.setAttribute('aria-pressed', 'true');
    if (stepDetail) {
      stepDetail.querySelector('.detail-index').textContent = workflowCopy[index][0];
      stepDetail.querySelector('p').innerHTML = `<b>${workflowCopy[index][1]}</b> ${workflowCopy[index][2]}`;
    }
  };
  step.addEventListener('click', selectStep);
  step.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectStep(); } });
});
workflowSteps[0]?.classList.add('selected');

const heroArt = document.querySelector('#heroArt');
if (heroArt && matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroArt.addEventListener('pointermove', event => {
    const rect = heroArt.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroArt.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 6}deg)`;
  });
  heroArt.addEventListener('pointerleave', () => { heroArt.style.transform = ''; });
}

