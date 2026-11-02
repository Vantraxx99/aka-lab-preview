/* AKA LAB — animazioni condivise */
(function(){
'use strict';
var doc=document.documentElement, RM=matchMedia('(prefers-reduced-motion: reduce)').matches, FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))}, lerp=function(a,b,t){return a+(b-a)*t};
function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}
function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}

/* ---------- split ---------- */
function splitChars(root){
  $$('.fit .ln > span',root).forEach(function(span){
    if(span.dataset.split)return; span.dataset.split=1;
    var nodes=[].slice.call(span.childNodes), out=document.createDocumentFragment(), i=+(span.parentNode.dataset.i||0)*6;
    nodes.forEach(function(n){
      if(n.nodeType===3){n.textContent.split('').forEach(function(c){var s=document.createElement('span');s.className='ch';s.style.setProperty('--i',i++);s.textContent=c===' '?' ':c;out.appendChild(s)})}
      else{var t=n.textContent;n.textContent='';t.split('').forEach(function(c){var s=document.createElement('span');s.className='ch';s.style.setProperty('--i',i++);s.textContent=c===' '?' ':c;n.appendChild(s)});out.appendChild(n)}
    });
    span.textContent='';span.appendChild(out);span.setAttribute('aria-hidden','true');
  });
}
function splitWords(el){
  if(el.dataset.split)return; el.dataset.split=1;
  var hl=(el.dataset.hl||'').toLowerCase().split('|');
  var words=el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label',el.textContent.trim());
  el.innerHTML=words.map(function(w){var c=hl.indexOf(w.toLowerCase().replace(/[^\wàèéìòù']/g,''))>-1?' hl':'';return '<span class="w'+c+'" aria-hidden="true">'+w+'</span>'}).join(' ');
}

/* ---------- fit text ---------- */
function fit(el){
  var lines=$$('.ln',el); if(!lines.length)return;
  el.style.fontSize='100px';
  var maxW=0; lines.forEach(function(l){var s=l.firstElementChild; maxW=Math.max(maxW,s.getBoundingClientRect().width)});
  var W=el.clientWidth, fsW=W/maxW*100*.985, fs=fsW;
  var box=el.dataset.fitH?el.closest(el.dataset.fitH):null;
  if(box){var H=box.clientHeight; fs=Math.min(fs,H/(lines.length*.9+.12))}
  if(el.dataset.max)fs=Math.min(fs,+el.dataset.max);
  if(el.dataset.maxVh)fs=Math.min(fs,innerHeight*+el.dataset.maxVh/100);
  if(el.dataset.min)fs=Math.max(fs,+el.dataset.min);
  el.style.fontSize=fs.toFixed(2)+'px';
}
function fitAll(){$$('[data-fit]').forEach(fit)}

/* ---------- loader ---------- */
function intro(done){
  var L=document.querySelector('.loader');
  if(!L||RM||ss('aka-seen')||ss('aka-trans')){doc.classList.add('no-loader','loaded');return done()}
  ss('aka-seen','1');
  var c=L.querySelector('.loader-count'), bar=L.querySelector('.loader-bar'), t0=performance.now(), D=1300;
  (function tick(now){var p=clamp((now-t0)/D,0,1), e=1-Math.pow(1-p,3), v=Math.round(e*365);
    c.textContent=('00'+v).slice(-3); bar.style.width=(e*100)+'%';
    if(p<1)requestAnimationFrame(tick); else setTimeout(function(){doc.classList.add('loaded');setTimeout(done,350)},180)})(t0);
}

/* ---------- page transitions ---------- */
function transitions(){
  var cur=document.querySelector('.curtain'); if(!cur)return;
  if(ss('aka-trans')){ss('aka-trans','');try{sessionStorage.removeItem('aka-trans')}catch(e){}
    cur.style.transform='none'; requestAnimationFrame(function(){requestAnimationFrame(function(){cur.style.transform='';cur.classList.add('out');setTimeout(function(){cur.classList.remove('out')},900)})})}
  document.addEventListener('click',function(e){
    var a=e.target.closest('a'); if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank')return;
    var href=a.getAttribute('href')||''; if(!href||href.charAt(0)==='#'||/^(mailto|tel):/.test(href))return;
    var u=new URL(a.href,location.href); if(u.origin!==location.origin)return;
    var norm=function(x){return x.replace(/index\.html$/,'')};
    if(norm(u.pathname)===norm(location.pathname))return;
    e.preventDefault(); ss('aka-trans','1'); doc.classList.remove('menu-open');
    if(RM){location.href=a.href;return}
    cur.classList.add('in'); setTimeout(function(){location.href=a.href},680);
  });
  window.addEventListener('pageshow',function(ev){if(ev.persisted){cur.classList.remove('in','out')}});
}

/* ---------- header / menu ---------- */
function header(){
  var h=document.querySelector('.hdr'); if(!h)return function(){};
  var b=document.querySelector('.burger');
  if(b)b.addEventListener('click',function(){var o=doc.classList.toggle('menu-open');b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Chiudi menu':'Apri menu')});
  $$('.menu a').forEach(function(a){a.addEventListener('click',function(){doc.classList.remove('menu-open');if(b)b.setAttribute('aria-expanded','false')})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&doc.classList.contains('menu-open')){doc.classList.remove('menu-open');b&&b.focus()}});
  var hero=document.querySelector('.hero'), last=0;
  return function(y){
    var lim=hero?hero.offsetHeight-h.offsetHeight-10:30;
    h.classList.toggle('solid',y>lim);
    if(!doc.classList.contains('menu-open'))h.classList.toggle('hide',y>600&&y>last+2);
    if(y<last-2||y<600)h.classList.remove('hide');
    last=y;
  };
}

/* ---------- reveals + counters ---------- */
function count(el){
  var to=parseFloat(el.dataset.count), dec=(el.dataset.count.split('.')[1]||'').length, pre=el.dataset.pre||'', suf=el.dataset.suf||'', t0=performance.now(), D=1800;
  if(RM){el.innerHTML=pre+to.toFixed(dec)+(suf?'<em>'+suf+'</em>':'');return}
  (function tick(now){var p=clamp((now-t0)/D,0,1),e=1-Math.pow(1-p,4);el.innerHTML=pre+(to*e).toFixed(dec)+(suf?'<em>'+suf+'</em>':'');if(p<1)requestAnimationFrame(tick)})(t0);
}
function reveals(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target;
    t.classList.add('in'); if(t.dataset.count)count(t); if(t.hasAttribute('data-go'))t.classList.add('go'); io.unobserve(t)})},{rootMargin:'0px 0px -12% 0px',threshold:.01});
  $$('[data-reveal],.lines,[data-count],[data-go]').forEach(function(el){io.observe(el)});
}

/* ---------- marquees ---------- */
function marquees(){
  var rows=$$('[data-mq]').map(function(el){
    el.innerHTML=el.innerHTML+el.innerHTML;
    return {el:el,x:0,dir:+(el.dataset.mq)||1,speed:+(el.dataset.speed||.6)};
  });
  return function(v,dt){rows.forEach(function(r){
    var w=r.el.scrollWidth/2; if(!w)return;
    r.x-= (r.speed+Math.min(Math.abs(v)*.06,14))*r.dir*dt*.06;
    if(r.x<=-w)r.x+=w; if(r.x>0)r.x-=w;
    r.el.style.transform='translate3d('+r.x.toFixed(2)+'px,0,0) skewX('+clamp(-v*.04,-8,8).toFixed(2)+'deg)';
  })};
}

/* ---------- 365 ring + phases ---------- */
function approach(){
  var sec=document.querySelector('.approach'); if(!sec)return function(){};
  var ring=sec.querySelector('.ring'), box=sec.querySelector('.ring-box'), items=ring?$$('span',ring):[], R=0;
  function layout(){R=Math.min(box.clientWidth,box.clientHeight*1.6)*.42;items.forEach(function(s,i){var a=360/items.length*i;s.style.transform='rotateY('+a+'deg) translateZ('+R+'px) translate(-50%,-50%)'})}
  if(ring){layout();window.addEventListener('resize',layout)}
  var bar=sec.querySelector('.phases-bar i'), phases=$$('.phase',sec), ph=sec.querySelector('.phases'), rot=0;
  return function(y,v,dt){
    var vh=innerHeight;
    if(ring){var r=box.getBoundingClientRect(); if(r.bottom>0&&r.top<vh){rot+=dt*.012+v*.04;var tilt=clamp((r.top+r.height/2-vh/2)/vh,-1,1)*-14;ring.style.transform='rotateX('+(-12+tilt).toFixed(2)+'deg) rotateY('+rot.toFixed(2)+'deg)'}}
    if(ph){var pr=ph.getBoundingClientRect(), p=clamp((vh*.85-pr.top)/(pr.height+vh*.35),0,1);
      bar.style.width=(p*100).toFixed(2)+'%';
      var k=Math.min(phases.length-1,Math.floor(p*phases.length*1.0001));
      phases.forEach(function(el,i){el.classList.toggle('on',i===k&&p>0);el.classList.toggle('dim',p>0&&p<1&&i>k)})}
  };
}

/* ---------- word scrub ---------- */
function scrubs(){
  var els=$$('.scrub'); els.forEach(splitWords);
  return function(){var vh=innerHeight;els.forEach(function(el){var r=el.getBoundingClientRect(); if(r.bottom<-vh||r.top>vh*2)return;
    var p=clamp((vh*.85-r.top)/(r.height+vh*.25),0,1), ws=el.querySelectorAll('.w'), n=Math.round(p*ws.length);
    for(var i=0;i<ws.length;i++)ws[i].classList.toggle('on',i<n)})};
}

/* ---------- cursor, magnetic, tilt ---------- */
function pointerFx(){
  if(!FINE||RM)return;
  var c=document.createElement('div');c.className='cursor';var lb=document.createElement('div');lb.className='cursor-label';
  document.body.appendChild(c);document.body.appendChild(lb);
  var mx=-100,my=-100,cx=mx,cy=my;
  addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;c.classList.add('on')});
  document.addEventListener('pointerleave',function(){c.classList.remove('on')});
  document.addEventListener('pointerover',function(e){var t=e.target.closest('a,button,summary,label,[data-cursor]');c.classList.toggle('big',!!t);
    var l=t&&t.getAttribute('data-cursor');lb.textContent=l||'';lb.classList.toggle('on',!!l)});
  (function loop(){cx=lerp(cx,mx,.2);cy=lerp(cy,my,.2);c.style.transform='translate3d('+cx+'px,'+cy+'px,0)';lb.style.left=cx+'px';lb.style.top=cy+'px';requestAnimationFrame(loop)})();
  $$('.magnetic').forEach(function(el){
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform='translate('+(x*.25)+'px,'+(y*.3)+'px)'});
    el.addEventListener('pointerleave',function(){el.style.transform=''});
  });
  $$('.card').forEach(function(card){var cv=card.querySelector('.cover');if(!cv)return;
    card.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;cv.style.transform='rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg) translateZ(0)'});
    card.addEventListener('pointerleave',function(){cv.style.transform=''});
  });
}

/* ---------- misc ---------- */
function timecode(){var el=document.querySelector('[data-tc]');if(!el)return;var t0=performance.now();
  setInterval(function(){var s=(performance.now()-t0)/1000,f=Math.floor((s%1)*25),p=function(n){return ('0'+n).slice(-2)};el.textContent=p(Math.floor(s/3600))+':'+p(Math.floor(s/60)%60)+':'+p(Math.floor(s)%60)+':'+p(f)},40)}
function details(){
  function openHash(){var id=location.hash.slice(1);if(!id)return;var d=document.getElementById(id);if(d&&d.tagName==='DETAILS'){d.open=true;setTimeout(function(){d.scrollIntoView({block:'start'})},60)}}
  addEventListener('hashchange',openHash);openHash();
  $$('.svc-panel li').forEach(function(li,i,all){var sib=[].indexOf.call(li.parentNode.children,li);li.style.setProperty('--i',sib)});
}
function parallax(){var els=$$('[data-par]');return function(){var vh=innerHeight;els.forEach(function(el){var r=el.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;var p=(r.top+r.height/2-vh/2)/vh;el.style.transform='translate3d(0,'+(p*+el.dataset.par).toFixed(1)+'px,0)'})}}

/* ---------- 3D stage (three.js) ---------- */
function stage(){
  var cv=document.querySelector('.hero-stage'); if(!cv)return;
  if(!window.THREE||RM){cv.insertAdjacentHTML('afterend','<div class="hero-fallback"></div>');return}
  var T=window.THREE, renderer;
  try{renderer=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'high-performance'})}catch(e){cv.insertAdjacentHTML('afterend','<div class="hero-fallback"></div>');return}
  var small=innerWidth<760;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,small?1.5:1.75));
  renderer.setClearColor(0x120F0E,1);
  var scene=new T.Scene(), cam=new T.PerspectiveCamera(50,1,.1,100); cam.position.set(0,0,10);
  var H=19;
  var vs='varying float vY;varying vec3 vN;varying vec3 vV;uniform float uH;void main(){vY=-position.y/uH;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}';
  var fs='varying float vY;varying vec3 vN;varying vec3 vV;uniform vec3 uC;uniform float uI;uniform float uT;void main(){float e=pow(abs(dot(vN,vV)),1.3);float f=pow(1.-clamp(vY,0.,1.),1.25);float n=.85+.15*sin(vY*30.-uT*2.);float a=uI*e*f*n*smoothstep(0.,.02,vY)+uI*.9*pow(max(0.,1.-vY*9.),3.);gl_FragColor=vec4(uC*a,a);}';
  var cols=[0xE8605B,0xFBFAF9,0x9B1E22,0xE8605B,0xFBFAF9,0x9B1E22,0xE8605B];
  var beams=[], N=small?5:7;
  for(var i=0;i<N;i++){
    var g=new T.ConeGeometry(small?1.7:2.2,H,64,1,true); g.translate(0,-H/2,0);
    var m=new T.ShaderMaterial({vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
      uniforms:{uH:{value:H},uC:{value:new T.Color(cols[i%cols.length])},uI:{value:cols[i%cols.length]===0xFBFAF9?.42:.85},uT:{value:0}}});
    var b=new T.Mesh(g,m), x=(i/(N-1)-.5)*(small?7:15);
    b.position.set(x,8.2,-3-(i%3)*1.6);
    b.userData={base:-x*.035,amp:.28+Math.random()*.22,sp:.25+Math.random()*.35,ph:Math.random()*6.28,tx:.12+Math.random()*.15};
    scene.add(b);beams.push(b);
  }
  var PC=small?600:1600, pos=new Float32Array(PC*3), vel=new Float32Array(PC);
  for(var k=0;k<PC;k++){pos[k*3]=(Math.random()-.5)*24;pos[k*3+1]=(Math.random()-.5)*14;pos[k*3+2]=(Math.random()-.5)*10-2;vel[k]=.002+Math.random()*.006}
  var pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pos,3));
  var dot=document.createElement('canvas');dot.width=dot.height=32;var dc=dot.getContext('2d'),gr=dc.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');dc.fillStyle=gr;dc.fillRect(0,0,32,32);
  var pts=new T.Points(pg,new T.PointsMaterial({size:small?.07:.06,map:new T.CanvasTexture(dot),color:0xF3D9D2,transparent:true,opacity:.55,depthWrite:false,blending:T.AdditiveBlending}));
  scene.add(pts);
  var mx=0,my=0,tx=0,ty=0;
  addEventListener('pointermove',function(e){tx=(e.clientX/innerWidth-.5);ty=(e.clientY/innerHeight-.5)});
  function size(){var w=cv.clientWidth,h=cv.clientHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.position.z=w/h<1?13:10;cam.updateProjectionMatrix()}
  size();addEventListener('resize',size);
  var vis=true;new IntersectionObserver(function(es){vis=es[0].isIntersecting}).observe(cv);
  var t0=performance.now();
  (function loop(now){requestAnimationFrame(loop);if(!vis||document.hidden)return;var t=(now-t0)/1000;
    mx=lerp(mx,tx,.04);my=lerp(my,ty,.04);
    beams.forEach(function(b){var u=b.userData;b.rotation.z=u.base+Math.sin(t*u.sp+u.ph)*u.amp+mx*.25;b.rotation.x=Math.sin(t*u.sp*.7+u.ph)*u.tx+my*.12;b.material.uniforms.uT.value=t});
    var p=pg.attributes.position.array;for(var k=0;k<PC;k++){p[k*3+1]+=vel[k];p[k*3]+=Math.sin(t*.3+k)*.0015;if(p[k*3+1]>7)p[k*3+1]=-7}pg.attributes.position.needsUpdate=true;
    cam.position.x=mx*1.2;cam.position.y=-my*.6;cam.lookAt(0,.5,0);
    renderer.render(scene,cam)})(t0);
}

/* ---------- boot ---------- */
function boot(){
  splitChars(document);
  var fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
  fonts.then(fitAll);fitAll();
  var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(fitAll,80)});
  transitions();details();timecode();pointerFx();stage();
  var hdr=header(), mq=marquees(), ap=approach(), sc=scrubs(), px=parallax();
  var lastY=scrollY, v=0, lastT=performance.now();
  (function loop(now){var dt=Math.min(now-lastT,50);lastT=now;var y=scrollY;v=lerp(v,(y-lastY),.2);lastY=y;
    hdr(y);mq(v,dt);ap(y,v,dt);sc();px();requestAnimationFrame(loop)})(lastT);
  intro(function(){fonts.then(function(){fitAll();$$('[data-hero]').forEach(function(el){el.classList.add('go')});reveals()})});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
