# Frutinovelas en 2D con Python (proceso)

> **Motor actual: `motor/vector.py`.** Usa el estilo vector de la referencia: cabeza de fruta con cuerpo con ropa,
> contorno grueso, cámara siempre en movimiento, luces, paralaje y subtítulo de una palabra. Las reglas están en
> `ESTILO.md` y la prueba en `pruebas/estilo/prueba.py`. `motor/fruti.py` es la versión 1 (la del capítulo 1) y se
> conserva solo para ese capítulo. En `vector.py` los actores usan `quien=` con las claves de `ELENCO`
> (`valentina`, `rodrigo`, `pina`, `uva`, `lucho`, `coco`) en vez de `tipo=`.

Ruta de la skill para telenovelas cortas animadas con personajes fruta, sin Remotion ni Blender: todo se dibuja
con **Pillow + numpy** y se arma con **ffmpeg**. Corre igual en Windows, Mac y Linux y no necesita tarjeta gráfica.
Un capítulo de 60 s se renderiza en pocos minutos en una computadora normal.

Lee primero la sección **«Series y novelas: ganchos y cliffhangers»** de `SKILL.md` y la biblia `BIBLIA.md`.

## Carpetas
```
frutinovelas/
  BIBLIA.md                 personajes, mundo, reglas y mapa de la temporada
  motor/fruti.py            el motor 2D: personajes, escenarios, cámara, efectos, subtítulos, render
  motor/sonido_novela.py    música de telenovela y efectos (cuerdas, piano, golpes «dun dun», lluvia)
  temporada1/capNN/
    guion.json              frases, voz de cada frase (voces) y qué personaje habla (quien)
    guion_elevenlabs.md     el mismo guion con etiquetas de emoción para Eleven v3 (opcional)
    voz/                    voz.wav + tiempos.json (salen de herramientas/voz_piper.py o de ElevenLabs)
    cap.py                  la lista de tomas (escena, cámara, actores, efectos y textos)
    sonido.py               dónde cae cada golpe musical
    publicacion.json        título, hashtags y textos por red
    render.sh               todo de corrido
```

## Paso a paso de un capítulo
1. **Mapa de la temporada.** Antes del primer capítulo deja escritos los 8 capítulos con su cliffhanger
   (`BIBLIA.md`). Así cada final empuja al siguiente y la serie no se pierde.
2. **Guion** con la fórmula de capítulo de `SKILL.md`: gancho en pleno momento fuerte → «Todo empezó…» →
   humillación → giro → cliffhanger. Lo escribes en `guion.json`:
   `{"frases": [...], "voces": [0 narrador, 1 voz femenina, 2 voz masculina], "quien": [null o la clave del personaje que habla]}`.
3. **Voz.**
   - **Gratis (Piper):** `python3 herramientas/voz_piper.py guion.json voz --modelo narrador.onnx,mujer.onnx,hombre.onnx --vel 1.28,1.12,1.12`.
     Voces con licencia comercial: `es_MX-ald-medium` (narrador, Unlicense), `es_MX-claude-high` (mujer,
     Apache 2.0) y `es_ES-davefx-medium` (hombre, CC0). No uses `es_AR-daniela-high` para monetizar: su licencia
     CC BY-SA obliga a dar crédito y a compartir igual.
   - **ElevenLabs v3 (más actuada):** usa `guion_elevenlabs.md` con etiquetas como `[dramatic]` o `[shocked]`. El
     plan gratis da 10 000 caracteres al mes, unos 5 capítulos.
4. **Tomas** en `cap.py`: una toma por frase o por momento. Cada toma lleva:
   - `escena`: `mercado`, `mansion` o `calle`.
   - `cam`: `[(cx, cy, zoom) inicio, (cx, cy, zoom) fin]`.
   - `actores`: `[{tipo, x, s, emo, pose, mira, entra, desde, z}]`. La emoción y la pose pueden cambiar dentro de la
     toma: `emo=[(0, "sorpresa"), (1.2, "llora")]`.
   - `efectos`: `destello`, `temblor`, `jugo`, `anillo`, `lluvia`, `vineta` y `zoomdrama` (el zoom triple de
     telenovela).
   - `textos`: `logo` (nombre de la serie y del capítulo), `carta` («3 DÍAS ANTES…»), `seguir` (pide seguir),
     `continuara` y texto grande.
   - La boca se mueve sola con el volumen de la voz cuando `quien` es ese personaje, y su nombre aparece arriba de
     los subtítulos.
5. **Revisión rápida con fotos**: `python3 frutinovelas/temporada1/cap01/cap.py fotos 1 9 22 45.6`. Revisa caras,
   textos que se tapen y encuadres. Las fotos salen en `out/` en segundos.
6. **Sonido** en `sonido.py`: un «dun» grave en el gancho, en cada revelación y en el cliffhanger; destello con
   platillo al revés antes del salto en el tiempo; lluvia en las escenas de calle.
7. **Render completo**: `bash frutinovelas/temporada1/cap01/render.sh` (video, sonido, unión a -14 LUFS, flyer y
   textos en `publicar/`).

## Agregar un personaje o un escenario
- **Personaje nuevo:**
  1. Agrega una entrada en `FRUTAS` con su color, sombra, forma, hojas, nombre, color del nombre, `fem` y extras.
  2. Si la forma es nueva, dibújala en `_cuerpo` y devuelve el centro de la cara.
- **Escenario nuevo:** agrega un `elif nombre == "..."` en `escenario()`. Se dibuja una sola vez al doble de tamaño
  y queda guardado.
- Los personajes se dibujan al doble de tamaño y se reducen para que los bordes salgan suaves. Cada combinación
  de cara se guarda para no dibujarla dos veces.

## Antes de publicar
- **Etiqueta de IA:** TikTok y YouTube piden marcar el contenido hecho con IA cuando es realista. Una animación de
  frutas no lo es, pero si la voz es sintética, márcalo.
- Flyer y textos con `herramientas/flyer_y_textos.py`, como en todos los videos.
