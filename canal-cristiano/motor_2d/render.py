"""Render en paralelo del motor v2: reparte los cuadros entre procesos y une las partes.

Uso:  python render.py [procesos]        -> imagen.mp4
"""
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def parte(a, b, out):
    import skia
    import motor as d
    ff = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", "{}x{}".format(d.W, d.H), "-r", str(d.FPS),
         "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p", out],
        stdin=subprocess.PIPE)
    s = skia.Surface(d.W, d.H)
    t0 = time.time()
    for k in range(a, b):
        d.draw_frame(s.getCanvas(), k / d.FPS)
        ff.stdin.write(s.makeImageSnapshot().tobytes())
        if (k - a) % 200 == 0:
            print("parte", a, "cuadro", k - a, "de", b - a, "{:.0f}s".format(time.time() - t0), flush=True)
    ff.stdin.close()
    ff.wait()


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "parte":
        parte(int(sys.argv[2]), int(sys.argv[3]), sys.argv[4])
        return
    import motor as d
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    total = d.NF
    t0 = time.time()
    procs, outs = [], []
    for i in range(n):
        a, b = total * i // n, total * (i + 1) // n
        out = os.path.join(HERE, "parte{}.mp4".format(i))
        outs.append(out)
        procs.append(subprocess.Popen([sys.executable, os.path.abspath(__file__), "parte", str(a), str(b), out], cwd=HERE))
    codes = [p.wait() for p in procs]
    lista = os.path.join(HERE, "partes.txt")
    with open(lista, "w", encoding="utf-8") as f:
        for o in outs:
            f.write("file '{}'\n".format(o.replace("\\", "/")))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", os.path.join(HERE, "imagen.mp4")], check=True)
    print("VIDEO_OK codigos={} cuadros={} {:.0f}s".format(codes, total, time.time() - t0))


if __name__ == "__main__":
    main()
