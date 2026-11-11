#!/bin/bash
# Uso: run.sh new|old — emulador (demo-oceaneyes) en puertos libres con las reglas del conjunto indicado.
D="$(cd "$(dirname "$0")" && pwd -W)"; SET=$1
B=$(( (RANDOM % 3000) + 30000 ))
mkdir -p "$D/emu-$SET"; cp "$D/rules-$SET/"* "$D/emu-$SET/"
printf '{ "firestore": { "rules": "firestore.rules" }, "storage": { "rules": "storage.rules" }, "emulators": { "firestore": { "port": %d, "websocketPort": %d }, "storage": { "port": %d }, "ui": { "enabled": false }, "hub": { "port": %d }, "logging": { "port": %d } } }\n' \
  $B $((B+1)) $((B+2)) $((B+3)) $((B+4)) > "$D/emu-$SET/firebase.json"
cd "$D/emu-$SET" && RULESET=$SET firebase emulators:exec --only firestore,storage --project demo-oceaneyes \
  "node C:/Users/USER/Documents/Proyectos/OceanEyesAPP/__tests__/node_modules/jest/bin/jest.js --config $D/jest.branch.js --runInBand"
