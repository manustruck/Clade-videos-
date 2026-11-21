#!/bin/bash
# Render de los capítulos 19, 20 y 21: video mudo con Remotion, mezcla de sonido, unión con ffmpeg y flyer + textos.
# Uso (desde la raíz del repositorio): bash canal-ingles/render_19_21.sh
set -e
uno() { comp=$1; dir=canal-ingles/$2; nombre=$3; seg=$4
  mkdir -p $dir/out $dir/publicar
  [ -f $dir/out/mudo.mp4 ] || npx remotion render $comp $dir/out/mudo.mp4 --muted --log=error
  python3 $dir/sonido.py
  ffmpeg -v error -y -i $dir/out/mudo.mp4 -i $dir/out/mezcla.wav -map 0:v -map 1:a -c:v copy \
    -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -movflags +faststart -shortest $dir/publicar/$nombre.mp4
  python3 -c "import json; d=json.load(open('$dir/publicacion.json')); d['segundo']=$seg; json.dump(d, open('$dir/publicacion.json','w'), ensure_ascii=False, indent=2)"
  python3 herramientas/flyer_y_textos.py $dir/publicar/$nombre.mp4 $dir/publicacion.json $dir/publicar
  echo "listo $nombre"
}
uno DrainUphill 19-drain drain_runs_uphill 1.0
uno PatioSlope 20-patio patio_floods_house 1.0
uno PostLean 21-post-lean post_is_leaning 1.0
