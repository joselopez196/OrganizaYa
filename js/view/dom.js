/* ===== VISTA · js/view/dom.js =====
   Piezas básicas de la Vista: avisos (toast), ventanas, confirmación, botón Atrás. */
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',2600)};
const pd={};let undoFn=null;
const undoT=(m,fn)=>{const t=$('#toast');t.innerHTML=esc(m)+' · <button onclick="doUndo()" style="background:none;border:0;color:inherit;font-weight:800;text-decoration:underline;cursor:pointer">Deshacer</button>';undoFn=fn;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>{t.style.display='none';undoFn=null},6000)};
const doUndo=()=>{if(undoFn)undoFn();undoFn=null;$('#toast').style.display='none'};
let mdOpen=false;const openM=h=>{if(!mdOpen){mdOpen=true;hPush()}$('#md').innerHTML=h;$('#md').style.display='grid'},closeM=fp=>{const had=mdOpen;mdOpen=false;$('#md').style.display='none';$('#md').innerHTML='';if(had&&fp!==true)hBack()};
const swatches=(cur)=>`<div class="sw" id="sw">${COL.map(c=>`<button style="--c:${c}" class="${c===cur?'on':''}" data-c="${c}" onclick="pickC(this)" aria-label="Color"></button>`).join('')}</div>`;
const pickC=b=>{document.querySelectorAll('#sw button').forEach(x=>x.classList.remove('on'));b.classList.add('on')};
const selC=()=>(document.querySelector('#sw .on')||{}).dataset?.c||COL[0];
/* Boton Atras del telefono: cierra la ventana abierta en vez de salir de la app */
let hs=0,skipPop=0,pb=0;
const hPush=()=>{try{history.pushState({ov:1},'');hs++}catch(e){}};
/* Al cerrar con un botón no se retrocede el historial (history.go puede cerrar ventanas nuevas en algunos navegadores). Solo se cuenta. */
const hBack=()=>{if(hs>0)hs--};
addEventListener('popstate',()=>{if(skipPop>0){skipPop--;return}if(hs>0)hs--;
  if(cfFn!==null)cfClose(true);else if(typeof spotOpen!=='undefined'&&spotOpen)closeSpotlight(true);else if(dk)dkClose(true);else if(vi)closeV(true);else if(mdOpen)closeM(true)});
/* Ventana de confirmacion propia (confirm() nativo puede estar bloqueado) */
let cfFn=null;
function ask(msg,ok,fn){let w=$('#cf');if(!w){w=document.createElement('div');w.id='cf';w.onclick=e=>{if(e.target===w)cfClose()};document.body.appendChild(w)}
  if(cfFn===null)hPush();cfFn=fn;
  w.innerHTML=`<div class="dkbox" role="alertdialog" aria-modal="true"><b>${esc(msg)}</b><div class="row" style="margin:16px 0 0;justify-content:flex-end"><button class="btn g" onclick="cfClose()">Cancelar</button><button class="btn" id="cfok" onclick="cfOk()">${esc(ok||'Aceptar')}</button></div></div>`;
  w.style.display='grid';const b=$('#cfok');if(b)b.focus()}
function cfClose(fp){const w=$('#cf'),had=cfFn!==null;cfFn=null;if(w){w.style.display='none';w.innerHTML=''}if(had&&fp!==true)hBack()}
function cfOk(){const f=cfFn;cfClose();if(f)f()}
document.addEventListener('keydown',e=>{if(cfFn!==null&&e.key==='Escape'){e.stopPropagation();cfClose()}},true);
