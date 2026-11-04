/* =========================================================
   biobot.js — BIO-BOT 9000 Interactive Lab Guide
   Animated popup + footer button + Gemini backend
   ========================================================= */

const ROLE_DETAILS = {
  "DNA Analyst": "Profiles and extracts DNA evidence, comparing trace samples against known databases to solve forensic inquiries. Salary: $67,440 - $81,367 (Bachelors Degree).",
  "Bioprocess Engineer": "Designs bioreactor equipment and fermentation pipelines to scale microbial proteins, biofuels, and bioplastics. Salary: $112,139 (Bachelors Degree).",
  "Clinical Technician": "Prepares patient specimens, operates robotic analyzers, and performs clinical tests in diagnostic hospital environments. Salary: $45,162 (Associates or Bachelors).",
  "Quality Systems Specialist": "Audits laboratory SOPs and manufacturing protocols to ensure treatments comply with strict government standards. Salary: $93,599 (Bachelors Degree).",
  "Plant Geneticist": "Applies gene editing to manipulate crop DNA, improving harvest yields, disease immunity, and climate tolerance. Salary: $106,000 (Bachelors or Masters).",
  "Discovery Research Scientist": "Conducts wet-lab screening experiments to invent therapeutic molecules and target novel cancer therapies. Salary: $115,000 (Bachelors or Ph.D.)."
};

function initBioBot() {
  // Prevent duplicate widgets if this script is accidentally loaded twice.
  if (document.getElementById('chat-window')) return;

  const pagePath = window.location.pathname.toLowerCase();

  // localStorage can be unavailable in some browser configurations.
  let savedRole = null;

  try {
    savedRole = localStorage.getItem('biotech_matched_role');
  } catch (error) {
    console.warn('BIO-BOT could not read the saved career role:', error);
  }

  let soundCtx = null;

  function getAudio() {
    try {
      if (localStorage.getItem('biotech_muted') === '1') return null;
      if (!soundCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) soundCtx = new AC();
      }

      if (soundCtx && soundCtx.state === 'suspended') {
        soundCtx.resume().catch(() => {});
      }

      return soundCtx;
    } catch (error) {
      return null;
    }
  }

  const SoundFX = {
    tone(frequency, duration, type = 'sine', volume = 0.025) {
      const c = getAudio();
      if (!c) return;

      try {
        const osc = c.createOscillator();
        const gain = c.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, c.currentTime);

        gain.gain.setValueAtTime(volume, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          c.currentTime + duration
        );

        osc.connect(gain);
        gain.connect(c.destination);

        osc.start();
        osc.stop(c.currentTime + duration);
      } catch (error) {}
    },

    hover() {
      this.tone(540, 0.05, 'sine', 0.018);
    },

    click() {
      this.tone(320, 0.07, 'square', 0.035);
    },

    typeChirp() {
      const notes = [440, 493.88, 554.37, 659.25, 739.99];

      this.tone(
        notes[Math.floor(Math.random() * notes.length)],
        0.045,
        'sine',
        0.012
      );
    },

    quizComplete() {
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
        setTimeout(() => {
          this.tone(freq, 0.28, 'triangle', 0.045);
        }, index * 90);
      });
    }
  };

  // Existing site-wide button sounds.
  document.addEventListener('mouseover', (event) => {
    const btn = event.target.closest(
      'button, .pixel-pill-btn, .tab-btn, .action-btn, .cr-btn, .quiz-option-btn, .tr-btn'
    );

    if (btn && !/NOTEBOOK/i.test(btn.textContent)) {
      SoundFX.hover();
    }
  });

  document.addEventListener('mousedown', (event) => {
    const btn = event.target.closest(
      'button, .pixel-pill-btn, .tab-btn, .action-btn, .cr-btn, .quiz-option-btn, .tr-btn'
    );

    if (btn && !/NOTEBOOK/i.test(btn.textContent)) {
      SoundFX.click();
    }
  });

  // =========================================================
  // BIO-BOT CSS / ANIMATIONS
  // =========================================================

  const botCSS = `
    .bio-guide-hud {
      position: relative;
      margin: 0 auto 0.8rem;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(10,16,42,0.97);
      border: 2px solid var(--cyan-primary, #4deeea);
      border-radius: 24px;
      padding: 10px 18px;
      box-shadow: 0 0 22px rgba(77,238,234,0.4);
      cursor: pointer;
      max-width: 560px;
      width: min(100%, 560px);
      color: white;
      text-align: left;
      font: inherit;
      transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
      animation: bioHudEnter .65s cubic-bezier(.2,.8,.2,1) both;
    }

    .bio-guide-hud:hover,
    .bio-guide-hud:focus-visible {
      box-shadow: 0 0 32px rgba(77,238,234,.75);
      transform: translateY(-3px) scale(1.012);
      outline: none;
    }

    .bio-guide-hud::after {
      content: '';
      position: absolute;
      bottom: -9px;
      left: 50px;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 9px solid var(--cyan-primary, #4deeea);
    }

    .bio-guide-avatar {
      width: 46px;
      height: 46px;
      min-width: 46px;
      background: radial-gradient(circle at 35% 25%, #426bb1, #102449 72%);
      border: 2px solid #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 0 13px rgba(77,238,234,.5);
      animation: bioBotFloat 2.5s ease-in-out infinite;
    }

    .bio-guide-hud:hover .bio-guide-avatar {
      animation: bioBotPop .45s ease;
    }

    .bio-guide-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .bio-guide-tag {
      font-family: var(--font-retro, monospace);
      font-size: .52rem;
      color: var(--cyan-primary, #4deeea);
      letter-spacing: 1.2px;
    }

    .bio-guide-speech {
      font-family: var(--font-body, 'Nunito', sans-serif);
      font-size: .95rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.35;
    }

    .bio-guide-hint {
      color: #8edddb;
      font-size: .68rem;
      margin-top: 1px;
    }

    .type-cursor {
      display: inline-block;
      width: 6px;
      height: 13px;
      background: var(--cyan-primary, #4deeea);
      margin-left: 3px;
      vertical-align: middle;
      animation: blinkCursor .7s infinite alternate;
    }

    /* CHAT WINDOW */

    .chat-window {
      position: fixed;
      right: 24px;
      bottom: 24px;
      width: min(370px, calc(100vw - 28px));
      height: min(500px, calc(100dvh - 40px));
      min-height: 330px;
      z-index: 10050;
      display: flex;
      flex-direction: column;
      background: rgba(7,13,35,.985);
      border: 2px solid var(--cyan-primary, #4deeea);
      border-radius: 19px;
      box-shadow: 0 16px 55px rgba(0,0,0,.65),
                  0 0 25px rgba(77,238,234,.2);
      overflow: hidden;

      opacity: 0;
      visibility: hidden;
      pointer-events: none;

      transform: translateY(24px) scale(.96);
      transform-origin: bottom right;

      transition:
        opacity .24s ease,
        transform .28s cubic-bezier(.2,.8,.2,1),
        visibility .28s;
    }

    .chat-window.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    .chat-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 13px 15px;
      background: linear-gradient(
        110deg,
        rgba(16,36,78,.98),
        rgba(13,22,54,.98)
      );
      border-bottom: 1px solid rgba(77,238,234,.3);
    }

    .chat-top-title {
      font-family: var(--font-retro, monospace);
      font-size: .55rem;
      letter-spacing: 1px;
      color: var(--cyan-primary, #4deeea);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chat-status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #4deeea;
      box-shadow: 0 0 9px #4deeea;
      animation: bioStatusPulse 1.5s infinite;
    }

    .chat-top-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chat-close-btn {
      background: transparent;
      border: 1px solid transparent;
      color: #c5dcff;
      font-size: 1.15rem;
      cursor: pointer;
      border-radius: 8px;
      padding: 3px 8px;
    }

    .chat-close-btn:hover {
      color: #fff;
      border-color: var(--cyan-primary, #4deeea);
    }

    .chat-history {
      flex: 1;
      min-height: 0;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: #28617b transparent;
    }

    .chat-message {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      animation: bioMessageIn .25s ease both;
    }

    .chat-icon {
      width: 32px;
      height: 32px;
      min-width: 32px;
      background: #1e3a6e;
      border-radius: 50%;
      border: 1.5px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .bot-text {
      margin: 0;
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      font-size: .92rem;
      line-height: 1.45;
      color: #fff;
      background: rgba(18,30,72,.82);
      border: 1px solid rgba(77,238,234,.3);
      padding: 9px 12px;
      border-radius: 4px 13px 13px 13px;
      max-width: calc(100% - 40px);
      overflow-wrap: anywhere;
    }

    .user-message {
      align-self: flex-end;
      animation: bioMessageIn .2s ease both;
      background: var(--cyan-primary, #4deeea);
      color: #071329;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: .92rem;
      padding: 9px 12px;
      border-radius: 13px 4px 13px 13px;
      max-width: 85%;
      overflow-wrap: anywhere;
    }

    /* INPUT + SEND BUTTON */

    .chat-input-area {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 10px;
      background: rgba(5,10,28,.98);
      border-top: 1px solid rgba(77,238,234,.25);
    }

    .chat-input-pill {
      flex: 1;
      min-width: 0;
      background: #060b20;
      border: 1.5px solid #4a6fa5;
      border-radius: 18px;
      padding: 10px 13px;
      color: #fff;
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      font-size: 16px;
      outline: none;
    }

    .chat-input-pill:focus {
      border-color: var(--cyan-primary, #4deeea);
      box-shadow: 0 0 10px rgba(77,238,234,.3);
    }

    .chat-send-btn {
      flex: 0 0 auto;
      border: 0;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      color: #071329;
      background: var(--cyan-primary, #4deeea);
      font-size: 1.1rem;
      font-weight: 900;
      box-shadow: 0 0 12px rgba(77,238,234,.25);
      transition: transform .15s ease, box-shadow .15s ease;
    }

    .chat-send-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 0 18px rgba(77,238,234,.55);
    }

    .chat-send-btn:disabled {
      opacity: .5;
      cursor: wait;
      transform: none;
    }

    .bio-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 15px 10px; }
    .bio-chip { font-family: 'Nunito', sans-serif; font-weight: 700; font-size: .8rem; color: #4deeea; background: rgba(18,30,72,.82); border: 1px solid rgba(77,238,234,.45); border-radius: 14px; padding: 6px 10px; cursor: pointer; }
    .bio-chip:hover, .bio-chip:focus-visible { background: #4deeea; color: #071329; outline: none; }
    .bio-mute { position: fixed; top: 12px; right: 12px; z-index: 10040; width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--cyan-primary, #4deeea); background: rgba(10,16,42,.95); color: #fff; font-size: 1rem; cursor: pointer; }
    .bio-mute:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }

    /* THINKING ANIMATION */

    .bio-typing-dots {
      display: inline-flex;
      gap: 4px;
      padding: 2px 0;
    }

    .bio-typing-dots span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4deeea;
      animation: bioDot .8s infinite ease-in-out;
    }

    .bio-typing-dots span:nth-child(2) {
      animation-delay: .15s;
    }

    .bio-typing-dots span:nth-child(3) {
      animation-delay: .3s;
    }

    /* SPECIAL PAGE POSITIONING */

    body.crispr-page .bio-guide-hud,
    body:has(.tr-viewport) .bio-guide-hud {
      position: fixed;
      top: 14px;
      left: 18px;
      margin: 0;
      max-width: 360px;
      width: calc(100% - 36px);
      padding: 8px 13px;
      border-radius: 18px;
    }

    body.crispr-page .bio-guide-avatar {
      width: 36px;
      height: 36px;
      min-width: 36px;
      font-size: 1.1rem;
    }

    body.crispr-page .bio-guide-speech {
      font-size: .82rem;
    }

    /* ANIMATION KEYFRAMES */

    @keyframes blinkCursor {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes bioBotFloat {
      0%, 100% {
        transform: translateY(0) rotate(-3deg);
      }
      50% {
        transform: translateY(-5px) rotate(3deg);
      }
    }

    @keyframes bioBotPop {
      0% { transform: scale(1); }
      50% { transform: scale(1.18) rotate(8deg); }
      100% { transform: scale(1); }
    }

    @keyframes bioHudEnter {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bioMessageIn {
      from {
        opacity: 0;
        transform: translateY(7px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bioStatusPulse {
      0%, 100% {
        opacity: 1;
        box-shadow: 0 0 9px #4deeea;
      }
      50% {
        opacity: .45;
        box-shadow: 0 0 2px #4deeea;
      }
    }

    @keyframes bioDot {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: .45;
      }
      30% {
        transform: translateY(-4px);
        opacity: 1;
      }
    }

    /* MOBILE */

    @media (max-width: 520px) {
      .chat-window {
        right: 10px;
        bottom: 10px;
        width: calc(100vw - 20px);
        height: min(570px, calc(100dvh - 20px));
      }

      body.crispr-page .bio-guide-hud,
      body:has(.tr-viewport) .bio-guide-hud {
        top: 8px;
        left: 8px;
        width: calc(100% - 16px);
      }

      .bio-guide-tag {
        font-size: .45rem;
      }

      .bio-guide-speech {
        font-size: .85rem;
      }
    }

    /* RESPECT REDUCED MOTION SETTINGS */

    @media (prefers-reduced-motion: reduce) {
      .bio-guide-hud,
      .bio-guide-avatar,
      .chat-message,
      .user-message,
      .chat-status-dot,
      .type-cursor,
      .bio-typing-dots span {
        animation: none !important;
      }

      .chat-window,
      .bio-guide-hud,
      .chat-send-btn {
        transition: none !important;
      }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'biobot-styles';
  styleEl.textContent = botCSS;
  document.head.appendChild(styleEl);

  // =========================================================
  // BIO-BOT HTML
  // =========================================================

  const guideMarkup = `
    <button
      class="bio-guide-hud"
      id="bio-guide-hud"
      type="button"
      title="Open BIO-BOT 9000"
      aria-label="Open BIO-BOT 9000 chat"
      aria-controls="chat-window"
      aria-expanded="false"
    >
      <span class="bio-guide-avatar" aria-hidden="true">🤖</span>

      <span class="bio-guide-content">
        <span class="bio-guide-tag">
          BIO-BOT 9000 • LAB COMPANION
        </span>

        <span class="bio-guide-speech">
          <span id="type-target"></span>
          <span class="type-cursor" id="type-cursor"></span>
        </span>

        <span class="bio-guide-hint">CLICK TO CHAT ↗</span>
      </span>
    </button>

    <section
      id="chat-window"
      class="chat-window"
      role="dialog"
      aria-label="BIO-BOT 9000 chat"
      aria-hidden="true"
    >
      <div class="chat-top-bar">
        <div class="chat-top-title">
          <span class="chat-status-dot"></span>
          BIO-BOT 9000 • AI
        </div>

        <div class="chat-top-actions">
          <button
            class="chat-close-btn"
            id="chat-close-btn"
            type="button"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="chat-history" id="chat-history" aria-live="polite">
        <div class="chat-message bot-message">
          <span class="chat-icon" aria-hidden="true">🤖</span>

          <p class="bot-text">
            GREETINGS! I AM BIO-BOT 9000. ASK ME ANYTHING ABOUT BIOTECH PATHWAYS!
          </p>
        </div>
      </div>

      <div class="bio-chips" id="bio-chips">
        <button type="button" class="bio-chip">What does my role do?</button>
        <button type="button" class="bio-chip">Why is NJ a biotech hub?</button>
        <button type="button" class="bio-chip">Explain CRISPR simply</button>
      </div>

      <form class="chat-input-area" id="chat-form">
        <input
          type="text"
          id="chat-input"
          class="chat-input-pill"
          placeholder="Ask Bio-Bot anything..."
          autocomplete="off"
          aria-label="Your message"
          maxlength="600"
        />

        <button
          class="chat-send-btn"
          id="chat-send-btn"
          type="submit"
          aria-label="Send message"
          title="Send message"
        >
          ➤
        </button>
      </form>
    </section>
  `;

  // Put the robot near the navigation bar when possible.
  const navCluster = document.querySelector('.nav-cluster');

  if (
    navCluster &&
    !/quiz|crispr|training/.test(pagePath)
  ) {
    navCluster.insertAdjacentHTML('beforebegin', guideMarkup);
  } else {
    document.body.insertAdjacentHTML('beforeend', guideMarkup);
  }

  // =========================================================
  // GET ELEMENTS
  // =========================================================

  const chatWin = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const chatHistory = document.getElementById('chat-history');
  const guideHud = document.getElementById('bio-guide-hud');
  const closeBtn = document.getElementById('chat-close-btn');
  const chatForm = document.getElementById('chat-form');
  const sendBtn = document.getElementById('chat-send-btn');

  const typeTarget = document.getElementById('type-target');
  const typeCursor = document.getElementById('type-cursor');

  let activeTypeTimer = null;
  let isSending = false;
  const chatLog = []; // recent turns so replies keep context

  // =========================================================
  // OPEN / CLOSE CHAT
  // =========================================================

  function openBioBot() {
    chatWin.classList.add('open');
    chatWin.setAttribute('aria-hidden', 'false');
    guideHud.setAttribute('aria-expanded', 'true');

    window.setTimeout(() => {
      chatInput.focus();
    }, 180);

    SoundFX.click();
  }

  function closeBioBot() {
    chatWin.classList.remove('open');
    chatWin.setAttribute('aria-hidden', 'true');
    guideHud.setAttribute('aria-expanded', 'false');

    guideHud.focus({ preventScroll: true });
  }

  function toggleBioBot() {
    if (chatWin.classList.contains('open')) {
      closeBioBot();
    } else {
      openBioBot();
    }
  }

  // Clicking the floating robot opens/closes the chat.
  guideHud.addEventListener('click', toggleBioBot);

  // Clicking the footer BIO-BOT button opens the same chat.
  // This specifically avoids activating the LAB NOTEBOOK button.
  document.querySelectorAll('.action-btn').forEach((button) => {
    if (/BIO-BOT\s*9000/i.test(button.textContent)) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        openBioBot();
      });
    }
  });

  closeBtn.addEventListener('click', closeBioBot);

  // Escape closes the chat.
  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'Escape' &&
      chatWin.classList.contains('open')
    ) {
      closeBioBot();
    }
  });

  // =========================================================
  // ROBOT SPEECH TYPING ANIMATION
  // =========================================================

  window.setBioGuideSpeech = function(text, speed = 20) {
    if (activeTypeTimer) {
      clearInterval(activeTypeTimer);
    }

    typeTarget.textContent = '';
    typeCursor.style.display = 'inline-block';

    let index = 0;

    activeTypeTimer = window.setInterval(() => {
      if (index < text.length) {
        const char = text.charAt(index++);

        typeTarget.textContent += char;

        if (char !== ' ') {
          SoundFX.typeChirp();
        }
      } else {
        clearInterval(activeTypeTimer);
        activeTypeTimer = null;

        setTimeout(() => {
          typeCursor.style.display = 'none';
        }, 900);
      }
    }, speed);
  };

  // =========================================================
  // CHAT MESSAGE HELPERS
  // =========================================================

  function addBotMessage(message) {
    const row = document.createElement('div');
    row.className = 'chat-message bot-message';

    const icon = document.createElement('span');
    icon.className = 'chat-icon';
    icon.textContent = '🤖';
    icon.setAttribute('aria-hidden', 'true');

    const bubble = document.createElement('p');
    bubble.className = 'bot-text';
    bubble.textContent = message;

    row.append(icon, bubble);

    chatHistory.appendChild(row);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // =========================================================
  // OFFLINE FALLBACK
  // =========================================================

  function getOfflineBioBotReply(prompt) {
    const q = prompt.toLowerCase();

    if (/my role|role do/.test(q) && savedRole && ROLE_DETAILS[savedRole]) {
      return `BEEP BOOP! You matched as ${savedRole}. ${ROLE_DETAILS[savedRole]}`;
    }

    if (/\bnj\b|new jersey|hub/.test(q)) {
      return 'BEEP BOOP! New Jersey is a top-three biotech and pharma hub with over 400 life-science organizations, so real opportunities are close to home!';
    }


    if (q.includes('quiz')) {
      return 'BEEP BOOP! Take the Amino Acid Quiz to discover your biotechnology alignment!';
    }

    if (q.includes('salary') || q.includes('pay')) {
      return 'BEEP BOOP! The career salary ranges vary by role, education, and experience. Ask me about a specific biotech career!';
    }

    if (q.includes('crispr')) {
      return 'BEEP BOOP! CRISPR-Cas9 is a gene-editing tool that can target a specific DNA sequence. Explore the simulation to learn the basics!';
    }

    if (
      q.includes('career') ||
      q.includes('job') ||
      q.includes('role')
    ) {
      return 'BEEP BOOP! I can help you explore DNA Analyst, Bioprocess Engineer, Clinical Technician, Quality Systems Specialist, Plant Geneticist, and Discovery Research Scientist pathways!';
    }

    return 'BEEP BOOP! My live connection is unavailable right now. You can still explore the quiz, lab simulation, and career ladder on this site!';
  }

  // =========================================================
  // GEMINI BACKEND CONNECTION
  // =========================================================

  async function callGeminiAPI(userPrompt) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch('/api/chat', {
        signal: ctrl.signal,
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          prompt: userPrompt,
          history: chatLog.slice(-8),
          role: savedRole || '',
          roleInfo: (savedRole && ROLE_DETAILS[savedRole]) || ''
        })
      });

      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error(
          'BIO-BOT API error:',
          res.status,
          data
        );

        return null;
      }

      return (
        typeof data.text === 'string' &&
        data.text.trim()
      ) ? data.text.trim() : null;

    } catch (error) {
      console.error('BIO-BOT connection error:', error);
      return null;
    }
  }

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  async function sendBioBotMessage() {
    const text = chatInput.value.trim();

    if (!text || isSending) return;

    isSending = true;
    sendBtn.disabled = true;
    const chips = document.getElementById('bio-chips');
    if (chips) chips.remove();

    // Display the user's message.
    const userDiv = document.createElement('div');
    userDiv.className = 'user-message';
    userDiv.textContent = text;

    chatHistory.appendChild(userDiv);

    chatInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Animated thinking indicator.
    const thinkingRow = document.createElement('div');

    thinkingRow.className = 'chat-message bot-message';
    thinkingRow.id = 'thinking-indicator';

    thinkingRow.innerHTML = `
      <span class="chat-icon" aria-hidden="true">🤖</span>

      <p class="bot-text" style="color:#4deeea;font-style:italic;">
        BIO-BOT is analyzing

        <span class="bio-typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </p>
    `;

    chatHistory.appendChild(thinkingRow);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      const reply = await callGeminiAPI(text);
      if (reply) chatLog.push({ role: 'user', text }, { role: 'model', text: reply });

      thinkingRow.remove();

      addBotMessage(
        reply || getOfflineBioBotReply(text)
      );

    } catch (error) {
      thinkingRow.remove();

      console.error('BIO-BOT message error:', error);

      addBotMessage(
        getOfflineBioBotReply(text)
      );

    } finally {
      isSending = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  // Quick-question chips (smooth for live demos)
  document.getElementById('bio-chips').addEventListener('click', (event) => {
    const chip = event.target.closest('.bio-chip');
    if (!chip) return;
    chatInput.value = chip.textContent.trim();
    sendBioBotMessage();
  });

  // Sound on/off toggle, remembered across pages
  const muteBtn = document.createElement('button');
  muteBtn.type = 'button';
  muteBtn.className = 'bio-mute';
  const isMuted = () => { try { return localStorage.getItem('biotech_muted') === '1'; } catch (e) { return false; } };
  const paintMute = () => {
    const label = isMuted() ? 'Turn sound on' : 'Turn sound off';
    muteBtn.textContent = isMuted() ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', label);
    muteBtn.title = label;
  };
  muteBtn.addEventListener('click', () => {
    try { localStorage.setItem('biotech_muted', isMuted() ? '0' : '1'); } catch (e) {}
    paintMute();
  });
  paintMute();
  document.body.appendChild(muteBtn);

  // Enter and the send button both submit the message.
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendBioBotMessage();
  });

  // =========================================================
  // PAGE-SPECIFIC GREETINGS
  // =========================================================

  if (pagePath.includes('quiz')) {

    setTimeout(() => {
      const heading = document.getElementById('stage-heading');

      if (savedRole && heading) {
        heading.textContent = 'MATCH RESULT';
      }

      window.setBioGuideSpeech(
        savedRole
          ? `Welcome back! You are matched as: ${savedRole}. Ready for your simulation?`
          : 'Welcome to the Amino Acid Quiz! Answer honestly to discover your role.'
      );

    }, 250);

  } else if (pagePath.includes('crispr')) {

    setTimeout(() => {
      window.setBioGuideSpeech(
        'Target sequence A-U-G-A-G-A in order! Explore the cell repair simulation!'
      );
    }, 250);

  } else if (pagePath.includes('training')) {

    setTimeout(() => {
      window.setBioGuideSpeech(
        'Welcome to Industry Training! Practice your soft skills and earn experience.'
      );
    }, 250);

  } else {

    setTimeout(() => {
      window.setBioGuideSpeech(
        savedRole
          ? `Welcome back! Your matched role is: ${savedRole}. Step 2 is unlocked!`
          : "Hello! I'm BIO-BOT 9000! Click me to chat or take the Amino Acid Quiz to discover your role."
      );
    }, 350);

  }
}

// =========================================================
// INITIALIZE BIO-BOT
// =========================================================

function startBioBot() {
  try {
    initBioBot();
  } catch (error) {
    console.error('BIO-BOT failed to initialize:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    startBioBot,
    { once: true }
  );
} else {
  startBioBot();
}