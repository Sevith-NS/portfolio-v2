"""The hero's connector piece: a hub with 6 hollow tube arms, after Lusion's.

  blender -b --python scripts/hero/connector.py              model, export public/models/connector.glb, render a preview
  blender -b --python scripts/hero/connector.py -- --check   preview only, no export

Built as a signed distance field (Blender 5.2's SDF grid nodes), so the arms meet in a smooth
fillet and every rim is softly rounded, then meshed and decimated for the web.
Units: the piece spans 2 (arm end to arm end). The site scales it.
"""
import math
import os
import sys

import bpy

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "space"))
import lib  # noqa: E402

L = 1.0        # centre to arm end
R = 0.36       # arm radius
HOLE_R = 0.115
HOLE_D = 0.42  # how deep each hole runs into its arm
VOXEL = 0.005
FILLET = 12    # fillet iterations where the arms meet
ROUND = 0.03   # rim rounding radius
FACES = 7000   # target for the web mesh
OUT = os.path.join(lib.ROOT, "public", "models", "connector.glb")


def node(nt, kind, **inputs):
    n = nt.nodes.new(kind)
    for k, v in inputs.items():
        n.inputs[k].default_value = v
    return n


def cylinder(nt, radius, depth, rot=(0, 0, 0), loc=(0, 0, 0)):
    c = node(nt, "GeometryNodeMeshCylinder", Vertices=128, Radius=radius, Depth=depth)
    t = node(nt, "GeometryNodeTransform")
    t.inputs["Rotation"].default_value = [math.radians(a) for a in rot]
    t.inputs["Translation"].default_value = loc
    nt.links.new(c.outputs["Mesh"], t.inputs["Geometry"])
    return t.outputs["Geometry"]


def sdf(nt, geometry):
    g = node(nt, "GeometryNodeMeshToSDFGrid", **{"Voxel Size": VOXEL, "Band Width": 12})
    nt.links.new(geometry, g.inputs["Mesh"])
    return g.outputs["SDF Grid"]


def build():
    ng = bpy.data.node_groups.new("Connector", "GeometryNodeTree")
    ng.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    out = ng.nodes.new("NodeGroupOutput")

    axes = [(0, 90, 0), (90, 0, 0), (0, 0, 0)]
    arms = [sdf(ng, cylinder(ng, R, 2 * L, rot)) for rot in axes]
    union = node(ng, "GeometryNodeSDFGridBoolean")
    union.operation = "UNION"  # union takes every grid on one multi-input socket
    many = next(s for s in union.inputs if s.enabled and s.is_multi_input)
    for a in arms:
        ng.links.new(a, many)

    fillet = node(ng, "GeometryNodeSDFGridFillet", Iterations=FILLET)
    ng.links.new(union.outputs["Grid"], fillet.inputs["Grid"])

    join = ng.nodes.new("GeometryNodeJoinGeometry")
    ends = [((0, 90, 0), (s * L, 0, 0)) for s in (1, -1)] + [((90, 0, 0), (0, s * L, 0)) for s in (1, -1)] + [((0, 0, 0), (0, 0, s * L)) for s in (1, -1)]
    for rot, loc in ends:
        ng.links.new(cylinder(ng, HOLE_R, 2 * HOLE_D, rot, loc), join.inputs["Geometry"])
    holes = sdf(ng, join.outputs["Geometry"])

    cut = node(ng, "GeometryNodeSDFGridBoolean")
    cut.operation = "DIFFERENCE"
    ng.links.new(fillet.outputs["Grid"], cut.inputs["Grid 1"])
    ng.links.new(holes, cut.inputs["Grid 2"])

    # Opening (shrink, then grow back) rounds every convex edge: the arm rims and the hole lips.
    shrink = node(ng, "GeometryNodeSDFGridOffset", Distance=-ROUND)
    grow = node(ng, "GeometryNodeSDFGridOffset", Distance=ROUND)
    ng.links.new(cut.outputs["Grid"], shrink.inputs["Grid"])
    ng.links.new(shrink.outputs["Grid"], grow.inputs["Grid"])

    mesh = node(ng, "GeometryNodeGridToMesh", Threshold=0.0, Adaptivity=0.0)
    ng.links.new(grow.outputs["Grid"], mesh.inputs["Grid"])
    ng.links.new(mesh.outputs["Mesh"], out.inputs["Geometry"])

    holder = lib.link(bpy.data.objects.new("ConnectorSDF", bpy.data.meshes.new("empty")))
    mod = holder.modifiers.new("connector", "NODES")
    mod.node_group = ng
    deps = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(holder.evaluated_get(deps))
    bpy.data.objects.remove(holder)

    piece = lib.link(bpy.data.objects.new("Connector", me))
    bpy.context.view_layer.objects.active = piece
    piece.select_set(True)
    dense = len(me.polygons)
    dec = piece.modifiers.new("decimate", "DECIMATE")
    dec.ratio = min(1.0, FACES / max(dense, 1))
    bpy.ops.object.modifier_apply(modifier=dec.name)
    bpy.ops.object.shade_smooth()
    print("CONNECTOR dense=%d web=%d" % (dense, len(piece.data.polygons)))
    return piece


def preview(piece):
    """Three pieces in the site's colours, lit with strip lights like a product shot."""
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.cycles.samples = 96
    mats = [
        lib.mat("Lapis", Base_Color=lib.lin("002DB4"), Roughness=0.38, Coat_Weight=0.5, Coat_Roughness=0.08),
        lib.mat("Oat", Base_Color=lib.lin("EFE9DE"), Roughness=0.22, Coat_Weight=0.2, Subsurface_Weight=0.05),
        lib.mat("Navy", Base_Color=lib.lin("081028"), Roughness=0.08, Coat_Weight=1.0, Coat_Roughness=0.03),
    ]
    spots = [((-2.3, 0, 0.2), (25, 35, 10)), ((0, 0.6, -0.2), (-30, 15, 40)), ((2.3, -0.2, 0.3), (60, -20, 5))]
    for i, (loc, rot) in enumerate(spots):
        o = piece if i == 0 else lib.link(bpy.data.objects.new("Connector%d" % i, piece.data.copy()))
        o.location = loc
        o.rotation_euler = [math.radians(a) for a in rot]
        o.data.materials.clear()
        o.data.materials.append(mats[i])
    w = bpy.data.worlds.new("Card")
    scene.world = w
    if not w.node_tree:
        w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = lib.lin("03070F")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
    for name, loc, rot, size, energy in [
        ("StripTop", (0, 0, 6), (0, 0, 0), (10, 1.2), 900),
        ("StripLeft", (-6, 2, 2), (0, -70, 0), (1.0, 8), 500),
        ("Fill", (4, -6, 1), (80, 0, 35), (6, 6), 120),
    ]:
        ld = bpy.data.lights.new(name, "AREA")
        ld.shape = "RECTANGLE"
        ld.size, ld.size_y = size
        ld.energy = energy
        o = lib.link(bpy.data.objects.new(name, ld))
        o.location = loc
        o.rotation_euler = [math.radians(a) for a in rot]
    cam = lib.camera(lens=50, fstop=16)
    cam.location = (0, -9.5, 0.6)
    cam.rotation_euler = (math.radians(87), 0, 0)
    out = os.path.join(lib.WORK, "renders", "hero")
    os.makedirs(out, exist_ok=True)
    scene.render.filepath = os.path.join(out, "connector_preview.png")
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    check = "--check" in sys.argv
    lib.setup(preview=True, frames=1)
    piece = build()
    if not check:
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        bpy.ops.object.select_all(action="DESELECT")
        piece.select_set(True)
        bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_apply=True, export_materials="NONE",
                                  export_normals=True, export_texcoords=False, export_yup=True)
        print("EXPORTED", OUT, os.path.getsize(OUT))
    preview(piece)
