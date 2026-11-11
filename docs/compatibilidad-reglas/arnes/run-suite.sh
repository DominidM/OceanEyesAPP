#!/bin/bash
# Uso: run-suite.sh <set> — suite de reglas de fix/cierre-100 (32 tests) contra rules-<set>.
D="$(cd "$(dirname "$0")" && pwd -W)"; SET=$1
cp "$D/rules-$SET/"* "$D/suite/"
B=$(( (RANDOM % 3000) + 30000 ))
mkdir -p "$D/emu-s-$SET"; cp "$D/rules-$SET/"* "$D/emu-s-$SET/"
printf '{ "firestore": { "rules": "firestore.rules" }, "storage": { "rules": "storage.rules" }, "emulators": { "firestore": { "port": %d, "websocketPort": %d }, "storage": { "port": %d }, "ui": { "enabled": false }, "hub": { "port": %d }, "logging": { "port": %d } } }\n' \
  $B $((B+1)) $((B+2)) $((B+3)) $((B+4)) > "$D/emu-s-$SET/firebase.json"
cd "$D/emu-s-$SET" && firebase emulators:exec --only firestore,storage --project demo-oceaneyes \
  "node C:/Users/USER/Documents/Proyectos/OceanEyesAPP/__tests__/node_modules/jest/bin/jest.js --config $D/jest.suite.js --runInBand --verbose"
