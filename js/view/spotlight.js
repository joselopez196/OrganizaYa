/* ===== VISTA · js/view/spotlight.js =====
   Buscador Global (Ctrl+K), atajos de teclado y síntesis de audio Web. */
let spotOpen = false, spotIdx = 0, spotResults = [];

const playChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {}
};

function openSpotlight() {
  const sp = $('#spotlight');
  if (!sp) return;
  if (!spotOpen) hPush();
  spotOpen = true;
  spotIdx = 0;
  sp.innerHTML = `<div class="spot-box" role="dialog" aria-modal="true" aria-label="Búsqueda rápida">
    <div class="spot-head">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input type="text" id="spotInput" placeholder="Buscar tareas, proyectos, archivos o accesos…" autocomplete="off" spellcheck="false" oninput="renderSpotlight(this.value)">
      <button class="x" onclick="closeSpotlight()" aria-label="Cerrar">×</button>
    </div>
    <div class="spot-body" id="spotBody"></div>
    <div class="spot-foot">
      <span>Navegar <span class="kbd">↑</span> <span class="kbd">↓</span> · Abrir <span class="kbd">↵</span></span>
      <span>Cerrar <span class="kbd">Esc</span></span>
    </div>
  </div>`;
  sp.style.display = 'grid';
  renderSpotlight('');
  const inp = $('#spotInput');
  if (inp) inp.focus();
}

function closeSpotlight(fp) {
  const had = spotOpen;
  spotOpen = false;
  const sp = $('#spotlight');
  if (sp) {
    sp.style.display = 'none';
    sp.innerHTML = '';
  }
  if (had && fp !== true) hBack();
}

function renderSpotlight(q) {
  const b = $('#spotBody');
  if (!b) return;
  q = (q || '').trim().toLowerCase();
  spotResults = [];

  if (!q) {
    const acts = [
      { t: 'Nueva tarea rápida', m: 'Crear tarea', icon: '+', fn: () => { closeSpotlight(); tab = 'tareas'; draw(); setTimeout(() => $('#tt') && $('#tt').focus(), 50); } },
      { t: 'Nuevo proyecto', m: 'Crear proyecto', icon: '📁', fn: () => { closeSpotlight(); tab = 'proyectos'; draw(); setTimeout(() => $('#pn') && $('#pn').focus(), 50); } },
      { t: 'Ver Calendario', m: 'Ir a Calendario', icon: '📅', fn: () => { closeSpotlight(); tab = 'calendario'; draw(); } },
      { t: 'Ver Accesos directos', m: 'Ir a Accesos', icon: '🚀', fn: () => { closeSpotlight(); tab = 'accesos'; draw(); } },
      { t: 'Cambiar tema claro/oscuro', m: 'Tema', icon: '🌓', fn: () => { closeSpotlight(); cycleTheme(); } },
      { t: 'Atajos de teclado', m: 'Ver atajos', icon: '⌨', fn: () => { closeSpotlight(); shortcutsModal(); } }
    ];
    let h = '<div class="spot-sec">Acciones rápidas</div>';
    acts.forEach((a, idx) => {
      spotResults.push(a);
      h += `<div class="spot-item ${idx === spotIdx ? 'on' : ''}" onclick="spotExec(${idx})" onmouseenter="spotSetIdx(${idx})"><i>${a.icon}</i><span class="stitle">${esc(a.t)}</span><span class="smeta">${esc(a.m)}</span></div>`;
    });

    const pend = S.tasks.filter(t => !t.done).slice(0, 5);
    if (pend.length) {
      h += '<div class="spot-sec">Tareas próximas</div>';
      pend.forEach(t => {
        const item = { t: t.title, m: fd(t.due), icon: '✓', fn: () => { closeSpotlight(); editT(t.id); } };
        const idx = spotResults.length;
        spotResults.push(item);
        h += `<div class="spot-item ${idx === spotIdx ? 'on' : ''}" onclick="spotExec(${idx})" onmouseenter="spotSetIdx(${idx})"><i>${item.icon}</i><span class="stitle">${esc(item.t)}</span><span class="smeta">${esc(item.m)}</span></div>`;
      });
    }
    b.innerHTML = h;
    return;
  }

  const matchTasks = S.tasks.filter(t => t.title.toLowerCase().includes(q) || (t.note && t.note.toLowerCase().includes(q))).slice(0, 6);
  const matchProjs = S.projects.filter(p => p.name.toLowerCase().includes(q)).slice(0, 4);
  const matchFiles = S.files.filter(f => f.name.toLowerCase().includes(q)).slice(0, 4);
  const matchLinks = S.links.filter(l => l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)).slice(0, 4);

  let h = '';
  if (matchTasks.length) {
    h += '<div class="spot-sec">Tareas (' + matchTasks.length + ')</div>';
    matchTasks.forEach(t => {
      const item = { t: t.title, m: t.done ? 'Hecha' : fd(t.due), icon: t.done ? '☑' : '☐', fn: () => { closeSpotlight(); editT(t.id); } };
      const idx = spotResults.length;
      spotResults.push(item);
      h += `<div class="spot-item ${idx === spotIdx ? 'on' : ''}" onclick="spotExec(${idx})" onmouseenter="spotSetIdx(${idx})"><i>${item.icon}</i><span class="stitle">${esc(item.t)}</span><span class="smeta">${esc(item.m)}</span></div>`;
    });
  }

  if (matchProjs.length) {
    h += '<div class="spot-sec">Proyectos (' + matchProjs.length + ')</div>';
    matchProjs.forEach(p => {
      const item = { t: p.name, m: cap(p.st || 'activo'), icon: '📁', fn: () => { closeSpotlight(); openP(p.id); } };
      const idx = spotResults.length;
      spotResults.push(item);
      h += `<div class="spot-item ${idx === spotIdx ? 'on' : ''}" onclick="spotExec(${idx})" onmouseenter="spotSetIdx(${idx})"><i>${item.icon}</i><span class="stitle" style="color:${p.color}">${esc(item.t)}</span><span class="smeta">${esc(item.m)}</span></div>`;
    });
  }

  if (matchFiles.length) {
    h += '<div class="spot-sec">Archivos (' + matchFiles.length + ')</div>';
    matchFiles.forEach(f => {
      const item = { t: f.name, m: size(f.size), icon: '📄', fn: () => { closeSpotlight(); openF(f.id); } };
      const idx = spotResults.length;
      spotResults.push(item);
      h += `<div class="spot-item ${idx === spotIdx ? 'on' : ''}" onclick="spotExec(${idx})" onmouseenter="spotSetIdx(${idx})"><i>${item.icon}</i><span class="stitle">${esc(item.t)}</span><span class="smeta">${esc(item.m)}</span></div>`;
    });
  }

  if (matchLinks.length) {
    h += '<div class="spot-sec">Accesos directos (' + matchLinks.length + ')</div>';
    matchLinks.forEach(l => {
      const item = { t: l.name, m: l.url.replace(/^https?:\/\//, '').split('/')[0], icon: '↗', fn: () => { closeSpotlight(); window.open(safeU(l.url, l), '_blank', 'noopener,noreferrer'); } };
      const idx = spotResults.length;
      spotResults.push(item);
      h += `<div class="spot-item ${idx === spotIdx ? 'on' : ''}" onclick="spotExec(${idx})" onmouseenter="spotSetIdx(${idx})"><i>${item.icon}</i><span class="stitle">${esc(item.t)}</span><span class="smeta">${esc(item.m)}</span></div>`;
    });
  }

  if (!spotResults.length) {
    h = '<div class="empty" style="padding:24px 16px;text-align:center">No se encontraron resultados para "' + esc(q) + '"</div>';
  }

  b.innerHTML = h;
}

function spotSetIdx(i) {
  spotIdx = i;
  document.querySelectorAll('.spot-item').forEach((e, idx) => e.classList.toggle('on', idx === i));
}

function spotExec(i) {
  if (spotResults[i] && spotResults[i].fn) spotResults[i].fn();
}

function shortcutsModal() {
  openM(`<div class="box">
    <b>Atajos de teclado</b>
    <div class="m" style="margin-bottom:12px">Controla OrganizaYa a toda velocidad desde el teclado:</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--line)"><span>Búsqueda global rápida</span><div><span class="kbd">Ctrl</span> + <span class="kbd">K</span></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--line)"><span>Ir a Hoy</span><div><span class="kbd">1</span> o <span class="kbd">H</span></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--line)"><span>Ir a Tareas</span><div><span class="kbd">2</span> o <span class="kbd">T</span></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--line)"><span>Ir a Calendario</span><div><span class="kbd">3</span> o <span class="kbd">C</span></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--line)"><span>Ir a Proyectos</span><div><span class="kbd">4</span> o <span class="kbd">P</span></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--line)"><span>Ir a Archivos</span><div><span class="kbd">5</span> o <span class="kbd">A</span></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--line)"><span>Ir a Accesos</span><div><span class="kbd">6</span> o <span class="kbd">L</span></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--line)"><span>Nueva tarea rápida</span><div><span class="kbd">N</span></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--line)"><span>Alternar modo oscuro/claro</span><div><span class="kbd">D</span></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid var(--line)"><span>Cerrar cualquier ventana</span><div><span class="kbd">Esc</span></div></div>
    </div>
    <div class="row" style="margin:16px 0 0;justify-content:flex-end"><button class="btn" onclick="closeM()">Entendido</button></div>
  </div>`);
}

document.addEventListener('keydown', e => {
  const isInput = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (spotOpen) closeSpotlight(); else openSpotlight();
    return;
  }
  if (spotOpen) {
    if (e.key === 'Escape') { closeSpotlight(); e.preventDefault(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      spotIdx = (spotIdx + 1) % Math.max(1, spotResults.length);
      spotSetIdx(spotIdx);
      const onEl = document.querySelector('.spot-item.on'); if (onEl) onEl.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      spotIdx = (spotIdx - 1 + spotResults.length) % Math.max(1, spotResults.length);
      spotSetIdx(spotIdx);
      const onEl = document.querySelector('.spot-item.on'); if (onEl) onEl.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      spotExec(spotIdx);
      return;
    }
    return;
  }

  if (!isInput) {
    if (e.key === '?') shortcutsModal();
    else if (e.key === '1' || e.key.toLowerCase() === 'h') { tab = 'hoy'; draw(); }
    else if (e.key === '2' || e.key.toLowerCase() === 't') { tab = 'tareas'; draw(); }
    else if (e.key === '3' || e.key.toLowerCase() === 'c') { tab = 'calendario'; draw(); }
    else if (e.key === '4' || e.key.toLowerCase() === 'p') { tab = 'proyectos'; draw(); }
    else if (e.key === '5' || e.key.toLowerCase() === 'a') { tab = 'archivos'; draw(); }
    else if (e.key === '6' || e.key.toLowerCase() === 'l') { tab = 'accesos'; draw(); }
    else if (e.key.toLowerCase() === 'n') { tab = 'tareas'; draw(); setTimeout(() => $('#tt') && $('#tt').focus(), 40); }
    else if (e.key.toLowerCase() === 'd') cycleTheme();
  }
});

async function checkStorageUsage() {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      const used = est.usage ? size(est.usage) : '0 KB';
      const quota = est.quota ? (est.quota > 1e9 ? (est.quota / 1e9).toFixed(0) + ' GB' : size(est.quota)) : '';
      const el = $('#storageStatus');
      if (el) el.textContent = `Almacenamiento local: ${used}${quota ? ' de ' + quota : ''}`;
    }
  } catch (e) {}
}
