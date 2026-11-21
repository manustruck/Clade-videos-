# Motor del canal de fe (`motor_fe/`)

El motor que dibuja los videos con el estilo de las referencias (ver `../referencias/ESTILO_REFERENCIAS.md`):
dibujo plano con degradados y sin contornos, fondos oscuros y cálidos, haces de luz, partículas,
subtítulos karaoke en letra Poppins y **la imagen siempre en movimiento**.

Reemplaza al motor de terror (`../motor_2d/`), que queda solo como referencia.

## Pasos para un video

Desde esta carpeta (`motor_fe/`), con el Python que tiene `skia-python`, `numpy` y `edge-tts`:

```bash
python narrar.py mi_video                 # voz + tiempos por palabra (Jorge, +8 %)
python motor.py mi_video hoja             # un cuadro por plano para revisar
python motor.py mi_video movimiento       # comprueba que no haya tramos quietos
python audio.py mi_video                  # música, efectos y voz -> audio.wav
python render.py mi_video 3               # video en 3 procesos -> final.mp4 a -14 LUFS
```

Sin internet: `python narrar.py mi_video --simular` crea tiempos falsos para probar la imagen.

## Archivos

| Archivo | Qué hace |
|---|---|
| `estilo.py` | Paleta, letras, degradados, haces de luz, partículas, bokeh, viñeta, caja de palabra clave, pastilla de cifra, pergamino, cita, contador 1-2-3 |
| `personajes.py` | Personajes planos: `jesus`, `biblico`, `biblica`, `moderno`, `moderna`, `nino`. Poses: `abajo`, `orar`, `senalar`, `levantar`, `bendecir`, `abrazar`, `pensar`, `cargar`. Respiran, parpadean y caminan. También `ave` y `paloma` |
| `escenas.py` | Escenarios: `atardecer`, `noche_ciudad`, `pueblo`, `cuarto_vela`, `cruz`, `cielo`, `pergamino`, `cierre` |
| `texturas.py` | Grano de película, textura de papel, tela, piedra, pasto que se mece, lluvia con salpicaduras, rayos con doble destello y la mano de Cristo que presiona «Seguir» |
| `motor.py` | Tiempos, cámara, transiciones, clima, subtítulos, rótulos y revisión |
| `narrar.py` / `audio.py` / `render.py` | Voz, sonido y video final |
| `canal.json` | Nombre, iniciales y frase de «próximo capítulo» para el cierre (se cambia cuando haya nombre) |
| `fuentes/` | Poppins y Cormorant Garamond (licencia OFL, libres) |
| `prueba_estilo/` | Prueba de 35 s con todos los escenarios y efectos (no es un guion del canal) |

## El guion (`<carpeta>/guion.json`)

```json
{"canal": {"proximo": "Capítulo 2 muy pronto"},
 "planos": [
  {"esc": "atardecer", "tr": "fundido", "cam": {"z": [1.05, 1.2], "x": [0, -40], "y": [0, 0], "r": [0, 1]},
   "pers": [{"tipo": "jesus", "x": 540, "y": 1470, "pose": "bendecir", "brillo": 0.6}],
   "cita": "Proverbios 3:5",
   "pergamino": {"titulo": "Proverbios 3:5", "texto": "...", "en": "Fíate"},
   "cifra": {"num": "2000", "uni": "años", "en": "dos"},
   "contador": {"n": 3, "en": ["uno", "dos", "tres"]},
   "pre": 0.5,
   "n": "Texto de la voz con *palabra clave* y _peligro_."}
 ]}
```

- `esc`: el escenario. El último plano debe ser `cierre`: muestra el logo; la mano de Cristo entra desde la luz y presiona «Síguenos», que pasa a «Siguiendo ✓» con un anillo de luz; luego «Compártelo» late y aparece el próximo capítulo.
- `tr`: transición de entrada: `fundido`, `zoom`, `desliz`, `luz`, `negro` o `corte` (solo para el primer plano).
- `cam`: zoom `z`, desplazamiento `x`/`y` y giro `r`, cada uno `[inicio, fin]`. Si falta, se pone uno automático. Aunque pongas el mismo zoom al inicio y al final, el motor siempre agrega movimiento.
- `pers`: personajes. Con `hasta_x` caminan; con `entra` aparecen en ese segundo del plano; también aceptan `espaldas`, `silueta` y `mira`.
- `en`: la palabra de la voz en la que aparece el rótulo.
- En el texto, `*palabra*` lleva caja azul (palabra clave) y `_palabra_` va en rojo (peligro o pecado).
- `pre`: silencio antes del plano (para el momento fuerte).
- `lluvia`: intensidad (`1.0` normal, `0.5` llovizna), en cualquier escenario. Suena como lluvia continua.
- `trueno`: lista de palabras (o segundos del plano) donde cae un rayo: rayo detrás del paisaje, doble destello, sacudida de cámara y sonido de trueno. `trueno_x` fija dónde cae.
- Parámetros propios de cada escenario: `lluvia` (noche_ciudad), `hora` y `avanza_hora` (pueblo), `paloma` (cielo), `titulo` y `texto` (pergamino).

## Parámetros de dirección (ver `../direccion/`)

| Parámetro del plano | Técnica | Ejemplo |
|---|---|---|
| `cam.centro` | Primer plano, plano detalle, plano-contraplano, reencuadre | `"cam": {"z": [2.3, 2.45], "centro": [380, 1040]}` o `[[x0, y0], [x1, y1]]` para desplazarse |
| `tr: "corte"` / `"match"` | Corte seco / match cut (mismo `centro` y `z` en los dos planos) | `"tr": "match"` |
| `foco` | Rack focus (desenfoque por capas: fondo y personajes) | `"foco": {"fondo": {"v": [0, 14], "en": "ahora"}, "frente": {"v": [16, 0], "en": "ahora"}}` |
| `vertigo` | Dolly zoom: el personaje queda igual y el fondo se aleja (<1) o se viene encima (>1) | `"vertigo": 0.62` |
| `revelar` | Slow reveal: `iris`, `cortina`, `niebla`, `luz` | `"revelar": "iris", "revelar_d": 1.4` |
| `"n": "", "dur": 0.6` | Plano sin voz: montaje rápido o silencio | varios seguidos con `tr: "corte"` |
| `silencio: true` | Silencio como emoción (la música se apaga) | con `"n": ""` y `dur` 1–2 s |
| `musica: 0.3` | Nivel de música del plano (contraste emocional) | 0 a 1 |
| `subida: "palabra"` | Riser que termina en esa palabra | `"subida": "vértigo"` |
| `latido: true, bpm: 80` | Latido sonoro y la imagen que late | tensión íntima |
| `reloj: {"seg": 10, "en": "tres", "x": 170, "y": 560}` | Ticking clock en pantalla con tic-tac | plazos y cuentas atrás |
| `voz: {"rate", "pitch", "volume", "voice"}` | Dirección de voz por plano | `{"rate": "-10%", "pitch": "-4Hz"}` |

La prueba `prueba_direccion/` muestra cada una (texto de relleno, no es un guion).

## Texturas y relleno

- Toda la imagen lleva **textura de papel** y **grano de película** (el grano cambia en cada cuadro). La fuerza del grano está en `canal.json` (`grano`, 0,05 por defecto: más grano = archivo más pesado).
- **Ropa:** trama de tela, sombra del lado contrario a la luz, pliegues que se mueven al respirar y **desgaste de uso diario** (polvo en el borde, manchas, dobladillo deshilachado y remiendo cosido en los personajes bíblicos).
- **Personajes:** sombra en la cara, sombra larga proyectada en el suelo y sombra de contacto.
- **Paredes, suelo y madera** con textura de piedra o veta. **Pasto** de verdad (hojas que se mecen, más grandes y oscuras adelante) y pasto seco en el pueblo y en la cruz.

## Cómo garantiza el movimiento continuo

1. Cámara con zoom obligatorio en cada plano y una curva que nunca llega a velocidad cero.
2. «Respiración» de cámara (zoom y giro muy leves) en todo el video.
3. Cada escenario tiene algo propio que se mueve: sol, nubes, aves, velas, lluvia, rayos que giran, flores.
4. Partículas y bokeh flotando siempre.
5. Las transiciones siguen moviendo la cámara mientras cruzan.
6. `python motor.py <carpeta> movimiento` lo comprueba: en la prueba de estilo dio **0 tramos quietos** en 1.038 cuadros.

## Tiempos de render y peso

En el servidor de pruebas (4 núcleos): 35 s de video en ~2 minutos (las texturas lo hicieron más lento). En tu laptop de 2 núcleos, calcula de 3 a 5 veces más.

Peso: ~15 MB por cada 35 s (calidad crf 19). Un video de 70 s quedará cerca de 30 MB, que es el límite para enviarlo al celular desde la app; si se pasa, baja `grano` a 0,03.
