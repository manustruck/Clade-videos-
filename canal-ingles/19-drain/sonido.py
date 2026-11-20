"""Sonido del capítulo. Uso: python3 canal-ingles/<carpeta>/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *
CARPETA = os.path.basename(os.path.dirname(os.path.abspath(__file__)))

def eventos(fx, S, T):
    p = S.poner
    p(fx, whoosh(0.5), 0.0, db(-7)); p(fx, golpe(50, 0.7, 0.8), 0.05, db(-4))
    for a in T[1:13]: p(fx, whoosh(0.25), a - 0.06, db(-15))                                                      # barrido en cada corte
    pide_seguir(fx, p, T[1])
    if CARPETA.startswith("19"):
        p(fx, vertido(1.2), 0.3, db(-12)); p(fx, vertido(1.0), T[2] + 0.4, db(-15))
        p(fx, vertido(1.5), T[3] + 0.6, db(-13)); p(fx, golpe(70, 0.4, 0.9), T[3] + 1.4, db(-9)); p(fx, crujido(1.2), T[4] + 0.6, db(-12))
        p(fx, boing(0.4), T[5] + 0.05, db(-13)); p(fx, campanita(1568, 0.5), T[6] + 0.4, db(-12)); p(fx, vertido(1.8), T[6] + 0.6, db(-15))
        p(fx, campanita(1318, 0.4), T[7] + 0.4, db(-13)); p(fx, golpe(300, 0.1, 1.0), T[8] + 0.3, db(-14)); p(fx, golpe(300, 0.1, 1.0), T[8] + 0.5, db(-14))
        p(fx, boing(0.3), T[9] + 0.05, db(-14)); p(fx, vertido(1.5), T[10] + 0.4, db(-12)); p(fx, campanita(1760, 0.5), T[10] + 0.5, db(-12))
    elif CARPETA.startswith("20"):
        p(fx, vertido(1.4), 0.2, db(-11)); p(fx, golpe(70, 0.4, 0.9), T[2] + 0.3, db(-12))
        p(fx, vertido(1.6), T[3] + 0.5, db(-13)); p(fx, vertido(2.0), T[4] + 0.3, db(-10)); p(fx, golpe(55, 0.6, 0.9), T[4] + 0.6, db(-7))
        p(fx, boing(0.4), T[5] + 0.05, db(-13)); p(fx, crujido(0.8), T[6] + 0.4, db(-12)); p(fx, campanita(1568, 0.5), T[6] + 1.0, db(-12))
        p(fx, campanita(1318, 0.4), T[7] + 0.4, db(-13)); p(fx, golpe(160, 0.15, 0.9), T[8] + 0.3, db(-12)); p(fx, campanita(2093, 0.4), T[8] + 0.9, db(-13))
        p(fx, boing(0.5), T[9] + 0.05, db(-12)); p(fx, campanita(1760, 0.5), T[10] + 0.4, db(-12))
    else:
        p(fx, crujido(1.0), 0.25, db(-7)); p(fx, golpe(60, 0.5, 0.9), 1.0, db(-6)); p(fx, whoosh(1.0), 0.3, db(-12))
        p(fx, golpe(200, 0.15, 1.0), T[2] + 0.4, db(-12)); p(fx, whoosh(1.5), T[3] + 0.2, db(-10)); p(fx, crujido(1.0), T[3] + 1.0, db(-11))
        p(fx, crujido(1.6), T[4] + 0.4, db(-11)); p(fx, campanita(2637, 0.3), T[4] + 0.6, db(-18)); p(fx, campanita(2349, 0.3), T[4] + 0.9, db(-18))
        p(fx, boing(0.4), T[5] + 0.05, db(-13)); p(fx, roce(1.0), T[6] + 0.4, db(-12)); p(fx, campanita(1568, 0.5), T[6] + 1.2, db(-12))
        p(fx, campanita(1318, 0.4), T[7] + 0.5, db(-13)); p(fx, campanita(1047, 0.4), T[8] + 0.5, db(-13)); p(fx, boing(0.3), T[9] + 0.05, db(-14))
        for k in range(10): p(fx, golpe(90, 0.15, 0.9), T[10] + 0.2 + k * 0.35, db(-11))                           # pisón
    p(fx, golpe(80, 0.5, 0.9), T[11] + 0.6, db(-6)); p(fx, campanita(1568, 0.8), T[11] + 0.65, db(-11))
    equipos(fx, p, T[12], T[13])
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
