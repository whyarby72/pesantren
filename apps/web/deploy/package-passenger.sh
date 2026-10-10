#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .next/standalone/server.js ]; then
  appdir=''
elif [ -f .next/standalone/apps/web/server.js ]; then
  appdir='apps/web/'
else
  echo 'FAIL: Next.js standalone server.js not found. Locations:' >&2
  find .next/standalone -maxdepth 5 -name server.js -print >&2 || true
  exit 1
fi
rm -rf .passenger-dist
mkdir -p ".passenger-dist/${appdir}.next/static"
cp -a .next/standalone/. .passenger-dist/
cp -a .next/static/. ".passenger-dist/${appdir}.next/static/"
if [ -d public ]; then
  mkdir -p ".passenger-dist/${appdir}public"
  cp -a public/. ".passenger-dist/${appdir}public/"
fi
cp deploy/app.js .passenger-dist/app.js
cp deploy/README_DEPLOY.txt .passenger-dist/README_DEPLOY.txt
(cd .passenger-dist && zip -q -r ../imtaq-passenger.zip .)
sha256sum imtaq-passenger.zip
unzip -l imtaq-passenger.zip | tail -n 1
