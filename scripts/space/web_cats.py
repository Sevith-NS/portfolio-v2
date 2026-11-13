"""Sevith's four cats for the home page's closing flight, modelled from scratch: Simba, Ash,
Pearl and Cream, each in a small spacesuit like the astronaut's (white, rust stripes, lapis
patch) with a clear bubble helmet, flying head first. Written to public/models/cats.glb, and
a preview render to blender-work/out/cats.png.

Run: D:/Blender/blender.exe -b --python scripts/space/web_cats.py

Fur is not modelled here: the page grows it on the head, ears and tail in layers (shell fur,
components/three/space/Cats.tsx), so these meshes are the skin underneath. Each mesh is named
`<cat>_<part>` (head, ears, earskin, eyes, nose, suit, stripes, patch, metal, pack, helmet,
tail) so the page can give each part its look. Looks from the photos in public/cats:
Simba pale ginger tabby, white muzzle, amber eyes; Ash solid blue-grey, round face, gold eyes;
Pearl white with a grey smudge on the forehead, yellow eyes; Cream white kitten, dark eyes.
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402

OUT = os.path.join(lib.ROOT, "public", "models", "cats.glb")
PREVIEW = os.path.join(lib.WORK, "out", "cats.png")

# Shape of each cat's head and how big it is. Cream is a kitten: smaller, with a bigger head.
CATS = {
    "simba": dict(width=1.0, muzzle=1.12, ear=0.66, ear_w=0.36, size=1.0, head=0.62),
    "ash": dict(width=1.13, muzzle=0.86, ear=0.54, ear_w=0.36, size=1.0, head=0.65),
    "pearl": dict(width=1.02, muzzle=1.0, ear=0.66, ear_w=0.35, size=0.96, head=0.62),
    "cream": dict(width=1.05, muzzle=0.84, ear=0.72, ear_w=0.38, size=0.78, head=0.7),
}
HEAD_AT = Vector((0, 1.55, 0.22))  # flying head first along +Y, belly down
HELMET = 0.94


def g(d, r):
    return math.exp(-(d / r) ** 2)


def shape_head(x, y, z, c):
    """A unit sphere to a cat's skull, seen from the front a rounded pentagon: widest at the
    cheeks, narrower at the crown and the chin, with a muzzle, whisker pads, a chin, a flat
    brow, the dip at the bridge of the nose, and eye sockets."""
    front = max(0.0, y)
    nx, ny, nz = x * c["width"], y * 0.9, z * 0.84
    nx *= 1 + 0.17 * g(z + 0.05, 0.32) - 0.12 * g(z - 0.75, 0.3) - 0.16 * g(z + 0.85, 0.3)
    ny += 0.36 * c["muzzle"] * g(x, 0.34) * g(z + 0.3, 0.2) * front  # muzzle
    for sx in (-1, 1):
        ny += 0.09 * g(x - sx * 0.15, 0.11) * g(z + 0.32, 0.1) * front  # whisker pads
        ny -= 0.1 * g(x - sx * 0.34, 0.16) * g(z - 0.05, 0.13) * front  # eye sockets
    ny += 0.1 * g(x, 0.18) * g(z + 0.55, 0.1) * front  # chin
    ny -= 0.1 * g(x, 0.45) * g(z - 0.42, 0.25) * front  # flat brow
    ny -= 0.04 * g(x, 0.12) * g(z - 0.02, 0.1) * front  # the dip at the bridge of the nose
    return Vector((nx, ny, nz))


def front_at(verts, x0, z0, r=0.06):
    """How far forward the shaped skull reaches near (x0, z0)."""
    return max(v.y for v in verts if abs(v.x - x0) < r and abs(v.z - z0) < r)


def whiskers(sx, at):
    """Six fine whiskers fanning out from a whisker pad."""
    bm = bmesh.new()
    for k in range(6):
        ang = math.radians(-22 + k * 9)
        tip = at + Vector((sx * 0.62 * math.cos(ang), 0.2 - 0.06 * k, math.sin(ang) * 0.55))  # short enough to stay inside the helmet
        mid = (at + tip) / 2 + Vector((0, 0.1, -0.06))
        prev = None
        for i in range(9):
            t = i / 8
            p = (1 - t) ** 2 * at + 2 * (1 - t) * t * mid + t * t * tip
            r = 0.007 * (1 - t) + 0.002
            ring_v = [bm.verts.new(p + Vector((0, r * math.cos(q * 2.094), r * math.sin(q * 2.094)))) for q in range(3)]
            if prev:
                for q in range(3):
                    bm.faces.new((prev[q], ring_v[q], ring_v[(q + 1) % 3], prev[(q + 1) % 3]))
            prev = ring_v
    return bm


def mesh_obj(name, bm, mat):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    o = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat)
    return o


MATS = {}


def mat(name, color, rough=0.6, metal=0.0, alpha=1.0):
    if name not in MATS:
        m = lib.mat(name, Base_Color=color, Roughness=rough, Metallic=metal, Alpha=alpha)
        MATS[name] = m
    return MATS[name]


def sphere(r, at, scale=(1, 1, 1), seg=32, rings=20):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
    bmesh.ops.transform(bm, matrix=Matrix.Diagonal(Vector(scale)).to_4x4(), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(at), verts=bm.verts)
    return bm


def capsule(a, b, r, seg=16):
    """A rounded limb from a to b."""
    a, b = Vector(a), Vector(b)
    bm = bmesh.new()
    d = b - a
    bmesh.ops.create_cone(bm, cap_ends=False, segments=seg, radius1=r, radius2=r * 0.92, depth=d.length)
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation((a + b) / 2) @ rot, verts=bm.verts)
    for end, rr in ((a, r), (b, r * 0.92)):
        cap = bmesh.new()
        bmesh.ops.create_uvsphere(cap, u_segments=seg, v_segments=10, radius=rr)
        bmesh.ops.translate(cap, vec=end, verts=cap.verts)
        me = bpy.data.meshes.new("tmp")
        cap.to_mesh(me)
        cap.free()
        bm.from_mesh(me)
        bpy.data.meshes.remove(me)
    return bm


def merge(*bms):
    out = bmesh.new()
    for b in bms:
        me = bpy.data.meshes.new("tmp")
        b.to_mesh(me)
        b.free()
        out.from_mesh(me)
        bpy.data.meshes.remove(me)
    return out


def ring(at, axis, major, minor):
    bm = bmesh.new()
    seg, sides = 40, 10
    verts = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        row = []
        for j in range(sides):
            b = 2 * math.pi * j / sides
            row.append(bm.verts.new(((major + minor * math.cos(b)) * math.cos(a), (major + minor * math.cos(b)) * math.sin(a), minor * math.sin(b))))
        verts.append(row)
    for i in range(seg):
        for j in range(sides):
            bm.faces.new((verts[i][j], verts[(i + 1) % seg][j], verts[(i + 1) % seg][(j + 1) % sides], verts[i][(j + 1) % sides]))
    rot = Vector((0, 0, 1)).rotation_difference(Vector(axis).normalized()).to_matrix().to_4x4()
    bmesh.ops.transform(bm, matrix=Matrix.Translation(Vector(at)) @ rot, verts=bm.verts)
    return bm


def ear(sx, c, inner):
    """A cat's ear: a flattened cone, cupped at the front, tilted out and back."""
    h = c["ear"] * (0.78 if inner else 1.0)
    w = c["ear_w"] * (0.68 if inner else 1.0)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=14, radius1=w, radius2=0.012, depth=h)
    for v in bm.verts:
        v.co.z += h / 2
        v.co.y *= 0.42
        if v.co.y > 0:
            v.co.y -= 0.11 * (1 - min(1.0, abs(v.co.x) / w)) * (1 - v.co.z / h)  # cupped front
    tilt = Matrix.Rotation(math.radians(-14), 4, "X") @ Matrix.Rotation(math.radians(sx * -20), 4, "Y")
    base = Vector((sx * 0.44 * c["width"], 0.02 + (0.06 if inner else 0.0), 0.6))
    bmesh.ops.transform(bm, matrix=Matrix.Translation(base) @ tilt, verts=bm.verts)
    return bm


def build(name, c):
    root = lib.empty(name)
    s = c["head"]
    hm = Matrix.Translation(HEAD_AT) @ Matrix.Scale(s, 4)

    # Head: a dense sphere shaped into a skull.
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=40, radius=1.0)
    for v in bm.verts:
        v.co = shape_head(v.co.x, v.co.y, v.co.z, c)
    skull = [v.co.copy() for v in bm.verts]
    bmesh.ops.transform(bm, matrix=hm, verts=bm.verts)
    parts = [mesh_obj(f"{name}_head", bm, mat("Fur", (0.9, 0.8, 0.7, 1), 0.9))]

    ears = merge(ear(-1, c, False), ear(1, c, False))
    bmesh.ops.transform(ears, matrix=hm, verts=ears.verts)
    parts.append(mesh_obj(f"{name}_ears", ears, mat("Fur", (0.9, 0.8, 0.7, 1), 0.9)))
    skin = merge(ear(-1, c, True), ear(1, c, True))
    bmesh.ops.transform(skin, matrix=hm, verts=skin.verts)
    parts.append(mesh_obj(f"{name}_earskin", skin, mat("EarSkin", (0.9, 0.62, 0.62, 1), 0.7)))

    # Eyes sit in the sockets, looking forward; the page paints the iris and the slit pupil.
    ex = 0.34 * c["width"]
    ey = front_at(skull, ex, 0.05) - 0.11
    eyes = merge(*[sphere(0.2, (sx * ex, ey, 0.06), scale=(1, 0.85, 0.92), seg=24, rings=16) for sx in (-1, 1)])
    bmesh.ops.transform(eyes, matrix=hm, verts=eyes.verts)
    parts.append(mesh_obj(f"{name}_eyes", eyes, mat("Eye", (0.8, 0.6, 0.2, 1), 0.05)))
    # The nose leather: a soft, slightly flattened wedge at the tip of the muzzle.
    ny = front_at(skull, 0.0, -0.17, 0.05)
    nose = sphere(0.09, (0, ny - 0.03, -0.15), scale=(1.3, 0.7, 0.75), seg=18, rings=12)
    for v in nose.verts:
        if v.co.z < -0.15:
            v.co.x *= 1 - min(0.7, (-0.15 - v.co.z) * 9)  # narrower at the bottom, like a cat's
    bmesh.ops.transform(nose, matrix=hm, verts=nose.verts)
    parts.append(mesh_obj(f"{name}_nose", nose, mat("Nose", (0.85, 0.5, 0.5, 1), 0.4)))
    wy = front_at(skull, 0.15, -0.32, 0.05)
    wh = merge(*[whiskers(sx, Vector((sx * 0.16, wy - 0.02, -0.3))) for sx in (-1, 1)])
    bmesh.ops.transform(wh, matrix=hm, verts=wh.verts)
    parts.append(mesh_obj(f"{name}_whiskers", wh, mat("Whisker", (0.95, 0.95, 0.95, 1), 0.4)))

    # The head and everything on it hang from a neck joint, so the page can turn the head
    # inside the helmet.
    neck_at = Vector((0, 0.95, 0.12))
    neck_pivot = lib.empty(f"{name}_neck", neck_at)
    for o in parts:
        o.data.transform(Matrix.Translation(-neck_at))
        o.parent = neck_pivot
    parts = [neck_pivot]

    # The suit: a soft torso, then four legs reaching forward and trailing back, each its own
    # object pivoting at the shoulder or hip (with its boot and rust stripe), so they can paddle.
    torso = sphere(1.0, (0, -0.42, 0), scale=(0.6, 1.12, 0.56), seg=40, rings=24)
    parts.append(mesh_obj(f"{name}_suit", torso, mat("Suit", (0.86, 0.86, 0.84, 1), 0.82)))
    legs = [
        # name, joint, paw end, radius, stripe centre, stripe axis
        ("leg_fr", (0.32, 0.38, -0.3), (0.36, 1.08, -0.6), 0.17, (0.35, 0.86, -0.5), (0.05, 1, -0.4)),
        ("leg_fl", (-0.32, 0.38, -0.3), (-0.36, 1.08, -0.6), 0.17, (-0.35, 0.86, -0.5), (0.05, 1, -0.4)),
        ("leg_br", (0.3, -1.12, -0.25), (0.34, -1.82, -0.42), 0.19, (0.33, -1.6, -0.37), (0.05, -1, -0.25)),
        ("leg_bl", (-0.3, -1.12, -0.25), (-0.34, -1.82, -0.42), 0.19, (-0.33, -1.6, -0.37), (0.05, -1, -0.25)),
    ]
    for leg, a, b, r, sat, sax in legs:
        a, b = Vector(a), Vector(b)
        boot = sphere(r * 1.18, b + (b - a).normalized() * 0.04, scale=(1, 1.15, 0.85), seg=20, rings=12)
        lo = mesh_obj(f"{name}_{leg}", merge(capsule(a, b, r), boot), mat("Suit", (0.86, 0.86, 0.84, 1), 0.82))
        lo.data.transform(Matrix.Translation(-a))
        lo.location = a
        so = mesh_obj(f"{name}_stripe_{leg[4:]}", ring(sat, sax, r + 0.005, 0.035), mat("Stripe", lib.RUST, 0.7))
        so.data.transform(Matrix.Translation(-a))
        so.parent = lo
        parts.append(lo)
    patch = sphere(0.13, (0.58, 0.05, 0.12), scale=(0.3, 1, 1), seg=16, rings=10)
    parts.append(mesh_obj(f"{name}_patch", patch, mat("Patch", lib.LAPIS, 0.6)))
    neck = ring((0, 0.66, 0.06), (0, 1, 0), 0.6, 0.075)
    tail_cuff = ring((0, -1.5, 0.12), (0, -1, 0.3), 0.15, 0.04)
    parts.append(mesh_obj(f"{name}_metal", merge(neck, tail_cuff), mat("Metal", (0.62, 0.64, 0.68, 1), 0.3, 1.0)))
    pack = sphere(1.0, (0, -0.42, 0.52), scale=(0.36, 0.5, 0.16), seg=20, rings=12)
    parts.append(mesh_obj(f"{name}_pack", pack, mat("Pack", (0.8, 0.8, 0.78, 1), 0.7)))

    # The helmet: a glass bubble round the head, sealed at the neck ring.
    helmet = sphere(HELMET * (s / 0.75), HEAD_AT + Vector((0, 0.04, 0.02)), seg=48, rings=32)
    parts.append(mesh_obj(f"{name}_helmet", helmet, mat("Glass", (0.9, 0.95, 1.0, 1), 0.05, 0.0, 0.2)))

    # A tail out of the back of the suit, curling up: a tapering tube along a curve.
    pts = [Vector(p) for p in ((0, -1.5, 0.12), (0.06, -2.05, 0.3), (0.22, -2.45, 0.78), (0.18, -2.42, 1.3), (0.02, -2.18, 1.55))]
    bm = bmesh.new()
    seg, sides = 40, 12
    rings_v = []
    for i in range(seg + 1):
        t = i / seg
        k = t * (len(pts) - 1)
        j = min(int(k), len(pts) - 2)
        u = k - j
        p0, p1, p2, p3 = pts[max(0, j - 1)], pts[j], pts[j + 1], pts[min(len(pts) - 1, j + 2)]
        at = 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u ** 3)
        ahead = pts[min(len(pts) - 1, j + 1)] - pts[j]
        rot = Vector((0, 0, 1)).rotation_difference(ahead.normalized()).to_matrix()
        r = 0.15 * (1 - t) + 0.07 * t
        row = [bm.verts.new(at + rot @ Vector((r * math.cos(2 * math.pi * q / sides), r * math.sin(2 * math.pi * q / sides), 0))) for q in range(sides)]
        rings_v.append(row)
    for i in range(seg):
        for q in range(sides):
            bm.faces.new((rings_v[i][q], rings_v[i + 1][q], rings_v[i + 1][(q + 1) % sides], rings_v[i][(q + 1) % sides]))
    tip = bm.verts.new(pts[-1] + (pts[-1] - pts[-2]).normalized() * 0.06)
    for q in range(sides):
        bm.faces.new((rings_v[-1][q], rings_v[-1][(q + 1) % sides], tip))
    tail = mesh_obj(f"{name}_tail", bm, mat("Fur", (0.9, 0.8, 0.7, 1), 0.9))
    tail.data.transform(Matrix.Translation(-pts[0]))  # pivots at its root, so it can lash
    tail.location = pts[0]
    parts.append(tail)

    for o in parts:
        o.parent = root
    root.scale = (c["size"],) * 3
    return root


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    roots = [build(n, c) for n, c in CATS.items()]
    bpy.ops.object.select_all(action="DESELECT")
    for r in roots:
        r.select_set(True)
        for o in r.children_recursive:  # the neck's head parts and each leg's stripe too
            o.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=OUT, export_format="GLB", use_selection=True, export_apply=True,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14, export_draco_normal_quantization=10,
    )
    print("WROTE", OUT, os.path.getsize(OUT) // 1024, "KB")

    # Preview: the four side by side, three-quarter view, then Simba's face close up.
    for i, r in enumerate(roots):
        r.location = ((i - 1.5) * 3.6, 0, 0)
        r.rotation_euler = (0, 0, math.radians(-35))
    s = bpy.context.scene
    engines = {e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items}
    s.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    s.render.resolution_x, s.render.resolution_y = 1600, 700
    cam = lib.camera(lens=35, fstop=16)
    cam.data.dof.use_dof = False
    cam.location = (-1.5, 13, 4)
    aim = lib.empty("aim", (0, 0, 0.3))
    lib.look_at(cam, aim)
    s.camera = cam
    sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
    s.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(50), 0, math.radians(150))
    sun.data.energy = 4
    w = bpy.data.worlds.new("W")
    s.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.25, 0.27, 0.32, 1)
    for o in bpy.data.objects:
        if o.name.endswith("_helmet"):
            o.hide_render = True  # glass hides the face in a quick preview
    s.render.filepath = PREVIEW
    bpy.ops.render.render(write_still=True)
    simba = roots[0]
    head = simba.matrix_world @ HEAD_AT
    aim.location = head
    cam.location = head + Vector((1.4, 3.2, 0.8))
    s.render.resolution_x, s.render.resolution_y = 900, 900
    s.render.filepath = PREVIEW.replace(".png", "_face.png")
    bpy.ops.render.render(write_still=True)


main()
