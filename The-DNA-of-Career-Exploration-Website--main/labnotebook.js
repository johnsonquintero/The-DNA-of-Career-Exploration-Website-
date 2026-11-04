/* =========================================================
   labnotebook.js — Classic Ruled Digital Lab Notebook
   Cleaned of date reminders & exp tags
   ========================================================= */

function labNotebookInit() {
  if (document.getElementById('lab-notebook')) return;
  const STORAGE_KEY = 'dnaLabNotebook.v1';

  const paperAudio = new Audio('paper.mp3');
  paperAudio.preload = 'auto';
  paperAudio.volume = 0.5;

  function playPaperSound() {
    paperAudio.pause();
    paperAudio.currentTime = 0;
    paperAudio.play().catch(() => {});
  }

  const css = `
  .lab-notebook {
    position: fixed;
    top: 5vh;
    bottom: 110px;
    width: min(760px, 92vw);
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
    visibility: hidden;
    z-index: 10001;
    display: flex;
    flex-direction: column;
    background: #fdfbf7;
    border: 5px solid #000;
    border-left-width: 14px;
    border-radius: 18px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.85), 0 0 24px rgba(77, 238, 234, 0.3);
    padding: 14px 14px 12px;
    color: #122852;
    transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
  }
  .lab-notebook.open {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateX(-50%) translateY(0) !important;
  }
  .lab-notebook .ln-close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border: 1.5px solid #41b8cd;
    border-radius: 50%;
    background: #fff;
    color: #1e3a6e;
    font: bold 14px/1 Arial, sans-serif;
    cursor: pointer;
  }
  .lab-notebook .ln-close:hover { background: #41b8cd; color: #fff; }
  .ln-title {
    align-self: center;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.6rem;
    letter-spacing: 1px;
    color: #000;
    border: 1.5px solid #41b8cd;
    border-radius: 30px;
    padding: 8px 30px;
    margin-bottom: 12px;
  }
  .ln-objective {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.45rem;
    color: #0f5566;
    margin-bottom: 12px;
  }
  .ln-objective input {
    font-family: 'Caveat', cursive, sans-serif;
    font-size: 1.35rem;
    font-weight: 700;
    border: none;
    border-bottom: 1.5px solid #41b8cd;
    outline: none;
    background: transparent;
    width: 220px;
    text-align: center;
    color: #092352;
  }
  .ln-page {
    flex: 1;
    min-height: 0;
    width: 100%;
    resize: none;
    border: none;
    outline: none;
    background-color: transparent;
    background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 27px, #9ac1dc 27px, #9ac1dc 28px);
    background-attachment: local;
    font-family: 'Caveat', cursive, sans-serif;
    font-size: 1.45rem;
    font-weight: 600;
    line-height: 28px;
    color: #0c2048;
    padding: 0 6px;
    overflow-y: auto;
  }
  .ln-page::placeholder {
    font-family: 'Caveat', cursive, sans-serif;
    font-size: 1.3rem;
    color: #6386a6;
  }
  .ln-sign { display: flex; gap: 6px; margin-top: 8px; }
  .ln-pill {
    display: flex;
    align-items: baseline;
    gap: 3px;
    border: 1.5px solid #41b8cd;
    border-radius: 20px;
    padding: 6px 10px;
    font-family: 'Caveat', cursive, sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #122852;
    background: #fff;
    flex: 1;
  }
  .ln-pill input {
    width: 100%;
    border: none;
    border-bottom: 1.5px solid #000;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    color: #0b1f42;
  }
  .ln-quick {
    margin-top: 8px;
    width: 180px;
    background: #000;
    color: #fff;
    border: 1.5px solid #41b8cd;
    border-radius: 14px;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.4rem;
    padding: 6px 10px;
    outline: none;
  }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const nb = document.createElement('section');
  nb.className = 'lab-notebook';
  nb.id = 'lab-notebook';
  nb.innerHTML = `
    <button class="ln-close" type="button" aria-label="Close notebook">&times;</button>
    <div class="ln-title">DIGITAL LAB NOTEBOOK</div>
    <div class="ln-objective">
      <span>DAILY OBJECTIVE:</span>
      <input type="text" id="ln-objective" maxlength="60" placeholder="e.g. Run Gel Electrophoresis" />
    </div>
    <textarea class="ln-page" id="ln-page" placeholder="Type observations, procedure steps, and notes here..."></textarea>
    <div class="ln-sign">
      <label class="ln-pill">Sig: <input type="text" id="ln-sig1" /></label>
      <label class="ln-pill">Date: <input type="text" id="ln-date" placeholder="MM/DD" /></label>
      <label class="ln-pill">Sig: <input type="text" id="ln-sig2" /></label>
    </div>
    <input class="ln-quick" type="text" id="ln-quick" placeholder="Quick log + ↵" />
  `;
  document.body.appendChild(nb);

  const page = nb.querySelector('#ln-page');
  const objective = nb.querySelector('#ln-objective');
  const dateInput = nb.querySelector('#ln-date');
  const sig1 = nb.querySelector('#ln-sig1');
  const sig2 = nb.querySelector('#ln-sig2');
  const quick = nb.querySelector('#ln-quick');
  const closeBtn = nb.querySelector('.ln-close');
  const fields = { page, objective, date: dateInput, sig1, sig2 };

  function save() {
    const data = {};
    Object.keys(fields).forEach(k => data[k] = fields[k].value);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      Object.keys(fields).forEach(k => { if (data[k]) fields[k].value = data[k]; });
    } catch(e) {}
  }

  Object.values(fields).forEach(input => input.addEventListener('input', save));

  quick.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && quick.value.trim()) {
      page.value += (page.value && !page.value.endsWith('\n') ? '\n' : '') + quick.value.trim() + '\n';
      quick.value = '';
      save();
    }
  });

  function openNotebook() {
    playPaperSound();
    if (!dateInput.value) { dateInput.value = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }); save(); }
    nb.classList.add('open');
    page.focus();
  }

  function closeNotebook() {
    playPaperSound();
    nb.classList.remove('open');
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, a');
    if (btn && /NOTEBOOK/i.test(btn.textContent)) {
      e.preventDefault();
      e.stopPropagation();
      nb.classList.contains('open') ? closeNotebook() : openNotebook();
    }
  });

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeNotebook();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nb.classList.contains('open')) closeNotebook(); });
  load();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', labNotebookInit);
} else {
  labNotebookInit();
}