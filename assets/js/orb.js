/* ORBE — vídeo real de la esfera. Vivo en loop (ritmo calmado);
   al pasar el cursor por encima acelera y reacciona (la escala la pone el CSS). */
(function(){
  var v=document.getElementById('mjOrb');
  var wrap=document.querySelector('.orb-wrap');
  if(!v||!wrap)return;

  var REST=0.82, HOT=1.9;          // velocidad en reposo / al pasar por encima
  var target=REST, cur=REST;
  v.playbackRate=REST;

  // autoplay: algunos navegadores lo bloquean hasta un gesto; reintenta sin romper.
  function play(){ var p=v.play&&v.play(); if(p&&p.catch) p.catch(function(){}); }
  v.addEventListener('loadeddata',play);
  play();

  wrap.addEventListener('mouseenter',function(){ target=HOT; });
  wrap.addEventListener('mouseleave',function(){ target=REST; });

  // suaviza el cambio de velocidad para que la reacción no sea un salto seco
  function tick(){ cur+=(target-cur)*0.08; if(!v.paused) v.playbackRate=cur; requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
})();
