# Contexto para agentes neste repositório

Site **duminguz.com.br**, feito em Jekyll. **Dono e quem aprova tudo: João Duminguz.**
O agente rascunha e propõe; nada vai ao ar sem a aprovação do João. Leia o
[`README.md`](README.md) para rodar o site e a estrutura de pastas.

O processo do escritório mora no repositório `DigitalOffice` (privado). Este arquivo traz
o essencial para trabalhar **sem precisar abri-lo**.

## Idioma

Tudo em português do Brasil: documentos, commits, comentários. Pastas e arquivos em
`kebab-case`, sem acento.

## Regras

1. **O layout é do João, desenhado no Figma.** O agente não "corrige" alinhamento,
   simetria nem estrutura. Onde o design for ambíguo, **pergunta**. Sugestões vão em lista
   numerada no fim, e o João decide.
2. **Wireframe não segue design system.** É estrutura com o mínimo de visual, em cinza.
   O design system e os componentes vêm depois dele.
3. **Tokens em `css/marca-tokens.css`**, com os mesmos nomes dos estilos e variáveis do
   Figma. Nunca redigitar um valor que já é token.
4. **Toda palavra do site vem de `_data/copy.yml`**, com situação por trecho (`ok`,
   `pick`, `draft`, `missing`). Só `ok` vai à página real. Nunca placeholder nem "em breve"
   no ar.
5. **Nunca arredondar em silêncio** um valor medido. Valor estranho (`23px` onde o resto
   é `24px`) vira pergunta.
6. **Uma seção por vez, commit depois da aprovação.**
7. **Sem binários no commit** (imagens finais, vídeo, fontes de design): ficam no Drive.

## Onde está o contexto

| O quê | Onde |
|---|---|
| Fichas das telas (intenção, comportamento, responsivo) | `fichas/<página>.md` |
| Pendências de revisão, numeradas | `pendencias.yml` |
| PNGs dos frames do Figma, por largura | `figma/<página>-<largura>.png` |
| Tokens | `css/marca-tokens.css` |
| Copy | `_data/copy.yml` |
| Estado da etapa do site | `04-site.md`, no `DigitalOffice` (`2_casa/duminguz/nacional/2026-site/`) |

## Como trabalhar uma pendência

1. Ler `pendencias.yml` e pegar o próximo item com `status: aberta`.
2. Ler a ficha da tela e o PNG da largura citada.
3. Corrigir só aquilo; commit com o número do item na mensagem.
4. Marcar `status: feita` e escrever em `resolucao` o que mudou.

## Armadilhas já conhecidas

- Pasta com acento no Windows quebra o cache do Jekyll: `--disable-disk-cache`.
- Placeholder com `<` e `>` some no navegador: use `[ASSIM]`.
- `assign` no Liquid é global, inclusive em includes: use nomes com prefixo.
- `Gemfile.lock` precisa listar Linux para o build no GitHub Actions.
