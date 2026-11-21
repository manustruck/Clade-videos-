"""Sonido del capítulo 7 «Your gutter is flooding your basement». Uso: python3 canal-ingles/07-gutter/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *

def agua(dur, lo=800, hi=4500, mod=11):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [lo, hi]) * (0.6 + 0.4 * np.sin(2 * np.pi * mod * tt)) * np.minimum(tt / 0.2, 1) * np.minimum((dur - tt) / 0.3, 1)
def glug(f=300):
    n = int(0.18 * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f + 600 * tt / 0.18) / SR) * np.exp(-tt * 18)

def eventos(fx, S, T):
    p = S.poner
    p(fx, whoosh(0.5), 0.0, db(-8)); p(fx, golpe(48, 0.9, 0.8), 0.05, db(-4)); p(fx, agua(T[1] - 0.3, 500, 3500, 7), 0.2, db(-17))   # gancho: el sótano inundado
    p(fx, whoosh(0.4), T[1], db(-12))
    p(fx, agua(T[3] - T[2] - 1.2, 900, 5000, 13), T[2] + 1.1, db(-20))                                                     # el agua baja por el bajante
    p(fx, campanita(1047, 0.4), T[3] + 0.3, db(-14))
    for k in range(7): p(fx, glug(260 + 40 * k), T[4] + 0.9 + k * 0.22, db(-15))                                           # la tierra se empapa
    p(fx, crujido(1.8), T[5] + 0.5, db(-12)); p(fx, chasquido(), T[5] + 0.95, db(-6)); p(fx, agua(T[6] + 2.0 - T[5] - 1.3, 1500, 6500, 17), T[5] + 1.3, db(-17))
    p(fx, agua(2.4, 100, 700, 3), T[6] + 0.2, db(-16))
    p(fx, boing(0.6), T[7] + 0.05, db(-11)); p(fx, campanita(2100, 0.3), T[7] + 0.45, db(-12)); p(fx, golpe(60, 0.6, 0.8), T[7] + 0.1, db(-9))
    for k, fr in enumerate([1047, 1319, 1568]): p(fx, campanita(fr, 0.6), T[8] + 0.05 + k * 0.12, db(-13))
    for k in range(3): p(fx, metal(600 + 150 * k, 0.4), T[9] + 0.4 + k * 0.3, db(-12)); p(fx, golpe(120, 0.15, 0.9), T[9] + 0.4 + k * 0.3, db(-12))
    p(fx, agua(T[12] - T[9] - 2.2, 600, 3500, 6), T[9] + 1.8, db(-21))                                                     # el agua se va lejos
    p(fx, whoosh(1.0), T[10] + 0.5, db(-18)); p(fx, campanita(1319, 0.5), T[11] + 0.5, db(-13)); p(fx, campanita(1760, 0.5), T[11] + 0.65, db(-14))
    pops(fx, p, T[12] + 0.05); p(fx, golpe(80, 0.5, 0.9), T[12] + 1.8, db(-5)); p(fx, campanita(1568, 0.8), T[12] + 1.85, db(-11))
    for k, fr in enumerate([880, 1175, 1568]): p(fx, campanita(fr, 0.3), T[13] + 0.1 + k * 0.45, db(-13))
    p(fx, campanita(1760, 0.7), T[14] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[14] + 0.22, db(-12))

def lluvia(t, T):
    return np.clip((t - (T[2] + 0.8)) / 0.5, 0, 1) * np.clip((T[8] - t) / 0.4, 0, 1) + np.clip((t - (T[9] + 0.4)) / 0.5, 0, 1) * np.clip(((T[12] + 0.8) - t) / 0.4, 0, 1)

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos, lluvia)
