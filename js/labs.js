/* Зертхана-миссиялар. Әр миссияның қорытындысы оқулықтан алынған (бет нөмірі көрсетілген). */
(function () {
  const { esc, shuffle, img, pg, Store } = W;
  const A = ART, C = ART.C;

  /* ---------- дыбыс және конфетти ---------- */
  let actx = null;
  const soundOn = () => Store.pref('sound') !== '0';
  function tone(freqs, dur, type) {
    if (!soundOn()) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(); const t = actx.currentTime + i * dur;
        o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + .02);
      });
    } catch (e) { }
  }
  function confetti() {
    const cv = document.getElementById('confetti'); if (!cv) return;
    const ctx = cv.getContext('2d'); cv.width = innerWidth; cv.height = innerHeight;
    const cols = ['#c8673a', '#f2b53a', '#4f9a58', '#ef8f86', '#4d8fd1', '#8cc56c'];
    const P = Array.from({ length: 140 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .5, vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4, r: 4 + Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6 }));
    let f = 0;
    (function step() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      P.forEach(p => { p.x += p.vx; p.y += p.vy; p.a += .1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
      if (++f < 170) requestAnimationFrame(step); else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }
  const FX = { ok: () => tone([660, 880], .12), bad: () => tone([220, 180], .16, 'square'), win: () => { tone([523, 659, 784, 1046], .12); confetti(); }, confetti };
  window.FX = FX;

  /* ---------- миссия қаңқасы ---------- */
  function Mission(root, cfg) {
    let cur = 0; const done = [];
    root.innerHTML = `<div class="mission"><div class="mhead"><span style="font-size:1.8em">${cfg.icon}</span><div><div style="font-weight:700;opacity:.85;font-size:.85em">ЗЕРТХАНА-МИССИЯ</div><h2>${esc(cfg.title)}</h2></div><div class="stars" data-stars></div></div>
      <div class="msteps" data-steps></div><div class="mbody"><div data-body></div><div class="mnav"><button class="btn sec" data-prev>← Артқа</button><button class="btn green" data-next disabled>Келесі →</button></div></div></div>`;
    const body = root.querySelector('[data-body]'), nextB = root.querySelector('[data-next]'), prevB = root.querySelector('[data-prev]');
    const stars = () => { const n = done.filter(Boolean).length; root.querySelector('[data-stars]').textContent = '★'.repeat(n) + '☆'.repeat(cfg.steps.length - n); };
    function draw() {
      root.querySelector('[data-steps]').innerHTML = cfg.steps.map((s, i) => `<span class="${i === cur ? 'on' : done[i] ? 'done' : ''}"><b>${done[i] && i !== cur ? '✓' : i + 1}</b>${esc(s.name)}</span>`).join('');
      const s = cfg.steps[cur];
      body.innerHTML = `<div class="bubble">${A.mascot(58)}<div class="say">${s.say}</div></div><div data-step></div>`;
      nextB.disabled = !done[cur]; prevB.style.visibility = cur ? 'visible' : 'hidden';
      nextB.textContent = cur === cfg.steps.length - 1 ? 'Аяқтау ★' : 'Келесі →';
      s.render(body.querySelector('[data-step]'), api, cfg.state);
      stars();
    }
    const api = {
      complete() { if (!done[cur]) { done[cur] = true; FX.ok(); } nextB.disabled = false; stars(); root.querySelector('[data-steps] span.on b').textContent = '✓'; },
      say(t) { body.querySelector('.say').innerHTML = t; },
      state: cfg.state
    };
    nextB.onclick = () => {
      if (cur < cfg.steps.length - 1) { cur++; draw(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      FX.win();
      Store.upd(d => { d.labs = d.labs || {}; d.labs[cfg.id] = cfg.steps.length; });
      W.markDone(cfg.lesson, 'lab');
      body.innerHTML = `<div style="text-align:center;padding:20px"><div style="font-size:64px">🏅</div><h2>Миссия орындалды!</h2><p class="badge">★ ${cfg.steps.length} жұлдыз · «${esc(cfg.badge)}»</p>
        <div class="fb ok" style="text-align:left;margin-top:16px"><b>Кітаптағы қорытынды:</b> ${cfg.conclusion}</div>
        <div class="row" style="justify-content:center;margin-top:16px"><button class="btn" data-again>Қайта ойнау</button></div></div>`;
      root.querySelector('.mnav').style.display = 'none';
      body.querySelector('[data-again]').onclick = () => { root.querySelector('.mnav').style.display = ''; cur = 0; done.length = 0; cfg.state = cfg.init ? cfg.init() : {}; api.state = cfg.state; draw(); };
    };
    prevB.onclick = () => { if (cur) { cur--; draw(); } };
    cfg.state = cfg.init ? cfg.init() : {}; api.state = cfg.state;
    draw();
  }

  /* ---------- жалпы көмекшілер ---------- */
  function choice(el, q, opts, onPick, chosen) {
    el.innerHTML = `<div class="q">${q}</div><div class="opts">${opts.map((o, i) => `<button class="opt ${chosen === i ? 'ok' : ''}" data-i="${i}">${o}</button>`).join('')}</div>`;
    el.querySelectorAll('.opt').forEach(b => b.onclick = () => { el.querySelectorAll('.opt').forEach(x => x.classList.remove('ok')); b.classList.add('ok'); onPick(+b.dataset.i); });
  }
  function fillWords(el, text, extra, onDone) {
    const words = []; const html = esc(text).replace(/\{([^}]+)\}/g, (m, w) => { words.push(w); return `<span class="blank" data-a="${w}">&nbsp;</span>`; });
    el.innerHTML = `<div class="chips" data-bank>${shuffle(words.concat(extra || [])).map(w => `<span class="chip">${esc(w)}</span>`).join('')}</div><p class="filltext">${html}</p><button class="btn" data-chk>Тексеру</button><div class="result"></div>`;
    let act = el.querySelector('.blank'); act.classList.add('act');
    const setAct = b => { el.querySelectorAll('.blank').forEach(x => x.classList.remove('act')); act = b; if (b) b.classList.add('act'); };
    el.addEventListener('click', e => {
      const b = e.target.closest('.blank');
      if (b) { if (b.dataset.v) { const c = [...el.querySelectorAll('[data-bank] .chip')].find(c => c.textContent === b.dataset.v && c.style.visibility === 'hidden'); if (c) c.style.visibility = ''; b.dataset.v = ''; b.innerHTML = '&nbsp;'; b.classList.remove('ok', 'bad'); } setAct(b); return; }
      const c = e.target.closest('[data-bank] .chip');
      if (c && act && !act.dataset.v) { act.dataset.v = c.textContent; act.textContent = c.textContent; c.style.visibility = 'hidden'; setAct([...el.querySelectorAll('.blank')].find(x => !x.dataset.v) || null); }
    });
    el.querySelector('[data-chk]').onclick = () => {
      let ok = 0; const bl = el.querySelectorAll('.blank');
      bl.forEach(b => { const g = b.dataset.v === b.dataset.a; b.classList.toggle('ok', g); b.classList.toggle('bad', !g); if (g) ok++; });
      if (ok === bl.length) { el.querySelector('.result').innerHTML = '🎉 Барлығы дұрыс!'; onDone(); } else { FX.bad(); el.querySelector('.result').textContent = `Дұрыс: ${ok}/${bl.length}. Қызылын бас та, қайта таңда.`; }
    };
  }
  function pickPlace(container, itemSel, targetSel, onDrop) {
    // басып таңдау немесе сүйреу
    let sel = null;
    container.addEventListener('click', e => {
      const it = e.target.closest(itemSel);
      if (it && !it.dataset.locked) { if (sel) sel.classList.remove('sel'); sel = it === sel ? null : it; if (sel) sel.classList.add('sel'); return; }
      const t = e.target.closest(targetSel); if (t && sel) { const s = sel; sel.classList.remove('sel'); sel = null; onDrop(s, t); }
    });
    container.addEventListener('dragstart', e => { const it = e.target.closest(itemSel); if (it) { sel = it; e.dataTransfer.setData('text', 'x'); } });
    container.querySelectorAll(targetSel).forEach(t => {
      t.addEventListener('dragover', e => { e.preventDefault(); t.classList.add('over'); });
      t.addEventListener('dragleave', () => t.classList.remove('over'));
      t.addEventListener('drop', e => { e.preventDefault(); t.classList.remove('over'); if (sel) { const s = sel; sel.classList.remove('sel'); sel = null; onDrop(s, t); } });
    });
  }

  const Labs = {};

  /* ================= 2-сабақ: Өсімдікті үйіне жеткіз ================= */
  const zoneArt = {
    dala: `<svg viewBox="0 0 300 190" preserveAspectRatio="xMidYMid slice"><rect width="300" height="190" fill="#d8efe6"/><rect y="120" width="300" height="70" fill="#b9dc7e"/>${A.sun(260, 30, .6)}${A.tulip(30, 185, .9)}${A.tulip(55, 188, .7, C.yellow)}${A.tulip(240, 186, .8)}${A.grass(270, 186, .9)}${A.grass(120, 186, .7)}</svg>`,
    orman: `<svg viewBox="0 0 300 190" preserveAspectRatio="xMidYMid slice"><rect width="300" height="190" fill="#cfe5d6"/><rect y="130" width="300" height="60" fill="#7bb36a"/>${A.pine(30, 170, .9)}${A.tree(90, 175, .8, C.leafD)}${A.pine(250, 172, 1)}${A.pine(285, 176, .7)}${A.bush(200, 186, .7, C.purple)}</svg>`,
    su: `<svg viewBox="0 0 300 190" preserveAspectRatio="xMidYMid slice"><rect width="300" height="190" fill="#e9f4ee"/><path d="M0 110 C80 95 200 125 300 105 V190 H0Z" fill="${C.water}"/>${A.reeds(30, 150, .9)}${A.reeds(270, 140, .8)}${A.lily(150, 160, .9)}${A.lily(220, 175, .7)}${A.ripple(100, 140, 1)}</svg>`,
    shol: `<svg viewBox="0 0 300 190" preserveAspectRatio="xMidYMid slice"><rect width="300" height="190" fill="#f7ead0"/>${A.sun(40, 30, .6)}${A.dune(150, 190, 2)}${A.dune(30, 190, 1)}${A.saxaul(250, 182, .9)}${A.grass(80, 185, .6, '#a7b56a')}</svg>`
  };
  Labs.habitat = function (root, L) {
    const zones = [{ k: 'dala', n: 'Дала' }, { k: 'orman', n: 'Орман' }, { k: 'su', n: 'Су маңы' }, { k: 'shol', n: 'Шөл, шөлейт' }];
    const ok = { 'Жарық сүйгіш': ['dala'], 'Жылу сүйгіш': ['dala'], 'Көлеңке сүйгіш': ['orman'], 'Суыққа төзімді': ['dala', 'orman'], 'Ылғал сүйгіш': ['su'], 'Құрғақшылыққа төзімді': ['shol'] };
    Mission(root, {
      id: 'l2', lesson: 'l2', icon: '🗺️', title: 'Өсімдікті үйіне жеткіз', badge: 'Жас ботаник',
      conclusion: `Өсімдіктер тіршілік ететін табиғи орта — тіршілік ортасы деп аталады. Олар сол жердің тіршілік жағдайына бейімделген. ${pg(12)}`,
      init: () => ({ placed: 0 }),
      steps: [
        { name: 'Болжам', say: 'Сәлем! Мен — Өскінмін 🌱. Алдымен ойланып көр: көлеңкені ұнататын өсімдік қай жерде жақсы өседі?',
          render(el, api, st) { choice(el, 'Көлеңке сүйгіш өсімдік қайда жақсы өседі деп ойлайсың?', ['🌷 Далада', '🌲 Орманда', '🏜️ Шөлде'], i => { st.pred = i; api.complete(); }, st.pred); } },
        { name: 'Саяхат', say: 'Өсімдіктер адасып қалыпты! Әр топты өз үйіне апар: карточканы бас, сосын жерді бас (немесе сүйреп апар).',
          render(el, api, st) {
            const items = shuffle(L.infographic.items);
            el.innerHTML = `<div class="chips" data-pool style="background:var(--land)">${items.map(x => `<div class="pcard" draggable="true" data-n="${esc(x.n)}"><img src="${img(x.img)}" alt="">${esc(x.n)}</div>`).join('')}</div>
              <div class="zones" style="margin-top:12px">${zones.map(z => `<div class="zone" data-z="${z.k}"><div class="zart">${zoneArt[z.k]}</div><h4>${z.n}</h4><div class="drop"></div></div>`).join('')}</div><p class="result" data-msg></p>`;
            pickPlace(el, '.pcard', '.zone', (card, zone) => {
              const n = card.dataset.n, good = ok[n].includes(zone.dataset.z);
              if (good) { card.dataset.locked = 1; card.draggable = false; card.classList.add('ok'); zone.querySelector('.drop').appendChild(card); FX.ok(); el.querySelector('[data-msg]').innerHTML = `✅ ${esc(n)} өсімдіктер — ${esc(zone.querySelector('h4').textContent)}. ${n === 'Суыққа төзімді' ? 'Олар далада да, орманда да өседі!' : ''}`; }
              else { card.classList.remove('bad'); void card.offsetWidth; card.classList.add('bad'); FX.bad(); el.querySelector('[data-msg]').innerHTML = `🤔 Бұл жер оларға келмейді. 12-беттегі кестеге қара ${pg(12)}`; }
              if (el.querySelectorAll('.pcard.ok').length === items.length) { el.querySelector('[data-msg]').innerHTML = '🎉 Барлық өсімдік үйіне жетті!'; api.complete(); }
            });
          } },
        { name: 'Бақылау', say: 'Енді мектеп ауласындағы өсімдіктерді бақыла. Өсімдік қайда өсіп тұр? Мен кесте бойынша оның тобын айтамын.',
          render(el, api, st) {
            st.rows = st.rows || [];
            const map = { sun: ['күн көп түсетін ашық жер', 'Жарық сүйгіш'], shade: ['ағаштың көлеңкесі', 'Көлеңке сүйгіш'], wet: ['су маңы, ылғалды жер', 'Ылғал сүйгіш'], dry: ['құрғақ, құмды жер', 'Құрғақшылыққа төзімді'] };
            const draw = () => {
              el.innerHTML = `<div class="row"><input class="inp" data-nm placeholder="Өсімдіктің атауы" style="flex:1;min-width:160px"><select data-pl style="width:auto;margin:0">${Object.entries(map).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select><button class="btn sm" data-add>+ Қосу</button></div>
                <table class="obs"><thead><tr><th>Өсімдік</th><th>Қайда өседі?</th><th>Экологиялық тобы (кесте бойынша)</th></tr></thead><tbody>${st.rows.map(r => `<tr><td>${esc(r[0])}</td><td>${map[r[1]][0]}</td><td><b>${map[r[1]][1]}</b></td></tr>`).join('') || '<tr><td colspan="3" class="mut">Әзірге бос. Кемінде 2 өсімдік қос.</td></tr>'}</tbody></table>
                <p class="mut" style="font-size:.85em">Кесте: ${pg(12)} Өсімдіктің атауын білмесең, «1-өсімдік» деп жаз.</p>`;
              el.querySelector('[data-add]').onclick = () => { const n = el.querySelector('[data-nm]').value.trim() || (st.rows.length + 1) + '-өсімдік'; st.rows.push([n, el.querySelector('[data-pl]').value]); FX.ok(); draw(); if (st.rows.length >= 2) api.complete(); };
            };
            draw(); if (st.rows.length >= 2) api.complete();
          } },
        { name: 'Қорытынды', say: 'Жарайсың! Енді кітаптағы қорытындыны құрастыр.',
          render(el, api, st) {
            el.innerHTML = `<div data-f></div>${st.pred != null ? `<p class="fb ${st.pred === 1 ? 'ok' : 'bad'}">Сенің болжамың: ${['далада', 'орманда', 'шөлде'][st.pred]}. Кітапта: көлеңке сүйгіш өсімдіктер — орман ${pg(12)} ${st.pred === 1 ? '✅' : ''}</p>` : ''}`;
            fillWords(el.querySelector('[data-f]'), 'Өсімдіктер тіршілік ететін табиғи орта — {тіршілік ортасы} деп аталады. Олар сол жердің тіршілік {жағдайына} бейімделген.', ['ботаника'], () => api.complete());
          } }
      ]
    });
  };

  /* ================= 3-сабақ: Ағаш күнделігі ================= */
  function seasonTree(s) {
    const sky = ['#d9efe9', '#bfe6f2', '#f3e2c4', '#e6eef5'][s], ground = ['#9ccf6e', '#6fb85a', '#d9b45a', '#ffffff'][s];
    let crown = '', extra = '', hot = '';
    const branches = `<path d="M200 260 L198 150 M198 190 L150 140 M198 170 L250 120 M198 150 L180 100 M198 150 L222 96 M150 140 L130 120 M250 120 L275 108" stroke="${C.brown}" stroke-width="12" stroke-linecap="round" fill="none"/>`;
    if (s === 0) {
      crown = `<path d="M110 140 C100 90 150 60 200 66 C250 56 300 90 290 135 C300 170 250 180 200 172 C150 182 100 175 110 140Z" fill="#a9d98a" opacity=".85"/>` + Array.from({ length: 40 }, (_, i) => `<circle cx="${120 + (i * 37) % 170}" cy="${80 + (i * 23) % 90}" r="5" fill="${i % 3 ? '#fff' : '#f7c6d0'}"/>`).join('');
      hot = `<g class="hot" data-h="0"><rect x="186" y="185" width="26" height="70" rx="10" fill="transparent"/><text x="220" y="225" font-size="22">✨</text></g>`;
    } else if (s === 1) {
      crown = `<path d="M100 140 C90 80 150 50 200 58 C255 48 310 85 300 135 C312 175 255 188 200 178 C145 190 92 180 100 140Z" fill="${C.leaf}"/>` + [[140, 120], [180, 95], [240, 110], [265, 145], [160, 160], [215, 150]].map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="${C.red}" ${i === 3 ? 'class="hot" data-h="1"' : ''}/>`).join('') + A.tulip(60, 270, .7) + A.tulip(330, 272, .6, C.yellow) + A.grass(90, 270, .8);
      hot = `<text x="276" y="140" font-size="20" class="hot" data-h="1">✨</text>`;
    } else if (s === 2) {
      crown = `<path d="M115 145 C105 100 150 75 200 80 C250 72 295 100 285 140 C295 170 250 176 200 170 C150 178 108 172 115 145Z" fill="#e58a2e"/><path d="M150 120 C170 100 200 96 230 104" stroke="#f2c14a" stroke-width="10" fill="none" stroke-linecap="round"/>`;
      extra = [[90, 0], [300, 1.2], [160, 2.1], [250, .6]].map((p, i) => `<g class="fall" style="animation-delay:${p[1]}s"><path transform="translate(${p[0]} 150) rotate(30)" d="M0 0 C-8 -10 -6 -20 0 -24 C6 -20 8 -10 0 0Z" fill="${i % 2 ? '#f2b53a' : '#d9534a'}" ${i === 1 ? 'class="hot" data-h="2"' : ''}/></g>`).join('');
      hot = `<text x="315" y="150" font-size="20" class="hot" data-h="2">✨</text>`;
    } else {
      crown = `<path d="M150 140 L140 132 M250 120 L262 112 M180 100 L174 92 M222 96 L230 88" stroke="${C.brown}" stroke-width="6" stroke-linecap="round"/>` + [[138, 130], [264, 110], [172, 90], [232, 86], [276, 106]].map((p, i) => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="5" ry="7" fill="#a0522d" ${i === 3 ? 'class="hot" data-h="3"' : ''}/>`).join('') + `<path d="M150 136 L198 186 M198 168 L250 118" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>` + Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 53) % 400}" cy="${(i * 29) % 240}" r="2.5" fill="#fff"/>`).join('');
      hot = `<text x="240" y="80" font-size="20" class="hot" data-h="3">✨</text>`;
    }
    return `<svg viewBox="0 0 400 300"><rect width="400" height="300" fill="${sky}"/>${s === 0 || s === 1 ? A.sun(350, 45, .6) : s === 3 ? A.cloud(80, 50, 1) : A.cloud(320, 50, .9)}<rect y="255" width="400" height="45" fill="${ground}"/>${branches}${crown}${extra}${hot}</svg>`;
  }
  Labs.seasons = function (root, L) {
    const names = ['Көктем', 'Жаз', 'Күз', 'Қыс'];
    const finds = [
      { t: 'Көктемде Күннің жылынуына байланысты табиғат жанданады. Ағаштардың діңі мен сабақтарына <b>шырын</b> тарала бастайды.', p: 16, img: 'l3-orik' },
      { t: 'Жазда бау-бақшаларда <b>жемістер мен көкөністер пісіп жетіледі</b>.', p: 17, img: 'l3-summer3' },
      { t: 'Күзде жарық пен жылу азаяды. Жапырақтар <b>түсін өзгертіп, жерге түседі</b>.', p: 15, img: 'l3-autumn' },
      { t: 'Қыста өсімдіктер тыныштық күйге көшеді. <b>Бүршіктің ішінде жапырақ пен гүл жасырынған.</b>', p: 15, img: 'l3-bud' }
    ];
    Mission(root, {
      id: 'l3', lesson: 'l3', icon: '🌳', title: 'Ағаш күнделігі', badge: 'Мезгіл зерттеушісі',
      conclusion: `Өсімдіктер Қазақстанда көктем мен жазда жақсы өсіп-жетіледі; күзде өсуі баяулайды; қыста тыныштық күйге көшеді. ${pg(15)}`,
      init: () => ({ found: [] }),
      steps: [
        { name: 'Болжам', say: 'Қыста ағашта бірде-бір жапырақ жоқ. Ал көктемде жапырақ қайдан шығады?',
          render(el, api, st) { choice(el, 'Көктемде жаңа жапырақ қайдан шығады деп ойлайсың?', ['🌰 Бұтақтағы бүршіктен', '🟫 Жердегі тамырдан', '🍂 Түскен ескі жапырақтан'], i => { st.pred = i; api.complete(); }, st.pred); } },
        { name: 'Мезгіл дөңгелегі', say: 'Мезгілді таңда да, әр суреттен жасырын ✨ құпияны тап. Төрт құпияның бәрін тапсаң, келесі кезең ашылады!',
          render(el, api, st) {
            el.innerHTML = `<div class="row" data-btns>${names.map((n, i) => `<button class="tool" data-s="${i}">${['🌸', '☀️', '🍂', '❄️'][i]} ${n}</button>`).join('')}<span class="pill" data-cnt></span></div><div class="grid g2" style="margin-top:10px"><div class="scene" data-sc></div><div data-info class="card" style="margin:0;background:var(--land)"></div></div>`;
            const draw = s => {
              el.querySelectorAll('[data-s]').forEach(b => b.classList.toggle('on', +b.dataset.s === s));
              el.querySelector('[data-sc]').innerHTML = seasonTree(s);
              el.querySelector('[data-info]').innerHTML = `<h3>${names[s]}</h3><ul>${L.infographic.items[s].pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul><p class="mut">Суреттен ✨ белгісін тауып, бас.</p>`;
              el.querySelector('[data-cnt]').textContent = `Табылды: ${st.found.length}/4`;
              el.querySelectorAll('.hot').forEach(h => { h.style.cursor = 'pointer'; h.onclick = () => {
                const k = +h.dataset.h; if (!st.found.includes(k)) { st.found.push(k); FX.ok(); }
                el.querySelector('[data-info]').innerHTML = `<h3>🔍 ${names[k]}: таптың!</h3><p>${finds[k].t} ${pg(finds[k].p)}</p><img src="${img(finds[k].img)}" style="border-radius:14px;max-height:170px" data-zoom alt="">`;
                el.querySelector('[data-cnt]').textContent = `Табылды: ${st.found.length}/4`;
                if (st.found.length === 4) api.complete();
              }; });
            };
            el.querySelectorAll('[data-s]').forEach(b => b.onclick = () => draw(+b.dataset.s));
            draw(0); if (st.found.length === 4) api.complete();
          } },
        { name: 'Диаграмма', say: 'Кітаптың 17-бетіндегі диаграмма! Әр сөйлемді (а, ә, б, в) өз бағанына апар.',
          render(el, api) {
            const bars = [{ h: 1, c: '#ffffff', n: 'в' }, { h: 2, c: '#e0522a', n: 'б' }, { h: 3, c: '#22aa55', n: 'ә' }, { h: 4, c: '#1d6b35', n: 'а' }];
            const st = [['а', 'бау-бақша жайқалған мезгіл'], ['ә', 'ағаштар бүршік атып, гүлдейді'], ['б', 'жапырақтар түсін өзгертіп, жерге түседі'], ['в', 'ағаштарда жапырақ болмайды']];
            el.innerHTML = `<div class="chips" data-pool>${shuffle(st).map(s => `<span class="chip" draggable="true" data-k="${s[0]}">${s[0]}) ${esc(s[1])}</span>`).join('')}</div>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;align-items:end;margin-top:14px;min-height:280px">${bars.map((b, i) => `<div class="bin" data-b="${b.n}" style="display:flex;flex-direction:column;justify-content:flex-end;min-height:0"><div class="chips" style="min-height:40px"></div><div style="height:${b.h * 45}px;background:${b.c};border:2px solid #333;border-radius:8px 8px 0 0"></div><b style="text-align:center">${b.h}</b></div>`).join('')}</div>
              <p class="note teacher-only" style="margin-top:10px">Кітапта бұл тапсырманың жауабы жоқ. Жауап бағандардың түсі мен биіктігіне қарап анықталды.</p><p class="result" data-msg></p>`;
            pickPlace(el, '.chip', '.bin', (chip, bin) => {
              if (chip.dataset.k === bin.dataset.b) { chip.dataset.locked = 1; chip.draggable = false; chip.classList.add('ok'); bin.querySelector('.chips').appendChild(chip); FX.ok(); }
              else { chip.classList.remove('bad'); void chip.offsetWidth; chip.classList.add('bad'); FX.bad(); el.querySelector('[data-msg]').textContent = 'Бағанның түсіне қара: ақ — қар, қызғылт сары — күз, ашық жасыл — гүлдеу, қою жасыл — жаз.'; }
              if (el.querySelectorAll('.chip.ok').length === 4) { el.querySelector('[data-msg]').textContent = '🎉 Диаграмманы дұрыс оқыдың!'; api.complete(); }
            });
          } },
        { name: 'Қорытынды', say: 'Соңғы қадам: кітаптағы сөйлемдерді толықтыр.',
          render(el, api, st) {
            el.innerHTML = `<div data-f></div>${st.pred != null ? `<p class="fb ${st.pred === 0 ? 'ok' : 'bad'}">Сенің болжамың: ${['бүршіктен', 'тамырдан', 'ескі жапырақтан'][st.pred]}. Кітапта: бүршіктің ішінде жапырақ пен гүл жасырынған ${pg(15)} ${st.pred === 0 ? '✅' : ''}</p>` : ''}`;
            fillWords(el.querySelector('[data-f]'), 'Қыста өсімдіктер {тыныштық} күйге көшеді. Көктемде ағаштың діңі мен сабақтарына {шырын} тарала бастайды. Күзде {жарық} пен жылудың азаюынан өсімдіктердің өсуі баяулайды.', ['қар'], () => api.complete());
          } }
      ]
    });
  };

  /* ================= 4-сабақ: Тұқым өнеді ме? ================= */
  const DISH = [
    { n: 'А ыдыс', cond: 'Дымқыл мақта, жылы бөлме', need: { seed: 1, wet: 1 }, grow: true },
    { n: 'Ә ыдыс', cond: 'Құрғақ мақта, жылы бөлме', need: { seed: 1 }, grow: false, miss: 'су' },
    { n: 'Б ыдыс', cond: 'Дымқыл мақта, тоңазытқышта', need: { seed: 1, wet: 1, cold: 1 }, grow: false, miss: 'жылу' },
    { n: 'В ыдыс', cond: 'Дән суға толық батырылған', need: { seed: 1, flood: 1 }, grow: false, miss: 'ауа' }
  ];
  function dishSvg(s, stage) {
    const cot = s.wet ? '#cfe6fb' : '#f4f2ea';
    let seed = '';
    if (s.seed) {
      const k = stage >= 1 ? 1.25 : 1;
      if (stage >= 2) seed += `<path d="M60 70 q-4 14 2 26" stroke="#efe4c4" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      if (stage >= 3) seed += `<path d="M60 58 q2 -18 -2 -30" stroke="#5fb548" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="28" rx="10" ry="5" fill="#7ccf55" transform="rotate(-25 50 28)"/><ellipse cx="68" cy="26" rx="10" ry="5" fill="#7ccf55" transform="rotate(25 68 26)"/>`;
      seed += `<ellipse cx="60" cy="64" rx="${7 * k}" ry="${11 * k}" fill="#e2b862" stroke="#a5772b" stroke-width="1.5"/>`;
      if (stage >= 2) seed += `<path d="M56 58 l4 4 l-3 4 l4 4" stroke="#6b4a1f" stroke-width="1.5" fill="none"/>`;
    }
    return `<svg viewBox="0 0 120 110"><path d="M12 30 L20 100 L100 100 L108 30" fill="#ffffffaa" stroke="#7a9aa8" stroke-width="2.5"/>
      ${s.flood ? '<rect x="16" y="42" width="88" height="56" fill="#7fc3ee" opacity=".55"/>' : ''}<rect x="20" y="74" width="80" height="22" rx="6" fill="${cot}"/>${seed}
      ${s.cold ? '<text x="88" y="24" font-size="20">❄️</text>' : '<text x="88" y="24" font-size="18">🌡️</text>'}${s.wet && !s.flood ? '<text x="14" y="24" font-size="16">💧</text>' : ''}</svg>`;
  }
  Labs.germination = function (root) {
    Mission(root, {
      id: 'l4', lesson: 'l4', icon: '🌾', title: 'Тұқым өне ме? Төрт ыдыс тәжірибесі', badge: 'Тұқым зерттеушісі',
      conclusion: `Тұқым өнеді. Оның өнуі үшін су, ауа және жылу қажет. Алдымен тамырша, одан соң кішкентай сабақшасы көрінеді. ${pg(20)}`,
      init: () => ({ pred: [], dish: DISH.map(() => ({})), day: 0 }),
      steps: [
        { name: 'Болжам', say: 'Бізде төрт ыдыс бар. Әр ыдыстағы дән өне ме? Болжам жаса!',
          render(el, api, st) {
            el.innerHTML = `<div class="dishes">${DISH.map((d, i) => `<div class="dish"><h4>${d.n}</h4><div class="cond">${d.cond}</div>${dishSvg({ seed: 1, wet: d.need.wet, cold: d.need.cold, flood: d.need.flood }, 0)}<div class="predict"><button data-i="${i}" data-v="1" class="${st.pred[i] === 1 ? 'on' : ''}">🌱 Өнеді</button><button data-i="${i}" data-v="0" class="${st.pred[i] === 0 ? 'on' : ''}">✖ Өнбейді</button></div></div>`).join('')}</div>`;
            el.querySelectorAll('.predict button').forEach(b => b.onclick = () => { st.pred[+b.dataset.i] = +b.dataset.v; b.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); if (DISH.every((_, i) => st.pred[i] != null)) api.complete(); });
            if (DISH.every((_, i) => st.pred[i] != null)) api.complete();
          } },
        { name: 'Дайындық', say: 'Енді ыдыстарды дайында! Құралды таңда да, ыдысты бас. Әр ыдыстың жазуына сәйкес жаса.',
          render(el, api, st) {
            const tools = [['seed', '🌾 Дән салу'], ['wet', '💧 Мақтаны дымқылдау'], ['flood', '🌊 Суға батыру'], ['cold', '❄️ Тоңазытқышқа қою'], ['clear', '🧽 Тазалау']];
            let tool = 'seed';
            const draw = () => {
              el.innerHTML = `<div class="toolbar">${tools.map(t => `<button class="tool ${t[0] === tool ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>
                <div class="dishes">${DISH.map((d, i) => `<div class="dish" data-i="${i}"><h4>${d.n}</h4><div class="cond">${d.cond}</div>${dishSvg(st.dish[i], 0)}</div>`).join('')}</div>
                <div class="row" style="margin-top:12px"><button class="btn" data-chk>Тексеру</button><span class="result" data-msg></span></div>`;
              el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tool = b.dataset.t; draw(); });
              el.querySelectorAll('.dish').forEach(dv => dv.onclick = () => { const s = st.dish[+dv.dataset.i]; if (tool === 'clear') st.dish[+dv.dataset.i] = {}; else s[tool] = 1; tone([520], .06); draw(); });
              el.querySelector('[data-chk]').onclick = () => {
                let good = 0;
                el.querySelectorAll('.dish').forEach(dv => { const i = +dv.dataset.i, s = st.dish[i], n = DISH[i].need; const ok = ['seed', 'wet', 'flood', 'cold'].every(k => !!s[k] === !!n[k]); dv.classList.toggle('ok', ok); dv.classList.toggle('bad', !ok); if (ok) good++; });
                if (good === 4) { el.querySelector('[data-msg]').textContent = '🎉 Барлық ыдыс дайын!'; api.complete(); } else { FX.bad(); el.querySelector('[data-msg]').textContent = `Дайын: ${good}/4. Қызыл ыдыстың жазуын қайта оқы (қате болса 🧽 тазала).`; }
              };
            };
            draw();
          } },
        { name: 'Бақылау', say: 'Уақытты алға жылжыт! ▶ басып, 3 күн бойы бақыла. Сосын 3-күнгі нәтижені кестеге жаз.',
          render(el, api, st) {
            const obs = ['өзгермеді', 'бөртті', 'тамырша шықты', 'сабақша шықты'];
            const draw = () => {
              el.querySelector('[data-d]').innerHTML = DISH.map((d, i) => `<div class="dish"><h4>${d.n}</h4><div class="cond">${d.cond}</div>${dishSvg(st.dish[i], d.grow ? st.day : 0)}</div>`).join('');
              el.querySelector('.daybig').textContent = st.day + '-күн'; el.querySelector('input').value = st.day;
            };
            el.innerHTML = `<div class="timeline"><button class="btn sm" data-play>▶ Ойнату</button><input type="range" min="0" max="3" value="${st.day}"><span class="daybig"></span></div><div class="dishes" data-d></div>
              <h3 style="margin-top:14px">3-күнгі бақылау кестесі</h3><table class="obs"><thead><tr><th>Ыдыс</th><th>Не байқадың?</th></tr></thead><tbody>${DISH.map((d, i) => `<tr><td>${d.n}: ${d.cond}</td><td><select data-o="${i}"><option value="">— таңда —</option>${obs.map(o => `<option>${o}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table>
              <button class="btn" data-chk>Тексеру</button><div class="result" data-msg></div>`;
            el.querySelector('input').oninput = e => { st.day = +e.target.value; draw(); };
            el.querySelector('[data-play]').onclick = () => { st.day = 0; draw(); const t = setInterval(() => { if (!document.body.contains(el)) return clearInterval(t); st.day++; draw(); tone([400 + st.day * 120], .08); if (st.day >= 3) clearInterval(t); }, 900); };
            el.querySelector('[data-chk]').onclick = () => {
              if (st.day < 3) { el.querySelector('[data-msg]').textContent = 'Алдымен 3-күнге дейін бақыла!'; return; }
              let ok = 0; el.querySelectorAll('[data-o]').forEach(s => { const i = +s.dataset.o, want = DISH[i].grow ? 'сабақша шықты' : 'өзгермеді'; const g = s.value === want; s.style.borderColor = g ? '#4f9a58' : '#d9534a'; if (g) ok++; });
              if (ok === 4) { el.querySelector('[data-msg]').innerHTML = '🎉 Дұрыс! Тек А ыдыстағы тұқым өнді.<br>' + DISH.map((d, i) => `${d.n}: болжамың ${st.pred[i] === (d.grow ? 1 : 0) ? '✅ дұрыс' : '❌ басқаша шықты'}${d.miss ? ` (жетіспеді: ${d.miss})` : ''}`).join('<br>'); api.complete(); }
              else { FX.bad(); el.querySelector('[data-msg]').textContent = `Дұрыс: ${ok}/4. Ыдыстарға мұқият қара.`; }
            };
            draw();
          } },
        { name: 'Қорытынды', say: 'Қай ыдыста не жетіспеді? Енді кітаптағы қорытындыны құрастыр!',
          render(el, api) { fillWords(el, 'Тұқымның өнуі үшін {су}, {ауа} және {жылу} қажет. Тұқымнан алдымен {тамырша}, одан соң кішкентай сабақшасы көрінеді.', ['гүл', 'қар'], () => api.complete()); } }
      ]
    });
  };

  /* ================= 5-сабақ: Шөлде кім аман қалады? ================= */
  function buildPlant(p, mood) {
    const stem = p.stem === 'thick' ? `<rect x="88" y="70" width="24" height="90" rx="12" fill="${C.leaf}"/><path d="M95 90 v8 M105 110 v8 M95 130 v8" stroke="${C.leafD}" stroke-width="2"/>` : `<path d="M100 160 L100 70" stroke="${C.leafD}" stroke-width="6" stroke-linecap="round"/>`;
    const lv = { spine: [0, 1, 2, 3].map(i => `<path d="M100 ${85 + i * 18} l${i % 2 ? 22 : -22} -6" stroke="#6b5a2a" stroke-width="2.5"/>`).join(''),
      small: [0, 1, 2, 3].map(i => `<ellipse cx="${i % 2 ? 112 : 88}" cy="${85 + i * 18}" rx="7" ry="3.5" fill="${C.leafL}" transform="rotate(${i % 2 ? -25 : 25} ${i % 2 ? 112 : 88} ${85 + i * 18})"/>`).join(''),
      broad: [0, 1, 2].map(i => `<path d="M100 ${95 + i * 22} C${i % 2 ? 150 : 50} ${70 + i * 22} ${i % 2 ? 165 : 35} ${100 + i * 22} 100 ${105 + i * 22}Z" fill="${C.leaf}"/>`).join('') }[p.leaf] || '';
    const root = p.root === 'long' ? `<path d="M100 175 L100 260 M100 200 L80 230 M100 215 L122 248 M100 240 L92 262" stroke="#c9a46a" stroke-width="3" fill="none"/>` : p.root === 'weak' ? `<path d="M100 175 L94 190 M100 175 L106 192 M100 175 L100 188" stroke="#c9a46a" stroke-width="2.5" fill="none"/>` : '';
    const wilt = mood === 'bad' ? ' transform="rotate(12 100 160)" opacity=".7"' : '';
    return `<svg viewBox="0 0 200 270"><rect width="200" height="170" fill="#e7f3f1"/><rect y="165" width="200" height="105" fill="#d9b98a"/><g${wilt}>${stem}${lv}${mood === 'good' ? `<circle cx="100" cy="64" r="9" fill="${C.pink}"/><circle cx="100" cy="64" r="4" fill="${C.yellow}"/>` : ''}</g>${root}</svg>`;
  }
  Labs.adapt = function (root) {
    Mission(root, {
      id: 'l5', lesson: 'l5', icon: '🌵', title: 'Шөлде кім аман қалады?', badge: 'Бейімделу шебері',
      conclusion: `Өсімдіктің жапырағы қаншалықты кіші болса, соншалықты су аз буланады. Құрғақшылыққа төзімді өсімдіктердің тамыры ұзын. Өсімдіктер түрлі жағдайға бейімделу арқылы тіршілігін сақтайды. ${pg(23)} ${pg(25)}`,
      init: () => ({ built: {} }),
      steps: [
        { name: 'Болжам', say: 'Екі өсімдіктің бірінің жапырағы кішкентай, екіншісінікі үлкен. Ыстық күні қайсысынан су көп буланады?',
          render(el, api, st) { choice(el, 'Қай жапырақтан су көп буланады деп ойлайсың?', ['🍃 Кішкентай жапырақтан', '🌿 Үлкен жапырақтан', '⚖️ Екеуінен бірдей'], i => { st.pred = i; api.complete(); }, st.pred); } },
        { name: 'Булану жарысы', say: '☀️ батырмасын бас! Әр өсімдіктің су қорына қара: қайсысы тез таусылады?',
          render(el, api, st) {
            el.innerHTML = `<div class="grid g2">${['small', 'broad'].map((k, i) => `<div class="card" style="margin:0;text-align:center"><h3>${i ? 'Үлкен жапырақ' : 'Кішкентай жапырақ'}</h3><div class="scene" style="max-width:220px;margin:auto" data-p="${i}">${buildPlant({ leaf: k, stem: 'thin', root: 'long' })}</div><p style="margin:8px 0 4px">💧 Су қоры</p><div class="meter"><i data-m="${i}" style="width:100%"></i></div></div>`).join('')}</div>
              <div class="row" style="margin-top:12px"><button class="btn o" data-go>☀️ Күн шықсын!</button><span class="result" data-msg></span></div>`;
            el.querySelector('[data-go]').onclick = () => {
              const w = [100, 100]; let t = 0; el.querySelector('[data-go]').disabled = true;
              const it = setInterval(() => {
                if (!document.body.contains(el)) return clearInterval(it);
                t++; w[0] = Math.max(0, w[0] - 1.6); w[1] = Math.max(0, w[1] - 5);
                [0, 1].forEach(i => { el.querySelector(`[data-m="${i}"]`).style.width = w[i] + '%'; const sc = el.querySelector(`[data-p="${i}"] svg`); const n = i ? 4 : 1; sc.querySelectorAll('.drop').forEach(d => d.remove()); for (let k = 0; k < n; k++) sc.insertAdjacentHTML('beforeend', `<text class="drop" x="${60 + Math.random() * 80}" y="${20 + Math.random() * 60}" font-size="13">💧</text>`); });
                if (t >= 20) { clearInterval(it); el.querySelectorAll('.drop').forEach(d => d.remove()); el.querySelector('[data-msg]').innerHTML = `Үлкен жапырақтан су көп буланды! Кітапта: «Жапырақ көлемі неғұрлым үлкен болса, соғұрлым су көп буланады» ${pg(24)}`; api.complete(); }
              }, 250);
            };
          } },
        { name: 'Өсімдік құрастыр', say: 'Енді өзің өсімдік құрастыр! Алдымен шөлге, сосын ылғалды орманға бейімде. Екеуі де аман қалуы керек.',
          render(el, api, st) {
            const parts = { leaf: [['spine', '🌵 Тікен'], ['small', '🍃 Ұсақ жапырақ'], ['broad', '🌿 Жалпақ, жұқа, үлкен жапырақ']], root: [['long', '⬇️ Ұзын тамыр'], ['weak', '〰️ Әлсіз тамыр']], stem: [['thick', '🫙 Жуан сабақ, ішінде су қоры'], ['thin', '| Жіңішке сабақ']] };
            let hab = st.built.dry ? 'wet' : 'dry'; const p = { leaf: 'small', root: 'weak', stem: 'thin' };
            const draw = (mood, msg) => {
              el.innerHTML = `<div class="row"><span class="pill" style="background:${hab === 'dry' ? '#f7ead0' : '#cfe5d6'};font-size:1em">${hab === 'dry' ? '🏜️ Тапсырма: ШӨЛ (жоғары құрғақшылық)' : '🌧️ Тапсырма: ЫЛҒАЛДЫ ОРМАН (жоғары ылғалдылық)'}</span><span class="pill">Шөл ${st.built.dry ? '✅' : '⬜'} · Орман ${st.built.wet ? '✅' : '⬜'}</span></div>
                <div class="grid g2" style="margin-top:10px"><div>${Object.entries(parts).map(([k, ops]) => `<p style="margin:8px 0 4px"><b>${{ leaf: 'Жапырағы', root: 'Тамыры', stem: 'Сабағы' }[k]}</b></p><div class="toolbar" style="margin:0">${ops.map(o => `<button class="tool ${p[k] === o[0] ? 'on' : ''}" data-k="${k}" data-v="${o[0]}">${o[1]}</button>`).join('')}</div>`).join('')}
                <button class="btn green" style="margin-top:14px" data-plant>🌱 Отырғызып, 5 күн күту</button><div class="result" data-msg>${msg || ''}</div></div>
                <div class="scene" style="max-width:260px;margin:auto;background:${hab === 'dry' ? '#f7ead0' : '#cfe5d6'}">${buildPlant(p, mood)}</div></div>`;
              el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { p[b.dataset.k] = b.dataset.v; draw(); });
              el.querySelector('[data-plant]').onclick = () => {
                let ok, why;
                if (hab === 'dry') {
                  const bad = []; if (p.leaf === 'broad') bad.push('үлкен жапырақтан су көп буланады'); if (p.root !== 'long') bad.push('тамыры жердің терең қабатынан су сіңіре алмайды'); if (p.stem !== 'thick') bad.push('су қоры жоқ');
                  ok = !bad.length; why = ok ? `Өсімдігің шөлде аман қалды! Шөл өсімдігінің жапырағы ұсақ не тікенді, тамыры ұзын, су қорын сабағында сақтайды ${pg(24)}` : `Өсімдік қурап қалды: ${bad.join('; ')}. ${pg(24)}`;
                } else {
                  ok = p.leaf === 'broad'; why = ok ? `Тамаша! Ылғалды жерде өсетін өсімдіктердің жапырағы жалпақ және жұқа ${pg(24)}` : `Ылғалды жерде өсетін өсімдіктердің жапырағы жалпақ және жұқа болады. Жапырағын өзгертіп көр ${pg(24)}`;
                }
                if (ok) { st.built[hab] = 1; FX.ok(); } else FX.bad();
                draw(ok ? 'good' : 'bad', (ok ? '✅ ' : '🥀 ') + why);
                if (st.built.dry && st.built.wet) { api.complete(); el.querySelector('[data-msg]').insertAdjacentHTML('beforeend', '<br>🎉 Екі өсімдік те аман! Келесі кезеңге өт.'); }
                else if (ok) { setTimeout(() => { if (document.body.contains(el)) { hab = st.built.dry ? 'wet' : 'dry'; draw(null, 'Енді келесі жерге бейімде!'); } }, 2200); }
              };
            };
            draw(); if (st.built.dry && st.built.wet) api.complete();
          } },
        { name: 'Қорытынды', say: 'Сен нағыз бейімделу шеберісің! Кітаптағы сөйлемдерді толықтыр.',
          render(el, api, st) {
            el.innerHTML = `<div data-f></div>${st.pred != null ? `<p class="fb ${st.pred === 1 ? 'ok' : 'bad'}">Сенің болжамың: ${['кішкентай жапырақтан', 'үлкен жапырақтан', 'бірдей'][st.pred]}. Нәтиже: үлкен жапырақтан ${st.pred === 1 ? '✅' : ''}</p>` : ''}`;
            fillWords(el.querySelector('[data-f]'), 'Өсімдіктің жапырағы қаншалықты кіші болса, соншалықты су {аз} буланады. Құрғақшылыққа төзімді өсімдіктердің тамыры {ұзын} болады. Су қорын жапырағында немесе сабағында сақтайтын өсімдіктерді {суккуленттер} деп атайды.', ['көп', 'қысқа'], () => api.complete());
          } }
      ]
    });
  };

  /* ================= 6-сабақ: Жас бағбан ================= */
  const PLOTS = [
    { n: 'Өңделген жер', soil: '#7a5a3a', rows: 1, good: true, t: 'Өңделген жерде өсімдік жақсы өседі.' },
    { n: 'Минералды заттар жетіспейтін жер', soil: '#c4ab84', crack: 1, fert: true, t: 'Топырақта минералды заттар жетіспегенде, өсімдік қалыпты өсе алмайды.' },
    { n: 'Қоқыспен ластанған жер', soil: '#9a8a70', trash: 1, t: 'Қалдық заттарды жерге тастау топырақтың құнарлылығын төмендетеді.' },
    { n: 'Сортаңданған топырақ', soil: '#cfc8b8', salt: 1, t: 'Сортаңданған жерде өсімдіктің жақсы өсуіне кедергі бар (28-беттегі сурет).' }
  ];
  function plotSvg(p, s) {
    let deco = '';
    if (p.rows) deco = [20, 45, 70, 95].map(x => `<path d="M${x} 70 v35" stroke="#5e4329" stroke-width="3"/>`).join('');
    if (p.crack) deco = '<path d="M20 80 l15 8 l-6 10 M70 76 l10 12 l12 -4" stroke="#9c8462" stroke-width="2" fill="none"/>';
    if (p.trash) deco = '<rect x="15" y="80" width="14" height="9" fill="#e2574c" transform="rotate(-12 22 84)"/><rect x="80" y="84" width="12" height="12" fill="#4d8fd1"/><circle cx="55" cy="96" r="6" fill="#f2b53a"/>';
    if (p.salt) deco = '<ellipse cx="30" cy="88" rx="16" ry="6" fill="#fff"/><ellipse cx="82" cy="96" rx="14" ry="5" fill="#fff"/>';
    let plant = '';
    if (s.planted) {
      const h = s.grown === 2 ? 50 : s.grown === 1 ? 18 : 22;
      plant = s.grown === 1 ? `<path d="M60 70 q8 -6 10 -18" stroke="#9a8a40" stroke-width="3" fill="none"/><ellipse cx="72" cy="52" rx="6" ry="3" fill="#b8a64a"/>` : `<path d="M60 70 L60 ${70 - h}" stroke="${C.leafD}" stroke-width="4"/><ellipse cx="50" cy="${76 - h * .6}" rx="10" ry="5" fill="${C.leaf}" transform="rotate(-20 50 ${76 - h * .6})"/><ellipse cx="70" cy="${78 - h * .5}" rx="10" ry="5" fill="${C.leaf}" transform="rotate(20 70 ${78 - h * .5})"/>${s.grown === 2 ? `<circle cx="60" cy="${66 - h}" r="8" fill="${C.pink}"/><circle cx="60" cy="${66 - h}" r="3.5" fill="${C.yellow}"/>` : ''}`;
    }
    return `<svg viewBox="0 0 120 110"><rect width="120" height="70" fill="#dff0ea"/><rect y="70" width="120" height="40" fill="${p.soil}"/>${deco}${s.fert ? '<text x="88" y="24" font-size="18">🧪</text>' : ''}${plant}</svg>`;
  }
  Labs.soil = function (root) {
    Mission(root, {
      id: 'l6', lesson: 'l6', icon: '🧑‍🌾', title: 'Жас бағбан', badge: 'Табиғат қорғаушысы',
      conclusion: `Топыраққа тыңайтқыш салып, құнарлылығын арттырады. Кесілген ағаштардың орнына жас шыбықтар отырғызады. Табиғатты қоқыстан, өрттен сақтау қажет. ${pg(27)} ${pg(28)}`,
      init: () => ({ plots: PLOTS.map(() => ({})), trees: [] }),
      steps: [
        { name: 'Болжам', say: 'Бағбан болуға дайынсың ба? Алдымен ойлан: өсімдік қай жерде жақсы өседі?',
          render(el, api, st) {
            const ph = [['l6-trash', 'Жердің қоқыспен ластануы'], ['l6-salt', 'Топырақтың сортаңдануы'], ['l6-field', 'Өңделген жер']];
            el.innerHTML = `<div class="q">Қай жерде өсімдік жақсы өседі? ${pg(28)}</div><div class="imgc">${ph.map((x, i) => `<button class="it ${st.pred === i ? 'ok' : ''}" data-i="${i}" style="border:0;text-align:center"><img src="${img(x[0])}" alt=""><b>${x[1]}</b></button>`).join('')}</div>`;
            el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { st.pred = +b.dataset.i; el.querySelectorAll('[data-i]').forEach(x => x.classList.toggle('ok', x === b)); api.complete(); });
          } },
        { name: 'Бақша', say: 'Әр телімге 🌱 көшет отырғыз. Қай жерге 🧪 тыңайтқыш керек? Сосын «Бір ай өтті» батырмасын бас. Кемінде екі телімде гүл ашылсын!',
          render(el, api, st) {
            let tool = 'plant';
            const draw = msg => {
              el.innerHTML = `<div class="toolbar"><button class="tool ${tool === 'plant' ? 'on' : ''}" data-t="plant">🌱 Көшет отырғызу</button><button class="tool ${tool === 'fert' ? 'on' : ''}" data-t="fert">🧪 Тыңайтқыш салу</button><button class="btn sm o" data-month>⏩ Бір ай өтті</button></div>
                <div class="plots">${PLOTS.map((p, i) => `<div class="plot" data-i="${i}"><b>${p.n}</b>${plotSvg(p, st.plots[i])}</div>`).join('')}</div><div class="result" data-msg>${msg || ''}</div>`;
              el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tool = b.dataset.t; draw(); });
              el.querySelectorAll('.plot').forEach(pv => pv.onclick = () => { const s = st.plots[+pv.dataset.i]; s[tool === 'plant' ? 'planted' : 'fert'] = 1; s.grown = 0; tone([500], .06); draw(); });
              el.querySelector('[data-month]').onclick = () => {
                if (!st.plots.some(s => s.planted)) return draw('Алдымен көшет отырғыз!');
                const lines = [];
                PLOTS.forEach((p, i) => { const s = st.plots[i]; if (!s.planted) return; const good = p.good || (p.fert && s.fert); s.grown = good ? 2 : 1;
                  lines.push(`${good ? '🌸' : '🥀'} <b>${p.n}:</b> ${p.fert && s.fert ? 'Тыңайтқыш топырақтың құнарлылығын арттырды — өсімдік жақсы өсті.' : p.t}`); });
                const n = st.plots.filter(s => s.grown === 2).length;
                draw(lines.join('<br>') + ` ${pg(28)}` + (n >= 2 ? '<br>🎉 Екі телімде гүл ашылды!' : '<br>Кеңес: минералды заттар жетіспейтін жерге 🧪 тыңайтқыш салып көр.'));
                if (n >= 2) { api.complete(); } else FX.bad();
              };
            };
            draw();
          } },
        { name: 'Орманды сақта', say: 'Орманда ағаштар кесілген екен. Тәлімбақтан жас көшет алып, әр түбірдің орнына отырғыз!',
          render(el, api, st) {
            const pos = [60, 140, 220, 300, 380, 460];
            let carry = false;
            const draw = () => {
              el.innerHTML = `<div class="row"><button class="tool ${carry ? 'on' : ''}" data-nur>🏡 Тәлімбақтан көшет алу ${carry ? '(қолыңда 🌱)' : ''}</button><span class="pill">Отырғызылды: ${st.trees.length}/6</span></div>
                <div class="scene" style="margin-top:10px"><svg viewBox="0 0 520 220"><rect width="520" height="220" fill="#d6ecd9"/><rect y="160" width="520" height="60" fill="#8fbf6a"/>${A.pine(20, 170, .8)}${A.pine(505, 170, .7)}
                ${pos.map((x, i) => `<g class="spot" data-i="${i}" style="cursor:pointer">${st.trees.includes(i) ? A.tree(x, 180, .75, i % 2 ? C.leaf : C.leafD) : A.stump(x, 182, 1.3)}<rect x="${x - 30}" y="60" width="60" height="130" fill="transparent"/></g>`).join('')}</svg></div>
                <p class="mut">Кітапта: «Ормандар мүлдем жойылып кетпеу үшін кесілген ағаштардың орнына жас шыбықтар отырғызады. Оларды арнайы тәлімбақтарда өсіреді» ${pg(27)}</p>`;
              el.querySelector('[data-nur]').onclick = () => { carry = true; tone([600], .06); draw(); };
              el.querySelectorAll('.spot').forEach(s => s.onclick = () => {
                const i = +s.dataset.i; if (st.trees.includes(i)) return;
                if (!carry) { FX.bad(); return; }
                st.trees.push(i); carry = false; FX.ok(); draw();
                if (st.trees.length === 6) api.complete();
              });
            };
            draw(); if (st.trees.length === 6) api.complete();
          } },
        { name: 'Пайдалы ма?', say: 'Соңғы сынақ! Әр әрекет өсімдікке пайдалы ма, әлде зиянды ма? 👍 немесе 👎 бас.',
          render(el, api) {
            const cards = shuffle([['Кесілген ағаштың орнына жас шыбық отырғызу', 1], ['Топыраққа тыңайтқыш салу', 1], ['Көшетті тәлімбақта өсіру', 1], ['Кәрі ағашты жас көшетпен ауыстыру', 1], ['Ағаштарды бейберекет кесу', 0], ['Қалдық заттарды жерге тастау', 0], ['Зиянды сұйықтықты топыраққа төгу', 0], ['Өрт шығару', 0]]);
            let i = 0, score = 0;
            const draw = () => {
              if (i >= cards.length) { el.innerHTML = `<div class="swipe"><div class="scard">🎉 ${score}/${cards.length} дұрыс!</div><p>Табиғатты қоқыстан, өрттен сақтау қажет ${pg(28)}</p></div>`; if (score >= 6) api.complete(); else el.insertAdjacentHTML('beforeend', '<div class="row" style="justify-content:center"><button class="btn" data-re>Қайта ойнау</button></div>'); const r = el.querySelector('[data-re]'); if (r) r.onclick = () => { i = 0; score = 0; draw(); }; return; }
              el.innerHTML = `<div class="swipe"><p class="mut">${i + 1} / ${cards.length}</p><div class="scard">${esc(cards[i][0])}</div><div class="row"><button class="btn green" data-v="1">👍 Пайдалы</button><button class="btn" data-v="0">👎 Зиянды</button></div><p class="result" data-msg></p></div>`;
              el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const g = +b.dataset.v === cards[i][1]; if (g) { score++; FX.ok(); } else FX.bad(); el.querySelector('[data-msg]').textContent = g ? '✅ Дұрыс!' : '❌ Керісінше!'; el.querySelectorAll('[data-v]').forEach(x => x.disabled = true); setTimeout(() => { i++; if (document.body.contains(el)) draw(); }, 700); });
            };
            draw();
          } }
      ]
    });
  };

  /* ================= Әмбебап миссия (деректен) ================= */
  Labs.generic = function (root, L) {
    const lab = L.lab, m = lab.mission || {};
    const steps = [];
    if (m.predict) steps.push({ name: 'Болжам', say: m.predict.say || 'Сәлем! Мен — Өскінмін 🌱. Алдымен ойланып, болжам жаса!',
      render(el, api, st) { choice(el, esc(m.predict.q), m.predict.o.map(esc), i => { st.pred = i; api.complete(); }, st.pred); } });
    if (lab.steps && lab.steps.length >= 3 && m.order !== false) steps.push({ name: lab.kind === 'book' ? 'Тәжірибе реті' : 'Жұмыс реті', say: 'Жұмыстың қадамдары араласып кетіпті! Оларды дұрыс ретпен орналастыр.',
      render(el, api) { const t = { type: 'order', title: 'Қадамдарды ретімен қой', p: lab.p, items: lab.steps.slice(0, 5) }; el.innerHTML = W.renderTask(t, 0, L.id + 'm'); W.bindTask(el.firstElementChild, t, () => { FX.ok(); api.complete(); }); } });
    const games = (m.games || []).map(g => typeof g === 'number' ? L.interactive[g] : g);
    games.forEach((g, gi) => steps.push({ name: g.name || (gi ? 'Сынақ' : 'Ойын'), say: g.say || 'Енді ойнайық! Тапсырманы орында, бәрі дұрыс болса, келесі кезең ашылады.',
      render(el, api) { el.innerHTML = W.renderTask(g, gi, L.id + 'g'); W.bindTask(el.firstElementChild, g, () => { FX.ok(); api.complete(); }); } }));
    if (m.fill) steps.push({ name: 'Қорытынды', say: 'Жарайсың! Енді кітаптағы қорытындыны құрастыр.',
      render(el, api, st) {
        const pr = m.predict;
        el.innerHTML = `<div data-f></div>${pr && st.pred != null ? `<p class="fb ${st.pred === pr.a ? 'ok' : 'bad'}">Сенің болжамың: ${esc(pr.o[st.pred])}. ${st.pred === pr.a ? '✅ Дұрыс шықты!' : 'Дұрыс жауап: ' + esc(pr.o[pr.a])}. ${esc(pr.e || '')} ${pg(pr.p || lab.p)}</p>` : ''}`;
        fillWords(el.querySelector('[data-f]'), m.fill, m.extra || [], () => api.complete());
      } });
    Mission(root, { id: L.id, lesson: L.id, icon: m.icon || L.icon, title: m.title || lab.title, badge: m.badge || 'Жас зерттеуші', conclusion: esc(lab.conclusion) + ' ' + pg(lab.p), steps });
  };

  W.Labs = Labs;
})();
