/* Original vector art for 별이 내리는 밤, 너와
   Every illustration is hand-built SVG — no external image assets. */
(() => {
  'use strict';

  const rng = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  const stars = (count, maxY, seed, opacity = 1) => {
    const r = rng(seed);
    let out = '';
    for (let i = 0; i < count; i++) {
      const x = (r() * 1600).toFixed(1);
      const y = (r() * maxY).toFixed(1);
      const radius = (0.6 + r() * 1.9).toFixed(2);
      const o = (0.25 + r() * 0.75) * opacity;
      const delay = (r() * 7).toFixed(2);
      out += `<circle cx="${x}" cy="${y}" r="${radius}" fill="#fff8e8" opacity="${o.toFixed(2)}" class="twinkle" style="animation-delay:-${delay}s"/>`;
    }
    return out;
  };

  const city = (baseY, seed, color, windowColor, opacity = 1) => {
    const r = rng(seed);
    let out = '';
    let x = -30;
    while (x < 1630) {
      const w = 34 + r() * 94;
      const h = 55 + r() * 250;
      const y = baseY - h;
      out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${(h + 60).toFixed(1)}" fill="${color}" opacity="${opacity}"/>`;
      const cols = Math.max(1, Math.floor(w / 19));
      const rows = Math.max(2, Math.floor(h / 27));
      for (let c = 0; c < cols; c++) {
        for (let row = 0; row < rows; row++) {
          if (r() > 0.73) {
            const ww = 3.5;
            const wh = 4.8;
            out += `<rect x="${(x + 9 + c * 17).toFixed(1)}" y="${(y + 14 + row * 23).toFixed(1)}" width="${ww}" height="${wh}" rx="1" fill="${windowColor}" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`;
          }
        }
      }
      x += w + 5 + r() * 16;
    }
    return out;
  };

  const bokeh = (count, seed, colors = ['#ffcf8e', '#f6a6b8', '#9ed7ff']) => {
    const r = rng(seed);
    let out = '';
    for (let i = 0; i < count; i++) {
      const c = colors[Math.floor(r() * colors.length)];
      out += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(250 + r() * 600).toFixed(0)}" r="${(2 + r() * 9).toFixed(1)}" fill="${c}" opacity="${(0.04 + r() * 0.16).toFixed(2)}" filter="url(#soft)"/>`;
    }
    return out;
  };

  const bgDefs = `
    <defs>
      <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#070b1d"/><stop offset=".55" stop-color="#111a38"/><stop offset="1" stop-color="#262447"/>
      </linearGradient>
      <linearGradient id="duskSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#17112e"/><stop offset=".55" stop-color="#543052"/><stop offset="1" stop-color="#c47877"/>
      </linearGradient>
      <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#283356"/><stop offset=".45" stop-color="#8b6d8f"/><stop offset=".78" stop-color="#e9a99b"/><stop offset="1" stop-color="#ffe0b4"/>
      </linearGradient>
      <radialGradient id="moonGlow"><stop offset="0" stop-color="#fff5d8" stop-opacity=".9"/><stop offset="1" stop-color="#fff5d8" stop-opacity="0"/></radialGradient>
      <linearGradient id="warmWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c2728"/><stop offset="1" stop-color="#1e1618"/></linearGradient>
      <radialGradient id="lampLight"><stop offset="0" stop-color="#ffd59a" stop-opacity=".85"/><stop offset=".55" stop-color="#ffb36b" stop-opacity=".18"/><stop offset="1" stop-color="#ffb36b" stop-opacity="0"/></radialGradient>
      <linearGradient id="windowNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101733"/><stop offset="1" stop-color="#24375b"/></linearGradient>
      <linearGradient id="river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bf7f7c"/><stop offset=".4" stop-color="#5e4168"/><stop offset="1" stop-color="#14142e"/></linearGradient>
      <radialGradient id="fireGlow"><stop offset="0" stop-color="#fff2c8" stop-opacity=".9"/><stop offset=".6" stop-color="#ffb17a" stop-opacity=".3"/><stop offset="1" stop-color="#ff7c87" stop-opacity="0"/></radialGradient>
      <filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
      <filter id="soft2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="36"/></filter>
      <filter id="tinyBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
      <pattern id="rainPattern" width="110" height="140" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
        <line x1="0" y1="0" x2="0" y2="26" stroke="#cfe6ff" stroke-width="1.2" opacity=".18"/>
        <line x1="46" y1="62" x2="46" y2="92" stroke="#cfe6ff" stroke-width="1" opacity=".13"/>
        <line x1="86" y1="20" x2="86" y2="38" stroke="#cfe6ff" stroke-width=".9" opacity=".12"/>
      </pattern>
    </defs>`;

  const wrap = (inner, extra = '') => `<svg class="bg-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${bgDefs}${inner}${extra}</svg>`;

  const backgrounds = {
    'rain-street': () => wrap(`
      <rect width="1600" height="900" fill="url(#nightSky)"/>
      ${stars(46, 340, 91, .55)}
      <circle cx="1215" cy="160" r="170" fill="url(#moonGlow)" opacity=".5"/>
      <circle cx="1215" cy="160" r="51" fill="#fff2cf" opacity=".82" filter="url(#tinyBlur)"/>
      <ellipse cx="1222" cy="152" rx="34" ry="20" fill="#e8d9c0" opacity=".25" filter="url(#soft)"/>
      <g opacity=".6">${city(570, 22, '#0b1128', '#ffc684', .9)}</g>
      <g opacity=".8">${city(650, 79, '#070b1b', '#ffd39a', .95)}</g>
      <rect y="620" width="1600" height="280" fill="#080b18"/>
      <path d="M0 900 L430 620 L1170 620 L1600 900 Z" fill="#0d1225"/>
      <path d="M710 900 L788 620 L812 620 L890 900 Z" fill="#131a31" opacity=".8"/>
      <g opacity=".35" stroke="#ffd6a0" stroke-width="3">
        <line x1="546" y1="900" x2="760" y2="630"/><line x1="1054" y1="900" x2="840" y2="630"/>
      </g>
      <rect x="300" y="428" width="9" height="292" rx="4" fill="#080c18"/>
      <path d="M304 432 h66" stroke="#080c18" stroke-width="9" stroke-linecap="round"/>
      <circle cx="371" cy="437" r="17" fill="#ffe4b0"/>
      <circle cx="371" cy="437" r="60" fill="url(#lampLight)" opacity=".75"/>
      <path d="M330 900 L345 470 L398 470 L414 900 Z" fill="#ffd9a1" opacity=".07" filter="url(#soft)"/>
      <rect x="1320" y="470" width="7" height="250" fill="#070b15"/>
      <circle cx="1323" cy="466" r="11" fill="#ffcf94"/>
      <circle cx="1323" cy="466" r="42" fill="url(#lampLight)" opacity=".65"/>
      ${bokeh(34, 771, ['#ffca8d', '#a8d6ff', '#ff9fb1'])}
      ${stars(100, 900, 33, .7).replaceAll('fill="#fff8e8"', 'fill="#bcd9ff"')}
      <rect width="1600" height="900" fill="url(#rainPattern)"/>
    `),

    cafe: () => wrap(`
      <rect width="1600" height="900" fill="#171014"/>
      <rect width="1600" height="900" fill="url(#warmWall)" opacity=".9"/>
      <g opacity=".55" stroke="#7a5143" stroke-width="2">
        <path d="M0 200 H1600 M0 420 H1600 M0 640 H1600"/>
        <path d="M260 0 V900 M620 0 V900 M980 0 V900 M1340 0 V900"/>
      </g>
      <rect x="70" y="88" width="590" height="520" rx="14" fill="url(#windowNight)" stroke="#2a1b1b" stroke-width="18"/>
      <g transform="translate(70 88) scale(.39)" opacity=".85">
        ${city(620, 42, '#0a1024', '#ffc77c', 1)}
      </g>
      <rect x="70" y="88" width="590" height="520" rx="14" fill="none" stroke="#3d2a27" stroke-width="13"/>
      <path d="M365 88 V608 M70 348 H660" stroke="#3d2a27" stroke-width="10"/>
      <g opacity=".55">
        <circle cx="150" cy="160" r="1.5" fill="#fff"/><circle cx="430" cy="230" r="1" fill="#fff"/><circle cx="560" cy="140" r="1.2" fill="#fff"/>
      </g>
      <circle cx="205" cy="190" r="110" fill="#ffc47d" opacity=".12" filter="url(#soft2)"/>
      <circle cx="510" cy="510" r="120" fill="#ff9aa4" opacity=".08" filter="url(#soft2)"/>
      <g>
        <path d="M775 0 V188" stroke="#1b1214" stroke-width="5"/>
        <path d="M728 206 Q775 168 822 206 L804 246 H746 Z" fill="#2b1d1d"/>
        <ellipse cx="775" cy="224" rx="32" ry="20" fill="#ffd49b" opacity=".9"/>
        <circle cx="775" cy="248" r="116" fill="url(#lampLight)" opacity=".55"/>
      </g>
      <g>
        <path d="M1208 0 V116" stroke="#1b1214" stroke-width="4"/>
        <path d="M1174 130 Q1208 102 1242 130 L1230 158 H1186 Z" fill="#2b1d1d"/>
        <ellipse cx="1208" cy="140" rx="21" ry="13" fill="#ffd49b" opacity=".9"/>
        <circle cx="1208" cy="164" r="82" fill="url(#lampLight)" opacity=".45"/>
      </g>
      <g stroke="#2c1c1b" stroke-width="11" fill="none">
        <path d="M1090 520 H1510"/><path d="M1102 690 H1510"/><path d="M1116 860 H1510"/>
      </g>
      <g opacity=".95">
        <rect x="1095" y="300" width="400" height="12" rx="4" fill="#4a302b"/>
        <rect x="1120" y="230" width="24" height="70" rx="4" fill="#8a5b48"/>
        <rect x="1156" y="205" width="20" height="95" rx="4" fill="#b1785f"/>
        <rect x="1188" y="242" width="31" height="58" rx="5" fill="#6c4a3e"/>
        <path d="M1250 312 q-25 -65 9 -92 q38 26 13 92 Z" fill="#48644d"/>
        <path d="M1272 312 q-4 -50 25 -70 q23 24 9 70 Z" fill="#5b7b5d"/>
        <rect x="1254" y="312" width="55" height="38" rx="5" fill="#8b5c49"/>
        <circle cx="1430" cy="260" r="34" fill="#e4bd83" opacity=".18"/>
        <path d="M1410 300 h42 l-7 45 h-28 Z" fill="#d8a66a" opacity=".6"/>
      </g>
      <path d="M0 900 V690 Q260 640 470 690 T920 676 T1380 700 L1600 684 V900 Z" fill="#201518"/>
      <path d="M0 748 Q250 706 520 748 T1040 738 T1600 754 V900 H0 Z" fill="#2a1b1d"/>
      <rect x="0" y="842" width="1600" height="58" fill="#150e10"/>
      <g>
        <ellipse cx="940" cy="790" rx="155" ry="30" fill="#140d0f"/>
        <path d="M785 790 h310 l-32 -24 h-246 Z" fill="#3a2624"/>
        <path d="M852 754 h180 l-14 -16 h-152 Z" fill="#e8d8c8" opacity=".9"/>
        <ellipse cx="942" cy="744" rx="94" ry="15" fill="#fff0dc" opacity=".2"/>
        <g class="steam">
          <path d="M925 730 q-18 -26 2 -49 q20 -22 5 -44" stroke="#ffe3c1" stroke-width="3" fill="none" opacity=".35"/>
          <path d="M958 732 q-14 -24 3 -43 q17 -18 4 -36" stroke="#ffe3c1" stroke-width="2.5" fill="none" opacity=".25"/>
        </g>
      </g>
      ${bokeh(22, 133, ['#ffc47d', '#ffab8c', '#ffe4ba'])}
      <rect width="1600" height="900" fill="#1c0f13" opacity=".16"/>
    `),

    rooftop: () => wrap(`
      <rect width="1600" height="900" fill="url(#nightSky)"/>
      ${stars(170, 610, 81, 1)}
      <circle cx="1208" cy="188" r="260" fill="url(#moonGlow)" opacity=".62"/>
      <circle cx="1208" cy="188" r="83" fill="#fff4d5" opacity=".92"/>
      <circle cx="1184" cy="168" r="16" fill="#e8d6b2" opacity=".3"/>
      <circle cx="1231" cy="208" r="11" fill="#e8d6b2" opacity=".22"/>
      <path d="M0 560 Q270 510 520 552 T1040 540 T1600 566 V660 H0 Z" fill="#171b36" opacity=".85"/>
      <g opacity=".8">${city(690, 55, '#0a0e20', '#ffcf8c', .95)}</g>
      <g opacity=".95">${city(770, 18, '#050813', '#ffc477', 1)}</g>
      <rect y="760" width="1600" height="140" fill="#050711"/>
      <g opacity=".9">
        <path d="M0 530 V610" stroke="#14182c" stroke-width="3"/>
        <g stroke="#161a30" stroke-width="4">
          <path d="M0 556 H1600"/><path d="M0 610 H1600"/>
          <path d="M90 530 V660 M240 530 V660 M390 530 V660 M540 530 V660 M690 530 V660 M840 530 V660 M990 530 V660 M1140 530 V660 M1290 530 V660 M1440 530 V660"/>
        </g>
      </g>
      <path d="M0 900 V820 Q162 790 318 822 T630 816 T942 826 T1254 814 T1600 828 V900 Z" fill="#0a0c19"/>
      <g class="string-lights" opacity=".95">
        <path d="M0 160 Q200 240 400 180 T800 190 T1200 175 T1600 220" fill="none" stroke="#2a2230" stroke-width="2"/>
        <circle cx="120" cy="204" r="4" fill="#ffd9a0"/><circle cx="240" cy="222" r="4" fill="#ffc4b0"/><circle cx="380" cy="188" r="4" fill="#ffe6b8"/>
        <circle cx="540" cy="194" r="4" fill="#ffc4b0"/><circle cx="700" cy="186" r="4" fill="#ffd9a0"/><circle cx="860" cy="188" r="4" fill="#ffe6b8"/>
        <circle cx="1020" cy="180" r="4" fill="#ffc4b0"/><circle cx="1180" cy="178" r="4" fill="#ffd9a0"/><circle cx="1340" cy="190" r="4" fill="#ffe6b8"/>
        <circle cx="1490" cy="212" r="4" fill="#ffc4b0"/>
      </g>
      <g filter="url(#soft)" opacity=".3">
        <circle cx="120" cy="204" r="12" fill="#ffd9a0"/><circle cx="380" cy="188" r="12" fill="#ffe6b8"/>
        <circle cx="700" cy="186" r="12" fill="#ffd9a0"/><circle cx="1020" cy="180" r="12" fill="#ffc4b0"/><circle cx="1340" cy="190" r="12" fill="#ffe6b8"/>
      </g>
      <path d="M300 430 q10 -100 80 -120 q-8 90 -14 120 Z" fill="#14182c" opacity=".9"/>
      <path d="M1250 470 q-8 -110 -74 -142 q4 100 16 142 Z" fill="#14182c" opacity=".75"/>
    `),

    planetarium: () => wrap(`
      <rect width="1600" height="900" fill="#05060f"/>
      <circle cx="800" cy="320" r="560" fill="#0a1230" opacity=".9"/>
      <circle cx="800" cy="320" r="560" fill="url(#moonGlow)" opacity=".055"/>
      <g opacity=".75">
        <ellipse cx="800" cy="340" rx="640" ry="420" fill="none" stroke="#1e2c56" stroke-width="2"/>
        <ellipse cx="800" cy="340" rx="520" ry="340" fill="none" stroke="#1b274c" stroke-width="1.6"/>
        <ellipse cx="800" cy="340" rx="380" ry="250" fill="none" stroke="#172141" stroke-width="1.4"/>
        <path d="M240 340 H1360 M800 0 V760" stroke="#1b274c" stroke-width="1.4"/>
      </g>
      ${stars(230, 700, 144, 1)}
      <g stroke="#8fb6ff" stroke-width="1.1" opacity=".38" fill="none">
        <path d="M462 252 L568 202 L674 244 L702 330 L590 352 Z"/>
        <path d="M980 190 L1072 236 L1148 198 L1204 268 L1092 300 Z"/>
        <path d="M746 420 L820 456 L884 428 L940 486"/>
      </g>
      <g fill="#dfeaff">
        <circle cx="462" cy="252" r="3"/><circle cx="568" cy="202" r="3.6"/><circle cx="674" cy="244" r="2.6"/>
        <circle cx="702" cy="330" r="3"/><circle cx="590" cy="352" r="2.6"/>
        <circle cx="980" cy="190" r="2.8"/><circle cx="1072" cy="236" r="3.4"/><circle cx="1148" cy="198" r="2.6"/>
        <circle cx="1204" cy="268" r="3"/><circle cx="1092" cy="300" r="2.6"/>
        <circle cx="746" cy="420" r="2.4"/><circle cx="820" cy="456" r="3"/><circle cx="884" cy="428" r="2.4"/><circle cx="940" cy="486" r="2.6"/>
      </g>
      <circle cx="568" cy="202" r="22" fill="#9bc0ff" opacity=".22" filter="url(#soft)"/>
      <circle cx="1072" cy="236" r="26" fill="#ffc9d8" opacity=".16" filter="url(#soft)"/>
      <path d="M0 760 Q800 640 1600 760 V900 H0 Z" fill="#06070f"/>
      <g fill="#0b0c18">
        <path d="M270 760 q70 -110 168 -92 q88 16 110 104 Z"/>
        <path d="M1080 770 q30 -105 130 -105 q102 0 144 105 Z"/>
        <path d="M580 800 q60 -92 148 -78 q80 14 96 90 Z"/>
      </g>
      <g opacity=".5" fill="#1a1d32">
        <circle cx="360" cy="690" r="34"/><circle cx="1210" cy="700" r="38"/><circle cx="665" cy="742" r="30"/>
      </g>
      <rect width="1600" height="900" fill="#04050c" opacity=".08"/>
    `),

    festival: () => wrap(`
      <rect width="1600" height="900" fill="url(#duskSky)"/>
      ${stars(90, 430, 203, .75)}
      <circle cx="430" cy="235" r="230" fill="url(#fireGlow)" opacity=".22"/>
      <circle cx="1130" cy="210" r="280" fill="url(#fireGlow)" opacity=".16"/>
      <g class="fireworks" fill="none" stroke-linecap="round">
        <g stroke="#ffd7a8" stroke-width="2.4" opacity=".9">
          <path d="M430 235 l0 -118 M430 235 l84 -84 M430 235 l118 0 M430 235 l84 84 M430 235 l0 118 M430 235 l-84 84 M430 235 l-118 0 M430 235 l-84 -84"/>
          <path d="M430 235 l59 -107 M430 235 l107 -59 M430 235 l107 59 M430 235 l59 107 M430 235 l-59 107 M430 235 l-107 59 M430 235 l-107 -59 M430 235 l-59 -107" opacity=".55"/>
        </g>
        <g stroke="#ffb7cb" stroke-width="2" opacity=".8">
          <path d="M1130 210 l0 -92 M1130 210 l65 -65 M1130 210 l92 0 M1130 210 l65 65 M1130 210 l0 92 M1130 210 l-65 65 M1130 210 l-92 0 M1130 210 l-65 -65"/>
        </g>
        <g stroke="#c7dcff" stroke-width="1.6" opacity=".55">
          <path d="M780 145 l0 -56 M780 145 l40 -40 M780 145 l56 0 M780 145 l40 40 M780 145 l0 56 M780 145 l-40 40 M780 145 l-56 0 M780 145 l-40 -40"/>
        </g>
      </g>
      <g opacity=".65">${city(560, 511, '#241a32', '#ffc47d', .85)}</g>
      <rect y="560" width="1600" height="340" fill="url(#river)"/>
      <g opacity=".5">
        <ellipse cx="430" cy="650" rx="28" ry="5" fill="#ffe2af"/><ellipse cx="1130" cy="690" rx="24" ry="4" fill="#ffbfd0"/>
        <ellipse cx="780" cy="620" rx="18" ry="3" fill="#dce9ff"/><ellipse cx="430" cy="740" rx="40" ry="4" fill="#ffcf97" opacity=".5"/>
        <ellipse cx="1130" cy="790" rx="35" ry="4" fill="#ffbfd0" opacity=".4"/>
      </g>
      <path d="M0 690 Q260 640 520 690 T1040 676 T1600 694 V900 H0 Z" fill="#1b1426"/>
      <path d="M0 900 V800 Q300 742 620 800 T1240 790 T1600 806 V900 Z" fill="#120e1a"/>
      <g>
        <g class="lantern"><rect x="160" y="380" width="28" height="38" rx="8" fill="#ffb36b"/><rect x="166" y="366" width="16" height="10" rx="3" fill="#8c4c3e"/><path d="M174 418 v18" stroke="#ffbd74" stroke-width="2"/></g>
        <g class="lantern delay"><rect x="1380" y="300" width="26" height="36" rx="8" fill="#ff9fb5"/><rect x="1386" y="286" width="14" height="10" rx="3" fill="#8c4c3e"/><path d="M1393 336 v18" stroke="#ffb0c2" stroke-width="2"/></g>
        <g class="lantern delay2"><rect x="930" y="330" width="22" height="30" rx="7" fill="#ffd38b"/><rect x="936" y="318" width="12" height="9" rx="3" fill="#8c4c3e"/></g>
        <circle cx="174" cy="398" r="58" fill="url(#fireGlow)" opacity=".3"/>
        <circle cx="1393" cy="318" r="52" fill="url(#fireGlow)" opacity=".24"/>
      </g>
      <g fill="#0e0a15">
        <path d="M210 900 q-18 -180 26 -220 q46 34 50 220 Z"/>
        <path d="M1290 900 q-10 -170 30 -208 q44 28 48 208 Z"/>
        <path d="M1010 900 q-8 -130 24 -158 q36 22 38 158 Z" opacity=".85"/>
        <path d="M540 900 q-6 -118 20 -142 q30 18 34 142 Z" opacity=".8"/>
      </g>
      ${bokeh(26, 902, ['#ffb36b', '#ff9fb5', '#ffe2af'])}
    `),

    dawn: () => wrap(`
      <rect width="1600" height="900" fill="url(#dawnSky)"/>
      <circle cx="1130" cy="590" r="120" fill="#fff0c6" opacity=".95" filter="url(#soft)"/>
      <circle cx="1130" cy="590" r="54" fill="#fff6da"/>
      <g opacity=".4">${stars(40, 300, 412, .6)}</g>
      <g opacity=".7">${city(600, 188, '#6c5474', '#ffd59b', .55)}</g>
      <rect y="600" width="1600" height="300" fill="#9b7b8b" opacity=".4"/>
      <path d="M0 900 V640 Q330 600 660 646 T1320 634 T1600 650 V900 Z" fill="#5f4a67" opacity=".65"/>
      <g stroke="#ffe6c2" stroke-width="2" opacity=".25">
        <path d="M1040 660 h180 M1120 690 h140 M1060 720 h160"/>
      </g>
      <g fill="none" stroke="#3d3048" stroke-width="4" opacity=".5">
        <path d="M300 250 q14 -16 28 0 q14 -16 28 0"/>
        <path d="M380 205 q10 -12 20 0 q10 -12 20 0"/>
      </g>
      <path d="M0 900 V810 Q400 740 800 810 T1600 800 V900 Z" fill="#41344f" opacity=".65"/>
    `),

    studio: () => wrap(`
      <rect width="1600" height="900" fill="#19131c"/>
      <rect width="1600" height="900" fill="url(#warmWall)" opacity=".55"/>
      <rect x="120" y="80" width="640" height="520" rx="10" fill="url(#windowNight)" stroke="#34262c" stroke-width="14"/>
      <g transform="translate(120 80) scale(.42)" opacity=".7">${city(600, 66, '#0b1024', '#ffc77c', 1)}</g>
      <rect x="120" y="80" width="640" height="520" rx="10" fill="none" stroke="#3b2a30" stroke-width="10"/>
      <path d="M440 80 V600 M120 340 H760" stroke="#3b2a30" stroke-width="8"/>
      <g>
        <rect x="980" y="180" width="440" height="330" rx="8" fill="#22181d" stroke="#4a3433" stroke-width="6"/>
        <rect x="1010" y="210" width="380" height="270" rx="4" fill="#e9dccb"/>
        <path d="M1050 430 q60 -90 120 -30 q50 -80 100 -10 q40 -50 80 10" fill="none" stroke="#b48a72" stroke-width="3" opacity=".55"/>
        <circle cx="1140" cy="290" r="14" fill="#d9a759" opacity=".6"/>
        <circle cx="1250" cy="330" r="10" fill="#d9a759" opacity=".5"/>
      </g>
      <g stroke="#3a292c" stroke-width="10" fill="none"><path d="M980 560 H1470"/><path d="M1010 720 H1470"/></g>
      <g>
        <rect x="1010" y="350" width="16" height="200" rx="3" fill="#8f5d4a"/>
        <rect x="1035" y="320" width="14" height="230" rx="3" fill="#b57c62"/>
        <rect x="1060" y="370" width="18" height="180" rx="3" fill="#6b4d40"/>
        <path d="M1280 560 q-20 -70 10 -92 q34 28 12 92 Z" fill="#425c48"/>
      </g>
      <path d="M0 900 V760 Q330 720 660 762 T1320 750 T1600 768 V900 Z" fill="#241a1e"/>
      <path d="M0 840 Q380 790 760 840 T1600 832 V900 H0 Z" fill="#1a1215"/>
      ${bokeh(18, 611, ['#ffc47d', '#ffab8c'])}
    `)
  };

  /* ------------------------------------------------------------------ */
  /* Portrait                                                            */
  /* ------------------------------------------------------------------ */

  const eyePathL = 'M242 261 C245 248 259 240 276 240 C290 240 301 247 305 255 C299 269 282 277 265 274 C253 272 245 267 242 261 Z';
  const eyePathR = 'M398 261 C395 248 381 240 364 240 C350 240 339 247 335 255 C341 269 358 277 375 274 C387 272 395 267 398 261 Z';

  const eyeOpen = (mirror = false) => {
    if (!mirror) {
      return `
        <g class="eye eye-left">
          <path d="${eyePathL}" fill="#fffaf6"/>
          <g clip-path="url(#eyeClipL)">
            <circle cx="274" cy="257" r="15" fill="url(#irisGrad)"/>
            <circle cx="274" cy="258" r="7.1" fill="#2b1620"/>
            <circle cx="274" cy="258" r="3.4" fill="#0c0710"/>
            <circle cx="280" cy="251" r="4.5" fill="#fff" opacity=".95"/>
            <circle cx="267" cy="263" r="2.2" fill="#ffe6d9" opacity=".7"/>
            <path d="M236 234 h76 v52 h-76 z" fill="#ffe3d6" class="eyelid lid-left"/>
            <path d="M240 259 C244 246 259 237 276 237 C290 237 301 244 306 253" fill="none" stroke="#4a2633" stroke-width="4.4" stroke-linecap="round"/>
          </g>
          <path d="M240 259 C244 246 259 237 276 237 C290 237 301 244 306 253" fill="none" stroke="#42222e" stroke-width="4.8" stroke-linecap="round"/>
          <path d="M243 253 L232 245" stroke="#42222e" stroke-width="3" stroke-linecap="round"/>
          <path d="M305 252 L312 246" stroke="#42222e" stroke-width="1.9" stroke-linecap="round" opacity=".8"/>
          <path d="M248 246 C260 239 276 236 290 241" fill="none" stroke="#d9a196" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>
          <path d="M253 268 C265 275 282 276 295 269" fill="none" stroke="#8a5a63" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
          <path d="M270 271 C281 274 291 272 298 266" fill="none" stroke="#dfa196" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>
          <path d="M291 239 C294 234 301 234 304 239" fill="none" stroke="#fff6ed" stroke-width="1.7" stroke-linecap="round" opacity=".8"/>
        </g>`;
    }
    return `
      <g class="eye eye-right">
        <path d="${eyePathR}" fill="#fffaf6"/>
        <g clip-path="url(#eyeClipR)">
          <circle cx="366" cy="257" r="15" fill="url(#irisGrad)"/>
          <circle cx="366" cy="258" r="7.1" fill="#2b1620"/>
          <circle cx="366" cy="258" r="3.4" fill="#0c0710"/>
          <circle cx="372" cy="251" r="4.5" fill="#fff" opacity=".95"/>
          <circle cx="359" cy="263" r="2.2" fill="#ffe6d9" opacity=".7"/>
          <path d="M328 234 h76 v52 h-76 z" fill="#ffe3d6" class="eyelid lid-right"/>
          <path d="M400 259 C396 246 381 237 364 237 C350 237 339 244 334 253" fill="none" stroke="#4a2633" stroke-width="4.4" stroke-linecap="round"/>
        </g>
        <path d="M400 259 C396 246 381 237 364 237 C350 237 339 244 334 253" fill="none" stroke="#42222e" stroke-width="4.8" stroke-linecap="round"/>
        <path d="M397 253 L408 245" stroke="#42222e" stroke-width="3" stroke-linecap="round"/>
        <path d="M335 252 L328 246" stroke="#42222e" stroke-width="1.9" stroke-linecap="round" opacity=".8"/>
        <path d="M392 246 C380 239 364 236 350 241" fill="none" stroke="#d9a196" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>
        <path d="M387 268 C375 275 358 276 345 269" fill="none" stroke="#8a5a63" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
        <path d="M370 271 C359 274 349 272 342 266" fill="none" stroke="#dfa196" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>
        <path d="M349 239 C346 234 339 234 336 239" fill="none" stroke="#fff6ed" stroke-width="1.7" stroke-linecap="round" opacity=".8"/>
      </g>`;
  };

  const brow = (side, variant = 'soft') => {
    const d = side === 'left'
      ? { soft: 'M304 224 C295 220 283 218 271 218 C261 218 253 220 248 223',
          sad: 'M303 222 C294 219 283 218 272 219 C262 220 255 222 250 225',
          up: 'M305 217 C296 211 283 208 270 208 C260 208 252 211 247 216' }
      : { soft: 'M336 224 C345 220 357 218 369 218 C379 218 387 220 392 223',
          sad: 'M337 222 C346 219 357 218 368 219 C378 220 385 222 390 225',
          up: 'M335 217 C344 211 357 208 370 208 C380 208 388 211 393 216' };
    return `<path d="${d[variant]}" fill="none" stroke="#a17d88" stroke-width="2.3" stroke-linecap="round" opacity=".58"/>`;
  };

  const mouth = (variant = 'soft') => {
    if (variant === 'open') {
      return `<path d="M304 333 Q320 327 336 333 Q334 355 320 358 Q306 355 304 333 Z" fill="#b45867"/>
        <path d="M308 343 Q320 350 332 343 Q328 353 320 355 Q312 353 308 343 Z" fill="#8d3d4f" opacity=".8"/>
        <path d="M304 333 Q320 327 336 333" fill="none" stroke="#a24655" stroke-width="2.2" stroke-linecap="round"/>`;
    }
    if (variant === 'small') {
      return `<path d="M309 337 Q320 344 331 337" fill="none" stroke="#b75f6b" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M312 339 Q320 347 328 339 Q325 349 320 349 Q315 349 312 339 Z" fill="url(#lipGrad)" opacity=".92"/>
        <path d="M309 336 Q320 340 331 336" fill="none" stroke="#c97680" stroke-width="1.5" stroke-linecap="round" opacity=".55"/>`;
    }
    if (variant === 'oh') {
      return `<ellipse cx="320" cy="343" rx="8.6" ry="11.2" fill="#b45867"/><ellipse cx="320" cy="347" rx="5.6" ry="6.6" fill="#8d3d4f"/>`;
    }
    if (variant === 'frown') {
      return `<path d="M306 347 Q320 336 334 347" fill="none" stroke="#b75f6b" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M312 345 Q320 340 328 345 Q325 352 320 352 Q315 352 312 345 Z" fill="url(#lipGrad)" opacity=".7"/>`;
    }
    if (variant === 'wide') {
      return `<path d="M300 334 Q320 325 340 334 Q334 352 320 353 Q306 352 300 334 Z" fill="url(#lipGrad)"/>
        <path d="M299 333 Q320 325 341 333" fill="none" stroke="#a24655" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M311 340 Q320 344 329 340" fill="none" stroke="#fff1e8" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
        <path d="M298 330 Q302 326 307 326" fill="none" stroke="#c97680" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>
        <path d="M342 330 Q338 326 333 326" fill="none" stroke="#c97680" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>`;
    }
    if (variant === 'laugh') {
      return `<path d="M300 331 Q320 324 340 331 Q337 358 320 361 Q303 358 300 331 Z" fill="url(#lipGrad)"/>
        <path d="M305 343 Q320 352 335 343 Q331 357 320 359 Q309 357 305 343 Z" fill="#8c3f51" opacity=".8"/>
        <path d="M309 345 Q320 350 331 345" fill="none" stroke="#fff1e8" stroke-width="3.2" stroke-linecap="round" opacity=".9"/>`;
    }
    return `<path d="M302 335 Q320 327 338 335 Q332 351 320 352 Q308 351 302 335 Z" fill="url(#lipGrad)"/>
      <path d="M301 334 Q320 327 339 334" fill="none" stroke="#a24655" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M312 340 Q320 344 328 340" fill="none" stroke="#fff1e8" stroke-width="1.3" stroke-linecap="round" opacity=".45"/>`;
  };

  const closedEye = (side) => side === 'left'
    ? `<path d="M241 265 Q274 246 306 263" fill="none" stroke="#42222e" stroke-width="4.4" stroke-linecap="round"/>
       <path d="M243 258 l-7 -7" stroke="#42222e" stroke-width="2.4" stroke-linecap="round"/>`
    : `<path d="M399 265 Q366 246 334 263" fill="none" stroke="#42222e" stroke-width="4.4" stroke-linecap="round"/>
       <path d="M397 258 l7 -7" stroke="#42222e" stroke-width="2.4" stroke-linecap="round"/>`;

  const shyEye = (side) => side === 'left'
    ? `<path d="M241 261 C245 249 259 241 275 241 C289 241 300 247 304 255 C298 271 281 279 264 276 C252 274 244 268 241 261 Z" fill="#fffaf6"/>
       <circle cx="274" cy="260" r="14" fill="url(#irisGrad)"/><circle cx="274" cy="261" r="7" fill="#2b1620"/><circle cx="280" cy="254" r="4" fill="#fff" opacity=".92"/>
       <path d="M238 250 C246 240 262 235 278 236 C290 237 299 242 303 249 L303 255 C294 248 283 245 271 245 C259 245 247 250 239 257 Z" fill="#f6cabb"/>
       <path d="M239 251 C247 241 262 236 278 237 C290 238 299 243 303 250" fill="none" stroke="#42222e" stroke-width="4.4" stroke-linecap="round"/>
       <path d="M241 246 l-7 -7" stroke="#42222e" stroke-width="2.3" stroke-linecap="round"/>
       <path d="M253 268 C265 274 281 275 294 269" fill="none" stroke="#8a5a63" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>`
    : `<path d="M399 261 C395 249 381 241 365 241 C351 241 340 247 336 255 C342 271 359 279 376 276 C388 274 396 268 399 261 Z" fill="#fffaf6"/>
       <circle cx="366" cy="260" r="14" fill="url(#irisGrad)"/><circle cx="366" cy="261" r="7" fill="#2b1620"/><circle cx="372" cy="254" r="4" fill="#fff" opacity=".92"/>
       <path d="M402 250 C394 240 378 235 362 236 C350 237 341 242 337 249 L337 255 C346 248 357 245 369 245 C381 245 393 250 401 257 Z" fill="#f6cabb"/>
       <path d="M401 251 C393 241 378 236 362 237 C350 238 341 243 337 250" fill="none" stroke="#42222e" stroke-width="4.4" stroke-linecap="round"/>
       <path d="M399 246 l7 -7" stroke="#42222e" stroke-width="2.3" stroke-linecap="round"/>
       <path d="M387 268 C375 274 359 275 346 269" fill="none" stroke="#8a5a63" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>`;

  const wideEye = (side) => side === 'left'
    ? `<path d="M238 261 C240 240 257 225 276 226 C292 227 304 237 308 251 C300 273 281 284 261 280 C248 277 240 270 238 261 Z" fill="#fffaf6"/>
       <circle cx="274" cy="252" r="17" fill="url(#irisGrad)"/><circle cx="274" cy="253" r="8" fill="#2b1620"/><circle cx="274" cy="253" r="3.8" fill="#0c0710"/><circle cx="281" cy="245" r="5" fill="#fff" opacity=".96"/><circle cx="266" cy="259" r="2.4" fill="#ffe6d9" opacity=".7"/>
       <path d="M235 259 C238 237 256 221 276 222 C292 223 304 234 309 249" fill="none" stroke="#42222e" stroke-width="4.8" stroke-linecap="round"/>
       <path d="M239 252 L229 244" stroke="#42222e" stroke-width="3" stroke-linecap="round"/>
       <path d="M251 271 C264 278 282 280 297 272" fill="none" stroke="#8a5a63" stroke-width="1.3" stroke-linecap="round" opacity=".45"/>`
    : `<path d="M402 261 C400 240 383 225 364 226 C348 227 336 237 332 251 C340 273 359 284 379 280 C392 277 400 270 402 261 Z" fill="#fffaf6"/>
       <circle cx="366" cy="252" r="17" fill="url(#irisGrad)"/><circle cx="366" cy="253" r="8" fill="#2b1620"/><circle cx="366" cy="253" r="3.8" fill="#0c0710"/><circle cx="373" cy="245" r="5" fill="#fff" opacity=".96"/><circle cx="358" cy="259" r="2.4" fill="#ffe6d9" opacity=".7"/>
       <path d="M405 259 C402 237 384 221 364 222 C348 223 336 234 331 249" fill="none" stroke="#42222e" stroke-width="4.8" stroke-linecap="round"/>
       <path d="M401 252 L411 244" stroke="#42222e" stroke-width="3" stroke-linecap="round"/>
       <path d="M389 271 C376 278 358 280 343 272" fill="none" stroke="#8a5a63" stroke-width="1.3" stroke-linecap="round" opacity=".45"/>`;

  const portraitSVG = `
  <svg class="portrait-svg" viewBox="0 0 640 900" role="img" aria-label="한서아의 초상">
    <defs>
      <radialGradient id="skinGrad" cx=".46" cy=".3" r=".8">
        <stop offset="0" stop-color="#fff1e8"/><stop offset=".45" stop-color="#fcdccf"/><stop offset=".82" stop-color="#f2c2b3"/><stop offset="1" stop-color="#e8ada1"/>
      </radialGradient>
      <linearGradient id="hairBackGrad" x1=".2" y1="0" x2=".8" y2="1">
        <stop offset="0" stop-color="#4b2d39"/><stop offset=".38" stop-color="#33202b"/><stop offset=".72" stop-color="#241722"/><stop offset="1" stop-color="#180f1b"/>
      </linearGradient>
      <linearGradient id="hairFrontGrad" x1=".12" y1="0" x2=".88" y2="1">
        <stop offset="0" stop-color="#6a3f4c"/><stop offset=".45" stop-color="#442634"/><stop offset="1" stop-color="#2a1826"/>
      </linearGradient>
      <linearGradient id="sweaterGrad" x1=".2" y1="0" x2=".8" y2="1">
        <stop offset="0" stop-color="#fff6ec"/><stop offset=".55" stop-color="#f4e3d5"/><stop offset="1" stop-color="#dfc8bd"/>
      </linearGradient>
      <linearGradient id="cardiganGrad" x1=".1" y1="0" x2=".9" y2="1">
        <stop offset="0" stop-color="#c0909b"/><stop offset=".5" stop-color="#a17381"/><stop offset="1" stop-color="#7c5563"/>
      </linearGradient>
      <linearGradient id="irisGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#5c3a22"/><stop offset=".45" stop-color="#a56b3f"/><stop offset="1" stop-color="#e0ad74"/>
      </linearGradient>
      <linearGradient id="lipGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#d97f89"/><stop offset="1" stop-color="#b95b6b"/>
      </linearGradient>
      <radialGradient id="blushGrad"><stop offset="0" stop-color="#ff8fa0" stop-opacity=".5"/><stop offset="1" stop-color="#ff8fa0" stop-opacity="0"/></radialGradient>
      <radialGradient id="portraitHalo"><stop offset="0" stop-color="#ffd9b0" stop-opacity=".42"/><stop offset=".55" stop-color="#ff9fb5" stop-opacity=".14"/><stop offset="1" stop-color="#9b7cff" stop-opacity="0"/></radialGradient>
      <linearGradient id="rimLight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe6c8" stop-opacity=".95"/><stop offset="1" stop-color="#ffb7c5" stop-opacity="0"/></linearGradient>
      <filter id="pSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="pSoftSmall" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
      <filter id="pGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="18"/></filter>
      <clipPath id="eyeClipL"><path d="${eyePathL}"/></clipPath>
      <clipPath id="eyeClipR"><path d="${eyePathR}"/></clipPath>
      <clipPath id="faceClip"><path d="M320 132 C382 132 426 178 426 240 C426 280 418 314 400 342 C386 364 358 388 320 388 C282 388 254 364 240 342 C222 314 214 280 214 240 C214 178 258 132 320 132 Z"/></clipPath>
    </defs>

    <ellipse cx="320" cy="470" rx="286" ry="300" fill="url(#portraitHalo)"/>
    <g class="portrait-breathe">
      <ellipse cx="320" cy="862" rx="205" ry="24" fill="#0b0714" opacity=".42" filter="url(#pSoft)"/>

      <!-- back hair -->
      <path d="M320 76 C414 76 466 138 454 234 C448 294 468 352 484 420 C504 508 510 632 490 752 C481 808 454 850 422 851 C396 852 390 822 401 794 C430 710 428 624 400 556 C384 518 380 480 386 446 L254 446 C260 480 256 518 240 556 C212 624 210 710 239 794 C250 822 244 852 218 851 C186 850 159 808 150 752 C130 632 136 508 156 420 C172 352 192 294 186 234 C174 138 226 76 320 76 Z" fill="url(#hairBackGrad)"/>
      <path d="M188 258 C172 348 162 470 174 598 C180 670 190 728 206 774" fill="none" stroke="#6e4556" stroke-width="3" opacity=".36"/>
      <path d="M452 268 C468 356 478 476 466 604 C460 674 450 730 436 776" fill="none" stroke="#6e4556" stroke-width="3" opacity=".32"/>
      <path d="M166 496 C156 602 166 704 194 792" fill="none" stroke="url(#rimLight)" stroke-width="5" opacity=".32"/>
      <path d="M474 484 C486 594 476 698 448 794" fill="none" stroke="url(#rimLight)" stroke-width="6" opacity=".28"/>

      <!-- neck + chest, one continuous shape -->
      <path d="M291 352 C291 386 287 410 278 430 C268 474 246 526 220 580 C252 620 288 642 320 642 C352 642 388 620 420 580 C394 526 372 474 362 430 C353 410 349 386 349 352 Z" fill="#f4c7b9"/>
      <ellipse cx="320" cy="395" rx="33" ry="17" fill="#d99f92" opacity=".32" filter="url(#pSoftSmall)"/>
      <path d="M272 478 C290 492 306 498 318 499 M368 478 C350 492 334 498 322 499" fill="none" stroke="#dfa89b" stroke-width="1.6" stroke-linecap="round" opacity=".4"/>
      <path d="M290 458 C302 468 338 468 350 458" fill="none" stroke="#f9d9cc" stroke-width="2" stroke-linecap="round" opacity=".45"/>
      <path d="M298 444 C310 456 330 456 342 444 C337 468 303 468 298 444 Z" fill="#e8b4a7" opacity=".25" filter="url(#pSoftSmall)"/>

      <!-- torso -->
      <path d="M122 900 C132 722 184 610 252 548 C282 524 300 498 320 498 C340 498 358 524 388 548 C456 610 508 722 518 900 Z" fill="url(#sweaterGrad)"/>
      <path d="M140 900 C150 744 196 640 264 578 C244 664 238 778 242 900 Z" fill="url(#cardiganGrad)"/>
      <path d="M500 900 C490 744 444 640 376 578 C396 664 402 778 398 900 Z" fill="url(#cardiganGrad)"/>
      <path d="M154 900 C166 762 204 666 258 608" fill="none" stroke="#6f4a58" stroke-width="3" opacity=".22"/>
      <path d="M486 900 C474 762 436 666 382 608" fill="none" stroke="#6f4a58" stroke-width="3" opacity=".22"/>
      <path d="M266 586 C250 664 246 780 248 900" fill="none" stroke="#c99aa2" stroke-width="2.6" opacity=".4"/>
      <path d="M374 586 C390 664 394 780 392 900" fill="none" stroke="#c99aa2" stroke-width="2.6" opacity=".4"/>
      <g stroke="#d8c0b6" stroke-width="1.2" opacity=".18">
        <path d="M300 716 q20 5 40 0 M297 760 q23 6 46 0 M294 804 q26 7 52 0"/>
      </g>
      <path d="M284 498 C290 540 350 540 356 498 C346 524 332 534 320 534 C308 534 294 524 284 498 Z" fill="#fff8ef"/>
      <path d="M284 498 C290 540 350 540 356 498" fill="none" stroke="#dcc3b8" stroke-width="2.4" opacity=".85"/>
      <path d="M298 528 C306 558 334 558 342 528" fill="none" stroke="#e7bd83" stroke-width="1.8" opacity=".9"/>
      <path d="M320 538 l4.2 8.6 9.5 1.2-7 6.7 1.8 9.4-8.5-4.5-8.5 4.5 1.8-9.4-7-6.7 9.5-1.2z" fill="#ffd99c" opacity=".95"/>

      <!-- ears -->
      <ellipse cx="219" cy="278" rx="15" ry="27" fill="#f3c5b8"/>
      <ellipse cx="421" cy="278" rx="15" ry="27" fill="#f3c5b8"/>
      <path d="M216 269 q-6 10 2 20" fill="none" stroke="#d9988e" stroke-width="1.8" opacity=".55"/>
      <path d="M424 269 q6 10 -2 20" fill="none" stroke="#d9988e" stroke-width="1.8" opacity=".55"/>
      <path d="M219 310 l3.6 7.2 8 .9-5.8 5.5 1.5 7.9-7.3-3.9-7.3 3.9 1.5-7.9-5.8-5.5 8-.9z" fill="#ffe0a6" opacity=".9"/>
      <path d="M421 310 l3.6 7.2 8 .9-5.8 5.5 1.5 7.9-7.3-3.9-7.3 3.9 1.5-7.9-5.8-5.5 8-.9z" fill="#ffe0a6" opacity=".9"/>

      <!-- face -->
      <path d="M320 132 C382 132 426 178 426 240 C426 280 418 314 400 342 C386 364 358 388 320 388 C282 388 254 364 240 342 C222 314 214 280 214 240 C214 178 258 132 320 132 Z" fill="url(#skinGrad)"/>
      <path d="M320 132 C382 132 426 178 426 240 C426 280 418 314 400 342 C386 364 358 388 320 388 C342 364 360 334 370 300 C380 262 376 208 354 166 C344 148 332 138 320 132 Z" fill="#eeb6a9" opacity=".18"/>
      <path d="M246 324 C256 362 282 386 320 388 C358 386 384 362 394 324 C378 356 352 372 320 372 C288 372 262 356 246 324 Z" fill="#d99e92" opacity=".16" filter="url(#pSoftSmall)"/>

      <!-- blush -->
      <ellipse cx="252" cy="318" rx="30" ry="15" fill="url(#blushGrad)" opacity=".7"/>
      <ellipse cx="388" cy="318" rx="30" ry="15" fill="url(#blushGrad)" opacity=".7"/>

      <!-- soft eyeshadow -->
      <ellipse cx="272" cy="243" rx="36" ry="18" fill="#c97f8b" opacity=".10" filter="url(#pSoftSmall)"/>
      <ellipse cx="368" cy="243" rx="36" ry="18" fill="#c97f8b" opacity=".10" filter="url(#pSoftSmall)"/>

      <!-- nose -->
      <path d="M318 296 C315 305 313 311 320 314 C324 315 327 312 329 309" fill="none" stroke="#d79588" stroke-width="2" stroke-linecap="round" opacity=".55"/>
      <ellipse cx="317" cy="312" rx="6.5" ry="3" fill="#e9b0a4" opacity=".26" filter="url(#pSoftSmall)"/>
      <path d="M315 300 q3 -2 6 0" fill="none" stroke="#fff6ef" stroke-width="1.7" stroke-linecap="round" opacity=".65"/>

      <!-- expressions -->
      <g class="exp exp-neutral">
        ${brow('left')}${brow('right')}
        ${eyeOpen()}${eyeOpen(true)}
        ${mouth('soft')}
      </g>
      <g class="exp exp-smile">
        ${brow('left')}${brow('right')}
        ${eyeOpen()}${eyeOpen(true)}
        <ellipse cx="252" cy="318" rx="34" ry="17" fill="url(#blushGrad)" opacity=".5"/>
        <ellipse cx="388" cy="318" rx="34" ry="17" fill="url(#blushGrad)" opacity=".5"/>
        ${mouth('wide')}
      </g>
      <g class="exp exp-laugh">
        ${brow('left','up')}${brow('right','up')}
        ${closedEye('left')}${closedEye('right')}
        <ellipse cx="250" cy="319" rx="38" ry="18" fill="url(#blushGrad)" opacity=".6"/>
        <ellipse cx="390" cy="319" rx="38" ry="18" fill="url(#blushGrad)" opacity=".6"/>
        ${mouth('laugh')}
      </g>
      <g class="exp exp-shy">
        ${brow('left','sad')}${brow('right','sad')}
        ${shyEye('left')}${shyEye('right')}
        <ellipse cx="248" cy="316" rx="43" ry="20" fill="url(#blushGrad)" opacity=".95"/>
        <ellipse cx="392" cy="316" rx="43" ry="20" fill="url(#blushGrad)" opacity=".95"/>
        ${mouth('small')}
      </g>
      <g class="exp exp-surprise">
        ${brow('left','up')}${brow('right','up')}
        ${wideEye('left')}${wideEye('right')}
        ${mouth('oh')}
        <path d="M300 222 l4 -10 M340 222 l-4 -10" stroke="#4c2c3a" stroke-width="2" stroke-linecap="round" opacity=".3"/>
      </g>
      <g class="exp exp-sad">
        ${brow('left','sad')}${brow('right','sad')}
        ${eyeOpen()}${eyeOpen(true)}
        <path d="M296 256 q-4 12 2 22" fill="none" stroke="#9ed7ff" stroke-width="2" opacity=".4"/>
        ${mouth('frown')}
      </g>

      <!-- side locks framing the face -->
      <path d="M206 228 C192 310 194 390 220 462 C228 484 234 500 240 512 C236 462 236 408 240 360 C244 316 250 278 260 246 Z" fill="url(#hairFrontGrad)"/>
      <path d="M434 228 C448 310 446 390 420 462 C412 484 406 500 400 512 C404 462 404 408 400 360 C396 316 390 278 380 246 Z" fill="url(#hairFrontGrad)"/>
      <path d="M212 252 C202 318 205 380 226 438" fill="none" stroke="#8a5a6a" stroke-width="2" stroke-linecap="round" opacity=".4"/>
      <path d="M428 252 C438 318 435 380 414 438" fill="none" stroke="#8a5a6a" stroke-width="2" stroke-linecap="round" opacity=".4"/>
      <path d="M200 300 C194 360 199 414 216 460" fill="none" stroke="#f0b8a6" stroke-width="1.8" stroke-linecap="round" opacity=".26"/>
      <path d="M440 300 C446 360 441 414 424 460" fill="none" stroke="#f0b8a6" stroke-width="1.8" stroke-linecap="round" opacity=".26"/>

      <!-- front bangs -->
      <path d="M198 242 C184 158 240 86 320 86 C400 86 456 158 442 242 C420 226 398 214 376 208 C352 202 332 205 316 211 C296 217 272 214 248 205 C226 197 210 216 198 242 Z" fill="url(#hairFrontGrad)"/>
      <path d="M292 92 C318 108 340 132 352 162 C360 184 362 202 360 220 C346 198 330 180 310 168 C298 154 292 122 292 92 Z" fill="#4a2a3a" opacity=".5"/>
      <path d="M330 96 C360 112 384 138 398 170 C408 192 414 214 416 232 C400 206 382 188 358 178 C340 170 328 156 322 138 C322 122 326 108 330 96 Z" fill="#3a2230" opacity=".45"/>
      <g fill="none" stroke="#a06b7b" stroke-linecap="round" opacity=".4">
        <path d="M246 174 C280 134 322 118 360 128" stroke-width="2.6"/>
        <path d="M260 186 C292 150 324 138 352 144" stroke-width="1.5"/>
        <path d="M218 240 C208 302 212 362 232 420" stroke-width="1.4"/>
        <path d="M422 240 C432 302 428 362 408 420" stroke-width="1.4"/>
      </g>
      <path d="M216 238 C206 300 210 366 232 430" fill="none" stroke="#5e3548" stroke-width="5" stroke-linecap="round" opacity=".7"/>
      <path d="M424 238 C434 300 430 366 408 430" fill="none" stroke="#5e3548" stroke-width="5" stroke-linecap="round" opacity=".7"/>

      <!-- highlights -->
      <path d="M254 156 C284 120 324 110 358 120" fill="none" stroke="#d8a7b4" stroke-width="4" stroke-linecap="round" opacity=".4"/>
      <path d="M264 166 C290 138 320 130 346 136" fill="none" stroke="#ffe1d1" stroke-width="1.6" stroke-linecap="round" opacity=".45"/>
      <path d="M398 250 C418 250 432 262 436 282" fill="none" stroke="#ffd5c2" stroke-width="2.2" stroke-linecap="round" opacity=".4"/>
    </g>

    <g class="portrait-sparkles" fill="#ffe8b7">
      <path class="sp sp1" d="M120 300 l5 14 14 5-14 5-5 14-5-14-14-5 14-5z"/>
      <path class="sp sp2" d="M512 236 l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" opacity=".8"/>
      <path class="sp sp3" d="M486 470 l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" opacity=".65"/>
      <circle class="sp sp4" cx="148" cy="420" r="3" opacity=".7"/>
      <circle class="sp sp5" cx="528" cy="376" r="2.2" opacity=".6"/>
    </g>
  </svg>`;

  window.ART = {
    background(name) {
      const fn = backgrounds[name] || backgrounds['rain-street'];
      return fn();
    },
    portrait() { return portraitSVG; },
    backgrounds: Object.keys(backgrounds)
  };
})();
