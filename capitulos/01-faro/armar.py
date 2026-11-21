"""Arma la línea de tiempo del capítulo: coloca cada bloque de voz, las tarjetas y las pausas.
Saca:  src/videos/tambo-01/capitulo.json  (tramos con sus segundos y las palabras con su tiempo)
       capitulos/01-faro/out/voz_pista.wav (la voz sola, ya colocada)
Uso: python3 capitulos/01-faro/armar.py
"""
import json, os, subprocess, sys
AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.join(AQUI, "..", "..")
sys.path.insert(0, AQUI)
from guion import SECUENCIA  # noqa: E402

ENTRADA = 0.5  # respiro antes de cada bloque de voz
FPS = 24
tramos, palabras, t, entradas, filtros = [], [], 0.0, [], []
for s in SECUENCIA:
    if s[0] == "tarjeta":
        tramos.append({"tipo": "tarjeta", "id": s[1], "a": t, "b": t + s[2]}); t += s[2]
    elif s[0] == "titulo":
        tramos.append({"tipo": "titulo", "id": "titulo", "a": t, "b": t + s[1]}); t += s[1]
    elif s[0] == "pausa":
        tramos.append({"tipo": "pausa", "id": s[1], "a": t, "b": t + s[2]}); t += s[2]
    else:
        _, n, texto, cola = s
        d = json.load(open(os.path.join(AQUI, "voz", f"b{n:02d}.json"), encoding="utf-8"))
        ini = t + ENTRADA
        tramos.append({"tipo": "voz", "id": n, "a": t, "b": ini + d["dur"] + cola, "voz": ini, "texto": texto})
        for w, w0, w1 in d["palabras"]:
            palabras.append({"p": w, "a": round(ini + w0, 3), "b": round(ini + w1, 3), "n": n})
        filtros.append(f"[{len(entradas) // 2}:a]adelay={int(ini * 1000)}:all=1[a{len(entradas) // 2}]")
        entradas += ["-i", os.path.join(AQUI, "voz", f"b{n:02d}.mp3")]
        t = ini + d["dur"] + cola
for x in tramos:
    x["a"], x["b"] = round(x["a"], 3), round(x["b"], 3)
total = round(t, 3)
os.makedirs(os.path.join(RAIZ, "src", "videos", "tambo-01"), exist_ok=True)
json.dump({"fps": FPS, "total": total, "cuadros": int(round(total * FPS)), "tramos": tramos, "palabras": palabras},
          open(os.path.join(RAIZ, "src", "videos", "tambo-01", "capitulo.json"), "w", encoding="utf-8"), ensure_ascii=False)
os.makedirs(os.path.join(AQUI, "out"), exist_ok=True)
n = len(entradas) // 2
# amix en dos niveles: ffmpeg se pone lento con decenas de entradas en un solo amix
grupos = [list(range(i, min(i + 9, n))) for i in range(0, n, 9)]
fc = ";".join(filtros)
for g, idx in enumerate(grupos):
    fc += ";" + "".join(f"[a{i}]" for i in idx) + f"amix=inputs={len(idx)}:normalize=0[g{g}]"
fc += ";" + "".join(f"[g{g}]" for g in range(len(grupos))) + f"amix=inputs={len(grupos)}:normalize=0,apad=whole_dur={total}[out]"
sal = os.path.join(AQUI, "out", "voz_pista.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", *entradas, "-filter_complex", fc, "-map", "[out]", "-t", str(total), "-ar", "44100", "-ac", "1", sal], check=True)
print(f"total {total:.1f} s = {int(total // 60)} min {total % 60:.0f} s, {len(tramos)} tramos, {len(palabras)} palabras -> {sal}")
