/* ===== VISTA · js/view/screens/hoy.js =====
   Panel Hoy: resumen diario, progreso semanal, creación rápida y accesos existentes. */
function vHoy(){
  const td=today();
  const pend=S.tasks.filter(t=>!t.done);
  const due=pend.filter(t=>t.due&&t.due<=td).sort(cmpT);
  const todayDue=pend.filter(t=>t.due===td).sort(cmpT);
  const late=due.filter(t=>t.due<td).length;
  const undated=pend.filter(t=>!t.due).reverse();
  const doneToday=S.tasks.filter(t=>t.done&&t.doneAt===td);
  const upcoming=pend.filter(t=>t.due&&t.due>td&&dd(t.due)<=7).sort(cmpT).slice(0,5);
  const act=S.projects.filter(p=>!p.arch&&p.st!=='terminado'&&S.tasks.some(t=>t.p===p.id&&!t.done));
  const allToday=todayDue.length+doneToday.length;
  const progress=allToday?Math.round(doneToday.length/allToday*100):0;
  const week=Array.from({length:7},(_,i)=>addD(td,i-6));
  const weekCounts=week.map(k=>S.tasks.filter(t=>t.done&&t.doneAt===k).length);
  const weekMax=Math.max(1,...weekCounts);
  const weekLabels=week.map(k=>new Date(k+'T12:00:00').toLocaleDateString('es-PE',{weekday:'short'}).replace('.',''));
  const go=(f,n,l,x)=>`<div class="st go" role="button" tabindex="0" aria-label="${l}: ${n}" onclick="${f}()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${f}()}"><b ${x||''}>${n}</b><span class="m">${l}</span></div>`;
  const dayGreeting=(()=>{const h=new Date().getHours();return h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'})();
  const dayMessage=late?(`Tienes ${late} tarea${late===1?' pendiente':'s pendientes'} de días anteriores. Vamos paso a paso.`):todayDue.length?'¡Un paso a la vez! Empieza por la tarea más importante.':doneToday.length?'Buen trabajo. Sigue a tu ritmo y deja espacio para descansar.':'Tu día está listo para planificarse. Añade una tarea pequeña para empezar.';
  $('#main').innerHTML=`
    <div class="homehead">
      <div class="brandmini"><img src="icons/organizaya-mark.svg" alt=""><div><strong>OrganizaYa</strong><span>Tu centro productivo</span></div></div>
      <div class="home-actions">
        <button class="btn g" onclick="openSpotlight()" aria-label="Búsqueda global">⌕ Buscar <span class="kbd">Ctrl K</span></button>
        <button class="btn g" onclick="focusOpen()">◷ Concentración</button>
        <button class="btn g howbtn" onclick="tour(0)">¿Cómo funciona?</button>
      </div>
    </div>
    <section class="today-intro">
      <div><p class="eyebrow">${new Date().toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long'})}</p><h2>Hoy</h2><p class="sub">${dayGreeting}. ${esc(dayMessage)}</p></div>
      <div id="clk" class="clk">${clockHtml()}</div>
    </section>
    ${avisosHtml()}
    <section class="quick-create" aria-labelledby="quickCreateTitle">
      <div class="quick-create-title"><div><b id="quickCreateTitle">Captura una tarea rápidamente</b><p class="m">Anota lo que tienes pendiente y continúa con tu día.</p></div><span class="quick-create-icon" aria-hidden="true">+</span></div>
      <div class="row hq"><input type="text" id="th" placeholder="¿Qué necesitas hacer?" aria-label="Nueva tarea" onkeydown="if(event.key==='Enter')addTH()">${dkBtn('thd',td)}<button class="btn" onclick="addTH()">Agregar tarea</button><button class="btn g" onclick="voiceTaskStart()" title="Dictar tarea" aria-label="Dictar tarea">🎙 Voz</button></div>
      <details class="task-options"><summary>Opciones adicionales: hora, prioridad, proyecto y notas</summary>
        <div class="task-options-grid">
          <label><span class="fieldlabel">Hora</span><input type="time" id="thtime" aria-label="Hora de la tarea"></label>
          <label><span class="fieldlabel">Prioridad</span><select id="thpri" aria-label="Prioridad"><option value="0">Baja</option><option value="1">Media</option><option value="2">Alta</option></select></label>
          <label><span class="fieldlabel">Proyecto</span><select id="thproj" aria-label="Proyecto"><option value="">Sin proyecto</option>${S.projects.filter(p=>!p.arch).map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></label>
          <label><span class="fieldlabel">Notas</span><input type="text" id="thnote" placeholder="Detalles opcionales" aria-label="Notas de la tarea"></label>
        </div>
      </details>
    </section>
    <div class="stats home-stats">
      ${go('goHoy',todayDue.length,'Vencen hoy')}
      ${go('goTar',pend.length,'Pendientes')}
      ${go('goTar',late,'Atrasadas',late?'class="late"':'')}
      ${go('goHec',doneToday.length,'Completadas hoy')}
    </div>
    <section class="home-section">
      <div class="section-heading"><div><h3>Tu progreso de hoy</h3><p class="m">Tareas completadas frente a las programadas para hoy.</p></div><strong class="progress-label">${progress}%</strong></div>
      <div class="day-progress" role="progressbar" aria-label="Progreso de hoy" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
      <p class="m progress-caption">${doneToday.length} completada${doneToday.length===1?'':'s'} · ${todayDue.length} pendiente${todayDue.length===1?'':'s'} con fecha de hoy</p>
    </section>
    <section class="home-section">
      <div class="section-heading"><div><h3>Últimos 7 días</h3><p class="m">Actividades completadas por día.</p></div><span class="kbd">Semana</span></div>
      <div class="week-chart" role="img" aria-label="Gráfico de tareas completadas en los últimos siete días">${week.map((k,i)=>`<div class="week-day" title="${weekCounts[i]} completadas"><div class="week-bar-wrap"><span class="week-bar" style="height:${Math.max(weekCounts[i]?8:3,weekCounts[i]/weekMax*100)}%" aria-hidden="true"></span></div><b>${weekCounts[i]}</b><span>${weekLabels[i]}</span></div>`).join('')}</div>
    </section>
    <section class="home-section">
      <div class="section-heading"><div><h3>Acceso rápido</h3><p class="m">Tus herramientas favoritas a un toque.</p></div><button class="btn g" onclick="tab='accesos';draw()">Gestionar</button></div>
      <div class="lg home-links">${vis().slice(0,8).map(l=>linkTile(l,0)).join('')||'<div class="home-empty">Añade accesos para abrir tus herramientas favoritas desde aquí.</div>'}</div>
      ${vis().length>8?'<div class="m" style="margin-top:8px"><a href="#" onclick="tab=\'accesos\';draw();return false" style="color:var(--acc)">Ver todos los accesos</a></div>':''}
    </section>
    <section class="home-section">
      <div class="section-heading"><div><h3 class="${late?'late-heading':''}">${late?'Atrasadas y para hoy':'Para hoy'}</h3><p class="m">Empieza por lo urgente y luego continúa con lo importante.</p></div><button class="btn g" onclick="goTar()">Ver tareas</button></div>
      ${due.slice(0,8).map(taskRow).join('')||`<div class="day-clear"><div class="day-clear-icon">✓</div><h3>${doneToday.length?'Buen trabajo por hoy':'¡Tu día está despejado!'}</h3><p>${doneToday.length?'Ya completaste '+doneToday.length+' tarea(s) hoy. Puedes revisar lo que viene o tomar un descanso.':'No tienes tareas vencidas ni programadas para hoy. Puedes planificar con calma.'}</p><button class="btn" onclick="tab='tareas';draw();setTimeout(()=>$('#tt')&&$('#tt').focus(),30)">Planificar tareas</button></div>`}
      ${due.length>8?`<div class="m"><a href="#" onclick="goTar();return false" style="color:var(--acc)">Ver las ${due.length} tareas</a></div>`:''}
    </section>
    ${upcoming.length?`<section class="home-section"><div class="section-heading"><div><h3>Próximos 7 días</h3><p class="m">Una mirada a lo que se acerca.</p></div></div>${upcoming.map(taskRow).join('')}</section>`:''}
    ${undated.length?`<section class="home-section"><div class="section-heading"><div><h3>Sin fecha</h3><p class="m">Tareas que puedes programar cuando tengas un momento.</p></div></div>${undated.slice(0,5).map(taskRow).join('')}${undated.length>5?`<div class="m"><a href="#" onclick="goTar();return false" style="color:var(--acc)">Ver las ${undated.length} tareas sin fecha</a></div>`:''}</section>`:''}
    ${act.length?`<section class="home-section"><div class="section-heading"><div><h3>Proyectos activos</h3><p class="m">Proyectos con tareas aún por terminar.</p></div><button class="btn g" onclick="tab='proyectos';draw()">Ver proyectos</button></div><div class="pg">${act.map(projCard).join('')}</div></section>`:''}
    ${S.files.length?`<section class="home-section"><div class="section-heading"><div><h3>Últimos archivos</h3><p class="m">Continúa donde lo dejaste.</p></div><button class="btn g" onclick="tab='archivos';draw()">Ver archivos</button></div><div class="grid" id="gf">${S.files.slice(-6).reverse().map(fileCard).join('')}</div></section>`:''}
  `;
  loadPv(S.files.slice(-6));
  const lb=S.lastBackup,dias=lb?Math.floor((new Date(td)-new Date(lb))/864e5):null,old=dias===null||dias>=7;
  const cuando=dias===null?'Aún no haces ninguna copia':dias===0?'Última copia: hoy':dias===1?'Última copia: ayer':'Última copia: hace '+dias+' días';
  const modo=sbOn?'Sincronización Supabase activa · '+esc(sb&&sb.em||''):cloud?'Sincronización de cuenta activa':'Guardado en este dispositivo · sin sincronización entre dispositivos';
  $('#main').insertAdjacentHTML('beforeend',`<section class="backup-panel" aria-labelledby="backupTitle"><div class="rs" style="${old?'border-color:#d97706':''}"><div><b id="backupTitle">Copias y sincronización</b><div class="m">${cuando}${old&&dias!==null?'. Haz otra copia.':''}</div><div class="m save-mode">${modo}</div></div><span class="rb"><button class="btn g" onclick="exportar()">Descargar copia</button><button class="btn g" onclick="$('#imp').click()">Restaurar copia</button><button class="btn g" onclick="sbUi()">${sbOn?'Estado de sincronización':'Configurar sincronización'}</button>${!isStandalone()?'<button class="btn g" onclick="instalarApp()">📲 Instalar app</button>':''}${cloud&&ast&&S.files.some(f=>!f.aid)?'<button class="btn g" onclick="syncFiles()">Subir archivos compatibles</button>':''}</span></div><details class="backup-help"><summary>¿Dónde están mis datos y cómo los recupero?</summary><div class="m"><p>Las tareas, proyectos, preferencias y accesos se guardan primero en el almacenamiento de este navegador. Si borras los datos del navegador o cambias de dispositivo, una copia descargada te permite recuperarlos.</p><p>La sincronización entre dispositivos es opcional. Configúrala con tu propia cuenta Supabase; si no aparece como activa, tus cambios no están sincronizados. Los archivos pueden requerir subirse aparte y algunos formatos o archivos de más de 20 MB se quedan solo en este dispositivo.</p><ol><li>Pulsa <b>Descargar copia</b> y guarda el archivo JSON en un lugar seguro.</li><li>Para recuperarla en otro dispositivo, abre OrganizaYa y pulsa <b>Restaurar copia</b>.</li><li>La importación reemplaza las tareas, proyectos y accesos actuales. Descarga una copia del estado actual antes de importar.</li><li>Los archivos incluidos en la copia se restauran junto con los datos; si faltan sus datos binarios, el nombre puede aparecer sin que el archivo se pueda abrir.</li></ol></div></details>${cloud&&bkc?'<details class="m" style="margin-top:8px"><summary style="cursor:pointer">Copias automáticas en la nube</summary><div id="bkl"></div></details>':''}</section><div class="storage-tag" id="storageStatus">Almacenamiento: Calculando...</div>`);loadBk();setTimeout(checkStorageUsage,100);
}
