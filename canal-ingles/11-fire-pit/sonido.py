"""Sonido del capítulo 11 «Can river rocks explode in a fire pit?». Uso: python3 canal-ingles/11-fire-pit/sonido.py"""
import os, sys, json, re
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from comun_sonido import *
AQUI = os.path.dirname(os.path.abspath(__file__))
TI = json.load(open(os.path.join(AQUI, "voz", "tiempos.json")))

def fuego(fx, p, a, b, g):
    k = a
    while k < b: p(fx, crujido(0.25), k, db(g)); k += 0.35 + 0.3 * rng.random()

def eventos(fx, S, T):
    p = S.poner
    pop2 = next((w["a"] for w in TI["palabras"] if w["a"] > T[5] and re.match("pops", w["p"], re.I)), T[6] - 1) + 0.15   # igual que FirePit.tsx
    fuego(fx, p, 0.0, T[1], -18); fuego(fx, p, T[4], T[9] + 2, -20)
    p(fx, golpe(60, 0.3, 1.0), 0.9, db(-3)); p(fx, chasquido(), 0.9, db(-6)); p(fx, whoosh(0.4), 0.92, db(-10))   # la piedra revienta
    pide_seguir(fx, p, T[1])
    p(fx, boing(0.4), T[2] + 0.2, db(-13))
    pops(fx, p, T[3] + 0.5, n=6, paso=0.3, g=-22)                                                                  # gotas dentro
    p(fx, whoosh(1.2), T[4] + 0.1, db(-12))                                                                         # se enciende
    p(fx, crujido(1.2), T[5] + 0.4, db(-12))                                                                        # se agrieta
    p(fx, golpe(55, 0.35, 1.0), pop2, db(-2)); p(fx, chasquido(), pop2, db(-5)); p(fx, whoosh(0.5), pop2 + 0.02, db(-9))
    p(fx, boing(0.4), T[8] + 0.1, db(-12))
    for k in range(12): p(fx, golpe(140, 0.15, 0.9), T[9] + 0.75 + k * 0.05, db(-14))                              # caen los ladrillos
    p(fx, campanita(1568, 0.5), T[9] + 1.0, db(-12))
    for k in range(9): p(fx, golpe(300, 0.08, 1.0), T[10] + 0.15 + k * 0.15, db(-18))                              # piedras al jardín
    p(fx, golpe(80, 0.5, 0.9), T[11] + 0.55, db(-6)); p(fx, campanita(1568, 0.8), T[11] + 0.6, db(-11))
    equipos(fx, p, T[12], T[13])
    p(fx, campanita(1760, 0.7), T[13] + 0.1, db(-11)); p(fx, campanita(2349, 0.7), T[13] + 0.22, db(-12))

def lluvia(t, TT):
    return np.clip((t - TT[7]) / 0.3, 0, 1) * np.clip((TT[8] + 0.3 - t) / 0.3, 0, 1)

mezclar(AQUI, eventos, lluvia)
