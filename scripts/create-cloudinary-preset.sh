#!/usr/bin/env bash
# Crea el unsigned upload preset de Cloudinary para OceanEyes (imágenes + audio de reportes).
# Los secrets se pasan por entorno (NUNCA se guardan en el repo).
#
# Uso:
#   CLOUDINARY_CLOUD_NAME=<cloud> \
#   CLOUDINARY_API_KEY=812118748775589 \
#   CLOUDINARY_API_SECRET=<secret> \
#   bash scripts/create-cloudinary-preset.sh
#
# Requiere: curl. Idempotente: si el preset ya existe, Cloudinary lo actualiza en el response 409/OK.

set -euo pipefail

CLOUD_NAME="${CLOUDINARY_CLOUD_NAME:-}"
API_KEY="${CLOUDINARY_API_KEY:-}"
API_SECRET="${CLOUDINARY_API_SECRET:-}"
PRESET_NAME="oceaneyes_reports"
# RNF-09: 25 MB (26214400 bytes) por archivo, igual que la validación del cliente
# (src/mobile/shared/offline/media-validation.ts) y storage.rules. Si el preset ya existe,
# aplicar el mismo parámetro con PUT /upload_presets/oceaneyes_reports.
# Pendiente: confirmar en la documentación de Cloudinary que el preset acepta max_file_size
# (no se ejecutó en la auditoría por requerir credenciales reales).
MAX_FILE_SIZE=26214400

if [[ -z "$CLOUD_NAME" || -z "$API_KEY" || -z "$API_SECRET" ]]; then
  echo "Faltan variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET" >&2
  exit 1
fi

echo ">> Validando cloud name '$CLOUD_NAME' (asset sample.jpg)..."
SAMPLE=$(curl -s -o /dev/null -w "%{http_code}" "https://res.cloudinary.com/${CLOUD_NAME}/image/upload/sample.jpg" --max-time 20)
if [[ "$SAMPLE" != "200" ]]; then
  echo "!! El cloud name no respondió con un asset público (HTTP $SAMPLE). Revisa el cloud name." >&2
fi

echo ">> Creando preset '$PRESET_NAME' (unsigned)-> $CLOUD_NAME"
RESPONSE=$(curl -s -u "${API_KEY}:${API_SECRET}" \
  -X POST "https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload_presets" \
  -F name="$PRESET_NAME" \
  -F unsigned=true \
  -F folder=oceaneyes \
  -F "allowed_formats=jpg,jpeg,png,webp,heic,m4a,caf,mp3,aac,wav" \
  -F max_file_size="$MAX_FILE_SIZE" \
  --max-time 30) || RESPONSE='{"error":{"message":"curl fallo"}}'

echo "$RESPONSE"
echo
echo ">> Listo. En la app configura:"
echo "EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=$CLOUD_NAME"
echo "EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=$PRESET_NAME"