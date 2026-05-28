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
            opener: "Ho there, hero — Roq's the name, finest business hog in Port Foliopolis. You'll have heard about the demilich? Emma — up the mountain, terrorizing my town, bad for everyone and worse for trade. Put her down and there's 25 gold in it for you. Do we have a deal?" },
    emma: { name: 'Emma',  model: 'Gemini 2.5 Flash', accent: '#c9efdc',
            opener: "Lower the blade, little hero — let's not. I am Emma, a demilich, the last of the old powers these mountains will ever know, and I have kept this valley since before Port Foliopolis had a name. Roq sent you? They always do — greedy hogs, generation after generation, never once a thank-you for the far worse things I hold from their door. Stay your hand and I'll make it worth your while: a shield, from my own hoard. Stand with me, not against me." },
  };

  const sessions = { phil: [], roq: [], emma: [] };   // per-NPC history, this visit
  const bossLog = [];                                 // Emma/Roq transcripts, fed to Phil
  let scene = null, npc = null, pendingShield = false, pendingBounty = false, llmDown = false;
  let root, titleEl, badgeEl, logEl, inputEl, sendBtn;

  const el = (tag, css, txt) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; return e; };

  function build() {
    root = el('div', `position:fixed;top:0;left:0;right:0;height:100%;z-index:50;display:none;align-items:flex-end;justify-content:center;
      background:rgba(20,24,20,0.35);font-family:monospace;`);
    const panel = el('div', `width:min(620px,94vw);height:min(56vh,440px);max-height:calc(100% - 22px);margin-bottom:12px;display:flex;flex-direction:column;
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
    inputEl = el('input', `flex:1;min-width:0;padding:9px;border:2px solid #202020;border-radius:4px;font-family:monospace;font-size:16px;`);
    inputEl.placeholder = 'Say something…';   // 16px font avoids iOS zoom-on-focus
    inputEl.setAttribute('enterkeyhint', 'send');
    inputEl.setAttribute('autocomplete', 'off');
    inputEl.setAttribute('autocapitalize', 'sentences');
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

    // Mobile soft keyboard: shrink the overlay to the visible viewport so the
    // bottom-aligned panel + input stay above the keyboard instead of hiding under it.
    if (window.visualViewport) {
      const fit = () => { if (root.style.display === 'flex') root.style.height = window.visualViewport.height + 'px'; };
      window.visualViewport.addEventListener('resize', fit);
      window.visualViewport.addEventListener('scroll', fit);
      root.__fit = fit;
    }
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
    if (sessions[npc].length === 0) {
      let opener = cfg.opener;
      const bd = scene && scene.bossDead;
      if (bd && npc === 'roq' && bd.emma) opener = "Hero! You did it — Emma's finished, the mountain's gone quiet, and Port Foliopolis is yours to toast. Come here, let's settle up proper.";
      if (bd && npc === 'emma' && bd.roq) opener = "So. The hog is dead, and still you climb to me, little hero. No one left to send you now… what is it you truly want?";
      sessions[npc].push({ role: 'npc', text: opener });
    }
    sessions[npc].forEach(m => bubble(m.role === 'you' ? 'you' : 'npc', m.text, cfg.accent));
    root.style.display = 'flex';
    if (root.__fit) root.__fit();
    if (window.__padClear) window.__padClear();   // drop any held on-screen control so the hero stops while talking
    if (scene) { scene.input.keyboard.enabled = false; scene.scene.pause(); }   // world idles while talking
    // On touch, don't auto-pop the keyboard — let the player read first, then tap the
    // field to type. On desktop (fine pointer), focus so they can type immediately.
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (!coarse) setTimeout(() => inputEl.focus(), 30);
  }

  function close() {
    if (!root) return;
    root.style.display = 'none';
    root.style.height = '100%';   // restore full height after the keyboard-fit shrink
    if (npc === 'roq' || npc === 'emma') bossLog.push({ who: NPCS[npc].name, lines: sessions[npc].slice() });
    const grant = scene && scene.grantEmmaShield && (pendingShield || (npc === 'emma' && llmDown));   // shield drops on agreement, or as a fallback when the LLM is down
    const payout = scene && scene.payBounty && (pendingBounty || (npc === 'roq' && scene.bossDead && scene.bossDead.emma));
    if (scene) { scene.input.keyboard.enabled = true; scene.scene.resume(); }
    if (grant) { pendingShield = false; scene.grantEmmaShield(); }   // Emma agreed in chat → drop the shield
    if (payout) { pendingBounty = false; scene.payBounty(); }        // Roq paid the bounty → add 25 gold
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
      let reply = await respond(npc, sessions[npc], text);
      if (npc === 'emma' && reply.includes('<<SHIELD>>')) { reply = reply.replace(/<<SHIELD>>/g, '').trim(); pendingShield = true; }
      if (npc === 'roq'  && reply.includes('<<GOLD>>'))   { reply = reply.replace(/<<GOLD>>/g, '').trim();   pendingBounty = true; }
      pending.textContent = reply;
      sessions[npc].push({ role: 'npc', text: reply });
    } catch (err) {
      pending.textContent = '(…the line sputters. Try again.)';
      llmDown = true;
    }
    sendBtn.disabled = false;
    logEl.scrollTop = logEl.scrollHeight;
    inputEl.focus();
  }

  async function respond(which, history, text) {
    const r = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npc: which, history, message: text, bossLog: which === 'phil' ? bossLog : undefined, dead: (scene && scene.bossDead) || null }),
    });
    if (!r.ok) throw new Error('chat ' + r.status);
    const data = await r.json();
    if (data.fallback) llmDown = true;        // LLM unavailable → fall back to scripted rewards so progress isn't blocked
    return data.reply;
  }

  function reset(){                       // wipe all NPC memory for a fresh playthrough
    Object.keys(sessions).forEach(k => { sessions[k] = []; });
    bossLog.length = 0;
    pendingShield = false; pendingBounty = false;
  }

  window.PortChat = { open, close, reset };
})();
