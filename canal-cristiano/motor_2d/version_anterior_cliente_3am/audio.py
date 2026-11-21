"""Mezcla de sonido: narración + ambiente + efectos sintetizados -> audio.wav

Uso:  python audio.py      (requiere timeline.json, generado por dibujos.py)
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
TOTAL = 120.0
N = int(TOTAL * SR)
STARTS = TL["starts"]
WORDS = []
for i in range(len(STARTS)):
    with open(os.path.join(HERE, "voz", "{:02d}.json".format(i)), encoding="utf-8") as f:
        WORDS.append(json.load(f))


def wt(i, sub):
    for w in WORDS[i]:
        if w["w"].lower().startswith(sub.lower()):
            return STARTS[i] + w["t"]
    return STARTS[i]


def add(buf, sig, t, gain=1.0):
    a = int(t * SR)
    if a >= N or a < 0:
        return
    sig = sig[: N - a]
    buf[a:a + len(sig)] += sig * gain


def tone(freq, dur, decay=0.0, attack=0.004):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * freq * t)
    env = np.minimum(1.0, t / attack)
    if decay:
        env = env * np.exp(-decay * t)
    return s * env


rng = np.random.default_rng(3)
t = np.arange(N) / SR

# ---- narración
voz = np.zeros(N)
for i, st in enumerate(STARTS):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", os.path.join(HERE, "voz", "{:02d}.mp3".format(i)), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True, check=True).stdout
    add(voz, np.frombuffer(raw, dtype=np.float32).astype(np.float64), st)
voz *= 0.9 / max(1e-6, np.abs(voz).max())

# ---- ambiente: zumbido grave que crece con la tensión
tension = np.clip((t - STARTS[6]) / (STARTS[18] - STARTS[6]), 0, 1)
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 82.2 * t) + 0.5 * np.sin(2 * np.pi * 110.4 * t)
         + 0.35 * np.sin(2 * np.pi * 116.5 * t) * tension)
drone *= (0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t)) * (0.055 + 0.05 * tension)
noise = rng.standard_normal(N)
k = np.ones(400) / 400
room = np.convolve(noise, k, mode="same") * 0.10
amb = drone + room

# ---- latidos desde las 3:00
fx = np.zeros(N)
tb = STARTS[7]
while tb < STARTS[19]:
    prog = (tb - STARTS[7]) / (STARTS[19] - STARTS[7])
    g = 0.16 + 0.22 * prog
    add(fx, tone(52, 0.22, decay=22), tb, g)
    add(fx, tone(46, 0.22, decay=24), tb + 0.19, g * 0.7)
    tb += 1.05 - 0.4 * prog


def ding(tt):
    for dt in (0.0, 0.32):
        for fq, g in ((1318.5, 0.16), (2637.0, 0.08), (3955.0, 0.04), (1975.5, 0.05)):
            add(fx, tone(fq, 1.6, decay=3.2), tt + dt, g)


ding(wt(7, "campana") - 0.3)
ding(wt(11, "campana") - 0.3)

# monedas
t0 = wt(9, "tres") - 0.1
for kk in range(3):
    for fq, g in ((4200 + kk * 350, 0.08), (6100 + kk * 200, 0.05)):
        add(fx, tone(fq, 0.25, decay=28), t0 + kk * 0.28 + 0.27, g)

# vibración del teléfono
tv = STARTS[15]
for kk in range(3):
    tt = np.arange(int(0.4 * SR)) / SR
    buzz = np.sign(np.sin(2 * np.pi * 155 * tt)) * 0.5 + np.sin(2 * np.pi * 155 * tt)
    buzz *= np.minimum(1, tt / 0.02) * np.minimum(1, (0.4 - tt) / 0.03)
    add(fx, buzz, tv + kk * 0.6, 0.07)

# mensaje
add(fx, tone(880, 0.09, decay=20), STARTS[16] - 0.25, 0.12)
add(fx, tone(1174.7, 0.16, decay=14), STARTS[16] - 0.15, 0.12)

# la sonrisa: disonancia que crece
ts = wt(12, "sonríe") - 0.9
dur = 2.6
tt = np.arange(int(dur * SR)) / SR
sw = (np.sin(2 * np.pi * 220 * tt) + np.sin(2 * np.pi * 233.1 * tt) + 0.6 * np.sin(2 * np.pi * 466.2 * tt) + 0.5 * np.sin(2 * np.pi * 311.1 * tt))
sw *= np.minimum(1, tt / 1.3) ** 2 * np.minimum(1, (dur - tt) / 0.8)
add(fx, sw, ts, 0.06)

# goteo
td = STARTS[18]
kk = 0
while td < TOTAL - 1.0:
    d = 0.09
    tt = np.arange(int(d * SR)) / SR
    fq = 1500 - 900 * (tt / d)
    drop = np.sin(2 * np.pi * np.cumsum(fq) / SR) * np.exp(-30 * tt)
    add(fx, drop, td, 0.16)
    td += 0.75 - 0.03 * min(kk, 8)
    kk += 1

# golpe final al aparecer la sonrisa detrás de ella
th = STARTS[18] + TL["ends"][18] - 0.1
add(fx, tone(38, 1.8, decay=2.6), th, 0.5)
nb = rng.standard_normal(int(1.2 * SR)) * np.exp(-5 * np.arange(int(1.2 * SR)) / SR)
add(fx, np.convolve(nb, np.ones(60) / 60, mode="same"), th, 0.35)

mix = voz * 1.0 + amb + fx
fade = np.clip((TOTAL - t) / 1.5, 0, 1) * np.clip(t / 0.3, 0, 1)
mix = np.tanh(mix * 1.15) * fade
pcm = (np.clip(mix, -1, 1) * 32000).astype(np.int16)
with wave.open(os.path.join(HERE, "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(np.repeat(pcm[:, None], 2, axis=1).tobytes())


def db(x):
    return 20 * np.log10(max(1e-9, np.sqrt(np.mean(x ** 2))))


print("AUDIO_OK dur={:.2f}s voz={:.1f}dB ambiente={:.1f}dB efectos={:.1f}dB pico={:.2f}".format(N / SR, db(voz[voz != 0]), db(amb), db(fx), np.abs(mix).max()))
