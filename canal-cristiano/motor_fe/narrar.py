"""Narración con edge-tts y tiempos por palabra. Los *asteriscos* y _guiones_ del guion no se leen.

Uso (desde motor_fe/):
  python narrar.py <carpeta> [voz] [velocidad]   ->  <carpeta>/voz/NN.mp3 y NN.json
  python narrar.py <carpeta> --simular           ->  solo tiempos a 3 palabras/s (para probar sin internet)

Dirección de voz por plano (edge-tts solo permite esto por frase completa, no dentro de una frase):
  "voz": {"rate": "-12%", "pitch": "-4Hz", "volume": "-10%"}
  Para cambiar el tono a mitad de una idea, parte el texto en dos planos.
Planos con "n": "" no llevan voz (montaje, silencio): su duración la da "dur".

Voces sugeridas: es-MX-JorgeNeural, es-ES-AlvaroNeural, es-CO-GonzaloNeural, es-MX-DaliaNeural (mujer).
Las referencias hablan a unas 3 palabras/s con pausas: '+8%' suele dar ese ritmo con Jorge.
"""
import asyncio
import json
import os
import sys

CARPETA = os.path.abspath(sys.argv[1])
SIMULAR = "--simular" in sys.argv
ARGS = [a for a in sys.argv[2:] if not a.startswith("--")]
VOICE = ARGS[0] if len(ARGS) > 0 else "es-MX-JorgeNeural"
RATE = ARGS[1] if len(ARGS) > 1 else "+8%"


def limpio(s):
    return s.replace("*", "").replace("_", "")


def simular(i, text, voz=None):
    words, t = [], 0.0
    vel = 1 + float((voz or {}).get("rate", RATE).replace("%", "")) / 100
    for w in text.split():
        d = (0.12 + 0.045 * len(w)) / vel
        words.append({"t": round(t, 3), "d": round(d, 3), "w": w.strip(".,;:¿?¡!«»")})
        t += d + (0.28 if w[-1] in ".?!:" else 0.12 if w[-1] in ",;" else 0.05)
    with open(os.path.join(CARPETA, "voz", "{:02d}.json".format(i)), "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)
    return words[-1]["t"] + words[-1]["d"], len(words)


async def one(i, text, voz=None):
    import edge_tts
    voz = voz or {}
    com = edge_tts.Communicate(text, voz.get("voice", VOICE), rate=voz.get("rate", RATE), volume=voz.get("volume", "+0%"),
                               pitch=voz.get("pitch", "+0Hz"), boundary="WordBoundary",
                               proxy=os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or None)
    words = []
    with open(os.path.join(CARPETA, "voz", "{:02d}.mp3".format(i)), "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
    with open(os.path.join(CARPETA, "voz", "{:02d}.json".format(i)), "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)
    return words[-1]["t"] + words[-1]["d"], len(words)


async def main():
    with open(os.path.join(CARPETA, "guion.json"), encoding="utf-8") as f:
        planos = json.load(f)["planos"]
    os.makedirs(os.path.join(CARPETA, "voz"), exist_ok=True)
    tot, nw = 0.0, 0
    for i, S in enumerate(planos):
        text = limpio(S.get("n", ""))
        if not text.strip():  # plano sin voz
            with open(os.path.join(CARPETA, "voz", "{:02d}.json".format(i)), "w", encoding="utf-8") as f:
                json.dump([], f)
            mp3 = os.path.join(CARPETA, "voz", "{:02d}.mp3".format(i))
            if os.path.exists(mp3):
                os.remove(mp3)
            continue
        if SIMULAR:
            e, n = simular(i, text, S.get("voz"))
        else:
            for intento in range(6):
                try:
                    e, n = await one(i, text, S.get("voz"))
                    break
                except Exception as ex:
                    print("reintento", i, intento, type(ex).__name__)
                    await asyncio.sleep(3 + 3 * intento)
            else:
                raise SystemExit("no se pudo generar la frase {}".format(i))
        tot += e
        nw += n
    print("frases={} palabras={} voz={:.1f}s ritmo={:.2f} palabras/s{}".format(
        len(planos), nw, tot, nw / max(tot, 0.1), " (SIMULADO)" if SIMULAR else ""))


asyncio.run(main())
