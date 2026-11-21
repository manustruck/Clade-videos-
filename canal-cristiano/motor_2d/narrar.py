"""Narración con edge-tts y tiempos por palabra. Los *asteriscos* del guion marcan palabras clave y no se leen.

Uso:  python narrar.py [voz] [velocidad]     ->  voz/NN.mp3 y voz/NN.json
"""
import asyncio
import json
import os
import sys

import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = sys.argv[1] if len(sys.argv) > 1 else "es-MX-JorgeNeural"
RATE = sys.argv[2] if len(sys.argv) > 2 else "+25%"


async def one(i, text):
    com = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
    words = []
    with open(os.path.join(HERE, "voz", "{:02d}.mp3".format(i)), "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
    with open(os.path.join(HERE, "voz", "{:02d}.json".format(i)), "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False)
    return words[-1]["t"] + words[-1]["d"], len(words)


async def main():
    with open(os.path.join(HERE, "guion.json"), encoding="utf-8") as f:
        guion = json.load(f)
    os.makedirs(os.path.join(HERE, "voz"), exist_ok=True)
    tot, nw = 0.0, 0
    for i, seg in enumerate(guion):
        for intento in range(6):
            try:
                e, n = await one(i, seg["n"].replace("*", ""))
                tot += e
                nw += n
                break
            except Exception as ex:
                print("reintento", i, intento, type(ex).__name__)
                await asyncio.sleep(3 + 3 * intento)
        else:
            raise SystemExit("no se pudo generar la frase {}".format(i))
    print("frases={} palabras={} voz={:.1f}s  ritmo={:.2f} palabras/s".format(len(guion), nw, tot, nw / tot))


asyncio.run(main())
