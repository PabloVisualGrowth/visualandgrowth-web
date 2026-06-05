/* ===========================================================
   Visual & Growth — experience engine
   =========================================================== */
(function(){
  "use strict";

  const lerp = (a,b,t)=>a+(b-a)*t;
  const clamp = (v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth = t=>t*t*(3-2*t);
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  // ---- elements ----
  const video   = document.getElementById("video");
  const bgCanvas= document.getElementById("bg-canvas");
  const bgCtx   = bgCanvas.getContext("2d");
  const spaceCanvas = document.getElementById("space-canvas");
  const driver  = document.getElementById("scroll-driver");
  const loader  = document.getElementById("loader");
  const loadBar = document.querySelector("#loader .track i");
  const loadPct = document.querySelector("#loader .pct");
  const chrome  = document.querySelector(".chrome");
  const rail    = document.querySelector(".rail");
  const cue     = document.querySelector(".scroll-cue");
  const horizon = document.getElementById("horizon");
  const arrow   = document.getElementById("ign-arrow");

  // HUD readouts
  const hudSeq  = document.getElementById("hud-seq");
  const hudAlt  = document.getElementById("hud-alt");
  const hudState= document.getElementById("hud-state");
  const railSteps = [...document.querySelectorAll(".rail .step")];
  const railFill  = document.querySelector(".rail .fill");

  // ============================================================
  //  Choreographed beats
  // ============================================================
  // each: {el, in0,in1, out0,out1}  opacity rises in0->in1, holds, falls out0->out1
  const B = id => document.getElementById(id);
  const beats = [
    { el:B("b-hero"),   in0:-0.05,in1:0.000, out0:0.070, out1:0.110, ty:34 },
    { el:B("b-01"),     in0:0.135,in1:0.185, out0:0.250, out1:0.300, ty:60 },
    { el:B("b-ign"),    in0:0.300,in1:0.330, out0:0.360, out1:0.395, ty:30 },
    { el:B("b-02"),     in0:0.405,in1:0.460, out0:0.520, out1:0.560, ty:60 },
    { el:B("b-03"),     in0:0.565,in1:0.620, out0:0.685, out1:0.720, ty:60 },
    { el:B("b-04"),     in0:0.730,in1:0.785, out0:0.850, out1:0.885, ty:60 },
    { el:B("b-final"),  in0:0.905,in1:0.955, out0:1.10,  out1:1.20,  ty:60 },
  ];

  function beatOpacity(p,b){
    if(p < b.in0 || p > b.out1) return 0;
    if(p < b.in1) return smooth(clamp((p-b.in0)/(b.in1-b.in0)));
    if(p <= b.out0) return 1;
    return 1 - smooth(clamp((p-b.out0)/(b.out1-b.out0)));
  }
  // progress through the beat (-1 .. 0 .. 1) for translate direction
  function beatPhase(p,b){
    const mid = (b.in1+b.out0)/2;
    if(p<mid) return -(1 - clamp((p-b.in0)/(mid-b.in0)));   // entering: -1 -> 0
    return clamp((p-mid)/(b.out1-mid));                     // leaving: 0 -> 1
  }

  // video timeline keyframes  [scrollProgress, videoTime]
  const vkeys = [[0,0.0],[0.13,1.6],[0.28,2.9],[0.32,3.5],[0.37,4.2],[0.46,5.0],[0.70,7.3],[1.0,9.9]];
  function videoTimeFor(p){
    for(let i=0;i<vkeys.length-1;i++){
      const [p0,t0]=vkeys[i], [p1,t1]=vkeys[i+1];
      if(p<=p1){ const k=clamp((p-p0)/(p1-p0)); return lerp(t0,t1,k); }
    }
    return vkeys[vkeys.length-1][1];
  }

  const stateFor = p => p<0.13?"EN TIERRA" : p<0.30?"PRE-IGNICIÓN" : p<0.40?"IGNICIÓN" : p<0.72?"ASCENSO" : p<0.90?"ÓRBITA" : "SISTEMA";

  // rail active step by progress
  const railRanges = [[0.13,0.30],[0.40,0.56],[0.56,0.72],[0.72,0.90]];

  // ============================================================
  //  THREE.js — starfield + flight particles
  // ============================================================
  let renderer,scene,camera,stars,flight,flightPos,flightCount,sprite;
  let glOK=false;
  const mouse={x:0,y:0,tx:0,ty:0};

  function makeSprite(){
    const c=document.createElement("canvas");c.width=c.height=64;
    const x=c.getContext("2d");
    const g=x.createRadialGradient(32,32,0,32,32,32);
    g.addColorStop(0,"rgba(255,255,255,1)");
    g.addColorStop(0.25,"rgba(255,255,255,.85)");
    g.addColorStop(0.55,"rgba(180,200,255,.25)");
    g.addColorStop(1,"rgba(255,255,255,0)");
    x.fillStyle=g;x.fillRect(0,0,64,64);
    const t=new THREE.Texture(c);t.needsUpdate=true;return t;
  }

  function initGL(){
    if(typeof THREE==="undefined") return false;
    const canvas=document.getElementById("space-canvas");
    try{
      renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
    }catch(e){ return false; }
    renderer.setClearColor(0x000000,0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,0.1,3000);
    camera.position.set(0,0,0);
    sprite=makeSprite();

    // --- distant starfield (rotating dome) ---
    const N=2600, g=new THREE.BufferGeometry(), pos=new Float32Array(N*3), col=new Float32Array(N*3);
    const cWhite=new THREE.Color(0xf6f8ff), cBlue=new THREE.Color(0x9fb8ff), cGold=new THREE.Color(0xffc40a);
    for(let i=0;i<N;i++){
      const r=600+Math.random()*1400;
      const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1);
      pos[i*3]=r*Math.sin(ph)*Math.cos(th);
      pos[i*3+1]=r*Math.sin(ph)*Math.sin(th);
      pos[i*3+2]=r*Math.cos(ph);
      const pick=Math.random();
      const c = pick>0.92?cGold : pick>0.6?cBlue : cWhite;
      col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
    }
    g.setAttribute("position",new THREE.BufferAttribute(pos,3));
    g.setAttribute("color",new THREE.BufferAttribute(col,3));
    stars=new THREE.Points(g,new THREE.PointsMaterial({
      size:5.5,map:sprite,vertexColors:true,transparent:true,
      depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,opacity:.9
    }));
    scene.add(stars);

    // --- flight particles streaming past camera ---
    flightCount=550;
    flightPos=new Float32Array(flightCount*3);
    const fcol=new Float32Array(flightCount*3);
    for(let i=0;i<flightCount;i++) resetFlight(i,true,fcol);
    const fg=new THREE.BufferGeometry();
    fg.setAttribute("position",new THREE.BufferAttribute(flightPos,3));
    fg.setAttribute("color",new THREE.BufferAttribute(fcol,3));
    flight=new THREE.Points(fg,new THREE.PointsMaterial({
      size:7,map:sprite,vertexColors:true,transparent:true,
      depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,opacity:.0
    }));
    scene.add(flight);

    addEventListener("pointermove",e=>{
      mouse.tx=(e.clientX/innerWidth-0.5);
      mouse.ty=(e.clientY/innerHeight-0.5);
    });
    glOK=true;
    return true;
  }

  function resetFlight(i,spread,fcol){
    const a=Math.random()*Math.PI*2, rad=40+Math.random()*340;
    flightPos[i*3]   = Math.cos(a)*rad;
    flightPos[i*3+1] = Math.sin(a)*rad;
    flightPos[i*3+2] = spread ? -(Math.random()*900) : -900 - Math.random()*120;
    if(fcol){
      const warm=Math.random()>0.85;
      if(warm){ fcol[i*3]=1; fcol[i*3+1]=.76; fcol[i*3+2]=.18; }
      else { const b=.7+Math.random()*.3; fcol[i*3]=b; fcol[i*3+1]=b; fcol[i*3+2]=1; }
    }
  }

  function resizeGL(){
    if(!glOK) return;
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight,false);
  }

  // ============================================================
  //  Scroll + render loop
  // ============================================================
  let progress=0, target=0, vTarget=0, vel=0, lenis=null;

  function getRawProgress(){
    const max=driver.scrollHeight-innerHeight;
    return max>0 ? clamp(window.scrollY/max) : 0;
  }

  // ---- draw current video frame into bg-canvas (object-fit: cover) ----
  const BG_SCALE = 1.06;            // subtle push
  function sizeBg(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    bgCanvas.width = Math.round(innerWidth*dpr);
    bgCanvas.height= Math.round(innerHeight*dpr);
  }
  function drawVideo(){
    const vw=video.videoWidth, vh=video.videoHeight;
    if(!vw||!vh) return;
    const cw=bgCanvas.width, ch=bgCanvas.height;
    const scale=Math.max(cw/vw, ch/vh)*BG_SCALE;
    const dw=vw*scale, dh=vh*scale;
    const dx=(cw-dw)/2, dy=(ch-dh)/2;
    try{ bgCtx.drawImage(video,dx,dy,dw,dh); }catch(e){}
  }

  // ---- DOM painting (driven by scroll AND raf; idempotent) ----
  function paintDOM(p){
    // beats
    for(const b of beats){
      const o=beatOpacity(p,b);
      b.el.style.opacity=o.toFixed(3);
      if(o>0.001){
        const ph=beatPhase(p,b);                    // -1..1
        const y = ph*b.ty;                          // px translate
        const base=b.el.dataset.base||"";
        b.el.style.transform=`${base} translate3d(0,${y.toFixed(1)}px,0)`;
        b.el.style.filter = o<0.6 ? `blur(${((0.6-o)*8).toFixed(1)}px)` : "none";
      }
    }
    // horizon occluder fades out as we leave the hero
    if(horizon) horizon.style.opacity = (1 - smooth(clamp(p/0.12))).toFixed(3);
    // ignition arrow: tracks the ignition beat, draws on
    if(arrow){
      const io = beatOpacity(p, beats[2]);
      arrow.style.opacity = io.toFixed(3);
      arrow.classList.toggle("on", io>0.45);
    }
    // chrome / rail / cue
    chrome.classList.toggle("show", p>0.10);
    rail.classList.toggle("show", p>0.12 && p<0.90);
    if(cue) cue.style.opacity = p<0.06 ? "1" : "0";
    railSteps.forEach((s,i)=>{
      const [a,bb]=railRanges[i];
      s.classList.toggle("on", p>=a && p<bb);
      s.classList.toggle("done", p>=bb);
    });
    if(railFill) railFill.style.height = (clamp((p-0.13)/(0.90-0.13))*100).toFixed(1)+"%";
    // HUD telemetry
    const vt=videoTimeFor(p);
    if(hudSeq) hudSeq.textContent = "T+"+vt.toFixed(1).padStart(4,"0")+"s";
    if(hudAlt){ const ap=clamp((p-0.30)/(1-0.30)); hudAlt.textContent = Math.round(ap*ap*1672)+" M"; }
    if(hudState) hudState.textContent = stateFor(p);
    // particles (starfield + flight) only appear from Fase 03 onward
    if(spaceCanvas) spaceCanvas.style.opacity = smooth(clamp((p-0.52)/0.10)).toFixed(3);
    // live annotations locked onto the rocket
    if(window.updateConnectors) window.updateConnectors(p, vt);
  }

  // immediate response to scroll even if raf is throttled
  function onScroll(){
    target=getRawProgress();
    paintDOM(rafAlive?progress:target);
    if(!rafAlive && video.readyState>=2 && !video.seeking){
      try{ video.currentTime=Math.min(videoTimeFor(target),(video.duration||10)-0.05); }catch(e){}
    }
  }

  let rafAlive=false;
  // repaint bg whenever a seek completes (covers throttled-raf case)
  video.addEventListener("seeked", drawVideo);
  video.addEventListener("loadeddata", ()=>{ sizeBg(); drawVideo(); });
  function frame(time){
    requestAnimationFrame(frame);
    rafAlive=true;
    target=getRawProgress();
    const prev=progress;
    progress=lerp(progress,target,0.10);
    vel=lerp(vel, Math.abs(progress-prev)*60, 0.2);

    // ---- video scrub ----
    if(video.readyState>=2){
      vTarget=videoTimeFor(progress);
      const cur=video.currentTime;
      const nt=lerp(cur,vTarget,0.18);
      if(Math.abs(nt-cur)>0.012 && !video.seeking){
        try{ video.currentTime=Math.min(nt, (video.duration||10)-0.05); }catch(e){}
      }
      drawVideo();
    }

    paintDOM(progress);

    // ---- three.js ----
    if(glOK){
      mouse.x=lerp(mouse.x,mouse.tx,0.05);
      mouse.y=lerp(mouse.y,mouse.ty,0.05);
      // stars rotate only with scroll position (settle when idle)
      stars.rotation.y = progress*0.5;
      stars.rotation.x = mouse.y*0.15;
      stars.rotation.z = mouse.x*0.05;

      camera.rotation.y = -mouse.x*0.12;
      camera.rotation.x =  mouse.y*0.10;

      // flight intensity grows with depth + scroll velocity
      const intensity = clamp(progress*1.3-0.05) ;
      flight.material.opacity = lerp(flight.material.opacity, clamp(intensity*0.9), 0.05);
      // particles stream only while scrolling — no idle drift
      const speed = vel*200 * (0.4+intensity);
      const pos=flight.geometry.attributes.position.array;
      for(let i=0;i<flightCount;i++){
        pos[i*3+2]+=speed;
        if(pos[i*3+2]>30){ resetFlight(i,false); }
      }
      flight.geometry.attributes.position.needsUpdate=true;

      camera.position.x=lerp(camera.position.x,mouse.x*12,0.05);
      camera.position.y=lerp(camera.position.y,-mouse.y*12,0.05);

      renderer.render(scene,camera);
    }
  }

  // ============================================================
  //  Loading
  // ============================================================
  function setLoad(pct){
    loadBar.style.width=pct+"%";
    loadPct.textContent=String(Math.round(pct)).padStart(3,"0")+" / 100";
  }
  function reveal(){
    setLoad(100);
    loader.classList.add("hide");
    loader.style.opacity="0";
    setTimeout(()=>{ loader.style.display="none"; }, 950);
    document.body.classList.add("ready");
    paintDOM(getRawProgress());
    // play+pause to prime video frames, then keep paused for scrubbing
    video.play().then(()=>{ video.pause(); video.currentTime=0.05; setTimeout(drawVideo,80); }).catch(()=>{ try{video.pause();video.currentTime=0.05;setTimeout(drawVideo,80);}catch(e){} });
  }

  function boot(){
    initGL();
    sizeBg();
    resizeGL();
    if(glOK){ renderer.render(scene,camera); }   // first frame even if raf is throttled
    addEventListener("resize",()=>{ sizeBg(); resizeGL(); drawVideo(); });

    // smooth scroll
    if(typeof Lenis!=="undefined" && !reduce){
      lenis=new Lenis({lerp:0.085, wheelMultiplier:0.9, smoothWheel:true});
      function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(frame);
    addEventListener("scroll", onScroll, {passive:true});
    paintDOM(getRawProgress());   // correct first paint even before raf

    // ---- snap to each beat/page when scrolling stops ----
    if(!reduce){
      const pts=beats.map(b=>(b.in1+b.out0)/2);
      let timer=null, snapping=false;
      function snap(){
        if(snapping) return;
        const p=getRawProgress(); let best=pts[0],bd=1e9;
        for(const sp of pts){ const d=Math.abs(sp-p); if(d<bd){ bd=d; best=sp; } }
        if(bd<0.005) return;
        const max=driver.scrollHeight-innerHeight, target=Math.max(0,Math.min(max,best*max));
        snapping=true;
        if(lenis) lenis.scrollTo(target,{duration:1.0,onComplete:()=>{ snapping=false; }});
        else { window.scrollTo({top:target,behavior:"smooth"}); setTimeout(()=>{ snapping=false; },1000); }
      }
      addEventListener("scroll",()=>{ if(snapping) return; clearTimeout(timer); timer=setTimeout(snap,200); },{passive:true});
    }

    // fake-but-real loader tied to video buffering
    let fake=0;
    const tick=setInterval(()=>{
      const buffered = video.readyState>=3 ? 100 : video.readyState>=1 ? 70 : 0;
      fake=Math.min(fake+ (buffered>fake?6:2), buffered>=70?92:60);
      setLoad(fake);
    },120);

    const done=()=>{ clearInterval(tick); reveal(); };
    if(video.readyState>=3){ done(); }
    else {
      video.addEventListener("canplaythrough",done,{once:true});
      video.addEventListener("loadeddata",()=>{ if(video.readyState>=2) setLoad(80); });
      setTimeout(()=>{ if(!loader.classList.contains("hide")) done(); },6000); // safety
    }
    video.load();
  }

  // smooth anchor for CTA
  document.addEventListener("click",e=>{
    const a=e.target.closest('a[href^="#"]');
    if(!a) return;
    e.preventDefault();
    const top = a.getAttribute("href")==="#top" ? 0 : driver.scrollHeight;
    if(lenis) lenis.scrollTo(top,{duration:2.2}); else window.scrollTo({top,behavior:"smooth"});
  });

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();

  // dev hook: preview any narrative progress without scrolling
  window.__paint = p => paintDOM(p);
  window.__renderGL = () => { if(glOK){ renderer.render(scene,camera); return true; } return false; };
})();