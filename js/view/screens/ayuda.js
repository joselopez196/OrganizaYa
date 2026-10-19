/* ===== VISTA · js/view/screens/ayuda.js =====
   Pantalla de ayuda y ventana "Cómo funciona". */
function escGuide(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function guideFeature(i){const f=[
['Hoy','Resumen diario, avisos y contadores.'],
['Tareas','Crea, edita y completa pendientes.'],
['Calendario','Mes y semana para planificar.'],
['Proyectos','Organiza trabajo y progreso.'],
['Archivos','Guarda y consulta tus documentos.'],
['Accesos','Apps y páginas favoritas a mano.'],
['Respaldo','Exporta, importa y sincroniza.']
][i]||['OrganizaYa','Todo en un solo lugar.'];return `<div class="guideitem"><b>${escGuide(f[0])}</b><span>${escGuide(f[1])}</span></div>`}
function tourPreview(){
  return `<div class="guidepreview" aria-label="Vista previa de OrganizaYa en web y móvil">
    <div class="previewcard"><div class="previewlabel"><span>Vista web</span><b>Escritorio · Tablet</b></div>
      <div class="webframe"><div class="webside"><div class="webbrand"><img src="icons/organizaya-mark.svg" alt="">OrganizaYa</div><i class="webnav on"></i><i class="webnav"></i><i class="webnav"></i><i class="webnav"></i><i class="webnav"></i><i class="webnav"></i></div>
        <div class="webmain"><div class="webtop"><div class="webtitle">Hoy</div><div class="webhow">¿Cómo funciona?</div></div><div class="webclock">1:40 <small>p. m.</small></div>
          <div class="webgrid"><div class="webstat"><i></i><b>2</b><span>Vence hoy</span></div><div class="webstat"><i></i><b>1</b><span>Pendientes</span></div><div class="webstat"><i></i><b>0</b><span>Hecho</span></div></div>
          <div class="webrow"></div><div class="webrow long"></div><div class="webchips"><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
    </div>
    <div class="previewcard"><div class="previewlabel"><span>Vista móvil</span><b>Android · iOS</b></div>
      <div class="phonewrap"><div class="phoneframe"><div class="phonescreen"><div class="phoneisland"></div><div class="phonename"><img src="icons/organizaya-mark.svg" alt="">OrganizaYa</div><div class="phonehow">¿Cómo funciona?</div><div class="phoneclock">Hoy</div>
        <div class="phonestats"><div class="phonestat"><b>2</b><span>Vence hoy</span></div><div class="phonestat"><b>1</b><span>Pendientes</span></div><div class="phonestat"><b>0</b><span>Hecho</span></div></div>
        <div class="phonebar"></div><div class="phonebar w"></div><div class="phonechips"><i></i><i></i><i></i><i></i></div>
      </div></div></div>
    </div>
  </div>`
}
function tourEnd(){closeM()}
function vAyuda(){
  $('#main').innerHTML=`<div class="guidehead"><div class="guidebrand"><img src="icons/organizaya-mark.svg" alt="OrganizaYa"><div><b>Cómo usar OrganizaYa</b><span>Tu centro productivo</span></div></div><span class="guidebadge">Guía interactiva · 7 pasos</span></div>
  <div class="guidetext"><h3>Todo en un solo lugar.</h3><p>Aprende a usar tus tareas, calendario, proyectos, archivos, accesos y respaldo con una guía sencilla.</p></div>
  <div class="guidefeature">${AY.map((a,i)=>`<div class="guideitem"><b>${i+1}. ${escGuide(a[0])}</b><span>${escGuide(a[1])}</span></div>`).join('')}</div>
  <section class="helpsection" aria-labelledby="datosTitle"><h3 id="datosTitle">Guardado y sincronización</h3><p>OrganizaYa guarda tus tareas, proyectos, preferencias y accesos en el almacenamiento de este navegador. Sin configurar una cuenta de sincronización, esos datos no se copian a otros dispositivos.</p><p>Para usar más de un dispositivo, abre <b>Hoy → Configurar sincronización</b> y conecta tu propio proyecto Supabase. Usa solo la clave pública, ejecuta el SQL que ofrece la app y entra con la misma cuenta en cada dispositivo. Si el estado no dice que la sincronización está activa, trabaja como si solo hubiera una copia local.</p><p>Los archivos necesitan almacenamiento aparte. Los formatos compatibles de hasta 20 MB se pueden subir desde Archivos cuando la integración de nube está disponible; archivos mayores o no compatibles permanecen en el dispositivo donde se añadieron.</p></section>
  <section class="helpsection" aria-labelledby="respaldoTitle"><h3 id="respaldoTitle">Crear y recuperar una copia</h3><ol><li>En Hoy o en el menú, pulsa <b>Descargar copia</b> o <b>Exportar todo</b> y guarda el archivo JSON en un lugar seguro.</li><li>En el dispositivo nuevo, abre OrganizaYa y pulsa <b>Restaurar copia</b> o <b>Importar copia</b>.</li><li>Comprueba el resumen del archivo antes de confirmar. La importación reemplaza las tareas, proyectos y accesos actuales; descarga primero una copia de lo que tienes ahora.</li><li>Los datos de archivos solo se restauran si la copia los incluye y el navegador pudo guardarlos. Abre algunos archivos después de restaurar para comprobarlos.</li></ol><p>Haz una copia periódica y antes de borrar datos del navegador, cambiar de dispositivo o importar otra copia. La sincronización ayuda a mantener dispositivos al día, pero una copia descargada ofrece una vía de recuperación independiente.</p></section>
  <section class="helpsection" aria-labelledby="usoTitle"><h3 id="usoTitle">Accesibilidad y uso en móvil</h3><p>Usa Tab para recorrer controles y Enter o Espacio para activar las tarjetas enfocadas. Los botones y formularios tienen etiquetas para tecnologías de asistencia; en móvil, el menú queda abajo y los controles táctiles tienen áreas amplias. Puedes reducir las animaciones desde las preferencias del sistema.</p><p>Si no puedes abrir un archivo, revisa si aparece como “Solo aquí”, vuelve a este dispositivo o sube una copia compatible desde la sección Archivos.</p></section>
  <div class="responsivehint"><span>Web</span><span>Android</span><span>iOS</span><span>Tablet</span><span>Escritorio</span><span>Control táctil</span></div>`
}
function tour(i){
  i=Number.isFinite(i)?i:0;
  i=Math.max(0,Math.min(i,AY.length-1));
  const a=AY[i],u=i===AY.length-1;
  openM(`<div class="guidebox" role="dialog" aria-modal="true" aria-labelledby="guideTitle">
    <div class="guidehead"><div class="guidebrand"><img src="icons/organizaya-mark.svg" alt=""><div><b id="guideTitle">OrganizaYa</b><span>Tu centro productivo · Paso ${i+1} de ${AY.length}</span></div></div><span class="guidebadge">Guía interactiva</span></div>
    <div class="guidetext"><h3>${escGuide(a[0])}</h3><p>${escGuide(a[1])}</p></div>
    <div class="guidesteps">${AY.map((_,j)=>`<i class="guidestep ${j===i?'on':''}"></i>`).join('')}</div>
    ${tourPreview()}
    <div class="guidefeature">${AY.map((_,j)=>guideFeature(j)).join('')}</div>
    <div class="guidefooter"><div class="guideprogress"><i style="width:${Math.round(((i+1)/AY.length)*100)}%"></i></div><div class="row" style="margin:0">${i?'<button class="btn g" onclick="tour('+(i-1)+')">Atrás</button>':'<button class="btn g" onclick="tourEnd()">Cerrar</button>'}${u?'<button class="btn" onclick="tourEnd()">Listo</button>':'<button class="btn" onclick="tour('+(i+1)+')">Siguiente</button>'}</div></div>
  </div>`)
}
