/* ===== PRODUCTIVIDAD · Pomodoro y dictado opcional ===== */
let focusTimer=null;
const focusDefaults=()=>({duration:25*60,remaining:25*60,running:false,endAt:0,taskId:'',sessions:0});
let focusData=(()=>{try{return Object.assign(focusDefaults(),JSON.parse(localStorage.getItem('organizaya-focus')||'{}'))}catch(e){return focusDefaults()}})();
function focusPersist(){try{localStorage.setItem('organizaya-focus',JSON.stringify(focusData))}catch(e){}}
function focusTasksOptions(){return S.tasks.filter(t=>!t.done).map(t=>`<option value="${esc(t.id)}" ${focusData.taskId===t.id?'selected':''}>${esc(t.title)}</option>`).join('')}
function focusOpen(){
  if(focusData.running)focusTick();
  openM(`<div class="box focus-panel">
    <div class="focus-kicker">MODO CONCENTRACIÓN</div><b class="focus-title">Un paso a la vez</b>
    <p class="sub">Trabaja en una sola tarea y toma descansos breves para mantener el ritmo.</p>
    <label class="fieldlabel" for="focusTask">Tarea (opcional)</label><select id="focusTask" onchange="focusData.taskId=this.value;focusPersist()" class="focus-select"><option value="">Sesión libre, sin tarea asociada</option>${focusTasksOptions()}</select>
    <label class="fieldlabel" for="focusDuration">Duración de la sesión</label><select id="focusDuration" onchange="focusSetDuration(this.value)" class="focus-select">${[[15,'15 minutos'],[25,'25 minutos · Pomodoro'],[45,'45 minutos'],[60,'60 minutos']].map(([n,l])=>`<option value="${n}" ${focusData.duration===n*60?'selected':''}>${l}</option>`).join('')}</select>
    <div class="focus-clock" id="focusClock">25:00</div><div class="focus-progress"><span id="focusProgress"></span></div>
    <p class="focus-status" id="focusStatus" aria-live="polite">Listo cuando tú lo estés.</p>
    <div class="focus-actions"><button class="btn" id="focusStartBtn" onclick="focusStart()">▶ Empezar</button><button class="btn g" onclick="focusPause()">Ⅱ Pausar</button><button class="btn g" onclick="focusReset()">↺ Reiniciar</button></div>
    <div class="focus-foot">Sesiones completadas en este dispositivo: <b id="focusSessions">${focusData.sessions||0}</b></div>
  </div>`);
  focusRender();
  if(focusData.running&&!focusTimer)focusTimer=setInterval(focusTick,1000);
}
function focusSetDuration(minutes){
  if(focusData.running){toast('Pausa la sesión antes de cambiar su duración');return}
  const secs=Math.max(1,Number(minutes)||25)*60;
  focusData.duration=secs;focusData.remaining=secs;focusPersist();focusRender();
}
function focusStart(){
  if(focusData.remaining<=0)focusData.remaining=focusData.duration;
  focusData.running=true;focusData.endAt=Date.now()+focusData.remaining*1000;focusPersist();
  if(!focusTimer)focusTimer=setInterval(focusTick,1000);
  focusRender();
}
function focusPause(){
  if(focusData.running)focusData.remaining=Math.max(0,Math.ceil((focusData.endAt-Date.now())/1000));
  focusData.running=false;focusData.endAt=0;
  if(focusTimer){clearInterval(focusTimer);focusTimer=null}
  focusPersist();focusRender();
}
function focusReset(){
  focusData.running=false;focusData.endAt=0;focusData.remaining=focusData.duration;
  if(focusTimer){clearInterval(focusTimer);focusTimer=null}
  focusPersist();focusRender();
}
function focusTick(){
  if(!focusData.running)return;
  focusData.remaining=Math.max(0,Math.ceil((focusData.endAt-Date.now())/1000));
  if(focusData.remaining===0){
    focusData.running=false;focusData.endAt=0;focusData.sessions=(focusData.sessions||0)+1;focusPersist();
    if(focusTimer){clearInterval(focusTimer);focusTimer=null}
    try{playChime()}catch(e){}
    try{toast('¡Sesión de concentración completada! Tómate un descanso.')}catch(e){}
  }
  focusRender();
}
function focusRender(){
  const clock=document.getElementById('focusClock');if(!clock)return;
  const rem=Math.max(0,focusData.running?Math.ceil((focusData.endAt-Date.now())/1000):focusData.remaining);
  clock.textContent=String(Math.floor(rem/60)).padStart(2,'0')+':'+String(rem%60).padStart(2,'0');
  const bar=document.getElementById('focusProgress');if(bar)bar.style.width=Math.max(0,Math.min(100,(1-rem/focusData.duration)*100))+'%';
  const status=document.getElementById('focusStatus');if(status)status.textContent=focusData.running?'Sesión en marcha. Mantén una sola tarea en foco.':rem===0?'Sesión completada. Buen trabajo.':'Listo cuando tú lo estés.';
  const start=document.getElementById('focusStartBtn');if(start)start.textContent=focusData.running?'▶ Continuar':'▶ Empezar';
  const sessions=document.getElementById('focusSessions');if(sessions)sessions.textContent=focusData.sessions||0;
}
function voiceTaskStart(){
  const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Speech){toast('El dictado por voz no está disponible en este navegador. Puedes escribir la tarea normalmente.');return}
  try{
    const rec=new Speech();rec.lang='es-PE';rec.interimResults=false;rec.maxAlternatives=1;
    rec.onstart=()=>toast('Te escucho… dicta el título de la tarea');
    rec.onresult=e=>{const text=e.results&&e.results[0]&&e.results[0][0]?e.results[0][0].transcript.trim():'';const input=document.getElementById('th');if(input&&text){input.value=text;input.focus();toast('Revisa el texto y pulsa “Agregar tarea” para guardarlo')}}; 
    rec.onerror=()=>toast('No se pudo reconocer la voz. Inténtalo de nuevo o escribe la tarea.');
    rec.start();
  }catch(e){toast('No se pudo iniciar el dictado en este dispositivo')}
}
