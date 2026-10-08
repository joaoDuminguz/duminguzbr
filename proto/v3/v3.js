/* v3.js — o comportamento do sistema de telas (2026-10-08).

   1. A TV: ruído VHS e a TROCA DE CANAL (tremida → a tela colapsa numa linha →
      estática → religa → o conteúdo se monta, decodificando só os títulos).
   2. Início: "Feito à mão," troca de fonte com glitch; a palavra em cor gira
      pelos serviços e acende como lâmpada antes de voltar à cor original.
   3. Design e Arte: carrossel infinito (horizontal e vertical). Gira sozinho
      até a pessoa agir; depois, cada clique traz o serviço ao foco; volta a
      girar após 15 s parado. Tags além de 3 viram "+X" com lista.
   4. Quem sou: a linha do tempo se desenha. Contato: os circuitos se traçam.

   Quem pede movimento reduzido vê tudo parado e legível. Endereços: #inicio,
   #design, #arte, #sobre, #contato. */
(function () {
  "use strict";
  var D = JSON.parse(document.getElementById("dados").textContent);
  var G = window.gsap;
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !G || /[?&]calmo/.test(location.search);   /* ?calmo: o estado final, para conferir */
  var celular = window.matchMedia("(max-width: 899px)");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var sistema = $("#sistema"), conteudo = $("#tela-conteudo");
  var CORES = { clay: "--c-clay", roxo: "--c-roxo", ciano: "--c-ciano", canion: "--c-canion", mar: "--c-mar" };

  /* ---------- utilidades ---------- */
  var SINAIS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/[]_<>";
  function decodificar(el, final, ms) {
    final = final == null ? el.textContent : final;
    if (calmo) { el.textContent = final; return; }
    clearInterval(el._dec);
    el.setAttribute("aria-label", final);
    var passos = Math.round((ms || 520) / 32), i = 0;
    el._dec = setInterval(function () {
      i++;
      var revela = Math.floor(final.length * i / passos);
      el.textContent = final.split("").map(function (c, k) {
        return k < revela || c === " " ? c : SINAIS[(Math.random() * SINAIS.length) | 0];
      }).join("");
      if (i >= passos) { clearInterval(el._dec); el.textContent = final; }
    }, 32);
  }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function dois(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- 1. a TV ---------- */
  function ruido(cv, forte) {
    var c = cv.getContext("2d"), img = c.createImageData(cv.width, cv.height), d = img.data;
    for (var k = 0; k < d.length; k += 4) { var v = (Math.random() * 255) | 0; d[k] = d[k + 1] = d[k + 2] = forte ? v : 255 - v * .6; d[k + 3] = 255; }
    c.putImageData(img, 0, 0);
  }
  var cvRuido = $("#ruido"), cvEstatica = $("#estatica"), estaticaLigada = false, ultimo = 0;
  (function laco(t) {
    if (!document.hidden && t - ultimo > 80) {          /* ~12 quadros por segundo: grão, não vídeo */
      ultimo = t;
      if (!calmo) ruido(cvRuido, false);
      if (estaticaLigada) ruido(cvEstatica, true);
    }
    requestAnimationFrame(laco);
  })(0);

  var canais = {}, atual = null, trocando = false;
  $$(".canal").forEach(function (s) { canais[s.getAttribute("data-canal")] = s; });
  var botoes = $$(".canal-botao");

  function pintar(id) {
    var b = botoes.filter(function (x) { return x.getAttribute("data-canal") === id; })[0];
    botoes.forEach(function (x) { x === b ? x.setAttribute("aria-current", "page") : x.removeAttribute("aria-current"); });
    var cor = b ? CORES[b.getAttribute("data-cor")] : "--c-clay";
    sistema.style.setProperty("--cor-canal", "var(" + cor + ")");
  }
  function mostrar(id) {
    if (atual && controles[atual] && controles[atual].sair) controles[atual].sair();
    Object.keys(canais).forEach(function (k) { canais[k].hidden = k !== id; });
    atual = id; pintar(id);
    if (controles[id] && controles[id].entrar) controles[id].entrar();
  }
  function montar(id) {
    var s = canais[id];
    $$("[data-decode]", s).forEach(function (t) {
      decodificar(t, t.getAttribute("aria-label") || t.textContent, 620);
      t.classList.add("rgb"); setTimeout(function () { t.classList.remove("rgb"); }, 700);
    });
    if (calmo) return;
    G.fromTo($$("[data-montar]", s), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, stagger: .07, ease: "power2.out", clearProps: "transform" });
  }
  function trocar(id) {
    if (!canais[id] || id === atual || trocando) return;
    if (calmo) { mostrar(id); return; }
    trocando = true;
    var troca = $("#troca"), linha = $(".troca-linha");
    G.timeline({ onComplete: function () { trocando = false; } })
      .to(conteudo, { x: 10, skewX: 5, filter: "brightness(1.35)", duration: .05, yoyo: true, repeat: 1 })
      .to(conteudo, { scaleY: .006, filter: "brightness(2.6)", duration: .16, ease: "power3.in" })
      .set(troca, { opacity: 1 }).set(linha, { scaleX: 1 })
      .to(linha, { scaleX: 0, duration: .11, ease: "power2.in" })
      .add(function () { estaticaLigada = true; })
      .to({}, { duration: .2 })
      .add(function () { estaticaLigada = false; mostrar(id); })
      .to(linha, { scaleX: 1, duration: .1, ease: "power2.out" })
      .to(troca, { opacity: 0, duration: .14 })
      .fromTo(conteudo, { scaleY: .006, filter: "brightness(2.6)" }, { scaleY: 1, filter: "brightness(1)", duration: .26, ease: "power3.out" }, "<")
      .set(conteudo, { clearProps: "transform,filter" })
      .add(function () { montar(id); });
  }

  /* ---------- 2. Início ---------- */
  var mosaico = $("#mosaico");
  for (var m = 0; m < 64; m++) mosaico.appendChild(el("i"));
  var inicio = (function () {
    var mao = $("#mao"), palavra = $("#palavra"), resto = $("#resto"), frases = D.inicio.frases, f = 0;
    var tFonte, tPalavra, deriva;
    function trocaFonte() {
      mao.classList.add("falha");
      setTimeout(function () { mao.classList.toggle("cursiva"); }, 150);
      setTimeout(function () { mao.classList.remove("falha"); }, 330);
    }
    function proxima() {
      f = (f + 1) % frases.length;
      var fr = frases[f];
      decodificar(palavra, fr.palavra, 420);
      G.timeline()
        .set(palavra, { color: "var(--c-clay)", textShadow: "0 0 14px rgba(188,96,54,.85)" })
        .to(palavra, { scale: 1.08, duration: .14, yoyo: true, repeat: 3, ease: "power1.inOut" })
        /* a lâmpada apagando: pisca e esfria até a cor original */
        .to(palavra, { opacity: .55, duration: .06 }).to(palavra, { opacity: 1, duration: .08 })
        .to(palavra, { opacity: .7, duration: .05 }).to(palavra, { opacity: 1, duration: .1 })
        .to(palavra, { color: "var(--c-roxo)", textShadow: "0 0 0 rgba(188,96,54,0)", duration: 1.1, ease: "power2.out" });
      G.timeline().to(resto, { opacity: 0, y: -6, duration: .18 }).add(function () { resto.textContent = fr.resto; }).to(resto, { opacity: 1, y: 0, duration: .3 });
    }
    return {
      entrar: function () {
        if (calmo) return;
        tFonte = setInterval(trocaFonte, 5000);
        tPalavra = setInterval(proxima, 3400);
        deriva = G.to(mosaico, { xPercent: -18, yPercent: -8, duration: 40, repeat: -1, yoyo: true, ease: "none" });
      },
      sair: function () { clearInterval(tFonte); clearInterval(tPalavra); if (deriva) deriva.kill(); }
    };
  })();

  /* ---------- 3. os carrosséis ---------- */
  /* Retângulos em % da tela, das coordenadas dos frames do Figma (tela 1530 × 1080). */
  function r(x, y, w, h) { return { left: x / 15.3 + "%", top: y / 10.8 + "%", width: w / 15.3 + "%", height: h / 10.8 + "%" }; }
  function p(x, y, w, h) { return { left: x + "%", top: y + "%", width: w + "%", height: h + "%" }; }
  var SLOTS = {
    design: {
      pc:  { foco: 1, lista: [r(-112, 595, 306, 355), r(224, 285, 417, 689), r(671, 595, 306, 355), r(1001, 595, 306, 355), r(1331, 595, 306, 355), r(1661, 595, 306, 355)], antes: r(-480, 595, 306, 355), fora: r(1991, 595, 306, 355) },
      cel: { foco: 1, lista: [p(-74, 29.5, 80, 61.5), p(10, 20.8, 80, 73), p(94, 29.5, 80, 61.5), p(180, 29.5, 80, 61.5), p(180, 29.5, 80, 61.5), p(180, 29.5, 80, 61.5)], antes: p(-170, 29.5, 80, 61.5), fora: p(180, 29.5, 80, 61.5) }
    },
    arte: {
      pc:  { foco: 2, lista: [r(1019, -176, 511, 277), r(1019, 120, 511, 277), r(124, 415, 1406, 412), r(1019, 845, 511, 277), r(1019, 1145, 511, 277)], antes: r(1019, -480, 511, 277), fora: r(1019, 1450, 511, 277) },
      cel: { foco: 2, lista: [p(95.5, 53.6, 4.5, 5), p(95.5, 59.6, 4.5, 5), p(1.5, 35.6, 94, 63.4), p(95.5, 41.6, 4.5, 5), p(95.5, 47.6, 4.5, 5)], antes: p(105, 41.6, 4.5, 5), fora: p(105, 59.6, 4.5, 5) }
    }
  };

  function Carrossel(nome, servicos, raiz, info, tagsAlvo, vertical) {
    var self = this, n = servicos.length, ordem = servicos.map(function (_, i) { return i; });
    var cartoes = [], parado = false, relogio = null, ocioso = null, ativo = false, animando = false;
    /* as duas camadas fantasma do glitch (ciano e orquídea), atrás do texto da caixa */
    var f1 = el("i", "fantasma fantasma--ciano"), f2 = el("i", "fantasma fantasma--orquidea");
    info.insertBefore(f2, info.firstChild); info.insertBefore(f1, info.firstChild);
    var fundo = raiz.parentNode.querySelector(".fundo-servico"), notaFundo = raiz.parentNode.querySelector(".nota-fundo");
    function slots() { return SLOTS[nome][celular.matches ? "cel" : "pc"]; }
    function retPos(pos) { var s = slots(); return pos < s.lista.length ? s.lista[pos] : s.fora; }

    for (var f0 = 0; f0 < SLOTS[nome].pc.foco; f0++) ordem.unshift(ordem.pop());   /* abre com o primeiro serviço no foco */
    servicos.forEach(function (sv, i) {
      var c = el("button", "cartao"); c.type = "button";
      c.setAttribute("aria-label", sv.titulo);
      c.appendChild(el("span", "cartao-num", dois(i + 1)));
      var ph = el("figure", "ph cartao-arte"); ph.appendChild(el("figcaption", null, "Peça: " + sv.arte)); c.appendChild(ph);
      c.addEventListener("click", function () { interagiu(); irPara(i); });
      raiz.appendChild(c); cartoes.push(c);
    });

    function posicionar(animar, voltas, opc) {
      var s = slots(); opc = opc || {}; var dur = opc.dur || .7;
      ordem.forEach(function (idx, pos) {
        var c = cartoes[idx], alvo = retPos(pos), foco = pos === s.foco;
        c.classList.toggle("foco", foco);
        c.style.zIndex = foco ? 3 : 2;
        c.tabIndex = foco ? -1 : 0;
        if (!animar || calmo) { G ? G.set(c, Object.assign({ opacity: 1 }, alvo)) : Object.assign(c.style, alvo); return; }
        var dado = voltas && voltas[idx];
        if (dado) {   /* deu a volta: sai por um lado, reaparece do outro, sem cruzar a tela */
          var saida = dado === "fim" ? s.antes : s.fora, entrada = dado === "fim" ? s.fora : s.antes;
          G.timeline()
            .to(c, Object.assign({ opacity: 0, duration: .35, ease: "power2.in" }, saida))
            .set(c, entrada)
            .to(c, Object.assign({ opacity: 1, duration: .5, ease: "power3.out" }, alvo));
        } else {
          G.to(c, Object.assign({ opacity: 1, duration: dur, ease: "power3.inOut" }, alvo));
          /* continuidade: o cartão que chega ao foco assenta com um quique curto */
          if (foco && opc.quique) G.fromTo(c, { scale: .95 }, { scale: 1, duration: .5, ease: "back.out(2)", delay: dur * .7 });
        }
      });
    }
    function girar(passos) {      /* passos > 0: o próximo vem ao foco */
      if (!passos || animando) return;
      var voltas = {}, k;
      for (k = 0; k < Math.abs(passos); k++) {
        if (passos > 0) { var a = ordem.shift(); ordem.push(a); voltas[a] = "fim"; }
        else { var b = ordem.pop(); ordem.unshift(b); voltas[b] = "inicio"; }
      }
      if (!calmo && celular.matches && !vertical) { transicaoCelular(voltas); return; }
      posicionar(true, voltas);
      mostrarInfo();
    }

    /* Celular, Design: a caixa some em glitch AINDA SOBRE o cartão antigo, o
       carrossel anda, e a caixa reaparece em glitch sobre o cartão novo.
       Princípios: antecipação (encolhe antes de sumir), compressão e estiramento
       (vira linha, abre com sobra), sobreposição (o cartão sai antes de a caixa
       acabar; fantasmas e conteúdo chegam em tempos diferentes), aceleração e
       desaceleração, arco (sobe de leve ao reaparecer), continuidade (assenta
       com elástico), ação secundária (título decodifica, tags brotam). */
    function transicaoCelular(voltas) {
      var sv = servicos[ordem[slots().foco]];
      var titulo = $(".info-titulo", info), logline = $(".info-logline", info);
      animando = true;
      var tl = G.timeline({ onComplete: function () { animando = false; G.set(info, { clearProps: "clipPath,transform" }); } });
      /* 1. antecipação */
      tl.to(info, { scaleY: .93, scaleX: 1.03, duration: .09, ease: "power2.out", transformOrigin: "50% 50%" })
      /* 2. glitch de saída: fantasmas se descolam, a caixa é fatiada, vira linha e apaga */
        .set([f1, f2], { opacity: .9 })
        .to(f1, { keyframes: { x: [-9, 7, -13, 5, -4] }, duration: .22, ease: "none" }, "<")
        .to(f2, { keyframes: { x: [10, -6, 12, -5, 3] }, duration: .22, ease: "none" }, "<")
        .to(info, { clipPath: "inset(0% 0% 58% 0%)", x: 5, duration: .055, ease: "steps(1)" }, "<")
        .to(info, { clipPath: "inset(38% 0% 22% 0%)", x: -7, duration: .055, ease: "steps(1)" })
        .to(info, { clipPath: "inset(72% 0% 0% 0%)", x: 4, duration: .055, ease: "steps(1)" })
        .to(info, { clipPath: "inset(46% 0% 46% 0%)", x: 0, duration: .055, ease: "steps(1)" })
        .to(info, { scaleX: 1.14, scaleY: .03, duration: .09, ease: "power3.in" })
        .to(info, { scaleX: 0, opacity: 0, duration: .07, ease: "power2.in" })
        .set([f1, f2], { opacity: 0, x: 0 })
      /* 3. o carrossel anda (começa um pouco antes de a caixa terminar: sobreposição) */
        .add(function () { preencherSilencioso(sv); posicionar(true, voltas, { dur: .62, quique: true }); }, "-=.08")
      /* 4. glitch de entrada, quando o cartão assenta */
        .set(info, { clipPath: "inset(48% 0% 48% 0%)", scaleX: 0, scaleY: .03, opacity: 1, y: 12 }, "+=.5")
        .to(info, { scaleX: 1.08, duration: .12, ease: "power3.out" })
        .add(function () { decodificar(titulo, sv.titulo, 420); })
        .set(f1, { opacity: .85, x: -11 }).set(f2, { opacity: .85, x: 11 })
        .to(info, { clipPath: "inset(0% 0% 0% 0%)", scaleY: 1.05, scaleX: .97, y: -3, duration: .2, ease: "power3.out" })
        .to(f1, { x: 0, opacity: 0, duration: .32, ease: "power2.out" }, "<.05")
        .to(f2, { x: 0, opacity: 0, duration: .42, ease: "power2.out" }, "<.04")
        .to(info, { scaleY: 1, scaleX: 1, y: 0, duration: .6, ease: "elastic.out(1, .5)" }, "<.06")
      /* 5. ação secundária: a logline desliza, as tags brotam uma a uma */
        .fromTo(logline, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .35, ease: "power2.out" }, "<")
        .add(function () { G.fromTo($$(".tag", tagsAlvo), { opacity: 0, scale: .6, y: 6 }, { opacity: 1, scale: 1, y: 0, duration: .4, stagger: .05, ease: "back.out(2.2)" }); }, "<.08");
    }
    function preencherSilencioso(sv) {
      if (notaFundo) notaFundo.textContent = "Fundo: " + sv.fundo;
      $(".info-titulo", info).textContent = sv.titulo;
      var lg = $(".info-logline", info); lg.textContent = sv.logline; G.set(lg, { opacity: 0 });
      desenharTags(sv.tags); G.set($$(".tag", tagsAlvo), { opacity: 0 });
    }
    function irPara(idx) {
      var s = slots(), pos = ordem.indexOf(idx), d = pos - s.foco;
      if (d > n / 2) d -= n; if (d < -n / 2) d += n;
      girar(d);
    }
    function mostrarInfo() {
      var sv = servicos[ordem[slots().foco]];
      var titulo = $(".info-titulo", info), logline = $(".info-logline", info);
      var risco = vertical ? $(".info-barra", info) : $(".info-linha", info);
      if (notaFundo) notaFundo.textContent = "Fundo: " + sv.fundo;
      if (fundo) { fundo.style.setProperty("--fx", (30 + Math.random() * 50) + "%"); fundo.style.setProperty("--fy", (20 + Math.random() * 50) + "%"); }
      function preencher() {
        decodificar(titulo, sv.titulo, 480);
        logline.textContent = sv.logline;
        desenharTags(sv.tags);
      }
      if (calmo) { preencher(); return; }
      G.timeline()
        .to([logline, tagsAlvo], { opacity: 0, x: vertical ? 0 : -24, y: vertical ? 10 : 0, duration: .2 })
        .to(risco, vertical ? { scaleY: 0, duration: .2 } : { scaleX: .3, duration: .2 }, "<")
        .add(preencher)
        .to(risco, vertical ? { scaleY: 1, duration: .45, ease: "power3.out" } : { scaleX: 1, duration: .45, ease: "power3.out" })
        .to([logline, tagsAlvo], { opacity: 1, x: 0, y: 0, duration: .4, stagger: .08, ease: "power2.out" }, "<.1");
    }
    function desenharTags(tags) {
      tagsAlvo.innerHTML = "";
      var max = 3;
      tags.slice(0, max).forEach(function (t) { tagsAlvo.appendChild(el("span", "tag", t)); });
      if (tags.length > max) {
        var mais = el("button", "tag tag--mais", "+" + (tags.length - max)); mais.type = "button";
        mais.setAttribute("aria-expanded", "false");
        var lista = el("ul", "tags-lista"); lista.hidden = true;
        tags.slice(max).forEach(function (t) { lista.appendChild(el("li", null, t)); });
        mais.addEventListener("click", function (e) {
          e.stopPropagation(); interagiu();
          lista.hidden = !lista.hidden; mais.setAttribute("aria-expanded", String(!lista.hidden));
        });
        tagsAlvo.appendChild(mais); tagsAlvo.appendChild(lista);
      }
    }
    function interagiu() {
      parado = true; clearTimeout(ocioso);
      ocioso = setTimeout(function () { parado = false; }, 15000);   /* volta a girar após 15 s parado */
    }
    function tique() { if (ativo && !parado && !document.hidden) girar(1); }

    /* deslizar o dedo: horizontal no Design, vertical na Arte */
    var x0, y0;
    raiz.addEventListener("pointerdown", function (e) { x0 = e.clientX; y0 = e.clientY; });
    raiz.addEventListener("pointerup", function (e) {
      if (x0 == null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0, d = vertical ? dy : dx; x0 = null;
      if (Math.abs(d) > 40 && Math.abs(d) > Math.abs(vertical ? dx : dy)) { interagiu(); girar(d < 0 ? 1 : -1); }
    });
    document.addEventListener("keydown", function (e) {
      if (!ativo) return;
      var prox = vertical ? "ArrowDown" : "ArrowRight", ant = vertical ? "ArrowUp" : "ArrowLeft";
      if (e.key === prox) { interagiu(); girar(1); } else if (e.key === ant) { interagiu(); girar(-1); }
    });
    celular.addEventListener("change", function () { posicionar(false); });

    self.entrar = function () {
      ativo = true; posicionar(false); mostrarInfo();
      clearInterval(relogio); if (!calmo) relogio = setInterval(tique, 4000);
    };
    self.sair = function () { ativo = false; clearInterval(relogio); };
    posicionar(false);
  }

  var cDesign = new Carrossel("design", D.design.servicos, $("#vitrine-design"), $("#info-design"), $("#info-design .tags"), false);
  var cArte = new Carrossel("arte", D.arte.servicos, $("#vitrine-arte"), $("#info-arte"), $("#tags-arte"), true);

  /* o letreiro dos projetos, na Arte */
  var letreiro = $("#letreiro"), rolagem;
  D.arte.projetos.concat(D.arte.projetos).forEach(function (t) { letreiro.appendChild(el("span", null, t)); });

  /* ---------- 4. Quem sou e Contato ---------- */
  var lt = $("#linha-tempo"), barras = [];
  (function () {
    var A0 = 2012, A1 = 2026, faixa = A1 - A0, marcos = D.sobre.marcos;
    lt.appendChild(el("i", "lt-eixo"));
    for (var a = A0; a <= A1; a += 2) { var ano = el("span", "lt-ano", String(a)); ano.style.left = ((a - A0) / faixa * 100) + "%"; lt.appendChild(ano); }
    marcos.forEach(function (mk, i) {
      var b = el("div", "lt-barra" + (mk.pillar ? " pillar" : ""));
      b.style.left = ((mk.de - A0) / faixa * 100) + "%";
      b.style.width = (Math.max(mk.ate - mk.de, .6) / faixa * 100) + "%";
      b.style.top = (i * (100 / (marcos.length + .6))) + "%";
      /* nome dentro da barra quando cabe (4 anos ou mais); o papel fora, à direita,
         ou à esquerda quando a barra chega perto de 2026 */
      var anos = mk.ate - mk.de, dentro = anos >= 4, esquerda = mk.ate > 2022;
      if (dentro) b.appendChild(el("b", null, mk.nome));
      var rot = el("small", esquerda ? "a-esquerda" : null, (dentro ? "" : mk.nome + " · ") + mk.papel);
      b.appendChild(rot);
      lt.appendChild(b); barras.push(b);
    });
  })();
  var circuitos = $$(".circuito path");
  circuitos.forEach(function (pth) { var L = pth.getTotalLength ? pth.getTotalLength() : 600; pth.style.strokeDasharray = L; pth.style.strokeDashoffset = calmo ? 0 : L; });

  var controles = {
    inicio: inicio,
    design: cDesign,
    arte: {
      entrar: function () { cArte.entrar(); if (!calmo) rolagem = G.to(letreiro, { xPercent: -50, duration: 60, repeat: -1, ease: "none" }); },
      sair: function () { cArte.sair(); if (rolagem) rolagem.kill(); }
    },
    sobre: { entrar: function () { if (!calmo) G.fromTo(barras, { scaleX: 0 }, { scaleX: 1, duration: .9, stagger: .12, ease: "power3.out", delay: .5 }); } },
    contato: { entrar: function () { if (!calmo) G.to(circuitos, { strokeDashoffset: 0, duration: 1.4, stagger: .15, ease: "power2.inOut", delay: .4 }); } }
  };

  /* copiar o e-mail; se o navegador recusar, seleciona o texto */
  $("#copiar").addEventListener("click", function () {
    var b = this, t = $("#email").textContent;
    function ok() { b.textContent = "Copiado"; setTimeout(function () { b.textContent = "Copiar"; }, 1600); }
    function sel() { var r2 = document.createRange(); r2.selectNodeContents($("#email")); var s = getSelection(); s.removeAllRanges(); s.addRange(r2); b.textContent = "Selecionado"; }
    try { navigator.clipboard.writeText(t).then(ok, sel); } catch (e) { sel(); }
  });

  /* o endereço escolhe o canal: #design, #arte, #sobre, #contato */
  function doEndereco() { var h = (location.hash || "#inicio").slice(1); return canais[h] ? h : "inicio"; }
  window.addEventListener("hashchange", function () { trocar(doEndereco()); });
  mostrar(doEndereco()); montar(doEndereco());
})();
