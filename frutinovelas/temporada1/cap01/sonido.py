"""Sonido del capítulo 1. Uso: python3 frutinovelas/temporada1/cap01/sonido.py"""
import os, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "..", "motor"))
from sonido_novela import *

def eventos(fx, p, T):
    p(fx, dun(55, 1.6), 0.0, db(-4)); p(fx, salpicon(), 0.95, db(-6)); p(fx, golpe(70, 0.4, 0.9), 1.05, db(-8))     # jugo en la cara
    p(fx, platillo_reves(1.2), T[3] - 1.6, db(-12)); p(fx, campanita(1318, 0.8), T[3] - 0.4, db(-12))            # 3 días antes
    p(fx, campanita(1568, 0.6), T[7] + 0.4, db(-13))                                                             # el heredero
    p(fx, dun(49, 1.2), T[8] + 0.05, db(-7))                                                                     # Doña Piña
    p(fx, golpe(80, 0.4, 0.9), T[11] + 0.1, db(-6))                                                              # ¡Fue ella!
    for j, d in enumerate([0.0, 0.55, 1.1]): p(fx, dun([62, 55, 41][j], 1.0 if j < 2 else 1.8), T[12] + d, db(-3))  # zoom triple
    p(fx, campanita(2349, 0.6), T[12] + 0.15, db(-12))                                                           # brillo del anillo
    p(fx, dun(41, 2.0), T[16] + 0.05, db(-5)); p(fx, platillo_reves(1.0), T[17] - 1.0, db(-12)); p(fx, dun(36, 2.4), T[17] + 0.2, db(-2))

import json
T = [f["a"] for f in json.load(open(os.path.join(AQUI, "voz", "tiempos.json"), encoding="utf-8"))["frases"]]
mezclar(AQUI, eventos, lluvia=[(T[13], T[16])])
