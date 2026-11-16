"""Sonido del capítulo 8 «Your stairs will trip you». Uso: python3 canal-ingles/08-stairs/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *

def eventos(fx, S, T):
    p = S.poner
    p(fx, whoosh(0.5), 0.0, db(-8)); p(fx, golpe(48, 0.9, 0.8), 0.05, db(-4))
    for k in range(6): p(fx, golpe(90 + 15 * k, 0.18, 0.8), 0.3 + k * 0.23, db(-9))                                     # Norm rueda escaleras abajo
    p(fx, golpe(55, 0.8, 0.7), 1.8, db(-5)); p(fx, campanita(2100, 0.3), 1.9, db(-12))
    pide_seguir(fx, p, T[1])
    for k in range(6): p(fx, whoosh(0.3), T[4] + 0.3 + k * 0.45, db(-20))                                               # trayectorias del pie
    p(fx, golpe(45, 0.4, 0.2), T[4] + 0.3 + 3 * 0.45 + 0.25, db(-10)); p(fx, metal(220, 0.4), T[4] + 0.3 + 3 * 0.45 + 0.25, db(-14))
    for k in range(3): p(fx, golpe(200, 0.08, 0.9), T[6] + 0.3 + k * 0.5, db(-13))                                      # Flo sube
    tr = T[6] + 0.15 + 4.0 * 2.6 / 7
    p(fx, roce(0.25), tr - 0.05, db(-12)); p(fx, golpe(55, 0.8, 0.7), tr + 0.35, db(-5)); p(fx, chasquido(), tr + 0.3, db(-12))
    for k in range(4): p(fx, campanita(2349 + 300 * k, 0.25), T[7] + 0.1 + k * 0.18, db(-16))                           # mareo
    p(fx, campanita(1319, 0.4), T[8] + 0.25, db(-13))
    for k, fr in enumerate([1047, 1319, 1568, 2093]): p(fx, campanita(fr, 0.5), T[9] + 0.3 + k * 0.1, db(-13))          # la escalera se arregla
    for k in range(6): p(fx, golpe(200, 0.08, 0.9), T[11] + 0.15 + k * 0.28, db(-14))
    p(fx, campanita(1568, 0.6), T[11] + 1.9, db(-12)); pops(fx, p, T[11] + 0.9, 6)
    p(fx, golpe(80, 0.5, 0.9), T[11] + 0.95, db(-6))
    equipos(fx, p, T[12], T[13])
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
