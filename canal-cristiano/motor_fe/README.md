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
| `motor.py` | Tiempos, cámara, transiciones, subtítulos, rótulos y revisión |
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

- `esc`: el escenario. El último plano debe ser `cierre`: muestra el logo, «Síguenos» que pasa a «Siguiendo ✓», «Compártelo» que late y el próximo capítulo.
- `tr`: transición de entrada: `fundido`, `zoom`, `desliz`, `luz`, `negro` o `corte` (solo para el primer plano).
- `cam`: zoom `z`, desplazamiento `x`/`y` y giro `r`, cada uno `[inicio, fin]`. Si falta, se pone uno automático. Aunque pongas el mismo zoom al inicio y al final, el motor siempre agrega movimiento.
- `pers`: personajes. Con `hasta_x` caminan; con `entra` aparecen en ese segundo del plano; también aceptan `espaldas`, `silueta` y `mira`.
- `en`: la palabra de la voz en la que aparece el rótulo.
- En el texto, `*palabra*` lleva caja azul (palabra clave) y `_palabra_` va en rojo (peligro o pecado).
- `pre`: silencio antes del plano (para el momento fuerte).
- Parámetros propios de cada escenario: `lluvia` (noche_ciudad), `hora` y `avanza_hora` (pueblo), `paloma` (cielo), `titulo` y `texto` (pergamino).

## Cómo garantiza el movimiento continuo

1. Cámara con zoom obligatorio en cada plano y una curva que nunca llega a velocidad cero.
2. «Respiración» de cámara (zoom y giro muy leves) en todo el video.
3. Cada escenario tiene algo propio que se mueve: sol, nubes, aves, velas, lluvia, rayos que giran, flores.
4. Partículas y bokeh flotando siempre.
5. Las transiciones siguen moviendo la cámara mientras cruzan.
6. `python motor.py <carpeta> movimiento` lo comprueba: en la prueba de estilo dio **0 tramos quietos** en 1.038 cuadros.

## Tiempos de render

En el servidor de pruebas (4 núcleos): 35 s de video en ~1 minuto. En tu laptop de 2 núcleos, calcula de 3 a 5 veces más.
