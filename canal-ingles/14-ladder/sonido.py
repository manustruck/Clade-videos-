"""Sonido del capítulo 14 «Your ladder angle is wrong». Uso: python3 canal-ingles/14-ladder/sonido.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *

def eventos(fx, S, T):
    p = S.poner
    p(fx, roce(1.0), 0.4, db(-8)); p(fx, metal(500, 0.6), 1.3, db(-6)); p(fx, golpe(55, 0.6, 0.8), 1.35, db(-3)); p(fx, boing(0.4), 1.6, db(-12))
    pide_seguir(fx, p, T[1])
    p(fx, metal(600, 0.3), T[2] + 0.1, db(-16))
    p(fx, roce(1.1), T[3] + 0.3, db(-9)); p(fx, metal(500, 0.6), T[3] + 1.35, db(-7)); p(fx, golpe(60, 0.5, 0.8), T[3] + 1.4, db(-6))
    p(fx, metal(800, 0.3), T[4] + 0.1, db(-15))
    p(fx, whoosh(1.0), T[5] + 0.6, db(-10)); p(fx, metal(450, 0.7), T[5] + 1.6, db(-6)); p(fx, golpe(55, 0.6, 0.8), T[5] + 1.62, db(-4))
    p(fx, boing(0.4), T[6] + 0.05, db(-13))
    p(fx, campanita(1568, 0.5), T[7] + 0.3, db(-12)); p(fx, campanita(1175, 0.4), T[8] + 0.25, db(-13))
    p(fx, golpe(150, 0.15, 0.9), T[9] + 0.6, db(-14)); p(fx, campanita(1760, 0.4), T[9] + 0.9, db(-12))
    p(fx, roce(0.9), T[10] + 0.2, db(-14)); p(fx, metal(900, 0.3), T[10] + 1.2, db(-14)); p(fx, campanita(1568, 0.5), T[10] + 1.3, db(-12))
    p(fx, golpe(80, 0.5, 0.9), T[11] + 0.65, db(-6)); p(fx, campanita(1568, 0.8), T[11] + 0.7, db(-11))
    equipos(fx, p, T[12], T[13])
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

mezclar(os.path.dirname(os.path.abspath(__file__)), eventos)
