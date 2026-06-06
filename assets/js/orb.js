/* ORBE — vídeo de la esfera. El interior es plasma volumétrico (vida 3D real, no luz superficial).
   En reposo: churn lento (vivo). Al pasar el cursor por encima: el interior ACELERA y el orbe se
   inclina en 3D hacia el ratón (parallax). La cara no gira: solo se mueve la energía + el tilt. */
(function(){
  var wrap=document.querySelector('.orb-wrap');
  var v=document.getElementById('mjOrb');
  var glow=wrap&&wrap.querySelector('.orb-glow');
  if(!wrap||!v)return;

  var REST=0.28, HOT=0.78;          // velocidad del interior en reposo / al pasar por encima (~50% más lento)
  var TILT=7, GLOW=16;              // grados máx de inclinación 3D / px máx del halo

  // autoplay (algunos navegadores lo bloquean hasta un gesto): reintenta sin romper.
  function play(){ var p=v.play&&v.play(); if(p&&p.catch) p.catch(function(){}); }
  v.addEventListener('loadeddata',play); play();
  v.playbackRate=REST;

  // estado actual / objetivo (se interpolan en cada frame para que todo sea suave)
  var rate=REST,  tRate=REST;
  var rx=0,ry=0,  trx=0,try_=0;     // rotación 3D (deg)
  var gx=0,gy=0,  tgx=0,tgy=0;      // desplazamiento del halo (px)

  function move(e){
    var r=wrap.getBoundingClientRect();
    var nx=(e.clientX-(r.left+r.width/2))/(r.width/2);
    var ny=(e.clientY-(r.top+r.height/2))/(r.height/2);
    nx=Math.max(-1,Math.min(1,nx)); ny=Math.max(-1,Math.min(1,ny));
    trx = -ny*TILT;                 // rotateX (arriba/abajo, invertido)
    try_=  nx*TILT;                 // rotateY (izq/der)
    tgx =  nx*GLOW; tgy = ny*GLOW;  // el halo deriva hacia el cursor
  }
  function enter(){ tRate=HOT; }
  function leave(){ tRate=REST; trx=try_=0; tgx=tgy=0; }
  wrap.addEventListener('mousemove',move);
  wrap.addEventListener('mouseenter',enter);
  wrap.addEventListener('mouseleave',leave);

  function tick(){
    rate+=(tRate-rate)*0.06; if(!v.paused) v.playbackRate=rate;
    rx+=(trx-rx)*0.1; ry+=(try_-ry)*0.1; gx+=(tgx-gx)*0.1; gy+=(tgy-gy)*0.1;
    v.style.setProperty('--rx',rx.toFixed(2)+'deg');
    v.style.setProperty('--ry',ry.toFixed(2)+'deg');
    if(glow){ glow.style.setProperty('--gx',gx.toFixed(1)+'px'); glow.style.setProperty('--gy',gy.toFixed(1)+'px'); }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
