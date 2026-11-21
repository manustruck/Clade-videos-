"""Genera la narración con edge-tts: una frase por archivo en voz2/NN.mp3.

Uso:  python narrar.py [voz] [velocidad]     p. ej.  python narrar.py es-MX-JorgeNeural +0%
"""
import asyncio
import json
import os
import sys

import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = sys.argv[1] if len(sys.argv) > 1 else "es-MX-JorgeNeural"
RATE = sys.argv[2] if len(sys.argv) > 2 else "+0%"


async def main():
    with open(os.path.join(HERE, "guion.json"), encoding="utf-8") as f:
        guion = json.load(f)
    os.makedirs(os.path.join(HERE, "voz2"), exist_ok=True)
    for i, seg in enumerate(guion):
        out = os.path.join(HERE, "voz2", "{:02d}.mp3".format(i))
        await edge_tts.Communicate(seg["n"], VOICE, rate=RATE).save(out)
        print("ok", i)


asyncio.run(main())
