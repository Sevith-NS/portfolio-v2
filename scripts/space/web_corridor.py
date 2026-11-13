"""The paw room and the paw corridor of the home page's closing flight, after Lusion's blue room
and corridor: thick blue walls with paw-print outlines cut right through them, bright light
outside pouring in through every slot, and in the corridor tall arched doors flooding it with
light. Lighting is baked in Cycles (direct and bounce light on the walls) and drawn live by
three.js (components/three/space/Corridor.tsx), which adds the glow and the glass cube.

Run: D:/Blender/blender.exe -b --python scripts/space/web_corridor.py -- [--preview]
Writes public/models/paw_room.glb and public/models/paw_corridor.glb, plus Cycles test renders
in blender-work/out (corridor_room.png, corridor_hall.png). --preview bakes small and fast.

Coordinates are Blender's (z up). The room is a cube round the origin; the corridor runs
along +y (three.js's -z after export), floor at z = -3, so its first arch sits ahead of a
camera at y = -6 looking down +y.
"""
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402

PREVIEW = "--preview" in sys.argv
OUT = os.path.join(lib.ROOT, "public", "models")
TEST = os.path.join(lib.WORK, "out")
WALL = lib.lin("3046F0")  # Lusion's saturated blue, a little toward his lapis
LIGHT = (0.95, 0.97, 1.0, 1.0)

# A cat's paw print as outlines, in paw units: the main pad and four toes.
PAD = ((0.0, -0.16), 0.34, 0.27)
TOES = [((-0.33, 0.17), 0.115), ((-0.12, 0.34), 0.12), ((0.12, 0.34), 0.12), ((0.33, 0.17), 0.115)]
RING = 0.06  # outline width, in paw units: wide enough to see the light through at an angle


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "OPTIX"
    (prefs.refresh_devices if hasattr(prefs, "refresh_devices") else prefs.get_devices)()
    for d in prefs.devices:
        d.use = d.type == "OPTIX"
    s.cycles.device = "GPU"
    s.cycles.samples = 64 if PREVIEW else 768
    s.cycles.max_bounces = 6
    s.view_settings.view_transform = "Standard"  # bake and test renders keep plain colour
    return s


def box(name, center, size):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.location = center
    return o


def ring_prism(bm, frame, cx, cy, rx, ry, w, depth, n=40):
    """An elliptical ring (outline) of width w, as a closed solid through a wall."""
    origin, u, v, nrm = frame
    loops = []
    for r_x, r_y in ((rx, ry), (max(0.01, rx - w), max(0.01, ry - w))):
        for zs in (-depth / 2, depth / 2):
            loops.append([bm.verts.new(origin + u * (cx + r_x * math.cos(2 * math.pi * k / n)) + v * (cy + r_y * math.sin(2 * math.pi * k / n)) + nrm * zs) for k in range(n)])
    ob, ot, ib, it = loops
    for k in range(n):
        j = (k + 1) % n
        bm.faces.new((ot[k], ot[j], it[j], it[k]))  # top
        bm.faces.new((ob[k], ib[k], ib[j], ob[j]))  # bottom
        bm.faces.new((ob[k], ob[j], ot[j], ot[k]))  # outer side
        bm.faces.new((ib[k], it[k], it[j], ib[j]))  # inner side


def paw_cutter(bm, frame, at, size, angle, depth, ring=RING):
    """A paw print's outlines (pad and four toes) cut through a wall at `at` (wall units)."""
    origin, u, v, nrm = frame
    c, s = math.cos(angle), math.sin(angle)
    ru, rv = u * c + v * s, -u * s + v * c  # the paw's own turned axes on the wall
    turned = (origin + u * at[0] + v * at[1], ru, rv, nrm)
    (px, py), prx, pry = PAD
    ring_prism(bm, turned, px * size, py * size, prx * size, pry * size, ring * size, depth)
    for (tx, ty), tr in TOES:
        ring_prism(bm, turned, tx * size, ty * size, tr * size, tr * size, ring * size, depth, n=28)


def arch_cutter(bm, frame, at_u, floor_v, width, spring, depth, n=24):
    """A tall arched doorway: straight sides up to `spring`, a round top above it."""
    origin, u, v, nrm = frame
    r = width / 2
    prof = [(-r, floor_v - 0.3), (r, floor_v - 0.3)]
    prof += [(r * math.cos(math.pi * k / n), spring + r * math.sin(math.pi * k / n)) for k in range(n + 1)]
    pts = [[bm.verts.new(origin + u * (at_u + x) + v * y + nrm * z) for x, y in prof] for z in (-depth / 2, depth / 2)]
    bm.faces.new(pts[0][::-1])
    bm.faces.new(pts[1])
    m = len(prof)
    for k in range(m):
        j = (k + 1) % m
        bm.faces.new((pts[0][k], pts[0][j], pts[1][j], pts[1][k]))


def cut(wall, build):
    """Cuts every opening the `build(bm)` callback makes out of the wall, in one boolean."""
    bm = bmesh.new()
    build(bm)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)  # outward, whichever way the wall faces
    me = bpy.data.meshes.new(wall.name + "_cut")
    bm.to_mesh(me)
    bm.free()
    cutter = bpy.data.objects.new(wall.name + "_cut", me)
    bpy.context.scene.collection.objects.link(cutter)
    mod = wall.modifiers.new("openings", "BOOLEAN")
    mod.operation, mod.solver, mod.object = "DIFFERENCE", "EXACT", cutter
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter)


def scatter(rnd, n, half_u, half_v, gap, keep_out=lambda u, v: False):
    """n points on a wall, at least `gap` apart and clear of `keep_out`."""
    pts, tries = [], 0
    while len(pts) < n and tries < 4000:
        tries += 1
        p = (rnd.uniform(-half_u, half_u), rnd.uniform(-half_v, half_v))
        if keep_out(*p) or any((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 < gap * gap for q in pts):
            continue
        pts.append(p)
    return pts


def wall_material(name, image):
    m = lib.mat(name, Base_Color=WALL, Roughness=0.92)
    nt = m.node_tree
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = image
    nt.nodes.active = tex  # the bake writes here
    return m, tex


def light_shell(name, center, size, strength):
    o = box(name, center, size)
    m = lib.emission(name, LIGHT, strength)
    o.data.materials.append(m)
    # Facing inward, so it lights the walls from outside.
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.flip_normals()
    bpy.ops.object.mode_set(mode="OBJECT")
    o.select_set(False)
    return o


def bake(walls, size):
    """Bakes direct and bounce light with the walls' blue into each wall's own image."""
    s = bpy.context.scene
    s.render.bake.margin = 8
    out = []
    for w in walls:
        img = bpy.data.images.new(w.name + "_light", size, size, alpha=False)
        mat, tex = wall_material(w.name + "_mat", img)
        w.data.materials.clear()
        w.data.materials.append(mat)
        bpy.ops.object.select_all(action="DESELECT")
        w.select_set(True)
        bpy.context.view_layer.objects.active = w
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.004)
        bpy.ops.object.mode_set(mode="OBJECT")
        bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT", "COLOR"}, margin=8, use_clear=True)
        # The baked light becomes the wall's colour; the page draws it as is.
        nt = mat.node_tree
        nt.links.new(tex.outputs["Color"], lib.bsdf(mat).inputs["Base Color"])
        out.append(img)
        print("BAKED", w.name, flush=True)
    return out


def export(objs, path):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=path, export_format="GLB", use_selection=True, export_image_format="WEBP", export_apply=True,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
    )
    print("WROTE", path, os.path.getsize(path) // 1024, "KB", flush=True)


def test_render(path, cam_at, look_at, lens=24):
    s = bpy.context.scene
    s.render.resolution_x, s.render.resolution_y = (960, 540) if PREVIEW else (1600, 900)
    cam = lib.camera(lens=lens, fstop=16)
    cam.data.dof.use_dof = False
    cam.location = cam_at
    lib.look_at(cam, lib.empty("aim", look_at))
    s.camera = cam
    s.render.filepath = path
    bpy.ops.render.render(write_still=True)


# ---------------------------------------------------------------- the room
def room():
    clear()
    rnd = random.Random(7)
    S, T = 16.0, 0.35
    walls = []
    for axis in range(3):
        for sign in (-1, 1):
            n = Vector((0, 0, 0))
            n[axis] = sign
            center = n * (S / 2 + T / 2)
            size = [S + 2 * T] * 3
            size[axis] = T
            w = box(f"room_{'xyz'[axis]}{'-+'[sign > 0]}", center, size)
            # The wall's own frame: two axes across it and its normal.
            u = Vector((0, 0, 0))
            u[(axis + 1) % 3] = 1
            v = n.cross(u)
            frame = (center, u, v, n)
            pts = scatter(rnd, 5, S / 2 - 2.4, S / 2 - 2.4, 5.0)
            cut(w, lambda bm, pts=pts, frame=frame: [paw_cutter(bm, frame, p, rnd.uniform(3.0, 4.0), rnd.uniform(0, 6.283), T + 0.4, 0.07) for p in pts])
            walls.append(w)
    light_shell("room_light", (0, 0, 0), (S + 8, S + 8, S + 8), 14.0)
    # The glass cube's glow in the middle (the page draws the cube itself) lights the walls blue.
    glow = lib.light("cube_glow", "POINT", 5200, (0.85, 0.9, 1.0, 1.0))
    glow.data.shadow_soft_size = 1.0
    bake(walls, 512 if PREVIEW else 1024)
    test_render(os.path.join(TEST, "corridor_room.png"), (3.5, -5.5, 1.5), (0, 0, 0))
    export(walls, os.path.join(OUT, "paw_room.glb"))


# ---------------------------------------------------------------- the corridor
def corridor():
    clear()
    rnd = random.Random(11)
    W, H, T = 7.0, 6.0, 0.25
    y0, y1 = -8.0, 62.0
    L, cy = y1 - y0, (y0 + y1) / 2
    arches = [0.5 + 9 * k for k in range(7)]
    walls = []
    # Floor and ceiling: paw outlines down the middle, a few toward the sides.
    for name, z, sgn in (("hall_floor", -H / 2 - T / 2, 1), ("hall_ceiling", H / 2 + T / 2, -1)):
        w = box(name, (0, cy, z), (W + 2 * T, L, T))
        frame = (Vector((0, cy, z)), Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, sgn)))
        pts = scatter(rnd, 14, W / 2 - 1.0, L / 2 - 2.0, 3.6)
        cut(w, lambda bm, pts=pts, frame=frame: [paw_cutter(bm, frame, p, rnd.uniform(1.8, 2.4), rnd.uniform(0, 6.283), T + 0.4) for p in pts])
        walls.append(w)
    # Side walls: tall arched doors, a paw outline between each pair.
    for name, x, sgn in (("hall_left", -W / 2 - T / 2, 1), ("hall_right", W / 2 + T / 2, -1)):
        w = box(name, (x, cy, 0), (T, L, H + 2 * T))
        frame = (Vector((x, cy, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)), Vector((sgn, 0, 0)))

        def openings(bm, frame=frame):
            for a in arches:
                arch_cutter(bm, frame, a - cy, -H / 2, 2.4, 0.6, T + 0.4)
                paw_cutter(bm, frame, (a + 4.5 - cy, 0.4), rnd.uniform(1.9, 2.3), rnd.uniform(-0.6, 0.6), T + 0.4)

        cut(w, openings)
        walls.append(w)
    light_shell("hall_light", (0, cy, 0), (W + 12, L + 40, H + 12), 7.0)
    bake(walls, 1024 if PREVIEW else 2048)
    test_render(os.path.join(TEST, "corridor_hall.png"), (0, -6, -0.2), (0, 20, -0.4), lens=28)
    export(walls, os.path.join(OUT, "paw_corridor.glb"))


room()
corridor()
