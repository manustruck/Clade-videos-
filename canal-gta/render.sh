#!/bin/bash
# Render de las 5 partes de THE LEONIDA FILES. Uso (desde la raíz): bash canal-gta/render.sh
set -e
for n in 1 2 3 4 5; do dir=$(ls -d canal-gta/0$n-*); nombre=leonida_files_part$n
  mkdir -p $dir/out $dir/publicar
  [ -f $dir/out/mudo.mp4 ] || npx remotion render Leonida$n $dir/out/mudo.mp4 --muted --log=error
  python3 canal-gta/sonido.py $(basename $dir)
  ffmpeg -v error -y -i $dir/out/mudo.mp4 -i $dir/out/mezcla.wav -map 0:v -map 1:a -c:v copy \
    -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -movflags +faststart -shortest $dir/publicar/$nombre.mp4
  python3 herramientas/flyer_y_textos.py $dir/publicar/$nombre.mp4 $dir/publicacion.json $dir/publicar
  echo "listo $nombre"
done
