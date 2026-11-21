"""Detecta la cara de cada asesor en sus clips (YuNet de OpenCV) y guarda las cajas en out/caras.json.
Así los textos y gráficos del comercial se acomodan para no tapar ninguna cara."""
import cv2, json, os, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from comercial import normalizado
det = cv2.FaceDetectorYN.create(os.path.join(AQUI, "recursos", "yunet.onnx"), "", (540, 960), 0.6, 0.3, 5000)
res = {}
for n in range(1, 9):
    cap = cv2.VideoCapture(normalizado(n)); i = 0; out = []
    while True:
        ok, fr = cap.read()
        if not ok: break
        if i % 3 == 0:
            _, f = det.detect(cv2.resize(fr, (540, 960)))
            if f is not None and len(f):
                caras = [[round(i / 30, 2)] + [int(v * 2) for v in (r[0], r[1], r[0] + r[2], r[1] + r[3])] for r in f if r[2] * r[3] > 600]
                out.append(caras)
        i += 1
    res[n] = out; print("clip", n, ":", len(out), "de", (i + 2) // 3, "muestras con cara")
os.makedirs(os.path.join(AQUI, "out"), exist_ok=True)
json.dump(res, open(os.path.join(AQUI, "out", "caras.json"), "w"))
