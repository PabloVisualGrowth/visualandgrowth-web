/* ===========================================================
   Visual & Growth — live annotations that track the rocket
   Each phase draws a connector + a marker locked onto the
   rocket's on-screen position at that point of the video.
   =========================================================== */
(function(){
  "use strict";
  const NS="http://www.w3.org/2000/svg";
  const anno=document.getElementById("anno");
  if(!anno) return;
  const GOLD="#ffc40a";
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=t=>t*t*(3-2*t);

  // rocket "focus" point (engine/plume) in VIDEO-FRAME % by video time.
  // Converted to screen px with the same object-fit:cover math as the bg,
  // so the marker lands on the rocket on any viewport aspect ratio.
  const track=[
    [0.0, 76, 74],
    [2.6, 62, 72],
    [3.4, 54, 73],
    [4.2, 50, 44],
    [5.0, 49, 38],
    [6.5, 48, 30],
    [8.0, 47, 24],
    [10.0,46, 20]
  ];
  const vid=document.getElementById("video");
  function cover(fx,fy){
    const W=innerWidth,H=innerHeight;
    const vw=(vid&&vid.videoWidth)||2560, vh=(vid&&vid.videoHeight)||1440;
    const s=Math.max(W/vw,H/vh)*1.06, dw=vw*s, dh=vh*s, dx=(W-dw)/2, dy=(H-dh)/2;
    return [dx+(fx/100)*dw, dy+(fy/100)*dh];
  }
  function rocketAt(vt){
    for(let i=0;i<track.length-1;i++){
      const [t0,x0,y0]=track[i], [t1,x1,y1]=track[i+1];
      if(vt<=t1){ const k=clamp((vt-t0)/(t1-t0)); return {x:x0+(x1-x0)*k, y:y0+(y1-y0)*k}; }
    }
    const l=track[track.length-1]; return {x:l[1], y:l[2]};
  }

  // phase config: scroll range, text-anchor (% of viewport), label, kind
  const phases=[
    { a:0.135, b:0.300, tx:26, ty:60, label:"Escaneando · Audit",  kind:"scan",  off:-7, offx:0   },
    { a:0.405, b:0.560, tx:72, ty:42, label:"Trayectoria · ICE",   kind:"path",  off:0,  offx:3 },
    { a:0.565, b:0.720, tx:26, ty:62, label:"Sprint · 4 sem",      kind:"pulse", off:0,  offx:0 },
    { a:0.730, b:0.885, tx:72, ty:60, label:"Órbita alcanzada",    kind:"orbit", off:0,  offx:3 }
  ];
  function fade(p,a,b){
    if(p<a||p>b) return 0;
    const r=(b-a)*0.22;
    if(p<a+r) return smooth((p-a)/r);
    if(p>b-r) return smooth((b-p)/r);
    return 1;
  }

  // ---- build reusable svg nodes ----
  const mk=(t,attrs)=>{const e=document.createElementNS(NS,t);for(const k in attrs)e.setAttribute(k,attrs[k]);anno.appendChild(e);return e;};
  const line  = mk("path",  {fill:"none",stroke:GOLD,"stroke-width":1.4,"stroke-dasharray":"1 6","stroke-linecap":"round"});
  const extra = [0,1,2].map(()=>mk("circle",{fill:"none",stroke:GOLD,"stroke-width":1.3}));
  const ring  = mk("circle",{fill:"none",stroke:GOLD,"stroke-width":1.5});
  const cH    = mk("line",  {stroke:GOLD,"stroke-width":1.2});
  const cV    = mk("line",  {stroke:GOLD,"stroke-width":1.2});
  const tdot  = mk("circle",{r:2.6,fill:GOLD,stroke:"none"});
  const label = mk("text",  {fill:GOLD,"font-family":"'JetBrains Mono', monospace","font-size":11,"letter-spacing":2});
  const hideExtra=()=>extra.forEach(e=>e.setAttribute("opacity",0));

  function pt(t,P0,Pc,P1){ const u=1-t; return [u*u*P0[0]+2*u*t*Pc[0]+t*t*P1[0], u*u*P0[1]+2*u*t*Pc[1]+t*t*P1[1]]; }

  window.updateConnectors=function(p,vt){
    let act=null, op=0;
    for(const ph of phases){ const o=fade(p,ph.a,ph.b); if(o>op){ op=o; act=ph; } }
    anno.style.opacity=op.toFixed(3);
    if(!act || op<0.01) return;

    const W=innerWidth, H=innerHeight;
    anno.setAttribute("viewBox",`0 0 ${W} ${H}`);

    const r=rocketAt(vt);
    const [rx,ry]=cover(r.x + (act.offx||0), r.y+act.off);
    const tx=act.tx/100*W, ty=act.ty/100*H;
    const ang=Math.atan2(ry-ty,rx-tx);
    const gap = act.kind==="orbit"?40 : act.kind==="scan"?30 : 24;
    const ex=rx-Math.cos(ang)*gap, ey=ry-Math.sin(ang)*gap;
    const Pc=[(tx+ex)/2,(ty+ey)/2-26];
    line.setAttribute("d",`M ${tx} ${ty} Q ${Pc[0]} ${Pc[1]} ${ex} ${ey}`);
    tdot.setAttribute("cx",tx); tdot.setAttribute("cy",ty);

    // target reticle
    let R = 13;
    if(act.kind==="scan"){ R = 16 + (1-clamp((vt-1.6)/1.7))*22; }   // tightens as camera nears
    ring.setAttribute("cx",rx); ring.setAttribute("cy",ry); ring.setAttribute("r",R);
    ring.setAttribute("stroke-dasharray", act.kind==="scan" ? "3 4" : "none");
    cH.setAttribute("x1",rx-R-6); cH.setAttribute("x2",rx+R+6); cH.setAttribute("y1",ry); cH.setAttribute("y2",ry);
    cV.setAttribute("x1",rx); cV.setAttribute("x2",rx); cV.setAttribute("y1",ry-R-6); cV.setAttribute("y2",ry+R+6);

    label.textContent=act.label.toUpperCase();
    const lx = tx<rx ? rx+R+12 : rx-R-12;
    label.setAttribute("x",lx); label.setAttribute("y",ry-R-8);
    label.setAttribute("text-anchor", tx<rx ? "start":"end");

    hideExtra();
    if(act.kind==="path"){                 // roadmap waypoints along the connector
      [0.30,0.55,0.80].forEach((t,i)=>{ const [px,py]=pt(t,[tx,ty],Pc,[ex,ey]);
        extra[i].setAttribute("cx",px); extra[i].setAttribute("cy",py); extra[i].setAttribute("r",3.4);
        extra[i].setAttribute("fill",GOLD); extra[i].setAttribute("stroke","none"); extra[i].setAttribute("opacity",1); });
    } else if(act.kind==="orbit"){         // concentric orbit rings
      [1.8,2.7,3.7].forEach((m,i)=>{ extra[i].setAttribute("cx",rx); extra[i].setAttribute("cy",ry);
        extra[i].setAttribute("r",R*m); extra[i].setAttribute("fill","none"); extra[i].setAttribute("stroke",GOLD);
        extra[i].setAttribute("opacity",(0.5-i*0.13).toFixed(2)); });
    } else if(act.kind==="pulse"){         // velocity ticks beside the rocket
      [-1,1,2].forEach((d,i)=>{ extra[i].setAttribute("cx",rx+ (d*9)); extra[i].setAttribute("cy",ry+R+10+i*6);
        extra[i].setAttribute("r",1.6); extra[i].setAttribute("fill",GOLD); extra[i].setAttribute("stroke","none");
        extra[i].setAttribute("opacity",(0.9-i*0.25).toFixed(2)); });
    }
  };
})();