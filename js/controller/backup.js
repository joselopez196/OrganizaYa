/* ===== CONTROLADOR · js/controller/backup.js =====
   Controlador de copias de seguridad y calendario. */
async function syncFiles(){if(!ast)return toast('La nube de archivos no está disponible');toast('Subiendo archivos a la nube…');let ok=0,big=0,no=0;for(const f of S.files){if(f.aid)continue;if(f.size>20*1048576){big++;continue}if(!UPT(f)){no++;continue}ok+=await cloudUp(f)}save();draw();toast(ok+' subidos'+(big?', '+big+' de más de 20 MB se quedan solo aquí':'')+(no?', '+no+' de tipo no admitido':''))}
function restBk(id){ask('¿Restaurar la copia "'+id+'"? Reemplaza tus tareas, proyectos y accesos actuales. Tus archivos no se borran.','Restaurar',()=>restBk2(id))}
async function restBk2(id){try{const r=JSON.parse((await bkc.doc(id).get()).data().json),c=cleanS(r);if(!c)throw 0;await bkc.doc('antes-de-restaurar').set({json:snap(),at:Date.now()});const ids=new Set(c.files.map(f=>f.id));replaceData(c);S.files=c.files.concat(S.files.filter(f=>!ids.has(f.id)));S.lv=c.lv||0;migL();save();draw();toast('Copia restaurada')}catch(e){toast('No se pudo restaurar esa copia')}}
async function exportarCal(){
  const a=S.adv||7,td=today(),ev=[],csv=[],st=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),dt=k=>k.replace(/-/g,''),us=k=>{const x=k.split('-');return x[1]+'/'+x[2]+'/'+x[0]},q=v=>'"'+String(v).replace(/"/g,'""')+'"';
  const add=(id,sum,k,time,desc)=>{if(!k||k<td)return;const L=['BEGIN:VEVENT','UID:'+id+'@mi-sistema','DTSTAMP:'+st];
    if(time&&/^\d{2}:\d{2}$/.test(time)){const hm=time.split(':').map(Number),e=new Date(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10),hm[0]+1,hm[1]);L.push('DTSTART:'+dt(k)+'T'+time.replace(':','')+'00','DTEND:'+iso(e).replace(/-/g,'')+'T'+pad2(e.getHours())+pad2(e.getMinutes())+'00')}
    else L.push('DTSTART;VALUE=DATE:'+dt(k),'DTEND;VALUE=DATE:'+dt(addD(k,1)));
    L.push('SUMMARY:'+icsEsc(sum),'DESCRIPTION:'+icsEsc(desc),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc('Aviso: '+sum),'TRIGGER:-P'+a+'D','END:VALARM','BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(sum),'TRIGGER:PT0S','END:VALARM','END:VEVENT');ev.push(L);
    csv.push([q(sum),us(k),us(k),'True',q(desc)].join(','))};
  S.tasks.filter(t=>!t.done&&t.due).forEach(t=>add(t.id,t.title,t.due,t.time,'Tarea de Mi sistema'+(t.p?' · '+pn(t.p):'')+(t.note?'\n'+t.note:'')));
  S.projects.filter(x=>x.due&&!x.arch&&x.st!=='terminado').forEach(x=>add(x.id,'Entrega: '+x.name,x.due,'','Proyecto de Mi sistema'));
  if(!ev.length)return toast('No hay tareas ni proyectos con fecha por venir');
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Mi sistema//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Mi sistema'].concat(ev.flat(),['END:VCALENDAR']).map(icsFold).join('\r\n')+'\r\n';
  let ok=await saveFile('mi-sistema-'+td+'.ics',ics);
  if(!ok&&saveFile.err==='rejected_extension')ok=await saveFile('mi-sistema-recordatorios-'+td+'.csv','\ufeffSubject,Start Date,End Date,All Day Event,Description\r\n'+csv.join('\r\n'));
  if(ok)toast('Listo: abre el archivo para añadirlo a tu calendario')}
async function exportar(){toast('Preparando copia…');const files=[];let tot=0,skip=0;for(const f of S.files){let b=await idb('readonly',s=>s.get(f.id));if(!b&&f.aid){try{b=await(await fetch('/_blob/'+f.aid)).blob()}catch(e){}}if(b){if(tot+b.size>150*1048576){skip++;continue}tot+=b.size;files.push({id:f.id,data:await b64(b)})}}
  if(await saveFile('mi-sistema-copia-'+today()+'.json',JSON.stringify({v:1,S,files}))){S.lastBackup=today();save();toast(skip?'Copia guardada. '+skip+(skip>1?' archivos grandes no se incluyeron':' archivo grande no se incluyó')+' (siguen en este dispositivo)':'Copia guardada');if(tab==='hoy')draw()}}
async function importar(file){const inp=$('#imp');try{if(!file)return;const j=JSON.parse(await file.text()),c=j&&cleanS(j.S);if(!c)throw 0;
  ask('Esta copia tiene '+c.tasks.length+' tareas, '+c.projects.length+' proyectos y '+c.files.length+' archivos. Reemplaza todo lo que tienes ahora. ¿Continuar?','Reemplazar',()=>importar2(c,j.files))}catch(e){toast('Ese archivo no es una copia válida')}finally{if(inp)inp.value=''}}
async function importar2(c,bl){try{
  const ids=new Set(c.files.map(f=>f.id)),blobs=[];
  for(const b of Array.isArray(bl)?bl:[]){if(b&&okId(b.id)&&ids.has(b.id)&&typeof b.data==='string'&&b.data.startsWith('data:'))blobs.push([b.id,d2b(b.data)])}
  const have=new Set(blobs.map(x=>x[0])),previous=S.files.slice();
  if(blobs.length){if(!db)throw new Error('No hay almacenamiento para los archivos');const ok=await new Promise(resolve=>{let tx;try{tx=db.transaction('f','readwrite');const st=tx.objectStore('f');blobs.forEach(x=>st.put(x[1],x[0]));tx.oncomplete=()=>resolve(true);tx.onerror=tx.onabort=()=>resolve(false)}catch(e){resolve(false)}});if(!ok)throw new Error('No se pudieron guardar los archivos')}
  Object.keys(urls).forEach(k=>{try{URL.revokeObjectURL(urls[k])}catch(e){}delete urls[k]});
  replaceData(c);S.files=c.files.filter(f=>have.has(f.id)||f.aid);S.adv=c.adv;S.lastBackup=c.lastBackup;S.lv=c.lv;
  for(const f of previous)if(!have.has(f.id))await idb('readwrite',s=>s.delete(f.id));
  migL();save();draw();toast('Copia restaurada')}catch(e){toast('No se pudo restaurar la copia')}}
