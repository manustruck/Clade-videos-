"""Ambiente y efectos del capítulo 1, todo sintetizado (sin bibliotecas de sonido): mar, viento, fondo grave que
crece, notas sueltas en la parte tranquila, golpe en cada tarjeta, estática del radio, rechinido del lente, ladridos,
latidos y golpes en la puerta. Lo mezcla bajo la voz.
Uso: python3 capitulos/01-faro/sonido.py   -> capitulos/01-faro/out/mezcla.wav
"""
import json, os
import numpy as np
import soundfile as sf
from scipy import signal

AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.join(AQUI, "..", "..")
cap = json.load(open(os.path.join(RAIZ, "src", "videos", "tambo-01", "capitulo.json"), encoding="utf-8"))
SR, T = 44100, cap["total"]; N = int(SR * T); t = np.arange(N) / SR
rng = np.random.default_rng(7)
TR = {(x["tipo"], str(x["id"])): x for x in cap["tramos"]}
def tr(n): return TR[("voz", str(n))]
db = lambda d: 10 ** (d / 20)
def filtro(x, tipo, f, orden=2):
    return signal.sosfilt(signal.butter(orden, f, tipo, fs=SR, output="sos"), x)
def ruido(n): return rng.standard_normal(n)
def poner(pista, x, seg, gan=1.0):
    i = int(seg * SR)
    if i >= N or i + len(x) <= 0: return
    if i < 0: x = x[-i:]; i = 0
    x = x[: N - i]; pista[i:i + len(x)] += x * gan
def env(n, a=0.01, r=0.3):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na); e[-nr:] = np.linspace(1, 0, nr); return e
def tramo_gan(a, b, borde=1.5):
    """1 entre a y b (segundos), con entrada y salida suaves"""
    return np.clip((t - a) / borde, 0, 1) * np.clip((b - t) / borde, 0, 1)

L = np.zeros(N); R = np.zeros(N)
def amb(x, g, pan=0.0):
    global L, R
    L += x * g * (1 - max(0, pan)); R += x * g * (1 + min(0, pan))

# --- mar: ruido grave que respira cada 7 s, y espuma
ola = 0.3 + 0.7 * np.sin(np.pi * t / 7.0) ** 2
mar = filtro(ruido(N), "low", 700) * ola
amb(mar / np.abs(mar).max(), db(-27), -0.2)
esp = filtro(ruido(N), "band", [1500, 5000]) * np.clip(np.sin(np.pi * t / 7.0 + 0.6), 0, 1) ** 6
amb(esp / np.abs(esp).max(), db(-36), 0.3)
# --- viento
lfo = np.interp(t, np.linspace(0, T, int(T / 3) + 2), rng.uniform(0.2, 1.0, int(T / 3) + 2))
vi = filtro(ruido(N), "band", [250, 900]) * lfo
amb(vi / np.abs(vi).max(), db(-35), 0.15)

# --- fondo grave que crece con la historia; una segunda menor entra desde el día 150
crece = np.interp(t, [0, tr(15)["a"], tr(21)["a"], tr(52)["a"], tr(34)["a"], T], [0.25, 0.3, 0.5, 0.7, 1.0, 0.8])
dr = sum(np.sin(2 * np.pi * f * t + p) * (0.6 + 0.4 * np.sin(2 * np.pi * m * t)) for f, p, m in [(55, 0, 0.07), (82.6, 1, 0.05), (110.3, 2, 0.11)])
amb(dr / 3 * crece, db(-22))
dis = np.sin(2 * np.pi * 116.6 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * t)) + 0.5 * np.sin(2 * np.pi * 233.5 * t + 1)
amb(dis * np.clip((t - tr(52)["a"]) / 40, 0, 1), db(-30))
agudo = np.sin(2 * np.pi * 1318 * t) * np.sin(2 * np.pi * 5.5 * t) ** 2
amb(agudo * tramo_gan(tr(34)["a"], tr(41)["b"], 6), db(-40))

# --- notas sueltas (la menor) en la parte tranquila: días 1 a 30
def nota(f, dur=3.2):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(4 * np.pi * f * tt) + 0.15 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 1.4) * env(n, 0.005, 0.5)
MEL = [220.0, 261.6, 329.6, 293.7, 261.6, 220.0, 196.0, 246.9]
mus = np.zeros(N); s0, s1 = tr(4)["a"], tr(15)["a"] - 3
k = 0; seg = s0
while seg < s1:
    poner(mus, nota(MEL[k % len(MEL)]), seg); poner(mus, nota(MEL[k % len(MEL)] / 2, 4.0), seg, 0.6)
    seg += 2.6 if k % 4 != 3 else 4.4; k += 1
amb(mus, db(-25))
# la misma melodía, más lenta y rota, en el final
mus2 = np.zeros(N); seg = tr(42)["a"]
for i, f in enumerate([220.0, 207.7, 196.0, 185.0]):
    poner(mus2, nota(f, 5.0), seg + i * 2.2)
amb(mus2, db(-22))

# --- efectos
fx = np.zeros(N)
def golpe(f0=58, dur=1.4, clic=0.3):
    n = int(dur * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * (f0 * (1 + 0.8 * np.exp(-tt * 30))) * tt) * np.exp(-tt * 4) + clic * filtro(ruido(n), "low", 400) * np.exp(-tt * 40)
for x in cap["tramos"]:
    if x["tipo"] == "tarjeta": poner(fx, golpe(), x["a"] + 0.15, db(-9))
poner(fx, golpe(48, 2.4), TR[("titulo", "titulo")]["a"] + 0.3, db(-7))
def subida(dur=2.2):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(ruido(n), "band", [300, 2500]) * (tt / dur) ** 3
def susto(seg, g=-12):
    poner(fx, subida(), seg - 2.2, db(g - 4)); poner(fx, golpe(44, 2.6, 0.6), seg, db(g))
for seg in [tr(19)["b"] - 1.2, tr(23)["a"] + 4.5, tr(27)["voz"] + 0.2, tr(31)["voz"] + 2.5, tr(52)["b"] - 3.0, tr(38)["voz"] + 4.2, tr(39)["voz"] + 0.3]:
    susto(seg)
# estática del radio
est = filtro(ruido(N), "band", [900, 4200]) * (0.6 + 0.4 * (ruido(N) > 1.6))
g = tramo_gan(tr(25)["voz"] + 5.5, tr(27)["voz"] + 1.0, 0.25) + tramo_gan(tr(51)["voz"] + 3.6, tr(51)["b"] - 0.4, 0.25) + 0.35 * tramo_gan(tr(14)["voz"] + 3.0, tr(14)["voz"] + 6.5, 0.4)
fx += est / np.abs(est).max() * g * db(-21)
# lluvia del día 4
ll = filtro(ruido(N), "high", 2500)
fx += ll / np.abs(ll).max() * tramo_gan(tr(9)["a"], tr(10)["a"] + 2, 1.0) * db(-27)
# rechinido del lente
n = int(2.6 * SR); tt = np.arange(n) / SR
rech = signal.sawtooth(2 * np.pi * np.cumsum(380 + 260 * np.sin(2 * np.pi * 0.9 * tt) + 40 * np.sin(2 * np.pi * 13 * tt)) / SR) * env(n, 0.3, 0.8)
poner(fx, filtro(rech, "band", [300, 1800]), tr(35)["voz"], db(-22))
# ladridos
def ladrido():
    n = int(0.16 * SR); tt = np.arange(n) / SR
    v = signal.sawtooth(2 * np.pi * np.cumsum(420 - 900 * tt) / SR) + 0.5 * ruido(n)
    return filtro(v, "band", [400, 1700]) * np.sin(np.pi * tt / 0.16) ** 0.6
for i in range(4):
    poner(fx, ladrido(), tr(34)["voz"] + 2.9 + i * 0.36, db(-13))
# latidos en el clímax
lat = np.zeros(N); seg = tr(36)["a"]
while seg < tr(39)["b"]:
    poner(lat, golpe(52, 0.5, 0.0), seg); poner(lat, golpe(46, 0.5, 0.0), seg + 0.24, 0.7); seg += 0.86
fx += lat * db(-15)
# golpes en la puerta: tres, y luego no paran
def toc(): return golpe(95, 0.35, 0.9)
for base in [tr(40)["voz"] + 1.2, tr(40)["voz"] + 5.2, tr(41)["voz"] + 9.0, tr(42)["voz"] + 4.4, TR[("pausa", "final")]["a"] + 0.6, TR[("pausa", "final")]["a"] + 2.6, TR[("pausa", "final")]["a"] + 4.6]:
    for i in range(3): poner(fx, toc(), base + i * 0.42, db(-7))
L += fx; R += fx

# --- mezcla: el ambiente baja cuando suena la voz
voz, sr = sf.read(os.path.join(AQUI, "out", "voz_pista.wav")); assert sr == SR
voz = np.pad(voz, (0, max(0, N - len(voz))))[:N]; voz = voz / np.abs(voz).max() * db(-3)
envv = filtro(np.abs(voz), "low", 4, 1); pato = 1 - 0.5 * np.clip(envv / 0.05, 0, 1)
borde = np.clip(t / 1.0, 0, 1) * np.clip((T - t) / 1.5, 0, 1)
m = np.stack([(L * pato + voz) * borde, (R * pato + voz) * borde], axis=1)
m = m / np.abs(m).max() * db(-1)
sf.write(os.path.join(AQUI, "out", "mezcla.wav"), m, SR)
print(f"mezcla.wav {T:.1f} s, pico {np.abs(m).max():.2f}")
