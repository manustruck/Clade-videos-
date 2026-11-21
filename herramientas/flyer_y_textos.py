"""Al terminar un short: saca el flyer (portada 1080x1920) y los textos para publicar.

Entrada: el video final y un `publicacion.json` (ver `plantillas/publicacion_ejemplo.json`).
Saca en la carpeta de salida:
  flyer.png        -> portada vertical de 1080x1920: un cuadro del video con el título encima
  publicacion.md   -> título, texto y hashtags para YouTube Shorts, TikTok y Facebook, listos para copiar

Uso:
  python3 herramientas/flyer_y_textos.py final.mp4 publicacion.json carpeta_salida [--fuente letra.ttf]
  python3 herramientas/flyer_y_textos.py - publicacion.json carpeta_salida      (solo los textos, sin flyer)

El cuadro de fondo sale de "cuadro" (número de cuadro) o "segundo" en el JSON; si no viene ninguno, se elige
solo el cuadro más nítido y colorido. En vez de video se puede pasar una imagen. Requiere ffmpeg y pillow.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageStat

W, H = 1080, 1920
BLANCO, AMARILLO, BORDE = (255, 255, 255), (255, 210, 63), (26, 16, 16)
FUENTES = [
    "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf",
    "/Library/Fonts/Arial Rounded Bold.ttf",
    "C:/Windows/Fonts/arlrdbd.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
]
IMAGENES = (".png", ".jpg", ".jpeg", ".webp")


def fuente(ruta, tam):
    for f in ([ruta] if ruta else []) + FUENTES:
        if f and os.path.exists(f):
            return ImageFont.truetype(f, tam)
    sys.exit("No encontré una letra gruesa. Pasa una con --fuente ruta/a/letra.ttf")


def probe(video, campo):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", campo, "-of", "csv=p=0", video],
                         capture_output=True, text=True, check=True).stdout.strip().split("\n")[0]
    return out.strip(", ")


def cuadro_en(video, seg, destino):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, seg):.3f}", "-i", video, "-frames:v", "1", destino], check=True)
    return Image.open(destino).convert("RGB")


def fondo(entrada, datos, tmp):
    if entrada.lower().endswith(IMAGENES):
        return Image.open(entrada).convert("RGB"), "imagen"
    dur = float(probe(entrada, "format=duration"))
    num, den = probe(entrada, "stream=r_frame_rate").split("/")
    fps = float(num) / float(den)
    if "cuadro" in datos:
        return cuadro_en(entrada, datos["cuadro"] / fps, f"{tmp}/c.png"), f"cuadro {datos['cuadro']}"
    if "segundo" in datos:
        return cuadro_en(entrada, datos["segundo"], f"{tmp}/c.png"), f"segundo {datos['segundo']}"
    # sin indicación: el cuadro más nítido y colorido de 16 repartidos (sin el primer ni el último 5 %)
    mejor, nota, donde = None, -1.0, 0.0
    for i in range(16):
        seg = dur * (0.05 + 0.9 * i / 15)
        im = cuadro_en(entrada, seg, f"{tmp}/c{i}.png")
        chica = im.resize((270, 480))
        color = sum(ImageStat.Stat(chica.convert("HSV")).mean[1:2]) / 255
        nitidez = ImageStat.Stat(chica.convert("L").filter(ImageFilter.FIND_EDGES)).mean[0] / 255
        contraste = ImageStat.Stat(chica.convert("L")).stddev[0] / 128
        n = color + 2.5 * nitidez + 0.5 * contraste
        if n > nota:
            mejor, nota, donde = im, n, seg
    return mejor, f"segundo {donde:.2f} (elegido solo)"


def cubrir(im):
    """Escala y recorta al centro para llenar 1080x1920."""
    e = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * e), round(im.height * e)), Image.LANCZOS)
    x, y = (im.width - W) // 2, (im.height - H) // 2
    return im.crop((x, y, x + W, y + H))


def degradado(alto, arriba):
    """Sombra suave para que el texto se lea sobre cualquier cuadro."""
    capa = Image.new("L", (1, alto))
    for y in range(alto):
        u = 1 - y / alto if arriba else y / alto
        capa.putpixel((0, y), int(175 * u ** 1.6))
    return capa.resize((W, alto))


def ancho(d, texto, f):
    return d.textlength(texto, font=f)


def escribir(d, lineas, resaltar, y, tam_max, ruta_fuente, margen=70):
    """Líneas centradas, lo más grandes que quepan; las palabras de `resaltar` van en amarillo."""
    tam = tam_max
    while tam > 40:
        f = fuente(ruta_fuente, tam)
        if max(ancho(d, l, f) for l in lineas) <= W - 2 * margen:
            break
        tam -= 4
    borde = max(6, tam // 9)
    clave = {r.upper().strip(".,!?¡¿:;") for r in resaltar}
    for l in lineas:
        x = (W - ancho(d, l, f)) / 2
        for palabra in l.split(" "):
            col = AMARILLO if palabra.upper().strip(".,!?¡¿:;") in clave else BLANCO
            d.text((x, y), palabra, font=f, fill=col, stroke_width=borde, stroke_fill=BORDE)
            x += ancho(d, palabra + " ", f)
        y += int(tam * 1.18)
    return y


def flyer(entrada, datos, salida, ruta_fuente):
    with tempfile.TemporaryDirectory() as tmp:
        im, origen = fondo(entrada, datos, tmp)
    im = cubrir(im)
    im.paste(Image.new("RGB", (W, 760), BORDE), (0, 0), degradado(760, True))
    d = ImageDraw.Draw(im)
    titulo = [t.upper() for t in datos["titulo"]]
    y = escribir(d, titulo, datos.get("resaltar", []), 150, 150, ruta_fuente)
    if datos.get("subtitulo"):
        escribir(d, [datos["subtitulo"]], [], y + 24, 58, ruta_fuente, margen=90)
    if datos.get("usuario"):
        base = Image.new("RGB", (W, 330), BORDE)
        im.paste(base, (0, H - 330), degradado(330, False))
        escribir(ImageDraw.Draw(im), [f"SÍGUEME  {datos['usuario']}"], [datos["usuario"]], H - 190, 72, ruta_fuente)
    im.save(salida)
    return origen


def etiquetas(lista):
    return " ".join(h if h.startswith("#") else "#" + h for h in lista)


def textos(datos, salida):
    yt, tt, fb = datos["youtube"], datos["tiktok"], datos["facebook"]
    avisos = []
    if len(yt["titulo"]) > 100:
        avisos.append(f"El título de YouTube tiene {len(yt['titulo'])} caracteres: el máximo es 100.")
    elif len(yt["titulo"]) > 60:
        avisos.append(f"El título de YouTube tiene {len(yt['titulo'])} caracteres: pasado de 60 se corta en pantalla.")
    largo = bool(datos.get("largo"))  # video largo de YouTube: sin #shorts
    if not largo and not any(h.lstrip("#").lower() == "shorts" for h in yt["hashtags"]):
        yt["hashtags"] = ["shorts"] + yt["hashtags"]
    for nombre, red, tope in (("YouTube", yt, 15), ("TikTok", tt, 8), ("Facebook", fb, 5)):
        if len(red["hashtags"]) > tope:
            avisos.append(f"{nombre} lleva {len(red['hashtags'])} hashtags: con más de {tope} se ve como relleno.")
    md = [
        "# Textos para publicar", "",
        "## YouTube" if largo else "## YouTube Shorts", "", "**Título:**", "```", yt["titulo"], "```", "",
        "**Descripción:**", "```", yt["descripcion"], "", etiquetas(yt["hashtags"]), "```", "",
        "## TikTok", "", "```", tt["texto"], "", etiquetas(tt["hashtags"]), "```", "",
        "## Facebook Reels", "", "```", fb["texto"], "", etiquetas(fb["hashtags"]), "```", "",
    ]
    if datos.get("fuentes"):
        md += ["## Fuentes de los datos", ""] + [f"- {f}" for f in datos["fuentes"]] + [""]
    md += ["## Antes de publicar", "",
           "- Revisa las cifras del título y del texto contra las fuentes del guion.",
           "- Marca el video como hecho con IA si la plataforma lo pide (voz o imagen generadas).", ""]
    if avisos:
        md += ["## Avisos", ""] + [f"- {a}" for a in avisos] + [""]
    open(salida, "w", encoding="utf-8").write("\n".join(md))
    return avisos


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("entrada", help="video final (o una imagen) para el fondo del flyer")
    p.add_argument("json", help="publicacion.json con título, resaltado y textos por red")
    p.add_argument("salida", help="carpeta de salida")
    p.add_argument("--fuente", help="archivo .ttf para el título")
    a = p.parse_args()
    datos = json.load(open(a.json, encoding="utf-8"))
    os.makedirs(a.salida, exist_ok=True)
    png, md = os.path.join(a.salida, "flyer.png"), os.path.join(a.salida, "publicacion.md")
    if a.entrada != "-":
        origen = flyer(a.entrada, datos, png, a.fuente)
        print(f"flyer: {png} ({W}x{H}, fondo: {origen})")
    avisos = textos(datos, md)
    print(f"textos: {md}")
    for av in avisos:
        print("aviso:", av)


if __name__ == "__main__":
    main()
