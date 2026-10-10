#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
root="$PWD"
[ -f .next/standalone/server.js ] || { echo 'FAIL: standalone server.js missing; run npm run build' >&2; exit 1; }
rm -rf .passenger-dist
mkdir -p .passenger-dist/.next/static
cp -a .next/standalone/. .passenger-dist/
cp -a .next/static/. .passenger-dist/.next/static/
if [ -d public ]; then cp -a public .passenger-dist/public; fi
cp deploy/app.js .passenger-dist/app.js
cp deploy/README_DEPLOY.txt .passenger-dist/README_DEPLOY.txt
(cd .passenger-dist && zip -q -r ../imtaq-passenger.zip .)
sha256sum imtaq-passenger.zip
unzip -l imtaq-passenger.zip | tail -n 1
