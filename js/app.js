(function () {
  const { esc, shuffle, img, pg, Store } = W;
  const B = window.BOOK, LS = window.LESSONS, EX = window.SECTION_EXTRA, BT = window.BOOKTEXT || [];
  const app = document.getElementById('app');
  const $ = (s, r = document) => r.querySelector(s);
  const lessonOfPage = p => Object.values(LS).find(l => p >= l.pages[0] && p <= l.pages[1]);
  const sectionOf = lid => B.sections.find(s => s.lessons.includes(lid));
  const allLessons = () => B.sections.flatMap(s => s.lessons.map(id => LS[id]));

  /* ---------- режим және баптаулар ---------- */
  let mode = Store.pref('mode') || 'student';
  function setMode(m) {
    mode = m; Store.pref('mode', m);
    document.body.classList.toggle('teacher', m === 'teacher');
    $('#mStudent').classList.toggle('on', m === 'student'); $('#mTeacher').classList.toggle('on', m === 'teacher');
    navBar(); route();
  }
  document.querySelectorAll('.mode button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
  if (Store.pref('dark') === '1') document.body.classList.add('dark');
  if (Store.pref('big') === '1') document.body.classList.add('big');
  $('#settingsBtn').onclick = () => modal(`<h2>Баптаулар</h2>
    <label class="switch"><input type="checkbox" id="sDark" ${document.body.classList.contains('dark') ? 'checked' : ''}> 🌙 Қараңғы режим</label>
    <label class="switch"><input type="checkbox" id="sBig" ${document.body.classList.contains('big') ? 'checked' : ''}> 🔠 Үлкен қаріп</label>
    <p class="mut" style="font-size:.88em">Нәтижелер мен баптаулар тек осы құрылғының браузерінде сақталады. Сервер жоқ, ешкімге жіберілмейді.</p>`, () => {
      $('#sDark').onchange = e => { document.body.classList.toggle('dark', e.target.checked); Store.pref('dark', e.target.checked ? '1' : '0'); };
      $('#sBig').onchange = e => { document.body.classList.toggle('big', e.target.checked); Store.pref('big', e.target.checked ? '1' : '0'); };
    });

  function modal(html, after) { $('#modalBody').innerHTML = html; $('#modal').hidden = false; if (after) after(); }
  $('#modalX').onclick = () => $('#modal').hidden = true;
  $('#modal').onclick = e => { if (e.target.id === 'modal') $('#modal').hidden = true; };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#modal').hidden = true; });
  function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2200); }
  // суретті үлкейту
  document.addEventListener('click', e => {
    const im = e.target.closest('img[data-zoom], .ex img, .fig img');
    if (im && !e.target.closest('.modal')) modal(`<img src="${im.getAttribute('src')}" style="max-height:80vh;margin:auto;border-radius:12px" alt="">${im.dataset.cap ? `<p class="mut" style="text-align:center">${im.dataset.cap}</p>` : ''}`);
  });

  /* ---------- навигация ---------- */
  const MAT_S = [['explain', '📘', 'Түсіндірме'], ['slides', '🎞️', 'Презентация'], ['tasks', '🧩', 'Тапсырмалар'], ['lab', '🔬', 'Зертхана-миссия'], ['test', '✅', 'Тест'], ['info', '📊', 'Инфографика'], ['figures', '🖼️', 'Суреттер'], ['cards', '🃏', 'Карточкалар']];
  const MAT_T = [['kmj', '📄', 'ҚМЖ', 1], ['slides', '🎞️', 'Презентация'], ['levels', '🎯', 'Деңгейлік тапсырмалар', 1], ['tasks', '🧩', 'Интерактив тапсырмалар'], ['lab', '🔬', 'Зертхана'], ['test', '✅', 'Тест'], ['explain', '📘', 'Түсіндірме'], ['info', '📊', 'Инфографика'], ['figures', '🖼️', 'Суреттер'], ['qr', '📱', 'QR-код', 1]];
  const curLesson = () => (LS[Store.pref('cur')] ? Store.pref('cur') : 'l2');
  function navBar() {
    const h = location.hash || '#/'; const cl = curLesson(); const L = LS[cl];
    const link = (href, ic, t, extra) => `<a href="${href}" class="${h === href || (h.startsWith(href + '/') && href !== '#/') || (href.includes('/lesson/') && h === href) ? 'on' : ''} ${extra ? 't' : ''}"><span class="ic">${ic}</span>${t}</a>`;
    const mats = mode === 'teacher' ? MAT_T : MAT_S;
    const tabNow = (h.match(/^#\/lesson\/\w+\/(\w+)/) || [])[1] || (h.startsWith('#/lesson/') ? 'explain' : '');
    $('#sideNav').innerHTML = `<div class="navl">${link('#/', '🏠', 'Басты бет')}${link('#/section/s-plants', '🌿', 'Өсімдіктер бөлімі')}</div>
      <div class="navh">Сабақты таңда</div>
      <div class="lpick">${B.sections[0].lessons.map(id => `<a href="#/lesson/${id}/${tabNow || 'explain'}" class="${id === cl ? 'on' : ''}" style="background:${LS[id].color}" title="${esc(LS[id].title)}">${LS[id].num}</a>`).join('')}</div>
      <div class="lcur">${L.num}-сабақ: ${esc(L.title)}</div>
      <div class="navh">${mode === 'teacher' ? 'Мұғалім материалдары' : 'Сабақ материалдары'}</div>
      <div class="navl">${mats.map(m => `<a href="#/lesson/${cl}/${m[0]}" class="${h.startsWith('#/lesson/') && tabNow === m[0] ? 'on' : ''} ${m[3] ? 't' : ''}"><span class="ic">${m[1]}</span>${m[2]}</a>`).join('')}</div>
      <div class="navh">${mode === 'teacher' ? 'Құралдар' : 'Менің жолым'}</div>
      <div class="navl">${mode === 'teacher' ? link('#/builder', '🧩', 'Тапсырма құрастырғыш') + link('#/tools', '⏱️', 'Сабақ құралдары') : link('#/progress', '⭐', 'Менің нәтижем') + link('#/mistakes', '🔁', 'Қатемен жұмыс')}${link('#/book/11', '📖', 'Оқулық')}${link('#/search', '🔎', 'Іздеу')}</div>`;
  }
  $('#bgart').innerHTML = ART.background();
  $('#brandArt').innerHTML = ART.mascot(46);
  $('#burger').onclick = () => document.body.classList.toggle('navopen');
  $('#scrim').onclick = () => document.body.classList.remove('navopen');
  $('#sideNav').addEventListener('click', e => { if (e.target.closest('a')) document.body.classList.remove('navopen'); });
  const sb = () => $('#soundBtn').textContent = Store.pref('sound') === '0' ? '🔇 Дыбыс' : '🔊 Дыбыс';
  $('#soundBtn').onclick = () => { Store.pref('sound', Store.pref('sound') === '0' ? '1' : '0'); sb(); }; sb();
  $('#foot').innerHTML = `Оқулық: «${B.title}», ${B.grade}. Авторлары: ${B.authors}. ${B.publisher}, ${B.year}. Сайттағы барлық материал осы оқулық негізінде жасалған, әр жерде бет нөмірі көрсетілген. Сайт оқу мақсатында, сервер мен тіркелусіз жұмыс істейді.`;

  $('#searchForm').onsubmit = e => { e.preventDefault(); location.hash = '#/search?q=' + encodeURIComponent($('#searchInput').value.trim()); };

  /* ---------- маршрутизатор ---------- */
  function route() {
    const h = decodeURIComponent(location.hash.slice(1) || '/');
    const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean);
    const q = new URLSearchParams(qs || '');
    navBar(); window.scrollTo(0, 0);
    try {
      if (!parts.length) return home();
      if (parts[0] === 'section') return section(parts[1]);
      if (parts[0] === 'lesson') return lesson(parts[1], parts[2]);
      if (parts[0] === 'book') return book(+parts[1] || 11, q.get('q'));
      if (parts[0] === 'search') return search(q.get('q') || '');
      if (parts[0] === 'progress') return progress();
      if (parts[0] === 'mistakes') return mistakes();
      if (parts[0] === 'builder') return builder();
      if (parts[0] === 'tools') return tools();
      if (parts[0] === 'sectest') return sectionTest(parts[1]);
      home();
    } catch (err) { app.innerHTML = `<div class="card"><h2>Қате шықты</h2><p>${esc(err.message)}</p><a class="btn" href="#/">Басты бетке</a></div>`; console.error(err); }
  }
  window.addEventListener('hashchange', route);

  function lessonProgress(lid) {
    const d = Store.get(); const L = LS[lid]; let n = 0, t = 0;
    ['A', 'B', 'C'].forEach(lv => { t++; if ((d.tests || {})[lid + ':' + lv] >= 60) n++; });
    L.interactive.forEach((x, i) => { t++; if ((d.tasks || {})[lid + ':' + i] === 100) n++; });
    return Math.round(n / t * 100);
  }

  /* ---------- басты бет ---------- */
  function home() {
    const S = B.sections[0];
    app.innerHTML = `<section class="hero"><div class="art">${ART.hero()}</div><div class="in"><h1>Жаратылыс&shy;тану</h1>
      <p>2-сынып. Өсімдіктер әлеміне саяхат: түсіндірме, презентация, ойын-тапсырмалар, зертхана-миссиялар және деңгейлік тесттер. Барлығы оқулық бойынша.</p>
      <div class="row" style="justify-content:center"><a class="btn" href="#/lesson/${curLesson()}/explain" style="font-size:1.1em;padding:14px 30px">▶ Бастау</a><a class="btn sec" href="#/book/11">📖 Оқулық</a></div></div></section>
      <h2>Кім ретінде кіресіз?</h2>
      <div class="modecards"><button class="modecard ${mode === 'student' ? 'on' : ''}" data-m="student"><span class="big">🎒</span><span><b>Оқушы</b>Түсіндірме, презентация, инфографика, интерактивті тапсырмалар, виртуалды зертхана, деңгейлік тесттер, қатемен жұмыс.</span></button>
      <button class="modecard ${mode === 'teacher' ? 'on' : ''}" data-m="teacher"><span class="big">🧑‍🏫</span><span><b>Мұғалім</b>ҚМЖ (Word), презентация (PowerPoint), деңгейлік тапсырмалар мен жауап кілті, зертхана парағы, тапсырма құрастырғыш, сабақ құралдары.</span></button></div>
      <h2 class="sect-title">${esc(S.title)}: ${esc(S.sub)}</h2>
      <div class="grid g3">${S.lessons.map(lid => lessonCard(LS[lid])).join('')}</div>
      <div class="card" style="margin-top:20px"><h2>Оқулық мазмұны</h2><ul class="toc">${B.toc.map(t => `<li><b class="${t.ready ? '' : 'off'}">${esc(t.sec)}</b>${t.ready ? ' <span class="pill">дайын</span>' : ' <span class="mut">— кейін қосылады</span>'}
        ${t.ready ? `<ul>${t.items.map(i => `<li><a href="#/lesson/${i[2]}">${esc(i[0])}</a> ${pg(i[1])}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ul></div>`;
    app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => setMode(b.dataset.m));
  }
  function lessonCard(L) {
    const p = lessonProgress(L.id);
    return `<a class="lessoncard" href="#/lesson/${L.id}"><img src="${img((L.explain.find(e => e.img) || L.figures[0]).img)}" alt=""><div class="in">
      <span class="num" style="background:${L.color}">${L.icon} ${L.num}-САБАҚ · ${L.pages[0]}–${L.pages[1]}-б.</span><br><b>${esc(L.title)}</b>
      ${mode === 'student' ? `<div class="prog" title="Орындалды: ${p}%"><i style="width:${p}%"></i></div>` : ''}</div></a>`;
  }

  /* ---------- бөлім ---------- */
  function section(sid) {
    const S = B.sections.find(s => s.id === sid) || B.sections[0]; const X = EX[S.id];
    const bc = X.bookCheck;
    app.innerHTML = `<div class="breadcrumbs"><a href="#/">Басты бет</a> › ${esc(S.title)}</div>
      <h1>${esc(S.title)}: ${esc(S.sub)}</h1><p class="mut">Оқулық: ${S.pages[0]}–${S.pages[1]}-беттер · ${S.lessons.length} сабақ</p>
      <div class="grid g3">${S.lessons.map(lid => lessonCard(LS[lid])).join('')}</div>
      <div style="margin-top:22px">${W.renderMind(X.mindmap)}</div>
      <div class="grid g2" style="margin-top:20px">
        <div class="card"><h2>📝 Бөлім бойынша тест</h2><p>Бес сабақтың барлық деңгейінен кездейсоқ 15 сұрақ.</p><a class="btn" href="#/sectest/${S.id}">Тестті бастау</a></div>
        <div class="card"><h2>📗 «Өз біліміңді тексер» ${pg(bc.p)}</h2>
          ${['A', 'B', 'C'].map(lv => `<p><b>${lv} деңгей</b></p><ol>${bc[lv].map((t, i) => `<li>${esc(t)}<div class="teacher-only"><div class="key" style="display:block">🔑 ${esc(bc[lv + 'ans'][i])}</div></div></li>`).join('')}</ol>`).join('')}
        </div></div>
      <div class="card teacher-only"><h2>🧩 Бөлім бойынша жиынтық жұмыс</h2><p>Тапсырма құрастырғышта осы бөлімнің барлық сабағын таңдап, 2 нұсқалы жаттығу жұмысын басып шығара аласыз.</p><a class="btn" href="#/builder">Құрастырғышқа өту</a></div>`;
  }
  function sectionTest(sid) {
    const S = B.sections.find(s => s.id === sid) || B.sections[0];
    const pool = S.lessons.flatMap(l => ['A', 'B', 'C'].flatMap(lv => LS[l].tests[lv].map((q, i) => ({ ...q, _ref: [l, lv, i] }))));
    app.innerHTML = `<div class="breadcrumbs"><a href="#/section/${S.id}">${esc(S.title)}</a> › Бөлім бойынша тест</div><h1>Бөлім бойынша тест</h1><div class="card" id="tbox"></div>`;
    W.runTest($('#tbox'), shuffle(pool).slice(0, 15), { label: 'Өсімдіктер бөлімі', onAnswer: trackMistake, onFinish: (s, n) => Store.upd(d => { d.tests = d.tests || {}; d.tests['sec:' + S.id] = Math.max(d.tests['sec:' + S.id] || 0, Math.round(s / n * 100)); }), back: `<a class="btn sec" href="#/section/${S.id}">Бөлімге қайту</a>` });
  }
  function trackMistake(q, good) {
    if (!q._ref) return; const k = q._ref.join(':');
    Store.upd(d => { d.mistakes = d.mistakes || {}; if (good) delete d.mistakes[k]; else d.mistakes[k] = Date.now(); });
  }

  /* ---------- сабақ ---------- */
  function lesson(lid, tab) {
    const L = LS[lid]; if (!L) return home();
    Store.pref('cur', lid);
    const mats = mode === 'teacher' ? MAT_T : MAT_S;
    if (!tab || !mats.some(t => t[0] === tab)) tab = mode === 'teacher' ? 'kmj' : 'explain';
    navBar();
    const m = mats.find(t => t[0] === tab);
    const S = sectionOf(lid); const ids = S.lessons, ix = ids.indexOf(lid);
    app.innerHTML = `<div class="breadcrumbs"><a href="#/">Басты бет</a> › <a href="#/section/${S.id}">${esc(S.sub)}</a> › ${L.num}-сабақ</div>
      <div class="lhead"><div class="ic" style="background:${L.color}">${L.icon}</div><div><span class="what">${m[1]} ${m[2]}</span> <span class="mut">${L.num}-сабақ · оқулық ${pg(L.pages[0])}–${pg(L.pages[1])}</span><h1>${esc(L.title)}</h1></div></div>
      <div id="tab"></div>
      <div class="row no-print" style="justify-content:space-between;margin-top:24px">${ix > 0 ? `<a class="btn sec" href="#/lesson/${ids[ix - 1]}/${tab}">← ${LS[ids[ix - 1]].num}-сабақ</a>` : '<span></span>'}${ix < ids.length - 1 ? `<a class="btn sec" href="#/lesson/${ids[ix + 1]}/${tab}">${LS[ids[ix + 1]].num}-сабақ →</a>` : ''}</div>`;
    const T = $('#tab');
    ({ explain: tExplain, figures: tFigures, info: tInfo, slides: tSlides, tasks: tTasks, lab: tLab, test: tTest, cards: tCards, kmj: tKmj, levels: tLevels, qr: tQr }[tab])(T, L);
  }

  function tExplain(T, L) {
    T.innerHTML = `<div class="card"><p><b>Сен</b> ${L.goal.map(esc).join(' ')}</p><p>Тірек сөздер: ${L.keywords.map(k => `<span class="pill">${esc(k)}</span>`).join('')}</p>
      <h3>Қайталауға арналған сұрақтар ${pg(L.pages[0])}</h3><ol class="qlist">${L.review.map(q => `<li>${esc(q)}</li>`).join('')}</ol></div>
      ${L.explain.map((e, i) => { const imgs = e.imgs || (e.img ? [e.img] : []); return `<div class="card ex ${imgs.length ? '' : 'noimg'}"><div><div class="row" style="justify-content:space-between"><h2>${i + 1}. ${esc(e.h)}</h2>${pg(e.p)}</div><div>${e.t}</div><div class="easy"><b>💬 Қарапайым тілмен:</b> ${esc(e.easy)}</div></div>
        ${imgs.length ? (imgs.length > 1 ? `<div class="imgs">${imgs.map(x => `<img src="${img(x)}" alt="">`).join('')}</div>` : `<img src="${img(imgs[0])}" alt="">`) : ''}</div>`; }).join('')}
      ${L.remember.length ? `<div class="remember"><h3>📌 Есіңе сақта!</h3>${L.remember.map(r => `<p style="font-size:1.1em;margin:.4em 0">${esc(r.t)} ${pg(r.p)}</p>`).join('')}</div>` : ''}
      ${L.interesting.length ? `<div class="interest"><h3>💡 Бұл қызық!</h3><ul>${L.interesting.map(f => `<li style="margin:6px 0">${esc(f.t)} ${pg(f.p)}</li>`).join('')}</ul></div>` : ''}
      <div class="card"><h3>❓ Сабақты қорытындылау</h3><ol class="qlist">${L.summaryQ.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
      <div class="row"><a class="btn" href="#/lesson/${L.id}/test">✅ Тест тапсыру</a><a class="btn sec" href="#/lesson/${L.id}/tasks">🧩 Тапсырмалар</a></div></div>`;
    W.markDone(L.id, 'explain');
  }
  function tFigures(T, L) {
    T.innerHTML = `<p class="mut">Суреттер оқулықтан қиып алынды. Суретті бассаң, үлкейеді.</p><div class="grid g3">${L.figures.map(f => `<figure class="fig card" style="padding:10px;margin:0"><img src="${img(f.img)}" alt="${esc(f.cap)}" data-cap="${esc(f.cap)} · ${f.p}-бет" style="height:190px;object-fit:contain;width:100%;background:#fff"><figcaption>${esc(f.cap || 'Оқулықтағы сурет')} · ${pg(f.p)}</figcaption></figure>`).join('')}</div>`;
  }
  function tInfo(T, L) {
    T.innerHTML = W.renderInfo(L.infographic) + `<div class="row" style="margin-top:12px"><button class="btn sec" onclick="print()">🖨️ Басып шығару</button></div>`;
  }
  function tSlides(T, L) {
    T.innerHTML = `<div class="row no-print" style="margin-bottom:12px"><a class="btn" href="files/ppt/Prezentaciya-${L.num}-sabaq.pptx" download>⬇️ PowerPoint (.pptx) жүктеу</a><span class="mut">Төмендегі слайдтарды сайттың ішінде де көрсетуге болады: ← → пернелері, «Толық экран».</span></div><div id="ss"></div>`;
    W.slideshow($('#ss'), L);
  }
  function tTasks(T, L) {
    T.innerHTML = L.interactive.map((t, i) => W.renderTask(t, i, L.id)).join('');
    T.querySelectorAll('.task').forEach((el, i) => W.bindTask(el, L.interactive[i]));
  }
  function tLab(T, L) {
    const b = L.lab;
    T.innerHTML = `<div id="vlab"></div>
<div class="card"><div class="labhead"><h2 style="margin:0">📋 ${esc(b.title)}</h2><span class="tag ${b.kind}">${b.kind === 'book' ? '📗 Оқулықтағы жұмыс' : '➕ Қосымша жұмыс (оқулық мәліметіне негізделген)'}</span>${pg(b.p)}</div>
      <p class="mut" style="margin-top:8px">${esc(b.basis)}</p></div>

      <div class="card printsheet" id="sheet"><div class="row no-print" style="justify-content:space-between"><h2>📋 Зертханалық жұмыс парағы</h2><button class="btn sec" onclick="print()">🖨️ Басып шығару</button></div>
      <p>Аты-жөні: ______________________ Сынып: ____ Күні: ________</p>
      <h3>${esc(b.title)}</h3>
      <p><b>Мақсаты:</b> ${esc(b.goal)}</p>
      <p><b>Болжам:</b> ${esc(b.hypothesis)}</p>
      <p><b>Құрал-жабдықтар:</b> ${b.materials.map(esc).join(', ')}</p>
      <p><b>⚠️ Қауіпсіздік ережесі:</b></p><ul>${b.safety.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      <p class="note teacher-only">Қауіпсіздік ережелерінің бір бөлігі оқулықта жоқ, жалпы сақтық үшін қосылды. Тәжірибе алдында мұғалім тексерсін.</p>
      <p><b>Жұмыс барысы:</b></p><ol class="steps">${b.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <p><b>Бақылау кестесі:</b></p><table class="obs"><thead><tr>${b.table.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: b.table.rows }, (_, i) => `<tr>${b.table.cols.map((c, j) => `<td>${j === 0 ? (b.table.prefill ? esc(b.table.prefill[i]) : i + 1) : ''}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <p><b>Қорытынды:</b> ________________________________________________</p>
      <div class="teacher-only"><div class="key" style="display:block">🔑 Күтілетін қорытынды: ${esc(b.conclusion)}</div></div>
      <p><b>Сұрақтар:</b></p><ol>${b.questions.map(q => `<li>${esc(q)}<div class="lines"></div></li>`).join('')}</ol>
      <div class="teacher-only"><p><b>Бағалау критерийлері мен дескрипторлар:</b></p><table class="obs"><thead><tr><th>Критерий</th><th>Дескриптор</th><th>Балл</th></tr></thead><tbody>${b.criteria.map(c => c.d.map((d, i) => `<tr>${i === 0 ? `<td rowspan="${c.d.length}">${esc(c.c)}</td>` : ''}<td>${esc(d)}</td><td>1</td></tr>`).join('')).join('')}</tbody></table></div>
      </div>`;
    W.Labs[b.virtual]($('#vlab'), L);
  }
  function tTest(T, L) {
    const d = Store.get().tests || {};
    T.innerHTML = `<div class="card" id="tbox"><h2>Деңгейді таңда</h2><div class="lvls">
      ${[['A', 'Білу', 'Оқулықтағы негізгі ұғымдар'], ['B', 'Түсіну', 'Түсіндіру, салыстыру'], ['C', 'Қолдану', 'Ойлану, қорытынды жасау']].map(([lv, n, t]) => `<button class="lvl ${lv}" data-lv="${lv}"><b>${lv} деңгей</b><br>${n}<br><span class="mut" style="font-size:.85em">${t}</span>${d[L.id + ':' + lv] != null ? `<br><span class="pill">үздік нәтиже: ${d[L.id + ':' + lv]}%</span>` : ''}</button>`).join('')}</div>
      <p class="mut" style="margin-top:12px">Әр деңгейде 4 сұрақ. «💡 Көмек» батырмасы: алдымен бет нөмірін көрсетеді, сосын бір қате жауапты сызады.</p>
      <div class="teacher-only"><button class="btn sec sm" data-keys>🔑 Барлық сұрақ пен жауапты көру</button><div data-keyl></div></div></div>`;
    T.querySelectorAll('[data-lv]').forEach(b => b.onclick = () => {
      const lv = b.dataset.lv;
      W.runTest($('#tbox'), L.tests[lv].map((q, i) => ({ ...q, _ref: [L.id, lv, i] })), {
        label: lv + ' деңгей', onAnswer: trackMistake,
        onFinish: (s, n) => { Store.upd(d => { d.tests = d.tests || {}; const k = L.id + ':' + lv; d.tests[k] = Math.max(d.tests[k] || 0, Math.round(s / n * 100)); }); },
        back: `<a class="btn sec" href="#/lesson/${L.id}/test" onclick="setTimeout(()=>dispatchEvent(new HashChangeEvent('hashchange')),0)">Басқа деңгей</a>`
      });
    });
    const k = T.querySelector('[data-keys]');
    if (k) k.onclick = () => { T.querySelector('[data-keyl]').innerHTML = ['A', 'B', 'C'].map(lv => `<h3>${lv} деңгей</h3><ol>${L.tests[lv].map(q => `<li>${esc(q.q)}<br><b>✔ ${esc(q.o[0])}</b> <span class="mut">(басқалары: ${q.o.slice(1).map(esc).join('; ')})</span> ${pg(q.p)}</li>`).join('')}</ol>`).join(''); };
  }
  function tCards(T, L) { T.innerHTML = '<div id="fc"></div>'; W.flashcards($('#fc'), L.glossary); }
  function tKmj(T, L) {
    const K = L.kmj;
    T.innerHTML = `<div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Қысқа мерзімді жоспар</h2><a class="btn" href="files/kmj/QMZh-${L.num}-sabaq.docx" download>⬇️ Word (.docx) жүктеу</a></div>
      <p class="mut">Сіздің ҚМЖ үлгіңіздің құрылымымен жасалды. Мектеп, күні, оқу мақсатының коды және құндылықтар бос қалдырылды. Оқу мақсатының кодтары оқулықта жоқ, сондықтан оқу бағдарламасынан толтырыңыз.</p>
      <p><b>Сабақтың мақсаты:</b></p><ul>${K.aims.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
      <table class="obs"><thead><tr><th>Кезең</th><th>Педагогтің әрекеті</th><th>Оқушының әрекеті</th><th>Бағалау</th><th>Ресурстар</th></tr></thead><tbody>
      ${[['Психологиялық ахуал (2 мин)', K.warm, null], ['Тақырыпты ашу (' + K.open.time + ')', K.open], ...K.mid.map(m => ['Сабақтың ортасы (' + m.time + ')', m]), ['Сабақтың соңы (' + K.end.time + ')', K.end], ['Рефлексия (2 мин)', K.refl]].map(([n, s]) => `<tr><td><b>${esc(n)}</b></td><td><b>${esc(s.name)}</b><br>${s.t.map(esc).join('<br>')}</td><td>${s.s.map(esc).join('<br>')}</td><td>${(s.d || []).map(esc).join('<br>')}</td><td>${esc(s.r || '')}</td></tr>`).join('')}
      </tbody></table><p><b>Үйге тапсырма:</b> ${esc(K.hw)}</p></div>`;
  }
  function tLevels(T, L) {
    T.innerHTML = `<div class="card printsheet" id="lvl"><div class="row no-print" style="justify-content:space-between"><h2 style="margin:0">Деңгейлік тапсырмалар</h2>
      <div class="row"><label class="switch" style="margin:0"><input type="checkbox" data-k> Жауап кілтін көрсету</label><button class="btn sec" onclick="print()">🖨️ Басып шығару</button></div></div>
      <p>${L.num}-сабақ. ${esc(L.title)} (оқулық, ${L.pages[0]}–${L.pages[1]}-беттер)</p>
      ${[['A', 'А деңгей — білу'], ['B', 'В деңгей — түсіну, қолдану'], ['C', 'С деңгей — талдау, бағалау']].map(([lv, n]) => `<h3>${n}</h3><ol>${L.tasks[lv].map(t => `<li class="taskline">${esc(t.t)} ${pg(t.p)}<div class="lines"></div><div class="lines"></div><div class="key">🔑 ${esc(t.ans)}<br><i>Дескриптор:</i> ${t.d.map(esc).join('; ')}</div></li>`).join('')}</ol>`).join('')}</div>`;
    T.querySelector('[data-k]').onchange = e => $('#lvl').classList.toggle('showkey', e.target.checked);
  }
  function qrImg(url) { try { const q = qrcode(0, 'M'); q.addData(url); q.make(); return q.createDataURL(6, 2); } catch (e) { return ''; } }
  function tQr(T, L) {
    const base = location.href.split('#')[0];
    const links = [['Түсіндірме', 'explain'], ['Тест', 'test'], ['Интерактивті тапсырмалар', 'tasks'], ['Зертхана', 'lab']];
    const local = location.protocol === 'file:';
    T.innerHTML = `${local ? '<p class="note">Сайт қазір компьютерден ашылған. QR-код оқушы телефонында ашылуы үшін сайт GitHub Pages-те тұруы керек.</p>' : ''}
      <p>Оқушылар телефонмен сканерлеп, бірден керекті бетке кіреді.</p><div class="grid g4">${links.map(([n, t]) => { const u = base + '#/lesson/' + L.id + '/' + t; return `<div class="card" style="text-align:center"><div class="qrbox"><img src="${qrImg(u)}" alt="QR: ${n}"></div><b>${n}</b><p class="mut" style="font-size:.75em;word-break:break-all">${esc(u)}</p><button class="btn sm sec" data-big="${esc(u)}" data-n="${n}">Экранға үлкейту</button></div>`; }).join('')}</div>`;
    T.querySelectorAll('[data-big]').forEach(b => b.onclick = () => modal(`<h2 style="text-align:center">${L.num}-сабақ · ${b.dataset.n}</h2><div class="qrbox"><img src="${qrImg(b.dataset.big)}" style="width:min(70vh,80vw);height:auto" alt=""></div>`));
  }

  /* ---------- оқулық ---------- */
  function book(p, hl) {
    p = Math.max(1, Math.min(B.totalPages, p)); const L = lessonOfPage(p);
    let txt = esc(BT[p - 1] || '');
    if (hl) txt = txt.replace(new RegExp(hl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark>${m}</mark>`);
    app.innerHTML = `<div class="row" style="justify-content:space-between"><h1>📖 Оқулық · ${p}-бет</h1>
      <form class="row" id="jump"><a class="btn sec" href="#/book/${p - 1}">←</a><input type="number" min="1" max="${B.totalPages}" value="${p}" style="width:80px;padding:8px;border-radius:10px;border:1.5px solid var(--line)"><button class="btn sec">Өту</button><a class="btn sec" href="#/book/${p + 1}">→</a></form></div>
      ${L ? `<p>Бұл бет: <a href="#/lesson/${L.id}"><b>${L.num}-сабақ. ${esc(L.title)}</b></a> — материалдарын ашу</p>` : ''}
      <div class="bookview"><img src="pages/${String(p).padStart(3, '0')}.jpg" alt="Оқулықтың ${p}-беті" data-zoom>
      <div><h3>Беттің мәтіні</h3><p class="mut" style="font-size:.85em">Мәтін суреттен автоматты түрде танылған, кейбір әріптер мен сандар қате болуы мүмкін. Дәл нұсқасы — сол жақтағы бет суреті.</p><div class="ocr">${txt || '<span class="mut">Бұл бетте мәтін жоқ.</span>'}</div></div></div>`;
    $('#jump').onsubmit = e => { e.preventDefault(); location.hash = '#/book/' + e.target.querySelector('input').value; };
  }

  /* ---------- іздеу ---------- */
  const norm = s => s.toLowerCase().replace(/ё/g, 'е');
  function snippet(text, q) {
    const i = norm(text).indexOf(norm(q)); if (i < 0) return esc(text.slice(0, 160));
    const s = Math.max(0, i - 70), e = Math.min(text.length, i + q.length + 90);
    return (s ? '…' : '') + esc(text.slice(s, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length, e)) + (e < text.length ? '…' : '');
  }
  function search(q) {
    $('#searchInput').value = q;
    const strip = h => h.replace(/<[^>]+>/g, ' ');
    let mat = [], pages = [];
    if (q.length >= 2) {
      const nq = norm(q);
      allLessons().forEach(L => {
        L.explain.forEach(e => { const t = e.h + '. ' + strip(e.t); if (norm(t).includes(nq)) mat.push({ href: `#/lesson/${L.id}/explain`, title: `${L.num}-сабақ · ${e.h}`, snip: snippet(t, q), p: e.p }); });
        L.glossary.forEach(g => { const t = g.term + ' — ' + g.def; if (norm(t).includes(nq)) mat.push({ href: `#/lesson/${L.id}/cards`, title: `Сөздік · ${g.term}`, snip: snippet(t, q), p: g.p }); });
        L.interesting.concat(L.remember).forEach(f => { if (norm(f.t).includes(nq)) mat.push({ href: `#/lesson/${L.id}/explain`, title: `${L.num}-сабақ · ${L.title}`, snip: snippet(f.t, q), p: f.p }); });
      });
      BT.forEach((t, i) => { if (norm(t).includes(nq)) pages.push({ p: i + 1, snip: snippet(t, q), n: (norm(t).split(nq).length - 1) }); });
    }
    app.innerHTML = `<h1>🔎 Іздеу</h1><form class="row" id="sf"><input value="${esc(q)}" placeholder="Мысалы: тамыр, сексеуіл, Қызыл кітап" style="flex:1;padding:12px;border-radius:12px;border:1.5px solid var(--line);font:inherit"><button class="btn">Іздеу</button></form>
      ${q.length < 2 ? '<p class="mut">Кемінде 2 әріп жазыңыз. Іздеу бүкіл оқулықтың (144 бет) мәтіні мен сабақ материалдары бойынша жүреді.</p>' : `
      <div class="grid g2" style="margin-top:16px"><div class="card"><h2>Сабақ материалдары (${mat.length})</h2>${mat.slice(0, 40).map(r => `<div class="sres"><a class="t" href="${r.href}">${esc(r.title)}</a> ${pg(r.p)}<div>${r.snip}</div></div>`).join('') || '<p class="mut">Табылмады.</p>'}</div>
      <div class="card"><h2>Оқулық беттері (${pages.length})</h2>${pages.map(r => `<div class="sres"><a class="t" href="#/book/${r.p}?q=${encodeURIComponent(q)}">${r.p}-бет</a> <span class="mut">(${r.n} рет)</span>${lessonOfPage(r.p) ? ` · <a href="#/lesson/${lessonOfPage(r.p).id}">${lessonOfPage(r.p).num}-сабақ</a>` : ''}<div>${r.snip}</div></div>`).join('') || '<p class="mut">Табылмады.</p>'}</div></div>
      <p class="mut" style="font-size:.85em">Оқулық беттерінің мәтіні автоматты танылған, сондықтан кейбір сөздер табылмай қалуы мүмкін.</p>`}`;
    $('#sf').onsubmit = e => { e.preventDefault(); location.hash = '#/search?q=' + encodeURIComponent(e.target.querySelector('input').value.trim()); };
  }

  /* ---------- оқушы нәтижесі ---------- */
  function progress() {
    const d = Store.get(); const t = d.tests || {};
    const nm = Object.keys(d.mistakes || {}).length;
    app.innerHTML = `<h1>⭐ Менің нәтижем</h1><p class="mut">Нәтиже осы құрылғыда ғана сақталады. Басқа компьютерге көшіру үшін файлға сақтап, сол жерде жүктеңіз.</p>
      <div class="card"><table class="obs"><thead><tr><th>Сабақ</th><th>A</th><th>B</th><th>C</th><th>Тапсырмалар</th><th>Барлығы</th></tr></thead><tbody>
      ${allLessons().map(L => `<tr><td><a href="#/lesson/${L.id}">${L.num}. ${esc(L.title)}</a></td>${['A', 'B', 'C'].map(lv => `<td>${t[L.id + ':' + lv] != null ? t[L.id + ':' + lv] + '%' : '—'}</td>`).join('')}<td>${L.interactive.filter((x, i) => (d.tasks || {})[L.id + ':' + i] === 100).length}/${L.interactive.length}</td><td><div class="prog"><i style="width:${lessonProgress(L.id)}%"></i></div></td></tr>`).join('')}
      </tbody></table>${t['sec:s-plants'] != null ? `<p>Бөлім бойынша тест: <b>${t['sec:s-plants']}%</b></p>` : ''}</div>
      <div class="card"><h2>🔁 Қатемен жұмыс</h2><p>Қате жауап берілген сұрақтар: <b>${nm}</b></p>${nm ? '<a class="btn" href="#/mistakes">Қайталау</a>' : '<p class="mut">Қате жоқ — жарайсың!</p>'}</div>
      <div class="card"><h2>💾 Нәтижені сақтау</h2><div class="row"><button class="btn sec" id="exp">⬇️ Файлға сақтау</button><label class="btn sec">⬆️ Файлдан жүктеу<input type="file" id="imp" accept=".json" hidden></label><button class="btn sec" id="clr">🗑️ Нәтижені тазарту</button></div></div>`;
    $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(Store.get())], { type: 'application/json' })); a.download = 'jaratylystanu-natije.json'; a.click(); };
    $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { Store.set(JSON.parse(t)); toast('Нәтиже жүктелді'); progress(); } catch (er) { toast('Файл дұрыс емес'); } }); };
    $('#clr').onclick = () => { if (confirm('Барлық нәтижені өшіру керек пе?')) { Store.set({}); progress(); } };
  }
  function mistakes() {
    const keys = Object.keys(Store.get().mistakes || {});
    const qs = keys.map(k => { const [l, lv, i] = k.split(':'); const q = LS[l] && LS[l].tests[lv][+i]; return q ? { ...q, _ref: [l, lv, +i] } : null; }).filter(Boolean);
    app.innerHTML = `<h1>🔁 Қатемен жұмыс</h1>${qs.length ? `<p>Бұрын қате кеткен ${qs.length} сұрақ. Дұрыс жауап берсең, тізімнен шығады.</p><div class="card" id="tbox"></div>` : '<div class="card"><p>Қате жауап жоқ. Тест тапсырып көр!</p><a class="btn" href="#/section/s-plants">Сабақтарға өту</a></div>'}`;
    if (qs.length) W.runTest($('#tbox'), shuffle(qs), { label: 'Қатемен жұмыс', onAnswer: trackMistake, back: '<a class="btn sec" href="#/progress">Менің нәтижем</a>' });
  }

  /* ---------- тапсырма құрастырғыш ---------- */
  function builder() {
    app.innerHTML = `<h1>🧩 Тапсырма құрастырғыш</h1><p class="mut">Сабақты, деңгейді және санын таңдаңыз — басып шығаруға дайын жұмыс парағы жасалады.</p>
      <div class="card no-print"><div class="grid g3">
        <div><b>Сабақтар</b>${allLessons().map(L => `<label class="switch"><input type="checkbox" name="l" value="${L.id}" checked> ${L.num}. ${esc(L.title)}</label>`).join('')}</div>
        <div><b>Деңгей</b>${['A', 'B', 'C'].map(lv => `<label class="switch"><input type="checkbox" name="lv" value="${lv}" checked> ${lv} деңгей</label>`).join('')}
          <b>Түрі</b><label class="switch"><input type="checkbox" name="ty" value="test" checked> Тест сұрақтары</label><label class="switch"><input type="checkbox" name="ty" value="task" checked> Жазбаша тапсырмалар</label></div>
        <div><label>Бір сабақтан әр түрден: <select id="cnt"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label>
          <label>Нұсқа саны: <select id="var"><option>1</option><option selected>2</option></select></label>
          <label>Тақырыбы: <input id="ttl" value="«Өсімдіктер» бөлімі бойынша жаттығу жұмысы" style="width:100%;padding:8px;border-radius:10px;border:1.5px solid var(--line);margin-top:6px;font:inherit"></label>
          <label class="switch"><input type="checkbox" id="key" checked> Жауап кілтін соңына қосу</label>
          <button class="btn" id="go" style="margin-top:8px">Жасау</button></div></div></div><div id="out"></div>`;
    $('#go').onclick = () => {
      const val = n => [...app.querySelectorAll(`input[name=${n}]:checked`)].map(x => x.value);
      const ls = val('l'), lvs = val('lv'), ty = val('ty'), cnt = +$('#cnt').value, nv = +$('#var').value;
      if (!ls.length || !lvs.length || !ty.length) return toast('Кемінде бір сабақ, деңгей және түр таңдаңыз');
      let html = '', keys = '';
      for (let v = 1; v <= nv; v++) {
        let n = 0, body = '', key = [];
        ls.forEach(lid => { const L = LS[lid];
          if (ty.includes('test')) shuffle(lvs.flatMap(lv => L.tests[lv].map(q => ({ ...q, lv })))).slice(0, cnt).forEach(q => { n++; const o = shuffle(q.o); body += `<div class="taskline"><b>${n}.</b> (${q.lv}) ${esc(q.q)}${q.img ? `<img src="${img(q.img)}" style="max-height:120px;margin:6px 0" alt="">` : ''}<br>${o.map((x, k) => `${['а', 'ә', 'б'][k]}) ${esc(x)}`).join('&nbsp;&nbsp;&nbsp; ')}</div>`; key.push(`${n} — ${['а', 'ә', 'б'][o.indexOf(q.o[0])]}) ${esc(q.o[0])} (${q.p}-бет)`); });
          if (ty.includes('task')) shuffle(lvs.flatMap(lv => L.tasks[lv].map(t => ({ ...t, lv })))).slice(0, cnt).forEach(t => { n++; body += `<div class="taskline"><b>${n}.</b> (${t.lv}) ${esc(t.t)}<div class="lines"></div><div class="lines"></div></div>`; key.push(`${n} — ${esc(t.ans)}`); });
        });
        html += `<div class="card printsheet" style="${v > 1 ? 'break-before:page' : ''}"><h2>${esc($('#ttl').value)}${nv > 1 ? ` · ${v}-нұсқа` : ''}</h2><p>Аты-жөні: ______________________ Сынып: ____ Күні: ________</p>${body}</div>`;
        keys += `<h3>${nv > 1 ? v + '-нұсқа' : 'Жауаптар'}</h3><ol style="list-style:none;padding:0">${key.map(k => `<li>${k}</li>`).join('')}</ol>`;
      }
      if ($('#key').checked) html += `<div class="card printsheet" style="break-before:page"><h2>🔑 Жауап кілті</h2>${keys}</div>`;
      $('#out').innerHTML = `<div class="row no-print" style="margin:10px 0"><button class="btn" onclick="print()">🖨️ Басып шығару</button><span class="mut">Тек «Жасау» басылған сайын сұрақтар жаңадан араласады.</span></div>` + html;
    };
  }

  /* ---------- сабақ құралдары ---------- */
  function tools() {
    const names = Store.pref('names') || '';
    app.innerHTML = `<h1>⏱️ Сабақ құралдары</h1><div class="grid g2">
      <div class="card"><h2>Таймер</h2><div class="timer" id="tm">05:00</div><div class="row" style="justify-content:center">${[1, 3, 5, 10].map(m => `<button class="btn sec sm" data-m="${m}">${m} мин</button>`).join('')}<button class="btn" id="tgo">▶ Бастау</button><button class="btn sec" id="tst">⏸</button></div></div>
      <div class="card"><h2>Кездейсоқ оқушы</h2><div class="picked" id="pk">?</div><div class="row" style="justify-content:center"><button class="btn o" id="pick">🎲 Таңдау</button></div>
        <details style="margin-top:10px"><summary>Оқушылар тізімі (тек осы компьютерде сақталады)</summary><textarea id="nm" placeholder="Әр жолға бір оқушы">${esc(names)}</textarea></details></div>
      <div class="card"><h2>Топқа бөлу</h2><div class="row"><label>Топ саны: <select id="gn" style="width:auto">${[2, 3, 4, 5, 6].map(n => `<option ${n === 4 ? 'selected' : ''}>${n}</option>`).join('')}</select></label><button class="btn" id="grp">Бөлу</button></div><div id="gout" class="grid g2" style="margin-top:10px"></div></div>
      <div class="card"><h2>Рефлексия: «Бағдаршам»</h2><div class="row" style="justify-content:center;font-size:1.2em">${[['🟢', 'Бәрін түсіндім'], ['🟡', 'Сұрағым бар'], ['🔴', 'Түсінбедім']].map(([c, t]) => `<button class="btn sec" data-v="${t}" style="font-size:1em">${c} ${t} <b data-c>0</b></button>`).join('')}</div></div>
    </div>`;
    let sec = 300, run = null; const tm = $('#tm');
    const show = () => tm.textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
    app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { clearInterval(run); sec = +b.dataset.m * 60; show(); });
    $('#tgo').onclick = () => { clearInterval(run); run = setInterval(() => { if (!document.body.contains(tm)) return clearInterval(run); sec = Math.max(0, sec - 1); show(); if (!sec) { clearInterval(run); tm.style.color = '#c0504d'; toast('⏰ Уақыт бітті!'); } }, 1000); tm.style.color = ''; };
    $('#tst').onclick = () => clearInterval(run);
    const list = () => $('#nm').value.split('\n').map(s => s.trim()).filter(Boolean);
    $('#nm').oninput = () => Store.pref('names', $('#nm').value);
    $('#pick').onclick = () => { const l = list(); if (!l.length) { $('#pk').textContent = 'Тізімді толтырыңыз'; return; } let k = 0; const it = setInterval(() => { $('#pk').textContent = l[Math.floor(Math.random() * l.length)]; if (++k > 14) clearInterval(it); }, 80); };
    $('#grp').onclick = () => { const l = shuffle(list()), n = +$('#gn').value; if (!l.length) return toast('Алдымен оқушылар тізімін толтырыңыз'); const g = Array.from({ length: n }, () => []); l.forEach((x, i) => g[i % n].push(x)); $('#gout').innerHTML = g.map((x, i) => `<div class="task"><b>${i + 1}-топ</b><br>${x.map(esc).join('<br>')}</div>`).join(''); };
    app.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const c = b.querySelector('[data-c]'); c.textContent = +c.textContent + 1; });
  }

  setMode(mode);
})();
