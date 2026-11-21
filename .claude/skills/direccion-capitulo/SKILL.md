---
name: direccion-capitulo
description: Dirige un capítulo del canal cristiano como un profesional - hook, curiosity gap, open loops, pattern interrupt, ticking clock, cliffhanger, contraste emocional, vulnerabilidad, payoff, silencio, dirección de voz, planos de cine (match cut, rack focus, dolly zoom, plano-contraplano, slow reveal, montaje), estructuras narrativas (in medias res, tres actos, Save the Cat, circular, anidada, pistola de Chéjov, apuestas crecientes) y diseño sonoro. Úsala siempre que se planee, escriba, revise o produzca un guion o capítulo del canal, o cuando el usuario pida mejorar la calidad, la retención o la emoción de un video.
---

# Dirección de capítulo

El manual completo está en `canal-cristiano/direccion/`. Esta skill dice **cómo usarlo**.

## Proceso
1. **Lee** `canal-cristiano/direccion/README.md` (recetas y lista de control). Abre los archivos 1–7 solo para las técnicas que vas a usar.
2. **Elige la receta** según el tipo de capítulo (A historia real, B versículo-remedio, C parábola, D proverbio, E serie). No uses todas las técnicas: usa las marcadas ★ más las que pida la historia.
3. **Diseña antes de escribir:** pregunta principal, emoción final, punto más bajo, silencio, pistolas de Chéjov (plantar → pagar) y escalones de apuestas.
4. **Escribe el guion en la tabla** de `direccion/PLANTILLA_CAPITULO.md`, con todas las columnas de dirección (voz, sonido, técnica). **Preséntalo al usuario y espera su aprobación.** Si el usuario dijo que todavía no quiere guiones, no los escribas.
5. Con la aprobación, **traduce la tabla a `guion.json`** del motor (`canal-cristiano/motor_fe/README.md`): `voz`, `pre`, `silencio`, `musica`, `subida`, `latido`, `reloj`, `foco`, `vertigo`, `revelar`, `cam.centro`, `tr` (`corte`, `match`, `fundido`, `zoom`, `desliz`, `luz`, `negro`), `lluvia`, `trueno`, `pers` (pose, mira, entra, hasta_x, espaldas, silueta, brillo).
6. **Verifica:** hoja de contacto (`motor.py <carpeta> hoja`), tiras en el hook y el clímax, y `motor.py <carpeta> movimiento` con 0 tramos quietos. Revisa la lista de control del README de dirección.

## Reglas que no se rompen
- Hechos verdaderos y con fuente; la pista falsa solo juega con la expectativa, nunca con los datos.
- Jesús y lo sagrado, siempre con dignidad.
- Un solo silencio fuerte por video. La pregunta principal se cierra en el último 20 %.
- La imagen nunca se queda quieta. El final pide seguir y compartir para el próximo capítulo.
- Se copian técnicas de las referencias, nunca guiones, personajes ni música.
