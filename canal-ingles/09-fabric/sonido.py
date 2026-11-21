"""Sonido del capítulo 9 «Is landscape fabric a scam?». Uso: python3 canal-ingles/09-fabric/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *

def rasgado(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [900, 6000]) * (0.4 + 0.6 * (rng.random(n) > 0.6)) * np.minimum(tt / 0.05, 1) * np.minimum((dur - tt) / 0.1, 1)
def barro(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    return filtro(rng.standard_normal(n), "band", [80, 500]) * (0.5 + 0.5 * np.sin(2 * np.pi * 2.5 * tt)) * np.minimum(tt / 0.3, 1) * np.minimum((dur - tt) / 0.3, 1)

def eventos(fx, S, T):
    p = S.poner
    p(fx, whoosh(0.5), 0.0, db(-8)); p(fx, golpe(48, 0.9, 0.8), 0.05, db(-4))
    for k in range(5): p(fx, boing(0.25), 0.15 + k * 0.16, db(-17))                                                    # las malezas brotan
    pide_seguir(fx, p, T[1])
    p(fx, roce(0.7), T[2] + 0.05, db(-14)); p(fx, vertido(0.8), T[2] + 0.8, db(-15)); p(fx, whoosh(0.6), T[2] + 2.5, db(-14))
    for k in range(5): p(fx, boing(0.25), T[2] + 3.4 + k * 0.15, db(-17))
    for k in range(8): p(fx, golpe(1400, 0.03, 1.0), T[3] + 1.6 + k * 0.25, db(-24))                                    # semillas
    p(fx, crujido(1.4), T[4] + 0.2, db(-12))
    p(fx, rasgado(1.1), T[5] + 0.5, db(-10)); p(fx, golpe(70, 0.4, 0.6), T[5] + 1.5, db(-10))
    p(fx, golpe(60, 0.5, 0.9), T[6], db(-6)); p(fx, metal(400, 0.4), T[6] + 0.02, db(-13))
    p(fx, whoosh(0.5), T[7], db(-14)); p(fx, barro(2.0), T[8] + 0.2, db(-13))
    p(fx, boing(0.5), T[9] + 0.1, db(-12))
    p(fx, campanita(988, 0.4), T[10] + 0.35, db(-12)); p(fx, campanita(1568, 0.5), T[10] + 2.2, db(-12))
    p(fx, golpe(80, 0.5, 0.9), T[11] + 0.65, db(-6)); p(fx, campanita(1568, 0.8), T[11] + 0.7, db(-11))
    equipos(fx, p, T[12], T[13])
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
