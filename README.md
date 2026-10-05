# duminguzbr — duminguz.com.br

Site feito pelo DigitalOffice. **O projeto mora no escritório**, em
`1_clientes/<cliente>/<projeto>/` (ou `2_casa/<marca>/<projeto>/`): briefing, deck de
copy, referências e o checklist de lançamento. Este repositório guarda só o código.

Base: o modelo `site-jekyll` do escritório (`4_biblioteca/modelos/`). Como o site é
feito: `3_departamentos/estudio/fluxo-de-sites.md`.

---

## Rodar na sua máquina

```bash
bundle install                         # uma vez, e sempre que o Gemfile mudar
bundle exec jekyll serve --livereload  # prévia em http://127.0.0.1:4000
```

| Comando | O que faz |
|---|---|
| `bundle exec jekyll serve --livereload` | Prévia local, remonta ao salvar |
| `bundle exec jekyll build` | Escreve `_site/` uma vez e para |
| `bundle exec jekyll build --trace` | O mesmo, com o erro completo quando o Liquid falha |

**Precisa de** Ruby 3.3. No Windows: `winget install RubyInstallerTeam.RubyWithDevKit.3.3`,
depois `gem install bundler`.

> **Windows com acento no caminho da pasta** (ex.: `C:\Users\João\…`): o cache do
> Jekyll falha ao abrir arquivos. Rode com `--disable-disk-cache`, ou mantenha o projeto
> numa pasta sem acento.

`_site/` é o resultado do build. Não vai para o Git, nunca é editado, e é o que vai ao ar.

---

## O painel de construção — só na sua máquina

Dois cliques em **`abrir-painel.bat`**, ou:

```bash
bundle exec jekyll serve --config _config.yml,_config.painel.yml --disable-disk-cache
```

e abra <http://127.0.0.1:4000/painel/>. **Ele nunca é publicado:** o `_config.yml` o
exclui, e só o `_config.painel.yml` o liga.

| Aba | O que faz |
|---|---|
| **Design system** | A paleta, os papéis de cada cor nos dois registros e a tipografia, lidos de `css/marca-tokens.css`. Botões de copiar o valor, o CSS de cada estilo, e os tokens inteiros para a aba Theme do Paper |
| **Componentes** | Cada seção marcada com `data-componente`, nos wireframes e na proposta visual. **Copiar para o Paper** copia a seção como HTML autossuficiente, **na largura e na altura do aparelho da prévia** — PC para o quadro de 1440 × 900, Celular para o de 390 × 844: estilo calculado embutido, `::before`/`::after` viram elementos, imagens viram `data:` URI. **Baixar HTML** salva o mesmo num arquivo, para conferir no navegador |
| **Copy** | Todo trecho do `copy.yml`, com texto e situação editáveis. A prévia muda na hora. **Nada é gravado sozinho:** *Baixar copy.yml* gera o arquivo inteiro, que substitui `_data/copy.yml` |

À direita, a prévia: wireframe ou site real, em celular (390), tablet (768) ou PC (1440).
**⧉ Abrir em outra aba** abre o visualizador (`/painel/ver/`): o site sozinho na aba, em
tamanho real no PC, e numa moldura de aparelho no celular (390 × 844) e no tablet
(768 × 1024), com botão de girar. As edições do painel chegam lá ao vivo
(`BroadcastChannel`); **Página pura** abre a página sem visualizador e sem edições.

Como a prévia ouve o painel: cada trecho no `/proto/` tem `data-copy="<caminho no
copy.yml>"` (o include `slot.html` escreve isso), e o `proto/ponte.js` aplica o que o
painel manda por `postMessage`.

---

## Como o repositório é organizado

```text
├── _config.yml          configurações e o front matter padrão por pasta
├── Gemfile, Gemfile.lock dependências, com versões fixas (Windows e Linux)
├── _data/
│   ├── copy.yml           TODA palavra do site, cada trecho com uma situação
│   └── contato.yml        e-mail, WhatsApp e redes
├── _includes/           head, nav, rodapé, e mark (a marca de situação da copy)
├── _layouts/            base (o documento) e page (nav + conteúdo + rodapé)
├── index.html           a home real
├── proto/               o wireframe em cinza, com a mesma copy
├── css/                 tokens.css (da aba Theme do Paper) e site.css (a base)
├── img/
├── paper-in/            Job 0: conteúdo que vai para o Paper (não publicado)
└── paper-out/           Job 1: o que volta do Paper (não publicado)
```

### Quatro regras

**1. Underline na frente quer dizer "não publicado".** O Jekyll copia tudo para `_site/`
menos pastas com `_` e arquivos com `.`.

**2. Front matter transforma um arquivo em modelo.** O bloco `--- … ---` no topo carrega
as variáveis da página e faz o Jekyll passar o arquivo pelo Liquid. Sem ele, o arquivo é
copiado como está — por isso `css/` e `img/` não precisam de configuração.

**3. As palavras são dado, não HTML.** Todo texto vem de `_data/copy.yml`, que espelha o
deck de copy do projeto no escritório — **escrito pelo Marketing**. Cada trecho tem uma
situação:

| Situação | Quer dizer | No `/proto/` | Na página real |
|---|---|---|---|
| `ok` | Aprovado pelo cliente | normal | vai ao ar |
| `pick` | Alguém tem que escolher | marcado **ESCOLHER** | não vai |
| `draft` | Rascunho | marcado **RASCUNHO** | não vai |
| `missing` | Sem texto ainda | marcado **FALTANDO** | não aparece nada |

**Uma seção com trecho faltando vai ao ar sem o trecho** — nunca com placeholder, nunca
com "em breve".

**4. O visual vem do layout FINAL no Paper**, nunca é inventado aqui. Valores de cor,
fonte e espaço entram em `css/tokens.css` com os mesmos nomes da aba Theme.

---

## Publicar

**GitHub Pages (padrão):** faça push na `main`. O workflow `jekyll.yml` monta e publica.
Em Settings → Pages, a fonte é **GitHub Actions**. Para domínio próprio, crie um arquivo
`CNAME` com o domínio, e só depois aponte o DNS.

**Servidor do escritório:** use `.github/workflows/deploy-servidor.yml.exemplo` (as
instruções estão no próprio arquivo) e apague o `jekyll.yml`. As credenciais ficam nos
segredos do GitHub, **nunca** num arquivo.

**O domínio é registrado no nome do cliente**, sempre.
