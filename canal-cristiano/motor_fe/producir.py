"""Produce un capítulo completo con un solo comando: voz → revisión de movimiento → sonido → video → portada.

Uso (desde motor_fe/):  python producir.py <carpeta_del_capitulo> [procesos] [--simular]
Requisitos: <carpeta>/guion.json (aprobado por el usuario) y, opcional, <carpeta>/publicacion.md con los textos.
Si el chequeo de movimiento encuentra tramos quietos, se detiene antes de renderizar.
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def correr(args, **kw):
    print(">>", " ".join(args), flush=True)
    r = subprocess.run([sys.executable] + args, cwd=HERE, capture_output=True, text=True, **kw)
    print(r.stdout[-1500:], r.stderr[-1500:] if r.returncode else "", flush=True)
    if r.returncode:
        raise SystemExit("falló: " + " ".join(args))
    return r.stdout


def main():
    carpeta = os.path.abspath(sys.argv[1])
    procesos = next((a for a in sys.argv[2:] if a.isdigit()), "3")
    env = dict(os.environ)
    if os.path.exists("/root/.ccr/ca-bundle.crt"):  # nube de Claude: certificado del proxy para edge-tts
        env.setdefault("SSL_CERT_FILE", "/root/.ccr/ca-bundle.crt")
    voz = ["narrar.py", carpeta] + (["--simular"] if "--simular" in sys.argv else [])
    correr(voz, env=env)
    mov = correr(["motor.py", carpeta, "movimiento"])
    if "tramos_quietos=0" not in mov:
        raise SystemExit("hay tramos quietos: revisa la cámara de esos planos antes de renderizar")
    correr(["motor.py", carpeta, "hoja", "0.6"])
    correr(["audio.py", carpeta])
    correr(["render.py", carpeta, procesos])
    correr(["portada.py", carpeta])
    final = os.path.join(carpeta, "final.mp4")
    mb = os.path.getsize(final) / 1e6
    print("LISTO: {} ({:.1f} MB){}".format(final, mb, "  ¡ojo: más de 30 MB, sube 'crf' o baja 'grano'!" if mb > 30 else ""))


if __name__ == "__main__":
    main()
