/* ORBE + INTRO GAMIFICADA POR SCROLL
   - Al entrar: el orbe en su 1er frame (canica), copy "Quiero a monje·io" + flecha. Nada más.
   - Al hacer scroll (corto): el vídeo se SCRUBBEA → se forma la cara del monje, y van apareciendo
     por fases el eyebrow, el titular y el chat.
   - Móvil / prefers-reduced-motion: sin pin/scrub; todo visible y el orbe en bucle suave.
   - En ambos casos: leve inclinación 3D del orbe hacia el cursor (parallax). */
(function(){
  var html=document.documentElement;
  var hero=document.getElementById('hero');
  var v=document.getElementById('mjOrb');
  var wrap=document.querySelector('.orb-wrap');
  var glow=wrap&&wrap.querySelector('.orb-glow');
  var hint=document.getElementById('introHint');
  var phEls=[].slice.call(document.querySelectorAll('.ph'));
  var corners=[].slice.call(document.querySelectorAll('.corner-cta'));
  if(!hero||!v||!wrap)return;

  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var gamified=!reduce && window.innerWidth>760;

  function clamp(x){return x<0?0:x>1?1:x;}
  function rng(p,a,b){return clamp((p-a)/(b-a));}
  function smooth(t){return t*t*(3-2*t);}

  var dur=10;
  v.addEventListener('loadedmetadata',function(){ dur=v.duration||10; });

  if(!gamified){
    /* ---- móvil / reduced motion: todo visible, vídeo vivo en bucle ---- */
    if(hint) hint.style.display='none';
    v.loop=true; v.muted=true; v.playbackRate=0.5;
    var pr=v.play&&v.play(); if(pr&&pr.catch) pr.catch(function(){});
  } else {
    /* ---- desktop: intro gamificada ---- */
    html.classList.add('gamified');
    try{ v.pause(); }catch(e){}
    // la intro debe empezar SIEMPRE arriba (evita que el navegador restaure el scroll)
    if('scrollRestoration' in history) history.scrollRestoration='manual';
    window.scrollTo(0,0);
    window.addEventListener('load',function(){ window.scrollTo(0,0); });

    var inner=document.querySelector('.hero-inner');
    // delta = cuánto bajar el contenido para que el ORBE quede centrado en el 1er vistazo (p=0).
    // Al avanzar el scroll vuelve a 0 → el grupo queda centrado (layout final).
    var delta=0;
    function measure(){
      if(!inner)return;
      inner.style.transform='none';
      var r=wrap.getBoundingClientRect();
      delta=(window.innerHeight/2)-(r.top+r.height/2);
    }
    measure();
    window.addEventListener('load',measure);

    var prog=0;
    function readScroll(){
      var travel=hero.offsetHeight-window.innerHeight;
      prog=clamp((-hero.getBoundingClientRect().top)/(travel||1));
    }
    window.addEventListener('scroll',readScroll,{passive:true});
    window.addEventListener('resize',function(){ measure(); readScroll(); });
    readScroll();

    function setPh(el,a,b){
      var t=smooth(rng(prog,a,b));
      el.style.opacity=t;
      el.style.transform='translateY('+((1-t)*18).toFixed(1)+'px)';
      el.style.pointerEvents = t>0.95 ? 'auto' : 'none';
    }
    var lastT=-1;
    function frameGame(){
      if(v.readyState>=2){
        var tt=prog*(dur-0.05);
        if(Math.abs(tt-lastT)>0.008){ try{ v.currentTime=tt; }catch(e){} lastT=tt; }
      }
      if(inner) inner.style.transform='translateY('+((1-prog)*delta).toFixed(1)+'px)';
      if(hint) hint.style.opacity = 1 - smooth(rng(prog,0.0,0.12));
      for(var i=0;i<phEls.length;i++){
        var el=phEls[i], k=el.getAttribute('data-ph');
        if(k==='eyebrow') setPh(el,0.46,0.60);
        else if(k==='title') setPh(el,0.60,0.73);
        else if(k==='stage') setPh(el,0.74,0.90);
        else if(k==='nav') setPh(el,0.55,0.66);
      }
      // CTAs de esquina (Contacta / WhatsApp): aparecen al final
      var c=smooth(rng(prog,0.82,0.96));
      for(var j=0;j<corners.length;j++){ corners[j].style.opacity=c; corners[j].style.pointerEvents = c>0.95?'auto':'none'; }
      requestAnimationFrame(frameGame);
    }
    requestAnimationFrame(frameGame);
  }

  /* ---- inclinación 3D hacia el cursor (parallax), suave ---- */
  var rx=0,ry=0,trx=0,try_=0,gx=0,gy=0,tgx=0,tgy=0,TILT=7,GLOW=16;
  function c1(x){return x<-1?-1:x>1?1:x;}
  wrap.addEventListener('mousemove',function(e){
    var r=wrap.getBoundingClientRect();
    var nx=c1((e.clientX-(r.left+r.width/2))/(r.width/2));
    var ny=c1((e.clientY-(r.top+r.height/2))/(r.height/2));
    trx=-ny*TILT; try_=nx*TILT; tgx=nx*GLOW; tgy=ny*GLOW;
  });
  wrap.addEventListener('mouseleave',function(){ trx=try_=0; tgx=tgy=0; });
  function tickTilt(){
    rx+=(trx-rx)*0.1; ry+=(try_-ry)*0.1; gx+=(tgx-gx)*0.1; gy+=(tgy-gy)*0.1;
    v.style.setProperty('--rx',rx.toFixed(2)+'deg');
    v.style.setProperty('--ry',ry.toFixed(2)+'deg');
    if(glow){ glow.style.setProperty('--gx',gx.toFixed(1)+'px'); glow.style.setProperty('--gy',gy.toFixed(1)+'px'); }
    requestAnimationFrame(tickTilt);
  }
  requestAnimationFrame(tickTilt);
})();
