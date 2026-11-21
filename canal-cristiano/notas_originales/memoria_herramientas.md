---
name: video-toolchain
description: Qué quedó instalado en la PC del usuario para hacer videos (Blender, MCP, ffmpeg, edge-tts, skia) y sus límites de hardware
metadata:
  type: reference
---

Instalado el 2026-11-13 en la PC del usuario (Windows 10, i7-7500U 2 núcleos, GeForce MX130, 12 GB RAM — equipo modesto):
- Blender 5.3 en `C:\Program Files\Blender Foundation\Blender 5.3\blender.exe`, con el addon MCP oficial de Blender Lab activo (puerto 9876).
- Servidor MCP `blender` registrado en `~/.claude.json`, binario en `C:\Users\RACAR\blender-mcp\.venv\Scripts\blender-mcp.exe`.
- ffmpeg y uv por winget (hay que refrescar PATH en cada shell).
- Entorno Python `C:\Users\RACAR\tts\.venv` con edge-tts (voz usada: es-MX-JorgeNeural, da tiempos por palabra), skia-python y numpy.

Los videos 2D se dibujan con skia en Python y se pasan por tubería a ffmpeg (≈1 h para 3600 cuadros en un proceso; repartir en 3 procesos). Blender EEVEE rinde ~0,6 cuadros/s a 1080×1920 en esta PC.

El usuario recibe los videos en su celular: enviar con SendUserFile sin recomprimir si pesa menos de 30 MB. Habla español. Estilo en [[video-style-guide]].
