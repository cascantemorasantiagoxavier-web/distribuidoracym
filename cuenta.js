/* ===== Cuentas de clientes (Firebase) ===== */
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,signOut,updateProfile} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {getFirestore,doc,getDoc,setDoc,updateDoc,addDoc,collection,query,where,getDocs,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const CFG=window.CYM_FB||null;
const SITE=window.CYM_SITE||'tienda';
if(CFG){
const app=initializeApp(CFG);
const auth=getAuth(app);auth.languageCode='es';
const db=getFirestore(app);
/* --- cambios hechos por la tienda desde la administración --- */
window.CYM_getFoto=async id=>{const s=await getDoc(doc(db,'fotos',String(id)));return s.exists()?s.data().img:null};
getDocs(collection(db,'cambios')).then(qs=>{const c={};qs.forEach(d=>{c[d.id]=d.data()});if(Object.keys(c).length&&window.applyCambios)window.applyCambios(c)}).catch(()=>{});
let user=null,perfil=null,pendingOrder=false,registering=false;
const q=s=>document.querySelector(s);
const escH=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const EST={nuevo:'Recibido',confirmado:'Confirmado',listo:'Listo para entregar',entregado:'Entregado',cancelado:'Cancelado'};
const ERR={'auth/invalid-credential':'Correo o contraseña incorrectos.','auth/wrong-password':'Correo o contraseña incorrectos.','auth/user-not-found':'No hay una cuenta con ese correo.','auth/invalid-email':'Ese correo no es válido.','auth/email-already-in-use':'Ya existe una cuenta con ese correo. Use "Ingresar".','auth/weak-password':'La contraseña debe tener al menos 6 caracteres.','auth/too-many-requests':'Demasiados intentos. Espere unos minutos e intente de nuevo.','auth/network-request-failed':'No hay conexión a internet. Intente de nuevo.','permission-denied':'No tiene permiso para esto.'};
const errMsg=e=>ERR[e&&e.code]||'Algo salió mal. Intente de nuevo.';
const tel8=s=>String(s||'').replace(/\D/g,'');
function waLink(text){const S=typeof STORE!=='undefined'?STORE:{};const n=tel8(S.whatsapp||S.telefono||'');if(n.length<8)return null;return 'https://wa.me/'+(n.length===8?'506'+n:n)+'?text='+encodeURIComponent(text)}

/* --- botón en el encabezado --- */
const ICU='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';
const cartbtn=q('#cartbtn');
if(cartbtn){cartbtn.insertAdjacentHTML('beforebegin',`<button class="hbtn" id="acctbtn" type="button" aria-haspopup="dialog">${ICU}<span class="lbl">Ingresar</span></button>`)}
document.body.insertAdjacentHTML('beforeend',`<div class="acct-ov" id="acctov" hidden><div class="acct" role="dialog" aria-modal="true" aria-labelledby="accth"><button class="x" type="button" data-acx aria-label="Cerrar">×</button><div id="acctbody"></div></div></div>`);
const ov=q('#acctov'),body=q('#acctbody');
function close(){ov.hidden=true;document.body.style.overflow=''}
ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('[data-acx]'))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!ov.hidden)close()});
q('#acctbtn')&&q('#acctbtn').addEventListener('click',()=>open(user?'cuenta':'login'));

function pw(id,ac){return `<div class="pw"><input id="${id}" type="password" autocomplete="${ac}" minlength="6" required><button type="button" data-show="${id}">Ver</button></div>`}
function open(view,note){ov.hidden=false;document.body.style.overflow='hidden';render(view,note)}
function tabs(v){return `<div class="tabs" role="tablist"><button type="button" class="${v==='login'?'on':''}" data-view="login">Ingresar</button><button type="button" class="${v==='registro'?'on':''}" data-view="registro">Crear cuenta</button></div>`}
function render(v,note){
  if(v==='login')body.innerHTML=`<h2 id="accth">Ingresar</h2>${note?`<p class="sub">${escH(note)}</p>`:'<p class="sub">Con su cuenta sus pedidos le llegan directo a la tienda. Mientras arma su pedido, la tienda puede ver su carrito y lo que busca, para atenderle mejor.</p>'}${tabs(v)}
   <form id="af-login" novalidate><div class="f"><label for="a-mail">Correo</label><input id="a-mail" type="email" autocomplete="email" required></div>
   <div class="f"><label for="a-pw">Contraseña</label>${pw('a-pw','current-password')}</div>
   <div class="msg" id="amsg" role="status"></div><button class="go" type="submit">Ingresar</button></form>
   <button class="lnk2" type="button" data-view="olvido">¿Olvidó su contraseña?</button><p class="sub2">¿Ya es cliente de la ferretería y es su primera vez en la página? Toque <b>Crear cuenta</b> y ponga su cédula.</p>`;
  else if(v==='registro')body.innerHTML=`<h2 id="accth">Crear cuenta</h2>${note?`<p class="sub">${escH(note)}</p>`:'<p class="sub">Es gratis. Usted mismo crea su contraseña.</p>'}${tabs(v)}
   <form id="af-reg" novalidate><div class="f ced"><label for="r-ced">¿Ya es cliente de la ferretería? Ponga su cédula</label><input id="r-ced" inputmode="numeric" autocomplete="off" placeholder="Ej. 1-0234-0567 (opcional)"><div class="cedmsg" id="r-cedmsg" role="status"></div></div><div class="f"><label for="r-nom">Nombre completo</label><input id="r-nom" autocomplete="name" required></div>
   <div class="f"><label for="r-tel">Teléfono (WhatsApp)</label><input id="r-tel" type="tel" inputmode="tel" autocomplete="tel" required></div>
   <div class="f"><label for="r-mail">Correo</label><input id="r-mail" type="email" autocomplete="email" required></div>
   <div class="f"><label for="r-pw">Contraseña (mínimo 6)</label>${pw('r-pw','new-password')}</div>
   <label class="chk"><input type="checkbox" id="r-neg"${SITE==='mayoreo'?' checked':''}><span>Compro para un negocio u obra (mayoreo)</span></label>
   <div class="f" id="r-negbox"${SITE==='mayoreo'?'':' hidden'}><label for="r-emp">Nombre del negocio</label><input id="r-emp" autocomplete="organization"></div>
   <div class="f"><label for="r-dir">Dirección (opcional, para envíos)</label><textarea id="r-dir" autocomplete="street-address"></textarea></div>
   <div class="msg" id="amsg" role="status"></div><button class="go" type="submit">Crear cuenta</button></form>`;
  else if(v==='olvido')body.innerHTML=`<h2 id="accth">Recuperar contraseña</h2><p class="sub">Le enviamos un correo para que cree una contraseña nueva.</p>
   <form id="af-olv" novalidate><div class="f"><label for="o-mail">Correo de su cuenta</label><input id="o-mail" type="email" autocomplete="email" required></div>
   <div class="msg" id="amsg" role="status"></div><button class="go" type="submit">Enviar correo</button></form><button class="lnk2" type="button" data-view="login">Volver a ingresar</button>`;
  else if(v==='cuenta')renderCuenta();
  const f=body.querySelector('input');if(f)setTimeout(()=>f.focus(),50);
}
body.addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b){render(b.dataset.view);return}
  const s=e.target.closest('[data-show]');if(s){const i=q('#'+s.dataset.show);i.type=i.type==='password'?'text':'password';s.textContent=i.type==='password'?'Ver':'Ocultar';return}
  if(e.target.closest('[data-out]')){signOut(auth).then(close);return}
  if(e.target.closest('[data-edit]')){renderEdit();return}});
body.addEventListener('change',e=>{if(e.target.id==='r-neg')q('#r-negbox').hidden=!e.target.checked});
const say=(t,ok)=>{const m=q('#amsg');if(m){m.textContent=t;m.className='msg '+(ok?'ok':'err')}};
const busy=(f,on,t)=>{const b=f.querySelector('.go');if(b){b.disabled=on;if(t)b.textContent=t}};

/* --- clientes que ya están en el sistema de la tienda (ApliTeam): se reconocen por la cédula --- */
const cedN=v=>{let t=String(v||'').trim();const p=t.split(/[-\s]+/).filter(Boolean);if(p.length===3&&p[0].length===1){p[1]=p[1].padStart(4,'0');p[2]=p[2].padStart(4,'0');t=p.join('')}return t.replace(/\D/g,'')};
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,'0')).join('');
let SIS=null,sisT=0;
async function buscarCed(){const i=q('#r-ced'),m=q('#r-cedmsg');if(!i||!m)return;const c=cedN(i.value);const my=++sisT;SIS=null;m.className='cedmsg';
  if(c.length<9){m.textContent='';return}
  m.textContent='Buscando…';try{const h=await sha('cym-'+c);const d=await getDoc(doc(db,'sistema',h));if(my!==sisT)return;
    if(d.exists()){const x=d.data();const ops=[[String(x.cod||''),String(x.n||'')]].concat((Array.isArray(x.o)?x.o:[]).map(v=>{const i=String(v).indexOf('|');return [String(v).slice(0,i),String(v).slice(i+1)]}));
      SIS={sh:h,codigo:ops[0][0],nombre:ops[0][1]};m.className='cedmsg ok';
      if(ops.length>1){m.innerHTML='✓ Usted es cliente de la tienda. Escoja cuál es su cuenta:'+ops.map((o,i)=>`<label class="cedop"><input type="radio" name="cedop" value="${i}"${i?'':' checked'}> Nº ${escH(o[0])} — ${escH(o[1])}</label>`).join('');
        m.querySelectorAll('input[name=cedop]').forEach(r=>r.addEventListener('change',()=>{const o=ops[+r.value];SIS.codigo=o[0];SIS.nombre=o[1]}))}
      else m.textContent='✓ Usted es cliente Nº '+SIS.codigo+(SIS.nombre?' — '+SIS.nombre:'')+'. Sus pedidos le llegan a la tienda a su nombre.'+(x.m?' Correo que tenemos: '+x.m:'');
      const n=q('#r-nom');if(n&&!n.value.trim()&&SIS.nombre)n.value=SIS.nombre}
    else{m.className='cedmsg';m.textContent='No la encontramos en la lista de clientes. Igual puede crear su cuenta.'}}catch(er){if(my===sisT)m.textContent=''}}
let cedTm;body.addEventListener('input',e=>{if(e.target.id==='r-ced'){clearTimeout(cedTm);cedTm=setTimeout(buscarCed,450)}});
body.addEventListener('submit',async e=>{e.preventDefault();const f=e.target;
  if(f.id==='af-login'){const mail=q('#a-mail').value.trim(),p=q('#a-pw').value;if(!mail||!p)return say('Escriba su correo y su contraseña.');
    busy(f,true,'Ingresando…');try{await signInWithEmailAndPassword(auth,mail,p);afterLogin()}catch(er){say(errMsg(er));busy(f,false,'Ingresar')}}
  if(f.id==='af-reg'){const d={nombre:q('#r-nom').value.trim(),tel:q('#r-tel').value.trim(),correo:q('#r-mail').value.trim(),negocio:q('#r-neg').checked?q('#r-emp').value.trim():'',dir:q('#r-dir').value.trim()};const p=q('#r-pw').value;
    if(!d.nombre)return say('Escriba su nombre.');if(tel8(d.tel).length<8)return say('Escriba un teléfono de 8 dígitos.');if(!/^\S+@\S+\.\S+$/.test(d.correo))return say('Escriba un correo válido.');if(p.length<6)return say('La contraseña debe tener al menos 6 caracteres.');
    busy(f,true,'Creando cuenta…');registering=true;try{const c=await createUserWithEmailAndPassword(auth,d.correo,p);await updateProfile(c.user,{displayName:d.nombre});
      perfil={...d,mayoreo:false,solicitaMayoreo:q('#r-neg').checked,sitio:SITE,creado:serverTimestamp()};if(SIS&&SIS.codigo){perfil.codigo=SIS.codigo;perfil.sh=SIS.sh}await setDoc(doc(db,'clientes',c.user.uid),perfil);registering=false;afterLogin(true);ready()}catch(er){registering=false;say(errMsg(er));busy(f,false,'Crear cuenta')}}
  if(f.id==='af-olv'){const mail=q('#o-mail').value.trim();if(!mail)return say('Escriba su correo.');busy(f,true,'Enviando…');
    try{await sendPasswordResetEmail(auth,mail);say('Listo. Revise su correo (también la carpeta de spam).',true)}catch(er){say(errMsg(er))}busy(f,false,'Enviar correo')}
  if(f.id==='af-edit'){const d={nombre:q('#e-nom').value.trim(),tel:q('#e-tel').value.trim(),negocio:q('#e-emp').value.trim(),dir:q('#e-dir').value.trim()};
    if(!d.nombre||tel8(d.tel).length<8)return say('Revise su nombre y teléfono.');busy(f,true,'Guardando…');
    try{await updateDoc(doc(db,'clientes',user.uid),d);perfil={...perfil,...d};prefill(true);render('cuenta')}catch(er){say(errMsg(er));busy(f,false,'Guardar')}}
});

async function loadPerfil(){try{const s=await getDoc(doc(db,'clientes',user.uid));perfil=s.exists()?s.data():null;
  if(!perfil){perfil={nombre:user.displayName||'',tel:'',correo:user.email,negocio:'',dir:'',mayoreo:false,solicitaMayoreo:SITE==='mayoreo',sitio:SITE,creado:serverTimestamp()};await setDoc(doc(db,'clientes',user.uid),perfil)}}catch(e){perfil=perfil||{nombre:user.displayName||'',correo:user.email}}}
function first(){return ((perfil&&perfil.nombre)||user.displayName||user.email||'').split(/\s+/)[0]}
function updBtn(){const b=q('#acctbtn');if(!b)return;b.classList.toggle('on',!!user);b.querySelector('.lbl').textContent=user?first()||'Mi cuenta':'Ingresar';b.setAttribute('aria-label',user?'Mi cuenta':'Ingresar o crear cuenta')}
function prefill(force){try{if(!perfil||typeof draft==='undefined')return;const set=(k,v)=>{if(v&&(force||!draft[k]))draft[k]=v};set('nombre',perfil.nombre);set('tel',perfil.tel);set('correo',perfil.correo||user.email);set('dir',perfil.dir);if(perfil.negocio){set('emp',perfil.negocio)}store.set('cym_draft',draft)}catch(e){}}
function afterLogin(nuevo){close();if(typeof note==='function')note(nuevo?'Cuenta creada. ¡Bienvenido!':'Ingresó a su cuenta')}
function ready(){prefill();updBtn();gateCheck();if(location.hash==='#pedido'&&typeof viewCheckout==='function'){viewCheckout();const b=q('#ckbtn');if(b){b.scrollIntoView({block:'center'})}}}

async function renderCuenta(){const ini=(first()[0]||'?').toUpperCase();
  const may=perfil&&perfil.mayoreo?'<span class="badge2">Cliente de mayoreo</span>':(perfil&&perfil.solicitaMayoreo?'<span class="badge2 wait">Mayoreo en revisión</span>':'');
  body.innerHTML=`<h2 id="accth">Mi cuenta</h2><div class="hello"><span class="av">${escH(ini)}</span><div><b>${escH(perfil&&perfil.nombre||user.displayName||'')}</b><br><small>${escH(user.email)}</small><br>${may}</div></div>
   <p style="margin:0 0 4px"><b>Teléfono:</b> ${escH(perfil&&perfil.tel||'—')}</p>${perfil&&perfil.negocio?`<p style="margin:0 0 4px"><b>Negocio:</b> ${escH(perfil.negocio)}</p>`:''}${perfil&&perfil.dir?`<p style="margin:0 0 4px"><b>Dirección:</b> ${escH(perfil.dir)}</p>`:''}
   <button class="lnk2" type="button" data-edit>Editar mis datos</button>
   <h2 style="font-size:20px;margin:14px 0 8px">Mis pedidos</h2><div class="orders" id="aorders"><p>Cargando…</p></div>
   <div style="display:flex;gap:10px;margin-top:16px"><button class="go" type="button" data-acx style="flex:1">Seguir comprando</button><button class="lnk2" type="button" data-out>Cerrar sesión</button></div>`;
  try{const s=await getDocs(query(collection(db,'pedidos'),where('uid','==',user.uid)));const L=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>((b.creado&&b.creado.seconds)||0)-((a.creado&&a.creado.seconds)||0)).slice(0,30);
    const box=q('#aorders');if(!box)return;box.innerHTML=L.length?L.map(o=>`<div class="ord"><span class="st ${escH(o.estado)}">${escH(EST[o.estado]||o.estado)}</span><b>Pedido ${escH(o.num)}</b><small>${escH(o.fecha||'')} · ${o.unidades||0} unidades · ${o.entrega==='envio'?'Envío':'Retiro en el local'}</small><ul>${(o.items||[]).slice(0,6).map(x=>`<li>${x.q} × ${escH(x.n)}</li>`).join('')}${(o.items||[]).length>6?`<li>y ${(o.items.length-6)} más…</li>`:''}</ul>${(()=>{const t=(o.items||[]).reduce((a,x)=>a+(x.pr||0)*(x.q||0),0);return t?`<small>Total aproximado: ₡${(Math.round(t*100)/100).toLocaleString('es-CR',{maximumFractionDigits:2})}</small>`:''})()}<button class="lnk2" type="button" data-reo="${escH(o.id)}" style="margin-top:6px">Pedir de nuevo</button></div>`).join(''):'<p>Todavía no tiene pedidos.</p>';
    box.onclick=e=>{const b=e.target.closest('[data-reo]');if(!b)return;const o=L.find(x=>x.id===b.dataset.reo);if(o&&window.reorderItems){const n=window.reorderItems(o.items||[]);b.textContent=n?'Agregado al carrito ✓':'Esos productos ya no están en el catálogo'}}}
  catch(e){const box=q('#aorders');if(box)box.innerHTML='<p>No se pudieron cargar sus pedidos. Revise su conexión.</p>'}}
function renderEdit(){const p=perfil||{};body.innerHTML=`<h2 id="accth">Mis datos</h2><form id="af-edit" novalidate>
   <div class="f"><label for="e-nom">Nombre completo</label><input id="e-nom" value="${escH(p.nombre)}" autocomplete="name"></div>
   <div class="f"><label for="e-tel">Teléfono (WhatsApp)</label><input id="e-tel" type="tel" value="${escH(p.tel)}" autocomplete="tel"></div>
   <div class="f"><label for="e-emp">Negocio (opcional)</label><input id="e-emp" value="${escH(p.negocio)}" autocomplete="organization"></div>
   <div class="f"><label for="e-dir">Dirección (opcional)</label><textarea id="e-dir" autocomplete="street-address">${escH(p.dir)}</textarea></div>
   <div class="msg" id="amsg" role="status"></div><button class="go" type="submit">Guardar</button></form><button class="lnk2" type="button" data-view="cuenta">Cancelar</button>`}

/* --- pedido: se guarda en la tienda --- */
if(typeof window.submitOrder==='function'){
window.submitOrder=async function(e){e.preventDefault();
  if(!user){pendingOrder=true;open('login','Para enviar su pedido a la tienda, ingrese o cree su cuenta. Es gratis y toma un minuto.');return}
  const d=readForm();let firstBad=null;const err=(id,msg,f)=>{const el=document.getElementById(id);if(el)el.textContent=msg;if(msg&&!firstBad)firstBad=f};
  err('e-nombre',d.nombre?'':'Escriba su nombre.','f-nombre');err('e-tel',/\d{8}/.test(d.tel.replace(/\D/g,''))?'':'Escriba un teléfono de 8 dígitos.','f-tel');err('e-dir',d.entrega==='envio'&&!d.dir?'Escriba la dirección para el envío.':'','f-dir');
  if(firstBad){document.getElementById(firstBad).focus();return}
  const it=cartItems();if(!it.length)return;const now=new Date();const pad=n=>String(n).padStart(2,'0');
  const o={num:`CM-${String(now.getFullYear()).slice(2)}${pad(now.getMonth()+1)}${pad(now.getDate())}-${Math.floor(Math.random()*9000)+1000}`,fecha:now.toLocaleString('es-CR'),d,items:it.map(({p,q})=>({id:p.id,n:p.t,c:p.nl?'':(p.c||''),m:p.m||'',q,pr:p.pr||0})),units:totals().units};
  const btn=document.getElementById('ckbtn');if(btn){btn.disabled=true;btn.textContent='Enviando pedido…'}
  try{await addDoc(collection(db,'pedidos'),{num:o.num,uid:user.uid,sitio:SITE,fecha:o.fecha,cliente:{nombre:d.nombre,tel:d.tel,correo:d.correo||user.email,negocio:d.emp||(perfil&&perfil.negocio)||'',codigo:(perfil&&perfil.codigo)||''},entrega:d.entrega,dir:d.dir||'',notas:d.notas||'',vol:!!d.vol,items:o.items,unidades:o.units,estado:'nuevo',creado:serverTimestamp()});o.enviado=true}
  catch(er){o.enviado=false;o.error=errMsg(er)}
  if(!o.enviado&&btn){btn.disabled=false;btn.textContent='Confirmar pedido';const m=document.getElementById('e-tel');alertBox('No se pudo enviar el pedido: '+(o.error||'')+' Revise su conexión e intente de nuevo.');return}
  store.set('cym_last_order',o);draft={...d,notas:''};store.set('cym_draft',draft);cart={};saveCart();
  try{updateDoc(doc(db,'clientes',user.uid),{tel:perfil&&perfil.tel?perfil.tel:d.tel,dir:perfil&&perfil.dir?perfil.dir:d.dir})}catch(e){}
  location.hash='pedido-listo'};
}
function alertBox(t){const f=document.getElementById('ckform');if(!f)return;let b=document.getElementById('ckerr');if(!b){f.insertAdjacentHTML('afterbegin','<div class="acct-note warn" id="ckerr" role="alert"></div>');b=document.getElementById('ckerr')}b.textContent=t}
if(typeof window.viewDone==='function'){const orig=window.viewDone;window.viewDone=function(){orig();const o=store.get('cym_last_order',null);const box=document.querySelector('.orderbox');if(!o||!box)return;
  const wa=waLink(orderText(o));
  const html=o.enviado?`<div class="acct-note"><span style="font-size:26px">✅</span><div><b>Su pedido ya le llegó a la tienda.</b>Le confirmamos precio, disponibilidad y entrega por teléfono o WhatsApp. Puede ver el estado en "Mi cuenta".${wa?`<div style="margin-top:10px"><a class="wa-btn" href="${wa}" target="_blank" rel="noopener">Avisar por WhatsApp</a></div>`:''}</div></div>`:'';
  box.insertAdjacentHTML('afterbegin',html);if(o.enviado){const p=box.querySelector('h1+p');if(p)p.innerHTML='Pedido <b>'+escH(o.num)+'</b>. Abajo está el detalle por si lo quiere copiar.'}}}

/* --- mayoreo: solo clientes aprobados --- */
let gate=null;
function gateHTML(kind){const logo='<img src="logo.webp" alt="Distribuidora C y M">';
  if(kind==='login')return `<div class="box">${logo}<h1>Catálogo de mayoreo</h1><p>Para ver el catálogo de mayoreo ingrese con su cuenta de cliente.</p><button class="go" type="button" data-g="login">Ingresar</button><button class="go" type="button" data-g="registro" style="background:#111;color:#fff">Crear cuenta</button><p style="margin-top:10px"><a href="index.html">Ir a la tienda para todo público</a></p></div>`;
  return `<div class="box">${logo}<h1>Su cuenta está en revisión</h1><p>Recibimos su solicitud para comprar al por mayor. La tienda revisa su cuenta y la aprueba; le avisamos por teléfono o WhatsApp.</p><p style="margin-top:10px"><a href="index.html">Mientras tanto, ver la tienda para todo público</a></p><button class="lnk2" type="button" data-g="out" style="background:none;border:0;text-decoration:underline;font-weight:600;padding:10px">Cerrar sesión</button></div>`}
function gateCheck(){if(SITE!=='mayoreo')return;if(!gate){document.body.insertAdjacentHTML('beforeend','<div class="gate" id="gate" hidden></div>');gate=q('#gate');
  gate.addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(!b)return;if(b.dataset.g==='out')signOut(auth);else open(b.dataset.g)})}
  if(!user){gate.innerHTML=gateHTML('login');gate.hidden=false;return}
  if(!perfil){gate.innerHTML='<div class="box"><p>Cargando su cuenta…</p></div>';gate.hidden=false;return}
  if(perfil&&perfil.mayoreo===true){gate.hidden=true;return}
  if(perfil&&!perfil.solicitaMayoreo){updateDoc(doc(db,'clientes',user.uid),{solicitaMayoreo:true}).catch(()=>{});perfil.solicitaMayoreo=true}
  gate.innerHTML=gateHTML('wait');gate.hidden=false}
if(SITE==='mayoreo'){gateCheck()}

let editOn=false;
async function isAdminU(u){try{return (await getDoc(doc(db,'admins',u.uid))).exists()}catch(e){return false}}
onAuthStateChanged(auth,async u=>{user=u;if(u){if(registering)return;
  if(await isAdminU(u)){perfil={nombre:'Administración',correo:u.email,mayoreo:true,admin:true};pendingOrder=false;ready();
    if(!editOn){editOn=true;import('./editar.js').then(m=>m.init({db,auth})).catch(()=>{})}return}
  await loadPerfil();pendingOrder=false;ready()}else{perfil=null;updBtn();gateCheck();if(editOn)location.reload()}});

/* --- ver en vivo lo que el cliente busca y agrega (solo clientes con cuenta; se les avisa al ingresar) --- */
let LVd={busq:[],vistos:[],t:0};
function liveSend(){if(!user||!perfil||perfil.admin)return;const st=(window.CYM_liveState?window.CYM_liveState():{items:[]});
  setDoc(doc(db,'envivo',user.uid),{uid:user.uid,nombre:String(perfil.nombre||user.displayName||'Cliente').slice(0,60),tel:String(perfil.tel||'').slice(0,20),sitio:SITE,items:st.items,busquedas:LVd.busq.slice(-15),vistos:LVd.vistos.slice(-10),actualizado:serverTimestamp()}).catch(()=>{})}
function liveSoon(){clearTimeout(LVd.t);LVd.t=setTimeout(liveSend,1500)}
addEventListener('cym:live',e=>{const d=e.detail||{};if(!user||!perfil||perfil.admin)return;
  if(d.t==='search'&&d.q){const q=String(d.q).slice(0,60);if(LVd.busq[LVd.busq.length-1]!==q)LVd.busq.push(q)}
  if(d.t==='view'&&d.id){if(!LVd.vistos.some(x=>x.id===d.id))LVd.vistos.push({id:d.id,n:String(d.nom||'').slice(0,80)})}
  liveSoon()});
setInterval(()=>{if(user&&perfil&&!perfil.admin&&!document.hidden)liveSend()},120000);

}
