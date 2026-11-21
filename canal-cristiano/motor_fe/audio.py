"""Sonido: voz + música de fondo suave (pads y piano sintetizados) + efectos en cada evento -> <carpeta>/audio.wav

Uso (desde motor_fe/, después de motor.py que escribe timeline.json):  python audio.py <carpeta>

Reglas (de las referencias y de APRENDIZAJES.md):
- La voz siempre al frente; la música unos 16 dB abajo y se aparta (ducking) cuando hay voz.
- Barrido suave en cada transición, campanita en palabras clave, brillo en pergaminos y cifras.
- Un silencio corto antes del momento fuerte lo marca 'pre' en el guion; aquí la música también baja.
- El volumen final (-14 LUFS) lo ajusta render.py al unir.
La música sintetizada sirve de fondo; para algo mejor, usa una pista libre de derechos (pon musica.wav en la carpeta).
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np

CARPETA = os.path.abspath(sys.argv[1])
SR = 44100
with open(os.path.join(CARPETA, "timeline.json"), encoding="utf-8") as f:
    TL = json.load(f)
TOTAL = TL["total"]
N = int(TOTAL * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(3)


def add(buf, sig, tt, gain=1.0):
    a = int(tt * SR)
    if a >= len(buf) or a + len(sig) <= 0:
        return
    if a < 0:
        sig, a = sig[-a:], 0
    sig = sig[: len(buf) - a]
    buf[a:a + len(sig)] += sig * gain


def env(n, att, rel):
    e = np.ones(n)
    a, r = int(att * SR), int(rel * SR)
    if a:
        e[:a] = np.linspace(0, 1, a)
    if r:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def lowpass(x, k=40):
    return np.convolve(x, np.ones(k) / k, mode="same")


# ---------------------------------------------------------------- voz
voz = np.zeros(N)
for i, st in enumerate(TL["starts"]):
    mp3 = os.path.join(CARPETA, "voz", "{:02d}.mp3".format(i))
    if not os.path.exists(mp3):
        continue
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    add(voz, np.frombuffer(raw, np.int16).astype(np.float32) / 32768, st)

# ---------------------------------------------------------------- música
musica_ext = os.path.join(CARPETA, "musica.wav")
if os.path.exists(musica_ext):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-stream_loop", "-1", "-i", musica_ext, "-t", str(TOTAL),
                          "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    mus = np.zeros(N)
    m = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    mus[:len(m)] = m[:N]
else:
    mus = np.zeros(N)
    # progresión en Re mayor: D - A - Bm - G (calma, esperanza)
    acordes = [(146.83, 185.0, 220.0), (110.0, 138.59, 164.81), (123.47, 146.83, 185.0), (98.0, 123.47, 146.83)]
    dur = 4.0
    for k in range(int(TOTAL / dur) + 1):
        ch = acordes[k % 4]
        n = int((dur + 1.5) * SR)
        q = np.arange(n) / SR
        pad = sum(np.sin(2 * np.pi * f * q) + 0.5 * np.sin(2 * np.pi * f * 2.003 * q) + 0.3 * np.sin(2 * np.pi * f * 0.998 * q)
                  for f in ch)
        add(mus, lowpass(pad, 30) * env(n, 1.2, 1.4) * 0.11, k * dur)
        for j, f in enumerate((ch[0] * 2, ch[1] * 2, ch[2] * 2, ch[1] * 2)):  # piano suave en arpegio
            nn = int(2.2 * SR)
            qq = np.arange(nn) / SR
            nota = (np.sin(2 * np.pi * f * qq) + 0.3 * np.sin(2 * np.pi * f * 2 * qq)) * np.exp(-2.2 * qq) * env(nn, 0.005, 0.2)
            add(mus, nota * 0.09, k * dur + j * 1.0)

# nivel de música por plano (contraste emocional) y silencios totales, con rampas suaves
niv = np.ones(N)
for m in TL.get("musica", []):
    niv[int(m["t0"] * SR):int(m["t1"] * SR)] = m["nivel"]
niv = np.convolve(niv, np.ones(int(0.35 * SR)) / int(0.35 * SR), mode="same")
mus *= niv

# ducking: la música baja cuando habla la voz
v_env = lowpass(np.abs(voz), 4000)
duck = 1 - 0.55 * np.clip(v_env / (v_env.max() + 1e-9) * 4, 0, 1)
mus *= duck

# ---------------------------------------------------------------- efectos
sfx = np.zeros(N)


def barrido(d=0.6):
    n = int(d * SR)
    q = np.arange(n) / SR
    nz = rng.standard_normal(n)
    out = np.zeros(n)
    for k, f in enumerate(np.linspace(6, 60, 6)):
        out += lowpass(nz, int(f)) * (k + 1)
    return out / 12 * np.sin(np.pi * q / d) ** 2


def campana(f=1318.5, d=1.6):
    n = int(d * SR)
    q = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * q) + 0.4 * np.sin(2 * np.pi * f * 2.76 * q) + 0.2 * np.sin(2 * np.pi * f * 5.4 * q)) * np.exp(-3 * q) * env(n, 0.003, 0.1)


def brillo(d=1.2):
    out = np.zeros(int(d * SR))
    for k, f in enumerate((1760, 2093, 2637, 3136)):
        c = campana(f, d - k * 0.08)
        out[int(k * 0.06 * SR):int(k * 0.06 * SR) + len(c)] += c[: len(out) - int(k * 0.06 * SR)]
    return out


def golpe_suave():
    n = int(1.2 * SR)
    q = np.arange(n) / SR
    return np.sin(2 * np.pi * 55 * q * (1 - 0.3 * q)) * np.exp(-3.5 * q)


def trueno_snd(d=4.0):
    """Chasquido seco + retumbo grave que se aleja."""
    n = int(d * SR)
    q = np.arange(n) / SR
    nz = rng.standard_normal(n)
    crack = nz * np.exp(-14 * q)
    retumbo = lowpass(nz, 220) * 9 * (np.exp(-0.9 * q) * (1 + 0.6 * np.sin(2 * np.pi * 1.3 * q) * np.sin(2 * np.pi * 0.4 * q)))
    grave = np.sin(2 * np.pi * 38 * q + 3 * np.sin(2 * np.pi * 0.7 * q)) * np.exp(-1.1 * q) * 0.6
    return (crack * 0.5 + retumbo + grave) * env(n, 0.002, 0.8)


def lluvia_snd(d):
    """Lluvia: ruido filtrado continuo con gotas sueltas."""
    n = int(d * SR)
    nz = rng.standard_normal(n)
    base = (lowpass(nz, 3) - lowpass(nz, 40)) * 0.6 + lowpass(nz, 12) * 0.4
    gotas = np.zeros(n)
    for _ in range(int(d * 25)):
        a = rng.integers(0, max(1, n - 400))
        gotas[a:a + 300] += rng.standard_normal(300) * np.exp(-np.arange(300) / 40) * rng.uniform(0.3, 1)
    return (base + gotas * 0.3) * env(n, 0.6, 0.6)


def latido_snd():
    """Un latido: 'lub-dub' grave."""
    n = int(0.6 * SR)
    q = np.arange(n) / SR
    g = lambda t0, f, a: a * np.sin(2 * np.pi * f * (q - t0)) * np.exp(-28 * np.clip(q - t0, 0, None)) * (q >= t0)
    return g(0.0, 52, 1.0) + g(0.16, 46, 0.7)


def tic(f=3200):
    n = int(0.05 * SR)
    q = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * q) + 0.5 * rng.standard_normal(n)) * np.exp(-140 * q)


def subida_snd(d=2.2):
    """Riser: ruido y tono que suben hasta el momento clave (termina justo en la palabra)."""
    n = int(d * SR)
    q = np.arange(n) / SR
    f = 120 * (1 + 7 * (q / d) ** 2)
    tono = np.sin(2 * np.pi * np.cumsum(f) / SR)
    nz = lowpass(rng.standard_normal(n), 6)
    return (tono * 0.6 + nz * 0.5) * (q / d) ** 2.2


for ev in TL["eventos"]:
    tt = ev["t"]
    if ev["tipo"] == "latido":
        per = 60 / ev.get("bpm", 72)
        x = tt
        while x < ev["fin"]:
            add(sfx, latido_snd(), x, 0.55)
            x += per
    elif ev["tipo"] == "reloj":
        x, k = tt, 0
        while x < ev["fin"]:
            add(sfx, tic(3200 if k % 2 == 0 else 2600), x, 0.18)
            x += 0.5
            k += 1
    elif ev["tipo"] == "subida":
        add(sfx, subida_snd(), tt - 2.2, 0.22)
    elif ev["tipo"] == "rompe":  # barro que se rompe: golpe + crujido de trozos
        add(sfx, golpe_suave(), tt, 0.45)
        nz = rng.standard_normal(int(0.5 * SR)) * np.exp(-np.arange(int(0.5 * SR)) / SR * 9)
        add(sfx, nz - lowpass(nz, 6), tt, 0.35)
        for j in range(6):
            add(sfx, tic(rng.uniform(1500, 3500)), tt + 0.08 + j * rng.uniform(0.04, 0.09), 0.25)
    elif ev["tipo"] == "lanza":  # zumbido de la piedra en el aire
        add(sfx, barrido(0.9), tt, 0.12)
    elif ev["tipo"] == "revelar":
        add(sfx, brillo(1.8), tt + 0.2, 0.07)
    elif ev["tipo"] == "trueno":
        add(sfx, trueno_snd(), tt, 0.5)
    elif ev["tipo"] == "lluvia":
        add(sfx, lluvia_snd(ev["fin"] - tt + 0.6), tt - 0.3, 0.07 * ev.get("fuerza", 1.0))
    if ev["tipo"] == "transicion":
        add(sfx, barrido(0.7 if ev.get("tr") != "luz" else 1.0), tt - 0.35, 0.18)
        if ev.get("tr") == "luz":
            add(sfx, brillo(1.4), tt - 0.1, 0.10)
    elif ev["tipo"] == "clave":
        add(sfx, campana(1318.5), tt, 0.05)
    elif ev["tipo"] in ("cifra", "contador"):
        add(sfx, golpe_suave(), tt, 0.25)
        add(sfx, campana(987.8, 1.0), tt, 0.05)
    elif ev["tipo"] == "pergamino":
        add(sfx, brillo(1.6), tt, 0.09)
    elif ev["tipo"] == "cierre":
        add(sfx, brillo(2.0), tt + 0.2, 0.12)
        add(sfx, campana(1760, 1.2), tt + 1.9, 0.08)  # 'Siguiendo ✓'

mix = voz * 1.0 + mus * 0.55 + sfx
mix[: int(0.25 * SR)] *= np.linspace(0, 1, int(0.25 * SR))
mix[-int(0.8 * SR):] *= np.linspace(1, 0, int(0.8 * SR))
pk = np.abs(mix).max()
if pk > 0.98:
    mix *= 0.98 / pk
with wave.open(os.path.join(CARPETA, "audio.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())


def db(x):
    x = x[np.abs(x) > 1e-4]
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9) if len(x) else -120


print("AUDIO_OK {:.1f}s voz={:.1f}dB musica={:.1f}dB efectos={:.1f}dB".format(TOTAL, db(voz), db(mus * 0.55), db(sfx)))
