"""Video "¿Vivimos en una simulación?" - escena y render.

Uso (desde la carpeta video):
  blender --background --python escena.py -- still 30,400,900      -> test/NNNN.jpg
  blender --background --python escena.py -- anim 1 2160           -> frames/NNNN.jpg
  Opcional al final: ancho alto   (por defecto 1080 1920)
"""
import json
import math
import os
import random
import sys
import time
import wave

import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["still", "1"]
MODE = argv[0]

FPS = 24
TOTAL_S = 90.0
LEAD_S = 0.5
TAIL_S = 2.3
SPEED = 3.0  # unidades por segundo del túnel

# ---------------------------------------------------------------- línea de tiempo
with open(os.path.join(HERE, "guion.json"), encoding="utf-8") as f:
    guion = json.load(f)
durs = []
for i in range(len(guion)):
    with wave.open(os.path.join(HERE, "voz", "{:02d}.wav".format(i))) as w:
        durs.append(w.getnframes() / w.getframerate())
gap = (TOTAL_S - LEAD_S - TAIL_S - sum(durs)) / (len(guion) - 1)
assert gap > 0.2, gap
starts = []
t = LEAD_S
for d in durs:
    starts.append(t)
    t += d + gap
with open(os.path.join(HERE, "timeline.json"), "w", encoding="utf-8") as f:
    json.dump({"starts": starts, "durs": durs, "gap": gap, "total": TOTAL_S}, f, indent=1)
N_FRAMES = int(TOTAL_S * FPS)


def fr(sec):
    return int(round(sec * FPS)) + 1


seg_f0 = [fr(s - 0.1) for s in starts]
seg_f1 = [seg_f0[i + 1] - 3 for i in range(len(guion) - 1)] + [N_FRAMES + 10]
seg_f0[0] = 1

# ---------------------------------------------------------------- escena base
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR"
scene = bpy.context.scene
scene.frame_start, scene.frame_end = 1, N_FRAMES
coll = scene.collection

world = bpy.data.worlds.new("Mundo")
scene.world = world
try:
    world.use_nodes = True
except Exception:
    pass
bg = world.node_tree.nodes.get("Background")
if bg:
    bg.inputs[0].default_value = (0.004, 0.006, 0.016, 1)
    bg.inputs[1].default_value = 1.0

COL = {
    "cian": (0.0, 0.85, 1.0),
    "verde": (0.1, 1.0, 0.35),
    "amarillo": (1.0, 0.8, 0.05),
    "magenta": (1.0, 0.1, 0.75),
    "rojo": (1.0, 0.08, 0.08),
    "blanco": (1.0, 1.0, 1.0),
    "negro": (0.0, 0.0, 0.0),
}
KIND_COL = {
    "hook": "cian", "intro": "cian", "op1": "amarillo", "op2": "amarillo", "op3": "amarillo",
    "tu": "magenta", "musk": "magenta", "luz": "cian", "pixel": "verde",
    "contra": "rojo", "final": "verde",
}
_mats = {}


def mat_emit(name, strength=1.0, fade=False):
    """Material de emisión pura; fade=True lo desvanece con la distancia."""
    key = (name, strength, fade)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new("E_{}_{}_{}".format(name, strength, fade))
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*COL[name], 1)
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], out.inputs["Surface"])
    if fade:
        cam = nt.nodes.new("ShaderNodeCameraData")
        mr = nt.nodes.new("ShaderNodeMapRange")
        mr.inputs["From Min"].default_value = 6.0
        mr.inputs["From Max"].default_value = 90.0
        mr.inputs["To Min"].default_value = strength
        mr.inputs["To Max"].default_value = 0.0
        nt.links.new(cam.outputs["View Z Depth"], mr.inputs["Value"])
        nt.links.new(mr.outputs[0], em.inputs["Strength"])
    _mats[key] = m
    return m


def mat_solid(name):
    """Material con algo de sombreado para que los volúmenes se lean."""
    key = ("solid", name)
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new("S_" + name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*COL[name], 1)
    b.inputs["Roughness"].default_value = 0.6
    b.inputs["Emission Color"].default_value = (*COL[name], 1)
    b.inputs["Emission Strength"].default_value = 0.25
    _mats[key] = m
    return m


def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None)
    e.location = loc
    e.parent = parent
    coll.objects.link(e)
    return e


def active():
    return bpy.context.view_layer.objects.active


def key_scale(obj, frames_vals):
    for f, v in frames_vals:
        obj.scale = (v, v, v) if not isinstance(v, tuple) else v
        obj.keyframe_insert("scale", frame=f)


def pop(obj, f0, f1, s=1.0, grow=1.0):
    """Aparece en f0 y desaparece en f1."""
    key_scale(obj, [(f0, 0.0001), (f0 + 4, s * 1.12), (f0 + 7, s), (max(f1 - 3, f0 + 8), s * grow), (f1, 0.0001)])


def spin(obj, turns_per_s=0.12, axis=2):
    obj.rotation_euler[axis] = 0.0
    obj.keyframe_insert("rotation_euler", index=axis, frame=1)
    obj.rotation_euler[axis] = 2 * math.pi * turns_per_s * TOTAL_S
    obj.keyframe_insert("rotation_euler", index=axis, frame=N_FRAMES)


# ---------------------------------------------------------------- cámara y luces
cam_d = bpy.data.cameras.new("Cam")
cam_d.lens = 35
cam_d.sensor_fit = "VERTICAL"
cam_d.sensor_height = 36
cam_d.clip_end = 300
cam = bpy.data.objects.new("Cam", cam_d)
cam.rotation_euler = (math.pi / 2, 0, 0)
coll.objects.link(cam)
scene.camera = cam

sun_d = bpy.data.lights.new("Sol", "SUN")
sun_d.energy = 4.0
sun = bpy.data.objects.new("Sol", sun_d)
sun.rotation_euler = (math.radians(55), math.radians(-25), math.radians(20))
coll.objects.link(sun)

# ---------------------------------------------------------------- túnel
mover = empty("Mover")
mover.location = (0, 0, 0)
mover.keyframe_insert("location", frame=1)
mover.location = (0, -SPEED * TOTAL_S, 0)
mover.keyframe_insert("location", frame=N_FRAMES)

LEN = 400
for z, cname in ((-5.0, "cian"), (5.0, "magenta")):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=24, y_subdivisions=LEN, size=1, location=(0, LEN / 2 - 10, z))
    g = active()
    g.scale = (24, LEN, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    wf = g.modifiers.new("W", "WIREFRAME")
    wf.thickness = 0.05
    wf.use_replace = True
    g.data.materials.append(mat_emit(cname, 2.2, fade=True))
    g.parent = mover

random.seed(7)
bpy.ops.mesh.primitive_cube_add(size=1)
cube_proto = active()
cube_mesh = cube_proto.data
bpy.data.objects.remove(cube_proto)
cube_mats = [mat_emit(c, 1.6, fade=True) for c in ("cian", "magenta", "verde", "blanco")]
dust_meshes = []
for m in cube_mats:
    me = cube_mesh.copy()
    me.materials.append(m)
    dust_meshes.append(me)
for i in range(260):
    o = bpy.data.objects.new("Polvo", random.choice(dust_meshes))
    side = random.choice((-1, 1))
    o.location = (side * random.uniform(3.6, 11.0), random.uniform(12, LEN - 15), random.uniform(-4.3, 4.3))
    s = random.uniform(0.12, 0.5)
    o.scale = (s, s, s)
    o.rotation_euler = (random.random() * 3, random.random() * 3, random.random() * 3)
    o.parent = mover
    coll.objects.link(o)

# ---------------------------------------------------------------- subtítulos
font = bpy.data.fonts.load(r"C:\Windows\Fonts\impact.ttf")
CAP_POS = (0, 8.0, 1.75)
MAX_W, MAX_H = 3.75, 3.1
bpy.ops.mesh.primitive_plane_add(size=1)
plane_proto = active()
plane_mesh = plane_proto.data
bpy.data.objects.remove(plane_proto)

for i, seg in enumerate(guion):
    cname = KIND_COL[seg["k"]]
    root = empty("Cap{:02d}".format(i), CAP_POS)
    cu = bpy.data.curves.new("T{:02d}".format(i), "FONT")
    cu.body = seg["c"]
    cu.font = font
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    cu.space_line = 0.92
    cu.materials.append(mat_emit("blanco", 1.0))
    tx = bpy.data.objects.new("T{:02d}".format(i), cu)
    coll.objects.link(tx)
    bpy.context.view_layer.update()
    w, h = tx.dimensions.x, tx.dimensions.y
    s = min(MAX_W / w, MAX_H / h)
    tx.scale = (s, s, s)
    tx.rotation_euler = (math.pi / 2, 0, 0)
    tx.parent = root
    # Centrar verticalmente por caja real (align_y no es exacto con varias líneas).
    bpy.context.view_layer.update()
    zs = [(tx.matrix_world @ __import__("mathutils").Vector(c)).z for c in tx.bound_box]
    tx.location.z -= (max(zs) + min(zs)) / 2 - CAP_POS[2]
    for k, (cn, grow, dy) in enumerate((("negro", 0.0, 0.06), (cname, 0.09, 0.09))):
        me = plane_mesh.copy()
        me.materials.append(mat_emit(cn, 1.3))
        pl = bpy.data.objects.new("P{:02d}_{}".format(i, k), me)
        pl.rotation_euler = (math.pi / 2, 0, 0)
        pl.scale = (w * s + 0.42 + grow, h * s + 0.42 + grow, 1)
        pl.location = (0, dy, 0)
        pl.parent = root
        coll.objects.link(pl)
    pop(root, seg_f0[i], seg_f1[i], 1.0, grow=1.05)

# ---------------------------------------------------------------- objetos por idea
PROP_POS = (0, 10.0, -2.35)


def seg_range(a, b):
    return seg_f0[a], seg_f1[b]


def make_globe(name, cname, radius=1.45):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=radius)
    o = active()
    o.name = name
    wf = o.modifiers.new("W", "WIREFRAME")
    wf.thickness = 0.045
    o.data.materials.append(mat_emit(cname, 1.6))
    holder = empty(name + "_h", PROP_POS)
    o.parent = holder
    o.rotation_euler = (math.radians(20), 0, 0)
    spin(o, 0.15)
    return holder


def make_voxel(name, cname, cell=0.42, r=3.3):
    holder = empty(name + "_h", PROP_POS)
    rot = empty(name + "_r", parent=holder)
    me = cube_mesh.copy()
    me.materials.append(mat_solid(cname))
    n = int(r) + 1
    for x in range(-n, n + 1):
        for y in range(-n, n + 1):
            for z in range(-n, n + 1):
                d = math.sqrt(x * x + y * y + z * z)
                if r - 1.0 < d <= r:
                    o = bpy.data.objects.new("v", me)
                    o.location = (x * cell, y * cell, z * cell)
                    o.scale = (cell * 0.86,) * 3
                    o.parent = rot
                    coll.objects.link(o)
    rot.rotation_euler = (math.radians(15), 0, 0)
    spin(rot, 0.12)
    return holder


# 0-3: mundo de alambre (se encoge en "nos extinguimos")
globe = make_globe("Globo", "cian")
a, b = seg_range(0, 3)
key_scale(globe, [(1, 0.0001), (6, 1.0), (seg_f0[3] + 10, 1.0), (b - 6, 0.12), (b, 0.0001)])

# 4: la máquina que podría simular, pero no lo hace
bpy.ops.mesh.primitive_cube_add(size=2.1)
box = active()
box.data.materials.append(mat_solid("amarillo"))
box_h = empty("Caja_h", PROP_POS)
box.parent = box_h
box.rotation_euler = (math.radians(25), 0, 0)
spin(box, 0.2)
pop(box_h, *seg_range(4, 4))

# 5-7: millones de simulaciones y una sola realidad
arr_h = empty("Mundos_h", PROP_POS)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.5)
ico = active()
ico_mesh = ico.data
bpy.data.objects.remove(ico)
me_sim = ico_mesh.copy()
me_sim.materials.append(mat_solid("verde"))
me_real = ico_mesh.copy()
me_real.materials.append(mat_emit("blanco", 2.5))
STEP = 0.44
for ix in range(-5, 6):
    for iz in range(-4, 5):
        real = ix == 0 and iz == 0
        o = bpy.data.objects.new("m", me_real if real else me_sim)
        o.location = (ix * STEP, 0, iz * STEP)
        s0 = 0.62 if real else 0.3
        o.scale = (s0, s0, s0)
        o.parent = arr_h
        coll.objects.link(o)
        if real:
            f = seg_f0[5]
            while f < seg_f1[7]:
                key_scale(o, [(f, 0.5), (f + 8, 0.8)])
                f += 16
pop(arr_h, *seg_range(5, 7), grow=1.12)

# 8: la luz como límite de velocidad
beam_h = empty("Luz_h", PROP_POS)
a, b = seg_range(8, 8)
for k, (zoff, delay, cn) in enumerate(((0.9, 0, "blanco"), (0.0, 7, "cian"), (-0.9, 3, "blanco"))):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=2.6, vertices=12)
    c = active()
    c.rotation_euler = (0, math.pi / 2, 0)
    c.data.materials.append(mat_emit(cn, 2.5))
    c.parent = beam_h
    f = a + delay
    while f < b:
        c.location = (-6.5, 0, zoff)
        c.keyframe_insert("location", frame=f)
        c.location = (6.5, 0, zoff)
        c.keyframe_insert("location", frame=f + 9)
        f += 14
pop(beam_h, a, b)

# 9: el universo hecho de bloques
vox = make_voxel("Voxel", "verde")
pop(vox, *seg_range(9, 9), grow=1.1)

# 10-12: la objeción
x_h = empty("X_h", PROP_POS)
x_r = empty("X_r", parent=x_h)
for ang in (45, -45):
    bpy.ops.mesh.primitive_cube_add(size=1)
    bar = active()
    bar.scale = (3.4, 0.5, 0.6)
    bar.rotation_euler = (0, math.radians(ang), 0)
    bar.data.materials.append(mat_solid("rojo"))
    bar.parent = x_r
a, b = seg_range(10, 12)
x_r.rotation_euler = (0, 0, math.radians(-28))
x_r.keyframe_insert("rotation_euler", frame=a)
x_r.rotation_euler = (0, 0, math.radians(28))
x_r.keyframe_insert("rotation_euler", frame=b)
pop(x_h, a, b)

# 13-14: realidad frente a videojuego
globe2 = make_globe("Globo2", "cian", radius=1.05)
vox2 = make_voxel("Voxel2", "verde", cell=0.3)
a, b = seg_range(13, 14)
for h, x in ((globe2, -1.35), (vox2, 1.35)):
    h.location.x = x
    key_scale(h, [(a, 0.0001), (a + 4, 1.1), (a + 7, 1.0), (N_FRAMES, 1.08)])

# ---------------------------------------------------------------- render
r = scene.render
engines = [e.identifier for e in type(r).bl_rna.properties["engine"].enum_items]
r.engine = "BLENDER_EEVEE" if "BLENDER_EEVEE" in engines else "BLENDER_EEVEE_NEXT"
W, H = (int(argv[-2]), int(argv[-1])) if len(argv) >= 4 and MODE == "still" or len(argv) >= 5 else (1080, 1920)
r.resolution_x, r.resolution_y, r.resolution_percentage = W, H, 100
r.fps = FPS
try:
    r.image_settings.media_type = "IMAGE"
except Exception:
    pass
r.image_settings.file_format = "JPEG"
r.image_settings.quality = 94
try:
    scene.eevee.taa_render_samples = 12
except Exception as ex:
    print("taa:", ex)
for attr in ("use_shadows", "use_raytracing", "use_gtao"):
    try:
        setattr(scene.eevee, attr, False)
    except Exception:
        pass
try:
    scene.view_settings.view_transform = "Standard"
except Exception as ex:
    print("view:", ex)

t0 = time.time()
if MODE == "still":
    os.makedirs(os.path.join(HERE, "test"), exist_ok=True)
    for f in [int(x) for x in argv[1].split(",")]:
        scene.frame_set(f)
        r.filepath = os.path.join(HERE, "test", "{:04d}.jpg".format(f))
        t1 = time.time()
        bpy.ops.render.render(write_still=True)
        print("STILL {} {:.1f}s".format(f, time.time() - t1))
else:
    scene.frame_start, scene.frame_end = int(argv[1]), int(argv[2])
    r.filepath = os.path.join(HERE, "frames", "")
    r.use_overwrite = False  # permite reanudar si se interrumpe
    bpy.ops.render.render(animation=True)
print("LISTO modo={} {}x{} segundos={:.1f} frames={}".format(MODE, W, H, time.time() - t0, N_FRAMES))
print("SEG_F0", seg_f0)
