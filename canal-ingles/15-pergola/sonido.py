"""Sonido del capítulo. Uso: python3 canal-ingles/<carpeta>/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *
CARPETA = os.path.basename(os.path.dirname(os.path.abspath(__file__)))

def eventos(fx, S, T):
    p = S.poner
    if CARPETA.startswith("15"):
        for k in range(6): p(fx, crujido(0.25), 0.2 + k * 0.33, db(-12))                                       # la pérgola cruje
        p(fx, whoosh(0.5), 0.0, db(-8)); p(fx, golpe(55, 0.6, 0.8), 0.05, db(-5))
        pide_seguir(fx, p, T[1]); p(fx, golpe(140, 0.2, 0.9), T[2] + 0.2, db(-12))
        p(fx, crujido(1.0), T[3] + 0.3, db(-8)); p(fx, golpe(70, 0.4, 0.9), T[3] + 1.1, db(-9))
        p(fx, whoosh(1.6), T[4] + 0.1, db(-11)); [p(fx, crujido(0.3), T[4] + 0.3 + k * 0.48, db(-13)) for k in range(5)]
        p(fx, boing(0.4), T[5] + 0.05, db(-13)); p(fx, campanita(1568, 0.5), T[6] + 0.2, db(-11))
        for k in range(4): p(fx, golpe(160, 0.15, 0.9), T[7] + 0.35 + k * 0.08, db(-12))
        p(fx, campanita(1318, 0.4), T[7] + 0.9, db(-13))
        for k in range(4): p(fx, golpe(160, 0.15, 0.9), T[8] + 0.35 + k * 0.08, db(-12))
        p(fx, boing(0.4), T[9] + 0.05, db(-13)); p(fx, vertido(1.0), T[10] + 0.3, db(-12))
    else:
        p(fx, metal(600, 0.5), 0.55, db(-8)); p(fx, chasquido(), 0.7, db(-6)); p(fx, golpe(55, 0.7, 0.8), 1.1, db(-3)); p(fx, boing(0.4), 1.25, db(-12))
        pide_seguir(fx, p, T[1]); p(fx, metal(900, 0.3), T[2] + 0.4, db(-14)); p(fx, metal(900, 0.3), T[2] + 0.9, db(-14))
        p(fx, golpe(200, 0.15, 1.0), T[3] + 0.4, db(-12)); p(fx, campanita(1318, 0.4), T[3] + 0.9, db(-13))
        for k in range(4): p(fx, crujido(0.3), T[4] + 0.5 + k * 0.9, db(-13))
        p(fx, boing(0.4), T[5] + 0.05, db(-13)); p(fx, whoosh(0.8), T[6] + 0.3, db(-11)); p(fx, whoosh(0.8), T[6] + 1.3, db(-11))
        p(fx, boing(0.4), T[7] + 0.05, db(-13)); p(fx, metal(500, 0.5), T[8] + 0.5, db(-10)); p(fx, campanita(1568, 0.5), T[8] + 0.8, db(-12))
        p(fx, metal(1100, 0.3), T[9] + 0.4, db(-11)); p(fx, campanita(1760, 0.4), T[10] + 0.3, db(-12)); p(fx, metal(1400, 0.2), T[10] + 0.3, db(-14))
    p(fx, golpe(80, 0.5, 0.9), T[11] + 0.6, db(-6)); p(fx, campanita(1568, 0.8), T[11] + 0.65, db(-11))
    equipos(fx, p, T[12], T[13])
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
