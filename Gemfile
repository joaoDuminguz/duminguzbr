# Dependências Ruby do build com Jekyll.
#
# Versões fixas de propósito: as mesmas montam o site na sua máquina e no
# GitHub Actions, então "funcionou aqui" quer dizer alguma coisa.

source "https://rubygems.org"

gem "jekyll", "~> 4.4"

# O Ruby 3 tirou o webrick da biblioteca padrão, e o `jekyll serve` usa ele.
# Sem esta linha a prévia local falha e o build não — cinco minutos confusos.
gem "webrick", "~> 1.8"

# Windows e JRuby não têm o banco de fusos horários, então o `timezone:` do
# _config.yml não teria o que ler sem estes.
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Sem plugins do Jekyll, de propósito. Meta tags, nav e rodapé estão escritos
# nos _includes, onde podem ser lidos.
