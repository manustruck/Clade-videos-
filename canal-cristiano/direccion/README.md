# Manual de dirección del canal

Todo lo que convierte un guion en un capítulo profesional: atención, emoción, voz, cine, narrativa, sonido y dirección de actores. Cada técnica dice **cuándo** usarla y **qué parámetro del motor** (`../motor_fe/`) la hace.

| Archivo | Contenido |
|---|---|
| `1_ATENCION.md` | Curiosity gap, open loop, bucles apilados, pattern interrupt, ticking clock, cliffhanger, fórmulas de hook |
| `2_EMOCION.md` | Contraste emocional, empathy trigger, vulnerabilidad, relatable storytelling, emotional payoff, silencio como emoción, curva emocional |
| `3_VOZ.md` | Voice acting y dirección de voz con edge-tts (y ElevenLabs v3 si se usa), técnicas vocales de atención |
| `4_CINE.md` | Establishing shot, extreme close-up, plano-contraplano, match cut, rack focus, dolly zoom, slow reveal, metáfora visual, montaje, ángulos |
| `5_NARRATIVA.md` | In medias res, tres actos, Save the Cat, narrativa circular, historias anidadas, pistola de Chéjov, pista falsa, apuestas crecientes |
| `6_SONIDO.md` | Capas de sonido, silencio, riser, latido, reloj, reglas de mezcla |
| `7_ACTORES_IA.md` | Dirección de los personajes del motor y prompts para generadores de video con IA |
| `PLANTILLA_CAPITULO.md` | La tabla de guion que se presenta para aprobación, con todas las columnas de dirección |

**Nombres correctos:** *in medias res* (no «inmedias red»), *pistola de Chéjov* (*Chekhov's gun*), *establishing shot*, *visual metaphor*, *escalating stakes*.

---

## Recetas: cómo combinar las técnicas según el capítulo

No se usan todas a la vez. Cada tipo de capítulo tiene su receta; las técnicas marcadas con ★ son obligatorias.

### A. Historia real asombrosa (60–90 s), el formato principal de Un Cristiano Inquieto
| Tramo | Narrativa | Atención | Emoción | Cine | Sonido y voz |
|---|---|---|---|---|---|
| 0–3 s | ★ In medias res | ★ Curiosity gap | Asombro | Plano detalle o `revelar` | Golpe en el cuadro 1; voz `+14%` |
| 3–10 s | Acto 1: quién, dónde | Open loop («pero eso no fue lo más raro») | Empathy trigger (un detalle humano) | ★ Establishing shot | Ambiente del lugar |
| 10–45 s | Acto 2: ★ apuestas crecientes | Pattern interrupt cada 4–6 s; bucles apilados | Contraste | Plano-contraplano, montaje, cifras que suben | `musica` que crece |
| ~40 s | Punto medio: giro | Nueva pregunta | Sorpresa | Match cut o rack focus | Riser (`subida`) |
| 50–58 s | Lo peor | Ticking clock si hay plazo | ★ Vulnerabilidad | Dolly zoom o primer plano; `lluvia`/`trueno` si es una prueba | `latido`; voz `-10%` |
| 58–62 s | — | — | ★ Silencio | Plano sin voz | `silencio: true` |
| 62–72 s | Acto 3: resolución | Se cierra la pregunta principal | ★ Payoff | `tr: "luz"`, cruz, pergamino | Música llena; voz `-14%` en el versículo |
| últimos 5 s | ★ Final circular | Cliffhanger si es serie | Esperanza | Pull back + ★ `cierre` | La mano presiona «Seguir» |

### B. Versículo-remedio (45–60 s): ansiedad, enojo, miedo, perdón
Historia anidada: marco moderno (`noche_ciudad`, personaje `moderno`, `lluvia` suave) → relato bíblico (`pueblo`/`atardecer`) → regla de tres (`contador`) → payoff con `pergamino` → vuelta al marco ya en luz cálida (contraste emocional) → `cierre`.
Obligatorio: ★ relatable storytelling en los primeros 5 s, ★ cita visible, ★ contraste frío → cálido.

### C. Parábola explicativa (60–80 s)
Save the Cat condensado: pregunta-paradoja de hook → historia moderna o simbólica con apuestas crecientes (`cifra` que sube) → pista falsa de expectativa («todos esperaban el castigo…») → giro → metáfora visual (la cruz) → profecía o versículo (`pergamino`) → final circular.

### D. Proverbio del día (25–40 s)
Circular corta: situación cotidiana (2 planos) → proverbio en `pergamino` con `revelar: "luz"` → la misma situación resuelta → `cierre`. Un solo silencio corto antes del proverbio.

### E. Serie por capítulos
Cada capítulo es una receta A con un ★ cliffhanger al final y `proximo: "Capítulo N: título"`. El siguiente empieza con un resumen de 3 s («Antes: …») y abre una nueva pregunta en menos de 5 s.

---

## Lista de control antes de presentar un guion
- [ ] Hook de 2 s con una pregunta concreta y verdadera, y la imagen ya en movimiento
- [ ] Una pregunta principal, respondida en el último 20 %
- [ ] Al menos 3 escalones de apuestas crecientes
- [ ] Un cambio de plano cada 4–6 s; nunca 3 planos iguales seguidos
- [ ] Contraste emocional (frío → cálido) y un solo silencio fuerte
- [ ] Toda pistola de Chéjov plantada se paga
- [ ] Payoff con versículo o revelación, con la cita bíblica y la versión visibles
- [ ] Dirección de voz anotada por plano (intención, energía, `rate`, `pitch`)
- [ ] Sonido anotado (subida, latido, reloj, silencio, clima)
- [ ] Final circular + `cierre` con «Síguenos y compártelo para el próximo capítulo»
- [ ] Datos verificados con fuente; ninguna pista falsa con información falsa
- [ ] `python motor.py <carpeta> movimiento` da 0 tramos quietos
