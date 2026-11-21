# 4. Dirección cinematográfica

Cada técnica tiene tres columnas: **para qué sirve**, **cómo hacerla en nuestro motor** (`motor_fe`) y **cómo pedirla a un generador de video con IA** (Veo, Kling), por si algún plano se genera fuera.

> Vocabulario de cámara para IA según guías de Kling y Veo ([Leonardo/Kling](https://www.leonardo.ai/news/kling-ai-prompts/), [Kling: control de cámara](https://kling.ai/blog/kling-ai-camera-control-video-guide?tab=all), [guía Veo 3 en Medium](https://medium.com/@miguelivanov/mastering-veo-3-an-expert-guide-to-optimal-prompt-structure-and-cinematic-camera-control-693d01ae9f8b), [EastonDev: 7 planos en Veo 3](https://eastondev.com/blog/en/posts/ai/20251204-veo3-camera-control/)). Son guías de terceros, no documentación oficial: hay que probar cada prompt.

| Técnica | Para qué sirve | En `motor_fe` (guion.json) | Prompt para IA (en inglés, que es como mejor responden) |
|---|---|---|---|
| **Establishing shot** (plano de ubicación) | Decir dónde y cuándo estamos antes del detalle | Plano abierto: `cam.z` 1,0–1,1, escenario completo, personajes pequeños; con `revelar: "iris"` o `"niebla"` | `Wide establishing shot of an ancient desert village at dawn, slow aerial descent` |
| **Extreme close-up** (plano detalle) | Emoción máxima o un objeto clave (ojos, mano, carta) | `cam.centro` en la cara o el objeto y `cam.z` 2,4–3,2 | `Extreme close-up of an old man's eyes filling with tears, shallow depth of field` |
| **Shot / reverse shot** (plano-contraplano) | Diálogo o confrontación entre dos personas | Dos planos seguidos con `tr: "corte"` y `cam.centro` en cada personaje; `mira` del uno hacia el otro (`0.6` y `-0.6`) | `Over-the-shoulder shot of A facing B` / `Reverse shot of B listening` |
| **Match cut** (corte por coincidencia) | Unir dos tiempos o ideas con una forma igual (la luna → la hostia; la piedra → el corazón) | `tr: "match"` y el **mismo `cam.centro` y `z`** en los dos planos, con el objeto en el mismo lugar del cuadro | `Match cut to …` (los modelos lo respetan poco: mejor hacerlo en edición) |
| **Rack focus** (cambio de foco) | Llevar la mirada de una cosa a otra sin cortar | `foco: {"fondo": {"v": [0, 14], "en": "palabra"}, "frente": {"v": [16, 0], "en": "palabra"}}` | `Rack focus from the foreground hand to the figure in the background` |
| **Dolly zoom** (efecto vértigo) | Shock, revelación terrible, «el mundo se le viene encima» | `vertigo: 0.62` (el fondo se aleja) o `1.4` (se viene encima); el personaje queda del mismo tamaño | `Dolly zoom on a shocked face, background warps, vertigo and tension, 5 seconds` |
| **Slow reveal** (revelación lenta) | Retrasar lo que se ve para crear expectativa | `revelar: "iris" | "cortina" | "niebla" | "luz"` con `revelar_d`; o cámara que sube con `cam.y` y `cam.centro` en movimiento | `Slow tilt up revealing the empty tomb, light pouring out` |
| **Visual metaphor** (metáfora visual) | Una imagen que dice la idea sin palabras | Elegir el elemento: cadena que se rompe = libertad; vela que se apaga = fe que se apaga; tormenta (`lluvia`, `trueno`) = prueba; sol que sale = esperanza | `A single candle flickering in a dark storm, symbolic` |
| **Montage** (montaje) | Comprimir tiempo o acumular ejemplos | Varios planos sin voz: `"n": "", "dur": 0.5–0.8, "tr": "corte"` seguidos, con zoom fuerte, sobre la música | `Fast montage: …` (mejor generar planos sueltos y montarlos) |
| **Push in** (acercamiento) | Intimidad y tensión creciente | `cam.z` de 1,05 a 1,3 | `Slow dolly push in on …` |
| **Pull back** (alejamiento) | Soledad, mostrar la dimensión del lugar, final | `cam.z` de 1,4 a 1,05 | `Slow pull back revealing …` |
| **Low angle / high angle** | Grandeza o poder (contrapicado) / pequeñez o vulnerabilidad (picado) | Personaje grande y `cam.centro` bajo (`y` alto) / personaje `s` 0,6 y cámara arriba | `Low angle shot of …` / `High angle shot looking down on …` |
| **Dutch angle** (horizonte inclinado) | Inquietud y crisis | `cam.r` de -4 a -2 | `Dutch angle, tilted frame` |

## Gramática de planos para un capítulo de 60–90 s
1. **Abrir** con un plano detalle o con el momento más fuerte (in medias res), no con un plano general.
2. **Ubicar** con un plano general en los primeros 8 s.
3. **Alternar** planos generales, medios y cercanos: nunca 3 planos iguales seguidos.
4. Los **diálogos** van en plano-contraplano.
5. El **clímax** se hace con un primer plano o un efecto vértigo, el silencio y luego un plano abierto y luminoso (payoff).
6. **Cerrar** con un alejamiento (pull back) y el plano `cierre`.

## Dirección de arte (lo que se ve en cada plano)
- **Una idea visual por plano.** Si hay dos cosas importantes, van en dos planos.
- **Regla de tercios** con `cam.centro` desplazado; la cara del personaje nunca debe quedar tapada por los subtítulos (franja superior: 15–30 % del alto).
- **El color cuenta la historia:** frío y gris para el problema, ámbar y dorado para Dios, rojo solo para el pecado o el peligro.
- **Un elemento que se mueva siempre**, además de la cámara (lluvia, velas, pasto, aves). El motor ya lo garantiza y se comprueba con `python motor.py <carpeta> movimiento`.
