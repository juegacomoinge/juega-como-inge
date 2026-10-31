/* =========================================================
   OBRA · illustrations678.js
   Ilustraciones SVG de los expedientes 006, 007 y 008
   ========================================================= */

const F = "font-family='JetBrains Mono, monospace'";
const HEAD = (t, sub = 'DATOS SIMULADOS · USO EDUCATIVO') => `<g ${F}><text x="20" y="30" fill="#e7eaee" font-size="16" font-weight="700">${t}</text><text x="20" y="52" fill="#ffc21a" font-size="12">${sub}</text></g>`;
const SVG = (label, body, bg = '#0f1317') => `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}"><rect width="800" height="600" fill="${bg}"/>${body}</svg>`;
const T = (x, y, s, c = '#e7eaee', size = 13, extra = '') => `<text x="${x}" y="${y}" ${F} font-size="${size}" fill="${c}" ${extra}>${s}</text>`;

function crack(x0, y0, x1, y1, seg = 8, j = 6, seed = 1) {
  let s = seed; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - .5; };
  let d = `M${x0},${y0}`;
  for (let i = 1; i <= seg; i++) { const t = i / seg; d += ` L${(x0 + (x1 - x0) * t + (i < seg ? r() * j : 0)).toFixed(1)},${(y0 + (y1 - y0) * t + (i < seg ? r() * j : 0)).toFixed(1)}`; }
  return d;
}

/* ================= EXP-006 ================= */

/* Viga con fisura de flexión a mitad de luz */
export function beamCrack() {
  return SVG('Viga con fisura vertical de flexión a mitad de luz', `
  ${HEAD('VIGA V-2B · ALZADO')}
  <rect x="40" y="150" width="40" height="400" fill="#9a9c98"/><rect x="720" y="150" width="40" height="400" fill="#9a9c98"/>
  <path d="M80 220 L720 220 L720 300 Q400 318 80 300 Z" fill="#8e908c"/>
  <path d="${crack(400, 310, 403, 240, 7, 5, 4)}" stroke="#111" stroke-width="4" fill="none"/>
  <path d="${crack(370, 306, 374, 270, 4, 3, 9)}" stroke="#111" stroke-width="1.5" fill="none"/>
  <path d="${crack(432, 306, 430, 274, 4, 3, 11)}" stroke="#111" stroke-width="1.5" fill="none"/>
  <line x1="80" y1="300" x2="720" y2="300" stroke="#ff3b30" stroke-dasharray="8 6" stroke-width="2"/>
  <g fill="#c9c2b5">${[0, 1, 2, 3, 4].map(i => `<circle cx="${380 + i * 10}" cy="${470 + (i % 2) * 6}" r="3"/>`).join('')}</g>
  ${T(420, 250, 'fisura 1,6 mm', '#ffc21a')}${T(530, 345, 'flecha 22 mm (exagerada)', '#ff5a4f')}${T(330, 500, 'polvo sobre la baldosa', '#9aa4ae', 12)}
  ${T(30, 580, 'C-B2', '#9aa4ae')}${T(710, 580, 'C-B3', '#9aa4ae')}${T(330, 210, 'L = 7,50 m', '#9aa4ae')}`);
}

/* Fisuras de hendimiento en la cara inferior */
export function splittingCracks() {
  return SVG('Cara inferior de la viga con fisuras longitudinales de hendimiento', `
  ${HEAD('V-2B · CARA INFERIOR (VISTA DESDE ABAJO)')}
  <rect x="60" y="230" width="680" height="150" fill="#8e908c"/>
  <g stroke="#6b4a33" stroke-width="2" stroke-dasharray="4 6" opacity=".6">${[270, 305, 340].map(y => `<line x1="60" y1="${y}" x2="740" y2="${y}"/>`).join('')}</g>
  <g stroke="#111" stroke-width="2.5" fill="none">${[270, 305, 340].map((y, i) => `<path d="${crack(330, y, 480, y, 9, 2, i + 3)}"/>`).join('')}</g>
  <path d="M400 232 L403 378" stroke="#111" stroke-width="3"/>
  <rect x="455" y="350" width="40" height="22" fill="#4b4d50"/>
  <line x1="330" y1="410" x2="480" y2="410" stroke="#ffc21a" stroke-width="2"/><line x1="330" y1="402" x2="330" y2="418" stroke="#ffc21a"/><line x1="480" y1="402" x2="480" y2="418" stroke="#ffc21a"/>
  ${T(355, 440, '≈ 45 cm de hendimiento', '#ffc21a')}${T(500, 368, 'recubrimiento suelto', '#9aa4ae', 12)}${T(70, 220, 'barras inferiores (líneas punteadas)', '#9aa4ae', 12)}`);
}

/* Escaneo de empalmes */
export function spliceScan() {
  return SVG('Escaneo de pachómetro: tres empalmes en la misma sección', `
  ${HEAD('PACHÓMETRO · EMPALMES DE LA V-2B')}
  <rect x="60" y="180" width="680" height="200" fill="#1a2027" stroke="#2f3a45"/>
  ${[220, 280, 340].map((y, i) => `<line x1="80" y1="${y}" x2="${420 + i * 4}" y2="${y}" stroke="#ff5a4f" stroke-width="7"/><line x1="${376 + i * 4}" y1="${y + 10}" x2="720" y2="${y + 10}" stroke="#ff5a4f" stroke-width="7"/>`).join('')}
  <rect x="372" y="200" width="56" height="170" fill="none" stroke="#ffc21a" stroke-width="2" stroke-dasharray="6 4"/>
  <line x1="400" y1="170" x2="400" y2="390" stroke="#e7eaee" stroke-dasharray="3 5"/>
  ${T(330, 160, 'mitad de luz · 3 de 3 barras', '#ffc21a')}${T(372, 420, '≈ 40 cm', '#ffc21a')}
  <rect x="80" y="470" width="${640 * 0.37}" height="22" fill="#ff5a4f"/><rect x="80" y="470" width="640" height="22" fill="none" stroke="#4cc38a" stroke-width="2"/>
  ${T(80, 520, 'ejecutado 400 mm = 37 % de lo requerido (Clase B ≈ 1 084 mm)', '#e7eaee', 12)}`);
}

/* Plano de despiece */
export function beamPlan() {
  return SVG('Despiece de la viga V-2B con nota genérica de traslapos', `
  <g stroke="#1b3a52">${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="600"/><line x1="0" y1="${i * 40}" x2="800" y2="${i * 40}"/>`).join('')}</g>
  ${HEAD('PLANCHA E-05 · DESPIECE V-2B', 'APROBADO · COPIA DE ARCHIVO')}
  <g fill="none" stroke="#dce8f5" stroke-width="2"><rect x="60" y="180" width="680" height="110"/><rect x="40" y="160" width="20" height="150"/><rect x="740" y="160" width="20" height="150"/></g>
  <path d="M50 200 L750 200" stroke="#ff7a1a" stroke-width="3"/><path d="M50 272 L750 272" stroke="#ff7a1a" stroke-width="3"/>
  ${T(250, 192, '2 N.º 6 sup. corridas + bastones', '#dce8f5', 12)}${T(250, 266, '3 N.º 6 inf. corridas L = 7,90 m', '#ff7a1a', 12)}
  ${T(330, 320, 'V-2B 30×50 · estribos N.º 3 c/10-15', '#dce8f5', 12)}
  <rect x="60" y="400" width="420" height="150" fill="#ffc21a" opacity=".1" stroke="#ffc21a"/>
  ${T(75, 430, 'NOTAS GENERALES', '#ffc21a', 13, "font-weight='700'")}${T(75, 460, "Concreto f'c = 21 MPa · Acero fy = 420 MPa", '#dce8f5', 12)}${T(75, 485, 'Recubrimiento vigas: 4 cm', '#dce8f5', 12)}
  <rect x="70" y="497" width="210" height="24" fill="none" stroke="#ff5a4f" stroke-width="2"/>${T(75, 514, 'Traslapos: 40 cm', '#ff5a4f', 13)}
  ${T(500, 470, '¿Dónde se empalma?', '#ff5a4f', 13)}${T(500, 495, '¿Para qué diámetro?', '#ff5a4f', 13)}`, '#0e2233');
}

/* ================= EXP-007 ================= */

/* Marcas de laminación en barras */
export function barMarks() {
  const bar = (y, mark, color, tag) => `<g transform="translate(0 ${y})"><rect x="80" y="0" width="640" height="46" rx="22" fill="${color}"/>
    ${Array.from({ length: 16 }, (_, i) => `<path d="M${110 + i * 38} 4 l14 38" stroke="#000" stroke-opacity=".35" stroke-width="5"/>`).join('')}
    <rect x="370" y="6" width="60" height="34" rx="6" fill="#000" fill-opacity=".25"/><text x="400" y="32" ${F} font-size="24" font-weight="700" fill="#f1f1f1" text-anchor="middle">${mark}</text>
    ${tag ? '<rect x="64" y="-10" width="30" height="40" fill="#c7cdd3"/>' : ''}</g>`;
  return SVG('Barras con marcas W y S en el relieve', `
  ${HEAD('ACOPIO · IDENTIFICACIÓN POR RELIEVE')}
  ${bar(140, 'W', '#6b4a33', true)}${T(80, 220, 'Proveedor contratado · etiqueta · NTC 2289 (permitido)', '#4cc38a', 13)}
  ${bar(310, 'S', '#3b2f2a', false)}${T(80, 390, 'Ferretería · sin etiqueta · NTC 248 (NO permitido)', '#ff5a4f', 13)}
  ${T(80, 470, 'NSR-10, CR3.5.3.1: solo acero NTC 2289 en Colombia', '#ffc21a', 12)}`);
}

/* Sección de columna: especificado vs instalado */
export function columnSection() {
  const sec = (x, d, color, lab) => `<rect x="${x}" y="170" width="240" height="320" fill="#8e908c"/><rect x="${x + 22}" y="192" width="196" height="276" fill="none" stroke="#5b4636" stroke-width="3"/>
    ${[[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]].map(([i, j]) => `<circle cx="${x + 40 + i * 80}" cy="${210 + j * 120}" r="${d}" fill="${color}"/>`).join('')}${T(x, 520, lab, color)}`;
  return SVG('Sección de columna especificada frente a instalada', `
  ${HEAD('COLUMNA EJE C · 30 × 40 cm')}
  ${sec(100, 11, '#4cc38a', 'PLANO: 8 N.º 5 · 1,33 %')}
  ${sec(460, 8, '#ff5a4f', 'INSTALADO: 8 N.º 4 · 0,86 %')}
  ${T(330, 560, 'mínimo C.10.9.1 = 1 %', '#ffc21a')}`);
}

/* Cronología del suministro */
export function supplyTimeline() {
  const ev = [[8, 'Pedido único', '#9aa4ae'], [10, 'Despacho confirmado', '#9aa4ae'], [11, 'Paro: despacho suspendido', '#ff7a1a'], [12, 'Oferta parcial SIN RESPUESTA', '#ff5a4f'], [12.4, 'Compra en ferretería', '#ff5a4f'], [14, 'Llega el pedido · hallazgo', '#4cc38a']];
  const x = (w) => 80 + (w - 7) * 85;
  return SVG('Cronología del suministro de acero', `
  ${HEAD('SUMINISTRO DE ACERO · SEMANAS 7 A 15')}
  <line x1="80" y1="300" x2="740" y2="300" stroke="#5d6670" stroke-width="3"/>
  ${[7, 8, 9, 10, 11, 12, 13, 14, 15].map(w => `<line x1="${x(w)}" y1="292" x2="${x(w)}" y2="308" stroke="#5d6670"/>${T(x(w) - 8, 330, 'S' + w, '#9aa4ae', 11)}`).join('')}
  <rect x="${x(11)}" y="270" width="${x(14) - x(11)}" height="18" fill="#ff7a1a" opacity=".3"/>
  ${ev.map(([w, t, c], i) => `<circle cx="${x(w)}" cy="300" r="8" fill="${c}"/><line x1="${x(w)}" y1="300" x2="${x(w)}" y2="${i % 2 ? 400 + i * 12 : 220 - i * 12}" stroke="${c}"/>${T(x(w) - 30, i % 2 ? 418 + i * 12 : 212 - i * 12, t, c, 12)}`).join('')}`);
}

/* Curvas esfuerzo–deformación */
export function tensileChart() {
  const X = (e) => 90 + e * 30, Y = (s) => 520 - s * .65;
  return SVG('Curvas de tracción: acero W dúctil frente a acero S', `
  ${HEAD('ENSAYO DE TRACCIÓN · ESFUERZO vs. DEFORMACIÓN')}
  <line x1="90" y1="520" x2="740" y2="520" stroke="#5d6670"/><line x1="90" y1="520" x2="90" y2="90" stroke="#5d6670"/>
  <line x1="90" y1="${Y(420)}" x2="740" y2="${Y(420)}" stroke="#ffc21a" stroke-dasharray="6 6"/>${T(600, Y(420) - 8, 'fy = 420 MPa', '#ffc21a', 12)}
  <path d="M90 520 L${X(.3)} ${Y(449)} L${X(2)} ${Y(452)} Q${X(9)} ${Y(600)} ${X(13)} ${Y(616)} L${X(17)} ${Y(570)}" stroke="#4cc38a" stroke-width="4" fill="none"/>
  <path d="M90 520 L${X(.3)} ${Y(461)} L${X(1)} ${Y(465)} Q${X(6)} ${Y(545)} ${X(8)} ${Y(549)} L${X(9.5)} ${Y(520)}" stroke="#ff5a4f" stroke-width="4" fill="none"/>
  <circle cx="${X(17)}" cy="${Y(570)}" r="6" fill="#4cc38a"/><circle cx="${X(9.5)}" cy="${Y(520)}" r="6" fill="#ff5a4f"/>
  ${T(X(13), Y(640), 'W · 16–17 %', '#4cc38a')}${T(X(6), Y(580), 'S · 9–10 %', '#ff5a4f')}
  ${T(560, 555, 'deformación (%) →', '#9aa4ae', 12)}${T(100, 85, 'esfuerzo (MPa)', '#9aa4ae', 12)}`);
}

/* ================= EXP-008 ================= */

/* Fisuras en estrella vistas desde abajo */
export function slabStar() {
  const rays = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2, l = 120 + (i % 3) * 70; return `<path d="${crack(400, 300, 400 + Math.cos(a) * l, 300 + Math.sin(a) * l, 7, 8, i + 2)}"/>`; }).join('');
  return SVG('Cara inferior de la losa con fisuras radiales', `
  ${HEAD('LOSA PISO 2 · CARA INFERIOR (PARQUEADERO)')}
  <rect x="40" y="70" width="720" height="470" fill="#8e908c"/>
  <g stroke="#7a7c78" stroke-width="10">${[130, 230, 330, 430, 530].map(y => `<line x1="40" y1="${y}" x2="760" y2="${y}"/>`).join('')}</g>
  <g stroke="#111" stroke-width="3" fill="none">${rays}</g>
  <circle cx="400" cy="300" r="22" fill="none" stroke="#ff5a4f" stroke-width="3" stroke-dasharray="5 4"/>
  ${T(430, 290, 'bajo el arranque de C-B2', '#ffc21a')}${T(60, 560, 'fisuras radiales hasta 2,0 mm · nervios (gris) en una dirección', '#9aa4ae', 12)}`);
}

/* Dado con arranques cortados */
export function cutStub() {
  return SVG('Dado de cimentación con barras de arranque cortadas', `
  ${HEAD('PARQUEADERO · EJE B-2 (CON LINTERNA)')}
  <rect x="0" y="380" width="800" height="220" fill="#5a5c5f"/>
  <path d="M260 380 L540 380 L580 430 L220 430 Z" fill="#8e908c"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<ellipse cx="${290 + i * 32}" cy="${398 + (i % 2) * 14}" rx="8" ry="4" fill="#6b4a33" stroke="#2a1d14"/>`).join('')}
  <g fill="#f2f2f2"><rect x="120" y="440" width="14" height="160"/><rect x="400" y="440" width="14" height="160"/><rect x="680" y="440" width="14" height="160"/></g>
  <path d="M400 80 L400 330" stroke="#ff5a4f" stroke-width="3" stroke-dasharray="10 8"/>
  <rect x="370" y="70" width="60" height="16" fill="#8a8c88"/>
  ${T(440, 200, 'aquí debía estar C-B2', '#ff5a4f')}${T(440, 222, '(existe arriba, desde el piso 2)', '#9aa4ae', 12)}
  ${T(220, 470, '8 arranques N.º 6 cortados a ras', '#ffc21a')}${T(140, 580, 'celda 14', '#e7eaee', 12)}${T(420, 580, 'celda 15', '#e7eaee', 12)}`);
}

/* Planta aprobada frente a construida */
export function planCompare() {
  const grid = (ox, missing) => `<g transform="translate(${ox} 150)">${[0, 1, 2, 3].map(i => [0, 1, 2].map(j => {
    const miss = missing && i === 1 && j === 1;
    return `<rect x="${i * 100 - 9}" y="${j * 120 - 9}" width="18" height="18" fill="${miss ? 'none' : '#dce8f5'}" stroke="${miss ? '#ff5a4f' : 'none'}" stroke-width="2" stroke-dasharray="4 3"/>`;
  }).join('')).join('')}${['A', 'B', 'C', 'D'].map((a, i) => `<text x="${i * 100 - 5}" y="-25" ${F} font-size="14" fill="#9aa4ae">${a}</text>`).join('')}</g>`;
  return SVG('Planta del piso 1: aprobada frente a construida', `
  ${HEAD('PLANTA PISO 1 · APROBADO vs. CONSTRUIDO')}
  ${grid(60, false)}${grid(450, true)}
  ${T(60, 470, 'APROBADO (licencia)', '#4cc38a')}${T(450, 470, 'CONSTRUIDO', '#ff5a4f')}
  ${T(450, 495, 'C-B2 suprimida · vano 5 m → 10 m', '#ff5a4f', 12)}
  <rect x="535" y="235" width="100" height="70" fill="#ffc21a" opacity=".15"/>${T(540, 275, '+2 celdas', '#ffc21a', 12)}`, '#0e2233');
}

export const ILLUSTRATIONS_678 = { beamCrack, splittingCracks, spliceScan, beamPlan, barMarks, columnSection, supplyTimeline, tensileChart, slabStar, cutStub, planCompare };
