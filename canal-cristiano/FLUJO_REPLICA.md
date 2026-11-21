# Flujo de réplica de lo viral: de 3 videos virales a 6 capítulos

Lo que pasa cada vez que subes videos virales de otros canales. Lo ejecuta Claude con la skill `replicar-viral`.

```
Subes 3 videos virales
   │
   ├─ 1. Medir cada uno (color, cámara, cortes, audio, subtítulos)          herramientas/
   ├─ 2. Desarmarlo: hook, por qué se comparte, estructura, qué lo hace funcionar   skill viral-reverse-engineering
   ├─ 3. Sacar el MECANISMO (no el tema) y anotarlo en referencias/
   │
   ├─ 4. 6 IDEAS (2 por video), repartidas en los 3 pilares, todas de más de 1 minuto
   │      → tabla para que elijas
   │
   ├─ 5. Para la idea elegida: guion en tabla con dirección (receta del manual)     skill direccion-capitulo
   │      → lo apruebas
   │
   └─ 6. Producción automática: python producir.py capitulos/<capítulo>
          → final.mp4 + portada.png + portada_16x9.png + publicacion.md (textos para TikTok, Facebook y YouTube)
          → te llega al celular
```

## 1–3. Análisis de cada video subido
- `herramientas/medir_referencia.py` y `herramientas/leer_subtitulos.py` sacan los números y el guion aproximado.
- Se anota en `referencias/refN.md`: hook, escenas, animaciones, color, audio y **razón para compartir**.
- Se aplica la prueba del mecanismo: ¿qué tendría que quitarse para que deje de funcionar? Eso es lo que se replica.
- Se marca si el éxito parece **no replicable** (cuenta enorme, un momento puntual, suerte).

## 4. Las 6 ideas (tabla para elegir)
| # | Video de origen | Mecanismo que se toma | Pilar | Tema propio (verificable) | Hook (borrador) | Duración | Receta |
|---|---|---|---|---|---|---|---|

Reglas: **2 ideas por video**, nunca el mismo tema ni la misma historia del video original; al menos una idea por pilar; más de 60 s; los datos se verifican con fuente antes del guion.

## 5. Guion
Tabla de `direccion/PLANTILLA_CAPITULO.md`, siguiendo la receta del tipo de capítulo y la lista de control del manual. Se presenta antes de producir; si pediste que se haga directo, se produce y la tabla va junto al video.

## 6. Producción y publicación
- `python producir.py capitulos/<capítulo> 3` (en la nube de Claude, con 4 procesos).
- Se revisan la hoja de contacto, el hook y el clímax, y se comprueba que haya 0 tramos quietos y que pese menos de 30 MB.
- `publicacion.md` (plantilla abajo) con los textos para las 3 plataformas.

## Plantilla de `publicacion.md`
```
# <Título del capítulo>
## TikTok
Texto (primera línea = hook, 1–3 líneas, pregunta para comentar) + 3–5 hashtags
## Facebook (Reels)
Texto más largo (3–5 líneas, el contexto y la pregunta), sin repetir el final + 3 hashtags
## YouTube Shorts
Título (máx. 70 caracteres, con la palabra clave al inicio) · Descripción (2–3 líneas + fuentes) · Etiquetas
## Comentario fijado
La fuente del dato + una pregunta
## Portada
portada.png (vertical) · portada_16x9.png (YouTube)
```
