// Port Foliopolis — DOM chat overlay.
// Talks to the CF Worker in production; falls back to a local stub in dev
// (so the UX works on localhost before any API key exists). The Worker is
// the real harness (personas, IP sessions, rate limits) per the spec —
// this client just renders the conversation and POSTs {npc, history, message}.
(function () {
  // Chat POSTs to /api/chat — the local Node proxy in dev, the CF Worker in prod (same origin).

  const NPCS = {
    phil: { name: 'Phil',  model: 'Gemini',          accent: '#ffe9a8',
            opener: "What's popping, big hero with the big hero eyes? What's a hero like you doin' heroically in a place like this?" },
    roq:  { name: 'Roq',   model: 'Groq · Llama',     accent: '#ffd9cc',
            opener: "Ho there, hero — Roq's the name, finest business goat in Port Foliopolis. You'll have heard about the dragon? Emma — up the mountain, terrorizing my town, bad for everyone and worse for trade. Slay the beast and there's 25 gold in it for you. Do we have a deal?" },
    emma: { name: 'Emma',  model: 'Gemini 2.5 Flash', accent: '#c9efdc',
            opener: "Lower the blade, little hero — let's not. I am Emma, last of the dragons these waters will ever see, and I've eaten nothing but fish since before Port Foliopolis had a name. Roq sent you? They always do — greedy goats, generation after generation, never once a thank-you for keeping their waters from spilling over with the things. Stay your hand and I'll make it worth your while: a shield, from my own hoard. Stand with me, not against me." },
  };

  const sessions = { phil: [], roq: [], emma: [] };   // per-NPC history, this visit
  const bossLog = [];                                 // Emma/Roq transcripts, fed to Phil
  let scene = null, npc = null;
  let root, titleEl, badgeEl, logEl, inputEl, sendBtn;

  const el = (tag, css, txt) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };

  function build() {
    root = el('div', `position:fixed;inset:0;z-index:50;display:none;align-items:flex-end;justify-content:center;
      background:rgba(20,24,20,0.35);font-family:monospace;`);
    const panel = el('div', `width:min(620px,94vw);height:min(58vh,440px);margin-bottom:3vh;display:flex;flex-direction:column;
      background:#f4f1e8;border:4px solid #202020;border-radius:8px;box-shadow:0 8px 0 rgba(0,0,0,0.28);overflow:hidden;`);

    const bar = el('div', `display:flex;align-items:center;gap:8px;padding:8px 10px;background:#202020;color:#fff;`);
    titleEl = el('div', 'font-weight:bold;font-size:15px;');
    badgeEl = el('div', 'margin-left:auto;font-size:11px;opacity:0.7;');
    const x = el('button', `background:#e0502a;color:#fff;border:none;border-radius:4px;width:26px;height:26px;
      cursor:pointer;font-weight:bold;font-family:monospace;`, '×');
    x.onclick = close;
    bar.append(titleEl, badgeEl, x);

    logEl = el('div', `flex:1;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px;
      font-size:13px;line-height:1.45;color:#202020;`);

    const row = el('div', 'display:flex;gap:8px;padding:8px;border-top:3px solid #202020;background:#e8e4d8;');
    inputEl = el('input', `flex:1;padding:8px;border:2px solid #202020;border-radius:4px;font-family:monospace;font-size:13px;`);
    inputEl.placeholder = 'Say something…  (Esc to leave)';
    inputEl.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') submit();
      else if (e.key === 'Escape') close();
    });
    sendBtn = el('button', `padding:8px 14px;background:#2fae74;color:#fff;border:none;border-radius:4px;
      cursor:pointer;font-weight:bold;font-family:monospace;`, 'Send');
    sendBtn.onclick = submit;
    row.append(inputEl, sendBtn);

    panel.append(bar, logEl, row);
    root.append(panel);
    root.addEventListener('mousedown', (e) => { if (e.target === root) close(); });
    document.body.append(root);
  }

  function bubble(side, text, accent) {
    const wrap = el('div', `align-self:${side === 'you' ? 'flex-end' : 'flex-start'};max-width:82%;`);
    wrap.append(el('div', `font-size:10px;opacity:0.55;margin-bottom:2px;${side === 'you' ? 'text-align:right;' : ''}`,
      side === 'you' ? 'You' : NPCS[npc].name));
    const body = el('div', `padding:7px 10px;border-radius:9px;border:2px solid #202020;
      background:${side === 'you' ? '#cfe8ff' : (accent || '#fff')};`, text);
    wrap.append(body); logEl.append(wrap); logEl.scrollTop = logEl.scrollHeight;
    return body;
  }

  function open(which, sc) {
    if (!root) build();
    npc = which; scene = sc;
    const cfg = NPCS[npc];
    titleEl.textContent = cfg.name;
    badgeEl.textContent = cfg.name + ' runs on ' + cfg.model;
    logEl.innerHTML = '';
    if (sessions[npc].length === 0) sessions[npc].push({ role: 'npc', text: cfg.opener });
    sessions[npc].forEach(m => bubble(m.role === 'you' ? 'you' : 'npc', m.text, cfg.accent));
    root.style.display = 'flex';
    if (scene) { scene.input.keyboard.enabled = false; scene.scene.pause(); }   // world idles while talking
    setTimeout(() => inputEl.focus(), 30);
  }

  function close() {
    if (!root) return;
    root.style.display = 'none';
    if (npc === 'roq' || npc === 'emma') bossLog.push({ who: NPCS[npc].name, lines: sessions[npc].slice() });
    if (scene) { scene.input.keyboard.enabled = true; scene.scene.resume(); }
    npc = null;
  }

  async function submit() {
    const text = inputEl.value.trim();
    if (!text || sendBtn.disabled) return;
    inputEl.value = '';
    sessions[npc].push({ role: 'you', text });
    bubble('you', text);
    sendBtn.disabled = true;
    const pending = bubble('npc', '…', NPCS[npc].accent);
    try {
      const reply = await respond(npc, sessions[npc], text);
      pending.textContent = reply;
      sessions[npc].push({ role: 'npc', text: reply });
    } catch (err) {
      pending.textContent = '(…the line sputters. Try again.)';
    }
    sendBtn.disabled = false;
    logEl.scrollTop = logEl.scrollHeight;
    inputEl.focus();
  }

  async function respond(which, history, text) {
    const r = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npc: which, history, message: text, bossLog: which === 'phil' ? bossLog : undefined }),
    });
    if (!r.ok) throw new Error('chat ' + r.status);
    return (await r.json()).reply;
  }

  window.PortChat = { open, close };
})();
