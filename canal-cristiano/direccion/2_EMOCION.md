# 2. Generar emoción

La atención trae a la gente; **la emoción hace que comparta**. Las emociones de alta activación (asombro, inspiración, tensión, alivio intenso) se comparten más que las tranquilas (investigación de Berger y Milkman sobre lo que se vuelve viral). En este canal la emoción final casi siempre es **esperanza o asombro ante Dios**, y para que pegue hay que pasar antes por su contraste.

| Técnica | Qué es | Cómo se hace en el guion | En imagen y sonido (motor) |
|---|---|---|---|
| **Emotional contrast** (contraste emocional) | Poner juntas dos emociones opuestas para que ambas se sientan más fuertes | Oscuridad → luz; culpa → perdón; ciudad gris de ansiedad → atardecer de paz | Escenario frío (`noche_ciudad`, `lluvia`) → cálido (`atardecer`, `cruz`); `musica: 0.3` → `musica: 1.0`; transición `luz` en el giro |
| **Empathy trigger** (disparador de empatía) | Un detalle humano pequeño y concreto que nos pone en su lugar | No «estaba triste», sino «guardó la carta sin abrir tres años»; nombre, edad, una costumbre | Primer plano (`cam.centro` en la cara, `z` 2,2–2,6); personaje de espaldas o solo en un plano abierto; `pose: "pensar"` |
| **Vulnerability** (vulnerabilidad) | Mostrar la debilidad, la duda o el miedo del protagonista (o del narrador) | «Pedro, el que caminó sobre el agua, empezó a hundirse.» «¿Alguna vez sentiste que Dios no te escucha?» | Voz más lenta y grave (`voz.rate -10%`, `pitch -4Hz`); `musica` baja; plano abierto con el personaje pequeño |
| **Relatable storytelling** (historia con la que te identificas) | Conectar la historia antigua con algo de hoy | Puente moderno: «Como cuando miras el celular a las 3 a. m. y…» | Plano con personaje `moderno` en `noche_ciudad` antes o después del pasaje bíblico |
| **Emotional payoff** (recompensa emocional) | El momento en que todo lo que se cargó se libera | Llega **después** del punto más bajo, con una frase corta y una imagen fuerte | `pre: 0.6` (silencio antes), `subida` (sonido que crece), `tr: "luz"`, `pergamino` con el versículo, `paloma`, rayos de la `cruz` |
| **Silence as emotion** (el silencio como emoción) | Dejar de hablar para que la imagen pese | Una sola vez por video, justo antes o justo después del clímax | Plano sin voz: `"n": "", "dur": 1.2, "silencio": true` o `pre: 0.8`; la música baja a cero; la cámara sigue moviéndose despacio |

## La curva emocional de un capítulo
```
intensidad
   ▲                                   ★ payoff
   │  hook                            ╱
   │   ╲        escalada        ╱╲  ╱
   │    ╲   ╱╲    ╱╲      ╱    ╲╱  silencio
   │     ╲_╱  ╲__╱  ╲____╱ punto más bajo
   └──────────────────────────────────────▶ tiempo
```
- Sube en el hook, baja un poco para contextualizar y escala en olas.
- El **punto más bajo** (todo parece perdido) va hacia el 65–75 %.
- **Silencio**, y luego el **payoff** (esperanza, revelación o versículo).
- Cierre circular + llamada a seguir.

## Cuidados en un canal de fe
- La emoción nace de la **verdad** de la historia: no se inventan lágrimas, milagros ni datos.
- La vulnerabilidad del narrador se usa con mesura; no hay que fingir crisis personales.
- Un tema de ansiedad o depresión puede incluir una línea discreta de «busca también ayuda profesional», como hace una de las referencias.
