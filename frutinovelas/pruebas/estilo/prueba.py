"""Fotos de prueba del estilo vector (no es un capítulo)."""
import os, sys
AQUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(AQUI, "..", "..", "motor"))
from vector import render
import shutil
if not os.path.exists(os.path.join(AQUI, "voz", "voz.wav")):   # usa la voz del capítulo 1 para las pruebas
    shutil.copy(os.path.join(AQUI, "..", "..", "temporada1", "cap01", "voz", "voz.wav"), os.path.join(AQUI, "voz", "voz.wav"))
TOMAS = [
    dict(a=0, b=5, escena="mansion", cam=[(700, 1250, 1.25), (800, 1200, 1.45)],
         actores=[dict(quien="uva", x=1180, s=0.75, emo="sorpresa", pose="tapa", z=-1), dict(quien="pina", x=470, s=0.95, emo=[(0, "enojo"), (1.6, "malvada")], pose=[(0, "ofrece"), (1.0, "jarra")], prop="vaso"),
                  dict(quien="valentina", x=930, s=0.95, emo=[(0, "sorpresa"), (1.2, "llora")], pose=[(0, "normal"), (1.0, "arriba")])],
         efectos=[dict(tipo="jugo", t=0.55, de=(640, 1230), a=(920, 1080)), dict(tipo="temblor", t=1.05)],
         textos=[dict(tipo="logo", s="CAPÍTULO 1 · LA JUGUERA", t=0.2, dur=4)]),
    dict(a=5, b=10, escena="sala", cam=[(750, 1300, 1.2), (700, 1250, 1.4)],
         actores=[dict(quien="lucho", x=520, s=1.0, emo="sorpresa", pose="rasca", prop="botella"), dict(quien="coco", x=960, s=1.0, emo="feliz", pose="normal")],
         efectos=[dict(tipo="rayos", x=200, y=260)]),
    dict(a=10, b=15, escena="mercado", cam=[(700, 1350, 1.15), (650, 1300, 1.35)],
         actores=[dict(quien="valentina", x=520, s=1.0, emo="feliz", pose="ofrece", prop="vaso"), dict(quien="rodrigo", x=1000, s=1.0, emo="feliz", pose="jarra", entra=0.2, desde=600)]),
    dict(a=15, b=20, escena="calle", cam=[(700, 1350, 1.2), (760, 1300, 1.4)],
         actores=[dict(quien="valentina", x=650, s=1.0, emo="llora", pose="normal")], efectos=[dict(tipo="lluvia")], tono=(40, 60, 140, 70)),
    dict(a=20, b=99, escena="mansion", cam=[(750, 1150, 1.6), (750, 1100, 1.9)],
         actores=[dict(quien="pina", x=750, s=1.0, emo="malvada", pose="jarra")], textos=[dict(tipo="final", s="PARA EL CAPÍTULO 2", t=0.3)]),
]
render(TOMAS, AQUI, fotos=[float(x) for x in sys.argv[1:]] or [1.3, 3.0, 7.0, 12.0, 17.0, 22.5])
