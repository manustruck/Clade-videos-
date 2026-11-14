"""Genera la voz de cada bloque con ElevenLabs, una sola vez (lo ya generado no se vuelve a pedir ni a cobrar).
Uso: python3 capitulos/01-faro/voz.py [--voz ID] [--velocidad 0.95]   -> capitulos/01-faro/voz/bNN.mp3 y bNN.json
"""
import argparse, base64, json, os, sys
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, "..", "..", "herramientas"))
sys.path.insert(0, AQUI)
from voz_elevenlabs import llamar, duracion, palabras_de  # noqa: E402
from guion import BLOQUES  # noqa: E402

p = argparse.ArgumentParser()
p.add_argument("--voz", default="bIHbv24MWmeRgasZH58o")  # Will: voz joven incluida en el plan gratis, verificada en español
p.add_argument("--velocidad", type=float, default=0.95)
p.add_argument("--solo", type=int, nargs="*")
a = p.parse_args()
sal = os.path.join(AQUI, "voz"); os.makedirs(sal, exist_ok=True)
gastados = 0
for i, (n, texto) in enumerate(BLOQUES):
    mp3, js = os.path.join(sal, f"b{n:02d}.mp3"), os.path.join(sal, f"b{n:02d}.json")
    if a.solo and n not in a.solo:
        continue
    if os.path.exists(mp3) and os.path.exists(js) and json.load(open(js, encoding="utf-8"))["texto"] == texto:
        continue
    r = llamar(f"/v1/text-to-speech/{a.voz}/with-timestamps?output_format=mp3_44100_128", {
        "text": texto, "model_id": "eleven_multilingual_v2", "language_code": "es",
        "previous_text": BLOQUES[i - 1][1] if i else None, "next_text": BLOQUES[i + 1][1] if i + 1 < len(BLOQUES) else None,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "speed": a.velocidad},
    })
    open(mp3, "wb").write(base64.b64decode(r["audio_base64"]))
    json.dump({"texto": texto, "dur": duracion(mp3), "palabras": palabras_de(r["alignment"])}, open(js, "w", encoding="utf-8"), ensure_ascii=False)
    gastados += len(texto)
    print(f"b{n:02d} {duracion(mp3):6.2f} s  {texto[:50]}", flush=True)
print("caracteres gastados en esta corrida:", gastados)
