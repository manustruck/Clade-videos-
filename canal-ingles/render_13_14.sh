#!/bin/bash
# Render de los capítulos 13 y 14: video mudo con Remotion, mezcla de sonido, unión con ffmpeg y flyer + textos.
# Uso (desde la raíz del repositorio): bash canal-ingles/render_13_14.sh
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
uno DeckRailing 13-railing deck_railing_wont_hold 1.45
uno LadderAngle 14-ladder ladder_angle_wrong 2.3
