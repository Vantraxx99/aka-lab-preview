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

/* ---------- intro: logo AKA LAB ---------- */
function intro(done){
  var L=document.querySelector('.loader'), target=document.querySelector('.hdr .logo');
  if(!L||!target||RM||ss('aka-seen')||ss('aka-trans')){doc.classList.add('no-loader','loaded');return done()}
  ss('aka-seen','1'); doc.classList.add('intro-run');
  var logo=L.querySelector('.loader-logo');
  var fonts=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
  fonts.then(function(){
    var big=Math.min(innerWidth*.86/3.25, innerHeight*.42);
    logo.style.fontSize=big+'px';
    var r=logo.getBoundingClientRect();
    var x0=(innerWidth-r.width)/2, y0=(innerHeight-r.height)/2;
    logo.style.transition='none';logo.style.transform='translate('+x0+'px,'+y0+'px)';
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      L.classList.add('show');
      setTimeout(function(){
        var t=target.getBoundingClientRect(), k=t.height/r.height;
        logo.style.transition='';
        logo.style.transform='translate('+t.left+'px,'+(t.top-(r.height*k-t.height)/2)+'px) scale('+k+')';
        L.classList.add('fly');
        setTimeout(done,450);
        setTimeout(function(){doc.classList.add('loaded');doc.classList.remove('intro-run')},1080);
      },1250);
    })});
  });
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

/* ---------- 365 phases ---------- */
function approach(){
  var sec=document.querySelector('.approach'); if(!sec)return function(){};
  var bar=sec.querySelector('.phases-bar i'), phases=$$('.phase',sec), ph=sec.querySelector('.phases');
  return function(){
    if(!ph)return; var vh=innerHeight, pr=ph.getBoundingClientRect(), p=clamp((vh*.9-pr.top)/(pr.height+vh*.3),0,1);
    bar.style.width=(p*100).toFixed(2)+'%';
    var k=Math.min(phases.length-1,Math.floor(p*phases.length*1.0001));
    phases.forEach(function(el,i){el.classList.toggle('on',i===k&&p>0)});
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

/* ---------- 3D: onda di punti (three.js) ---------- */
function stage(){
  var cv=document.querySelector('.hero-stage'); if(!cv)return;
  if(!window.THREE||RM){cv.style.display='none';return}
  var T=window.THREE, renderer;
  try{renderer=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){cv.style.display='none';return}
  var small=innerWidth<760;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.setClearColor(0x120F0E,1);
  var scene=new T.Scene(), cam=new T.PerspectiveCamera(55,1,.1,200);
  var NX=small?90:180, NZ=small?50:80, SX=small?.34:.3, SZ=.36, n=NX*NZ, pos=new Float32Array(n*3), k=0;
  for(var z=0;z<NZ;z++)for(var x=0;x<NX;x++){pos[k++]=(x-NX/2)*SX;pos[k++]=0;pos[k++]=-z*SZ}
  var g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
  var U={uT:{value:0},uM:{value:new T.Vector2(0,-6)},uPR:{value:renderer.getPixelRatio()}};
  var m=new T.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:'uniform float uT;uniform vec2 uM;uniform float uPR;varying float vH;varying float vF;void main(){vec3 p=position;'+
      'float w=sin(p.x*.35+uT*.9)*.45+sin(p.z*.5-uT*1.1)*.35+sin((p.x+p.z)*.18+uT*.6)*.6;'+
      'float d=distance(p.xz,uM);w+=sin(d*1.6-uT*4.)*exp(-d*.35)*.9;p.y=w;vH=w;'+
      'vec4 mv=modelViewMatrix*vec4(p,1.);vF=clamp(1.+mv.z/34.,0.,1.);gl_PointSize=uPR*(2.2+w*.8)*(14./-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying float vH;varying float vF;void main(){vec2 c=gl_PointCoord-.5;if(dot(c,c)>.25)discard;'+
      'vec3 red=vec3(.91,.38,.36);vec3 cream=vec3(.98,.95,.92);vec3 col=mix(red,cream,smoothstep(.3,1.3,vH));'+
      'float a=vF*vF*(.35+.45*smoothstep(-.6,1.2,vH));gl_FragColor=vec4(col*a,a);}'});
  var pts=new T.Points(g,m);scene.add(pts);
  var mx=0,my=0,tx=0,ty=0, ray=new T.Raycaster(), plane=new T.Plane(new T.Vector3(0,1,0),0), hit=new T.Vector3(), ndc=new T.Vector2();
  addEventListener('pointermove',function(e){tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;
    var r=cv.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,cam);if(ray.ray.intersectPlane(plane,hit))U.uM.value.set(hit.x,hit.z)});
  function size(){var w=cv.clientWidth,h=cv.clientHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  size();addEventListener('resize',size);
  var vis=true;new IntersectionObserver(function(es){vis=es[0].isIntersecting}).observe(cv);
  var t0=performance.now();
  (function loop(now){requestAnimationFrame(loop);if(!vis||document.hidden)return;var t=(now-t0)/1000;
    mx=lerp(mx,tx,.04);my=lerp(my,ty,.04);U.uT.value=t;
    cam.position.set(mx*3,6.5-my*1.5,9);cam.lookAt(0,-1.2,-12);
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
    hdr(y);mq(v,dt);ap();sc();px();requestAnimationFrame(loop)})(lastT);
  intro(function(){fonts.then(function(){fitAll();$$('[data-hero]').forEach(function(el){el.classList.add('go')});reveals()})});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
