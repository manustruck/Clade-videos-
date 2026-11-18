"""Música synthwave + efectos para «THE LEONIDA FILES». Uso: python3 canal-gta/sonido.py 01-lucia
Lee voz/voz.wav y voz/tiempos.json de la parte y escribe out/mezcla.wav (voz encima, música que baja cuando hablan)."""
import os, sys, json
import numpy as np, soundfile as sf
from scipy import signal
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "canal-ingles"))
from comun_sonido import SR, rng, db, filtro, golpe, whoosh, campanita, chasquido

AQUI = os.path.join(os.path.dirname(os.path.abspath(__file__)), sys.argv[1])
TI = json.load(open(os.path.join(AQUI, "voz", "tiempos.json")))
T = [f["a"] for f in TI["frases"]]; TT = TI["total"] + 0.9; N = int(SR * TT); t = np.arange(N) / SR
def poner(p, x, seg, g=1.0):
    i = int(seg * SR)
    if 0 <= i < N: x = x[: N - i]; p[i:i + len(x)] += x * g

def sierra(f, dur, det=0.006):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(signal.sawtooth(2 * np.pi * f * (1 + k * det) * tt) for k in (-1, 0, 1)) / 3
    return s * np.minimum(tt / 0.02, 1) * np.minimum((dur - tt) / 0.05, 1)
def bombo():
    n = int(0.35 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (45 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
def caja():
    n = int(0.3 * SR); tt = np.arange(n) / SR
    return (filtro(rng.standard_normal(n), "band", [1200, 7000]) * 0.8 + np.sin(2 * np.pi * 190 * tt) * 0.4) * np.exp(-tt * 14)
def plato():
    n = int(0.06 * SR); return filtro(rng.standard_normal(n), "high", 7000) * np.exp(-np.arange(n) / SR * 70)
def subida(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [600, 9000]) * (tt / dur) ** 2
def falla(dur):
    n = int(dur * SR); x = rng.standard_normal(n) * (rng.random(n // 400 + 1).repeat(400)[:n] > 0.5)
    return filtro(x, "band", [300, 4000]) * 0.7

# ---- música: La menor, Fa, Do, Sol a 100 pulsos por minuto
mus, bat = np.zeros(N), np.zeros(N)
pulso = 60 / 100
ACORDES = [[110.0, 130.8, 164.8], [87.3, 110.0, 130.8], [130.8, 164.8, 196.0], [98.0, 123.5, 146.8]]
k = 0; seg = 0.0
while seg < TT:
    ac = ACORDES[(k // 8) % 4]
    for f in ac: poner(mus, filtro(sierra(f * 2, pulso * 0.95), "low", 2200), seg, 0.25)          # pad
    poner(mus, filtro(sierra(ac[0] / 2, pulso * 0.45), "low", 500), seg, 0.9)                       # bajo en corcheas
    poner(mus, filtro(sierra(ac[0] / 2, pulso * 0.45), "low", 500), seg + pulso / 2, 0.7)
    poner(mus, filtro(sierra([ac[2] * 4, ac[1] * 4, ac[0] * 4, ac[1] * 4][k % 4], 0.12), "low", 3500), seg + pulso / 4, 0.12)  # arpegio
    if k % 2 == 0: poner(bat, bombo(), seg, 1.0)
    else: poner(bat, caja(), seg, 0.6)
    poner(bat, plato(), seg + pulso / 2, 0.3)
    seg += pulso; k += 1
mus = filtro(mus, "high", 60) + bat * 0.7
mus *= np.interp(t, [0, 0.05, TT - 0.6, TT], [0, 1, 1, 0])

# ---- efectos
fx = np.zeros(N)
poner(fx, golpe(42, 1.0, 0.9), 0.0, db(-1)); poner(fx, whoosh(0.5), 0.0, db(-6))                     # gancho
for i, a in enumerate(T[1:], 1): poner(fx, whoosh(0.3), a - 0.12, db(-13))                          # cada corte
for i, f in enumerate(TI["frases"]):
    txt = f["texto"].lower()
    if txt.startswith("but"): poner(fx, falla(0.5), f["a"] - 0.05, db(-8)); poner(fx, golpe(50, 0.6, 0.8), f["a"], db(-5))
    if "follow" in txt and i <= 2: poner(fx, campanita(1568, 0.4), f["a"] + 0.6, db(-11)); poner(fx, campanita(2093, 0.4), f["a"] + 0.68, db(-13))
    if txt.startswith("clue") or txt[:4] in ("one.", "two.", "thre", "four", "five", "and "): poner(fx, chasquido(), f["a"], db(-10))
fin = T[-1]
poner(fx, subida(1.2), fin - 1.2, db(-14)); poner(fx, golpe(55, 0.7, 0.9), fin, db(-4)); poner(fx, campanita(1760, 0.6), fin + 1.0, db(-12))

voz, sr = sf.read(os.path.join(AQUI, "voz", "voz.wav"))
if voz.ndim > 1: voz = voz.mean(axis=1)
voz = signal.resample_poly(voz, SR, sr); voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]; voz = voz / np.abs(voz).max() * db(-3)
env = filtro(np.abs(voz), "low", 4, 1); pato = 1 - 0.6 * np.clip(env / 0.05, 0, 1)
m = mus / np.abs(mus).max() * db(-13) * pato + fx + voz
m = np.stack([m, m], axis=1); m = m / np.abs(m).max() * db(-1)
os.makedirs(os.path.join(AQUI, "out"), exist_ok=True)
sf.write(os.path.join(AQUI, "out", "mezcla.wav"), m, SR); print("mezcla", sys.argv[1], round(TT, 2), "s")
