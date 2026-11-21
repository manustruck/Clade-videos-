"""Render en paralelo: reparte los cuadros entre procesos, une las partes y junta el audio.

Uso (desde motor_fe/):  python render.py <carpeta> [procesos]
  -> <carpeta>/imagen.mp4  y, si existe <carpeta>/audio.wav, <carpeta>/final.mp4 (a -14 LUFS)
"""
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def parte(carpeta, a, b, out):
    import skia
    import motor as d
    d.cargar(carpeta)
    ff = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", "{}x{}".format(d.W, d.H),
         "-r", str(d.FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", out],
        stdin=subprocess.PIPE)
    s = skia.Surface(d.W, d.H)
    t0 = time.time()
    for k in range(a, b):
        d.draw_frame(s.getCanvas(), k / d.FPS)
        ff.stdin.write(s.makeImageSnapshot().tobytes())
        if (k - a) % 150 == 0:
            print("parte", a, "cuadro", k - a, "de", b - a, "{:.0f}s".format(time.time() - t0), flush=True)
    ff.stdin.close()
    ff.wait()


def main():
    if sys.argv[1] == "parte":
        parte(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5])
        return
    import motor as d
    carpeta = os.path.abspath(sys.argv[1])
    d.cargar(carpeta)
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    t0 = time.time()
    procs, outs = [], []
    for i in range(n):
        a, b = d.NF * i // n, d.NF * (i + 1) // n
        out = os.path.join(carpeta, "parte{}.mp4".format(i))
        outs.append(out)
        procs.append(subprocess.Popen([sys.executable, os.path.abspath(__file__), "parte", carpeta, str(a), str(b), out], cwd=HERE))
    codes = [p.wait() for p in procs]
    if any(codes):
        raise SystemExit("falló un proceso: {}".format(codes))
    lista = os.path.join(carpeta, "partes.txt")
    with open(lista, "w", encoding="utf-8") as f:
        for o in outs:
            f.write("file '{}'\n".format(o.replace("\\", "/")))
    imagen = os.path.join(carpeta, "imagen.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", imagen], check=True)
    for o in outs:
        os.remove(o)
    os.remove(lista)
    audio = os.path.join(carpeta, "audio.wav")
    if os.path.exists(audio):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", imagen, "-i", audio, "-map", "0:v:0", "-map", "1:a:0",
                        "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k",
                        "-ar", "48000", "-shortest", os.path.join(carpeta, "final.mp4")], check=True)
    print("VIDEO_OK cuadros={} {:.0f}s".format(d.NF, time.time() - t0))


if __name__ == "__main__":
    main()
