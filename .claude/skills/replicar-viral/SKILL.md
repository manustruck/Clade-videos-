---
name: replicar-viral
description: Convierte videos virales que sube el usuario en capítulos propios del canal Fe en Escena - mide y desarma cada video, saca su mecanismo, propone 2 ideas por video (6 por cada 3) repartidas en los 3 pilares (Biblia, misterios de la Biblia y la Iglesia, cosas positivas), y produce el elegido con portada y textos para TikTok, Facebook y YouTube. Úsala cuando el usuario suba videos de referencia, pida ideas a partir de videos virales o pida "hazme un video parecido".
---

# Replicar lo viral (Fe en Escena)

Lee `canal-cristiano/FLUJO_REPLICA.md` y `canal-cristiano/PILARES.md`. Usa también la skill `direccion-capitulo` y, para el desarme, `social-media-skills:viral-reverse-engineering` si está disponible.

## Pasos
1. **Medir** cada video subido: crea un enlace en el scratchpad y corre `canal-cristiano/herramientas/medir_referencia.py` (color, movimiento) y `leer_subtitulos.py` (guion aproximado; instalar `tesseract-ocr-spa` con `OMP_THREAD_LIMIT=1` y 4 procesos como máximo). Mira hojas de contacto: todo el video y los primeros 3 s.
2. **Desarmar:** hook, escenas, animaciones, color, audio y **razón para compartir**. Prueba del mecanismo (qué no se puede quitar). Marca lo no replicable (cuenta enorme, un momento puntual). Guarda en `canal-cristiano/referencias/refN.md` y actualiza `ESTILO_REFERENCIAS.md` si aparece un patrón nuevo. No subas videos ajenos al repo.
3. **6 ideas** (2 por video): tabla de `FLUJO_REPLICA.md`. Temas propios y verificables, al menos uno por pilar, más de 60 s. **Nunca** la misma historia del video original.
4. **Guion** de la idea elegida con la skill `direccion-capitulo` (receta + tabla). Verifica los datos con fuentes (WebSearch) y ponlas en `guion.json` → `fuentes`. Preséntalo para aprobación, salvo que el usuario pida hacerlo directo.
5. **Producir:** `capitulos/capNN_<tema>/guion.json` (con `portada` y `canal.proximo`) → `python canal-cristiano/motor_fe/producir.py <carpeta> 4`. Si hace falta un escenario u objeto nuevo, agrégalo a `escenas.py` u `objetos.py`.
6. **Publicación:** escribe `publicacion.md` con la plantilla (TikTok, Facebook, YouTube, comentario fijado). Envía al celular `final.mp4`, `portada.png` y `publicacion.md`. Haz commit y push (los mp4 no se suben: están en .gitignore).

## Reglas
- Hechos con fuente; las teorías se dicen como teorías. Respeto por todas las iglesias cristianas.
- Más de 1 minuto (monetización de TikTok) y menos de 30 MB para enviarlo al celular.
- El cierre de marca (Seguir con el dedo índice) va siempre; en las series, cliffhanger + «Capítulo N».
