"""Sonido sintetizado común a los videos del canal en inglés: música alegre tipo ukelele, efectos y mezcla bajo la voz.
Cada video llama a `mezclar(aqui, eventos, lluvia)`:
  - `eventos(fx, S, TT)` pone efectos con `S.poner(fx, sonido, segundo, ganancia)`; TT = inicio de cada frase de la voz.
  - `lluvia(t, TT)` devuelve 0..1 por muestra (intensidad de lluvia); None si no hay.
Lee `voz/voz.wav` y `voz/tiempos.json` de la carpeta del video y escribe `out/mezcla.wav`.
"""
import json, os, types
import numpy as np
import soundfile as sf
from scipy import signal

SR = 44100
rng = np.random.default_rng(3)
db = lambda d: 10 ** (d / 20)
def filtro(x, tipo, f, orden=2): return signal.sosfilt(signal.butter(orden, f, tipo, fs=SR, output="sos"), x)
def pluck(f, dur=0.9):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(4 * np.pi * f * tt) + 0.25 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 5.5) * np.minimum(tt / 0.004, 1)
def golpe(f0=70, dur=0.5, clic=0.5):
    n = int(dur * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f0 * (1 + 1.2 * np.exp(-tt * 40)) * tt) * np.exp(-tt * 9) + clic * filtro(rng.standard_normal(n), "low", 900) * np.exp(-tt * 50)
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
def roce(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [300, 2200]) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt)) * np.minimum(tt / 0.1, 1) * np.minimum((dur - tt) / 0.2, 1)
def vertido(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [200, 1800]) * np.sin(np.pi * tt / dur) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt))
def whoosh(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [400, 3500]) * np.sin(np.pi * tt / dur) ** 2
def pops(fx, poner, seg, n=8, paso=0.2, g=-14):
    for k in range(n):
        poner(fx, filtro(rng.standard_normal(int(0.07 * SR)), "band", [900, 4000]) * np.exp(-np.arange(int(0.07 * SR)) / SR * 50), seg + k * paso, db(g))

def mezclar(aqui, eventos, lluvia=None):
    TI = json.load(open(os.path.join(aqui, "voz", "tiempos.json"))); TT = [x["a"] for x in TI["frases"]]
    T = round((TI["total"] + 1.1) * 10) / 10; N = int(SR * T); t = np.arange(N) / SR
    def poner(p, x, seg, g=1.0):
        i = int(seg * SR)
        if i >= N or i < 0: return
        x = x[: N - i]; p[i:i + len(x)] += x * g
    # música: Do – Sol – La menor – Fa a 112 pulsos por minuto + melodía sencilla
    mus = np.zeros(N); pulso = 60 / 112
    ACORDES = [[261.6, 329.6, 392.0, 523.3], [196.0, 246.9, 293.7, 392.0], [220.0, 261.6, 329.6, 440.0], [174.6, 220.0, 261.6, 349.2]]
    i = 0; seg = 0.0
    while seg < T - 1:
        ac = ACORDES[(i // 8) % 4]
        for j, f in enumerate(ac if i % 2 == 0 else ac[::-1]): poner(mus, pluck(f * (2 if i % 4 == 3 else 1)), seg + j * 0.012, 0.5 if i % 2 else 0.8)
        if i % 2 == 0: poner(mus, golpe(60, 0.25, 0.2), seg, 0.5)
        if i % 4 == 2: poner(mus, filtro(rng.standard_normal(int(0.08 * SR)), "band", [1500, 5000]) * np.exp(-np.arange(int(0.08 * SR)) / SR * 60), seg, 0.5)
        seg += pulso / 2; i += 1
    MEL = [523.3, 587.3, 659.3, 784.0, 659.3, 587.3, 523.3, 392.0]
    for k in range(int(T / (pulso * 2))): poner(mus, pluck(MEL[k % 8] * 2, 0.7), 0.4 + k * pulso * 2, 0.35)
    mus = filtro(mus, "high", 120)
    mus *= np.interp(t, [0, 0.5, T - 1.2, T], [0, 1, 1, 0])
    fx = np.zeros(N)
    S = types.SimpleNamespace(poner=poner)
    eventos(fx, S, TT)
    if lluvia is not None:
        ll = filtro(rng.standard_normal(N), "high", 3000); fx += ll / np.abs(ll).max() * lluvia(t, TT) * db(-24)
    voz, sr = sf.read(os.path.join(aqui, "voz", "voz.wav"))
    if voz.ndim > 1: voz = voz.mean(axis=1)
    voz = signal.resample_poly(voz, SR, sr); voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]; voz = voz / np.abs(voz).max() * db(-3)
    env = filtro(np.abs(voz), "low", 4, 1); pato = 1 - 0.55 * np.clip(env / 0.05, 0, 1)
    m = mus / np.abs(mus).max() * db(-15) * pato + fx + voz
    m = np.stack([m, m], axis=1); m = m / np.abs(m).max() * db(-1)
    os.makedirs(os.path.join(aqui, "out"), exist_ok=True)
    sf.write(os.path.join(aqui, "out", "mezcla.wav"), m, SR)
    print("mezcla.wav", T, "s")

def pide_seguir(fx, p, a):
    """los botones de LIKE y FOLLOW: entrada, toque y premio (mismos tiempos que PideSeguir.tsx)"""
    p(fx, whoosh(0.35), a, db(-14))
    p(fx, golpe(160, 0.1, 0.9), a + 0.55, db(-10)); p(fx, campanita(1568, 0.4), a + 0.56, db(-11)); p(fx, campanita(2093, 0.35), a + 0.62, db(-13))
    p(fx, golpe(160, 0.1, 0.9), a + 1.15, db(-10)); p(fx, campanita(1760, 0.4), a + 1.16, db(-11)); p(fx, campanita(2637, 0.35), a + 1.24, db(-13))

def equipos(fx, p, a, b):
    """la votación TEAM vs TEAM: golpe de entrada y contadores que suben"""
    p(fx, whoosh(0.4), a, db(-12)); p(fx, golpe(70, 0.5, 0.8), a + 0.1, db(-8))
    n = int((b - a - 0.4) / 0.09)
    for k in range(max(0, n)): p(fx, golpe(900 + 300 * (k % 3), 0.03, 1.0), a + 0.35 + k * 0.09, db(-24))
