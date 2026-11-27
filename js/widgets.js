/* Интерактивті бөлшектер: тапсырмалар, тест, зертхана, инфографика, карточка, слайд */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const img = n => 'img/' + n + '.jpg';
  const pg = p => p ? `<a class="pg" href="#/book/${p}" title="Оқулықтың ${p}-беті">${p}-бет</a>` : '';

  /* ---------- Сақтау (тек осы браузерде) ---------- */
  const KEY = 'jrt2-progress-v1';
  const Store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
    set(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { } },
    upd(fn) { const d = this.get(); fn(d); this.set(d); },
    pref(k, v) { try { if (v === undefined) return localStorage.getItem('jrt2-' + k); localStorage.setItem('jrt2-' + k, v); } catch (e) { return null; } }
  };
  function markDone(lessonId, what) {
    Store.upd(d => { d.done = d.done || {}; d.done[lessonId] = d.done[lessonId] || {}; d.done[lessonId][what] = Date.now(); });
  }

  /* ================= ИНТЕРАКТИВТІ ТАПСЫРМАЛАР ================= */
  function renderTask(t, idx, lessonId) {
    const id = 'tk' + lessonId + idx;
    let body = '';
    if (t.type === 'sort') {
      const items = shuffle(t.items.map((x, i) => ({ t: x[0], g: x[1], i })));
      body = `<div class="chips pool" data-pool>${items.map(x => `<span class="chip" draggable="true" data-g="${x.g}" data-i="${x.i}">${esc(x.t)}</span>`).join('')}</div>
      <div class="bins">${t.groups.map((g, gi) => `<div class="bin" data-bin="${gi}"><h4>${esc(g)}</h4><div class="chips"></div></div>`).join('')}</div>
      <p class="mut" style="font-size:.85em">Карточканы сүйреп апар немесе алдымен карточканы, сосын топты бас.</p>`;
    } else if (t.type === 'imgchoice') {
      body = `<div class="imgc">${t.items.map((x, i) => `<div class="it" data-a="${esc(x.a)}"><img src="${img(x.img)}" alt="" data-zoom><select><option value="">— таңда —</option>${shuffle(t.opts).map(o => `<option>${esc(o)}</option>`).join('')}</select></div>`).join('')}</div>`;
    } else if (t.type === 'match') {
      const rights = shuffle(t.pairs.map(p => p[1]));
      body = (t.img ? `<img src="${img(t.img)}" style="max-height:220px;border-radius:12px;margin-bottom:10px" data-zoom alt="">` : '') +
        t.pairs.map((p, i) => `<div class="matchrow" data-a="${esc(p[1])}"><b>${esc(p[0])}</b><select><option value="">— таңда —</option>${rights.map(r => `<option>${esc(r)}</option>`).join('')}</select></div>`).join('') +
        (t.note ? `<div class="note teacher-only" style="margin-top:8px">${esc(t.note)}</div>` : '');
    } else if (t.type === 'order') {
      let it = shuffle(t.items); if (it.join() === t.items.join()) it = it.reverse();
      body = `<ol class="ordl">${it.map(x => `<li draggable="true" data-v="${esc(x)}"><span class="n"></span><span>${esc(x)}</span><span class="mv"><button data-up aria-label="Жоғары">▲</button><button data-dn aria-label="Төмен">▼</button></span></li>`).join('')}</ol>`;
    } else if (t.type === 'fill') {
      const words = []; const html = esc(t.text).replace(/\{([^}]+)\}/g, (m, w) => { words.push(w); return `<span class="blank" data-a="${w}" tabindex="0">&nbsp;</span>`; });
      body = `<div class="chips" data-bank>${shuffle(words).map(w => `<span class="chip">${w}</span>`).join('')}</div><p class="filltext">${html}</p><p class="mut" style="font-size:.85em">Бос орынды бас, сосын сөзді таңда.</p>`;
    }
    return `<section class="task" id="${id}" data-type="${t.type}" data-lesson="${lessonId}" data-idx="${idx}">
      <div class="row" style="justify-content:space-between"><h3>${idx + 1}. ${esc(t.title)}</h3>${pg(t.p)}</div>
      ${t.instr ? `<p>${esc(t.instr)}</p>` : ''}${body}
      <div class="row" style="margin-top:12px"><button class="btn" data-check>Тексеру</button><button class="btn sec" data-reset>Қайта бастау</button></div>
      <div class="result" aria-live="polite"></div></section>`;
  }

  function bindTask(el, t) {
    const res = el.querySelector('.result');
    const type = el.dataset.type;
    if (type === 'sort') {
      let sel = null;
      el.addEventListener('click', e => {
        const c = e.target.closest('.chip');
        if (c) { if (sel) sel.classList.remove('sel'); sel = c === sel ? null : c; if (sel) sel.classList.add('sel'); return; }
        const b = e.target.closest('.bin,[data-pool]');
        if (b && sel) { (b.matches('[data-pool]') ? b : b.querySelector('.chips')).appendChild(sel); sel.classList.remove('sel', 'ok', 'bad'); sel = null; }
      });
      el.addEventListener('dragstart', e => { const c = e.target.closest('.chip'); if (c) { sel = c; e.dataTransfer.setData('text', 'x'); } });
      el.querySelectorAll('.bin,[data-pool]').forEach(b => {
        b.addEventListener('dragover', e => { e.preventDefault(); b.classList.add('over'); });
        b.addEventListener('dragleave', () => b.classList.remove('over'));
        b.addEventListener('drop', e => { e.preventDefault(); b.classList.remove('over'); if (sel) { (b.matches('[data-pool]') ? b : b.querySelector('.chips')).appendChild(sel); sel.classList.remove('sel', 'ok', 'bad'); sel = null; } });
      });
    }
    if (type === 'order') {
      const ol = el.querySelector('.ordl'); const num = () => ol.querySelectorAll('li').forEach((li, i) => li.querySelector('.n').textContent = i + 1); num();
      ol.addEventListener('click', e => {
        const li = e.target.closest('li'); if (!li) return;
        if (e.target.closest('[data-up]') && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling);
        if (e.target.closest('[data-dn]') && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li);
        ol.querySelectorAll('li').forEach(x => x.classList.remove('ok', 'bad')); num();
      });
      let drag = null;
      ol.addEventListener('dragstart', e => { drag = e.target.closest('li'); e.dataTransfer.setData('text', 'x'); });
      ol.addEventListener('dragover', e => { e.preventDefault(); const li = e.target.closest('li'); if (li && drag && li !== drag) { const r = li.getBoundingClientRect(); ol.insertBefore(drag, e.clientY < r.top + r.height / 2 ? li : li.nextSibling); num(); } });
    }
    if (type === 'fill') {
      let act = null; const bank = el.querySelector('[data-bank]');
      const activate = b => { el.querySelectorAll('.blank').forEach(x => x.classList.remove('act')); act = b; if (b) b.classList.add('act'); };
      activate(el.querySelector('.blank'));
      el.addEventListener('click', e => {
        const b = e.target.closest('.blank');
        if (b) { if (b.dataset.v) { [...bank.children].find(c => c.textContent === b.dataset.v && c.style.visibility === 'hidden').style.visibility = ''; b.dataset.v = ''; b.innerHTML = '&nbsp;'; b.classList.remove('ok', 'bad'); } activate(b); return; }
        const c = e.target.closest('[data-bank] .chip');
        if (c && act && !act.dataset.v) {
          act.dataset.v = c.textContent; act.textContent = c.textContent; c.style.visibility = 'hidden';
          activate([...el.querySelectorAll('.blank')].find(x => !x.dataset.v) || null);
        }
      });
    }
    el.querySelector('[data-reset]').addEventListener('click', () => {
      const n = document.createElement('div'); n.innerHTML = renderTask(t, +el.dataset.idx, el.dataset.lesson);
      const ne = n.firstElementChild; el.replaceWith(ne); bindTask(ne, t);
    });
    el.querySelector('[data-check]').addEventListener('click', () => {
      let ok = 0, all = 0;
      if (type === 'sort') {
        el.querySelectorAll('.chip').forEach(c => { all++; const bin = c.closest('.bin'); c.classList.remove('ok', 'bad'); if (!bin) return; const good = bin.dataset.bin === c.dataset.g; c.classList.add(good ? 'ok' : 'bad'); if (good) ok++; });
      } else if (type === 'imgchoice') {
        el.querySelectorAll('.it').forEach(it => { all++; const v = it.querySelector('select').value; it.classList.remove('ok', 'bad'); if (!v) return; const g = v === it.dataset.a; it.classList.add(g ? 'ok' : 'bad'); if (g) ok++; });
      } else if (type === 'match') {
        el.querySelectorAll('.matchrow').forEach(r => { all++; const v = r.querySelector('select').value; r.classList.remove('ok', 'bad'); if (!v) return; const g = v === r.dataset.a; r.classList.add(g ? 'ok' : 'bad'); if (g) ok++; });
      } else if (type === 'order') {
        el.querySelectorAll('.ordl li').forEach((li, i) => { all++; const g = li.dataset.v === t.items[i]; li.classList.toggle('ok', g); li.classList.toggle('bad', !g); if (g) ok++; });
      } else if (type === 'fill') {
        el.querySelectorAll('.blank').forEach(b => { all++; b.classList.remove('ok', 'bad'); if (!b.dataset.v) return; const g = b.dataset.v === b.dataset.a; b.classList.add(g ? 'ok' : 'bad'); if (g) ok++; });
      }
      const full = ok === all;
      res.innerHTML = full ? `🎉 Тамаша! Барлығы дұрыс (${ok}/${all}).` : `Дұрыс: ${ok}/${all}. Қызыл белгіленгенін қайта қарап шық. Көмек: оқулықтың ${pg(t.p)}`;
      res.style.color = full ? '#2c9a4a' : '';
      Store.upd(d => { d.tasks = d.tasks || {}; const k = el.dataset.lesson + ':' + el.dataset.idx; d.tasks[k] = Math.max(d.tasks[k] || 0, Math.round(ok / all * 100)); });
      if (full) { markDone(el.dataset.lesson, 'task' + el.dataset.idx); if (window.FX) FX.win(); } else if (window.FX) FX.bad();
    });
  }

  /* ================= ТЕСТ ================= */
  function runTest(root, questions, opts) {
    // questions: [{q,o,e,p,img,_ref}] ; o[0] дұрыс
    let i = 0, score = 0, log = [];
    const qs = questions.map(q => ({ ...q, order: shuffle(q.o.map((t, k) => ({ t, k }))) }));
    function draw() {
      if (i >= qs.length) return finish();
      const q = qs[i]; let help = 0;
      root.innerHTML = `<div class="stepbar">${qs.map((x, k) => `<i class="${k < i ? (log[k] ? 'ok' : 'bad') : k === i ? 'cur' : ''}"></i>`).join('')}</div>
        <p class="mut">${i + 1}-сұрақ / ${qs.length}${opts.label ? ' · ' + opts.label : ''}</p>
        ${q.img ? `<img class="qimg" src="${img(q.img)}" data-zoom alt="">` : ''}
        <div class="q">${esc(q.q)}</div>
        <div class="opts">${q.order.map((o, k) => `<button class="opt" data-k="${o.k}">${['а', 'ә', 'б', 'в'][k]}) ${esc(o.t)}</button>`).join('')}</div>
        <div class="row" style="margin-top:12px"><button class="btn sec sm" data-help>💡 Көмек</button><span class="helptext mut"></span></div>
        <div class="fbwrap"></div>`;
      root.querySelector('[data-help]').onclick = () => {
        help++;
        const ht = root.querySelector('.helptext');
        if (help === 1) ht.innerHTML = `Жауабы оқулықтың ${pg(q.p)} бар.`;
        else if (help === 2) { const wrong = [...root.querySelectorAll('.opt')].filter(b => b.dataset.k !== '0' && !b.classList.contains('gone')); if (wrong[0]) { wrong[0].classList.add('gone'); wrong[0].disabled = true; } ht.innerHTML = 'Бір қате жауап сызылды.'; }
        else ht.innerHTML = 'Көмек бітті. Ойланып көр!';
      };
      root.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const good = b.dataset.k === '0';
        root.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.dataset.k === '0') x.classList.add('ok'); });
        if (!good) b.classList.add('bad');
        log[i] = good; if (good) score++; if (window.FX) FX[good ? 'ok' : 'bad']();
        if (opts.onAnswer) opts.onAnswer(q, good);
        root.querySelector('.fbwrap').innerHTML = `<div class="fb ${good ? 'ok' : 'bad'}"><b>${good ? '✅ Дұрыс!' : '❌ Қате.'}</b> ${esc(q.e)} ${pg(q.p)}</div>
          <button class="btn" style="margin-top:12px" data-next>${i + 1 < qs.length ? 'Келесі сұрақ →' : 'Нәтижені көру'}</button>`;
        root.querySelector('[data-next]').onclick = () => { i++; draw(); };
        root.querySelector('[data-next]').focus();
      });
    }
    function finish() {
      const pct = Math.round(score / qs.length * 100);
      if (opts.onFinish) opts.onFinish(score, qs.length); if (window.FX && pct >= 75) FX.win();
      root.innerHTML = `<div style="text-align:center"><div class="score">${score} / ${qs.length}</div>
        <p style="font-size:1.2em">${pct >= 90 ? '🌟 Керемет! Сен нағыз жас ғалымсың!' : pct >= 60 ? '👍 Жақсы! Қатені қайталап шық.' : '🌱 Тағы бір рет оқып, қайта тапсырып көр.'}</p>
        <p class="mut">Нәтиже карточкасын суретке түсіріп, мұғалімге жіберуге болады · ${new Date().toLocaleDateString('kk-KZ')}</p>
        <div class="row" style="justify-content:center"><button class="btn" data-again>Қайта тапсыру</button>${opts.back || ''}</div></div>
        <div style="margin-top:18px">${qs.map((q, k) => `<div class="fb ${log[k] ? 'ok' : 'bad'}" style="margin:6px 0">${log[k] ? '✅' : '❌'} ${esc(q.q)} — <b>${esc(q.o[0])}</b> ${pg(q.p)}</div>`).join('')}</div>`;
      root.querySelector('[data-again]').onclick = () => runTest(root, questions, opts);
    }
    draw();
  }

  /* ================= ИНФОГРАФИКА ================= */
  function renderInfo(ig) {
    let h = `<div class="info"><h2>${esc(ig.title)}</h2>`;
    if (ig.type === 'groups') {
      h += `<div class="ig-center">${esc(ig.center)}</div><div class="ig-groups">${ig.items.map(x => `<div class="c"><img src="${img(x.img)}" alt=""><b>${x.ic} ${esc(x.n)}</b><span>📍 ${esc(x.w)}</span></div>`).join('')}</div>`;
    } else if (ig.type === 'cycle') {
      h += `<div class="ig-cycle">${ig.items.map(x => `<div class="s" style="background:${x.c}"><img src="${img(x.img)}" alt=""><div><b style="font-size:1.25em">${esc(x.n)}</b><ul>${x.pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div></div>`).join('')}</div>
        <div class="ig-center" style="margin-top:14px">Көктем → Жаз → Күз → Қыс → Көктем 🔁</div>`;
    } else if (ig.type === 'parts') {
      h += `<div class="ig-parts"><img src="${img(ig.img)}" alt="" style="border-radius:14px"><div>${ig.items.map(x => `<div class="p"><span class="e">${x.ic}</span><div><b>${esc(x.n)}</b><br>${esc(x.t)}</div></div>`).join('')}</div></div>`;
    } else if (ig.type === 'compare') {
      const side = s => `<div class="side" style="background:${s.c}"><img src="${img(s.img)}" alt=""><b style="font-size:1.25em">${s.ic} ${esc(s.n)}</b><ul>${s.pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`;
      h += `<div class="ig-compare">${side(ig.left)}${side(ig.right)}</div><div class="facts">${ig.facts.map(f => `<div><b>${esc(f.n)}</b>${esc(f.t)}</div>`).join('')}</div>`;
    } else if (ig.type === 'cause') {
      const side = s => `<div class="side" style="background:${s.c}"><b style="font-size:1.25em">${esc(s.n)}</b><ul>${s.pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`;
      h += `<div class="ig-compare">${side(ig.bad)}${side(ig.good)}</div><div class="facts">${ig.facts.map(f => `<div><b>${esc(f.n)}</b>${esc(f.t)}</div>`).join('')}</div>`;
    }
    return h + `<p class="mut" style="text-align:center;margin-top:14px">Дереккөз: «Жаратылыстану» 2-сынып оқулығы, ${ig.p}-бет</p></div>`;
  }
  function renderMind(m) {
    return `<div class="info"><h2>Бөлімнің интеллект-картасы</h2><div class="mind-c">🌿 ${esc(m.center)}</div>
      <div class="mind">${m.branches.map(b => `<a class="b" href="#/lesson/${b.l}" style="background:${b.c}"><b>${esc(b.n)}</b><ul>${b.k.map(k => `<li>${esc(k)}</li>`).join('')}</ul></a>`).join('')}</div></div>`;
  }

  /* ================= КАРТОЧКАЛАР ================= */
  function flashcards(root, cards) {
    let i = 0; const order = shuffle(cards);
    function draw() {
      const c = order[i];
      root.innerHTML = `<div class="flash"><div class="fc"><div class="side front">${esc(c.term)}</div><div class="side back"><div>${esc(c.def)}<div style="margin-top:12px">${pg(c.p)}</div></div></div></div>
        <p class="mut" style="text-align:center">Карточканы бас — аударылады · ${i + 1}/${order.length}</p>
        <div class="row" style="justify-content:center"><button class="btn sec" data-p>← Алдыңғы</button><button class="btn" data-n>Келесі →</button></div></div>`;
      root.querySelector('.fc').onclick = e => { if (!e.target.closest('a')) e.currentTarget.classList.toggle('flip'); };
      root.querySelector('[data-p]').onclick = () => { i = (i - 1 + order.length) % order.length; draw(); };
      root.querySelector('[data-n]').onclick = () => { i = (i + 1) % order.length; draw(); };
    }
    draw();
  }

  /* ================= СЛАЙДТАР ================= */
  function buildSlides(L) {
    const S = [];
    S.push({ dark: true, html: `<div><p style="color:#97bc62;font-weight:700;margin:0">${L.num}-САБАҚ</p><h2 style="color:#fff;font-size:2.2em">${esc(L.title)}</h2><p>Оқулық: ${L.pages[0]}–${L.pages[1]}-беттер</p></div><img src="${img((L.explain.find(e => e.img) || L.figures[0]).img)}" alt="">` });
    S.push({ html: `<div><h2>Бүгін не білеміз?</h2><p><b>Сен</b> ${L.goal.map(esc).join(' ')}</p><p>${L.keywords.map(k => `<span class="pill">${esc(k)}</span>`).join('')}</p></div><div><h3>Қайталауға арналған сұрақтар</h3><ol>${L.review.map(q => `<li>${esc(q)}</li>`).join('')}</ol></div>` });
    L.explain.forEach(e => {
      const imgs = e.imgs || (e.img ? [e.img] : []);
      const pic = imgs.length > 1 ? `<div class="imgs">${imgs.map(x => `<img src="${img(x)}" alt="">`).join('')}</div>` : imgs.length ? `<img src="${img(imgs[0])}" alt="">` : '';
      S.push({ full: !imgs.length, html: `<div><h2>${esc(e.h)}</h2><div>${e.t}</div><div class="easy"><b>Қарапайым тілмен:</b> ${esc(e.easy)}</div><p style="font-size:.7em;color:#5f6f61">${e.p}-бет</p></div>${pic}` });
    });
    S.push({ dark: true, full: true, html: `<div><h2>Есіңе сақта!</h2>${L.remember.map(r => `<p style="font-size:1.3em;background:#fff;color:#1e4d2b;border-radius:14px;padding:.6em .9em">${esc(r.t)} <small>(${r.p}-бет)</small></p>`).join('')}</div>` });
    if (L.interesting.length) S.push({ full: true, html: `<div><h2>Бұл қызық!</h2><ul>${L.interesting.map(f => `<li style="margin:.4em 0">${esc(f.t)}</li>`).join('')}</ul><p style="font-size:.7em;color:#5f6f61">${L.interesting[0].p}-бет</p></div>` });
    S.push({ dark: true, html: `<div><h2>Сабақты қорытындылау</h2><ol>${L.summaryQ.map(q => `<li>${esc(q)}</li>`).join('')}</ol></div><img src="${img(L.figures[L.figures.length - 1].img)}" alt="">` });
    return S;
  }
  function slideshow(root, L) {
    const S = buildSlides(L); let i = 0;
    root.innerHTML = `<div class="slideshow"><div class="slide"></div><div class="slidebar"><button data-p>←</button><span class="cnt"></span><span><button data-fs>⛶ Толық экран</button> <button data-n>→</button></span></div></div>`;
    const box = root.querySelector('.slideshow'), sl = root.querySelector('.slide');
    const draw = () => { const s = S[i]; sl.className = 'slide' + (s.dark ? ' dark' : '') + (s.full ? ' full' : ''); sl.innerHTML = s.html; root.querySelector('.cnt').textContent = (i + 1) + ' / ' + S.length; };
    const go = d => { i = Math.max(0, Math.min(S.length - 1, i + d)); draw(); };
    root.querySelector('[data-p]').onclick = () => go(-1);
    root.querySelector('[data-n]').onclick = () => go(1);
    root.querySelector('[data-fs]').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (box.requestFullscreen) box.requestFullscreen(); };
    sl.onclick = () => go(1);
    const key = e => { if (!document.body.contains(box)) { document.removeEventListener('keydown', key); return; } if (e.key === 'ArrowRight' || e.key === 'PageDown') go(1); if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1); };
    document.addEventListener('keydown', key);
    draw();
  }

  const Labs = {};

  window.W = { esc, shuffle, img, pg, Store, markDone, renderTask, bindTask, runTest, renderInfo, renderMind, flashcards, slideshow, buildSlides, Labs };
})();
