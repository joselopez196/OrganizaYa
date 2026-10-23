/* ===== CONTROLADOR · js/controller/links.js =====
   Controlador de accesos. */
function saveL(id){const l=S.links.find(x=>x.id===id),n=$('#l1').value.trim();let u=$('#l2').value.trim();if(!n||!u)return;if(!/^https?:\/\//i.test(u))u='https://'+u;try{new URL(u)}catch(e){return toast('Esa dirección no es válida')}l.name=n;l.url=u;save();closeM();draw()}
function firstL(id){const i=S.links.findIndex(x=>x.id===id);S.links.unshift(S.links.splice(i,1)[0]);save();closeM();draw();toast('Ahora sale primero en Hoy')}
function addL(){const n=$('#ln').value.trim();let u=$('#lu').value.trim();if(!n)return $('#ln').focus();if(!u)return $('#lu').focus();if(!/^https?:\/\//i.test(u))u='https://'+u;try{new URL(u)}catch(e){return toast('Esa dirección no es válida')}S.links.push({id:uid(),name:n,url:u,color:selC()});save();draw()}
const delL=id=>{const l=S.links.find(x=>x.id===id),i=S.links.indexOf(l);S.links=S.links.filter(x=>x.id!==id);save();draw();undoT('Acceso eliminado',()=>{S.links.splice(Math.min(i,S.links.length),0,l);save();draw()})};

// Reordenar accesos con arrastrar y soltar; el orden se conserva en el guardado habitual.
function dragL(e,id){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',id);e.currentTarget.classList.add('dragging')}
function dropL(e,targetId){e.preventDefault();const sourceId=e.dataTransfer.getData('text/plain');if(!sourceId||sourceId===targetId)return;const from=S.links.findIndex(x=>x.id===sourceId),to=S.links.findIndex(x=>x.id===targetId);if(from<0||to<0)return;const [item]=S.links.splice(from,1);S.links.splice(to,0,item);save();draw();toast('Orden de accesos actualizado')}
