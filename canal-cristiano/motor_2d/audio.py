"""Sonido de 'El grupo del edificio': narración + música sintetizada + efectos -> audio.wav

Los tiempos de los efectos salen de timeline.json (lo escribe motor.py).
"""
import json
import os
import subprocess
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 44100
with open(os.path.join(HERE, "timeline.json"), encoding="utf-8") as f:
    TL = json.load(f)
TOTAL = TL["total"]
N = int(TOTAL * SR)
STARTS, ENDS, EVENTS = TL["starts"], TL["ends"], TL["events"]
rng = np.random.default_rng(7)
t = np.arange(N) / SR


def add(buf, sig, tt, gain=1.0):
    a = int(tt * SR)
    if a >= N:
        return
    if a < 0:
        sig = sig[-a:]
        a = 0
    sig = sig[: N - a]
    buf[a:a + len(sig)] += sig * gain


def tone(freq, dur, decay=0.0, attack=0.004):
    q = np.arange(int(dur * SR)) / SR
    env = np.minimum(1.0, q / attack)
    if decay:
        env = env * np.exp(-decay * q)
    return np.sin(2 * np.pi * freq * q) * env


def ruido(dur, suave=1):
    nb = rng.standard_normal(int(dur * SR))
    return np.convolve(nb, np.ones(suave) / suave, mode="same") if suave > 1 else nb


# ---------------------------------------------------------------- narración
voz = np.zeros(N)
for i, st in enumerate(STARTS):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", os.path.join(HERE, "voz", "{:02d}.mp3".format(i)), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True, check=True).stdout
    add(voz, np.frombuffer(raw, dtype=np.float32).astype(np.float64), st)
voz *= 0.92 / max(1e-6, np.abs(voz).max())
env = np.convolve(np.abs(voz), np.ones(int(0.12 * SR)) / int(0.12 * SR), mode="same")
duck = 1 - 0.5 * np.clip(env / max(1e-6, env.max()) * 3, 0, 1)

# ---------------------------------------------------------------- música
T_TENSION = STARTS[9]
T_FIN = next(tt for k, tt in EVENTS if k == "bum")
musica = np.zeros(N)
PASO = 60 / 104 / 2
ACORDES = [(110.0, 164.8, 220.0, 261.6), (87.3, 130.8, 174.6, 220.0), (73.4, 110.0, 146.8, 174.6), (82.4, 123.5, 164.8, 207.7)]
PATRON = (0, 1, 2, 3, 1, 2, 3, 2)
k = 0
tt = 0.0
while tt < T_FIN:
    ac = ACORDES[(k // 8) % 4]
    f = ac[PATRON[k % 8]] * 2
    q = np.arange(int(0.5 * SR)) / SR
    nota = (np.sin(2 * np.pi * f * q) + 0.4 * np.sin(4 * np.pi * f * q) + 0.2 * np.sin(6 * np.pi * f * q)) * np.exp(-8 * q) * np.minimum(1, q / 0.004)
    add(musica, nota, tt, 0.05 if tt < T_TENSION else 0.065)
    if k % 8 == 0:
        q = np.arange(int(PASO * 8 * SR)) / SR
        bajo = np.sin(2 * np.pi * ac[0] / 2 * q) * np.minimum(1, q / 0.05) * np.minimum(1, (PASO * 8 - q) / 0.1)
        add(musica, bajo, tt, 0.10)
    if k % 2 == 0 and tt > STARTS[5]:
        add(musica, tone(58, 0.2, decay=22), tt, 0.14)
    if k % 2 == 1 and tt > T_TENSION:
        add(musica, ruido(0.03) * np.exp(-120 * np.arange(int(0.03 * SR)) / SR), tt, 0.03)
    tt += PASO
    k += 1
tension = np.clip((t - T_TENSION) / (T_FIN - T_TENSION), 0, 1)
pad = (np.sin(2 * np.pi * 220 * t) + np.sin(2 * np.pi * 233.1 * t) + 0.5 * np.sin(2 * np.pi * 329.6 * t)) * 0.022 * tension ** 2
drone = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t)) * (0.04 + 0.04 * tension)
sala = np.convolve(rng.standard_normal(N), np.ones(400) / 400, mode="same") * 0.08
musica = (musica + pad) * (t < T_FIN) + drone + sala

# ---------------------------------------------------------------- efectos
fx = np.zeros(N)
silencios = []


def golpe(tt, g=0.55, low=64):
    add(fx, tone(low, 0.3, decay=22), tt, g)
    add(fx, tone(low * 2.3, 0.12, decay=45), tt, g * 0.5)
    add(fx, ruido(0.03) * np.exp(-150 * np.arange(int(0.03 * SR)) / SR), tt, g * 0.35)
    add(fx, tone(low, 0.3, decay=22), tt + 0.09, g * 0.25)


def impacto(tt, g=0.6):
    add(fx, tone(40, 1.4, decay=3.2), tt, g)
    add(fx, ruido(0.9, 50) * np.exp(-6 * np.arange(int(0.9 * SR)) / SR), tt, g * 0.6)
    d = 0.5
    q = np.arange(int(d * SR)) / SR
    add(fx, ruido(d, 12) * (q / d) ** 3, tt - d, 0.35)


for kind, tt in EVENTS:
    if kind == "whoosh":
        d = 0.3
        q = np.arange(int(d * SR)) / SR
        add(fx, ruido(d, 36) * np.sin(np.pi * q / d) ** 2, tt - 0.06, 0.55)
    elif kind == "pop":
        q = np.arange(int(0.08 * SR)) / SR
        add(fx, np.sin(2 * np.pi * np.cumsum(620 + 3500 * q) / SR) * np.exp(-28 * q), tt, 0.16)
    elif kind == "sys":
        add(fx, tone(520, 0.07, decay=45), tt, 0.14)
        add(fx, tone(390, 0.09, decay=40), tt + 0.05, 0.12)
    elif kind == "alerta":
        add(fx, tone(392, 0.16, decay=14), tt, 0.16)
        add(fx, tone(311.1, 0.26, decay=10), tt + 0.11, 0.16)
        add(fx, tone(48, 0.5, decay=8), tt, 0.3)
    elif kind == "golpe":
        golpe(tt)
    elif kind == "vib":
        for j in range(2):
            q = np.arange(int(0.34 * SR)) / SR
            b = (np.sign(np.sin(2 * np.pi * 155 * q)) * 0.5 + np.sin(2 * np.pi * 155 * q)) * np.minimum(1, q / 0.02) * np.minimum(1, (0.34 - q) / 0.03)
            add(fx, b, tt + j * 0.45, 0.07)
    elif kind == "tic":
        add(fx, tone(1800, 0.04, decay=80), tt, 0.14)
    elif kind == "clic":
        add(fx, ruido(0.02) * np.exp(-200 * np.arange(int(0.02 * SR)) / SR), tt, 0.4)
        add(fx, tone(2400, 0.05, decay=70), tt + 0.01, 0.16)
        add(fx, tone(140, 0.1, decay=40), tt + 0.02, 0.3)
    elif kind == "chirrido":
        d = 1.3
        q = np.arange(int(d * SR)) / SR
        fq = 360 - 170 * (q / d) + 25 * np.sin(2 * np.pi * 5 * q)
        ph = 2 * np.pi * np.cumsum(fq) / SR
        cr = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * (0.5 + 0.5 * np.sin(2 * np.pi * 11 * q) ** 2)
        add(fx, cr * np.minimum(1, q / 0.15) * np.minimum(1, (d - q) / 0.3), tt, 0.07)
    elif kind == "impacto":
        impacto(tt, 0.55)
    elif kind == "bum":
        impacto(tt, 0.8)
    elif kind == "silencio":
        silencios.append(tt)

# latidos desde que la pantalla se enciende
tb = STARTS[8]
while tb < T_FIN:
    prog = (tb - STARTS[8]) / (T_FIN - STARTS[8])
    g = 0.14 + 0.24 * prog
    add(fx, tone(52, 0.22, decay=22), tb, g)
    add(fx, tone(46, 0.22, decay=24), tb + 0.18, g * 0.7)
    tb += 1.0 - 0.45 * prog

# silencio total antes de los golpes
cama = np.ones(N)
for ts in silencios:
    a, b = ts, ts + 0.6
    cama *= 1 - np.clip((t - a) / 0.06, 0, 1) * np.clip((b - t) / 0.06, 0, 1)

mix = voz + musica * duck * cama + fx * np.where(cama < 0.5, 0.0, 1.0) + fx * np.where(cama < 0.5, 1.0, 0.0) * (t > 0) * 0
fade = np.clip((TOTAL - t) / 1.2, 0, 1) * np.clip(t / 0.02, 0, 1)
mix = np.tanh(mix * 1.15) * fade
pcm = (np.clip(mix, -1, 1) * 32000).astype(np.int16)
with wave.open(os.path.join(HERE, "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())


def db(x):
    return 20 * np.log10(max(1e-9, np.sqrt(np.mean(x ** 2))))


print("AUDIO_OK dur={:.2f}s voz={:.1f}dB musica={:.1f}dB efectos={:.1f}dB pico={:.2f} eventos={}".format(
    N / SR, db(voz[voz != 0]), db(musica * duck), db(fx), np.abs(mix).max(), len(EVENTS)))
