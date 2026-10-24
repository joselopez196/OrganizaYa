/* ===== CONTROLADOR · js/controller/system.js =====
   Controlador del sistema: instalación, notificaciones, errores, teclado, conexión. */
addEventListener('error',e=>{try{toast('Error: '+(e.message||'desconocido')+(e.lineno?' (línea '+e.lineno+')':''))}catch(_){}});
addEventListener('unhandledrejection',e=>{try{console.error('[OrganizaYa] Promesa rechazada:',e.reason);toast('Error: '+((e.reason&&e.reason.message)||e.reason||'desconocido'))}catch(_){}});
let dip=null;
const isIOSDevice=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isStandalone=()=>window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;
function instalarIOS(){openM(`<div class="box"><div class="m">OrganizaYa · Instalación</div><b style="font-size:1.2rem">Instalar en iPhone o iPad</b><p>En Safari toca <b>Compartir</b> → <b>Añadir a pantalla de inicio</b> → <b>Añadir</b>.</p><div class="row" style="margin:0"><button class="btn" onclick="closeM()">Entendido</button></div></div>`)}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;draw()});
addEventListener('appinstalled',()=>{dip=null;draw();toast('App instalada')});
async function instalar(){if(!dip)return;try{dip.prompt();await dip.userChoice}catch(e){}dip=null;draw()}
addEventListener('offline',()=>toast('Sin conexión. La app sigue funcionando con tus datos guardados'));
addEventListener('online',()=>toast('Conexión recuperada'));
/* Notificaciones del sistema (se muestran al abrir la app; no hay servidor que las envie con la app cerrada) */
const nOk=()=>{try{return 'Notification' in window}catch(e){return false}};
function notiCheck(force){try{if(!nOk()||Notification.permission!=='granted')return;const td=today();if(!force&&localStorage.getItem('ms-noti')===td)return;const it=avisosList();if(!it.length)return;localStorage.setItem('ms-noti',td);
  const body=it.slice(0,4).map(([d,k,n])=>k+': '+n+' · '+venceTxt(d)).join('\n')+(it.length>4?'\ny '+(it.length-4)+' más':''),t='OrganizaYa · '+it.length+(it.length>1?' avisos':' aviso'),opt={body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:'ms-avisos'};
  const direct=()=>{try{new Notification(t,opt)}catch(e){}};
  if('serviceWorker' in navigator)navigator.serviceWorker.getRegistration().then(r=>r?r.showNotification(t,opt):direct()).catch(direct);else direct()}catch(e){}}
function notiOn(){try{Notification.requestPermission().then(p=>{if(p==='granted'){toast('Notificaciones activadas');notiCheck(true)}else toast('No se dieron permisos de notificación');draw()})}catch(e){toast('Este navegador no permite notificaciones')}}
function instalarApp(){if(isStandalone()){toast('La app ya está instalada en tu dispositivo');return}if(isIOSDevice()){instalarIOS();return}if(dip){dip.prompt().then(()=>{dip.userChoice.then(c=>{if(c&&c.outcome==='accepted')toast('¡App instalada con éxito!');dip=null;draw()})}).catch(()=>{});return}openM(`<div class="box"><div class="m">OrganizaYa · Instalar como App</div><b style="font-size:1.2rem">Instalar en tu dispositivo</b><p>Para abrir OrganizaYa como una <b>App independiente</b> (a pantalla completa y sin barra de navegador):</p><ul style="padding-left:20px;margin:8px 0;line-height:1.6"><li><b>En Android / Chrome:</b> Toca el menú (⋮) arriba a la derecha y selecciona <b>"Instalar aplicación"</b> o <b>"Añadir a la pantalla de inicio"</b>.</li><li><b>En iPhone / Safari:</b> Toca el botón <b>Compartir</b> (cuadro con flecha ↑) y luego <b>"Añadir a pantalla de inicio"</b>.</li><li><b>En Computadora (Chrome / Edge):</b> Haz clic en el ícono de instalar en la barra de direcciones o en Menú → <b>"Instalar OrganizaYa"</b>.</li></ul><div class="row" style="margin:12px 0 0;justify-content:flex-end"><button class="btn" onclick="closeM()">Entendido</button></div></div>`)}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeM();if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.it,.pc,.pv')){e.preventDefault();e.target.click()}});
function pwa(){try{if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){navigator.serviceWorker.register('./service-worker.js').then(reg=>{reg.addEventListener('updatefound',()=>{const nw=reg.installing;if(nw){nw.addEventListener('statechange',()=>{if(nw.state==='installed'&&navigator.serviceWorker.controller){toast('Nueva versión disponible · Actualiza la página')}})}})}).catch(()=>{})}}catch(e){}try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})}catch(e){}}
