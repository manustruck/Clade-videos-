"""Sonido del capítulo 12 «Lines in concrete: just for looks?». Uso: python3 canal-ingles/12-concrete-slab/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *

def sierra(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * 180 * tt) + 0.5 * np.sin(2 * np.pi * 360 * tt) + 0.4 * filtro(rng.standard_normal(n), "band", [2000, 7000])
    return s * 0.3 * np.minimum(tt / 0.08, 1) * np.minimum((dur - tt) / 0.1, 1)

def eventos(fx, S, T):
    p = S.poner
    p(fx, whoosh(0.5), 0.0, db(-8)); p(fx, crujido(1.0), 0.3, db(-6)); p(fx, golpe(50, 0.6, 0.7), 1.1, db(-6))      # se agrieta
    pide_seguir(fx, p, T[1])
    p(fx, campanita(1318, 0.4), T[2] + 0.25, db(-13))
    p(fx, roce(1.5), T[3] + 0.3, db(-14))                                                                           # encoge
    p(fx, crujido(1.3), T[4] + 0.6, db(-6)); p(fx, golpe(50, 0.6, 0.7), T[4] + 1.7, db(-7))
    p(fx, boing(0.4), T[5] + 0.1, db(-13))
    p(fx, whoosh(0.5), T[6] + 0.1, db(-10)); p(fx, golpe(70, 0.5, 0.9), T[6] + 0.75, db(-5))                        # losa nueva
    p(fx, sierra(1.1), T[6] + 0.9, db(-11)); p(fx, sierra(1.1), T[6] + 2.05, db(-11))
    p(fx, crujido(0.6), T[6] + 3.4, db(-16)); p(fx, campanita(1568, 0.5), T[6] + 3.6, db(-12))
    p(fx, whoosh(0.4), T[7] + 0.1, db(-14)); p(fx, campanita(1175, 0.4), T[7] + 0.3, db(-13))
    p(fx, campanita(1760, 0.4), T[8] + 0.3, db(-13))
    p(fx, boing(0.4), T[9] + 0.05, db(-13))
    p(fx, whoosh(0.4), T[10] + 0.1, db(-12)); p(fx, vertido(1.0), T[10] + 0.5, db(-12)); p(fx, golpe(90, 0.3, 0.8), T[10] + 2.2, db(-8))
    p(fx, golpe(80, 0.5, 0.9), T[11] + 0.55, db(-6)); p(fx, campanita(1568, 0.8), T[11] + 0.6, db(-11))
    equipos(fx, p, T[12], T[13])
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
