"""The NASA suit for the website: the film's re-shaded EMU (lib.load_astronaut), welded,
cut down to a web-sized mesh, given a skeleton so three.js can wave his arm, and written
to public/models/emu.glb. A posed preview render goes next to it in blender-work/out.

Run: D:/Blender/blender.exe -b --python scripts/space/web_astronaut.py

Weights are not Blender's heat weights (they fail on a suit made of many separate shells):
each vertex takes the two nearest bones it is allowed to follow (arms only outside the
torso, legs only below the hips), weighted by inverse distance.
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402

OUT = os.path.join(lib.ROOT, "public", "models", "emu.glb")
PREVIEW = os.path.join(lib.WORK, "out", "emu_rig.png")
TRIS = 60000  # about 1 MB of geometry before compression
THICK = {"hips": 0.24, "chest": 0.24, "head": 0.14}  # rough radius of each, in metres

# Joints, read off a front orthographic render (+X is the suit's right, it faces +Y).
# Depth (y) is filled in from the mesh around each point.
J = {
    "pelvis": (0, -0.12), "chest": (0, 0.18), "neck": (0, 0.5), "crown": (0, 0.92),
    "shoulder_r": (0.34, 0.4), "elbow_r": (0.52, 0.19), "wrist_r": (0.47, 0.09), "fingers_r": (0.46, -0.03),
    "shoulder_l": (-0.34, 0.4), "elbow_l": (-0.52, 0.19), "wrist_l": (-0.36, 0.1), "fingers_l": (-0.29, 0.03),
    "hip_r": (0.15, -0.22), "knee_r": (0.16, -0.68), "ankle_r": (0.16, -0.96),
    "hip_l": (-0.13, -0.22), "knee_l": (-0.14, -0.68), "ankle_l": (-0.14, -0.96),
}
BONES = [  # name, head joint, tail joint, parent
    ("hips", "pelvis", "chest", None),
    ("chest", "chest", "neck", "hips"),
    ("head", "neck", "crown", "chest"),
    ("upperarm_r", "shoulder_r", "elbow_r", "chest"), ("forearm_r", "elbow_r", "wrist_r", "upperarm_r"), ("hand_r", "wrist_r", "fingers_r", "forearm_r"),
    ("upperarm_l", "shoulder_l", "elbow_l", "chest"), ("forearm_l", "elbow_l", "wrist_l", "upperarm_l"), ("hand_l", "wrist_l", "fingers_l", "forearm_l"),
    ("thigh_r", "hip_r", "knee_r", "hips"), ("shin_r", "knee_r", "ankle_r", "thigh_r"),
    ("thigh_l", "hip_l", "knee_l", "hips"), ("shin_l", "knee_l", "ankle_l", "thigh_l"),
]


def flatten_materials(mesh):
    """glTF keeps plain Principled values only: give every procedural base colour a flat one."""
    for slot in mesh.material_slots:
        m = slot.material
        if not m or not m.node_tree:
            continue
        b = m.node_tree.nodes.get("Principled BSDF")
        base = b.inputs["Base Color"]
        if base.links and base.links[0].from_node.type == "VALTORGB":
            base.default_value = base.links[0].from_node.color_ramp.elements[1].color
            m.node_tree.links.remove(base.links[0])
        if b.inputs["Normal"].links:
            m.node_tree.links.remove(b.inputs["Normal"].links[0])


def weld_and_reduce(mesh):
    bm = bmesh.new()
    bm.from_mesh(mesh.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)  # the file stores every face loose
    bm.to_mesh(mesh.data)
    bm.free()
    tris = sum(len(p.vertices) - 2 for p in mesh.data.polygons)
    dec = mesh.modifiers.new("reduce", "DECIMATE")
    dec.ratio = min(1.0, TRIS / tris)
    bpy.context.view_layer.objects.active = mesh
    bpy.ops.object.modifier_apply(modifier=dec.name)
    print("TRIS", tris, "->", sum(len(p.vertices) - 2 for p in mesh.data.polygons))


def joint_points(mesh):
    """Each joint's depth: the middle of the mesh near that point, front to back."""
    vs = [v.co for v in mesh.data.vertices]
    pts = {}
    for name, (x, z) in J.items():
        near = [v.y for v in vs if abs(v.x - x) < 0.06 and abs(v.z - z) < 0.06]
        y = (min(near) + max(near)) / 2 if near else 0.0
        pts[name] = Vector((x, y, z))
    return pts


def arm_pieces(mesh):
    """Which side's arm each vertex belongs to, by connected piece: sleeves, gloves and shoulder
    rings are separate shells in NASA's file, so a whole piece follows the arm or none of it does."""
    me = mesh.data
    nbr = [[] for _ in me.vertices]
    for e in me.edges:
        a, b = e.vertices
        nbr[a].append(b)
        nbr[b].append(a)
    side = [""] * len(me.vertices)
    seen = [False] * len(me.vertices)
    for start in range(len(me.vertices)):
        if seen[start]:
            continue
        comp, stack = [], [start]
        seen[start] = True
        while stack:
            i = stack.pop()
            comp.append(i)
            for j in nbr[i]:
                if not seen[j]:
                    seen[j] = True
                    stack.append(j)
        cs = [me.vertices[i].co for i in comp]
        cx = sum(c.x for c in cs) / len(cs)
        span = max(c.x for c in cs) - min(c.x for c in cs)
        lo, hi = min(c.z for c in cs), max(c.z for c in cs)
        # Out at the side, not spanning the body, at arm height, and not a flat band (the
        # waist straps are only 3 to 4 cm tall and wrap the torso).
        if abs(cx) > 0.22 and span < 0.5 and lo > -0.1 and hi < 0.6 and hi - lo > 0.05:
            for i in comp:
                side[i] = "_r" if cx > 0 else "_l"
    return side


def allowed(bone, v, arm):
    """Which bones a vertex may follow, so an arm never drags the chest or a leg the belly."""
    if bone.startswith(("upperarm", "forearm", "hand")):
        return bone.endswith(arm) if arm else False
    if arm:
        return bone == "chest"  # an arm piece blends into the chest only at the shoulder
    side = "_r" if v.x > 0 else "_l"
    if bone.startswith(("thigh", "shin")):
        return bone.endswith(side) and v.z < -0.1 and abs(v.x) < 0.3
    if bone == "head":
        return v.z > 0.42 and abs(v.x) < 0.3
    return True


def seg_dist(p, a, b):
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    root = lib.load_astronaut()
    bpy.context.view_layer.update()
    pack = next(o for o in root.children if o.name == "Pack")
    mesh = next(o for o in root.children if o.type == "MESH" and o is not pack)

    # Pack and suit become one object with its transforms applied, at the world origin.
    for o in (mesh, pack):
        o.select_set(True)
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
    bpy.context.view_layer.objects.active = pack
    bpy.ops.object.convert(target="MESH")  # bevel on the pack baked in
    pack.vertex_groups.new(name="chest").add(list(range(len(pack.data.vertices))), 1.0, "REPLACE")
    bpy.ops.object.select_all(action="DESELECT")
    for o in (mesh, pack):
        o.select_set(True)
    bpy.context.view_layer.objects.active = mesh
    bpy.ops.object.join()
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.data.objects.remove(root)
    mesh.name = "Suit"
    flatten_materials(mesh)
    weld_and_reduce(mesh)

    pts = joint_points(mesh)
    arm_data = bpy.data.armatures.new("Skeleton")
    arm = bpy.data.objects.new("Astronaut", arm_data)
    bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    for name, h, t, parent in BONES:
        e = arm_data.edit_bones.new(name)
        e.head, e.tail = pts[h], pts[t]
        if parent:
            e.parent = arm_data.edit_bones[parent]
            e.use_connect = False
    bpy.ops.object.mode_set(mode="OBJECT")

    segs = {name: (pts[h], pts[t]) for name, h, t, _ in BONES}
    groups = {name: mesh.vertex_groups.get(name) or mesh.vertex_groups.new(name=name) for name in segs}
    on_pack = groups["chest"].index
    arms = arm_pieces(mesh)
    for v in mesh.data.vertices:
        if any(g.group == on_pack for g in v.groups):
            continue  # the life-support pack rides on the chest, whole
        limb = arms[v.index]
        # The torso and head are thick, so measure from their surface, not their centre line:
        # a waist strap at the side then stays with the body instead of riding the arm.
        # An arm piece measures the chest from its centre line, so only the shoulder blends.
        d = sorted((max(0.0, seg_dist(v.co, a, b) - (0.0 if limb else THICK.get(n, 0.0))), n) for n, (a, b) in segs.items() if allowed(n, v.co, limb))
        near = d[:2]
        w = [1 / max(dd, 0.01) ** 4 for dd, _ in near]
        s = sum(w)
        for (dd, n), wi in zip(near, w):
            groups[n].add([v.index], wi / s, "REPLACE")
    mesh.parent = arm
    mod = mesh.modifiers.new("skin", "ARMATURE")
    mod.object = arm

    # The glb, with the skeleton at rest.
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=OUT, export_format="GLB", use_selection=True, export_skins=True,
        export_animations=False, export_image_format="WEBP", export_apply=False,
        # Draco: the page decodes it with three.js's own decoder, served from public/draco.
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14, export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12, export_draco_generic_quantization=12,
    )
    print("WROTE", OUT, os.path.getsize(OUT) // 1024, "KB")

    # Preview: the wave pose, to check the shoulder and elbow bend cleanly.
    from mathutils import Matrix
    pb = arm.pose.bones

    def turn(name, deg, axis="Y"):
        b = pb[name]
        bpy.context.view_layer.update()
        h = b.head.copy()
        b.matrix = Matrix.Translation(h) @ Matrix.Rotation(math.radians(deg), 4, axis) @ Matrix.Translation(-h) @ b.matrix
        bpy.context.view_layer.update()

    turn("upperarm_r", -95)
    turn("forearm_r", -55)
    s = bpy.context.scene
    engines = {e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items}
    s.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    s.render.resolution_x, s.render.resolution_y = 900, 1000
    cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))
    s.collection.objects.link(cam)
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 2.6
    cam.location = (0, 5, 0)
    cam.rotation_euler = (math.radians(90), 0, math.radians(180))
    s.camera = cam
    sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
    s.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(60), 0, math.radians(160))
    sun.data.energy = 4
    w = bpy.data.worlds.new("W")
    s.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.3, 0.3, 0.35, 1)
    s.render.filepath = PREVIEW
    bpy.ops.render.render(write_still=True)


main()
