/* ORBE — imagen fija de la esfera con cara. El movimiento es CALMADO y vive en el CSS
   (flotación + respiración + halo que late). Aquí solo: el halo verde deriva un pelín hacia
   el cursor cuando pasas por encima → reacción sutil, sin giro de canica. */
(function(){
  var wrap=document.querySelector('.orb-wrap');
  var glow=wrap&&wrap.querySelector('.orb-glow');
  if(!wrap||!glow)return;

  var MAX=14;                         // desplazamiento máximo del halo (px). Bajo a propósito.
  function move(e){
    var r=wrap.getBoundingClientRect();
    var dx=(e.clientX-(r.left+r.width/2))/(r.width/2);   // -1..1
    var dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
    glow.style.setProperty('--gx',(Math.max(-1,Math.min(1,dx))*MAX).toFixed(1)+'px');
    glow.style.setProperty('--gy',(Math.max(-1,Math.min(1,dy))*MAX).toFixed(1)+'px');
  }
  function reset(){ glow.style.setProperty('--gx','0px'); glow.style.setProperty('--gy','0px'); }
  wrap.addEventListener('mousemove',move);
  wrap.addEventListener('mouseleave',reset);
})();
