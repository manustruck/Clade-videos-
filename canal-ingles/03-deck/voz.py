"""Voz en inglés con Piper (gratis, sin conexión), frase por frase: así los tiempos de la escena son exactos.
Uso: python3 canal-ingles/03-deck/voz.py MODELO.onnx [velocidad]  -> voz/voz.wav y tiempos.json
"""
import json, os, sys
import numpy as np, soundfile as sf
from piper import PiperVoice, SynthesisConfig
AQUI = os.path.dirname(os.path.abspath(__file__))
FRASES = [
    "Your deck is going to pull away from your house!",
    "Surprise!",
    "You nailed a board to the wall, and built the whole deck on it.",
    "Looks solid, right?",
    "Then the party starts.",
    "Friends, burgers, a cooler full of drinks.",
    "Every step pulls on those nails.",
    "And rain sneaks behind the board, and rots the wood.",
    "One more guest, and the deck lets go!",
    "Whoops!",
    "Here's the fix.",
    "First, flashing on top, so water runs away from the wall.",
    "Next, bolts straight through the board, into the house frame.",
    "Not nails. Bolts!",
    "Same deck. Same party. No faceplant!",
    "Follow for more backyard builds that won't fail!",
]
PAUSA = [0.18, 0.12, 0.3, 0.12, 0.1, 0.12, 0.12, 0.12, 0.5, 0.15, 0.1, 0.12, 0.12, 0.12, 0.25, 0.0]
voz = PiperVoice.load(sys.argv[1]); vel = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
sr = voz.config.sample_rate; out = [np.zeros(int(0.15 * sr), dtype=np.float32)]; t = 0.15; tiempos = []
for i, f in enumerate(FRASES):
    x = np.concatenate([c.audio_float_array.astype(np.float32) for c in voz.synthesize(f, SynthesisConfig(length_scale=1.0 / vel))])
    k = np.flatnonzero(np.abs(x) > 0.01); x = x[max(0, k[0] - int(0.02 * sr)): k[-1] + int(0.05 * sr)]
    tiempos.append({"i": i, "a": round(t, 3), "b": round(t + len(x) / sr, 3), "texto": f}); out += [x, np.zeros(int(PAUSA[i] * sr), dtype=np.float32)]; t += len(x) / sr + PAUSA[i]
a = np.concatenate(out); a = a / np.abs(a).max() * 0.9
os.makedirs(os.path.join(AQUI, "voz"), exist_ok=True)
sf.write(os.path.join(AQUI, "voz", "voz.wav"), a, sr)
json.dump({"total": round(len(a) / sr, 3), "frases": tiempos}, open(os.path.join(AQUI, "voz", "tiempos.json"), "w"), ensure_ascii=False, indent=1)
print(round(len(a) / sr, 2), "s,", sum(len(f.split()) for f in FRASES), "palabras")
