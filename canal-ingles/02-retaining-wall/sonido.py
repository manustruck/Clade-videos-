"""Música alegre y efectos del capítulo 2 «Your retaining wall will tip», todo sintetizado, mezclado bajo la voz.
Uso: python3 canal-ingles/02-retaining-wall/sonido.py  -> canal-ingles/02-retaining-wall/out/mezcla.wav
"""
import os
import numpy as np
import soundfile as sf
from scipy import signal

AQUI = os.path.dirname(os.path.abspath(__file__))
SR, T = 44100, 41.5; N = int(SR * T); t = np.arange(N) / SR
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
gan = np.interp(t, [0, 0.5, 21.0, 21.6, 22.9, 23.6, 40.3, 41.5], [0, 1, 1, 0.45, 0.45, 1, 1, 0])
mus *= gan

fx = np.zeros(N)
def chasquido():
    n = int(0.45 * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [600, 4500]) * np.exp(-tt * 22) + 0.8 * golpe(110, 0.45, 0.3)[:n]
def vertido(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [200, 1800]) * np.sin(np.pi * tt / dur) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt))
def campanita(f=1568, dur=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 2.7 * tt)) * np.exp(-tt * 9)
for seg in (1.0, 21.55): poner(fx, golpe(48, 0.9, 0.7), seg + 0.2, db(-5)); poner(fx, chasquido(), seg, db(-7))   # el muro cae
poner(fx, golpe(55, 0.7, 0.6), 1.9, db(-9)); poner(fx, golpe(55, 0.7, 0.6), 22.45, db(-9))
for i in range(8): poner(fx, golpe(130, 0.18, 0.7), 3.9 + i * 0.26 + 0.22, db(-12))                                  # cada bloque
poner(fx, vertido(1.5), 6.2, db(-15))                                                                                # la tierra
poner(fx, campanita(880, 0.25), 8.35, db(-14)); poner(fx, campanita(2100, 0.3), 21.7, db(-12))                      # «looks great» / Norm se agrieta
for k, fr in enumerate([1047, 1319, 1568]): poner(fx, campanita(fr, 0.6), 22.95 + k * 0.12, db(-13))
grava = np.zeros(int(1.7 * SR))
for k in range(65):
    g = golpe(700 + 1200 * rng.random(), 0.06, 1.0); a2 = int(rng.random() * (len(grava) - len(g))); grava[a2:a2 + len(g)] += g * 0.5
poner(fx, grava, 25.0, db(-14))
poner(fx, golpe(110, 0.35, 0.9), 27.95, db(-9)); poner(fx, campanita(1175, 0.4), 28.0, db(-14))                      # el tubo cae en su sitio
gor = filtro(rng.standard_normal(N), "band", [300, 1400]) * (0.5 + 0.5 * np.sin(2 * np.pi * 3.3 * t)) * np.clip((t - 30.7) / 0.5, 0, 1) * np.clip((36.2 - t) / 0.5, 0, 1)
fx += gor / np.abs(gor).max() * db(-26)                                                                              # el agua sale por el tubo
poner(fx, golpe(80, 0.5, 0.9), 39.0, db(-5)); poner(fx, campanita(1568, 0.8), 39.05, db(-11))                       # el sello
ll = filtro(rng.standard_normal(N), "high", 3000)
lluvia = np.clip((t - 9.83) / 0.6, 0, 1) * np.clip((22.8 - t) / 0.6, 0, 1) + np.clip((t - 32.0) / 0.4, 0, 1) * np.clip((35.95 - t) / 0.4, 0, 1)
fx += ll / np.abs(ll).max() * lluvia * db(-24)

voz, sr = sf.read(os.path.join(AQUI, "voz", "voz.wav")); assert sr == SR
if voz.ndim > 1: voz = voz.mean(axis=1)
voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]; voz = voz / np.abs(voz).max() * db(-3)
env = filtro(np.abs(voz), "low", 4, 1); pato = 1 - 0.55 * np.clip(env / 0.05, 0, 1)
m = mus / np.abs(mus).max() * db(-15) * pato + fx + voz
m = np.stack([m, m], axis=1); m = m / np.abs(m).max() * db(-1)
sf.write(os.path.join(AQUI, "out", "mezcla.wav"), m, SR)
print("mezcla.wav", T, "s")
