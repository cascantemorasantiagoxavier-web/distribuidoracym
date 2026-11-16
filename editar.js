/* ===== Modo editar: la tienda (o mayoreo) se ve normal y el administrador toca un producto para cambiarlo ===== */
import {doc,getDoc,getDocs,setDoc,updateDoc,deleteDoc,deleteField,collection} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export function init({db,auth}){
const q=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const numCR=v=>{let s=String(v||'').replace(/[^\d.,]/g,'');if(!s)return NaN;const ld=Math.max(s.lastIndexOf('.'),s.lastIndexOf(','));if(ld>=0){const dec=s.slice(ld+1),int=s.slice(0,ld).replace(/[.,]/g,'');if(dec.length===3&&!/[.,]/.test(s.slice(0,ld))&&s[ld]==='.'&&int.length<=3)return parseFloat(int+dec);if(dec.length===3&&/[.,]/.test(s.slice(0,ld)))return parseFloat(int+dec);return parseFloat(int+'.'+dec)}return parseFloat(s)};
const crc=n=>'₡'+(Math.round(n*100)/100).toLocaleString('es-CR',{maximumFractionDigits:2});
let ON=false,CAMB={productos:{},tienda:{},fotos:{},nuevos:{},secciones:{}};
try{ON=/[?&]editar\b/.test(location.search)||sessionStorage.getItem('cym_editar')==='1'}catch(e){}

document.head.insertAdjacentHTML('beforeend',`<style>
.cymed-bar{position:fixed;left:10px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:9000;display:flex;gap:8px;align-items:center;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.cymed-bar button{height:46px;border:0;border-radius:23px;padding:0 16px;font-weight:800;font-size:15px;box-shadow:0 6px 18px rgba(0,0,0,.28);background:#111;color:#fff}
.cymed-bar #cymednew{background:#0a7a2f}
.cymed-bar a{height:46px;border-radius:23px;padding:0 16px;font-weight:800;font-size:15px;box-shadow:0 6px 18px rgba(0,0,0,.28);background:#1F4E8C;color:#fff;display:inline-flex;align-items:center;text-decoration:none;white-space:nowrap}
.cymed-bar [hidden]{display:none!important}
.cymed-bar{flex-wrap:wrap;right:10px}
.cymed-bar button.on{background:#F5B700;color:#111}
.cymed-top{position:fixed;left:0;right:0;top:0;z-index:8999;background:#F5B700;color:#111;font:700 14px system-ui,sans-serif;text-align:center;padding:8px 10px;box-shadow:0 2px 8px rgba(0,0,0,.2)}
body.cym-edit{padding-top:36px}
body.cym-edit .card,body.cym-edit .lrow{outline:3px dashed #F5B700;outline-offset:-3px;position:relative;cursor:pointer}
body.cym-edit .card::before,body.cym-edit .lrow::before{content:'✏️ Editar';position:absolute;z-index:6;background:#111;color:#fff;font:800 12px system-ui,sans-serif;padding:5px 9px;border-radius:12px;pointer-events:none}
body.cym-edit .lrow::before{top:6px;right:6px}
body.cym-edit .card::before{left:8px;bottom:8px}
body.cym-edit [data-pid]{cursor:pointer}
.cymed{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9500;overflow:auto;padding:12px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#111;font-size:16px}
.cymed .cymbx{background:#fff;border-radius:18px;max-width:520px;margin:0 auto;padding:16px}
.cymed .cymhd{display:flex;justify-content:space-between;align-items:center;gap:10px}.cymed .cymhd b{font-size:18px}
.cymed .cymhd button{border:0;background:#eee;border-radius:20px;width:42px;height:42px;font-size:18px;flex:0 0 auto}
.cymed small{color:#555}
.cymed label.cyml{display:block;font-weight:700;margin:12px 0 5px}
.cymed input:not([type=checkbox]):not([type=range]):not([type=file]),.cymed textarea{width:100%;box-sizing:border-box;min-height:48px;border:1.5px solid #ccc;border-radius:11px;padding:10px 12px;font-size:16px;font-family:inherit}
.cymed .cymph{display:flex;justify-content:center}
.cymed .cymph .cymnow,.cymed canvas{width:100%;max-width:340px;aspect-ratio:1/1;border:2px dashed #ccc;border-radius:12px;background:#fff center/contain no-repeat;box-sizing:border-box}
.cymed canvas{touch-action:none}
.cymed .cymbt{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
.cymed .cymb2{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:46px;padding:0 12px;border-radius:12px;background:#eee;border:0;font-weight:700;font-size:15px;color:#111;cursor:pointer;flex:1}
.cymed .cymb2.w{background:#fde2e2;width:100%}
.cymed .cymgo{width:100%;height:52px;border:0;border-radius:12px;background:#F5B700;font-weight:800;font-size:17px;margin-top:14px;color:#111}
.cymed .cymsel{width:100%;min-height:48px;border:1.5px solid #ccc;border-radius:11px;padding:0 10px;font-size:16px;background:#fff}
.cymed .cymchk{display:flex;gap:10px;align-items:center;font-weight:700;margin-top:14px}.cymed .cymchk input{width:24px;height:24px}
.cymed .cymmsg{min-height:22px;margin-top:8px;font-weight:600}
.cymed input[type=range]{width:100%;height:36px}
.cymed-toast{position:fixed;left:12px;right:12px;bottom:20px;background:#0a7a2f;color:#fff;padding:14px;border-radius:12px;font:700 15px system-ui,sans-serif;z-index:9600;text-align:center}
</style>`);
document.body.insertAdjacentHTML('beforeend','<div class="cymed-bar cymed-ui"><button type="button" id="cymedbtn"></button><button type="button" id="cymednew" hidden>➕ Producto nuevo</button>'+(/\/catalogo\//.test(location.pathname)?'':'<a id="cymedcat" href="catalogo/" hidden>📖 Catálogo PDF</a>')+'</div><div class="cymed-top cymed-ui" id="cymedtop" hidden>✏️ Modo editar: toque un producto para cambiarlo</div>');
const btn=q('#cymedbtn');
function setOn(v){ON=v;try{sessionStorage.setItem('cym_editar',v?'1':'0')}catch(e){}document.body.classList.toggle('cym-edit',v);q('#cymedtop').hidden=!v;btn.classList.toggle('on',v);q('#cymednew').hidden=!v;if(q('#cymedcat'))q('#cymedcat').hidden=!v;btn.textContent=v?'✓ Terminar de editar':'✏️ Editar página'}
btn.onclick=()=>setOn(!ON);setOn(ON);q('#cymednew').onclick=()=>openEditor(0);

async function loadCamb(){try{const s=await getDocs(collection(db,'cambios'));const c={productos:{},tienda:{},fotos:{},nuevos:{},secciones:{}};s.forEach(d=>{c[d.id]=d.data()});CAMB=c;return c}catch(e){return CAMB}}
async function refresh(){const c=await loadCamb();if(window.applyCambios)window.applyCambios(c)}
loadCamb();

function pidFrom(t){const a=t.closest('a[href^="#p-"]');if(a)return +a.getAttribute('href').slice(3)||null;
 const c=t.closest('.card,.lrow');if(c){const l=c.querySelector('a[href^="#p-"]');if(l)return +l.getAttribute('href').slice(3)||null;const d=c.querySelector('[data-add],[data-pid],[data-inc]');if(d)return +(d.dataset.add||d.dataset.pid||d.dataset.inc)||null}
 const s=t.closest('[data-pid]');if(s&&s.dataset.pid)return +s.dataset.pid;
 const b=t.closest('[data-add]');if(b)return +b.dataset.add||null;return null}
document.addEventListener('click',e=>{if(!ON||e.target.closest('.cymed-ui,.cymed'))return;const id=pidFrom(e.target);if(!id)return;e.preventDefault();e.stopPropagation();openEditor(id)},true);

/* --- editor --- */
let P=null,IM=null,R=0,Z=1,OX=0,OY=0;
function draw(){const c=q('#cymcv');if(!c)return;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,800,800);if(!IM)return;const w=IM.width,h=IM.height,rw=R%2?h:w,rh=R%2?w:h,s=Math.min(760/rw,760/rh)*Z;x.save();x.translate(400+OX,400+OY);x.rotate(R*Math.PI/2);x.scale(s,s);x.drawImage(IM,-w/2,-h/2);x.restore()}
async function loadFile(f){if(!f)return;const url=URL.createObjectURL(f);try{const im=new Image();im.src=url;await im.decode();const k=Math.min(1,1600/Math.max(im.naturalWidth,im.naturalHeight));const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);IM=c;R=0;Z=1;OX=OY=0;q('#cymz').value=1;q('#cymcv').hidden=false;q('#cymnow').hidden=true;q('#cymctl').hidden=false;draw()}catch(er){toast('No se pudo abrir esa foto. Pruebe con otra.',1)}finally{URL.revokeObjectURL(url)}}
function nowStyle(p){const sp=[...document.querySelectorAll(`[data-pid="${p.id}"]`)].find(e=>getComputedStyle(e).backgroundImage!=='none');if(!sp){const im=document.querySelector(`[data-pid="${p.id}"] img, article[data-pid] [data-pid="${p.id}"]`)||null;const ii=im&&(im.tagName==='IMG'?im:im.closest('article')&&im.closest('article').querySelector('img'));return ii?`background-image:url("${ii.src}");background-size:contain;background-position:center;background-repeat:no-repeat`:''}const cs=getComputedStyle(sp);return `background-image:${cs.backgroundImage};background-size:${cs.backgroundSize};background-position:${cs.backgroundPosition};background-repeat:no-repeat`.replace(/"/g,"'")}
function catSelect(sel){const cs=(window.CYM_cats?window.CYM_cats():[]);return `<select id="cymk" class="cymsel">${cs.map(c=>`<option value="${esc(c.k)}"${c.k===sel?' selected':''}>${esc(c.label)}</option>`).join('')}<option value="__nueva">➕ Nueva sección…</option></select>`}
function openEditor(id){const p=id?(window.CYM_prod&&window.CYM_prod(id)):{id:0,t:'',d:'',pr:0,c:'',m:'',b:'',k:(window.CYM_catActual&&window.CYM_catActual())||'',_nuevo:1};if(!p)return;P=p;IM=null;R=0;Z=1;OX=OY=0;
 const nuevo=!!p._nuevo,xn=nuevo&&id?(CAMB.nuevos['p'+id]||{}):{};
 const o0=p._o||{t:p.t,d:p.d,pr:p.pr},x=(!nuevo&&CAMB.productos['p'+id])||{},hasF=!!(id&&CAMB.fotos['p'+id]);
 const o=document.createElement('div');o.className='cymed';o.id='cymed';o.innerHTML=`<div class="cymbx"><div class="cymhd"><b>${id?'Editar producto':'Producto nuevo'}</b><button type="button" id="cymx" aria-label="Cerrar">✕</button></div>
 ${nuevo?'':`<small>Cód. ${esc(p.c||'')}${p.m?' · Mod. '+esc(p.m):''}</small>`}
 <label class="cyml">Foto</label><div class="cymph"><div class="cymnow" id="cymnow" style="${nowStyle(p)}"></div><canvas id="cymcv" width="800" height="800" hidden></canvas></div>
 <div class="cymbt"><label class="cymb2">📷 Tomar foto<input type="file" accept="image/*" capture="environment" id="cymcam" hidden></label><label class="cymb2">🖼️ Escoger de la galería<input type="file" accept="image/*" id="cymgal" hidden></label></div>
 <div id="cymctl" hidden><small>Arrastre la foto con el dedo para acomodarla. Use la barra para acercarla o alejarla.</small><input type="range" id="cymz" min="0.3" max="4" step="0.01" value="1" aria-label="Acercar o alejar"><div class="cymbt"><button type="button" class="cymb2" id="cymrot">↻ Girar</button><button type="button" class="cymb2" id="cymfit">Centrar</button><button type="button" class="cymb2" id="cymcan">No usar esta foto</button></div></div>
 ${hasF?'<button type="button" class="cymb2 w" id="cymdel">Quitar la foto que puse (vuelve la de antes)</button>':''}
 <label class="cyml" for="cymt">Nombre</label><input id="cymt" value="${esc(p.t)}" placeholder="Ej. Martillo de uña 16 oz Truper">
 ${nuevo?`<label class="cyml" for="cymk">Sección</label>${catSelect(p.k)}
 <label class="cyml" for="cymc">Código en ApliTeam <small>(para que el pedido pase a la cotización)</small></label><input id="cymc" value="${esc(p.c||'')}" inputmode="text">
 <label class="cyml" for="cymb">Marca</label><input id="cymb" value="${esc(p.b||'')}" placeholder="Ej. Truper">
 <label class="cyml" for="cymm">Modelo</label><input id="cymm" value="${esc(p.m||'')}">`:''}
 <label class="cyml" for="cymd">Descripción</label><textarea id="cymd" rows="4">${esc(p.d||'')}</textarea>
 <label class="cyml" for="cympr">Precio en la tienda, con IVA (₡)</label><input id="cympr" inputmode="decimal" value="${nuevo?(xn.pr||''):(x.pr||o0.pr||'')}">
 <label class="cyml" for="cympm">Precio en mayoreo, con IVA (₡)</label><input id="cympm" inputmode="decimal" value="${nuevo?(xn.pm||''):(x.pm||'')}" placeholder="Vacío = el mismo de la tienda">
 ${nuevo?'':`<label class="cymchk"><input type="checkbox" id="cymo"${x.oculto?' checked':''}> Ocultar este producto (no sale en la tienda)</label>`}
 <button type="button" class="cymgo" id="cymsv">${id?'Guardar cambios':'Agregar producto'}</button><div class="cymmsg" id="cymmsg"></div>
 ${nuevo&&id?'<button type="button" class="cymb2 w" id="cymborrar" style="margin-top:10px">🗑️ Eliminar este producto</button>':''}
 ${!nuevo&&Object.keys(x).length?'<button type="button" class="cymb2" id="cymrs" style="width:100%">Dejar nombre, descripción y precio como estaban</button>':''}</div>`;
 document.body.appendChild(o);document.body.style.overflow='hidden';
 const cv=q('#cymcv'),pts=new Map();let pd0=0,z0=1;
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===2){const [a,b]=[...pts.values()];pd0=Math.hypot(a.x-b.x,a.y-b.y);z0=Z}});
 cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const m=pts.get(e.pointerId),k=800/cv.clientWidth;if(pts.size===1){OX+=(e.clientX-m.x)*k;OY+=(e.clientY-m.y)*k}pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===2&&pd0){const [a,b]=[...pts.values()];Z=Math.max(.3,Math.min(4,z0*Math.hypot(a.x-b.x,a.y-b.y)/pd0));q('#cymz').value=Z}draw()});
 const up=e=>{pts.delete(e.pointerId);pd0=0};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 q('#cymcam').onchange=e=>loadFile(e.target.files[0]);q('#cymgal').onchange=e=>loadFile(e.target.files[0]);
 q('#cymz').oninput=e=>{Z=+e.target.value;draw()};q('#cymrot').onclick=()=>{R=(R+1)%4;draw()};q('#cymfit').onclick=()=>{Z=1;OX=OY=0;q('#cymz').value=1;draw()};
 q('#cymcan').onclick=()=>{IM=null;q('#cymcv').hidden=true;q('#cymnow').hidden=false;q('#cymctl').hidden=true};
 q('#cymx').onclick=close;o.addEventListener('click',e=>{if(e.target===o)close()});
 if(q('#cymdel'))q('#cymdel').onclick=async()=>{if(!confirm('¿Quitar la foto que usted puso a este producto?'))return;try{await deleteDoc(doc(db,'fotos',String(id)));await setMap('fotos','p'+id,null);window.CYM_setFoto&&window.CYM_setFoto(id,null);close();await refresh();toast('Foto quitada')}catch(er){msg('No se pudo quitar. Revise el internet.')}};
 if(q('#cymrs'))q('#cymrs').onclick=async()=>{try{await setMap('productos','p'+id,null);close();await refresh();toast('Listo, quedó como estaba')}catch(er){msg('No se pudo guardar. Revise el internet.')}};
 if(q('#cymk'))q('#cymk').onchange=e=>{if(e.target.value!=='__nueva')return;const n=(prompt('Nombre de la sección nueva (ej. Productos de limpieza):')||'').trim();if(!n){e.target.value=p.k||e.target.options[0].value;return}const k='n-'+n.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30);const op=document.createElement('option');op.value=k;op.textContent=n;op.dataset.nueva=n;e.target.insertBefore(op,e.target.lastElementChild);e.target.value=k};
 if(q('#cymborrar'))q('#cymborrar').onclick=async()=>{if(!confirm('¿Eliminar este producto de la página? No se puede deshacer.'))return;try{await setMap('nuevos','p'+id,null);if(CAMB.fotos['p'+id]){await deleteDoc(doc(db,'fotos',String(id)));await setMap('fotos','p'+id,null);window.CYM_setFoto&&window.CYM_setFoto(id,null)}close();await refresh();toast('Producto eliminado')}catch(er){msg('No se pudo eliminar. Revise el internet.')}};
 q('#cymsv').onclick=()=>save(o0)}
function close(){const o=q('#cymed');if(o)o.remove();document.body.style.overflow='';P=null;IM=null}
function msg(t){const m=q('#cymmsg');if(m){m.style.color='#b00020';m.textContent=t}}
function toast(t,bad){const d=document.createElement('div');d.className='cymed-toast cymed-ui';if(bad)d.style.background='#b00020';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),3000)}
async function setMap(d,k,v){const r=doc(db,'cambios',d),del=v===null;try{await updateDoc(r,{[k]:del?deleteField():v})}catch(er){if(er&&er.code==='not-found'){if(del)return;await setDoc(r,{[k]:v})}else throw er}}
async function save(o0){const p=P;if(!p)return;const b=q('#cymsv'),m=q('#cymmsg');
 if(p._nuevo){const t=q('#cymt').value.trim();if(!t){msg('Escriba el nombre del producto.');return}
  b.disabled=true;m.style.color='#555';m.textContent='Guardando…';
  try{let id=p.id;if(!id){await loadCamb();const ks=Object.keys(CAMB.nuevos||{}).map(k=>+k.slice(1)).filter(Boolean);id=Math.max(900000,...ks)+1;p.id=id}
   const sel=q('#cymk');let k=sel?sel.value:'';const opt=sel&&sel.selectedOptions[0];if(opt&&opt.dataset.nueva){await setMap('secciones',k,{label:opt.dataset.nueva,v:Date.now()})}
   if(IM){const c=q('#cymcv');let kq=.86,u=c.toDataURL('image/jpeg',kq);while(u.length>950000&&kq>.4){kq-=.1;u=c.toDataURL('image/jpeg',kq)}const v=Date.now();
    await setDoc(doc(db,'fotos',String(id)),{img:u,v,c:q('#cymc').value.trim(),t,por:auth.currentUser&&auth.currentUser.email||''});await setMap('fotos','p'+id,v);window.CYM_setFoto&&window.CYM_setFoto(id,u,v)}
   const pr=numCR(q('#cympr').value),pm=numCR(q('#cympm').value);
   const x={t,c:q('#cymc').value.trim(),k,b:q('#cymb').value.trim(),m:q('#cymm').value.trim(),d:q('#cymd').value.trim(),v:Date.now()};if(pr>0)x.pr=Math.round(pr*100)/100;if(pm>0)x.pm=Math.round(pm*100)/100;
   await setMap('nuevos','p'+id,x);close();await refresh();toast(o0&&o0.t?'Guardado ✓':'Producto agregado ✓');
   if(!o0||!o0.t){location.hash='#p-'+id}}catch(er){b.disabled=false;msg(er&&er.code==='permission-denied'?'No tiene permiso para guardar.':'No se pudo guardar. Revise el internet e intente de nuevo.')}
  return}
 b.disabled=true;m.style.color='#555';m.textContent='Guardando…';
 try{if(IM){const c=q('#cymcv');let k=.86,u=c.toDataURL('image/jpeg',k);while(u.length>950000&&k>.4){k-=.1;u=c.toDataURL('image/jpeg',k)}const v=Date.now();
   await setDoc(doc(db,'fotos',String(p.id)),{img:u,v,c:p.c||'',t:o0.t||'',por:auth.currentUser&&auth.currentUser.email||''});await setMap('fotos','p'+p.id,v);window.CYM_setFoto&&window.CYM_setFoto(p.id,u,v)}
  const x={},t=q('#cymt').value.trim(),d=q('#cymd').value.trim(),pr=numCR(q('#cympr').value);
  if(t&&t!==o0.t)x.t=t;if(d&&d!==(o0.d||''))x.d=d;if(pr>0&&Math.abs(pr-(o0.pr||0))>.004)x.pr=Math.round(pr*100)/100;const pm=numCR(q('#cympm').value);if(pm>0)x.pm=Math.round(pm*100)/100;if(q('#cymo').checked)x.oculto=true;
  const had=Object.keys(CAMB.productos['p'+p.id]||{}).length;if(Object.keys(x).length){x.v=Date.now();await setMap('productos','p'+p.id,x)}else if(had)await setMap('productos','p'+p.id,null);
  close();await refresh();toast('Guardado ✓')}catch(er){b.disabled=false;msg(er&&er.code==='permission-denied'?'No tiene permiso para guardar.':'No se pudo guardar. Revise el internet e intente de nuevo.')}}
}
