const FUENTES={Barlow:'Barlow:wght@400;500;600;700','Barlow Condensed':'Barlow+Condensed:wght@600;700;800',Montserrat:'Montserrat:wght@400;600;700;800',Poppins:'Poppins:wght@400;500;600;700',Roboto:'Roboto:wght@400;500;700',Oswald:'Oswald:wght@500;600;700','Open Sans':'Open+Sans:wght@400;600;700',Lato:'Lato:wght@400;700;900',Nunito:'Nunito:wght@400;600;800',Raleway:'Raleway:wght@400;600;800','Bebas Neue':'Bebas+Neue'};
let T={c:{},f:{},t:[],b:{},s:{},i:{},l:{}},modo=/[?&]aparencia\b/.test(location.search),obs=null,mapT=new Map();
function aplicar(t){T=Object.assign({c:{},f:{},t:[],b:{},s:{},i:{},l:{}},t||{});
 const r=document.documentElement;for(const k in T.c){if(/^--[a-z-]+$/.test(k)&&/^#[0-9a-fA-F]{3,8}$/.test(T.c[k]))r.style.setProperty(k,T.c[k])}
 const fam=[];for(const k of ['display','body']){const n=T.f&&T.f[k];if(n&&FUENTES[n]){fam.push(FUENTES[n]);r.style.setProperty('--'+k,`'${n}',system-ui,sans-serif`)}}
 if(fam.length){let l=document.getElementById('cym-tema-f');if(!l){l=document.createElement('link');l.id='cym-tema-f';l.rel='stylesheet';document.head.appendChild(l)}l.href='https://fonts.googleapis.com/css2?'+fam.map(f=>'family='+f).join('&')+'&display=swap'}
 mapT=new Map((T.t||[]).filter(x=>x&&x[0]&&x[1]).map(x=>[String(x[0]).trim(),String(x[1])]));textos()}
function textos(){if(obs)obs.disconnect();try{diseno()}catch(e){}if(!mapT.size){arm();return}const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const s=n.nodeValue.trim();if(s&&mapT.has(s)){const p=n.parentElement;if(p&&!/^(SCRIPT|STYLE)$/.test(p.tagName)){p.dataset.o=p.dataset.o||s;n.nodeValue=n.nodeValue.replace(s,mapT.get(s))}}}arm()}
function arm(){if(!obs){let tm;obs=new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(textos,350)})}obs.observe(document.body,{childList:true,subtree:true})}
try{aplicar(JSON.parse(localStorage.getItem('cym_tema')||'null'))}catch(e){}
if(window.CYM_FB){(async()=>{try{const A=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),F=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');const app=A.initializeApp(window.CYM_FB,'tema'),db=F.getFirestore(app);const s=await F.getDoc(F.doc(db,'cambios','tema'));if(s.exists()){try{localStorage.setItem('cym_tema',JSON.stringify(s.data()))}catch(e){}if(!modo)aplicar(s.data())}}catch(e){}})()}
window.addEventListener('message',e=>{const d=e.data;if(d&&d.tipo==='tema'){aplicar(d.tema)}});

let mm='texto';
const kk=x=>String(x||'').replace(/\s+/g,' ').trim().slice(0,80);
const base=u=>String(u||'').split('?')[0].split('/').pop().slice(0,60);
function secs(){const v=document.getElementById('view');if(!v)return[];const seen={};return [...v.children].filter(x=>x.tagName==='SECTION'&&x.classList.contains('blk')).map((el,i)=>{const h=el.querySelector('h2'),h3=el.querySelector('h3');let k=kk(el.getAttribute('aria-label')||(h&&h.textContent)||(h3&&'Banners: '+(h3.dataset.o||h3.textContent))||('Sección '+(i+1)));seen[k]=(seen[k]||0)+1;if(seen[k]>1)k+=' #'+seen[k];return{el,k,t:h?kk(h.textContent):k}})}
function setTx(el,v){if(!el)return;if(el.dataset.ot===undefined)el.dataset.ot=el.textContent;let n=[...el.childNodes].find(c=>c.nodeType===3&&c.nodeValue.trim());if(n){if(n.nodeValue.trim()!==v)n.nodeValue=v}else if(el.textContent!==v)el.textContent=v}
function diseno(){const B=T.b||{},S=T.s||{},I=T.i||{},L=T.l||{};
 document.querySelectorAll('.bt').forEach(a=>{const h=a.querySelector('h3');if(!a.dataset.bk&&h)a.dataset.bk=kk(h.textContent);if(!a.dataset.ocls)a.dataset.ocls=a.className;if(!a.dataset.ohref)a.dataset.ohref=a.getAttribute('href')||'';
  const o=B[a.dataset.bk]||{};a.style.display=o.hide?'none':'';
  const pill=a.querySelector('.pill'),p=a.querySelector('p'),go=a.querySelector('.go');
  if(pill&&pill.dataset.o===undefined)pill.dataset.o=pill.textContent;if(h&&h.dataset.o===undefined)h.dataset.o=h.textContent;if(p&&p.dataset.o===undefined)p.dataset.o=p.textContent;if(go&&go.dataset.o===undefined)go.dataset.o=go.textContent;
  if(pill)setTx(pill,o.tag||pill.dataset.o);if(h)setTx(h,o.h||h.dataset.o);if(p)setTx(p,o.p||p.dataset.o);if(go)setTx(go,o.cta||go.dataset.o.trim());
  const hr=o.href||a.dataset.ohref;if(hr&&a.getAttribute('href')!==hr)a.setAttribute('href',hr);
  const cl='bt '+(o.cls&&/^[a-z]$/.test(o.cls)?o.cls:a.dataset.ocls.replace(/^bt\s*/,''));if(a.className!==cl&&!/\bcym-ed\b/.test(a.className))a.className=cl});
 const L2=secs(),v=document.getElementById('view');let ord=false;
 L2.forEach(x=>{const o=S[x.k]||{};x.el.style.display=o.hide?'none':'';if(o.ord!==undefined&&o.ord!==null){x.el.style.order=String(o.ord);x.el.style.width='100%';ord=true}else{x.el.style.order='';}});
 if(v){if(ord&&L2.length){v.style.display='flex';v.style.flexDirection='column'}else if(v.style.flexDirection==='column'){v.style.display='';v.style.flexDirection=''}}
 if(Object.keys(I).length||modo)document.querySelectorAll('img').forEach(im=>{if(im.dataset.os===undefined)im.dataset.os=im.getAttribute('src')||'';const k=base(im.dataset.os),u=I[k];const w=u||im.dataset.os;if(w&&im.getAttribute('src')!==w){if(u&&!/^data:image\/(webp|png|jpeg);base64,/.test(u))return;im.setAttribute('src',w);im.removeAttribute('srcset')}});
 if(Object.keys(L).length||modo||document.querySelector('[data-lm]'))document.querySelectorAll('a,button').forEach(a=>{if(a.classList.contains('bt')||a.querySelector('img,h3'))return;if(a.dataset.lk===undefined){const t=kk(a.textContent);a.dataset.lk=t;a.dataset.lh=a.getAttribute('href')||''}const k=a.dataset.lk;if(!k)return;const o=L[k];if(o){if(o.href&&a.tagName==='A'&&a.getAttribute('href')!==o.href)a.setAttribute('href',o.href);if(o.bg&&/^#[0-9a-fA-F]{3,8}$/.test(o.bg))a.style.setProperty('background',o.bg,'important');if(o.fg&&/^#[0-9a-fA-F]{3,8}$/.test(o.fg))a.style.setProperty('color',o.fg,'important')}else if(a.dataset.lm){a.style.removeProperty('background');a.style.removeProperty('color')}if(o)a.dataset.lm='1'})}
if(modo){const st=document.createElement('style');st.textContent='*{cursor:default}.cym-ed{outline:2px dashed #FFC400!important;outline-offset:2px;cursor:text!important;background:rgba(255,196,0,.12)!important}.cym-pk{outline:3px dashed #D7263D!important;outline-offset:3px;cursor:pointer!important}[contenteditable=true]{outline:2px solid #1B4079!important;background:#fff8d6!important}';document.head.appendChild(st);
 const pick=t=>mm==='banner'?t.closest('.bt'):mm==='imagen'?t.closest('img'):mm==='boton'?t.closest('a,button'):null;
 let prev=null;document.addEventListener('mouseover',e=>{const t=e.target;if(prev){prev.classList.remove('cym-ed');prev.classList.remove('cym-pk')}prev=null;if(mm==='texto'){if(t.children.length===0&&t.textContent.trim()&&!/^(SCRIPT|STYLE|HTML|BODY)$/.test(t.tagName)){t.classList.add('cym-ed');prev=t}}else{const el=pick(t);if(el){el.classList.add('cym-pk');prev=el}}},true);
 document.addEventListener('click',e=>{const t=e.target;
  if(mm!=='texto'){e.preventDefault();e.stopPropagation();const el=pick(t);if(!el)return;let d=null;
   if(mm==='banner'){const q=s=>{const x=el.querySelector(s);return x?(x.dataset.o!==undefined?x.dataset.o:x.textContent).trim():''};d={kind:'banner',key:el.dataset.bk,cur:{tag:q('.pill'),h:q('h3'),p:q('p'),cta:q('.go'),href:el.dataset.ohref,cls:el.dataset.ocls.replace(/^bt\s*/,'').trim()}}}
   else if(mm==='imagen'){d={kind:'imagen',key:base(el.dataset.os||el.getAttribute('src')),src:el.getAttribute('src').slice(0,200)}}
   else if(mm==='boton'){d={kind:'boton',key:el.dataset.lk,cur:{href:el.dataset.lh||'',text:el.dataset.lk}}}
   if(d)parent.postMessage({tipo:'elem',d},'*');return}
  if(t.children.length===0&&t.textContent.trim()){e.preventDefault();e.stopPropagation();if(t.isContentEditable)return;t.dataset.o=t.dataset.o||t.textContent.trim();t.dataset.v=t.textContent.trim();t.contentEditable='true';t.focus();
  t.addEventListener('blur',function f(){t.removeEventListener('blur',f);t.contentEditable='false';const n=t.textContent.trim();if(n&&n!==t.dataset.v)parent.postMessage({tipo:'texto',o:t.dataset.o,n},'*')})}else{const a=t.closest('a,button');if(a){e.preventDefault();e.stopPropagation()}}},true);
 window.addEventListener('message',e=>{const d=e.data;if(!d)return;if(d.tipo==='modo'){mm=d.m||'texto'}if(d.tipo==='lista'){try{diseno()}catch(x){}parent.postMessage({tipo:'lista',secs:secs().map(x=>({k:x.k,t:x.t}))},'*')}});
 setTimeout(()=>parent.postMessage({tipo:'listo'},'*'),1500)}
