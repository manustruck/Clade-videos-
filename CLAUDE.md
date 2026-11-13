# Notas para Claude en este repositorio

La skill está en `SKILL.md` (léela antes de hacer un short). Estas notas son sobre el entorno en la nube `Clade-videos-`.

## Lo que ya viene instalado en la nube
- Python con `numpy`, `scipy`, `pillow` y `opencv`; `ffmpeg`.
- Remotion 4.0.522 con su Chrome Headless Shell en `/opt/shorts-base`. `node_modules` de este repositorio es un enlace
  a `/opt/shorts-base/node_modules`: no corras `npm install` ni `npx remotion browser ensure` (su descargador no pasa
  por el proxy del contenedor).
- Blender 5.2 LTS (`blender` está en el PATH) con la extensión MPFB en `user_default`.

## Sin GPU
- El contenedor no tiene GPU. Remotion dibuja por software (`swangle`): es el valor por defecto en
  `remotion.config.ts`, `plantillas/scripts/fotos.mjs` y `plantillas/scripts/bridge-stills.mjs`. En una computadora
  con GPU usa `REMOTION_GL=angle`.
- Es lento: cerca de 40 s por foto a un cuarto de tamaño y unos 20 s por cuadro de video. Revisa con fotos sueltas a
  escala baja y deja el render completo para el final, o hazlo en una computadora con GPU.
- Cycles en Blender usa CPU.

## Proyecto de Remotion
- La raíz del repositorio es el proyecto: `package.json`, `tsconfig.json` y `remotion.config.ts` ya están. Crea
  `src/index.ts`, `src/Root.tsx` y `src/videos/<nombre>/` como indica `SKILL.md`, y `public/` para voz y recursos.
- La plantilla del puente necesita los modelos `public/bridge/kenney/*.glb`, que no vienen en el repositorio.

## Recursos de Blender
- `realista/recursos/bajar_recursos.sh` baja los recursos libres y reanuda si se corta. El servidor de MakeHuman es
  lento (unos 50 KB/s): los paquetes grandes tardan más de una hora. Lo bajado no se sube a git.
- Nathan (RenderPeople) se baja a mano con cuenta: ver `realista/recursos/FUENTES.md`.

## Voz con ElevenLabs
- `herramientas/voz_elevenlabs.py` genera `voz.wav`, `palabras.json` (tiempos por palabra) y `subtitulos.srt`.
- La clave va en `.env.local` (`ELEVENLABS_API_KEY=`), que no se sube a git y no existe en una sesión nueva: hay que
  volver a ponerla, o guardarla como secreto de red del entorno para `api.elevenlabs.io` (cabecera `xi-api-key`).
- En el plan gratis la API solo acepta las voces incluidas («premade»); las de la biblioteca (por ejemplo las
  «David») piden plan de pago.

## Al terminar cada video
- Genera siempre el flyer de 1080x1920 y los textos (título y hashtags para YouTube Shorts, TikTok y Facebook) con
  `herramientas/flyer_y_textos.py`, como indica el paso 12 de `SKILL.md`. Entrégalos junto con el video.
