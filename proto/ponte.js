/* ponte.js — o wireframe ouvindo o painel (/painel/).

   O painel manda, por postMessage, o texto e a situação de um trecho de copy;
   aqui o elemento com o mesmo data-copy é atualizado na hora, sem rebuild.
   Só aceita mensagens da própria origem: o painel e o wireframe são servidos
   pelo mesmo `jekyll serve`. */
(function () {
  var SITUACOES = ["is-draft", "is-pick", "is-missing"];

  function aplicar(m) {
    document.querySelectorAll('[data-copy="' + m.path + '"]').forEach(function (el) {
      el.textContent = m.text;
      SITUACOES.forEach(function (c) { el.classList.remove(c); });
      if (m.status && m.status !== "ok") el.classList.add("is-" + m.status);
    });
  }

  function apontar(path) {
    var el = document.querySelector('[data-copy="' + path + '"]');
    if (!el) return;
    var d = el.closest("details"); if (d) d.open = true;
    el.scrollIntoView({ block: "center" });
    el.classList.remove("painel-alvo"); void el.offsetWidth; el.classList.add("painel-alvo");
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || !e.data) return;
    if (e.data.tipo === "copy") (e.data.lista || [e.data]).forEach(aplicar);
    if (e.data.tipo === "apontar") apontar(e.data.path);
  });

  if (window.parent !== window) window.parent.postMessage({ tipo: "pronto" }, location.origin);
})();
