"""Sonido del capítulo 13 «This deck railing won't hold you». Uso: python3 canal-ingles/13-railing/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *

def eventos(fx, S, T):
    p = S.poner
    p(fx, crujido(0.6), 0.35, db(-6)); p(fx, chasquido(), 0.8, db(-5)); p(fx, whoosh(0.5), 0.75, db(-9)); p(fx, golpe(55, 0.6, 0.8), 1.45, db(-3))  # se arranca y Flo cae
    pide_seguir(fx, p, T[1])
    p(fx, golpe(140, 0.2, 0.9), T[2] + 0.2, db(-14))
    for k in range(3): p(fx, campanita(1318, 0.25), T[3] + 0.4 + k * 0.35, db(-16))                               # tornillos brillan
    for k in range(4): p(fx, crujido(0.4), T[4] + 0.3 + k * 0.6, db(-13))                                          # palanca
    p(fx, boing(0.4), T[5] + 0.1, db(-13))
    p(fx, whoosh(0.4), T[6] + 0.2, db(-12)); p(fx, golpe(70, 0.4, 0.9), T[6] + 0.3, db(-8))
    p(fx, roce(0.9), T[7] + 0.5, db(-14)); p(fx, golpe(200, 0.15, 1.0), T[7] + 1.4, db(-10))
    p(fx, boing(0.4), T[8] + 0.05, db(-13))
    p(fx, golpe(110, 0.35, 0.9), T[9] + 0.95, db(-7)); p(fx, metal(700, 0.4), T[9] + 1.9, db(-13)); p(fx, metal(1100, 0.4), T[9] + 3.1, db(-12))
    p(fx, campanita(1568, 0.5), T[10] + 0.25, db(-12))
    p(fx, golpe(80, 0.5, 0.9), T[11] + 0.65, db(-6)); p(fx, campanita(1568, 0.8), T[11] + 0.7, db(-11))
    equipos(fx, p, T[12], T[13])
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
