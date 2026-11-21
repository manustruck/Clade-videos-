# 1. Captar y mantener la atención

La regla madre: **el cerebro no soporta una pregunta abierta** (efecto Zeigarnik, teoría del «hueco de información» de Loewenstein). Cada técnica de esta página abre, estira o cierra una pregunta. Un capítulo profesional siempre tiene **al menos una pregunta abierta en pantalla**, y la principal se cierra en el último 20 % del video.

> Fuentes: guías de práctica de retención en video corto ([Clipchamp](https://clipchamp.com/en/blog/boost-video-watch-time-open-loops), [OpusClip](https://www.opus.pro/blog/youtube-shorts-hook-formulas), [Social Media Examiner](https://www.socialmediaexaminer.com/youtube-shorts-hooks-and-curiosity-loops-that-explode-your-views/), [CapCut](https://www.capcut.com/create/cliffhanger-endings-short-form-video-series), [Cursa](https://cursa.app/en/page/swipe-stopping-narrative-structures-for-short-form)). Ojo: las cifras de esos blogs (p. ej. «+47 % de retención») no traen estudios detrás; aquí se usan los principios, no los números.

| Técnica | Qué es | Cuándo usarla | Cómo se escribe | En el motor |
|---|---|---|---|---|
| **Curiosity gap** (hueco de curiosidad) | Mostrar que existe una respuesta sin darla | Siempre en el hook (0–3 s) | «¿Sabías que la Biblia le pone fecha de vencimiento al enojo?» Una sola pregunta, concreta, sorprendente y verdadera | Palabra clave en `*caja*`, cifra en pastilla en el cuadro 1 |
| **Open loop** (bucle abierto) | Prometer algo que llega después | En el minuto medio, para que no se vayan | «…y lo que encontraron dentro de la caja cambió todo. Pero antes…» | Plano corto que **adelanta** la imagen del final (flash de 0,6 s con `tr: corte`) |
| **Bucles apilados** | Abrir el segundo bucle **antes** de cerrar el primero | Videos de más de 45 s | Responder la pregunta 1 y en la misma frase abrir la 2: «Sobrevivió. Pero lo que hizo dos años después fue más difícil.» | — |
| **Pattern interrupt** (romper el patrón) | Un cambio brusco que rompe el piloto automático | Cada 4–6 s, y siempre en el segundo 3 | Cambiar de ritmo: frase muy corta tras una larga; pregunta directa al espectador; dato numérico | `tr: corte` o `match`, `trueno`, `revelar`, cambio de plano a `centro` (primer plano), silencio súbito (`silencio: true`) |
| **Ticking clock** (reloj que corre) | Un límite de tiempo que pone presión | Historias con espera, plazo o cuenta atrás (Jonás: 40 días; Ezequías: 15 años; el cónclave: 3 años) | Decir el plazo pronto y recordarlo: «Le quedaban tres días.» | `reloj: {"seg": 10, "en": "tres"}` + tic-tac automático; `latido: true` para la recta final |
| **Cliffhanger** | Cortar justo antes de la respuesta | Final de cada capítulo de una **serie**, y a mitad de video («pero entonces…») | Terminar en la pregunta, no en la respuesta: «Y cuando abrió la carta, reconoció la letra.» | Plano `cierre` con `proximo: "Capítulo 2: …"` → empuja a seguir |
| **Hook en frío** | Empezar en el momento más fuerte | Siempre que la historia tenga un clímax visual | Ver «In medias res» en `5_NARRATIVA.md` | `tr: corte` en el plano 0, sin introducción |

## Reglas de oro
1. **Los primeros 2 segundos:** imagen ya en movimiento + una frase que abra la pregunta. Nada de saludos.
2. **Una pregunta principal por video.** Varias preguntas a la vez se sienten confusas; una se siente urgente.
3. **Respuesta + nueva pregunta:** cada bloque de 8–12 s cierra algo pequeño y abre algo más grande.
4. **Cambio visual cada 4–6 s** como mínimo (el motor ya mueve la cámara siempre; esto es un cambio de *plano*).
5. **La pregunta principal se responde en el último 20 %**, y el final la retoma para cerrar el círculo (ver narrativa circular).
6. **Honestidad:** el hook promete algo que el video cumple. Un hook engañoso trae comentarios negativos y en este nicho destruye la confianza.

## Fórmulas de hook para el canal (estructura, no textos para copiar)
- **¿Sabías que + hecho verificable sorprendente?**
- **Paradoja:** «Si Dios es amor, ¿por qué…?»
- **Advertencia en segunda persona:** «Si haces esto cuando estás enojado, la Biblia dice que ya perdiste.»
- **Número concreto:** «1.006 días encerrados…»
- **Final primero:** «Le dispararon cuatro veces. Y él fue a visitarlo a la cárcel.»
- **Promesa práctica:** «Tres palabras de Jesús contra la ansiedad.»
