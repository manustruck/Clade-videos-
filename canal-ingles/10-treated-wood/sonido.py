"""Sonido del capítulo 10 «Is treated wood safe for raised garden beds?». Uso: python3 canal-ingles/10-treated-wood/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *

def eventos(fx, S, T):
    p = S.poner
    p(fx, whoosh(0.5), 0.0, db(-8)); p(fx, golpe(48, 0.9, 0.8), 0.05, db(-4)); p(fx, boing(0.4), 0.35, db(-12))   # gancho y calavera
    pide_seguir(fx, p, T[1])
    pops(fx, p, T[2] + 0.2, n=8, paso=0.25, g=-20)                                                                  # burbujas verdes
    p(fx, campanita(1175, 0.4), T[3] + 0.35, db(-13)); p(fx, campanita(1568, 0.4), T[3] + 1.9, db(-12))           # el calendario
    p(fx, whoosh(0.6), T[3] + 1.9, db(-12)); p(fx, golpe(110, 0.35, 0.9), T[3] + 2.55, db(-7)); p(fx, chasquido(), T[3] + 2.6, db(-14))
    p(fx, campanita(988, 0.5), T[5] + 0.3, db(-12))
    for k in range(4): p(fx, metal(1200 + 150 * k, 0.25), T[6] + 0.9 + k * 0.08, db(-20))                        # sondas
    p(fx, whoosh(0.4), T[7], db(-14)); p(fx, campanita(1318, 0.4), T[7] + 0.6, db(-13))
    p(fx, whoosh(0.4), T[8], db(-14)); p(fx, campanita(1568, 0.5), T[8] + 0.4, db(-12))
    p(fx, boing(0.5), T[9] + 0.1, db(-12))
    p(fx, golpe(70, 0.4, 0.9), T[10] + 0.4, db(-8)); p(fx, campanita(1760, 0.5), T[10] + 1.85, db(-12))
    p(fx, golpe(80, 0.5, 0.9), T[11] + 0.55, db(-6)); p(fx, campanita(1568, 0.8), T[11] + 0.6, db(-11))
    equipos(fx, p, T[12], T[13])
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
