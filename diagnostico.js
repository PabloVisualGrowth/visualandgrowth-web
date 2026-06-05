/* ===========================================================
   Visual & Growth — Diagnóstico (full assessment, integrated)
   Recreated from the production Scorecard. Same flow, same
   webhook payload. Opens in place (no redirect), own URL.
   =========================================================== */
(function(){
  "use strict";
  const WEBHOOK="https://n8n-n8n.d4s5yj.easypanel.host/webhook/0476a722-17ff-48ec-9777-93f17a2ad46b";
  const CALENDAR="https://calendar.app.google/mMtccB3pCZfNpHTB6";
  const onFolder=/\/ecosistema\/diagnostico\/?$/i.test(location.pathname);
  const ECO=onFolder?"../../Ecosistema.html":"Ecosistema.html";
  const DIAG=onFolder?location.pathname:"ecosistema/diagnostico/";
  const BASE=onFolder?"../":"ecosistema/"; // for /ecosistema/<slug>/ links

  function dl(ev,p){ try{ (window.dataLayer=window.dataLayer||[]).push(Object.assign({event:ev},p||{})); }catch(e){} }

  const YN=[
    ["q1","¿Sabes exactamente cuánto te cuesta conseguir un cliente nuevo?","strategy"],
    ["q2","¿Tienes un proceso de ventas documentado que tu equipo sigue de forma consistente?","strategy"],
    ["q3","¿Tu CRM, facturación y comunicación están conectados sin copiar datos a mano?","automation"],
    ["q4","¿Has automatizado alguna tarea repetitiva que tu equipo hacía manualmente?","automation"],
    ["q5","¿Cuando alguien busca en Google lo que vendes, apareces tú antes que tu competencia?","seo"],
    ["q6","¿Tu web genera solicitudes de contacto de forma regular sin que hagas ninguna acción?","seo"],
    ["q7","¿Un desconocido entiende en 10 segundos qué haces y por qué debería elegirte?","ux"],
    ["q8","¿Tu imagen de marca transmite el mismo nivel de calidad que el servicio que ofreces?","ux"],
    ["q9","¿Has revisado con un especialista fiscal cuánto podrías ahorrarte legalmente este año?","legal"],
    ["q10","¿Tienes documentado quién es tu cliente ideal y qué le preocupa antes de comprar?","strategy"]
  ];
  const QUAL=[
    ["q11","¿Cuántas personas trabajan en tu empresa?","select",["Solo yo o menos de 5","Entre 5 y 20","Entre 20 y 100","Más de 100"]],
    ["q12","¿Cuál es tu mayor problema ahora mismo?","select",["No llegan suficientes clientes buenos","El equipo pierde demasiado tiempo en tareas manuales","No me diferencio bien de la competencia","Los tres a la vez"]],
    ["q13","¿Has trabajado antes con una agencia o consultoría externa?","select",["No, nunca","Sí, pero no quedé satisfecho/a","Sí, con buenos resultados"]],
    ["q14","¿Cuánto inviertes al mes en marketing, tecnología o crecimiento?","select",["Menos de 1.000€","Entre 1.000€ y 3.000€","Entre 3.000€ y 7.000€","Más de 7.000€"]],
    ["q15","¿Qué debería saber nuestro equipo antes de hablar contigo?","textarea","Cuéntanos tu situación, qué has probado ya y qué quieres conseguir…"]
  ];
  const SMAP={
    automation:{n:"AI & Operations",h:"hyper-automation",i:"Tu equipo pierde horas cada semana en tareas que un sistema haría en segundos. Te ayudamos a automatizarlas sin equipo técnico propio."},
    seo:{n:"Market Authority",h:"market-authority",i:"Tu competencia se lleva clientes que deberían ser tuyos porque aparecen antes en Google. Te ponemos donde tiene que estar tu empresa."},
    legal:{n:"Smart Structure",h:"smart-structure",i:"Probablemente pagas más impuestos de los necesarios. Una buena estructura fiscal y societaria puede cambiar eso este año."},
    strategy:{n:"Growth Machines",h:"estrategia-consultoria",i:"Sin un proceso claro de ventas y priorización, el crecimiento depende de la suerte. Construimos el sistema para que sea predecible."},
    ux:{n:"Product Boutique",h:"product-boutique",i:"Si un desconocido no entiende tu propuesta en 10 segundos, ya lo perdiste. Rediseñamos tu web y marca para que trabajen solas."}
  };
  const tier=s=>s>=70?"high":s>=40?"mid":"low";

  // ---- state ----
  let st={phase:"gate",gate:{nombre:"",email:"",telefono:""},cq:0,cqual:0,yn:{},qa:{}};

  // ---- overlay shell ----
  const el=document.createElement("div"); el.className="diag"; el.id="diag"; el.setAttribute("aria-hidden","true");
  el.innerHTML=`<div class="diag-scrim" data-close></div>
    <div class="diag-sheet" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Diagnóstico de crecimiento">
      <button class="diag-close" data-close aria-label="Cerrar">✕</button>
      <div id="as-root"></div>
    </div>`;
  document.body.appendChild(el);
  const root=el.querySelector("#as-root");

  const progress=(cur,tot,label)=>`<div class="as-prog"><div class="pr-top"><span>${label||("Pregunta "+cur+" de "+tot)}</span><span>${Math.round(cur/tot*100)}%</span></div><div class="pr-track"><div class="pr-fill" style="width:${cur/tot*100}%"></div></div></div>`;

  function speedo(score){
    const cx=160,cy=140,r=120,rad=d=>d*Math.PI/180,pt=p=>({x:cx+r*Math.cos(rad(180-p*1.8)),y:cy-r*Math.sin(rad(180-p*1.8))});
    const L=pt(0),R=pt(100),P=pt(score),bg=`M ${L.x} ${L.y} A ${r} ${r} 0 0 0 ${R.x} ${R.y}`;
    const sp=score>0&&score<100?`M ${L.x} ${L.y} A ${r} ${r} 0 ${score>50?1:0} 0 ${P.x.toFixed(2)} ${P.y.toFixed(2)}`:(score>=100?bg:"");
    const na=180-score*1.8,nX=(cx+100*Math.cos(rad(na))).toFixed(2),nY=(cy-100*Math.sin(rad(na))).toFixed(2);
    const col=score>=70?"#22c55e":score>=40?"#FFC600":"#ef4444";
    const lab=score>=70?"SISTEMA ESCALABLE":score>=40?"OPTIMIZACIÓN NECESARIA":"FUNDAMENTOS CRÍTICOS";
    return `<svg viewBox="0 0 320 160" style="width:300px;max-width:100%;display:block;margin:0 auto">
      <path d="${bg}" fill="none" stroke="#243049" stroke-width="14" stroke-linecap="round"/>
      ${sp?`<path d="${sp}" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round"/>`:""}
      <line x1="${cx}" y1="${cy}" x2="${nX}" y2="${nY}" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="7" fill="#fff"/>
      <text x="${cx}" y="${cy-20}" text-anchor="middle" fill="${col}" font-size="28" font-weight="bold" font-family="monospace">${score}%</text>
      <text x="${cx}" y="${cy-4}" text-anchor="middle" fill="#7a8699" font-size="8" font-family="monospace" letter-spacing="1">${lab}</text>
    </svg>`;
  }

  function render(){
    const p=st.phase;
    if(p==="gate"){
      const g=st.gate;
      root.innerHTML=`
        <div class="q">Bloque 1 · Acceso</div>
        <h2>Desbloquea tu <span class="serif">Assessment</span></h2>
        <p class="sub">Introduce tus datos para acceder a las 15 preguntas y recibir tu Score de Salud de Crecimiento.</p>
        <form class="diag-form" id="gateForm" novalidate>
          <div><span class="flabel">Nombre *</span><input name="nombre" value="${g.nombre}" placeholder="Tu nombre completo" autocomplete="name"></div>
          <div><span class="flabel">Email corporativo *</span><input name="email" type="email" value="${g.email}" placeholder="tu@empresa.com" autocomplete="email"></div>
          <div><span class="flabel">Teléfono (opcional)</span><input name="telefono" value="${g.telefono}" placeholder="+34 600 000 000" autocomplete="tel"></div>
          <button class="btn primary" type="submit" id="gateBtn" disabled>Iniciar Assessment →</button>
          <p class="micro">Sin spam · Solo tu roadmap de crecimiento personalizado</p>
        </form>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07);text-align:center">
          <p style="color:var(--faint);font-size:12px;margin-bottom:8px">¿Prefieres hablar directamente?</p>
          <a class="btn ghost" href="${CALENDAR}" target="_blank" rel="noopener" data-cal>Saltar y agendar reunión directamente →</a>
        </div>`;
      const f=root.querySelector("#gateForm"), btn=root.querySelector("#gateBtn");
      const sync=()=>{ st.gate.nombre=f.nombre.value; st.gate.email=f.email.value; st.gate.telefono=f.telefono.value;
        btn.disabled=!(f.nombre.value.trim()&&f.email.value.trim()); };
      f.addEventListener("input",sync); sync();
      f.addEventListener("submit",e=>{ e.preventDefault(); if(btn.disabled) return; dl("assessment_start",{email:st.gate.email}); st.phase="yesno"; render(); });
    }
    else if(p==="yesno"){
      const q=YN[st.cq];
      root.innerHTML=`${progress(st.cq+1,YN.length)}
        <p class="as-q">${q[1]}</p>
        <div class="as-yn">
          <button class="yes" data-yn="1"><span class="ic">✔</span>Sí</button>
          <button class="no" data-yn="0"><span class="ic">✕</span>No</button>
        </div>`;
      root.querySelectorAll("[data-yn]").forEach(b=>b.addEventListener("click",()=>{
        const a=b.dataset.yn==="1"; st.yn[q[0]]=a; dl("assessment_answer",{question:q[0],answer:a?"yes":"no",category:q[2]});
        if(st.cq<YN.length-1){ st.cq++; } else { st.phase="qualify"; } render();
      }));
    }
    else if(p==="qualify"){
      const q=QUAL[st.cqual], val=st.qa[q[0]]||"", last=st.cqual===QUAL.length-1;
      let body;
      if(q[2]==="select"){ body=`<div class="as-opts">${q[3].map(o=>`<button type="button" class="as-opt${val===o?" sel":""}" data-opt="${o.replace(/"/g,'&quot;')}">${o}</button>`).join("")}</div>`; }
      else { body=`<textarea class="" rows="4" id="qaText" placeholder="${q[3]}">${val}</textarea>`; }
      root.innerHTML=`${progress(st.cqual+1,QUAL.length,"Cualificación "+(st.cqual+1)+" de "+QUAL.length)}
        <p class="as-q">${q[1]}</p>${body}
        <button class="btn primary as-next" id="qNext" disabled>${last?"Ver mi Score":"Continuar"} →</button>`;
      const nx=root.querySelector("#qNext");
      const setVal=v=>{ st.qa[q[0]]=v; nx.disabled=!(v&&v.trim()); };
      setVal(val);
      if(q[2]==="select"){ root.querySelectorAll(".as-opt").forEach(o=>o.addEventListener("click",()=>{
        root.querySelectorAll(".as-opt").forEach(x=>x.classList.remove("sel")); o.classList.add("sel"); setVal(o.dataset.opt); })); }
      else { root.querySelector("#qaText").addEventListener("input",e=>setVal(e.target.value)); }
      nx.addEventListener("click",async()=>{
        if(nx.disabled) return;
        if(st.cqual<QUAL.length-1){ st.cqual++; render(); }
        else { nx.textContent="Calculando…"; nx.disabled=true; await submit(); st.phase="results"; render(); }
      });
    }
    else if(p==="results"){ renderResults(); }
  }

  function score(){ return Math.round(Object.values(st.yn).filter(Boolean).length/YN.length*100); }
  function failed(){ return [...new Set(YN.filter(q=>st.yn[q[0]]===false).map(q=>q[2]))]; }

  async function submit(){
    const s=score(), t=tier(s), fc=failed();
    dl("assessment_completed",{score:s,tier:t,failed_categories:fc.join(",")});
    try{ await fetch(WEBHOOK,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify(Object.assign({},st.gate,{score:s,tier:t,ynAnswers:st.yn,qualAnswers:st.qa,failedCategories:fc,source:"assessment-vg-2026"}))}); }catch(e){}
  }

  function renderResults(){
    const s=score(), t=tier(s), fc=failed();
    const TC={
      low:{badge:"Diagnóstico Prioritario",h:"Hay brechas críticas que están bloqueando tu crecimiento.",sub:"Con estas fricciones activas, más inversión solo amplifica el problema. Agenda una reunión y diseñamos el plan de ataque.",cta:"Agendar reunión ahora"},
      mid:{badge:"Sesión Estratégica",h:"Tienes base sólida, pero hay fricciones que frenan tu crecimiento.",sub:"Estás a pocas decisiones de multiplicar tu facturación. Agenda una sesión y lo desbloqueamos juntos.",cta:"Agendar reunión"},
      high:{badge:"Sesión 1:1 de Escalado",h:"Tu infraestructura está lista para un escalado de alto impacto.",sub:"Tienes los sistemas en orden. Agenda una sesión 1:1 para diseñar tu roadmap de crecimiento del 300%.",cta:"Agendar reunión 1:1"}
    }[t];
    const ins=fc.slice(0,3).map(c=>SMAP[c]).filter(Boolean);
    const col=s>=70?"#22c55e":s>=40?"#FFC600":"#ef4444";
    const lab=s>=70?"Sistema escalable":s>=40?"Optimización necesaria":"Fundamentos críticos";
    root.innerHTML=`
      <div class="q" style="justify-content:center">Score de Salud de Crecimiento${st.gate.nombre?" · "+st.gate.nombre.split(" ")[0]:""}</div>
      <div class="as-score">
        <div class="as-bar"><div class="as-bar-fill" style="width:${s}%;background:${col}"></div></div>
        <div class="as-score-n" style="color:${col}">${s}<span>%</span></div>
        <div class="as-score-l">${lab}</div>
      </div>
      <div style="text-align:center;margin-top:6px"><span class="as-badge ${t}">${TC.badge}</span></div>
      <p class="as-res-h" style="text-align:center">${TC.h}</p>
      <p class="as-res-sub" style="text-align:center">${TC.sub}</p>
      ${ins.length?`<p class="as-ins-h">3 Insights Inmediatos</p>${ins.map((v,i)=>`<a class="as-ins" href="${BASE}${v.h}/"><span class="nn">0${i+1}</span><div><b>${v.n}</b><p>${v.i}</p></div></a>`).join("")}`:""}
      <div class="as-res-cta">
        <a class="btn primary" href="${CALENDAR}" target="_blank" rel="noopener" data-cal style="justify-content:center">${TC.cta} →</a>
        <a class="btn ghost" href="${ECO}" style="justify-content:center">Ver el ecosistema</a>
      </div>`;
  }

  // ---- open / close / routing ----
  function open(push){ el.classList.add("open"); el.setAttribute("aria-hidden","false"); document.body.classList.add("diag-on"); render();
    if(push && !/diagnostico/i.test(location.pathname)){ try{ history.pushState({diag:1},"",DIAG); }catch(e){} } }
  function close(pop){ el.classList.remove("open"); el.setAttribute("aria-hidden","true"); document.body.classList.remove("diag-on");
    if(!pop){ if(history.state&&history.state.diag){ history.back(); } else { try{ history.pushState({},"",ECO);}catch(e){} if(onFolder) location.href=ECO; } }
    else if(onFolder){ location.href=ECO; } }

  document.addEventListener("click",e=>{
    if(e.target.closest("[data-cal]")) return; // let calendar links open
    const t=e.target.closest('[data-diag], a[href$="/diagnostico/"], a[href*="diagnostico"]');
    if(t && !e.target.closest("#diag")){ e.preventDefault(); open(true); return; }
    if(e.target.closest("[data-close]")){ e.preventDefault(); close(false); }
  });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&el.classList.contains("open")) close(false); });
  window.addEventListener("popstate",()=>{ /diagnostico/i.test(location.pathname)?open(false):close(true); });
  if(/diagnostico/i.test(location.pathname)) open(false);
})();
