#!/bin/bash
# Arma el capítulo completo: video (motor 2D), sonido, unión, flyer y textos. Uso (desde la raíz): bash frutinovelas/temporada1/cap01/render.sh
set -e
C=frutinovelas/temporada1/cap01
python3 $C/cap.py
python3 $C/sonido.py
mkdir -p $C/publicar
ffmpeg -v error -y -i $C/out/mudo.mp4 -i $C/out/mezcla.wav -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -movflags +faststart -shortest $C/publicar/corazon_de_fresa_cap01.mp4
python3 $C/cap.py portada 1.3
python3 herramientas/flyer_y_textos.py $C/out/portada_01.30.png $C/publicacion.json $C/publicar
