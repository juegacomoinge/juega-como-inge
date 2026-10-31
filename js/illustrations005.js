/* =========================================================
   OBRA · illustrations005.js
   Ilustraciones SVG del expediente 005 «La parrilla pisada»
   ========================================================= */

const F = "font-family='JetBrains Mono, monospace'";
const HEAD = (t, sub = 'DATOS SIMULADOS · USO EDUCATIVO') => `<g ${F}><text x="20" y="30" fill="#e7eaee" font-size="16" font-weight="700">${t}</text><text x="20" y="52" fill="#ffc21a" font-size="12">${sub}</text></g>`;
const SVG = (label, body) => `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}"><rect width="800" height="600" fill="#0f1317"/>${body}</svg>`;

function crack(x0, y0, x1, y1, seg = 8, j = 6, seed = 1) {
  let s = seed; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - .5; };
  let d = `M${x0},${y0}`;
  for (let i = 1; i <= seg; i++) { const t = i / seg; d += ` L${(x0 + (x1 - x0) * t + (i < seg ? r() * j : 0)).toFixed(1)},${(y0 + (y1 - y0) * t + (i < seg ? r() * j * 2 : 0)).toFixed(1)}`; }
  return d;
}

/* Corte de la losa en voladizo: muro, losa y barras a una profundidad dada */
function section(coverPx, { tilt = 0, label = '', ok = false } = {}) {
  const y0 = 230, h = 120; // losa de 150 mm → 120 px (0,8 px/mm)
  const bars = Array.from({ length: 9 }, (_, i) => 250 + i * 55);
  return `
  <rect x="60" y="120" width="170" height="380" fill="#2a3139"/>
  <g transform="rotate(${tilt} 230 ${y0})">
    <rect x="230" y="${y0}" width="510" height="${h}" fill="#8a8c88"/>
    <rect x="230" y="${y0 - 10}" width="510" height="10" fill="#c9b79c"/>
    ${bars.map(x => `<circle cx="${x}" cy="${y0 + coverPx + 5}" r="5.5" fill="${ok ? '#4cc38a' : '#ff5a4f'}"/>`).join('')}
    <line x1="230" y1="${y0 + h - 22}" x2="740" y2="${y0 + h - 22}" stroke="#5b4636" stroke-width="4"/>
    <line x1="232" y1="${y0 + 32 + 5}" x2="740" y2="${y0 + 32 + 5}" stroke="#ffc21a" stroke-width="2" stroke-dasharray="8 6"/>
  </g>
  <g ${F} font-size="13">
    <text x="470" y="${y0 - 30}" fill="#ffc21a">posición de diseño (40 mm)</text>
    <text x="470" y="${y0 + h + 60}" fill="${ok ? '#4cc38a' : '#ff5a4f'}">${label}</text>
    <text x="80" y="540" fill="#9aa4ae">MURO / VIGA</text><text x="560" y="540" fill="#9aa4ae">VOLADIZO 1,50 m →</text>
  </g>`;
}

/* E01 · Fisura en el empotramiento */
export function balconyCrack() {
  return SVG('Balcón con fisura superior en el empotramiento y eflorescencias abajo', `
  ${HEAD('BALCÓN 402 · FISURA EN EL EMPOTRAMIENTO')}
  <rect x="40" y="90" width="230" height="470" fill="#bdb6a8"/>
  <g stroke="#9c958a">${[150, 230, 310, 390, 470].map(y => `<line x1="40" y1="${y}" x2="270" y2="${y}"/>`).join('')}</g>
  <path d="M270 250 L760 250 L760 290 L270 300 Z" fill="#c9b79c"/>
  <path d="M270 300 L760 290 L760 330 L270 345 Z" fill="#8a8c88"/>
  <g stroke="#7a6d5c">${Array.from({ length: 10 }, (_, i) => `<line x1="${310 + i * 45}" y1="250" x2="${310 + i * 45}" y2="${299 - i * 1}"/>`).join('')}</g>
  <path d="${crack(285, 250, 300, 300, 7, 4, 3)}" stroke="#111" stroke-width="4" fill="none"/>
  <path d="M270 345 Q300 380 285 420 M300 345 Q330 390 320 440" stroke="#e9ecef" stroke-width="6" opacity=".5" fill="none"/>
  <g fill="#7fb0d8"><circle cx="290" cy="455" r="5"/><circle cx="318" cy="480" r="4"/></g>
  <g stroke="#3c4651" stroke-width="5"><line x1="740" y1="180" x2="740" y2="250"/><line x1="560" y1="180" x2="560" y2="252"/><line x1="380" y1="180" x2="380" y2="254"/><line x1="370" y1="180" x2="750" y2="180"/></g>
  <g ${F} font-size="13" fill="#ffc21a">
    <text x="300" y="225">fisura CARA SUPERIOR · 0,8 – 1,2 mm</text>
    <line x1="296" y1="232" x2="292" y2="255" stroke="#ffc21a"/>
    <text x="340" y="420">eflorescencias + goteo (cara inferior)</text>
  </g>`);
}

/* E02 · Flecha */
export function deflection() {
  return SVG('Comparación de flechas entre el balcón 402 y el 502', `
  ${HEAD('FLECHA DEL VOLADIZO · NIVEL LÁSER')}
  <rect x="60" y="100" width="150" height="440" fill="#2a3139"/>
  <line x1="210" y1="200" x2="760" y2="200" stroke="#ff3b30" stroke-width="2" stroke-dasharray="10 6"/>
  <path d="M210 200 L700 206 L700 226 L210 220 Z" fill="#4cc38a" opacity=".85"/>
  <text x="560" y="190" ${F} font-size="13" fill="#4cc38a">502 · flecha 6 mm</text>
  <line x1="210" y1="380" x2="760" y2="380" stroke="#ff3b30" stroke-width="2" stroke-dasharray="10 6"/>
  <path d="M210 380 Q480 392 700 420 L700 440 Q480 412 210 400 Z" fill="#ff5a4f" opacity=".9"/>
  <line x1="715" y1="380" x2="715" y2="420" stroke="#ffc21a" stroke-width="3"/>
  <g ${F} font-size="13"><text x="560" y="370" fill="#ff5a4f">402 · flecha 38 mm</text><text x="725" y="405" fill="#ffc21a">38</text>
  <text x="230" y="480" fill="#9aa4ae">Escala vertical exagerada ×10</text><text x="230" y="505" fill="#9aa4ae">línea roja = referencia del nivel láser</text></g>`);
}

/* E03 · Escaneo 402 */
export function coverScan() {
  return SVG('Corte del balcón 402 con el acero superior hundido', `
  ${HEAD('PACHÓMETRO · BALCÓN 402 · CORTE')}
  ${section(68, { label: 'acero real ≈ 85 mm · d ≈ 59 mm' })}
  <g ${F} font-size="12" fill="#e7eaee"><text x="250" y="460">● barra superior N.º 4 c/15</text><text x="250" y="480" fill="#5b4636">━ malla inferior N.º 3</text></g>`);
}

/* E04 · Escaneo 502 */
export function coverScanOk() {
  return SVG('Corte del balcón 502 con el acero superior en su posición', `
  ${HEAD('PACHÓMETRO · BALCÓN 502 · CORTE')}
  ${section(34, { ok: true, label: 'acero real ≈ 43 mm · d ≈ 100 mm' })}`);
}

/* E05 · Entrevista */
export function interview() {
  return SVG('Entrevista al maestro de obra en el contenedor de la obra vecina', `
  ${HEAD('ENTREVISTA · MAESTRO DE OBRA', 'REGISTRO DE AUDIO TRANSCRITO · DATOS SIMULADOS')}
  <rect x="60" y="110" width="680" height="400" rx="10" fill="#1a2027" stroke="#2f3a45"/>
  <rect x="60" y="430" width="680" height="80" fill="#3c5a74" opacity=".35"/>
  <g transform="translate(250 230)"><circle r="44" fill="#c99a6e"/><path d="M-50 -20 Q0 -80 50 -20 L50 -28 Q0 -64 -50 -28Z" fill="#f2c94c"/><rect x="-70" y="50" width="140" height="150" rx="30" fill="#ff7a1a"/><rect x="-70" y="90" width="140" height="10" fill="#e7eaee"/></g>
  <g transform="translate(560 250)"><circle r="40" fill="#8d6748"/><path d="M-44 -18 Q0 -72 44 -18 L44 -26 Q0 -58 -44 -26Z" fill="#e7eaee"/><rect x="-62" y="48" width="124" height="140" rx="28" fill="#3c4651"/></g>
  <rect x="380" y="400" width="60" height="26" rx="4" fill="#111"/><circle cx="395" cy="413" r="5" fill="#ff3b30"/>
  <g ${F} font-size="13" fill="#ffc21a"><text x="170" y="140">don Rubén · maestro</text><text x="500" y="140">investigador</text><text x="450" y="418" fill="#e7eaee">REC 14:32</text></g>
  <rect x="90" y="455" width="620" height="40" rx="6" fill="#0f1317" opacity=".8"/>
  <text x="105" y="481" ${F} font-size="14" fill="#e7eaee">«Toda la vida lo hemos hecho así…»</text>`);
}

/* E06 · Fotos del chat */
export function pourPhotos() {
  const photo = (x, y, rot, inner, cap) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-130" y="-100" width="260" height="215" fill="#e7eaee"/><rect x="-120" y="-90" width="240" height="170" fill="#22282f"/>${inner}<text x="-118" y="105" ${F} font-size="12" fill="#222">${cap}</text></g>`;
  const mesh = (sag) => Array.from({ length: 7 }, (_, i) => `<line x1="-110" y1="${-60 + i * 22}" x2="110" y2="${-60 + i * 22 + (i > 2 && i < 6 ? sag : 0)}" stroke="#a05a3c" stroke-width="3"/>`).join('') + Array.from({ length: 9 }, (_, i) => `<line x1="${-100 + i * 25}" y1="-70" x2="${-100 + i * 25}" y2="70" stroke="#7a4a33" stroke-width="2"/>`).join('');
  return SVG('Fotos del chat de obra durante la fundida del piso 4', `
  ${HEAD('CHAT DE OBRA · FUNDIDA PISO 4', 'FOTOS DEL AYUDANTE · DATOS SIMULADOS')}
  ${photo(220, 230, -4, mesh(0), '7:52 · parrilla sin panelas')}
  ${photo(560, 240, 3, mesh(14) + '<g fill="#ff7a1a"><circle cx="-20" cy="-30" r="12"/><rect x="-32" y="-18" width="24" height="50"/><circle cx="40" cy="-10" r="12"/><rect x="28" y="2" width="24" height="50"/></g><rect x="-90" y="20" width="60" height="30" fill="#5d6670"/>', '10:05 · obreros sobre la malla')}
  ${photo(390, 470, -1, mesh(10) + '<path d="M-10 -70 L-10 10 Q-10 25 5 25" stroke="#c7cdd3" stroke-width="5" fill="none"/><circle cx="-10" cy="-78" r="10" fill="#ff7a1a"/><polygon points="95,-80 115,-70 95,-60" fill="#e7eaee"/>', '10:07 · video: «levantando con gancho»')}`);
}

/* E07 · Plano del balcón */
export function balconyPlan() {
  return SVG('Detalle estructural del balcón tipo', `
  <rect width="800" height="600" fill="#0e2233"/>
  <g stroke="#1b3a52">${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="600"/><line x1="0" y1="${i * 40}" x2="800" y2="${i * 40}"/>`).join('')}</g>
  ${HEAD('DETALLE BALCÓN TIPO · PISOS 2 A 5', 'PLANCHA E-07 · APROBADO')}
  <g fill="none" stroke="#dce8f5" stroke-width="2">
    <rect x="80" y="220" width="140" height="200"/>
    <rect x="220" y="220" width="460" height="90"/>
  </g>
  <path d="M110 250 L660 250 L660 280" stroke="#ff7a1a" stroke-width="4" fill="none"/>
  <line x1="240" y1="288" x2="660" y2="288" stroke="#dce8f5" stroke-width="2" stroke-dasharray="6 4"/>
  <g fill="#ffc21a">${[300, 420, 540].map(x => `<rect x="${x}" y="252" width="16" height="36"/>`).join('')}</g>
  <g ${F} font-size="13" fill="#dce8f5">
    <text x="300" y="210" fill="#ff7a1a">N.º 4 c/15 SUPERIOR · rec. 40 mm</text>
    <text x="300" y="335">N.º 3 c/20 inferior</text>
    <text x="440" y="275" fill="#ffc21a" font-size="11">silletas 10 cm c/60</text>
    <text x="690" y="270">h = 150</text>
    <text x="400" y="370">ℓ = 1 500 mm</text>
    <line x1="220" y1="355" x2="680" y2="355" stroke="#dce8f5"/>
  </g>
  <rect x="80" y="440" width="640" height="110" fill="#ffc21a" opacity=".12" stroke="#ffc21a"/>
  <g ${F} font-size="12" fill="#ffc21a"><text x="95" y="465">NOTA 1: acero superior sobre silletas rígidas. NO caminar sobre la</text><text x="95" y="485">parrilla: usar tablones. Verificar altura del acero antes de fundir.</text><text x="95" y="515">NOTA 2: puntales de voladizos ≥ 14 días y 75 % f'c (cilindros de obra).</text></g>`);
}

/* E08 · Lista de chequeo */
export function checklist() {
  const rows = [['Formaleta y puntales', 1], ['Diámetros y cantidad de acero', 1], ['Altura acero superior / recubrimientos', 0], ['Silletas y separadores', 0], ['Limpieza y humedecimiento', 1], ['Autorización de vaciado', 2]];
  return SVG('Lista de chequeo previa a la fundida con ítems sin firma', `
  ${HEAD('LIBERACIÓN DE VACIADO · LOSA PISO 4')}
  <rect x="120" y="80" width="560" height="490" fill="#f1ede4" transform="rotate(-1.5 400 320)"/>
  <g transform="rotate(-1.5 400 320)" ${F}>
    <text x="150" y="120" font-size="16" fill="#222" font-weight="700">LISTA DE CHEQUEO · PISO 4</text>
    ${rows.map(([t, s], i) => `<g transform="translate(150 ${170 + i * 58})"><rect width="24" height="24" fill="none" stroke="#333" stroke-width="2"/>${s === 1 ? '<path d="M4 12 L10 19 L21 5" stroke="#1b7f4b" stroke-width="3" fill="none"/>' : ''}<text x="40" y="18" font-size="14" fill="#222">${t}</text><text x="380" y="18" font-size="13" fill="${s === 1 ? '#1b7f4b' : '#c62828'}">${s === 1 ? 'OK' : s === 0 ? 'SIN FIRMA' : '«verbal WhatsApp»'}</text></g>`).join('')}
    <text x="150" y="540" font-size="13" fill="#2a4fa0" font-style="italic">Pendiente panelas balcones — maestro: «se levanta con gancho»</text>
  </g>`);
}

/* E09 · Registro de desencofrado */
export function shoringLog() {
  const data = [['P2', 16], ['P3', 15], ['P4', 7], ['P5', 14]];
  return SVG('Días hasta el retiro de puntales de cada balcón', `
  ${HEAD('RETIRO DE PUNTALES · BALCONES')}
  <line x1="120" y1="500" x2="740" y2="500" stroke="#5d6670"/>
  <line x1="120" y1="${500 - 14 * 22}" x2="740" y2="${500 - 14 * 22}" stroke="#ffc21a" stroke-dasharray="8 6"/>
  <text x="560" y="${490 - 14 * 22}" ${F} font-size="12" fill="#ffc21a">mínimo del proyecto: 14 días</text>
  ${data.map(([p, d], i) => `<rect x="${170 + i * 140}" y="${500 - d * 22}" width="80" height="${d * 22}" fill="${d < 14 ? '#ff5a4f' : '#4d86b0'}"/><text x="${210 + i * 140}" y="530" ${F} font-size="14" fill="#e7eaee" text-anchor="middle">${p}</text><text x="${210 + i * 140}" y="${490 - d * 22}" ${F} font-size="14" fill="#e7eaee" text-anchor="middle">${d} d</text>`).join('')}`);
}

/* E10 · Cilindros */
export function cylinders005() {
  const res = [['T-2', 23.1], ['T-3', 22.4], ['T-4', 24.0]];
  const y = (v) => 520 - v * 16;
  return SVG('Resultados de cilindros a 28 días frente a f prima c', `
  ${HEAD("RESISTENCIA A 28 DÍAS · LOSA PISO 4")}
  <line x1="120" y1="520" x2="740" y2="520" stroke="#5d6670"/>
  <line x1="120" y1="${y(21)}" x2="740" y2="${y(21)}" stroke="#ffc21a" stroke-dasharray="8 6"/><text x="600" y="${y(21) - 8}" ${F} font-size="12" fill="#ffc21a">f'c = 21 MPa</text>
  <line x1="120" y1="${y(17.5)}" x2="740" y2="${y(17.5)}" stroke="#ff5a4f" stroke-dasharray="4 6"/><text x="600" y="${y(17.5) + 18}" ${F} font-size="12" fill="#ff5a4f">f'c − 3,5 = 17,5</text>
  ${res.map(([t, v], i) => `<rect x="${180 + i * 170}" y="${y(v)}" width="90" height="${v * 16}" fill="#4cc38a"/><text x="${225 + i * 170}" y="${y(v) - 10}" ${F} font-size="14" fill="#e7eaee" text-anchor="middle">${String(v).replace('.', ',')}</text><text x="${225 + i * 170}" y="545" ${F} font-size="13" fill="#9aa4ae" text-anchor="middle">${t}</text>`).join('')}`);
}

/* E11 · Materas */
export function planters() {
  return SVG('Materas sobre el balcón comparadas con la carga de diseño', `
  ${HEAD('MATERAS · BALCÓN 402')}
  <rect x="80" y="380" width="640" height="24" fill="#8a8c88"/>
  ${[140, 280, 420, 560].map(x => `<path d="M${x} 380 L${x + 10} 330 L${x + 70} 330 L${x + 80} 380 Z" fill="#a0522d"/><ellipse cx="${x + 40}" cy="320" rx="38" ry="22" fill="#3f7d4e"/>`).join('')}
  <g ${F} font-size="14">
    <rect x="80" y="440" width="${640 * 0.33 / 5}" height="26" fill="#4cc38a"/><text x="130" y="459" fill="#4cc38a">materas ≈ 0,33 kN/m²</text>
    <rect x="80" y="485" width="640" height="26" fill="none" stroke="#ffc21a" stroke-width="2"/><text x="90" y="504" fill="#ffc21a">carga viva de diseño · balcones = 5,0 kN/m²</text>
  </g>`);
}

export const ILLUSTRATIONS_005 = { balconyCrack, deflection, coverScan, coverScanOk, interview, pourPhotos, balconyPlan, checklist, shoringLog, cylinders005, planters };
