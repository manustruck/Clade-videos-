"""Render de prueba: cubo girando, 24 fotogramas, 640x360, MP4 (H.264).

Uso:
  blender --background --python prueba_render.py -- salida.mp4
"""
import math
import sys
import time

import bpy

out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "//prueba.mp4"

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

bpy.ops.mesh.primitive_cube_add(size=2)
cube = bpy.context.object
mat = bpy.data.materials.new("Naranja")
mat.diffuse_color = (1.0, 0.35, 0.05, 1.0)
cube.data.materials.append(mat)

bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -1))
bpy.ops.object.light_add(type="SUN", location=(4, -4, 8), rotation=(0.6, 0.2, 0.8))
bpy.context.object.data.energy = 4
bpy.ops.object.camera_add(location=(6, -6, 4), rotation=(math.radians(63), 0, math.radians(45)))
scene.camera = bpy.context.object

scene.frame_start, scene.frame_end = 1, 24
cube.rotation_euler = (0, 0, 0)
cube.keyframe_insert("rotation_euler", frame=1)
cube.rotation_euler = (0, 0, math.pi)
cube.keyframe_insert("rotation_euler", frame=24)

r = scene.render
engines = [e.identifier for e in type(r).bl_rna.properties["engine"].enum_items]
r.engine = "BLENDER_EEVEE" if "BLENDER_EEVEE" in engines else "BLENDER_EEVEE_NEXT"
r.resolution_x, r.resolution_y, r.resolution_percentage = 640, 360, 100
r.fps = 24
try:
    r.image_settings.media_type = "VIDEO"
except Exception:
    pass
r.image_settings.file_format = "FFMPEG"
r.ffmpeg.format = "MPEG4"
r.ffmpeg.codec = "H264"
r.filepath = out

# Dispositivos de Cycles disponibles (solo informativo).
try:
    cp = bpy.context.preferences.addons["cycles"].preferences
    for t in ("OPTIX", "CUDA"):
        try:
            cp.compute_device_type = t
            cp.get_devices()
            print("CYCLES", t, [d.name for d in cp.devices if d.type == t])
        except Exception as ex:
            print("CYCLES", t, "no disponible:", ex)
except Exception as ex:
    print("CYCLES prefs:", ex)

t0 = time.time()
bpy.ops.render.render(animation=True)
print("RENDER_OK motor={} segundos={:.1f} salida={}".format(r.engine, time.time() - t0, bpy.path.abspath(r.filepath)))
