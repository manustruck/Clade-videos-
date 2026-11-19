#!/bin/bash
# Render de los capítulos 17 y 18: video mudo con Remotion, mezcla de sonido, unión con ffmpeg y flyer + textos.
# Uso (desde la raíz del repositorio): bash canal-ingles/render_17_18.sh
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
uno TreehouseTree 17-treehouse treehouse_killing_tree 2.04
uno RaisedBedBurst 18-raised-bed raised_bed_will_burst 2.01
