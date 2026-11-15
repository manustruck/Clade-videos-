"""Sonido del capítulo 4 «Your gate will sag». Uso: python3 canal-ingles/04-gate/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *

def eventos(fx, S, T):
    p = S.poner
    p(fx, crujido(1.0), 0.15, db(-10)); p(fx, roce(1.2), 0.5, db(-14)); p(fx, golpe(55, 0.8, 0.6), 1.05, db(-6))      # el gancho: ya está caído
    p(fx, golpe(80, 0.4, 0.7), T[2] + 1.9, db(-8)); p(fx, metal(1100, 0.5), T[2] + 1.95, db(-12)); p(fx, metal(1400, 0.4), T[2] + 2.1, db(-14))   # se cuelga
    p(fx, campanita(1047, 0.4), T[3] + 0.3, db(-14))
    p(fx, golpe(50, 0.6, 0.4), T[4] + 0.3, db(-8))                                                                       # pesa
    p(fx, crujido(3.8), T[5] + 0.5, db(-12))                                                                             # la puerta se tuerce
    p(fx, roce(3.0), T[6] + 0.5, db(-12)); p(fx, golpe(60, 0.6, 0.6), T[6] + 0.3, db(-8))                                # roza el suelo
    p(fx, boing(0.6), T[7] + 0.05, db(-11)); p(fx, campanita(2100, 0.3), T[7] + 0.4, db(-12))
    for k, fr in enumerate([1047, 1319, 1568]): p(fx, campanita(fr, 0.6), T[8] + 0.05 + k * 0.12, db(-13))
    p(fx, golpe(100, 0.4, 0.9), T[9] + 0.5, db(-8)); p(fx, metal(600, 0.5), T[9] + 0.55, db(-13))                         # la diagonal
    for k in range(3): p(fx, campanita([1175, 1480, 1760][k], 0.4), T[10] + 0.55 + k * 0.5, db(-14))
    for k in range(4): p(fx, campanita(880 + 110 * k, 0.3), T[11] + 0.4 + k * 0.7, db(-15))
    p(fx, whoosh(2.4), T[12] + 0.2, db(-18)); p(fx, crujido(0.6), T[12] + 0.3, db(-16)); pops(fx, p, T[12] + 0.05)
    p(fx, golpe(80, 0.5, 0.9), T[12] + 1.6, db(-5)); p(fx, campanita(1568, 0.8), T[12] + 1.65, db(-11))
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
