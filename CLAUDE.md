# Clade-videos-

Videos verticales (TikTok, Facebook Reels, YouTube Shorts). El usuario habla español y recibe los videos en el celular, sin comprimir.

- Canal: **Fe en Escena** (@cristianonovelas en TikTok; nombre de perfil y logo «Fe en Escena»). Reflexiones cristianas, pasajes bíblicos y Proverbios, **para cristianos en general** (no solo católicos) → `canal-cristiano/`.
- Canal base para el método de réplica de lo viral: Un Cristiano Inquieto → `canal-cristiano/referencias/CANAL_BASE_UN_CRISTIANO_INQUIETO.md`.
- Antes de hacer cualquier video, lee `canal-cristiano/APRENDIZAJES.md`, `canal-cristiano/referencias/ESTILO_REFERENCIAS.md` y `canal-cristiano/RECOMENDACIONES_CANAL.md`.
- Para planear, escribir o producir cualquier capítulo, usa la skill `direccion-capitulo` (`.claude/skills/direccion-capitulo/`), que aplica el manual `canal-cristiano/direccion/`.
- 3 pilares de contenido: `canal-cristiano/PILARES.md`. Cuando el usuario sube videos virales, usa la skill `replicar-viral` (`canal-cristiano/FLUJO_REPLICA.md`): 2 ideas por video, videos de más de 1 minuto, y portada + textos para TikTok, Facebook y YouTube.
- Capítulos en `canal-cristiano/capitulos/capNN_<tema>/` (guion.json, publicacion.md); se producen con `python motor_fe/producir.py <carpeta> 4`.
- Motor actual: `canal-cristiano/motor_fe/` (ver su README). `motor_2d/` es el motor viejo de terror, solo como referencia.
- Los análisis de videos de referencia van en `canal-cristiano/referencias/` (un .md por video + `ESTILO_REFERENCIAS.md` con lo común). Se copian técnicas, nunca guiones, personajes ni música. Los videos ajenos no se suben al repo.
- Siempre: primero el guion en tabla para que el usuario lo apruebe; después voz, imagen y sonido. Si el usuario dice que aún no, no se escriben guiones.
- Reglas fijas del canal:
  - La imagen nunca se queda quieta: zoom, paneo, formas y partículas moviéndose siempre. Comprobarlo con `python motor.py <carpeta> movimiento` (0 tramos quietos).
  - El final pide **seguir y compartir para el próximo capítulo** (plano `cierre`).
- Voz en la nube: edge-tts necesita el proxy; `narrar.py` lo toma solo de HTTPS_PROXY. Ejecutar con `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt`. El entorno «Clade-videos-» permite speech.platform.bing.com.
