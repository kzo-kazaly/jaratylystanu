/* Тегіс (flat) стильдегі иллюстрациялар — барлығы осы сайт үшін салынған SVG */
(function () {
  const C = { ink: '#232220', leaf: '#4f9a58', leafD: '#2f6b3b', leafL: '#8cc56c', sun: '#f2b53a', pink: '#ef8f86', red: '#e2574c', brick: '#c8673a', brown: '#7a4a2a', land: '#f4edd3', land2: '#e8dcb3', water: '#9ed6cf', water2: '#7fc3bb', cream: '#fbf7e8', blue: '#4d8fd1', purple: '#8d6bc7', yellow: '#f6d04d', white: '#ffffff' };
  const g = (x, y, s, inner, rot) => `<g transform="translate(${x} ${y}) scale(${s || 1})${rot ? ` rotate(${rot})` : ''}">${inner}</g>`;

  const A = {
    C,
    tulip: (x, y, s, c) => g(x, y, s, `<path d="M0 0 C1 -20 -1 -40 0 -62" stroke="${C.leafD}" stroke-width="3" fill="none"/>
      <path d="M0 -8 C-16 -18 -18 -36 -12 -46 C-6 -34 -2 -22 0 -12Z" fill="${C.leaf}"/><path d="M0 -14 C14 -22 18 -38 13 -50 C6 -38 2 -26 0 -18Z" fill="${C.leafL}"/>
      <path d="M-11 -62 C-12 -76 -6 -86 0 -80 C6 -86 12 -76 11 -62 C8 -54 -8 -54 -11 -62Z" fill="${c || C.red}"/><path d="M0 -80 C-3 -72 -3 -62 0 -56" stroke="#0002" stroke-width="2" fill="none"/>`),
    grass: (x, y, s, c) => g(x, y, s, `<path d="M-14 0 C-12 -14 -16 -24 -22 -30 C-10 -24 -6 -14 -6 0Z M-6 0 C-6 -20 -4 -32 2 -42 C2 -28 2 -14 4 0Z M2 0 C6 -14 12 -22 20 -26 C14 -16 12 -8 12 0Z" fill="${c || C.leaf}"/>`),
    reeds: (x, y, s) => g(x, y, s, `<path d="M0 0 L-2 -70 M8 0 L12 -60 M-8 0 L-14 -52" stroke="${C.leafD}" stroke-width="3"/><rect x="-5" y="-86" width="7" height="22" rx="3.5" fill="${C.brown}"/><rect x="9" y="-74" width="7" height="20" rx="3.5" fill="${C.brown}"/>
      <path d="M-4 0 C-10 -20 -22 -34 -30 -40 C-20 -30 -14 -16 -12 0Z M6 0 C14 -24 24 -34 32 -38 C24 -26 18 -14 16 0Z" fill="${C.leaf}"/>`),
    tree: (x, y, s, c) => g(x, y, s, `<path d="M-6 0 L-4 -50 L-14 -64 M-4 -50 L6 -70 M4 0 L4 -40 L14 -56" stroke="${C.brown}" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M-40 -70 C-46 -100 -20 -122 0 -116 C20 -126 48 -104 42 -76 C54 -60 36 -40 18 -46 C6 -36 -14 -38 -22 -46 C-40 -42 -52 -58 -40 -70Z" fill="${c || C.leaf}"/>
      <path d="M-20 -96 C-14 -104 -4 -106 4 -102" stroke="#fff5" stroke-width="5" stroke-linecap="round" fill="none"/>`),
    pine: (x, y, s) => g(x, y, s, `<rect x="-4" y="-16" width="8" height="16" fill="${C.brown}"/><path d="M0 -100 L22 -56 L12 -56 L28 -30 L16 -30 L32 -14 L-32 -14 L-16 -30 L-28 -30 L-12 -56 L-22 -56Z" fill="${C.leafD}"/>`),
    cactus: (x, y, s) => g(x, y, s, `<rect x="-10" y="-80" width="20" height="80" rx="10" fill="${C.leaf}"/><path d="M-10 -40 L-22 -40 C-28 -40 -30 -44 -30 -50 L-30 -62" stroke="${C.leaf}" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M10 -52 L20 -52 C26 -52 28 -56 28 -62 L28 -70" stroke="${C.leaf}" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M-4 -70 v8 M4 -56 v8 M-4 -40 v8 M4 -24 v8" stroke="${C.leafD}" stroke-width="2"/><circle cx="0" cy="-84" r="6" fill="${C.pink}"/>`),
    saxaul: (x, y, s) => g(x, y, s, `<path d="M0 0 C-2 -20 -14 -30 -26 -44 M0 0 C2 -22 10 -34 22 -50 M-2 -12 C-6 -30 -2 -46 -6 -62 M8 -30 L30 -36 M-14 -28 L-34 -26 M-6 -50 L-18 -64 M14 -44 L10 -62" stroke="${C.brown}" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      ${[[-26, -44], [22, -50], [-6, -62], [30, -36], [-34, -26], [-18, -64], [10, -62]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#a7b56a"/>`).join('')}`),
    lily: (x, y, s) => g(x, y, s, `<path d="M-30 0 A30 12 0 1 0 30 0 A30 12 0 0 0 4 -10 L0 0 L-4 -11 A30 12 0 0 0 -30 0Z" fill="${C.leaf}"/>
      <path d="M-8 -4 C-14 -14 -8 -20 0 -24 C8 -20 14 -14 8 -4Z" fill="${C.pink}"/><path d="M-3 -6 C-4 -14 0 -20 0 -20 C0 -20 4 -14 3 -6Z" fill="#fff"/>`),
    ripple: (x, y, s) => g(x, y, s, `<path d="M-20 0 h14 M2 0 h22 M-8 8 h20" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`),
    sun: (x, y, s) => g(x, y, s, `${Array.from({ length: 10 }, (_, i) => `<rect x="-3" y="-48" width="6" height="14" rx="3" fill="${C.sun}" transform="rotate(${i * 36})"/>`).join('')}<circle r="26" fill="${C.sun}"/><circle cx="-8" cy="-8" r="8" fill="#fff4"/>`),
    cloud: (x, y, s) => g(x, y, s, `<path d="M-40 10 C-50 10 -52 -6 -40 -8 C-40 -24 -20 -28 -12 -18 C-6 -34 22 -32 22 -14 C36 -18 44 0 32 10Z" fill="#fff"/>`),
    bee: (x, y, s) => g(x, y, s, `<ellipse cx="-4" cy="-12" rx="8" ry="10" fill="#fff" opacity=".85"/><ellipse cx="6" cy="-12" rx="7" ry="9" fill="#fff" opacity=".85"/><ellipse rx="14" ry="10" fill="${C.yellow}"/><path d="M-4 -9 v18 M4 -9 v18" stroke="${C.ink}" stroke-width="4"/><circle cx="13" cy="-2" r="2" fill="${C.ink}"/>`),
    ladybug: (x, y, s) => g(x, y, s, `<circle cx="12" cy="0" r="6" fill="${C.ink}"/><ellipse rx="13" ry="11" fill="${C.red}"/><path d="M0 -11 V11" stroke="${C.ink}" stroke-width="2"/>${[[-6, -4], [6, -5], [-5, 5], [6, 5]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="${C.ink}"/>`).join('')}`),
    butterfly: (x, y, s, c) => g(x, y, s, `<path d="M0 0 C-20 -26 -34 -8 -22 4 C-34 14 -16 26 0 6Z" fill="${c || C.purple}"/><path d="M0 0 C20 -26 34 -8 22 4 C34 14 16 26 0 6Z" fill="${c || C.purple}" opacity=".85"/><rect x="-2" y="-10" width="4" height="22" rx="2" fill="${C.ink}"/>`),
    sprout: (x, y, s) => g(x, y, s, `<path d="M0 0 C0 -14 0 -22 0 -30" stroke="${C.leafD}" stroke-width="4" stroke-linecap="round"/><path d="M0 -26 C-6 -40 -24 -42 -30 -36 C-24 -24 -8 -22 0 -26Z" fill="${C.leaf}"/><path d="M0 -30 C6 -46 26 -48 32 -40 C26 -28 8 -26 0 -30Z" fill="${C.leafL}"/>`),
    bush: (x, y, s, c) => g(x, y, s, `<path d="M-30 0 C-40 -20 -20 -36 -4 -28 C4 -44 30 -36 28 -18 C40 -14 38 0 30 0Z" fill="${C.leafD}"/>${[[-18, -20], [2, -30], [18, -16], [-6, -10]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="${c || C.yellow}"/>`).join('')}`),
    dune: (x, y, s) => g(x, y, s, `<path d="M-90 0 C-60 -40 -20 -46 10 -30 C40 -50 80 -30 100 0Z" fill="#e8c98a"/><path d="M-50 -14 C-30 -26 -10 -26 6 -18" stroke="#d6af6a" stroke-width="3" fill="none"/>`),
    stump: (x, y, s) => g(x, y, s, `<path d="M-14 0 L-12 -16 L12 -16 L14 0Z" fill="${C.brown}"/><ellipse cy="-16" rx="12" ry="4" fill="#d8b27a"/><ellipse cy="-16" rx="6" ry="2" fill="none" stroke="${C.brown}" stroke-width="1.2"/>`),
    magnifier: (x, y, s) => g(x, y, s, `<circle r="18" fill="#d9f0ff" stroke="${C.brick}" stroke-width="6"/><path d="M13 13 L32 32" stroke="${C.brown}" stroke-width="9" stroke-linecap="round"/><path d="M-8 -8 C-4 -12 2 -12 6 -10" stroke="#fff" stroke-width="3" fill="none"/>`)
  };

  /* Фондағы көрініс: су үстіндегі құрлық аралдары */
  A.background = function () {
    const L = C.land;
    return `<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="1600" height="1000" fill="${C.water}"/>
      <path d="M0 0 H520 C480 60 520 120 430 150 C340 180 300 120 210 170 C120 220 60 190 0 230Z" fill="${L}"/>
      <path d="M1600 0 V260 C1530 250 1500 190 1420 200 C1330 210 1300 140 1340 90 C1370 50 1330 20 1320 0Z" fill="${L}"/>
      <path d="M0 1000 V700 C70 680 120 730 190 720 C280 705 320 780 300 850 C285 910 350 960 360 1000Z" fill="${L}"/>
      <path d="M1600 1000 H1080 C1120 950 1100 900 1180 880 C1260 860 1280 790 1360 780 C1440 770 1520 820 1600 790Z" fill="${L}"/>
      <path d="M760 1000 C780 960 840 950 880 970 C910 985 930 1000 930 1000Z" fill="${L}"/>
      ${A.ripple(700, 120, 1.2)}${A.ripple(980, 330, 1)}${A.ripple(560, 560, 1.3)}${A.ripple(1240, 600, 1)}${A.ripple(860, 820, 1.1)}${A.ripple(420, 380, .9)}
      ${A.lily(620, 300, 1)}${A.lily(1180, 470, .8)}${A.lily(480, 760, .9)}${A.lily(940, 650, .7)}
      ${A.reeds(300, 160, 1)}${A.reeds(1350, 210, .9)}
      ${A.tulip(70, 150, 1)}${A.tulip(100, 160, .8, C.yellow)}${A.tulip(130, 150, .9)}${A.grass(170, 160, 1)}
      ${A.tree(380, 110, .8)}${A.bush(250, 95, .9)}${A.sun(1500, 70, .9)}${A.cloud(1250, 70, 1.1)}
      ${A.pine(1440, 230, .8)}${A.pine(1490, 245, .65)}
      ${A.cactus(120, 860, 1)}${A.dune(200, 980, 1.2)}${A.saxaul(60, 960, 1)}${A.grass(250, 850, .9, C.leafD)}
      ${A.tree(1330, 900, 1.1, C.leafD)}${A.bush(1470, 880, 1, C.pink)}${A.tulip(1200, 950, 1, C.purple)}${A.tulip(1230, 960, .8)}${A.grass(1540, 900, 1)}${A.sprout(1150, 930, 1)}
      ${A.bee(900, 220, 1)}${A.butterfly(1080, 160, .9)}${A.ladybug(520, 70, .9)}${A.butterfly(330, 640, .7, C.yellow)}
    </svg>`;
  };

  /* Басты беттегі үлкен көрініс */
  A.hero = function () {
    return `<svg viewBox="0 0 1000 520" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1000" height="520" fill="${C.water}"/>
      <path d="M0 0 H330 C300 50 250 70 190 60 C120 50 60 110 0 100Z" fill="${C.land}"/>
      <path d="M1000 0 V150 C930 160 880 110 820 120 C760 130 720 70 760 30 C780 10 770 0 770 0Z" fill="${C.land}"/>
      <path d="M0 520 V350 C60 330 110 380 170 370 C240 360 280 420 260 470 C250 500 280 520 280 520Z" fill="${C.land}"/>
      <path d="M1000 520 H700 C730 480 720 440 790 430 C850 420 870 360 930 360 C960 360 980 380 1000 370Z" fill="${C.land}"/>
      ${A.ripple(420, 90, 1.2)}${A.ripple(640, 420, 1.1)}${A.ripple(330, 300, 1)}${A.ripple(760, 250, 1)}
      ${A.lily(360, 430, 1.1)}${A.lily(830, 200, .9)}${A.lily(150, 250, .8)}
      ${A.tulip(40, 80, 1.1)}${A.tulip(72, 92, .9, C.yellow)}${A.tulip(104, 84, 1)}${A.grass(140, 80, 1)}${A.tree(260, 50, .7)}
      ${A.pine(900, 120, .9)}${A.pine(950, 135, .7)}${A.sun(960, 40, .7)}${A.cloud(690, 50, 1)}
      ${A.cactus(60, 470, 1.1)}${A.dune(150, 520, 1)}${A.saxaul(210, 500, .9)}
      ${A.tree(880, 470, 1.2, C.leafD)}${A.bush(760, 480, 1.1, C.pink)}${A.tulip(980, 510, 1, C.purple)}${A.sprout(700, 500, 1.2)}
      ${A.reeds(560, 500, 1.1)}${A.bee(560, 130, 1.1)}${A.butterfly(300, 180, 1)}${A.ladybug(200, 420, 1)}${A.magnifier(120, 330, 1.1)}
    </svg>`;
  };

  /* Маскот: Өскін */
  A.mascot = (s) => `<svg viewBox="-40 -80 80 90" width="${s || 60}" aria-hidden="true"><ellipse cx="0" cy="0" rx="26" ry="10" fill="${C.brown}"/><path d="M-20 -2 C-22 -30 22 -30 20 -2Z" fill="${C.brick}"/>
    <path d="M0 -24 C0 -36 0 -44 0 -52" stroke="${C.leafD}" stroke-width="5" stroke-linecap="round"/><path d="M0 -48 C-8 -66 -30 -68 -36 -60 C-28 -46 -10 -44 0 -48Z" fill="${C.leaf}"/><path d="M0 -52 C8 -72 32 -74 38 -64 C30 -50 10 -48 0 -52Z" fill="${C.leafL}"/>
    <circle cx="-7" cy="-14" r="2.6" fill="${C.ink}"/><circle cx="7" cy="-14" r="2.6" fill="${C.ink}"/><path d="M-5 -8 Q0 -4 5 -8" stroke="${C.ink}" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;

  window.ART = A;
})();
