#!/bin/sh
# Aggiorna il numero di versione di site.css / site.js (evita file vecchi in cache) e rigenera le pagine progetto.
cd "$(dirname "$0")/.." || exit 1
V=$(date +%Y%m%d%H%M%S)
sed -i -E "s#assets/site\.(css|js)(\?v=[0-9]+)?#assets/site.\1?v=$V#g" index.html
python3 tools/genera-progetti.py >/dev/null
echo "versione $V"
