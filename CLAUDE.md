# Clade-videos-

Videos verticales (TikTok, Facebook Reels, YouTube Shorts). El usuario habla español y recibe los videos en el celular, sin comprimir.

- Canal actual: reflexiones cristianas, pasajes bíblicos y Proverbios, **para cristianos en general** (no solo católicos) → `canal-cristiano/`.
- Canal base para el método de réplica de lo viral: Un Cristiano Inquieto → `canal-cristiano/referencias/CANAL_BASE_UN_CRISTIANO_INQUIETO.md`.
- Antes de hacer cualquier video, lee `canal-cristiano/APRENDIZAJES.md`, `canal-cristiano/referencias/ESTILO_REFERENCIAS.md` y `canal-cristiano/RECOMENDACIONES_CANAL.md`.
- Para planear, escribir o producir cualquier capítulo, usa la skill `direccion-capitulo` (`.claude/skills/direccion-capitulo/`), que aplica el manual `canal-cristiano/direccion/`.
- Motor actual: `canal-cristiano/motor_fe/` (ver su README). `motor_2d/` es el motor viejo de terror, solo como referencia.
- Los análisis de videos de referencia van en `canal-cristiano/referencias/` (un .md por video + `ESTILO_REFERENCIAS.md` con lo común). Se copian técnicas, nunca guiones, personajes ni música. Los videos ajenos no se suben al repo.
- Siempre: primero el guion en tabla para que el usuario lo apruebe; después voz, imagen y sonido. Si el usuario dice que aún no, no se escriben guiones.
- Reglas fijas del canal:
  - La imagen nunca se queda quieta: zoom, paneo, formas y partículas moviéndose siempre. Comprobarlo con `python motor.py <carpeta> movimiento` (0 tramos quietos).
  - El final pide **seguir y compartir para el próximo capítulo** (plano `cierre`).
