# 6. Diseño sonoro y vocal

El sonido es la mitad de la emoción. Regla del canal: **la voz manda**; todo lo demás la sostiene.

## Capas (de abajo arriba)
1. **Ambiente:** lluvia, viento, iglesia, multitud. Da lugar y realidad.
2. **Música:** pad y piano sintetizados, o `musica.wav` libre de derechos. Baja sola cuando habla la voz (ducking).
3. **Efectos:** barrido en transiciones, campanita en palabras clave, golpe suave en cifras, brillo en pergaminos, trueno, latido y tic-tac.
4. **Voz:** siempre al frente. Volumen final: -14 LUFS (lo ajusta `render.py`).

## Herramientas de diseño sonoro en el guion
| Efecto emocional | Parámetro del plano | Qué suena |
|---|---|---|
| Contraste: tensión → alivio | `musica: 0.3` y después `musica: 1.0` | La música entra con fuerza en el payoff |
| Silencio como emoción | `silencio: true` (o `pre: 0.6`) | La música se apaga con rampa; solo queda el ambiente |
| Anticipación | `subida: "palabra"` | Riser que crece 2,2 s y termina justo en esa palabra |
| Reloj que corre | `reloj: {...}` | Tic-tac alternado cada 0,5 s |
| Miedo o tensión íntima | `latido: true, bpm: 72–100` | Latido grave; la imagen late con él |
| Prueba, caos | `lluvia`, `trueno` | Lluvia continua; trueno con chasquido y retumbo |
| Revelación | `revelar`, `tr: "luz"` | Brillo de campanitas |
| Llamado a seguir | plano `cierre` | Brillo y campana cuando la mano presiona «Seguir» |

## Reglas
- **Un solo silencio fuerte por video.** Si hay muchos, ninguno pesa.
- **El sonido llega 1–3 cuadros antes de la imagen** en los golpes (se percibe más sincronizado).
- **No hay efectos de caricatura** (pops, boings): rompen la solemnidad.
- **No se usa música con derechos.** Una pista en tendencia se pone desde la app a volumen bajo, nunca dentro del archivo.
- **La música sintetizada es un respaldo.** Para más calidad, una pista libre de derechos de piano o cuerdas en `musica.wav`.

## Diseño vocal
Ver `3_VOZ.md`. En resumen: una voz fija; la emoción se dirige plano por plano con `voz.rate` y `voz.pitch`; las pausas con `pre` y con la puntuación; las palabras clave al final de la frase.
