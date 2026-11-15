"""Sonido del capítulo 6 «Your pavers will wave». Uso: python3 canal-ingles/06-pavers/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *

def piedras(dur, n=65):
    g = np.zeros(int(dur * SR))
    for _ in range(n):
        x = golpe(700 + 1200 * rng.random(), 0.06, 1.0); a = int(rng.random() * (len(g) - len(x))); g[a:a + len(x)] += x * 0.5
    return g
def motor(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [70, 320]) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 28 * tt))) * np.minimum(tt / 0.1, 1) * np.minimum((dur - tt) / 0.15, 1)
def aire(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [300, 1200]) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * tt)) * np.minimum(tt / 0.5, 1) * np.minimum((dur - tt) / 0.5, 1)

def eventos(fx, S, T):
    p = S.poner
    # gancho: golpe de entrada + el patio ya ondulado y Norm de cara al suelo
    p(fx, whoosh(0.5), 0.0, db(-8)); p(fx, golpe(48, 0.9, 0.8), 0.05, db(-4)); p(fx, chasquido(), 0.8, db(-7)); p(fx, golpe(55, 0.8, 0.6), 1.0, db(-6))
    p(fx, whoosh(0.4), T[1], db(-12))
    for i in range(11): p(fx, golpe(170, 0.1, 0.9), T[2] + 0.55 + i * 0.16, db(-13)); p(fx, campanita(1568, 0.15), T[2] + 0.55 + i * 0.16, db(-24))
    p(fx, campanita(1047, 0.4), T[3] + 0.3, db(-14))
    p(fx, aire(T[6] - T[4] - 1.8), T[4] + 1.7, db(-27))
    p(fx, crujido(4.2), T[5] + 0.4, db(-12)); p(fx, roce(3.5), T[5] + 0.6, db(-20))
    for k in range(5): p(fx, golpe(190, 0.07, 0.9), T[6] + 0.3 + k * 0.28, db(-13))
    p(fx, roce(0.3), T[6] + 1.6, db(-11)); p(fx, golpe(55, 0.7, 0.7), T[6] + 2.1, db(-6))
    p(fx, boing(0.6), T[7] + 0.05, db(-11)); p(fx, campanita(2100, 0.3), T[7] + 0.45, db(-12))
    for k, fr in enumerate([1047, 1319, 1568]): p(fx, campanita(fr, 0.6), T[8] + 0.05 + k * 0.12, db(-13))
    for k in range(4): p(fx, roce(0.3), T[8] + 0.2 + k * 0.28, db(-12)); p(fx, golpe(90, 0.2, 0.6), T[8] + 0.45 + k * 0.28, db(-14))
    p(fx, piedras(0.7), T[9] + 0.1, db(-14)); p(fx, motor(0.8), T[9] + 0.8, db(-12)); p(fx, piedras(0.6), T[9] + 1.5, db(-14)); p(fx, motor(0.9), T[9] + 2.1, db(-12))
    p(fx, vertido(0.5), T[10] + 0.1, db(-17)); p(fx, roce(1.1), T[10] + 0.6, db(-14))
    for i in range(11): p(fx, golpe(230, 0.06, 1.0), T[10] + 2.0 + i * 0.12, db(-14))
    p(fx, metal(500, 0.5), T[11] + 0.7, db(-11)); p(fx, golpe(80, 0.3, 0.9), T[11] + 0.7, db(-10))
    for k in range(4): p(fx, golpe(140, 0.1, 0.9), T[11] + 1.0 + k * 0.14, db(-11)); p(fx, metal(1300, 0.2), T[11] + 1.0 + k * 0.14, db(-18))
    pops(fx, p, T[12] + 0.05); p(fx, golpe(80, 0.5, 0.9), T[12] + 1.8, db(-5)); p(fx, campanita(1568, 0.8), T[12] + 1.85, db(-11))
    for k, fr in enumerate([880, 1175, 1568]): p(fx, campanita(fr, 0.3), T[13] + 0.1 + k * 0.45, db(-13))
    p(fx, campanita(1760, 0.7), T[14] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[14] + 0.22, db(-12))

def lluvia(t, T):
    return np.clip((t - T[4]) / 0.3, 0, 1) * np.clip((T[4] + 1.9 - t) / 0.3, 0, 1) + np.clip((t - T[5]) / 0.3, 0, 1) * np.clip((T[5] + 1.5 - t) / 0.3, 0, 1)

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos, lluvia)
