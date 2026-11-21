#!/bin/bash
# Render del capítulo por partes: si se corta, al volver a correrlo sigue donde quedó.
# Uso: bash capitulos/01-faro/render.sh   (desde la raíz del repositorio)
set -euo pipefail
OUT=capitulos/01-faro/out/partes; mkdir -p "$OUT"
TOTAL=$(python3 -c "import json;print(json.load(open('src/videos/tambo-01/capitulo.json'))['cuadros'])")
PASO=1200; i=0; a=0
while [ "$a" -lt "$TOTAL" ]; do
  b=$((a + PASO - 1)); [ "$b" -ge "$TOTAL" ] && b=$((TOTAL - 1))
  f=$(printf "%s/p_%02d.mp4" "$OUT" "$i")
  if [ ! -s "$f" ]; then
    echo "parte $i: cuadros $a-$b $(date +%H:%M:%S)"
    npx remotion render src/index.ts FaroCap1 "$f.tmp.mp4" --frames="$a-$b" --muted --codec h264 --crf 17 --concurrency 4 --log=error
    mv "$f.tmp.mp4" "$f"
  fi
  a=$((b + 1)); i=$((i + 1))
done
ls "$OUT"/p_*.mp4 | sed "s/^/file '/;s/$/'/" | sed "s#capitulos/01-faro/out/partes/##" > "$OUT/lista.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/lista.txt" -c copy capitulos/01-faro/out/video_mudo.mp4
echo "LISTO $(date +%H:%M:%S)"
