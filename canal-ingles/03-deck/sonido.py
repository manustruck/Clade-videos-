"""Música alegre y efectos del capítulo 3 «Your deck will pull away from your house», todo sintetizado, mezclado bajo la voz.
Uso: python3 canal-ingles/03-deck/sonido.py  -> canal-ingles/03-deck/out/mezcla.wav
"""
import os
import numpy as np
import soundfile as sf
from scipy import signal

AQUI = os.path.dirname(os.path.abspath(__file__))
import json
TI = json.load(open(os.path.join(AQUI, "voz", "tiempos.json"))); TT = [x["a"] for x in TI["frases"]]
SR, T = 44100, round((TI["total"] + 1.1) * 10) / 10; N = int(SR * T); t = np.arange(N) / SR
rng = np.random.default_rng(3); db = lambda d: 10 ** (d / 20)
def filtro(x, tipo, f, orden=2): return signal.sosfilt(signal.butter(orden, f, tipo, fs=SR, output="sos"), x)
def poner(p, x, seg, g=1.0):
    i = int(seg * SR)
    if i >= N: return
    x = x[: N - i]; p[i:i + len(x)] += x * g
def pluck(f, dur=0.9):  # cuerda pulsada tipo ukelele
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(4 * np.pi * f * tt) + 0.25 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 5.5) * np.minimum(tt / 0.004, 1)
def golpe(f0=70, dur=0.5, clic=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f0 * (1 + 1.2 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 9) + clic * filtro(rng.standard_normal(n), "low", 900) * np.exp(-tt * 50)

# --- música: Do – Sol – La menor – Fa a 112 pulsos por minuto, rasgueo en corcheas y palmas suaves
mus = np.zeros(N); pulso = 60 / 112
ACORDES = [[261.6, 329.6, 392.0, 523.3], [196.0, 246.9, 293.7, 392.0], [220.0, 261.6, 329.6, 440.0], [174.6, 220.0, 261.6, 349.2]]
i = 0; seg = 0.0
while seg < T - 1:
    ac = ACORDES[(i // 8) % 4]
    for j, f in enumerate(ac if i % 2 == 0 else ac[::-1]):
        poner(mus, pluck(f * (2 if i % 4 == 3 else 1)), seg + j * 0.012, 0.5 if i % 2 else 0.8)
    if i % 2 == 0: poner(mus, golpe(60, 0.25, 0.2), seg, 0.5)
    if i % 4 == 2: poner(mus, filtro(rng.standard_normal(int(0.08 * SR)), "band", [1500, 5000]) * np.exp(-np.arange(int(0.08 * SR)) / SR * 60), seg, 0.5)
    seg += pulso / 2; i += 1
# melodía sencilla encima
MEL = [523.3, 587.3, 659.3, 784.0, 659.3, 587.3, 523.3, 392.0]
for k in range(int(T / (pulso * 2))):
    poner(mus, pluck(MEL[k % 8] * 2, 0.7), 0.4 + k * pulso * 2, 0.35)
mus = filtro(mus, "high", 120)
# la música baja en la parte del fallo (21–25 s) y vuelve con el arreglo
gan = np.interp(t, [0, 0.5, TT[8] + 0.5, TT[8] + 0.9, TT[10] - 0.1, TT[10] + 0.5, T - 1.2, T], [0, 1, 1, 0.45, 0.45, 1, 1, 0])
mus *= gan

fx = np.zeros(N)
def chasquido():
    n = int(0.45 * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [600, 4500]) * np.exp(-tt * 22) + 0.8 * golpe(110, 0.45, 0.3)[:n]
def campanita(f=1568, dur=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.7 * tt)) * np.exp(-tt * 9)
def metal(f=900, dur=0.6):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.6 * np.sin(2 * np.pi * f * 2.76 * tt) + 0.4 * np.sin(2 * np.pi * f * 5.4 * tt)) * np.exp(-tt * 7) * 0.6
def boing(dur=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(260 + 340 * np.sin(np.pi * tt / dur)) / SR) * np.exp(-tt * 4)
def crujido(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [250, 1100]) * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * tt)) * np.sin(np.pi * tt / dur)
F0 = TT[8] + 0.75
poner(fx, chasquido(), 0.85, db(-6)); poner(fx, golpe(48, 0.9, 0.7), 1.75, db(-6))                                   # el gancho: se cae
poner(fx, golpe(70, 0.5, 0.6), TT[2] + 0.45, db(-8))                                                                  # el larguero cae en su sitio
for i in range(3):
    for k in range(2): poner(fx, golpe(160, 0.12, 0.95), TT[2] + 0.95 + i * 0.3 + k * 0.1, db(-11))                  # martillazos
poner(fx, golpe(90, 0.4, 0.5), TT[2] + 2.55, db(-9))                                                                  # las tablas
for i, tm in enumerate([TT[4] + 0.2, TT[4] + 0.4, TT[4] + 0.6]): poner(fx, campanita([880, 1047, 1319][i], 0.3), tm, db(-14))
poner(fx, crujido(1.6), TT[6] + 0.1, db(-13))                                                                         # los clavos se quejan
for tm in (TT[6] + 0.3, TT[6] + 0.65, TT[6] + 1.0): poner(fx, golpe(120, 0.12, 0.5), tm, db(-14))
poner(fx, boing(0.6), TT[8] + 0.2, db(-11))                                                                           # el invitado salta
poner(fx, chasquido(), F0, db(-5)); poner(fx, crujido(0.7), F0 - 0.3, db(-10)); poner(fx, golpe(50, 0.9, 0.7), F0 + 0.7, db(-5))
poner(fx, campanita(2100, 0.3), F0 + 1.0, db(-12))
for k, fr in enumerate([1047, 1319, 1568]): poner(fx, campanita(fr, 0.6), TT[10] + 0.05 + k * 0.12, db(-13))
poner(fx, metal(1500, 0.7), TT[11] + 0.85, db(-11)); poner(fx, golpe(120, 0.2, 0.9), TT[11] + 0.85, db(-12))          # el flashing
for i in range(2): poner(fx, golpe(80, 0.3, 0.9), TT[12] + 0.75 + i * 0.35, db(-8)); poner(fx, metal(700, 0.5), TT[12] + 0.75 + i * 0.35, db(-12))  # los pernos
poner(fx, golpe(45, 0.5, 0.2), TT[13] + 0.02, db(-9)); poner(fx, campanita(1568, 0.5), TT[13] + 0.62, db(-11)); poner(fx, campanita(2093, 0.5), TT[13] + 0.74, db(-12))
for k in range(8): poner(fx, filtro(rng.standard_normal(int(0.07 * SR)), "band", [900, 4000]) * np.exp(-np.arange(int(0.07 * SR)) / SR * 50), TT[14] + 0.05 + k * 0.2, db(-14))  # confeti
poner(fx, golpe(80, 0.5, 0.9), TT[14] + 1.5, db(-5)); poner(fx, campanita(1568, 0.8), TT[14] + 1.55, db(-11))        # sello
poner(fx, campanita(1760, 0.7), TT[15] + 0.1, db(-11)); poner(fx, campanita(2349, 0.7), TT[15] + 0.22, db(-12))      # el botón de seguir
ll = filtro(rng.standard_normal(N), "high", 3000)
lluvia = np.clip((t - TT[7]) / 0.6, 0, 1) * np.clip((TT[9] - t) / 0.6, 0, 1) + np.clip((t - (TT[11] - 0.2)) / 0.4, 0, 1) * np.clip(((TT[12] + 1.0) - t) / 0.4, 0, 1)
fx += ll / np.abs(ll).max() * lluvia * db(-24)

voz, sr = sf.read(os.path.join(AQUI, "voz", "voz.wav"))
if voz.ndim > 1: voz = voz.mean(axis=1)
voz = signal.resample_poly(voz, SR, sr)
voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]; voz = voz / np.abs(voz).max() * db(-3)
env = filtro(np.abs(voz), "low", 4, 1); pato = 1 - 0.55 * np.clip(env / 0.05, 0, 1)
m = mus / np.abs(mus).max() * db(-15) * pato + fx + voz
m = np.stack([m, m], axis=1); m = m / np.abs(m).max() * db(-1)
sf.write(os.path.join(AQUI, "out", "mezcla.wav"), m, SR)
print("mezcla.wav", T, "s")
