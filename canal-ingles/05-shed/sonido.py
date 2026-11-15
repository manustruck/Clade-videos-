"""Sonido del capítulo 5 «Your shed is sinking». Uso: python3 canal-ingles/05-shed/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *

def piedras(dur, n=65):
    g = np.zeros(int(dur * SR))
    for _ in range(n):
        x = golpe(700 + 1200 * rng.random(), 0.06, 1.0); a = int(rng.random() * (len(g) - len(x))); g[a:a + len(x)] += x * 0.5
    return g

def eventos(fx, S, T):
    p = S.poner
    p(fx, roce(1.2), 0.15, db(-14)); p(fx, crujido(0.9), 0.4, db(-10)); p(fx, golpe(55, 0.8, 0.6), 1.15, db(-6))          # el gancho: ya hundido
    p(fx, golpe(70, 0.5, 0.7), T[2] + 1.0, db(-8)); p(fx, golpe(60, 0.4, 0.5), T[2] + 1.4, db(-11))                      # se apoya en el pasto
    p(fx, campanita(1047, 0.4), T[3] + 0.3, db(-14))
    p(fx, crujido(3.6), T[5] + 0.8, db(-12)); p(fx, roce(2.5), T[5] + 0.2, db(-18))                                      # el suelo cede
    for k in range(6): p(fx, golpe(110, 0.12, 0.8), T[6] + 0.2 + k * 0.2, db(-12))                                       # la puerta no abre
    p(fx, crujido(0.8), T[6] + 1.7, db(-12))
    p(fx, boing(0.6), T[7] + 0.05, db(-11)); p(fx, campanita(2100, 0.3), T[7] + 0.4, db(-12))
    for k, fr in enumerate([1047, 1319, 1568]): p(fx, campanita(fr, 0.6), T[8] + 0.05 + k * 0.12, db(-13))
    for k in range(5): p(fx, roce(0.3), T[9] + 0.3 + k * 0.28, db(-12)); p(fx, golpe(90, 0.2, 0.6), T[9] + 0.55 + k * 0.28, db(-14))   # la pala
    p(fx, piedras(1.4), T[9] + 2.0, db(-14))                                                                              # la piedra
    for k in range(3): p(fx, golpe(60, 0.25, 0.9), T[10] + 0.3 + k * 0.7, db(-8))                                         # el compactador
    p(fx, metal(1300, 0.5), T[10] + 2.15, db(-12)); p(fx, campanita(1568, 0.4), T[10] + 2.7, db(-12))                    # el nivel
    p(fx, golpe(55, 0.8, 0.6), T[11] + 0.7, db(-6)); p(fx, golpe(80, 0.3, 0.5), T[11] + 1.05, db(-12))
    p(fx, crujido(0.9), T[12] + 0.4, db(-12)); p(fx, whoosh(0.9), T[12] + 0.35, db(-18)); pops(fx, p, T[12] + 0.05)
    p(fx, golpe(80, 0.5, 0.9), T[12] + 1.5, db(-5)); p(fx, campanita(1568, 0.8), T[12] + 1.55, db(-11))
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

def lluvia(t, T):
    return np.clip((t - T[4]) / 0.6, 0, 1) * np.clip((T[8] - t) / 0.6, 0, 1) + np.clip((t - (T[11] + 1.0)) / 0.4, 0, 1) * np.clip(((T[12] + 0.8) - t) / 0.4, 0, 1)

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos, lluvia)
