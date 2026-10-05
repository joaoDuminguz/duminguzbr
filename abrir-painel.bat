@echo off
rem Abre o painel de construção do site em http://127.0.0.1:4000/painel/
cd /d "%~dp0"
start "" http://127.0.0.1:4000/painel/
bundle exec jekyll serve --config _config.yml,_config.painel.yml --disable-disk-cache --livereload
