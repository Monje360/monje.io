/* ORBE */
(function(){
  var cv=document.getElementById('mjGL');var gl=cv.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true});if(!gl)return;
  var DPR=Math.min(window.devicePixelRatio||1,2);
  function size(){var r=cv.getBoundingClientRect();var s=Math.max(160,r.width);cv.width=Math.round(s*DPR);cv.height=Math.round(s*DPR);gl.viewport(0,0,cv.width,cv.height);}
  new ResizeObserver(size).observe(cv);size();
  var vs='attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.0,1.0);}';
  var fs=`precision highp float;uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uHover;
  float hash(vec2 p){p=fract(p*vec2(123.34,345.45));p+=dot(p,p+34.345);return fract(p.x*p.y);}
  float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);float a=hash(i);float b=hash(i+vec2(1.0,0.0));float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));vec2 u=f*f*(3.0-2.0*f);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
  float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.02;a*=0.5;}return v;}
  void main(){vec2 uv=(gl_FragCoord.xy-0.5*uRes)/min(uRes.x,uRes.y);float t=uTime;float radius=0.40;float d=length(uv);
    float z=sqrt(max(0.0,1.0-min((d/radius)*(d/radius),1.0)));vec2 p=uv/radius;float r2=dot(p,p);float rn=d/radius;
    vec2 cur=(uMouse-vec2(0.5))/radius;float cl=length(cur);if(cl>1.3){cur*=1.3/cl;}
    float well=smoothstep(1.4,0.0,length(p-cur));vec2 flowP=p+0.4*(cur-p)*well;vec2 P=flowP*1.6;
    vec2 q=vec2(fbm(P+t*0.07),fbm(P+vec2(4.0,2.0)-t*0.06));
    vec2 r=vec2(fbm(P+2.6*q+vec2(1.7,9.2)+t*0.05),fbm(P+2.6*q+vec2(8.3,2.8)-t*0.04));
    float fg=fbm(P+2.9*r+0.5*well);float fd=fbm(P*1.1+2.9*r.yx+vec2(3.3,1.1));
    float centerMask=smoothstep(1.08,0.05,r2);vec3 white=vec3(0.99,0.995,0.985);vec3 green=vec3(0.78,1.0,0.18);
    vec3 fluidBase=mix(white,green,0.20);vec3 inner=mix(white,fluidBase,centerMask);
    inner=mix(inner,green,smoothstep(0.34,0.62,fg)*centerMask);
    inner=mix(inner,vec3(0.40,0.62,0.06),smoothstep(0.66,0.90,fg)*centerMask*0.7);
    inner=mix(inner,vec3(0.09,0.09,0.09),smoothstep(0.54,0.84,fd)*centerMask*0.72);
    inner+=green*smoothstep(0.55,0.86,fg)*centerMask*0.14;
    inner=mix(inner,white,smoothstep(0.88,1.0,rn)*0.5);
    float fres=pow(1.0-z,3.0);inner=mix(inner,vec3(1.0),fres*0.10);
    float ring=smoothstep(0.93,1.0,rn)*smoothstep(1.05,1.0,rn);inner=mix(inner,vec3(0.82,0.84,0.82),ring*0.4);
    float sheen=pow(max(0.0,1.0-length(p-vec2(-0.33,0.42))),2.0)*0.12;inner+=sheen;
    float sphere=smoothstep(radius+0.004,radius-0.004,d);
    gl_FragColor=vec4(inner,sphere);}`;
  function sh(ty,s){var o=gl.createShader(ty);gl.shaderSource(o,s);gl.compileShader(o);return o;}
  var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
  var bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var lo=gl.getAttribLocation(pr,'aPos');gl.enableVertexAttribArray(lo);gl.vertexAttribPointer(lo,2,gl.FLOAT,false,0,0);
  var uRes=gl.getUniformLocation(pr,'uRes'),uTime=gl.getUniformLocation(pr,'uTime'),uMouse=gl.getUniformLocation(pr,'uMouse'),uHover=gl.getUniformLocation(pr,'uHover');
  var mx=0.5,my=0.5,hov=0,th=0,tt=0,last=performance.now();
  window.addEventListener('mousemove',function(e){mx=e.clientX/window.innerWidth;my=1.0-e.clientY/window.innerHeight;});
  cv.addEventListener('mouseenter',function(){th=1;});cv.addEventListener('mouseleave',function(){th=0;});
  function frame(now){var dt=Math.min((now-last)/1000,0.05);last=now;hov+=(th-hov)*0.05;tt+=dt*(0.62+hov*0.7);
    gl.uniform2f(uRes,cv.width,cv.height);gl.uniform1f(uTime,tt);gl.uniform2f(uMouse,mx,my);gl.uniform1f(uHover,hov);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
})();
