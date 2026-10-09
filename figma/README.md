# figma — os frames, como o agente os lê

Aqui ficam os **PNGs 1x** exportados dos frames `FINAL – <página> – <largura>` do Figma,
e os infográficos de animação. **Quem exporta é o João.** O agente não depende do
conector do Figma (o plano grátis tem poucas chamadas por mês).

## Nome do arquivo

`<página>-<largura>.png` — por exemplo `inicio-1440.png`, `inicio-390.png`.
Animação: `<página>-<seção>-animacao.png`.

## Convenções no Figma

- Frames: `FINAL – <página> – 1440` e `– 390` (e `– 768` quando houver).
- Camadas que importam com nome: `header`, `hero`, `portao`, `card`, `rodape`.
- Cor, tipo e espaço como estilos/variáveis, com o **nome igual** ao do token em
  `css/marca-tokens.css`.

## Peso

PNG só dos frames que valem como referência. Imagens finais do site e arquivos pesados
vão para o Drive, nunca para o commit. Esta pasta **não é publicada** (começar o
nome do arquivo por `_` ou excluir no `_config.yml` ao aprovar).
