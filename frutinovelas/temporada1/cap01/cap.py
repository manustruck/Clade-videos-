"""Capítulo 1 de «Corazón de Fresa»: «La juguera y el heredero». Tomas del motor 2D.
Uso:  python3 frutinovelas/temporada1/cap01/cap.py            (video completo, sin audio, a out/mudo.mp4)
      python3 frutinovelas/temporada1/cap01/cap.py fotos 1 9    (solo fotos de revisión en esos segundos)
      python3 frutinovelas/temporada1/cap01/cap.py portada 1.3  (cuadro sin textos para el flyer)"""
import json, os, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "..", "motor"))
from fruti import render

T = [f["a"] for f in json.load(open(os.path.join(AQUI, "voz", "tiempos.json"), encoding="utf-8"))["frases"]]
FIN = json.load(open(os.path.join(AQUI, "voz", "tiempos.json"), encoding="utf-8"))["total"] + 1.2
PINA, FRESA, UVA = 300, 780, 930   # posiciones en la fiesta

TOMAS = [
    # 0 · gancho: el jugo en la cara, en plena fiesta
    dict(a=0, b=T[1], escena="mansion", cam=[(560, 1150, 1.2), (640, 1120, 1.45)],
         actores=[dict(tipo="uva", x=UVA, s=0.7, emo="sorpresa", pose="tapa", z=-1),
                  dict(tipo="pina", x=PINA, s=0.92, emo=[(0, "enojo"), (1.6, "malvada")], pose=[(0, "ofrece"), (1.0, "jarra")]),
                  dict(tipo="fresa", x=FRESA, s=0.9, emo=[(0, "sorpresa"), (1.2, "llora")], pose=[(0, "normal"), (1.0, "arriba")])],
         efectos=[dict(tipo="destello", t=0.0), dict(tipo="jugo", t=0.55, de=(470, 1080), a=(760, 1120)), dict(tipo="temblor", t=1.05, dur=0.45)],
         textos=[dict(tipo="logo", s="CAPÍTULO 1 · LA JUGUERA", t=0.2, dur=4.3)]),
    # 1 · «¡Yo no robé nada!»
    dict(a=T[1], b=T[2], escena="mansion", cam=[(FRESA, 1120, 2.0), (FRESA, 1110, 2.25)],
         actores=[dict(tipo="pina", x=PINA, s=0.92, emo="malvada", pose="jarra"), dict(tipo="fresa", x=FRESA, s=0.9, emo="llora", pose="arriba")],
         efectos=[dict(tipo="vineta", a=120)]),
    # 2 · nadie le creyó / tres días antes
    dict(a=T[2], b=T[3], escena="mansion", cam=[(560, 1150, 1.15), (560, 1150, 1.3)],
         actores=[dict(tipo="uva", x=UVA, s=0.7, emo="triste", pose="tapa", z=-1), dict(tipo="pina", x=PINA, s=0.92, emo="malvada", pose="jarra"),
                  dict(tipo="fresa", x=FRESA, s=0.9, emo="llora", pose="normal")],
         efectos=[dict(tipo="destello", t=T[3] - T[2] - 1.5)],
         textos=[dict(tipo="seguir", s="SÍGUEME · CAPÍTULO 2", t=0.0, dur=T[3] - T[2] - 1.6), dict(tipo="carta", s="3 DÍAS ANTES…", t=T[3] - T[2] - 1.5)]),
    # 3 · la juguera del mercado
    dict(a=T[3], b=T[4], escena="mercado", cam=[(540, 1150, 1.1), (420, 1150, 1.35)],
         actores=[dict(tipo="fresa", x=360, s=0.95, emo="feliz", pose="ofrece")],
         efectos=[dict(tipo="destello", t=0.0)]),
    # 4 · madrugaba, exprimía y sonreía
    dict(a=T[4], b=T[5], escena="mercado", cam=[(360, 1100, 1.5), (360, 1080, 1.75)],
         actores=[dict(tipo="fresa", x=360, s=0.95, emo=[(0, "feliz"), (2.6, "triste")], pose=[(0, "arriba"), (2.6, "normal")])]),
    # 5 · llega el mango
    dict(a=T[5], b=T[6], escena="mercado", cam=[(560, 1150, 1.1), (580, 1150, 1.2)],
         actores=[dict(tipo="fresa", x=330, s=0.95, emo=[(0, "neutral"), (1.0, "sorpresa")], pose="normal", mira=1),
                  dict(tipo="mango", x=780, s=0.95, emo="feliz", pose="normal", entra=0.2, desde=500, mira=-1)]),
    # 6 · «¿Tú hiciste este jugo?»
    dict(a=T[6], b=T[7], escena="mercado", cam=[(760, 1080, 1.85), (760, 1070, 2.05)],
         actores=[dict(tipo="fresa", x=330, s=0.95, emo="feliz", mira=1), dict(tipo="mango", x=780, s=0.95, emo="feliz", pose="ofrece", mira=-1)]),
    # 7 · el heredero
    dict(a=T[7], b=T[8], escena="mercado", cam=[(560, 1150, 1.15), (560, 1130, 1.3)],
         actores=[dict(tipo="fresa", x=330, s=0.95, emo="feliz", mira=1), dict(tipo="mango", x=780, s=0.95, emo="feliz", pose="jarra", mira=-1)],
         textos=[dict(s="EL HEREDERO", t=0.4, dur=3.2, col="#ffd23f", tam=110), dict(s="DE JUGOS IMPERIAL", t=0.7, dur=2.9, y=640, tam=64)]),
    # 8 · Doña Piña
    dict(a=T[8], b=T[9], escena="mansion", cam=[(540, 1100, 1.15), (540, 1020, 1.7)],
         actores=[dict(tipo="pina", x=540, s=1.0, emo="enojo", pose="jarra")],
         efectos=[dict(tipo="vineta", a=150), dict(tipo="destello", t=0.0)],
         textos=[dict(s="DOÑA PIÑA REMEDIOS", t=0.3, dur=2.6, col="#f6c431", tam=80)]),
    # 9 · «¿Una fresa de puesto en mi fiesta?»
    dict(a=T[9], b=T[10], escena="mansion", cam=[(540, 1040, 2.0), (540, 1030, 2.2)],
         actores=[dict(tipo="pina", x=540, s=1.0, emo="enojo", pose="senala")], efectos=[dict(tipo="vineta", a=150)]),
    # 10 · el anillo desaparece
    dict(a=T[10], b=T[11], escena="mansion", cam=[(640, 1150, 1.15), (720, 1130, 1.35)],
         actores=[dict(tipo="pina", x=PINA, s=0.92, emo="malvada", pose="jarra"), dict(tipo="uva", x=760, s=0.85, emo="sorpresa", pose="tapa")],
         textos=[dict(s="¿Y EL ANILLO?", t=1.2, col="#bfefff", tam=110)]),
    # 11 · «¡Fue ella!»
    dict(a=T[11], b=T[12], escena="mansion", cam=[(540, 1150, 1.15), (500, 1150, 1.25)],
         actores=[dict(tipo="uva", x=UVA, s=0.7, emo="sorpresa", pose="tapa", z=-1), dict(tipo="pina", x=PINA, s=0.92, emo="enojo", pose="senala"),
                  dict(tipo="fresa", x=FRESA, s=0.9, emo="sorpresa", pose="arriba")],
         efectos=[dict(tipo="temblor", t=0.1, dur=0.5)]),
    # 12 · «Y el anillo estaba ahí»: zoom dramático triple
    dict(a=T[12], b=T[13], escena="mansion", cam=[(540, 1150, 1.15), (540, 1150, 1.15)],
         actores=[dict(tipo="uva", x=UVA, s=0.7, emo="sorpresa", pose="tapa", z=-1), dict(tipo="pina", x=PINA, s=0.92, emo="malvada", pose="jarra"),
                  dict(tipo="fresa", x=FRESA, s=0.9, emo="sorpresa", pose="tapa")],
         efectos=[dict(tipo="anillo", t=0.1, x=FRESA, y=1290), dict(tipo="zoomdrama", t=[0.0, 0.55, 1.1], z=[1.7, 2.4, 3.2], c=[(FRESA, 1260), (PINA, 1160), (FRESA, 1110)]),
                  dict(tipo="vineta", a=170)]),
    # 13 · bajo la lluvia
    dict(a=T[13], b=T[14], escena="calle", cam=[(540, 1200, 1.15), (540, 1150, 1.5)],
         actores=[dict(tipo="fresa", x=540, s=0.95, emo="llora", pose="normal")],
         efectos=[dict(tipo="lluvia"), dict(tipo="vineta", a=150, col=(0, 10, 40, 150))], textos=[dict(s="SIN PAGARLE UN PESO", t=2.0, col="#9fd8ff", tam=76)]),
    # 14 · el viejo coco lo vio todo
    dict(a=T[14], b=T[15], escena="calle", cam=[(420, 1200, 1.3), (840, 1180, 1.7)],
         actores=[dict(tipo="fresa", x=400, s=0.95, emo="llora"), dict(tipo="coco", x=860, s=0.85, emo="neutral", mira=-1)],
         efectos=[dict(tipo="lluvia")]),
    # 15 · «Esa niña no es una fresa cualquiera»
    dict(a=T[15], b=T[16], escena="calle", cam=[(860, 1120, 2.1), (860, 1110, 2.35)],
         actores=[dict(tipo="fresa", x=400, s=0.95, emo="llora"), dict(tipo="coco", x=860, s=0.85, emo="neutral", mira=-1)],
         efectos=[dict(tipo="lluvia"), dict(tipo="vineta", a=170, col=(0, 10, 40, 170))]),
    # 16 · Doña Piña sabe quién fue
    dict(a=T[16], b=T[17], escena="mansion", cam=[(540, 1100, 1.3), (540, 1010, 2.2)],
         actores=[dict(tipo="pina", x=540, s=1.0, emo="malvada", pose="jarra")],
         efectos=[dict(tipo="vineta", a=190), dict(tipo="destello", t=0.0)]),
    # 17 · CONTINUARÁ
    dict(a=T[17], b=FIN + 1, escena="mansion", cam=[(540, 1010, 2.2), (540, 1000, 2.35)],
         actores=[dict(tipo="pina", x=540, s=1.0, emo="malvada", pose="jarra")],
         efectos=[dict(tipo="vineta", a=200)], textos=[dict(tipo="continuara", s="SIGUE LA SERIE · CAPÍTULO 2", t=0.2)]),
]

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "portada":                     # cuadro limpio (sin textos) para el flyer
        render(TOMAS, AQUI, fotos=[float(sys.argv[2])], limpio=True)
    elif len(sys.argv) > 1 and sys.argv[1] == "fotos":
        render(TOMAS, AQUI, fotos=[float(x) for x in sys.argv[2:]])
    else:
        render(TOMAS, AQUI)
