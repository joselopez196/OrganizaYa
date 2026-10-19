/* ===== VISTA · js/view/dom.js =====
   Piezas básicas de la Vista: avisos (toast), ventanas, confirmación, botón Atrás. */
const toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',2600)};
const pd={};let undoFn=null;
const undoT=(m,fn)=>{const t=$('#toast');t.innerHTML=esc(m)+' · <button onclick="doUndo()" style="background:none;border:0;color:inherit;font-weight:800;text-decoration:underline;cursor:pointer">Deshacer</button>';undoFn=fn;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>{t.style.display='none';undoFn=null},6000)};
const doUndo=()=>{if(undoFn)undoFn();undoFn=null;$('#toast').style.display='none'};
let mdOpen=false,mdReturnFocus=null;const openM=h=>{if(!mdOpen){mdOpen=true;hPush();mdReturnFocus=document.activeElement}const w=$('#md');w.innerHTML=h;const d=w.querySelector('[role="dialog"],[role="alertdialog"]')||w.querySelector('.box');if(d&&!d.hasAttribute('role')){d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label',d.querySelector('b,h2,h3')?.textContent||'Ventana de OrganizaYa')}w.style.display='grid';requestAnimationFrame(()=>{const f=$('#md [autofocus],#md button:not([disabled]),#md input:not([disabled]),#md select:not([disabled]),#md textarea:not([disabled]),#md a[href],#md [tabindex]:not([tabindex="-1"])');if(f)f.focus()})},closeM=fp=>{const had=mdOpen;mdOpen=false;$('#md').style.display='none';$('#md').innerHTML='';if(had&&fp!==true)hBack();if(had&&mdReturnFocus&&mdReturnFocus.isConnected)mdReturnFocus.focus();mdReturnFocus=null};
document.addEventListener('keydown',e=>{if(!mdOpen||e.key!=='Tab')return;const w=$('#md'),a=[...w.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);if(!a.length){e.preventDefault();return}const first=a[0],last=a[a.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}},true);
const swatches=(cur)=>`<div class="sw" id="sw" role="group" aria-label="Elegir color">${COL.map(c=>`<button type="button" style="--c:${c}" class="${c===cur?'on':''}" data-c="${c}" onclick="pickC(this)" aria-label="Color ${c}" aria-pressed="${c===cur}"></button>`).join('')}</div>`;
const pickC=b=>{document.querySelectorAll('#sw button').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false')});b.classList.add('on');b.setAttribute('aria-pressed','true')};
const selC=()=>(document.querySelector('#sw .on')||{}).dataset?.c||COL[0];
/* Boton Atras del telefono: cierra la ventana abierta en vez de salir de la app */
let hs=0,skipPop=0,pb=0;
const hPush=()=>{try{history.pushState({ov:1},'');hs++}catch(e){}};
/* Al cerrar con un botón no se retrocede el historial (history.go puede cerrar ventanas nuevas en algunos navegadores). Solo se cuenta. */
const hBack=()=>{if(hs>0)hs--};
addEventListener('popstate',()=>{if(skipPop>0){skipPop--;return}if(hs>0)hs--;
  if(cfFn!==null)cfClose(true);else if(dk)dkClose(true);else if(vi)closeV(true);else if(mdOpen)closeM(true)});
/* Ventana de confirmacion propia (confirm() nativo puede estar bloqueado) */
let cfFn=null;
function ask(msg,ok,fn){let w=$('#cf');if(!w){w=document.createElement('div');w.id='cf';w.onclick=e=>{if(e.target===w)cfClose()};document.body.appendChild(w)}
  if(cfFn===null)hPush();cfFn=fn;
  w.innerHTML=`<div class="dkbox" role="alertdialog" aria-modal="true"><b>${esc(msg)}</b><div class="row" style="margin:16px 0 0;justify-content:flex-end"><button class="btn g" onclick="cfClose()">Cancelar</button><button class="btn" id="cfok" onclick="cfOk()">${esc(ok||'Aceptar')}</button></div></div>`;
  w.style.display='grid';const b=$('#cfok');if(b)b.focus()}
function cfClose(fp){const w=$('#cf'),had=cfFn!==null;cfFn=null;if(w){w.style.display='none';w.innerHTML=''}if(had&&fp!==true)hBack()}
function cfOk(){const f=cfFn;cfClose();if(f)f()}
document.addEventListener('keydown',e=>{if(cfFn!==null&&e.key==='Escape'){e.stopPropagation();cfClose()}},true);
