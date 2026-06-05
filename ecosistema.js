/* ===========================================================
   Visual & Growth — /ecosistema
   Scroll-choreographed solutions fused into a living sky.
   =========================================================== */
(function(){
  "use strict";
  const lerp=(a,b,t)=>a+(b-a)*t;
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=t=>t*t*(3-2*t);
  const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;

  const driver = document.getElementById("driver");
  const clouds = document.getElementById("clouds");
  const sun    = document.getElementById("sun");
  const warm   = document.getElementById("warm");
  const tint   = document.getElementById("sky-tint");
  const cue    = document.querySelector(".cue");
  const rail   = document.querySelector(".rail");
  const railSteps=[...document.querySelectorAll(".rail .step")];
  const railFill = document.querySelector(".rail .fill");
  const hudArea= document.getElementById("hud-area");
  const hudName= document.getElementById("hud-name");

  const B=id=>document.getElementById(id);
  // beats: el, in0,in1,out0,out1, ty
  const beats=[
    {el:B("b-intro"), in0:-0.05,in1:0.00, out0:0.075,out1:0.11, ty:50},
    {el:B("s1"), in0:0.115,in1:0.155, out0:0.215,out1:0.255, ty:55},
    {el:B("s2"), in0:0.255,in1:0.295, out0:0.350,out1:0.390, ty:55},
    {el:B("s3"), in0:0.390,in1:0.430, out0:0.485,out1:0.525, ty:55},
    {el:B("s4"), in0:0.525,in1:0.565, out0:0.620,out1:0.660, ty:55},
    {el:B("s5"), in0:0.660,in1:0.700, out0:0.755,out1:0.795, ty:55},
    {el:B("s6"), in0:0.795,in1:0.835, out0:0.885,out1:0.920, ty:55},
    {el:B("b-cta"), in0:0.930,in1:0.970, out0:1.10, out1:1.20, ty:55},
  ];
  // solution ranges (for rail + hud), names
  const sols=[
    [0.115,0.255,"Estrategia de Ventas"],
    [0.255,0.390,"Automatización"],
    [0.390,0.525,"SEO y Presencia"],
    [0.525,0.660,"Web y Marca"],
    [0.660,0.795,"Estructura Legal"],
    [0.795,0.930,"Contenido"],
  ];

  function bOpacity(p,b){
    if(p<b.in0||p>b.out1) return 0;
    if(p<b.in1) return smooth(clamp((p-b.in0)/(b.in1-b.in0)));
    if(p<=b.out0) return 1;
    return 1-smooth(clamp((p-b.out0)/(b.out1-b.out0)));
  }
  function bPhase(p,b){
    const mid=(b.in1+b.out0)/2;
    if(p<mid) return -(1-clamp((p-b.in0)/(mid-b.in0)));
    return clamp((p-mid)/(b.out1-mid));
  }

  function getP(){ const m=driver.scrollHeight-innerHeight; return m>0?clamp(scrollY/m):0; }

  function paint(p){
    for(const b of beats){
      const o=bOpacity(p,b);
      b.el.style.opacity=o.toFixed(3);
      if(o>0.001){
        const ph=bPhase(p,b), y=ph*b.ty;
        const base=b.el.dataset.base||"";
        b.el.style.transform=`${base} translate3d(0,${y.toFixed(1)}px,0)`;
        b.el.style.filter = o<0.55 ? `blur(${((0.55-o)*7).toFixed(1)}px)` : "none";
      }
      b.el.classList.toggle("live", o>0.6);
    }
    // ---- living background ----
    // sun travels an arc across the sky as you scroll (day journey)
    const sunX = 12 + p*76;
    const sunY = 82 - Math.sin(clamp(p)*Math.PI)*60;
    const noon = Math.sin(clamp(p)*Math.PI);           // 0..1..0
    if(sun){ sun.style.left=sunX+"%"; sun.style.top=sunY+"%"; sun.style.opacity=(0.30+noon*0.6).toFixed(3); }
    if(warm){ warm.style.background=`radial-gradient(60% 55% at ${sunX}% ${sunY}%, rgba(255,196,90,${(0.16+noon*0.20).toFixed(3)}), transparent 70%)`; }
    if(tint){ tint.style.opacity=(1-noon*0.34).toFixed(3); }   // lighter at midday
    if(clouds){ clouds.style.transform=`translateY(${(-p*6).toFixed(2)}vh) scale(${(1.02+noon*0.04).toFixed(3)})`; }

    // ---- chrome ----
    if(cue) cue.style.opacity = p<0.05 ? "1":"0";
    rail.classList.toggle("show", p>0.10 && p<0.93);
    let active=0;
    sols.forEach((s,i)=>{ const on=p>=s[0]&&p<s[1]; railSteps[i].classList.toggle("on",on); railSteps[i].classList.toggle("done",p>=s[1]); if(on)active=i; });
    if(railFill) railFill.style.height=(clamp((p-0.115)/(0.930-0.115))*100).toFixed(1)+"%";
    const inSol = p>=0.115 && p<0.930;
    if(hudArea) hudArea.textContent = inSol ? "0"+(active+1)+" / 06" : (p<0.115?"— / 06":"06 / 06");
    if(hudName) hudName.textContent = inSol ? sols[active][2] : (p<0.115?"Ecosistema":"Diagnóstico");
  }

  let progress=0,target=0,lenis=null,rafAlive=false;
  function onScroll(){ target=getP(); paint(rafAlive?progress:target); }
  function frame(){
    requestAnimationFrame(frame); rafAlive=true;
    target=getP(); progress=lerp(progress,target,0.10);
    paint(progress);
  }

  function boot(){
    if(typeof Lenis!=="undefined" && !reduce){
      lenis=new Lenis({lerp:0.085, wheelMultiplier:0.9, smoothWheel:true});
      function raf(t){ lenis.raf(t); requestAnimationFrame(raf); } requestAnimationFrame(raf);
    }
    requestAnimationFrame(frame);
    addEventListener("scroll",onScroll,{passive:true});
    paint(getP());
    document.body.classList.add("ready");

    // ---- snap to each solution/page when scrolling stops ----
    if(!reduce){
      const pts=beats.map(b=>(b.in1+b.out0)/2);
      let timer=null, snapping=false;
      function snap(){
        if(snapping) return;
        const p=getP(); let best=pts[0],bd=1e9;
        for(const sp of pts){ const d=Math.abs(sp-p); if(d<bd){ bd=d; best=sp; } }
        if(bd<0.005) return;
        const max=driver.scrollHeight-innerHeight, target=Math.max(0,Math.min(max,best*max));
        snapping=true;
        if(lenis) lenis.scrollTo(target,{duration:1.0,onComplete:()=>{ snapping=false; }});
        else { window.scrollTo({top:target,behavior:"smooth"}); setTimeout(()=>{ snapping=false; },1000); }
      }
      addEventListener("scroll",()=>{ if(snapping) return; clearTimeout(timer); timer=setTimeout(snap,200); },{passive:true});
    }
  }

  // smooth CTA / nav anchors handled by browser; expose dev hook
  window.__paintEco = p => paint(p);

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();