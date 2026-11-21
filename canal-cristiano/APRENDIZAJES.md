# Todo lo aprendido haciendo videos con Python

Recuperado de la sesión del 13 de noviembre de 2026 («Configurar Blender y MCP para videos»), donde se hicieron 4 videos:

| # | Video | Cómo se hizo | Resultado |
|---|---|---|---|
| 1 | «¿Vivimos en una simulación?» | Blender 3D (túnel neón), 90 s, 24 fps | 70 MB, ~1 h de render. Muy pesado para el celular |
| 2 | «El cliente de las 3:00 AM» | Motor 2D en Python (skia), 120 s | 19,5 MB, ~1 h de render en un proceso |
| 3 | «Pedido para el 404» | Mismo motor 2D, render en 3 procesos | 16,6 MB, mucho más rápido |
| 4 | «El grupo del edificio» | Motor 2D v2: cámara en movimiento, luces, subtítulos grandes | 16,8 MB, 1:13. El mejor de los cuatro |

Después se hizo un flyer de Facebook (1080×1350) con los mismos dibujos del video y su texto para publicar.

---

## 1. La receta que funciona (motor 2D, video 4)

Todo se hace con código en tu PC, sin generadores de video con IA:

```
guion.json  →  narrar.py  →  motor.py (dibuja)  →  render.py (video)  →  audio.py (sonido)  →  ffmpeg (une)
```

1. **`guion.json`**: una lista de planos. Cada plano dice qué escena se dibuja (`s`), la etiqueta de hora y lugar (`pill`), la transición (`tr`: `cut`, `left`, `up`, `zoom`), el movimiento de cámara (`cam`: zoom `z`, desplazamiento `x`/`y`, giro `r`, cada uno `[inicio, fin]`) y el texto de la voz (`n`).
   - En el texto, `*palabra*` = palabra clave (amarilla) y `_palabra_` = palabra de peligro (roja). Los símbolos no se leen.
2. **`narrar.py`**: genera la voz de cada plano con **edge-tts** y guarda los tiempos de **cada palabra** (`voz/NN.mp3` y `voz/NN.json`). Todo se sincroniza con esos tiempos: subtítulos, efectos y cortes.
   - Voz usada: `es-MX-JorgeNeural` a `+25%` → unas 3 palabras por segundo.
   - Otras voces: `es-MX-DaliaNeural` (mujer), `es-CO-GonzaloNeural`.
   - Reintenta solo si falla la conexión.
3. **`motor.py`**: dibuja cada cuadro con **skia** (1080×1920, 30 fps). Para revisar antes de hacer el video completo:
   - `python motor.py hoja mitad` → una imagen con todos los planos
   - `python motor.py cuadro 37.5` → un cuadro suelto
   - `python motor.py tira 12.0 3.0` → 12 cuadros seguidos para ver el movimiento
   - También escribe `timeline.json` con los tiempos de cada evento para el sonido.
4. **`render.py 3`**: reparte los cuadros en 3 procesos, cada uno manda sus cuadros a ffmpeg (H.264, crf 17) y al final une las partes. En tu PC eso bajó el render de ~1 h a mucho menos.
5. **`audio.py`**: arma `audio.wav` con la voz, música sintetizada con numpy y efectos (47 en el video 4) que caen en el cuadro exacto gracias a `timeline.json`.
6. **Unir**: `ffmpeg -i imagen.mp4 -i audio.wav -c:v copy -c:a aac -shortest final.mp4`.

`base.py` tiene las funciones de dibujo compartidas: colores, rectángulos redondeados, círculos, degradados, texto, ajuste de líneas, suavizados (`ease`, `bounce`), parpadeo y gotas.

> El `motor.py` recuperado es la primera versión del video 4. Después se le hicieron arreglos a mano (encuadre del chat, ventana del 7B, escaleras muy oscuras) que no quedaron guardados en el historial. Funciona: lo probé y dibujó los 22 planos.

---

## 2. Reglas de retención (lo que corrigió cada video)

**Enganche**
- **Los primeros 2 segundos deciden todo.** El espectador promedio desliza antes del segundo 2 si no ve algo raro. El borrador del video 4 tardaba 9 s en enganchar y hubo que rehacerlo.
- Abre con **la imagen más fuerte**, un golpe de sonido en el cuadro 1 y texto grande. Después «retrocede» y cuenta la historia.
- El hook en segunda persona funciona: «Si te pasa X, no hagas Y».
- **El final empalma con el principio**: si el video se repite, la última frase cae sobre la primera imagen. Eso sube la repetición.
- Final sin «comenta y sígueme».

**Voz**
- **~3 palabras por segundo**, casi sin pausas. Los primeros videos iban a 2,2 y se sentían lentos.
- Frases cortas en presente.
- Hasta +25 % de velocidad Jorge suena natural; más rápido suena apurado.
- Un solo silencio de medio segundo antes del momento más fuerte vale más que diez efectos.

**Cámara**
- **Nunca quieta**: cada plano tiene acercamiento, paneo o descenso continuo.
- Un plano cada 3–5 s.
- Casi sin cortes secos: transiciones deslizando (el teléfono sube y tapa, la cámara se desliza). Corte seco solo en los sustos.
- Horizonte inclinado en los momentos de tensión. Capas con paralaje.

**Personajes**
- Cuerpo entero, también de espaldas; caminan; parpadean; bajan los párpados; las manos hacen cosas.
- No repetir demasiado una misma pantalla: en el borrador, 10 de 24 planos eran el chat y se sentía como leer capturas.

**Subtítulos**
- Grandes, 1 a 3 palabras a la vez, centro-arriba.
- Palabra clave en amarillo con rebote; palabras de peligro en rojo.
- Etiqueta pequeña de «hora · lugar» que cambia en cada plano.

**Luz**
- Una paleta de dos colores (allí: azul petróleo + ámbar) y un tercero reservado para el momento fuerte (rojo).
- Luces desenfocadas flotando al fondo, conos de luz, viñeta oscura.

**Sonido**
- Voz al frente: música unos **7 dB más baja**.
- Golpe en el cuadro 1, barrido en cada transición, un sonido por cada mensaje o acción.
- La música sintetizada cumple como fondo, pero no impresiona. Suena mejor una pista libre de derechos, o poner un audio en tendencia desde la app de TikTok a volumen bajo, que además ayuda al alcance.

**Duración**
- No estirar: el video 4 quedó en 1:13 en vez de 1:24 y estuvo bien. Si quieres que dure más, añade escenas en vez de estirar las que ya tienes.

---

## 3. Forma de trabajar que te funcionó

1. Pides el video → **primero el guion en tabla** (tiempo · qué se ve · voz · texto en pantalla), visto «como espectador promedio».
2. Tú lo apruebas → recién ahí se genera voz e imagen.
3. Revisión con hojas de contacto antes del render completo.
4. Render en segundo plano; mientras tanto se hace el audio.
5. Se revisan capturas del archivo final.
6. Se envía al celular **sin comprimir** (tu celular es de gama alta). El límite de la app para enviar archivos es 30 MB; los videos 2D pesan ~17–20 MB.
7. Aviso honesto: Claude **no puede escuchar el audio**, solo mide niveles y duración. El oído final es tuyo.

---

## 4. Herramientas en tu PC (Windows)

- PC: Windows 10, i7-7500U de 2 núcleos, GeForce MX130, 12 GB RAM → equipo modesto. El 2D con skia es mucho más rápido que Blender.
- Entorno Python: `C:\Users\RACAR\tts\.venv` con **edge-tts**, **skia-python** y **numpy**.
- **ffmpeg** y **uv** instalados con winget (en cada consola nueva hay que refrescar el PATH).
- **Blender 5.3** con el addon MCP oficial (puerto 9876) y el servidor `blender-mcp` en `C:\Users\RACAR\blender-mcp\.venv`. EEVEE rinde ~0,6 cuadros/s a 1080×1920.
- Fuentes: Segoe UI (Windows). En `base.py` dejé un respaldo para que también funcione en Linux o Mac.

---

## 5. Paquete extra: skill «Shorts animados 3D» (Crea con LuisPa)

Está en `skill_shorts_animados/`, sacado de tu repo `Videoviralesyt` (solo código y textos, sin los videos de ejemplo). Es otro camino: caricatura 2D en mundo 3D con three.js + Remotion, o Blender realista. Lo útil para este canal:
- `referencias/BIBLIA_DE_ESTILO.md`: fórmula de guion (gancho → lugar y época → escalada → momento clave → explicación con comparación cotidiana → remate).
- `plantillas/audio/`: música y efectos sintetizados mejores que los nuestros (mezcla a -14 LUFS).
- `herramientas/medir_30fps.py`: mide un video de referencia (cortes, movimiento de cámara, color) con números.
- Regla de oro de esa skill: **las referencias son para el look, nunca para copiar historia, personajes ni guion.**
