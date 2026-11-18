"""Música de telenovela + efectos, hechos con numpy (sin archivos con licencia).
Uso desde el capítulo: mezclar(carpeta, eventos, lluvia=[(a, b), ...]).  eventos(fx, poner, T) coloca los efectos."""
import json, os, sys
import numpy as np, soundfile as sf
from scipy import signal
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "canal-ingles"))
from comun_sonido import SR, rng, db, filtro, golpe, whoosh, campanita, chasquido

def cuerdas(f, dur):
    """cuerdas: tres sierras desafinadas, filtradas, con trémolo suave"""
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(signal.sawtooth(2 * np.pi * f * (1 + k * 0.004) * t) for k in (-1, 0, 1)) / 3
    s = filtro(s, "low", 1800) * (0.85 + 0.15 * np.sin(2 * np.pi * 6 * t))
    return s * np.minimum(t / 0.6, 1) * np.minimum((dur - t) / 0.6, 1)
def piano(f, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) + 0.15 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 3)
def dun(f=55, dur=1.4):
    """golpe dramático de telenovela: bajo + cuerdas graves + platillo al revés"""
    n = int(dur * SR); t = np.arange(n) / SR
    b = (signal.sawtooth(2 * np.pi * f * t) * 0.6 + np.sin(2 * np.pi * f / 2 * t)) * np.exp(-t * 2.2)
    return filtro(b, "low", 900) + golpe(45, dur, 0.6)[:n] * 0.8
def platillo_reves(dur=0.8):
    n = int(dur * SR); t = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "high", 4000) * (t / dur) ** 3
def salpicon(dur=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [300, 3000]) * np.exp(-t * 9)

def mezclar(aqui, eventos, lluvia=()):
    TI = json.load(open(os.path.join(aqui, "voz", "tiempos.json"), encoding="utf-8"))
    T = [f["a"] for f in TI["frases"]]; TT = TI["total"] + 1.2; N = int(SR * TT); t = np.arange(N) / SR
    def poner(p, x, seg, g=1.0):
        i = int(seg * SR)
        if 0 <= i < N: x = x[: N - i]; p[i:i + len(x)] += x * g
    # música: La menor – Fa – Re menor – Mi, 4 s por acorde, cuerdas + piano en arpegio
    mus = np.zeros(N)
    ACORDES = [[220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [146.8, 174.6, 220.0], [164.8, 207.7, 246.9]]
    seg, k = 0.0, 0
    while seg < TT:
        ac = ACORDES[k % 4]
        for f in ac: poner(mus, cuerdas(f, 4.4), seg, 0.22)
        poner(mus, cuerdas(ac[0] / 2, 4.4), seg, 0.25)
        for j in range(8): poner(mus, piano(ac[j % 3] * (2 if j % 4 == 3 else 1)), seg + j * 0.5, 0.12)
        seg += 4; k += 1
    mus *= np.interp(t, [0, 0.4, TT - 1.0, TT], [0, 1, 1, 0])
    fx = np.zeros(N)
    for a in T[1:]: poner(fx, whoosh(0.35), a - 0.12, db(-17))
    eventos(fx, poner, T)
    for a, b in lluvia:
        n = int((b - a) * SR); ll = filtro(rng.standard_normal(n), "band", [800, 8000]) * np.minimum(np.arange(n) / SR / 0.5, 1) * np.minimum((b - a - np.arange(n) / SR) / 0.5, 1)
        poner(fx, ll / np.abs(ll).max(), a, db(-24))
    voz, sr = sf.read(os.path.join(aqui, "voz", "voz.wav"))
    if voz.ndim > 1: voz = voz.mean(axis=1)
    voz = signal.resample_poly(voz, SR, sr); voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]; voz = voz / np.abs(voz).max() * db(-3)
    env = filtro(np.abs(voz), "low", 4, 1); pato = 1 - 0.55 * np.clip(env / 0.05, 0, 1)
    m = mus / np.abs(mus).max() * db(-14) * pato + fx + voz
    m = np.stack([m, m], axis=1); m = m / np.abs(m).max() * db(-1)
    os.makedirs(os.path.join(aqui, "out"), exist_ok=True)
    sf.write(os.path.join(aqui, "out", "mezcla.wav"), m, SR); print("mezcla", round(TT, 2), "s")
