/* =========================================================
   biobot.js — BIO-BOT 9000 (redesigned chat + Gemini backend)
   Requires core.js (SFX / XP) loaded first.
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
  if (document.getElementById('chat-window')) return;

  const SFX = window.SFX || new Proxy({}, { get: () => () => {} });
  const pagePath = window.location.pathname.toLowerCase();

  let savedRole = null;
  try { savedRole = localStorage.getItem('biotech_matched_role'); } catch (e) {}

  /* ---------------- CSS ---------------- */
  const css = `
    .bio-guide-hud{position:relative;margin:0 auto .8rem;z-index:50;display:flex;align-items:center;gap:14px;
      background:rgba(10,16,42,.97);border:2px solid var(--cyan-primary,#4deeea);border-radius:24px;padding:10px 18px;
      box-shadow:0 0 22px rgba(77,238,234,.4);cursor:pointer;max-width:560px;width:min(100%,560px);color:#fff;text-align:left;font:inherit;
      transition:transform .22s ease,box-shadow .22s ease;animation:bioHudEnter .65s cubic-bezier(.2,.8,.2,1) both}
    .bio-guide-hud:hover,.bio-guide-hud:focus-visible{box-shadow:0 0 32px rgba(77,238,234,.75);transform:translateY(-3px) scale(1.012);outline:none}
    .bio-guide-hud::after{content:'';position:absolute;bottom:-9px;left:50px;border-left:8px solid transparent;border-right:8px solid transparent;border-top:9px solid var(--cyan-primary,#4deeea)}
    .bio-guide-avatar{width:46px;height:46px;min-width:46px;background:radial-gradient(circle at 35% 25%,#426bb1,#102449 72%);border:2px solid #fff;border-radius:50%;
      display:flex;align-items:center;justify-content:center;font-size:1.4rem;box-shadow:0 0 13px rgba(77,238,234,.5);animation:bioBotFloat 2.5s ease-in-out infinite}
    .bio-guide-content{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}
    .bio-guide-tag{font-family:var(--font-retro,monospace);font-size:.52rem;color:var(--cyan-primary,#4deeea);letter-spacing:1.2px}
    .bio-guide-speech{font-family:var(--font-body,'Nunito',sans-serif);font-size:.95rem;font-weight:700;color:#fff;line-height:1.35}
    .bio-guide-hint{color:#8edddb;font-size:.68rem;margin-top:1px}
    .type-cursor{display:inline-block;width:6px;height:13px;background:var(--cyan-primary,#4deeea);margin-left:3px;vertical-align:middle;animation:blinkCursor .7s infinite alternate}
    body.crispr-page .bio-guide-hud,body:has(.tr-viewport) .bio-guide-hud{position:fixed;top:14px;left:18px;margin:0;max-width:360px;width:calc(100% - 36px);padding:8px 13px;border-radius:18px}
    body.crispr-page .bio-guide-avatar{width:36px;height:36px;min-width:36px;font-size:1.1rem}
    body.crispr-page .bio-guide-speech{font-size:.82rem}

    /* ===== CHAT WINDOW ===== */
    .bb-win{position:fixed;right:var(--bb-right,12px);bottom:var(--bb-bottom,14px);width:min(400px,calc(100vw - 24px));height:var(--bb-h,520px);
      z-index:10050;display:flex;flex-direction:column;overflow:hidden;border-radius:22px;
      background:linear-gradient(180deg,#0e1a44 0%,#070d26 100%);border:1.5px solid rgba(77,238,234,.6);
      box-shadow:0 18px 60px rgba(0,0,0,.7),0 0 32px rgba(77,238,234,.18),inset 0 0 0 1px rgba(255,255,255,.04);
      opacity:0;visibility:hidden;pointer-events:none;transform:translateY(18px) scale(.97);transform-origin:bottom right;
      transition:opacity .22s ease,transform .26s cubic-bezier(.2,.8,.2,1),visibility .26s}
    .bb-win.open{opacity:1;visibility:visible;pointer-events:auto;transform:none}
    .bb-head{display:flex;align-items:center;gap:10px;padding:12px 14px;flex:none;
      background:linear-gradient(110deg,rgba(77,238,234,.18),rgba(255,82,177,.10));border-bottom:1px solid rgba(77,238,234,.28)}
    .bb-head-av{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:1.25rem;flex:none;
      background:radial-gradient(circle at 35% 25%,#4a78c4,#102449 75%);border:2px solid #fff;box-shadow:0 0 14px rgba(77,238,234,.55)}
    .bb-head-txt{flex:1;min-width:0}
    .bb-name{font-family:var(--font-retro,monospace);font-size:.6rem;letter-spacing:1px;color:var(--cyan-primary,#4deeea)}
    .bb-sub{display:flex;align-items:center;gap:6px;margin-top:5px;font-family:'Nunito',sans-serif;font-size:.74rem;font-weight:700;color:#8fb3e8}
    .bb-dot{width:8px;height:8px;border-radius:50%;background:#5dffa0;box-shadow:0 0 8px #5dffa0;animation:bioStatusPulse 1.6s infinite}
    .bb-ib{width:32px;height:32px;border-radius:50%;border:1.5px solid rgba(143,179,232,.5);background:rgba(255,255,255,.04);color:#cfe0ff;font-size:.95rem;cursor:pointer;flex:none;transition:all .15s}
    .bb-ib:hover,.bb-ib:focus-visible{background:var(--cyan-primary,#4deeea);color:#071329;border-color:var(--cyan-primary,#4deeea);outline:none}

    .bb-log{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:14px 14px 6px;display:flex;flex-direction:column;gap:12px;
      scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:#2b5f85 transparent}
    .bb-msg{display:flex;align-items:flex-end;gap:8px;animation:bioMessageIn .25s ease both}
    .bb-msg.user{justify-content:flex-end}
    .bb-av{width:28px;height:28px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:.9rem;background:#1e3a6e;border:1.5px solid #fff}
    .bb-bubble{font-family:'Nunito',sans-serif;font-weight:600;font-size:.92rem;line-height:1.5;padding:9px 13px;max-width:86%;overflow-wrap:anywhere}
    .bb-msg.bot .bb-bubble{color:#eaf2ff;background:rgba(30,50,115,.85);border:1px solid rgba(94,150,219,.5);border-radius:16px 16px 16px 4px}
    .bb-msg.user .bb-bubble{color:#04122b;font-weight:700;background:linear-gradient(135deg,#4deeea,#38b4d0);border-radius:16px 16px 4px 16px;box-shadow:0 0 12px rgba(77,238,234,.25)}
    .bb-bubble strong{font-weight:800;color:#8ff7f3}
    .bb-msg.user .bb-bubble strong{color:inherit}
    .bb-msg.error .bb-bubble{border-color:rgba(255,82,177,.6)}

    .bb-chips{display:flex;gap:6px;padding:4px 14px 10px;overflow-x:auto;flex:none;scrollbar-width:none}
    .bb-chips::-webkit-scrollbar{display:none}
    .bio-chip{flex:none;white-space:nowrap;font-family:'Nunito',sans-serif;font-weight:700;font-size:.8rem;color:#4deeea;background:rgba(18,30,72,.85);
      border:1px solid rgba(77,238,234,.5);border-radius:16px;padding:6px 12px;cursor:pointer;transition:all .15s}
    .bio-chip:hover,.bio-chip:focus-visible{background:#4deeea;color:#071329;outline:none}

    .bb-form{display:flex;align-items:center;gap:8px;margin:0 12px 6px;padding:5px 5px 5px 15px;flex:none;background:#050a1f;border:1.5px solid #3a5d93;border-radius:26px;transition:border-color .15s,box-shadow .15s}
    .bb-form:focus-within{border-color:var(--cyan-primary,#4deeea);box-shadow:0 0 12px rgba(77,238,234,.3)}
    .bb-input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#fff;font-family:'Nunito',sans-serif;font-weight:600;font-size:16px;padding:7px 0}
    .bb-input::placeholder{color:#6f8fc0}
    .bb-send{width:38px;height:38px;border-radius:50%;border:0;flex:none;cursor:pointer;color:#071329;font-size:1.05rem;font-weight:900;
      background:linear-gradient(135deg,#4deeea,#38b4d0);box-shadow:0 0 12px rgba(77,238,234,.3);transition:transform .15s,box-shadow .15s}
    .bb-send:hover{transform:scale(1.08);box-shadow:0 0 18px rgba(77,238,234,.6)}
    .bb-send:disabled{opacity:.5;cursor:wait;transform:none}
    .bb-note{flex:none;text-align:center;font-family:'Nunito',sans-serif;font-size:.64rem;color:#5d7db0;padding:0 12px 9px}

    .bio-typing-dots{display:inline-flex;gap:4px;padding:3px 0}
    .bio-typing-dots span{width:7px;height:7px;border-radius:50%;background:#4deeea;animation:bioDot .8s infinite ease-in-out}
    .bio-typing-dots span:nth-child(2){animation-delay:.15s}
    .bio-typing-dots span:nth-child(3){animation-delay:.3s}

    @keyframes blinkCursor{from{opacity:0}to{opacity:1}}
    @keyframes bioBotFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-5px) rotate(3deg)}}
    @keyframes bioHudEnter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes bioMessageIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
    @keyframes bioStatusPulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes bioDot{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-4px);opacity:1}}

    @media (max-width:520px){
      body.crispr-page .bio-guide-hud,body:has(.tr-viewport) .bio-guide-hud{top:8px;left:8px;width:calc(100% - 16px)}
      .bio-guide-tag{font-size:.45rem}.bio-guide-speech{font-size:.85rem}
    }
    @media (prefers-reduced-motion:reduce){
      .bio-guide-hud,.bio-guide-avatar,.bb-msg,.bb-dot,.type-cursor,.bio-typing-dots span{animation:none!important}
      .bb-win,.bio-guide-hud,.bb-send{transition:none!important}
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.id = 'biobot-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------------- MARKUP ---------------- */
  const GREETING = "Hi! I'm BIO-BOT 9000, your biotech career guide. Ask me about careers, CRISPR, or what your lab simulation is teaching you.";
  const markup = `
    <button class="bio-guide-hud" id="bio-guide-hud" type="button" title="Open BIO-BOT 9000"
      aria-label="Open BIO-BOT 9000 chat" aria-controls="chat-window" aria-expanded="false">
      <span class="bio-guide-avatar" aria-hidden="true">🤖</span>
      <span class="bio-guide-content">
        <span class="bio-guide-tag">BIO-BOT 9000 • LAB COMPANION</span>
        <span class="bio-guide-speech"><span id="type-target"></span><span class="type-cursor" id="type-cursor"></span></span>
        <span class="bio-guide-hint">CLICK TO CHAT ↗</span>
      </span>
    </button>

    <section id="chat-window" class="bb-win" role="dialog" aria-label="BIO-BOT 9000 chat" aria-hidden="true">
      <div class="bb-head">
        <div class="bb-head-av" aria-hidden="true">🤖</div>
        <div class="bb-head-txt">
          <div class="bb-name">BIO-BOT 9000</div>
          <div class="bb-sub"><span class="bb-dot"></span>AI lab companion · online</div>
        </div>
        <button class="bb-ib" id="chat-clear-btn" type="button" aria-label="Start a new chat" title="New chat">↺</button>
        <button class="bb-ib" id="chat-close-btn" type="button" aria-label="Close chat" title="Close">✕</button>
      </div>
      <div class="bb-log" id="chat-history" aria-live="polite"></div>
      <div class="bb-chips" id="bio-chips">
        <button type="button" class="bio-chip">What does my role do?</button>
        <button type="button" class="bio-chip">Why is NJ a biotech hub?</button>
        <button type="button" class="bio-chip">Explain CRISPR simply</button>
      </div>
      <form class="bb-form" id="chat-form" autocomplete="off">
        <input type="text" id="chat-input" class="bb-input" placeholder="Ask Bio-Bot anything..." aria-label="Your message" maxlength="600" />
        <button class="bb-send" id="chat-send-btn" type="submit" aria-label="Send message" title="Send">➤</button>
      </form>
      <div class="bb-note">BIO-BOT can make mistakes. Double-check important details.</div>
    </section>
  `;

  const navCluster = document.querySelector('.nav-cluster');
  if (navCluster && !/quiz|crispr|nucleus|ladder|training/.test(pagePath)) navCluster.insertAdjacentHTML('beforebegin', markup);
  else document.body.insertAdjacentHTML('beforeend', markup);

  const chatWin = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const chatHistory = document.getElementById('chat-history');
  const guideHud = document.getElementById('bio-guide-hud');
  const sendBtn = document.getElementById('chat-send-btn');
  const typeTarget = document.getElementById('type-target');
  const typeCursor = document.getElementById('type-cursor');
  let chipsEl = document.getElementById('bio-chips');
  let activeTypeTimer = null;
  let isSending = false;
  let chatLog = [];

  /* ---------------- DOCK ABOVE THE FOOTER (never covers its buttons) ---------------- */
  function dock() {
    const vh = window.innerHeight, vw = window.innerWidth;
    const footer = document.querySelector('.bottom-bar, .cr-bar');
    let bottom = 14, right = 12;
    if (footer) {
      const r = footer.getBoundingClientRect();
      if (r.top > vh * 0.4 && r.top < vh) {
        bottom = Math.round(vh - r.top + 10);
        right = Math.min(160, Math.max(12, Math.round(vw - r.right)));
      }
    }
    let h = Math.min(560, vh - bottom - 14);
    if (h < 220) { bottom = 14; h = Math.min(560, vh - 28); }
    chatWin.style.setProperty('--bb-bottom', bottom + 'px');
    chatWin.style.setProperty('--bb-right', right + 'px');
    chatWin.style.setProperty('--bb-h', Math.max(200, h) + 'px');
  }
  window.addEventListener('resize', dock);

  /* ---------------- OPEN / CLOSE ---------------- */
  function openBioBot() {
    dock();
    chatWin.classList.add('open');
    chatWin.setAttribute('aria-hidden', 'false');
    guideHud.setAttribute('aria-expanded', 'true');
    SFX.open();
    setTimeout(() => chatInput.focus(), 200);
  }
  function closeBioBot() {
    chatWin.classList.remove('open');
    chatWin.setAttribute('aria-hidden', 'true');
    guideHud.setAttribute('aria-expanded', 'false');
    SFX.close();
    guideHud.focus({ preventScroll: true });
  }
  const toggleBioBot = () => (chatWin.classList.contains('open') ? closeBioBot() : openBioBot());

  guideHud.addEventListener('click', toggleBioBot);
  document.getElementById('chat-close-btn').addEventListener('click', closeBioBot);

  // Footer BIO-BOT button on EVERY page (.action-btn on index/training, .cr-btn on quiz/crispr/nucleus/ladder)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.action-btn, .cr-btn');
    if (btn && !chatWin.contains(btn) && /BIO-BOT/i.test(btn.textContent)) {
      e.preventDefault();
      toggleBioBot();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatWin.classList.contains('open')) closeBioBot();
  });

  /* ---------------- ROBOT SPEECH ---------------- */
  window.setBioGuideSpeech = function (text, speed = 20) {
    if (activeTypeTimer) clearInterval(activeTypeTimer);
    typeTarget.textContent = '';
    typeCursor.style.display = 'inline-block';
    let i = 0;
    activeTypeTimer = setInterval(() => {
      if (i < text.length) {
        const ch = text.charAt(i++);
        typeTarget.textContent += ch;
        if (ch !== ' ') SFX.chirp();
      } else {
        clearInterval(activeTypeTimer);
        activeTypeTimer = null;
        setTimeout(() => { typeCursor.style.display = 'none'; }, 900);
      }
    }, speed);
  };

  /* ---------------- MESSAGES ---------------- */
  // Safe formatter: **bold** is rendered, every other stray markdown symbol is removed.
  function formatBot(text) {
    return String(text)
      .replace(/\r/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^\s*[*\-•]\s+/gm, '• ')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/`+/g, '')
      .replace(/\*+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\n/g, '<br>');
  }

  function addMessage(who, text, extraClass) {
    const row = document.createElement('div');
    row.className = 'bb-msg ' + who + (extraClass ? ' ' + extraClass : '');
    if (who === 'bot') {
      const av = document.createElement('span');
      av.className = 'bb-av';
      av.setAttribute('aria-hidden', 'true');
      av.textContent = '🤖';
      row.appendChild(av);
    }
    const b = document.createElement('div');
    b.className = 'bb-bubble';
    if (who === 'bot') b.innerHTML = formatBot(text); else b.textContent = text;
    row.appendChild(b);
    chatHistory.appendChild(row);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return row;
  }

  function resetChat() {
    chatHistory.innerHTML = '';
    chatLog = [];
    addMessage('bot', GREETING);
    if (!document.getElementById('bio-chips') && chipsEl) chatHistory.parentNode.insertBefore(chipsEl, document.getElementById('chat-form'));
  }
  document.getElementById('chat-clear-btn').addEventListener('click', () => { SFX.click(); resetChat(); chatInput.focus(); });
  addMessage('bot', GREETING);

  /* ---------------- OFFLINE FALLBACK ---------------- */
  function offlineReply(prompt) {
    const q = prompt.toLowerCase();
    if (/my role|role do/.test(q) && savedRole && ROLE_DETAILS[savedRole]) return `You matched as ${savedRole}. ${ROLE_DETAILS[savedRole]}`;
    if (/\bnj\b|new jersey|hub/.test(q)) return 'New Jersey is a top-three biotech and pharma hub with hundreds of life-science organizations, so real opportunities are close to home!';
    if (q.includes('quiz')) return 'Take the Amino Acid Quiz to discover your biotechnology role match!';
    if (q.includes('salary') || q.includes('pay')) return 'Salaries vary by role, education, and experience. Ask me about a specific biotech career!';
    if (q.includes('crispr')) return 'CRISPR-Cas9 is a gene-editing tool that finds a specific DNA sequence and cuts it so it can be repaired or changed. Try the simulation to see the idea in action!';
    if (/career|job|role/.test(q)) return 'I can help you explore DNA Analyst, Bioprocess Engineer, Clinical Technician, Quality Systems Specialist, Plant Geneticist, and Discovery Research Scientist paths!';
    return 'My live connection is unavailable right now, but you can still explore the quiz, lab simulation, and career ladder on this site!';
  }

  /* ---------------- GEMINI BACKEND ---------------- */
  async function callGemini(userPrompt) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      const res = await fetch('/api/chat', {
        signal: ctrl.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          history: chatLog.slice(-8),
          role: savedRole || '',
          roleInfo: (savedRole && ROLE_DETAILS[savedRole]) || ''
        })
      });
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { console.error('BIO-BOT API error:', res.status, data); return null; }
      return typeof data.text === 'string' && data.text.trim() ? data.text.trim() : null;
    } catch (err) {
      console.error('BIO-BOT connection error:', err);
      return null;
    }
  }

  async function sendBioBotMessage() {
    const text = chatInput.value.trim();
    if (!text || isSending) return;
    isSending = true;
    sendBtn.disabled = true;
    const chips = document.getElementById('bio-chips');
    if (chips) chips.remove();

    SFX.send();
    addMessage('user', text);
    chatInput.value = '';

    const thinking = document.createElement('div');
    thinking.className = 'bb-msg bot';
    thinking.innerHTML = '<span class="bb-av" aria-hidden="true">🤖</span><div class="bb-bubble"><span class="bio-typing-dots"><span></span><span></span><span></span></span></div>';
    chatHistory.appendChild(thinking);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      const reply = await callGemini(text);
      if (reply) chatLog.push({ role: 'user', text }, { role: 'model', text: reply });
      thinking.remove();
      addMessage('bot', reply || offlineReply(text));
      SFX.receive();
    } catch (err) {
      thinking.remove();
      addMessage('bot', offlineReply(text));
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  chipsEl.addEventListener('click', (e) => {
    const chip = e.target.closest('.bio-chip');
    if (!chip) return;
    chatInput.value = chip.textContent.trim();
    sendBioBotMessage();
  });
  document.getElementById('chat-form').addEventListener('submit', (e) => { e.preventDefault(); sendBioBotMessage(); });

  /* ---------------- PAGE GREETINGS ---------------- */
  const say = (t, d) => setTimeout(() => window.setBioGuideSpeech(t), d || 250);
  
  if (pagePath.includes('crispr')) {
    say('This is Step 1! Target sequence A-U-G-A-G-A in order! Explore the cell repair simulation!');
  } else if (pagePath.includes('nucleus')) {
    say('Click the nucleus to zoom in and discover your career path!');
  } else if (pagePath.includes('ladder')) {
    say('You zoomed in! Click the center rung to start Step 2: The Amino Acid Quiz!');
  } else if (pagePath.includes('quiz')) {
    setTimeout(() => {
      const heading = document.getElementById('stage-heading');
      if (savedRole && heading) heading.textContent = 'MATCH RESULT';
      window.setBioGuideSpeech(savedRole
        ? `Welcome back! You are matched as: ${savedRole}. Ready for training?`
        : 'Welcome to Step 2! Answer honestly to discover your biotech role.');
    }, 250);
  } else if (pagePath.includes('training')) {
    say('Welcome to Industry Training! Practice your soft skills and earn experience.');
  } else {
    say(savedRole
      ? `Welcome back! Your matched role is: ${savedRole}. Step 3 is next!`
      : "Hello! I'm BIO-BOT 9000! Start with the CRISPR simulation to unlock your path.", 350);
  }
}

function startBioBot() {
  try { initBioBot(); } catch (err) { console.error('BIO-BOT failed to initialize:', err); }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startBioBot, { once: true });
else startBioBot();