/* OBRA · scenes/case001_2d.js · Alzado ilustrado del expediente 001 (vista 2D) */

export function illustration() {
  const cols = [300, 800, 1300];
  return `<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="s2-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-a,#0d1117)"/><stop offset="1" style="stop-color:var(--sky-c,#2b2420)"/></linearGradient>
    <linearGradient id="s2-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#s2-sky)"/>
  <!-- grúa -->
  <g stroke="#2f3740" stroke-width="3" fill="none"><path d="M1480 820V80M1500 820V80M1180 80H1580"/></g>
  <!-- suelo -->
  <rect x="0" y="770" width="1600" height="130" fill="#221e1a"/>
  <rect x="200" y="755" width="1200" height="18" fill="#6f716d"/>
  <!-- losa N2 y vigas -->
  <rect x="200" y="210" width="1200" height="22" fill="#8a8c88"/>
  <rect x="200" y="232" width="1200" height="40" fill="#7c7e7a"/>
  <!-- columnas -->
  ${cols.map(x => `<rect x="${x - 18}" y="272" width="36" height="483" fill="#8e908c"/>`).join('')}
  <!-- fisuras en C-B2 -->
  <g stroke="#151515" stroke-width="2.5" fill="none"><path d="M784 420 L792 400 L798 380 L806 352 L814 330"/><path d="M786 450 L796 425 L805 398 L816 372"/></g>
  <!-- zona oscura bajo la losa (requiere linterna) -->
  <rect class="dark-zone" x="200" y="272" width="1200" height="483" fill="url(#s2-dark)"/>
  <!-- arranques N2 -->
  ${cols.map(x => `<g stroke="#6b4a33" stroke-width="3"><line x1="${x - 10}" y1="210" x2="${x - 10}" y2="120"/><line x1="${x + 10}" y1="210" x2="${x + 10}" y2="120"/></g>`).join('')}
  <!-- barandas -->
  <path d="M200 160H1400" stroke="#ffc21a" stroke-width="3"/>
  <!-- estibas sobre losa (este de C-B2) -->
  <g fill="#8a4f35" stroke="#5a3324" stroke-width="2"><rect x="850" y="140" width="70" height="70"/><rect x="930" y="140" width="70" height="70"/><rect x="890" y="90" width="70" height="50"/></g>
  <rect x="1010" y="196" width="220" height="12" fill="#6b4a33"/>
  <!-- muro eje A -->
  <rect x="330" y="420" width="420" height="335" fill="#b5b0a4"/>
  <g stroke="#6b665c" stroke-width="1" fill="none"><path d="M360 470l20 10 10-12M420 520l18-6 6 14M500 450l15 18M600 560l-14 12 10 10M680 480l16 6"/></g>
  <!-- tanque -->
  <rect x="60" y="430" width="100" height="140" rx="12" fill="#1a1d22" stroke="#38414c"/>
  <path d="M150 560 Q200 600 260 770" stroke="#2e6b3a" stroke-width="4" fill="none"/>
  <!-- mesa de planos -->
  <rect x="120" y="640" width="150" height="10" fill="#9a6b3e"/><rect x="130" y="650" width="8" height="120" fill="#9a6b3e"/><rect x="252" y="650" width="8" height="120" fill="#9a6b3e"/>
  <rect x="140" y="630" width="110" height="10" fill="#dce8f5"/>
  <!-- pila de puntales -->
  <g stroke="#7b8590" stroke-width="7">${[0, 1, 2, 3, 4].map(i => `<line x1="380" y1="${790 - i * 10}" x2="600" y2="${790 - i * 10}"/>`).join('')}</g>
  <!-- conos -->
  ${[740, 860].map(x => `<path d="M${x} 770 l14 -50 l14 50z" fill="#ff7a1a"/>`).join('')}
  <path d="M754 735 H874" stroke="#ffc21a" stroke-width="4" stroke-dasharray="12 8"/>
  <!-- camión mezclador -->
  <g transform="translate(1300 560)"><rect x="0" y="120" width="290" height="30" fill="#1d2228"/><rect x="200" y="50" width="90" height="72" fill="#e8e8e8"/>
    <path d="M10 120 L40 40 L190 60 L190 120Z" fill="#ff7a1a"/><circle cx="50" cy="160" r="22" fill="#111"/><circle cx="240" cy="160" r="22" fill="#111"/></g>
  <!-- carro laboratorio -->
  <rect x="1100" y="730" width="90" height="45" fill="#e8e8e8"/><rect x="1100" y="724" width="90" height="8" fill="#ff7a1a"/>
  <g font-family="JetBrains Mono, monospace" font-size="16" fill="#8a94a0"><text x="290" y="300">A</text><text x="792" y="300">B</text><text x="1292" y="300">C</text></g>
  </svg>`;
}
