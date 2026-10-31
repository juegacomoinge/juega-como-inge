/* =========================================================
   OBRA · scenes/fallback2d.js
   Vista 2D interactiva del escenario (alzado ilustrado).
   Se usa si WebGL/Three.js no están disponibles o si el
   jugador elige la vista 2D. Misma API que la escena 3D.
   ========================================================= */

export function mountScene2D({ container, hotspots, isFound, onSelect, art }) {
  const root = document.createElement('div');
  root.className = 'scene2d';
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.innerHTML = art || '';
  root.append(wrap);
  container.append(root);

  const markers = hotspots.map(hs => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'marker';
    el.style.left = hs.pos2d[0] + '%';
    el.style.top = hs.pos2d[1] + '%';
    el.setAttribute('aria-label', 'Inspeccionar: ' + hs.name);
    el.addEventListener('click', () => onSelect(hs.id));
    wrap.append(el);
    return { hs, el };
  });

  function refresh() {
    markers.forEach(({ hs, el }) => {
      const f = isFound(hs.id);
      el.classList.toggle('found', f);
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">${f ? '<path d="M5 12.5l4.5 4.5L19 7.5"/>' : '<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>'}</svg><span class="lbl">${hs.name}</span>`;
    });
  }
  refresh();

  // Ajusta el lienzo 16:9 al espacio disponible
  const fit = () => {
    const w = container.clientWidth, hh = container.clientHeight;
    const ww = Math.min(w, hh * 16 / 9);
    wrap.style.width = ww + 'px';
  };
  const ro = new ResizeObserver(fit); ro.observe(container); fit();

  return {
    focus(id) {
      const m = markers.find(x => x.hs.id === id);
      if (m) { m.el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }, { transform: 'scale(1)' }], { duration: 600 }); }
    },
    resetView() { /* vista fija */ },
    setTool() { /* el efecto de linterna se aplica por CSS en el contenedor */ },
    shake() { root.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-6px,3px)' }, { transform: 'translate(5px,-4px)' }, { transform: 'translate(0,0)' }], { duration: 500, iterations: 2 }); },
    collapse() { root.classList.add('collapsed2d'); },
    refresh,
    dispose() { ro.disconnect(); root.remove(); }
  };
}
