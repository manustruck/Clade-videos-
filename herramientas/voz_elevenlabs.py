"""Genera la narración con ElevenLabs y saca los tiempos por palabra.

Entrada: un .txt con un bloque de narración por párrafo (línea en blanco entre bloques).
Saca en la carpeta de salida:
  voz.wav          -> la narración completa (44.1 kHz, mono)
  voz.mp3          -> lo mismo en MP3, para escuchar o mandar
  palabras.json    -> [{"palabra", "inicio", "fin", "bloque"}] en segundos (paso 3 de SKILL.md)
  subtitulos.srt   -> subtítulos de 2 a 4 palabras con el tiempo real de la voz
  bloque_NN.mp3    -> el audio de cada bloque tal como lo entregó ElevenLabs

Uso:
  python3 herramientas/voz_elevenlabs.py guion.txt carpeta_salida --voz ID_DE_VOZ [--ranura 10] [--duracion 60] [--velocidad 1.0]

  --ranura N     cada bloque empieza en un múltiplo de N segundos (para clips de N s). Sin esto van seguidos.
  --duracion N   sin --ranura: ajusta el ritmo (hasta un 20 %) para que toda la narración dure N segundos, de corrido.
  --idioma XX    idioma de la narración (es por defecto; en para inglés).
  --velocidad V  0.7 a 1.2. Si un bloque no cabe en su ranura, se acelera solo lo necesario.
  --buscar TEXTO lista voces de la biblioteca que coinciden (no genera nada ni gasta caracteres).

La clave se lee de la variable ELEVENLABS_API_KEY o del archivo .env.local de la raíz. Nunca va en el código.
Cada corrida gasta caracteres de tu plan (los del guion). Requiere ffmpeg.
"""
import argparse
import base64
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.elevenlabs.io"
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def clave():
    k = os.environ.get("ELEVENLABS_API_KEY")
    if not k:
        try:
            for linea in open(os.path.join(RAIZ, ".env.local"), encoding="utf-8"):
                if linea.startswith("ELEVENLABS_API_KEY="):
                    k = linea.split("=", 1)[1].strip().strip('"')
        except FileNotFoundError:
            pass
    if not k:
        sys.exit("Falta ELEVENLABS_API_KEY (variable de entorno o .env.local).")
    return k


def llamar(ruta, cuerpo=None):
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(API + ruta, data=datos, headers={"xi-api-key": clave(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs respondió {e.code}: {e.read().decode(errors='replace')[:600]}")


def buscar(texto):
    q = urllib.parse.urlencode({"search": texto, "language": "es", "page_size": 20})
    for v in llamar(f"/v1/shared-voices?{q}").get("voices", []):
        gratis = "plan gratis" if v.get("free_users_allowed") else "solo de pago"
        print(f"{v['voice_id']}  {v['name']}  ({v.get('accent')}, {v.get('use_case')}, {gratis})")


def duracion(ruta):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", ruta],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def palabras_de(al):
    """Junta los caracteres con tiempo de ElevenLabs en palabras."""
    res, act, t0, t1 = [], "", None, None
    for c, a, b in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if c.isspace():
            if act:
                res.append((act, t0, t1))
            act, t0 = "", None
        else:
            if t0 is None:
                t0 = a
            act, t1 = act + c, b
    if act:
        res.append((act, t0, t1))
    return res


def marca(t):
    return f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{t % 60:06.3f}".replace(".", ",")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("guion", nargs="?")
    p.add_argument("salida", nargs="?")
    p.add_argument("--voz")
    p.add_argument("--modelo", default="eleven_multilingual_v2")
    p.add_argument("--ranura", type=float, default=0)
    p.add_argument("--idioma", default="es", help="código del idioma de la voz: es, en...")
    p.add_argument("--duracion", type=float, default=0)
    p.add_argument("--velocidad", type=float, default=1.0)
    p.add_argument("--buscar")
    a = p.parse_args()
    if a.buscar:
        return buscar(a.buscar)
    if not (a.guion and a.salida and a.voz):
        p.error("faltan guion, carpeta de salida o --voz")

    bloques = [" ".join(b.split()) for b in re.split(r"\n\s*\n", open(a.guion, encoding="utf-8").read()) if b.strip()]
    os.makedirs(a.salida, exist_ok=True)
    PAUSA = 0.22  # respiro entre bloques cuando van de corrido
    crudos = []
    for i, texto in enumerate(bloques):
        r = llamar(f"/v1/text-to-speech/{a.voz}/with-timestamps?output_format=mp3_44100_128", {
            "text": texto, "model_id": a.modelo, "language_code": a.idioma,
            "previous_text": bloques[i - 1] if i else None,
            "next_text": bloques[i + 1] if i + 1 < len(bloques) else None,
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "speed": a.velocidad},
        })
        mp3 = os.path.join(a.salida, f"bloque_{i + 1:02d}.mp3")
        open(mp3, "wb").write(base64.b64decode(r["audio_base64"]))
        crudos.append((mp3, duracion(mp3), r["alignment"]))
    # ritmo global para llegar a --duracion (de corrido); con --ranura cada bloque se ajusta solo
    global_tempo = 1.0
    if a.duracion and not a.ranura:
        habla = sum(d for _, d, _ in crudos)
        global_tempo = min(1.2, max(0.85, habla / (a.duracion - 0.3 - PAUSA * (len(crudos) - 1))))
    partes, palabras, t = [], [], 0.1
    for i, (mp3, d, al) in enumerate(crudos):
        # si no cabe en su ranura, se acelera solo lo necesario (sin cambiar el tono)
        tempo = max(1.0, d / (a.ranura - 0.35)) if a.ranura else global_tempo
        inicio = i * a.ranura + 0.15 if a.ranura else t
        wav = os.path.join(a.salida, f"_b{i}.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af", f"atempo={tempo:.4f}", "-ar", "44100", "-ac", "1", wav], check=True)
        partes.append((wav, inicio))
        for w, w0, w1 in palabras_de(al):
            palabras.append({"palabra": w, "inicio": round(inicio + w0 / tempo, 3), "fin": round(inicio + w1 / tempo, 3), "bloque": i + 1})
        t = inicio + d / tempo + PAUSA
        print(f"bloque {i + 1}: {d:.2f} s" + (f" (ritmo x{tempo:.2f})" if abs(tempo - 1) > 0.005 else ""))

    total = len(bloques) * a.ranura if a.ranura else (a.duracion or t)
    entradas, filtros = [], []
    for n, (wav, inicio) in enumerate(partes):
        entradas += ["-i", wav]
        filtros.append(f"[{n}:a]adelay={int(inicio * 1000)}:all=1[a{n}]")
    mezcla = "".join(f"[a{n}]" for n in range(len(partes)))
    filtro = ";".join(filtros) + f";{mezcla}amix=inputs={len(partes)}:normalize=0,apad=whole_dur={total:.3f},loudnorm=I=-16:TP=-1.5[out]"
    voz = os.path.join(a.salida, "voz.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *entradas, "-filter_complex", filtro, "-map", "[out]", "-t", f"{total:.3f}", "-ar", "44100", voz], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", voz, "-c:a", "libmp3lame", "-b:a", "160k", os.path.join(a.salida, "voz.mp3")], check=True)
    for wav, _ in partes:
        os.remove(wav)

    json.dump(palabras, open(os.path.join(a.salida, "palabras.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    # subtítulos: hasta 3 palabras, cortando en puntuación fuerte y al cambiar de bloque
    srt, grupo = [], []
    for k, w in enumerate(palabras):
        grupo.append(w)
        sig = palabras[k + 1] if k + 1 < len(palabras) else None
        if len(grupo) == 3 or not sig or sig["bloque"] != w["bloque"] or w["palabra"][-1] in ".,:;?!":
            fin = min(grupo[-1]["fin"] + 0.08, sig["inicio"]) if sig and sig["bloque"] == w["bloque"] else grupo[-1]["fin"] + 0.15
            texto = " ".join(x["palabra"] for x in grupo).strip(",.:;")
            srt.append(f"{len(srt) + 1}\n{marca(grupo[0]['inicio'])} --> {marca(fin)}\n{texto}\n")
            grupo = []
    open(os.path.join(a.salida, "subtitulos.srt"), "w", encoding="utf-8").write("\n".join(srt))
    print(f"listo: {voz} ({duracion(voz):.2f} s), {len(palabras)} palabras, {sum(len(b) for b in bloques)} caracteres gastados")


if __name__ == "__main__":
    main()
