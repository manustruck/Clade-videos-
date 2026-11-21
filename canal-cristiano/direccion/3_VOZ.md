# 3. Voz: actuación y dirección vocal

## Qué se puede controlar con nuestra herramienta (edge-tts)
edge-tts **ya no acepta SSML personalizado** (Microsoft lo bloqueó desde la versión 5): solo permite velocidad, tono y volumen, y **para toda la frase** ([edge-tts en PyPI](https://pypi.python.org/pypi/edge-tts), [repositorio](https://github.com/rany2/edge-tts)). Por eso, en este motor **la unidad de actuación es el plano**: para cambiar de emoción, se parte el texto en otro plano con su propia `voz`.

```json
"voz": {"rate": "-10%", "pitch": "-4Hz", "volume": "+0%"}
```

| Intención | rate | pitch | Uso |
|---|---|---|---|
| Narrador base (las referencias) | `+8%` | `+0Hz` | La mayor parte del video (~3 palabras/s) |
| Hook urgente | `+14%` | `+2Hz` | Primera frase |
| Revelación íntima / confesión | `-10%` | `-4Hz` | Vulnerabilidad, primer plano |
| Peso / solemnidad (versículo) | `-14%` | `-6Hz` | Cuando se cita la Escritura |
| Tensión creciente | `+4%` → `+12%` en planos seguidos | `0` → `+3Hz` | Escalada, reloj que corre |
| Susurro (aproximado) | `-12%` | `-2Hz`, `volume -25%` | Secreto, oración |

## Técnicas de voz para captar y mantener la atención
1. **Ataque fuerte:** la primera palabra es un sustantivo o un número, nunca «Bueno» ni «Hoy».
2. **Frases cortas en presente:** «Lo encierran. Pasa un año. Nadie cede.» Cada punto final es una pausa natural.
3. **Variar el largo de las frases:** larga, larga, **corta**. La corta es el golpe (pattern interrupt vocal).
4. **Pausa antes de la palabra clave** (`pre: 0.4` en el plano siguiente o un punto antes de ella).
5. **Palabras clave al final de la frase:** el oído recuerda lo último. «Lo que encontraron fue *un nombre*.»
6. **Preguntas directas** al espectador cada 15–20 s: reactivan la atención.
7. **Cambio de velocidad** en el clímax: primero más rápido (urgencia) y en el payoff más lento.
8. **Ritmo objetivo:** ~3 palabras por segundo en promedio, como las referencias, con 25–40 pausas por minuto.

## Dirección de voz (cómo «dirigir» la narración)
Para cada plano se anota en el guion:
- **Intención:** ¿qué quiere lograr esta frase? (alarmar, consolar, revelar, preguntar).
- **Subtexto:** lo que se siente debajo de lo que se dice («lo dice como quien todavía no lo cree»).
- **Energía del 1 al 5** y su **velocidad** (tabla de arriba).
- **Dónde respira:** la pausa (`pre`) y la palabra que se acentúa (`*clave*`).

## Si algún día se usa una voz con actuación real (ElevenLabs v3)
ElevenLabs v3 acepta **etiquetas de audio** entre corchetes dentro del texto para dirigir emoción y entrega: `[whispers]`, `[sighs]`, `[curious]`, `[crying]`, `[pauses]`, `[hesitates]`, `[shouts]`, que incluso se pueden combinar ([ElevenLabs: audio tags](https://elevenlabs.io/blog/v3-audiotags), [cómo funcionan](https://elevenlabs.io/docs/help-center/product/speech-synthesis/text-to-speech/how-do-audio-tags-work-with-eleven-v3-alpha), [guía de Artlist](https://artlist.io/blog/elevenlabs-audio-tags/)). v3 tampoco usa SSML. Es de pago, y la voz clonada requiere consentimiento. Si se adopta, la columna «dirección de voz» del guion se convierte directamente en etiquetas.

## Elección de la voz
- **Una sola voz para todo el canal** (es la marca). Masculina, serena, grave, de narrador.
- Opciones de edge-tts: `es-MX-JorgeNeural` (la que ya usamos), `es-ES-AlvaroNeural` (España, como Un Cristiano Inquieto), `es-CO-GonzaloNeural`.
- Una voz secundaria solo para **citas o diálogos** (por ejemplo, `es-MX-DaliaNeural` para una mujer de la historia): `"voz": {"voice": "es-MX-DaliaNeural"}`.
