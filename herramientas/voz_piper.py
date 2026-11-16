"""Voz gratuita con Piper (sin conexión, sin límite de caracteres), frase por frase, con tiempos por palabra.

Entrada: un guion.json  {"frases": ["...", ...], "pausas": [0.2, ...], "voces": [0, 1, ...]}  (pausa tras cada frase y,
para diálogos, qué voz dice cada frase: índice dentro de --modelo, que acepta varios modelos separados por comas).
Saca en la carpeta de salida:
  voz.wav        -> la narración completa (mono)
  tiempos.json   -> {"total", "frases": [{"i","a","b","texto"}], "palabras": [{"p","a","b","i"}]}
Los tiempos de cada FRASE son exactos; los de cada PALABRA se reparten dentro de la frase según los fonemas de cada
palabra (Piper no da alineación): sirven para resaltar la palabra que suena en subtítulos.

Uso: python3 herramientas/voz_piper.py guion.json carpeta_salida --modelo voz0.onnx[,voz1.onnx] [--vel 1.1[,1.15]]
Voz recomendada para uso comercial: en_US-joe-medium (licencia CC0). Evita las de licencia «NC» (ryan, hfc_male).
"""
import argparse, json, os, re
import numpy as np, soundfile as sf
from piper import PiperVoice, SynthesisConfig

p = argparse.ArgumentParser()
p.add_argument("guion"); p.add_argument("salida"); p.add_argument("--modelo", required=True); p.add_argument("--vel", default="1.1")
a = p.parse_args()
g = json.load(open(a.guion, encoding="utf-8")); FRASES = g["frases"]; PAUSAS = g.get("pausas", [0.15] * len(FRASES)); VOCES = g.get("voces", [0] * len(FRASES))
MODELOS = [PiperVoice.load(m) for m in a.modelo.split(",")]; VELS = [float(v) for v in a.vel.split(",")]
VELS += [VELS[-1]] * (len(MODELOS) - len(VELS))
sr = MODELOS[0].config.sample_rate; voz = MODELOS[0]
from scipy import signal

def pesos(texto, voz):
    """peso de cada palabra: nº de fonemas (sin marcas de acento) + una pausa corta tras coma o punto"""
    palabras = texto.split()
    try:
        fon = " ".join("".join(x) if isinstance(x, list) else x for x in [" ".join(s) if isinstance(s, list) else s for s in voz.phonemize(texto)])
        grupos = [re.sub(r"[ˈˌː]", "", w) for w in fon.split(" ") if w.strip()]
        if len(grupos) != len(palabras): raise ValueError
        w = [max(1, len(x)) for x in grupos]
    except Exception:
        w = [max(2, len(re.sub(r"\W", "", x))) for x in palabras]
    return palabras, [x + (3 if re.search(r"[,;:]$", pl) else 0) + (5 if re.search(r"[.!?…]$", pl) else 0) for x, pl in zip(w, palabras)]

out = [np.zeros(int(0.15 * sr), dtype=np.float32)]; t = 0.15; frases = []; palabras_t = []
for i, f in enumerate(FRASES):
    voz = MODELOS[VOCES[i]]
    x = np.concatenate([c.audio_float_array.astype(np.float32) for c in voz.synthesize(f, SynthesisConfig(length_scale=1.0 / VELS[VOCES[i]]))])
    if voz.config.sample_rate != sr: x = signal.resample_poly(x, sr, voz.config.sample_rate).astype(np.float32)
    x = x / max(1e-6, np.abs(x).max()) * 0.9
    k = np.flatnonzero(np.abs(x) > 0.01); x = x[max(0, k[0] - int(0.02 * sr)): k[-1] + int(0.05 * sr)]
    dur = len(x) / sr; frases.append({"i": i, "a": round(t, 3), "b": round(t + dur, 3), "texto": f, "h": VOCES[i]})
    ws, pe = pesos(f, voz); tot = sum(pe); acc = 0
    for w, q in zip(ws, pe):
        # el peso de pausa ocupa el final de la palabra, no el inicio
        palabras_t.append({"p": w, "a": round(t + dur * acc / tot, 3), "b": round(t + dur * (acc + q * 0.78) / tot, 3), "i": i, "h": VOCES[i]}); acc += q
    out += [x, np.zeros(int(PAUSAS[i] * sr), dtype=np.float32)]; t += dur + PAUSAS[i]
au = np.concatenate(out); au = au / np.abs(au).max() * 0.9
os.makedirs(a.salida, exist_ok=True)
sf.write(os.path.join(a.salida, "voz.wav"), au, sr)
json.dump({"total": round(len(au) / sr, 3), "frases": frases, "palabras": palabras_t}, open(os.path.join(a.salida, "tiempos.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(round(len(au) / sr, 2), "s,", sum(len(f.split()) for f in FRASES), "palabras,", len(FRASES), "frases")
