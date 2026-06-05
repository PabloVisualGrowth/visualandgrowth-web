/* ===========================================================
   Visual & Growth — single-solution page (scroll-choreographed)
   Content fused over the living sky, beats appear on scroll.
   =========================================================== */
(function(){
  "use strict";
  const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), smooth=t=>t*t*(3-2*t);
  const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
  const ORDER=["estrategia-consultoria","hyper-automation","market-authority","product-boutique","smart-structure","content-studio"];

  const S = {
    "estrategia-consultoria":{num:"01",cat:"Growth Machines",price:"1.100&nbsp;€",title:'Estrategia &amp; <span class="serif">Consultoría</span>',plain:"Estrategia & Consultoría",
      tag:"Deja de improvisar. Construye el sistema que lleva tu empresa al siguiente nivel.",
      desc:"Analizamos tu modelo de negocio, identificamos dónde está el dinero y diseñamos el roadmap que convierte acciones dispersas en crecimiento predecible.",
      problems:[["Inversión sin resultados claros","Cada mes inviertes en marketing sin saber qué genera revenue de verdad y qué es solo ruido."],["Decisiones a ciegas","No tienes un sistema de métricas que te diga qué acciones priorizar ni qué palancas mueven tu negocio."],["Sin hoja de ruta","El equipo ejecuta sin un plan claro. Falta de foco, prioridades cambiantes, resultados inconsistentes."]],
      approach:"Nos integramos como co-pilotos estratégicos de tu negocio. Auditamos tus unit economics, encontramos las fugas de valor y diseñamos un sistema de crecimiento que prioriza lo que impacta de verdad.",
      points:["Pensamos como founders, no como proveedores","Metodología ICE para priorizar por impacto","Cada acción tiene un ROI estimado antes de ejecutarse","Reporting semanal con los KPIs que importan"],
      includes:["Auditoría 360° del modelo de negocio","Análisis de unit economics y fugas de valor","Roadmap estratégico de 90 días","Priorización ICE Score","Dashboard de KPIs de negocio","Sesiones estratégicas semanales","Playbook de ejecución documentado","Revisión y ajuste mensual del plan"],
      stats:[["2 sem","Para validar el primer sprint"],["60 días","Para resultados medibles"]],quote:"La tecnología sin estrategia es solo gasto."},
    "hyper-automation":{num:"02",cat:"AI &amp; Operations",price:"800&nbsp;€",title:'<span class="serif">Hyper-Automation</span>',plain:"Hyper-Automation",
      tag:"Tus procesos manuales son tu mayor cuello de botella. Los eliminamos con IA.",
      desc:"Diseñamos e implementamos sistemas de automatización inteligente que conectan tus herramientas, eliminan tareas manuales y generan eficiencia operativa real.",
      problems:[["Tiempo perdido en tareas repetitivas","Tu equipo dedica horas a procesos que una máquina hace en segundos. Eso destruye márgenes."],["Sistemas desconectados","Tu CRM no habla con tu email, tus datos están en silos. Cada herramienta es una isla."],["Escalas contratando, no automatizando","Cada vez que creces necesitas más personal para lo mismo. Eso rompe tu estructura de costes."]],
      approach:"Auditamos tus operaciones, identificamos qué automatizar primero y lo implementamos con IA de nueva generación. No usamos IA como experimento: la convertimos en infraestructura productiva.",
      points:["Auditoría de procesos: qué automatizar primero por ROI","Integramos tus herramientas (CRM, ERP, email…)","Agentes IA para tareas cognitivas repetitivas","Dashboards operativos en tiempo real"],
      includes:["Mapa de procesos y cuellos de botella","Automatizaciones de flujos clave (Make, n8n, Zapier)","Agentes IA personalizados","Integración de sistemas existentes","Dashboards operativos en tiempo real","Formación del equipo","Documentación técnica del sistema","Soporte y mantenimiento continuado"],
      stats:[["40+","Sistemas automatizados implementados"],["70%","Reducción media de tiempo en procesos"]],quote:"Escala el negocio, no la plantilla."},
    "market-authority":{num:"03",cat:"SEO &amp; Positioning",price:"900&nbsp;€",title:'<span class="serif">Market Authority</span>',plain:"Market Authority",
      tag:"No buscamos visitas. Buscamos compradores.",
      desc:"Posicionamiento quirúrgico en los términos con mayor intención de compra de tu sector. Construimos autoridad digital para que aparezcas cuando tu cliente ideal está listo para decidir.",
      problems:[["Tráfico que no convierte","Tienes visitas pero no ventas. Atraes al público equivocado en el momento equivocado."],["Invisible cuando importa","Tus competidores dominan las búsquedas clave y tú no apareces cuando el prospecto va a comprar."],["SEO genérico sin resultado","Posicionas palabras sin intención de compra. El tráfico crece, el revenue no."]],
      approach:"No perseguimos volumen: construimos autoridad digital para que aparezcas exactamente cuando tu cliente ideal está listo para decidir. Cada acción de SEO tiene un objetivo de negocio, no de vanidad.",
      points:["Keyword research por intención de compra","Arquitectura de contenido que posiciona y convierte","SEO técnico: Core Web Vitals, indexación","Link building editorial con medios de autoridad"],
      includes:["Auditoría SEO técnica completa","Mapa de keywords por intención de compra","Arquitectura de contenido y silos","Producción de contenido para conversión","SEO técnico: schema, velocidad, CWV","Estrategia de link building editorial","Search Console + Analytics setup","Reporting mensual de posicionamiento"],
      stats:[["3–6m","Para posicionamiento sólido"],["+340%","Tráfico cualificado medio en 6 meses"]],quote:"El mejor canal de adquisición que no pagas por clic."},
    "product-boutique":{num:"04",cat:"UI/UX &amp; Branding",price:"850&nbsp;€",title:'<span class="serif">Product Boutique</span>',plain:"Product Boutique",
      tag:"Diseño que vende solo. Estética que eleva. Conversión que factura.",
      desc:"Combinamos la estética de las mejores marcas del mundo con principios de conversión probados. Creamos identidades y productos digitales que emocionan, diferencian y venden.",
      problems:[["Diseño bonito que no convierte","Tu web es atractiva pero los visitantes no actúan. El diseño no está alineado con la psicología de compra."],["Sin identidad diferenciadora","Te confunden con la competencia. Tu marca no transmite el valor que ofreces."],["Percepción de valor baja","Justificas precios constantemente porque tu imagen no proyecta autoridad premium."]],
      approach:"Estética 'Mendesaltaren', conversión 'Amazon'. Cada decisión de diseño tiene un propósito: elevar tu percepción de valor y guiar al usuario hacia la acción. Diseñamos con datos, no con opiniones.",
      points:["Estética consistente que genera reconocimiento","Cada píxel con propósito: UX de conversión","Psicología del color y la tipografía","A/B testing y heatmaps para validar"],
      includes:["Identidad visual completa","Brand guidelines y manual de marca","Web / landing de alta conversión","Sistema de componentes UI","Diseño de producto digital","Materiales de marketing","Motion design y microinteracciones","Handoff técnico documentado"],
      stats:[["+2.4x","Conversión media tras rediseño"],["4 sem","Para tener tu identidad lista"]],quote:"El diseño es el embajador silencioso de tu marca."},
    "smart-structure":{num:"05",cat:"Legal &amp; Tax",price:"2.300&nbsp;€",title:'<span class="serif">Smart Structure</span>',plain:"Smart Structure",
      tag:"Crece sin que Hacienda se lleve la mitad.",
      desc:"Optimizamos la estructura fiscal y legal de tu empresa para que cada euro generado se quede donde tiene que quedarse: en tu negocio.",
      problems:[["Estructura societaria ineficiente","Al escalar pagas más impuestos de los necesarios porque tu estructura no está optimizada."],["Riesgos legales ignorados","Contratos, IP, compliance… lo que no proteges ahora puede hundirte después."],["Costes ocultos que destruyen márgenes","No tienes visibilidad de qué es deducible ni cómo estructurar para maximizar cada euro."]],
      approach:"Trabajamos con los mejores asesores especializados en alto crecimiento. No ofrecemos asesoría genérica: diseñamos la estructura exacta que maximiza cada euro que generas.",
      points:["Análisis de la estructura societaria actual","Diseño de holding / filiales si aplica","Optimización fiscal: deducciones y regímenes","Protección de activos intangibles (IP, marca)"],
      includes:["Auditoría fiscal y legal actual","Diseño de estructura societaria óptima","Optimización del régimen fiscal","Contratos con clientes, proveedores, empleados","Protección de IP y activos intangibles","Compliance LOPD / RGPD","Planificación fiscal anual","Red de asesores especializados"],
      stats:[["20–40%","Ahorro fiscal medio"],["1 mes","Para rediseñar la estructura"]],quote:"El crecimiento sin estructura es una bomba de relojería."},
    "content-studio":{num:"06",cat:"Media Production",price:"800&nbsp;€",title:'<span class="serif">Content Studio</span>',plain:"Content Studio",
      tag:"Tu marca es una productora de medios. Empieza a actuar como tal.",
      desc:"Convertimos tu empresa en una marca mediática. Desarrollamos la narrativa, producimos el contenido y lo distribuimos para que cada pieza trabaje para ti 24/7.",
      problems:[["Contenido que nadie consume","Publicas constantemente pero el engagement es bajo y no genera leads."],["Sin coherencia de marca","Cada pieza parece de una marca diferente. Sin narrativa, sin autoridad."],["Producción lenta y sin ROI","Tardas semanas en producir contenido que no mueve la aguja. Sin sistema, sin escala."]],
      approach:"Desarrollamos la narrativa de tu marca y la convertimos en contenido que conecta con tu audiencia ideal. Producimos con criterio cinematográfico y distribuimos con estrategia de negocio.",
      points:["Estrategia alineada con el embudo de ventas","Producción de video: grabación, edición, motion","Contenido vertical nativo por plataforma","Narrativas para Gen-Z y C-Levels"],
      includes:["Estrategia y calendario editorial","Producción de video (brand film, reels)","Edición y postproducción profesional","Motion graphics y animación de marca","Contenido para LinkedIn, IG y TikTok","Guiones y narrativas de marca","Gestión y distribución de canales","Análisis y optimización continua"],
      stats:[["10x","Más contenido vs método tradicional"],["+180%","Alcance orgánico medio en 3 meses"]],quote:"Una empresa que no produce contenido es invisible."}
  };

  // resolve slug
  const parts=location.pathname.split("/").filter(Boolean);
  let slug=parts[parts.length-1];
  if(slug && slug.indexOf(".")>-1) slug=parts[parts.length-2];
  if(!S[slug]){ const q=new URLSearchParams(location.search).get("s"); if(q) slug=q; }
  if(!S[slug]) slug=ORDER[0];
  const d=S[slug], next=ORDER[(ORDER.indexOf(slug)+1)%ORDER.length];
  const ECO="../../Ecosistema.html", DIAG="../diagnostico/";
  document.title="Visual & Growth — "+d.plain;

  // ---- build the choreographed beats ----
  const stage=document.createElement("div"); stage.id="stage"; stage.className="sol-stage";
  stage.innerHTML=`
    <div class="sbeat al-left" id="bh" data-base="translateY(-50%)">
      <span class="huge-num">${d.num}</span>
      <a class="sol-back" href="${ECO}">← Ecosistema</a>
      <span class="sol-cat">${d.cat}</span>
      <h2>${d.title}</h2>
      <div class="price">Desde <b>${d.price}</b></div>
      <p class="sol-tag">${d.tag}</p>
      <div class="sol-cta">
        <a class="btn primary" href="${DIAG}">Solicita una auditoría gratuita
          <svg class="star" viewBox="0 0 24 24" fill="none"><path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8z" fill="currentColor"/></svg></a>
        <a class="btn ghost" href="${ECO}">Ver todos los servicios</a>
      </div>
    </div>

    <div class="sbeat al-right" id="bp" data-base="translateY(-50%)">
      <div class="q">El Problema</div>
      <h2>¿Te suena <span class="serif">familiar</span>?</h2>
      <ul class="probs">${d.problems.map(p=>`<li><b>${p[0]}</b><span>${p[1]}</span></li>`).join("")}</ul>
    </div>

    <div class="sbeat al-left" id="ba" data-base="translateY(-50%)">
      <div class="q">Nuestro Enfoque</div>
      <h2>Cómo lo hacemos <span class="serif">diferente</span>.</h2>
      <p class="lead">${d.approach}</p>
      <ul class="pts">${d.points.map(pt=>`<li>${pt}</li>`).join("")}</ul>
      <div class="a-quote"><p>“${d.quote}”</p><span>Visual &amp; Growth</span></div>
    </div>

    <div class="sbeat al-right" id="bi" data-base="translateY(-50%)">
      <div class="q">El Servicio</div>
      <h2>Qué <span class="serif">incluye</span>.</h2>
      <ul class="incs">${d.includes.map((it,n)=>`<li><span class="n">${String(n+1).padStart(2,"0")}</span>${it}</li>`).join("")}</ul>
    </div>

    <div class="sbeat al-center" id="bc" data-base="translate(-50%,-50%)">
      <div class="stats-row">${d.stats.map(s=>`<div class="stat"><div class="v">${s[0]}</div><div class="k">${s[1]}</div></div>`).join("")}</div>
      <h2 style="margin-top:42px">¿Listo para crecer con <span class="serif">${d.plain}</span>?</h2>
      <p class="lead" style="margin-left:auto;margin-right:auto;text-align:center">Cuéntanos tu situación. Analizamos tu caso sin coste y te proponemos un plan concreto.</p>
      <div class="sol-cta">
        <a class="btn primary" href="${DIAG}">Solicitar diagnóstico gratuito
          <svg class="star" viewBox="0 0 24 24" fill="none"><path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8z" fill="currentColor"/></svg></a>
      </div>
      <a class="sol-next" href="../${next}/">Siguiente · ${S[next].plain} →</a>
    </div>`;
  document.body.appendChild(stage);
  const oldRoot=document.getElementById("sol-root"); if(oldRoot) oldRoot.remove();

  const driver=document.createElement("div"); driver.id="driver"; driver.style.height="560vh";
  document.body.appendChild(driver);

  // ---- choreography ----
  const B=id=>document.getElementById(id);
  const beats=[
    {el:B("bh"),in0:-0.05,in1:0.00,out0:0.10,out1:0.15,ty:46},
    {el:B("bp"),in0:0.16,in1:0.21,out0:0.31,out1:0.36,ty:55},
    {el:B("ba"),in0:0.37,in1:0.43,out0:0.54,out1:0.59,ty:55},
    {el:B("bi"),in0:0.60,in1:0.66,out0:0.76,out1:0.81,ty:55},
    {el:B("bc"),in0:0.83,in1:0.90,out0:1.10,out1:1.20,ty:55},
  ];
  const sun=B("sun"), warm=B("warm"), tint=B("sky-tint"), clouds=B("clouds");
  function bOpacity(p,b){ if(p<b.in0||p>b.out1) return 0; if(p<b.in1) return smooth(clamp((p-b.in0)/(b.in1-b.in0))); if(p<=b.out0) return 1; return 1-smooth(clamp((p-b.out0)/(b.out1-b.out0))); }
  function bPhase(p,b){ const mid=(b.in1+b.out0)/2; if(p<mid) return -(1-clamp((p-b.in0)/(mid-b.in0))); return clamp((p-mid)/(b.out1-mid)); }
  function getP(){ const m=driver.scrollHeight-innerHeight; return m>0?clamp(scrollY/m):0; }

  function paint(p){
    for(const b of beats){
      const o=bOpacity(p,b); b.el.style.opacity=o.toFixed(3);
      if(o>0.001){ const y=bPhase(p,b)*b.ty; const base=b.el.dataset.base||"";
        b.el.style.transform=`${base} translate3d(0,${y.toFixed(1)}px,0)`;
        b.el.style.filter=o<0.55?`blur(${((0.55-o)*7).toFixed(1)}px)`:"none"; }
      b.el.classList.toggle("live", o>0.6);
    }
    const sunX=12+p*76, sunY=82-Math.sin(clamp(p)*Math.PI)*60, noon=Math.sin(clamp(p)*Math.PI);
    if(sun){ sun.style.left=sunX+"%"; sun.style.top=sunY+"%"; sun.style.opacity=(0.30+noon*0.6).toFixed(3); }
    if(warm){ warm.style.background=`radial-gradient(60% 55% at ${sunX}% ${sunY}%, rgba(255,196,90,${(0.16+noon*0.20).toFixed(3)}), transparent 70%)`; }
    if(tint){ tint.style.opacity=(1-noon*0.34).toFixed(3); }
    if(clouds){ clouds.style.transform=`translateY(${(-p*6).toFixed(2)}vh) scale(${(1.02+noon*0.04).toFixed(3)})`; }
  }

  let progress=0,lenis=null,rafAlive=false;
  function onScroll(){ paint(rafAlive?progress:getP()); }
  function frame(){ requestAnimationFrame(frame); rafAlive=true; progress=lerp(progress,getP(),0.10); paint(progress); }

  if(window.VANTA && window.THREE){
    VANTA.CLOUDS({el:"#clouds",mouseControls:true,touchControls:true,gyroControls:false,
      minHeight:200,minWidth:200,skyColor:0x844340,cloudShadowColor:0x502d18,sunColor:0xdaff18});
  }
  if(typeof Lenis!=="undefined" && !reduce){
    lenis=new Lenis({lerp:0.085,wheelMultiplier:0.9,smoothWheel:true});
    function raf(t){ lenis.raf(t); requestAnimationFrame(raf); } requestAnimationFrame(raf);
  }
  requestAnimationFrame(frame);
  addEventListener("scroll",onScroll,{passive:true});
  paint(getP());
  document.body.classList.add("ready");

  // ---- snap to each section/page when scrolling stops ----
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
})();
