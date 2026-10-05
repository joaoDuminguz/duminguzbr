/* visual.js — o comportamento da proposta visual (/proto/visual/).

   1. Menu que acompanha a tela atual; menu do celular.
   2. Carrossel de Trabalhos como story: roda sozinho e PARA quando a pessoa
      reage (clique, toque, arrastar, teclado). Botão de pausar e retomar.
   3. Letras que embaralham (referência: noartmusic.com), "sensação de sistema":
      no PC, ao passar o mouse; no celular, que não tem hover, quando a tela
      entra. O leitor de tela lê sempre a palavra certa (aria-label), e quem
      pede movimento reduzido não vê o efeito.

   A rolagem entre telas é do navegador (scroll-snap); nada aqui a segura. */
(function () {
  "use strict";
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temHover = window.matchMedia("(hover: hover)").matches;
  var palco = document.querySelector(".sis-telas");

  /* ---------- 3. letras que embaralham ---------- */
  var SINAIS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/[]_-+*";
  function embaralhar(el) {
    if (calmo || el._rodando) return;
    var final = el.textContent; if (!final.trim()) return;
    el._rodando = true;
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", final);
    var passos = Math.min(18, 8 + Math.round(final.length / 6)), i = 0;
    var t = setInterval(function () {
      i++;
      var revela = Math.floor(final.length * i / passos);
      el.textContent = final.split("").map(function (ch, k) {
        if (k < revela || ch === " ") return ch;
        return SINAIS[(Math.random() * SINAIS.length) | 0];
      }).join("");
      if (i >= passos) { clearInterval(t); el.textContent = final; el._rodando = false; }
    }, 28);
  }
  var alvos = document.querySelectorAll("[data-embaralhar]");
  if (temHover) {
    alvos.forEach(function (el) {
      var gatilho = el.closest("a") || el;
      gatilho.addEventListener("mouseenter", function () { embaralhar(el); });
      gatilho.addEventListener("focus", function () { embaralhar(el); });
    });
  }
  /* A frase de cada tela embaralha quando a tela entra — no PC e no celular. */
  var frases = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) e.target.querySelectorAll(".h0[data-embaralhar], .h1[data-embaralhar]").forEach(embaralhar); });
  }, { root: palco, threshold: 0.55 });
  document.querySelectorAll(".tela").forEach(function (t) { frases.observe(t); });

  /* ---------- 1. menu ---------- */
  var links = document.querySelectorAll("[data-alvo]"), atual = document.getElementById("sis-atual");
  var menu = document.getElementById("sis-menu"), abrir = document.querySelector(".sis-abrir");
  var olho = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (l) {
        if (l.getAttribute("data-alvo") === e.target.id) {
          l.setAttribute("aria-current", "true");
          atual.textContent = l.querySelector(".idx").textContent + " " + (l.querySelector(".rotulo").getAttribute("aria-label") || l.querySelector(".rotulo").textContent);
        } else l.removeAttribute("aria-current");
      });
    });
  }, { root: palco, threshold: 0.5 });
  document.querySelectorAll(".tela").forEach(function (t) { olho.observe(t); });

  function fechar() { document.body.classList.remove("menu-aberto"); abrir.setAttribute("aria-expanded", "false"); abrir.textContent = "Menu"; }
  abrir.addEventListener("click", function () {
    var aberto = document.body.classList.toggle("menu-aberto");
    abrir.setAttribute("aria-expanded", aberto); abrir.textContent = aberto ? "Fechar" : "Menu";
    if (aberto) menu.querySelector("a").focus();
  });
  links.forEach(function (l) { l.addEventListener("click", fechar); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("menu-aberto")) { fechar(); abrir.focus(); } });

  /* ---------- 2. carrossel story ---------- */
  var DURACAO = 6000;
  var faixa = document.getElementById("faixa"), contador = document.getElementById("contador");
  var barras = document.querySelectorAll(".historias i"), tocar = document.getElementById("tocar");
  var n = faixa.children.length, atualI = 0, inicio = 0, visivel = false, quadro = 0, parado = calmo;

  function indice() { return Math.round(faixa.scrollLeft / faixa.clientWidth); }
  function pintar(f) {
    barras.forEach(function (b, i) { b.style.transform = "scaleX(" + (i < atualI ? 1 : i > atualI ? 0 : f) + ")"; });
    contador.textContent = (atualI + 1) + " / " + n;
  }
  function ir(i) { atualI = (i + n) % n; inicio = performance.now(); faixa.scrollTo({ left: atualI * faixa.clientWidth }); pintar(parado ? 1 : 0); }
  function passo(agora) {
    quadro = 0;
    if (parado || !visivel || document.hidden) return;
    var f = Math.min(1, (agora - inicio) / DURACAO); pintar(f);
    if (f >= 1) ir(atualI + 1);
    quadro = requestAnimationFrame(passo);
  }
  function rodar() { if (!quadro && !parado && visivel) quadro = requestAnimationFrame(passo); }
  function parar() { if (parado) return; parado = true; cancelAnimationFrame(quadro); quadro = 0; pintar(1); tocar.textContent = "Retomar"; tocar.setAttribute("aria-pressed", "true"); }
  function retomar() { parado = false; inicio = performance.now(); tocar.textContent = "Pausar"; tocar.setAttribute("aria-pressed", "false"); pintar(0); rodar(); }

  ["pointerdown", "wheel", "keydown"].forEach(function (ev) { faixa.addEventListener(ev, parar, { passive: true }); });
  faixa.addEventListener("scroll", function () { if (parado) { atualI = indice(); pintar(1); } }, { passive: true });
  faixa.addEventListener("click", function (e) { var r = faixa.getBoundingClientRect(); ir(e.clientX - r.left < r.width / 3 ? atualI - 1 : atualI + 1); });
  document.querySelectorAll("[data-ir]").forEach(function (b) { b.addEventListener("click", function () { parar(); ir(atualI + +b.getAttribute("data-ir")); }); });
  tocar.addEventListener("click", function () { parado ? retomar() : parar(); });
  new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; if (visivel) { inicio = performance.now(); rodar(); } },
    { root: palco, threshold: 0.5 }).observe(document.getElementById("s-trabalhos"));
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { inicio = performance.now(); rodar(); } });
  if (parado) { tocar.textContent = "Retomar"; tocar.setAttribute("aria-pressed", "true"); }
  pintar(parado ? 1 : 0);
})();
