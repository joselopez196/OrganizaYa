/* ===== CONTROLADOR · js/controller/sync.js =====
   Controlador de la sincronización con Supabase. */
async function sbAuth(mode){const url=($('#sbu').value||'').trim().replace(/\/+$/,'').replace(/\/(rest|auth)\/v1.*$/,''),key=($('#sbk').value||'').trim(),em=($('#sbe').value||'').trim(),pw=$('#sbp').value||'';
  if(!sbUrlOk(url))return sbMsg('La URL debe verse así: https://tuproyecto.supabase.co');
  if(key.length<20||/\s/.test(key))return sbMsg('Pega la clave pública (anon key) completa');
  if(!/^\S+@\S+\.\S+$/.test(em))return sbMsg('Escribe un correo válido');
  if(pw.length<6)return sbMsg('La contraseña debe tener al menos 6 caracteres');
  sbMsg('Conectando…');
  try{const r=await fetch(url+(mode==='up'?'/auth/v1/signup':'/auth/v1/token?grant_type=password'),{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw})});
    const j=await r.json().catch(()=>({})),t=String(j.msg||j.error_description||j.message||j.error||'');
    if(!r.ok){return sbMsg(/invalid login/i.test(t)?'Correo o contraseña incorrectos. Si es tu primera vez, toca Crear cuenta.':/already registered/i.test(t)?'Ese correo ya tiene cuenta. Toca Entrar.':/not confirmed/i.test(t)?'Primero confirma tu correo: abre el mensaje que te enviaron.':/invalid api key|apikey/i.test(t)?'La clave pública no es correcta.':t||'No se pudo entrar')}
    if(!j.access_token)return sbMsg('Te enviamos un correo para confirmar la cuenta. Ábrelo y luego toca Entrar.');
    sb={url,key,at:j.access_token,rt:j.refresh_token,uid:j.user&&j.user.id,em};if(!sb.uid)return sbMsg('Respuesta inesperada de Supabase');
    sbStore();cloud=null;await sbInit(true);
    if(sbOn){closeM();toast('Sincronización activada')}else sbUi()}
  catch(e){sbMsg('No hay conexión con Supabase. Revisa la URL y tu internet.')}}
async function sbNow(){if(navigator.onLine===false){sbErr='Sin conexión. Tus cambios siguen guardados en este dispositivo y se sincronizarán al volver internet.';sbUi();return}if(sbBusy)return;sbBusy=true;sbMsg('Sincronizando…');try{if(!cloud)await sbInit();if(!cloud||!sbOn)throw new Error('No hay una sesión de sincronización activa');const sn=await cloud.get(),q=JSON.parse(sn.data().json||'null');if(q)applyRemote(q);await cloud.set({json:snap()});sbErr='';draw();toast('Sincronizado');sbUi()}catch(e){sbErr=navigator.onLine===false?'Sin conexión. Tus cambios siguen guardados en este dispositivo.':'No se pudo sincronizar. Revisa la conexión y vuelve a intentarlo.';sbUi()}finally{sbBusy=false}}
async function sbReconnect(){if(navigator.onLine===false)return;try{if(!cloud)await sbInit();if(cloud&&sbOn)await sbNow()}catch(e){}}
function sbOut(){ask('¿Cerrar sesión? Tus datos se quedan en este dispositivo, pero dejarán de sincronizarse.','Cerrar sesión',()=>{try{if(sb&&sb.at)fetch(sb.url+'/auth/v1/logout',{method:'POST',headers:{apikey:sb.key,Authorization:'Bearer '+sb.at}}).catch(()=>{})}catch(e){}
  clearInterval(sbT);sb=null;sbOn=false;cloud=null;sbStore();sbErr='';draw();toast('Sesión cerrada')})}
function sbCopy(){const done=()=>sbMsg('SQL copiado. Pégalo en Supabase > SQL Editor y toca Run.');try{navigator.clipboard.writeText(SBSQL).then(done,()=>sbMsg('No se pudo copiar. Mantén presionado el texto y cópialo.'))}catch(e){sbMsg('No se pudo copiar.')}}
