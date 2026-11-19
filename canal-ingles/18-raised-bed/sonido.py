"""Sonido del capítulo. Uso: python3 canal-ingles/<carpeta>/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *
CARPETA = os.path.basename(os.path.dirname(os.path.abspath(__file__)))

def eventos(fx, S, T):
    p = S.poner
    if CARPETA.startswith("17"):
        p(fx, whoosh(0.5), 0.0, db(-8)); p(fx, golpe(55, 0.6, 0.8), 0.05, db(-6))
        for k in range(8): p(fx, golpe(900, 0.05, 1.0), 0.3 + k * 0.14, db(-18))                                  # martillazos
        pide_seguir(fx, p, T[1])
        for k in range(10): p(fx, golpe(900, 0.05, 1.0), T[2] + 0.3 + k * 0.12, db(-18))
        p(fx, crujido(1.2), T[3] + 0.5, db(-12)); p(fx, crujido(1.6), T[4] + 0.6, db(-10))
        p(fx, boing(0.4), T[5] + 0.05, db(-13)); p(fx, campanita(1568, 0.5), T[6] + 0.3, db(-12))
        for k in range(6): p(fx, chasquido(), T[7] + 0.35 + k * 0.08, db(-16))                                     # salen los clavos
        p(fx, metal(500, 0.5), T[7] + 0.7, db(-9)); p(fx, metal(500, 0.5), T[7] + 0.9, db(-9))
        p(fx, boing(0.3), T[8] + 0.02, db(-14)); p(fx, roce(0.7), T[9] + 0.2, db(-12)); p(fx, whoosh(1.2), T[10] + 0.2, db(-14))
    else:
        p(fx, crujido(0.9), 0.1, db(-8)); p(fx, golpe(60, 0.5, 0.9), 0.95, db(-3)); p(fx, vertido(1.0), 1.0, db(-8))
        pide_seguir(fx, p, T[1]); p(fx, vertido(0.8), T[2] + 0.3, db(-14))
        p(fx, vertido(1.6), T[3] + 0.1, db(-14)); p(fx, crujido(1.2), T[3] + 1.2, db(-13)); p(fx, crujido(1.4), T[4] + 0.3, db(-11))
        p(fx, boing(0.4), T[5] + 0.05, db(-13)); p(fx, golpe(140, 0.2, 0.9), T[6] + 1.6, db(-9)); p(fx, campanita(1568, 0.5), T[6] + 1.7, db(-12))
        p(fx, metal(1100, 0.3), T[7] + 1.0, db(-12)); p(fx, golpe(140, 0.2, 0.9), T[8] + 0.95, db(-9)); p(fx, golpe(140, 0.2, 0.9), T[8] + 1.05, db(-9))
        p(fx, boing(0.4), T[9] + 0.05, db(-13)); p(fx, metal(1400, 0.2), T[10] + 0.5, db(-14)); p(fx, metal(1400, 0.2), T[10] + 0.8, db(-14)); p(fx, golpe(80, 0.4, 0.9), T[10] + 1.8, db(-9))
    p(fx, golpe(80, 0.5, 0.9), T[11] + 0.6, db(-6)); p(fx, campanita(1568, 0.8), T[11] + 0.65, db(-11))
    equipos(fx, p, T[12], T[13])
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
