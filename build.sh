#!/usr/bin/env sh
# Builds the single-file lab from src/: lab.html (page body, published as the claude.ai Artifact)
# and index.html (the same page wrapped as a standalone document for opening locally or hosting).
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
page = open("src/page.html", encoding="utf-8").read()
data = open("src/data.js", encoding="utf-8").read()
body = page.replace("/*DATA*/", data)
open("lab.html", "w", encoding="utf-8").write(body)
open("index.html", "w", encoding="utf-8").write(
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    '<style>[hidden]{display:none!important}body{margin:0}</style>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n')
PY
echo "Built lab.html and index.html"
