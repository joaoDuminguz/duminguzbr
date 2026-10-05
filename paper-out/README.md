# paper-out — o que volta do Paper

O Estúdio cola aqui o que sai do layout FINAL, **sem gastar chamadas MCP do Paper**
(Plano A do fluxo de sites):

| Arquivo | Como sai do Paper |
|---|---|
| `<pagina>-<largura>.html` | Quadro FINAL → *Copy as CSS/React* (ou Tailwind), colado aqui |
| `<pagina>-<largura>.png` | Quadro FINAL exportado como PNG — a referência que o build é comparado |
| `tokens.css` | Aba Theme → copiar os tokens |

Cada entrega é um commit: o layout a partir do qual o site foi montado sempre pode ser
recuperado. Esta pasta **não é publicada** (está no `exclude` do `_config.yml`).
