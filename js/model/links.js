/* ===== MODELO · js/model/links.js =====
   Reglas de los accesos: identificar el sitio y migrar versiones antiguas de datos. */
const hostOf=u=>{const pk=/^intent:.*package=([\w.]+)/i.exec(u);if(pk)return 'pkg:'+pk[1];const q=/^https:\/\/play\.google\.com\/store\/search.*[?&]q=([^&]*)/.exec(u);if(q)return 'play:'+q[1];if(/^whatsapp:/i.test(u))return 'whatsapp.app';try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return u}};
function migL(){let ch=false;if((S.lv||0)<2){const have=new Map(S.links.map(l=>[hostOf(l.url),l])),top=DL.slice(0,10).map(d=>have.get(hostOf(d.url))||d),th=new Set(top.map(l=>hostOf(l.url)));S.links=top.concat(S.links.filter(l=>!th.has(hostOf(l.url))));ch=true}
if((S.lv||0)<3){const old='code.visualstudio.com',has=S.links.some(l=>hostOf(l.url)==='visualstudio.microsoft.com');S.links=has?S.links.filter(l=>hostOf(l.url)!==old):S.links.map(l=>hostOf(l.url)===old?Object.assign(l,{name:DL[9].name,url:DL[9].url,color:DL[9].color}):l);ch=true}
if((S.lv||0)<4){let at=S.links.findIndex(l=>hostOf(l.url)==='visualstudio.microsoft.com')+1||S.links.length;DL.slice(10,13).forEach(d=>{const k=S.links.findIndex(l=>hostOf(l.url)===hostOf(d.url));if(k<0){S.links.splice(at,0,d);at++}else at=k+1});ch=true}
if((S.lv||0)<5){DL.slice(16).forEach(d=>{if(!S.links.some(l=>hostOf(l.url)===hostOf(d.url)))S.links.push(d)});ch=true}
if((S.lv||0)<6){DL.filter(d=>['Google','Maps','Fotos'].includes(d.name)).forEach(d=>{if(!S.links.some(l=>hostOf(l.url)===hostOf(d.url)))S.links.push(d)});ch=true}
if((S.lv||0)<7){S.links.forEach(l=>{if(/whatsapp/i.test(hostOf(l.url)))l.url='whatsapp://send'});ch=true}
if((S.lv||0)<8){const nm=x=>x.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g,''),have=new Set(S.links.flatMap(l=>[nm(l.name),hostOf(l.url)]));NEW.forEach(a=>{const u=mkU(a[1]);if(!have.has(nm(a[0]))&&!have.has(hostOf(u)))S.links.push({id:uid(),name:a[0],url:u,color:a[2]})});ch=true}
if((S.lv||0)<9){S.links.forEach(l=>{if(hostOf(l.url)==='pkg:com.facebook.lite')l.name='Facebook Lite'});ch=true}
S.lv=9;return ch}
if(migL())saveLocal();
