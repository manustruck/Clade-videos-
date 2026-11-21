"""Saca los reels verticales del capítulo 1: render mudo de cada reel + el audio recortado de la mezcla del capítulo.
Los tramos deben coincidir con REELS en src/videos/tambo-01/Reels.tsx.
Uso: python3 capitulos/01-faro/reels.py   -> capitulos/01-faro/publicar/reel_<nombre>.mp4
"""
import json, os, subprocess
import numpy as np
import soundfile as sf

AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.join(AQUI, "..", "..")
cap = json.load(open(os.path.join(RAIZ, "src", "videos", "tambo-01", "capitulo.json"), encoding="utf-8"))
def tramo(tipo, ident, recorte=0.0):
    x = next(q for q in cap["tramos"] if q["tipo"] == tipo and str(q["id"]) == str(ident)); return (x["a"], x["b"] - recorte)
REELS = {
    "huellas": ("ReelHuellas", [tramo("voz", 18), tramo("voz", 19), tramo("voz", 20)], tramo("tarjeta", "DÍA 77")),
    "radio": ("ReelRadio", [tramo("voz", 25, 1.2), tramo("voz", 26, 1.0), tramo("voz", 27, 1.8), tramo("voz", 51, 0.8)], tramo("tarjeta", "DÍA 150")),
}
mez, sr = sf.read(os.path.join(AQUI, "out", "mezcla.wav"))
os.makedirs(os.path.join(AQUI, "publicar"), exist_ok=True)
for nombre, (comp, segs, cierre) in REELS.items():
    partes = []
    for a, b in segs + [cierre]:
        x = mez[int(a * sr): int(b * sr)].copy(); n = int(0.03 * sr)
        x[:n] *= np.linspace(0, 1, n)[:, None]; x[-n:] *= np.linspace(1, 0, n)[:, None]; partes.append(x)
    audio = np.concatenate(partes); wav = os.path.join(AQUI, "out", f"reel_{nombre}.wav"); sf.write(wav, audio, sr)
    mudo = os.path.join(AQUI, "out", f"reel_{nombre}_mudo.mp4")
    subprocess.run(["npx", "remotion", "render", "src/index.ts", comp, mudo, "--muted", "--codec", "h264", "--crf", "18", "--concurrency", "4", "--log=error"], check=True, cwd=RAIZ)
    sal = os.path.join(AQUI, "publicar", f"reel_{nombre}.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mudo, "-i", wav, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-crf", "21", "-preset", "slow", "-pix_fmt", "yuv420p",
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", sal], check=True)
    print(nombre, round(len(audio) / sr, 2), "s ->", sal, flush=True)
