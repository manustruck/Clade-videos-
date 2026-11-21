"""Sonido del capítulo. Uso: python3 canal-ingles/<carpeta>/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *
CARPETA = os.path.basename(os.path.dirname(os.path.abspath(__file__)))

def eventos(fx, S, T):
    p = S.poner
    n = len(T)
    p(fx, whoosh(0.5), 0.0, db(-7)); p(fx, golpe(50, 0.7, 0.8), 0.05, db(-4))
    for a in T[1:n - 1]: p(fx, whoosh(0.25), a - 0.06, db(-15))
    pide_seguir(fx, p, T[1])
    if CARPETA.startswith("22"):
        p(fx, crujido(1.2), 0.2, db(-8)); p(fx, boing(0.4), T[2] + 0.2, db(-13)); p(fx, crujido(0.8), T[3] + 0.4, db(-13))
        p(fx, vertido(1.5), T[4] + 0.4, db(-15)); p(fx, crujido(1.4), T[5] + 0.3, db(-10)); p(fx, boing(0.4), T[6] + 0.05, db(-13))
        p(fx, campanita(1568, 0.5), T[7] + 0.4, db(-12)); p(fx, whoosh(1.6), T[8] + 0.5, db(-11)); p(fx, vertido(1.2), T[9] + 0.3, db(-12))
        cierre, eq = T[10], (T[11], T[12])
    elif CARPETA.startswith("23"):
        p(fx, crujido(1.4), 0.0, db(-10)); p(fx, whoosh(0.8), 0.4, db(-12))
        p(fx, golpe(140, 0.2, 0.9), T[2] + 0.2, db(-13)); [p(fx, chasquido(), T[3] + 0.3 + k * 0.4, db(-16)) for k in range(6)]
        p(fx, crujido(1.6), T[4] + 0.2, db(-11)); p(fx, boing(0.4), T[5] + 0.05, db(-13)); p(fx, whoosh(1.2), T[6] + 0.3, db(-10)); p(fx, campanita(1568, 0.5), T[6] + 1.6, db(-12))
        p(fx, campanita(1318, 0.4), T[7] + 0.4, db(-13)); p(fx, golpe(80, 0.4, 0.9), T[8] + 0.3, db(-10)); p(fx, boing(0.4), T[9] + 0.05, db(-13)); p(fx, metal(900, 0.4), T[10] + 0.4, db(-12))
        cierre, eq = T[11], (T[12], T[13])
    else:
        p(fx, vertido(1.6), 0.6, db(-9)); p(fx, golpe(140, 0.2, 0.9), T[2] + 0.2, db(-13))
        p(fx, vertido(1.6), T[3] + 0.8, db(-12)); p(fx, vertido(1.8), T[4] + 0.2, db(-11)); p(fx, boing(0.4), T[5] + 0.05, db(-13))
        p(fx, campanita(1568, 0.5), T[6] + 0.6, db(-12)); p(fx, vertido(1.5), T[7] + 0.3, db(-14)); p(fx, golpe(300, 0.08, 1.0), T[8] + 0.4, db(-13))
        p(fx, boing(0.4), T[9] + 0.05, db(-13)); p(fx, metal(700, 0.4), T[10] + 0.4, db(-11))
        cierre, eq = T[11], (T[12], T[13])
    p(fx, golpe(80, 0.5, 0.9), cierre + 0.6, db(-6)); p(fx, campanita(1568, 0.8), cierre + 0.65, db(-11))
    equipos(fx, p, eq[0], eq[1])
    p(fx, campanita(1760, 0.7), eq[1] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), eq[1] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
