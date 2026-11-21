# 7. Dirección de actores IA

«Actores» aquí son los personajes del motor (`personajes.py`) y, si algún día se usan, los personajes de un generador de video con IA.

## En nuestro motor
Cada personaje recibe dirección como un actor:

| Indicación | Parámetro | Ejemplo de intención |
|---|---|---|
| Postura / gesto | `pose`: `abajo`, `orar`, `senalar`, `levantar`, `bendecir`, `abrazar`, `pensar`, `cargar` | `orar` en la vulnerabilidad, `levantar` en la victoria, `senalar` al revelar |
| Mirada | `mira`: -1 (izquierda) a 1 (derecha) | En el plano-contraplano se miran entre sí |
| Entrada en escena | `entra`: segundo del plano | Aparece justo en su palabra |
| Desplazamiento | `x` → `hasta_x` (camina) | Llegar, irse, acercarse a alguien |
| De espaldas | `espaldas: true` | Soledad, misterio, el que se va |
| Silueta | `silueta: true` | Antagonista, pasado, alguien sin identificar |
| Presencia divina | `brillo`: 0–1 | Jesús o un momento de gracia |
| Tamaño / distancia | `s` | Pequeño = vulnerable; grande = cercanía |

**Siempre están vivos:** respiran, parpadean y se balancean, aunque no tengan acción.

## Reglas de dirección
1. **Cada personaje quiere algo en cada plano.** Si no lo sabes, el plano no hace falta.
2. **Reacción antes que acción:** el primer plano de quien escucha suele contar más que el de quien habla.
3. **La mirada guía al espectador:** el personaje mira hacia lo que debemos ver después.
4. **Jesús y los personajes sagrados se dirigen con dignidad:** gestos amplios y serenos, nunca cómicos; luz propia (`brillo`).
5. **Continuidad:** el mismo personaje mantiene el tipo y los colores durante todo el capítulo y la serie.

## Si se genera un plano con IA (Veo, Kling)
Estructura de prompt recomendada por las guías: **plano y cámara → personaje → acción → ambiente y luz → estilo → audio**. Conviene usar verbos de cámara concretos («dolly push», «whip pan») en lugar de «se mueve» ([Leonardo/Kling](https://www.leonardo.ai/news/kling-ai-prompts/), [Kling: cámara](https://kling.ai/blog/ai-camera-control-movement-prompts-guide)).

Plantilla:
```
[Shot type + camera move + duration]. [Character: age, clothing, consistent description].
[Action + emotion as physical behavior, e.g. "his hands tremble as he unfolds the letter"].
[Setting + light: golden hour / candlelight / storm]. Flat 2D vector illustration, soft gradients,
no outlines, warm dark palette, film grain. [Audio if supported: soft rain, distant thunder].
```

**Dirección de actuación para IA:** describir la emoción **como conducta física** (manos que tiemblan, mirada que baja, respiración agitada), no como palabra («triste»). Mantener una **descripción fija del personaje** copiada igual en cada plano para que sea consistente. Representar a Jesús con respeto y sin rasgos caricaturescos, y revisar cada plano antes de usarlo.
