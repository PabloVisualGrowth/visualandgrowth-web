/* ===========================================================
   Visual & Growth — cookie consent banner (self-contained)
   =========================================================== */
(function(){
  "use strict";
  try{ if(localStorage.getItem("vg_cookies")) return; }catch(e){}

  var css = `
  #vg-cookies{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(16px);
    z-index:9000;width:min(680px,calc(100vw - 32px));opacity:0;transition:opacity .6s ease,transform .6s cubic-bezier(.16,.84,.3,1);
    background:rgba(14,12,16,.86);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    border:1px solid rgba(255,196,10,.18);border-radius:18px;padding:18px 22px;
    box-shadow:0 24px 70px rgba(0,0,0,.5);display:flex;align-items:center;gap:18px;flex-wrap:wrap;
    font-family:'Space Grotesk',system-ui,sans-serif}
  #vg-cookies.show{opacity:1;transform:translateX(-50%) translateY(0)}
  #vg-cookies .ck-txt{flex:1 1 280px;min-width:240px}
  #vg-cookies .ck-txt b{display:block;font-weight:500;font-size:14px;color:#f4f6fc;margin-bottom:4px}
  #vg-cookies .ck-txt p{font-weight:300;font-size:12.5px;line-height:1.5;color:rgba(244,246,252,.6)}
  #vg-cookies .ck-txt a{color:#ffc40a;text-decoration:none}
  #vg-cookies .ck-btns{display:flex;gap:10px;flex:0 0 auto}
  #vg-cookies button{font-family:inherit;font-weight:500;font-size:13px;cursor:pointer;border-radius:100px;
    padding:11px 20px;border:1px solid transparent;transition:transform .25s,box-shadow .25s,background .25s,color .25s}
  #vg-cookies .ck-ok{background:#ffc40a;color:#0a0a0a}
  #vg-cookies .ck-ok:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(255,196,10,.35)}
  #vg-cookies .ck-no{background:transparent;color:#f4f6fc;border-color:rgba(244,246,252,.18)}
  #vg-cookies .ck-no:hover{border-color:#f4f6fc}
  @media(max-width:560px){#vg-cookies{flex-direction:column;align-items:stretch;text-align:left}
    #vg-cookies .ck-btns{justify-content:flex-end}}`;
  var st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);

  var el=document.createElement("div"); el.id="vg-cookies"; el.setAttribute("role","dialog"); el.setAttribute("aria-label","Cookies");
  el.innerHTML =
    '<div class="ck-txt"><b>Valoramos tu privacidad</b>'+
    '<p>Usamos cookies para mejorar tu experiencia y analizar el tráfico. Al aceptar, consientes su uso. '+
    '<a href="#" target="_blank" rel="noopener">Más información</a>.</p></div>'+
    '<div class="ck-btns"><button class="ck-no" type="button">Rechazar</button>'+
    '<button class="ck-ok" type="button">Aceptar todo</button></div>';
  document.body.appendChild(el);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add("show"); }); });

  function close(val){
    try{ localStorage.setItem("vg_cookies", val); }catch(e){}
    el.classList.remove("show");
    setTimeout(function(){ el.remove(); }, 600);
  }
  el.querySelector(".ck-ok").addEventListener("click", function(){ close("accepted"); });
  el.querySelector(".ck-no").addEventListener("click", function(){ close("rejected"); });
})();
