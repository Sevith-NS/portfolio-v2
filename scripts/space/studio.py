"""The studio room at night, built in Blender. The film's room scene uses it; it also renders alone.

  blender -b --python scripts/space/studio.py -- --shot wide --preview
  blender -b --python scripts/space/studio.py -- --shot desk

Stills land in blender-work/renders/studio/.
The room: x is left to right, +y is the back wall the desk stands against, the floor is z = 0.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Matrix, Vector  # noqa: E402

import lib  # noqa: E402
from lib import bsdf, lin, mat  # noqa: E402

PH = os.path.join(lib.ASSETS, "polyhaven")
W, D, H = 4.6, 4.2, 2.7
BACK = D / 2
DESK_Z = 0.77  # top surface
DESK_Y = BACK - 0.5  # desk centre
OAT = lin("EFE9DE")
WALL = lin("18224A")


# ---------------------------------------------------------------- builders

def finish(o, bevel=0.003):
    """Real edges: a small bevel and clean shading on every hard-surface piece."""
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        b = o.modifiers.new("bevel", "BEVEL")
        b.width, b.segments, b.limit_method = bevel, 3, "ANGLE"
        o.modifiers.new("normals", "WEIGHTED_NORMAL")
        bpy.ops.object.shade_smooth()
    return o


def box(name, size, loc, material, bevel=0.003, rot_z=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=(0, 0, math.radians(rot_z)))
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    finish(o, bevel)
    o.data.materials.append(material)
    return o


def cyl(name, radius, height, loc, material, bevel=0.002, verts=48, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=height, location=loc,
                                        rotation=[math.radians(a) for a in rot])
    o = bpy.context.active_object
    o.name = name
    finish(o, bevel)
    o.data.materials.append(material)
    return o


def tex_mat(name, folder, scale=1.0, tint=None, normal=False, uv=False, **inputs):
    """Poly Haven surface. Box-projected in object space unless uv=True (planes, where the normal map is exact)."""
    m = mat(name, **inputs)
    nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale,) * 3
    nt.links.new(tc.outputs["UV" if uv else "Object"], mp.inputs["Vector"])

    def img(file, color):
        n = nt.nodes.new("ShaderNodeTexImage")
        n.image = bpy.data.images.load(os.path.join(PH, folder, file), check_existing=True)
        if not color:
            n.image.colorspace_settings.name = "Non-Color"
        if not uv:
            n.projection, n.projection_blend = "BOX", 0.15
        nt.links.new(mp.outputs["Vector"], n.inputs["Vector"])
        return n

    diff = img("diff.jpg", True)
    out = diff.outputs["Color"]
    if tint:
        mul = nt.nodes.new("ShaderNodeMixRGB")
        mul.blend_type = "MULTIPLY"
        mul.inputs["Fac"].default_value = 1.0
        mul.inputs["Color2"].default_value = tint
        nt.links.new(out, mul.inputs["Color1"])
        out = mul.outputs["Color"]
    nt.links.new(out, bsdf(m).inputs["Base Color"])
    nt.links.new(img("rough.jpg", False).outputs["Color"], bsdf(m).inputs["Roughness"])
    if normal:
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nt.links.new(img("nor.jpg", False).outputs["Color"], nm.inputs["Color"])
        nt.links.new(nm.outputs["Normal"], bsdf(m).inputs["Normal"])
    else:  # box projection has no tangents, so read relief off the colour map instead
        bp = nt.nodes.new("ShaderNodeBump")
        bp.inputs["Strength"].default_value = 0.25
        bp.inputs["Distance"].default_value = 0.002
        nt.links.new(diff.outputs["Color"], bp.inputs["Height"])
        nt.links.new(bp.outputs["Normal"], bsdf(m).inputs["Normal"])
    return m


def load_model(name, loc, rot_z=0.0, scale=1.0):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(PH, name, name + ".gltf"))
    root = lib.empty(name)
    for o in [o for o in bpy.data.objects if o not in before and o is not root]:
        if o.parent is None:
            o.parent = root
    root.location = loc
    root.rotation_euler = (0, 0, math.radians(rot_z))
    root.scale = (scale,) * 3
    return root


def glow_mat(name, color, strength):
    return lib.emission(name, color, strength)


# ---------------------------------------------------------------- the room

def build():
    """Build the whole room. Returns the things a film scene wants to animate."""
    random.seed(7)
    s = {}

    walnut = tex_mat("Walnut", "american_walnut_veneer", scale=1.1, tint=(0.95, 0.56, 0.33, 1),  # the map ships grey
                     Coat_Weight=0.25, Coat_Roughness=0.25)
    steel = mat("BlackSteel", Base_Color=(0.02, 0.02, 0.022, 1), Metallic=1.0, Roughness=0.42)
    plastic = mat("DarkPlastic", Base_Color=(0.025, 0.027, 0.032, 1), Roughness=0.45)
    paint = lib.add_bump(mat("WallPaint", Base_Color=WALL, Roughness=0.88), [(140, 3, 0.06), (9, 2, 0.04)])
    trim = mat("Trim", Base_Color=tuple(c * 0.55 for c in WALL[:3]) + (1,), Roughness=0.6)
    ceramic = mat("Ceramic", Base_Color=OAT, Roughness=0.28, Coat_Weight=0.6)
    paper = mat("Paper", Base_Color=(0.86, 0.85, 0.81, 1), Roughness=0.9)

    # floor, walls, ceiling
    bpy.ops.mesh.primitive_plane_add(size=1)
    floor = bpy.context.active_object
    floor.name = "Floor"
    floor.scale = (W, D, 1)
    floor.data.materials.append(tex_mat("Parquet", "herringbone_parquet", scale=3.2, normal=True, uv=True,
                                        tint=(0.62, 0.55, 0.5, 1), Coat_Weight=0.3, Coat_Roughness=0.3))
    t = 0.12
    box("WallBack", (W + 2 * t, t, H), (0, BACK + t / 2, H / 2), paint, 0)
    box("WallFront", (W + 2 * t, t, H), (0, -BACK - t / 2, H / 2), paint, 0)
    box("WallRight", (t, D, H), (W / 2 + t / 2, 0, H / 2), paint, 0)
    box("Ceiling", (W + 2 * t, D + 2 * t, t), (0, 0, H + t / 2), paint, 0)
    # left wall with a window opening: y 0.0..1.5, z 0.95..2.25
    wy0, wy1, wz0, wz1 = -0.1, 1.5, 0.95, 2.25
    xl = -W / 2 - t / 2
    box("WallLeftA", (t, wy0 + BACK, H), (xl, (wy0 - BACK) / 2, H / 2), paint, 0)
    box("WallLeftB", (t, BACK - wy1, H), (xl, (wy1 + BACK) / 2, H / 2), paint, 0)
    box("WallLeftSill", (t, wy1 - wy0, wz0), (xl, (wy0 + wy1) / 2, wz0 / 2), paint, 0)
    box("WallLeftHead", (t, wy1 - wy0, H - wz1), (xl, (wy0 + wy1) / 2, (H + wz1) / 2), paint, 0)
    for y in (-BACK + 0.01, BACK - 0.01):
        box("Skirting", (W, 0.02, 0.09), (0, y, 0.045), trim, 0.002)
    box("Skirting", (0.02, D, 0.09), (W / 2 - 0.01, 0, 0.045), trim, 0.002)

    # window: frame, a mullion, faint glass, the city beyond
    fx = -W / 2 - 0.03
    for y in (wy0, wy1, (wy0 + wy1) / 2):
        box("WinFrameV", (0.05, 0.04, wz1 - wz0), (fx, y, (wz0 + wz1) / 2), steel)
    for z in (wz0, wz1):
        box("WinFrameH", (0.05, wy1 - wy0, 0.04), (fx, (wy0 + wy1) / 2, z), steel)
    box("WinSill", (0.2, wy1 - wy0 + 0.1, 0.03), (-W / 2 + 0.04, (wy0 + wy1) / 2, wz0 - 0.005), walnut)
    glass = bpy.data.materials.new("Glass")
    if not glass.node_tree:
        glass.use_nodes = True
    nt = glass.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    mix = nt.nodes.new("ShaderNodeMixShader")
    mix.inputs["Fac"].default_value = 0.07
    gl = nt.nodes.new("ShaderNodeBsdfGlossy")
    gl.inputs["Roughness"].default_value = 0.02
    nt.links.new(nt.nodes.new("ShaderNodeBsdfTransparent").outputs[0], mix.inputs[1])
    nt.links.new(gl.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    pane = box("WinGlass", (0.006, wy1 - wy0, wz1 - wz0), (fx, (wy0 + wy1) / 2, (wz0 + wz1) / 2), glass, 0)
    pane.visible_shadow = False

    city = glow_mat("City", (1, 1, 1, 1), 1.0)  # warm window dots on navy, read as bokeh through the glass
    nt = city.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 34
    nt.links.new(tc.outputs["Object"], vor.inputs["Vector"])
    dot = nt.nodes.new("ShaderNodeMapRange")
    dot.inputs["From Max"].default_value = 0.12
    dot.inputs["To Min"].default_value = 1.0
    dot.inputs["To Max"].default_value = 0.0
    nt.links.new(vor.outputs["Distance"], dot.inputs["Value"])
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(vor.outputs["Color"], sep.inputs["Color"])
    few = nt.nodes.new("ShaderNodeMath")  # only some cells are lit
    few.operation = "GREATER_THAN"
    few.inputs[1].default_value = 0.6
    nt.links.new(sep.outputs["Green"], few.inputs[0])
    on = nt.nodes.new("ShaderNodeMath")
    on.operation = "MULTIPLY"
    nt.links.new(dot.outputs["Result"], on.inputs[0])
    nt.links.new(few.outputs["Value"], on.inputs[1])
    ramp = nt.nodes.new("ShaderNodeMixRGB")
    ramp.inputs["Color1"].default_value = tuple(c * 0.25 for c in lib.NAVY[:3]) + (1,)
    ramp.inputs["Color2"].default_value = (1.0, 0.42, 0.14, 1)
    nt.links.new(on.outputs["Value"], ramp.inputs["Fac"])
    gain = nt.nodes.new("ShaderNodeMath")
    gain.operation = "MULTIPLY_ADD"
    gain.inputs[1].default_value = 60.0
    gain.inputs[2].default_value = 0.6
    nt.links.new(on.outputs["Value"], gain.inputs[0])
    nt.links.new(ramp.outputs["Color"], bsdf(city).inputs["Emission Color"])
    nt.links.new(gain.outputs["Value"], bsdf(city).inputs["Emission Strength"])
    box("CityBeyond", (0.1, 40, 22), (-W / 2 - 16, 0.7, 4), city, 0)
    s["moon"] = lib.light("Moon", "AREA", 55, (0.22, 0.38, 1.0), loc=(-W / 2 - 0.4, (wy0 + wy1) / 2, 1.7),
                          rot=(0, -90, 0), size=1.3)

    # desk
    dx = 0.25
    box("DeskTop", (1.9, 0.82, 0.04), (dx, DESK_Y, DESK_Z - 0.02), walnut, 0.004)
    for sx in (-0.85, 0.85):
        for sy in (-0.34, 0.34):
            box("DeskLeg", (0.04, 0.04, DESK_Z - 0.04), (dx + sx, DESK_Y + sy, (DESK_Z - 0.04) / 2), steel, 0.004)
        box("DeskFoot", (0.04, 0.72, 0.04), (dx + sx, DESK_Y, 0.02), steel, 0.004)
        box("DeskRail", (0.04, 0.72, 0.04), (dx + sx, DESK_Y, DESK_Z - 0.06), steel, 0.004)
    felt = lib.add_bump(mat("Felt", Base_Color=lin("1B2C6E"), Roughness=0.95, Sheen_Weight=0.5), [(900, 2, 0.3)])
    box("DeskMat", (0.95, 0.42, 0.004), (dx - 0.05, DESK_Y - 0.14, DESK_Z + 0.002), felt, 0.001)

    # monitor: lapis glow, no readable content
    mx, my = dx - 0.05, DESK_Y + 0.2
    box("MonitorBase", (0.26, 0.2, 0.012), (mx, my + 0.02, DESK_Z + 0.006), steel, 0.004)
    box("MonitorNeck", (0.05, 0.025, 0.3), (mx, my + 0.05, DESK_Z + 0.15), steel, 0.004)
    box("MonitorBody", (0.72, 0.022, 0.42), (mx, my, DESK_Z + 0.37), plastic, 0.005)
    screen = glow_mat("Screen", lib.LAPIS, 0.9)
    nt = screen.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = 1.6
    n.inputs["Detail"].default_value = 1.0
    nt.links.new(tc.outputs["Object"], n.inputs["Vector"])
    grad = nt.nodes.new("ShaderNodeValToRGB")
    e = grad.color_ramp.elements
    e[0].position, e[0].color = 0.42, lin("0A1238")
    e[1].position, e[1].color = 0.8, lib.LAPIS_HI
    mid = e.new(0.58)
    mid.color = lib.LAPIS
    nt.links.new(n.outputs["Fac"], grad.inputs["Fac"])
    nt.links.new(grad.outputs["Color"], bsdf(screen).inputs["Emission Color"])
    s["screen"] = bsdf(screen).inputs["Emission Strength"]
    box("MonitorScreen", (0.7, 0.002, 0.4), (mx, my - 0.012, DESK_Z + 0.37), screen, 0)

    # keyboard and mouse
    kx, ky = mx - 0.06, DESK_Y - 0.14
    box("Keyboard", (0.31, 0.11, 0.012), (kx, ky, DESK_Z + 0.01), steel, 0.003)
    keycap = mat("Keycap", Base_Color=(0.05, 0.052, 0.06, 1), Roughness=0.5)
    k = box("Key", (0.0165, 0.0165, 0.007), (kx - 0.143, ky - 0.042, DESK_Z + 0.0195), keycap, 0.0015)
    for axis, count in ((0, 16), (1, 5)):
        a = k.modifiers.new("array", "ARRAY")
        a.count = count
        a.relative_offset_displace = (1.16, 0, 0) if axis == 0 else (0, 1.27, 0)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1,
                                         location=(kx + 0.27, ky, DESK_Z + 0.014))
    mouse = bpy.context.active_object
    mouse.name = "Mouse"
    mouse.scale = (0.03, 0.052, 0.017)
    bpy.ops.object.shade_smooth()
    mouse.data.materials.append(plastic)

    # the lamp: Poly Haven's clamp lamp on the desk's back edge, head toward the room
    lx, ly = dx + 0.72, DESK_Y + 0.41
    load_model("desk_lamp_arm_01", (lx, ly, DESK_Z), rot_z=180)
    head = Vector((lx, ly - 0.175, DESK_Z + 0.70))
    aim = (Vector((dx + 0.15, DESK_Y - 0.25, DESK_Z)) - head).normalized()  # down onto the desk, toward the chair
    # The light sits just outside the shade, or the bulb mesh swallows it.
    s["lamp"] = lib.light("Lamp", "SPOT", 95, lib.WARM, loc=head + aim * 0.13, size=0.03)  # more clips the desk to white
    s["lamp"].rotation_euler = aim.to_track_quat("-Z", "Y").to_euler()
    bulb = bsdf(bpy.data.materials["desk_lamp_arm_01_light"])
    bulb.inputs["Emission Color"].default_value = lib.WARM
    bulb.inputs["Emission Strength"].default_value = 30.0
    s["lamp"].data.spot_size = math.radians(140)
    s["lamp"].data.spot_blend = 0.7
    s["lamp_pos"] = head

    # chair, rug, plant
    load_model("modern_arm_chair_01", (dx - 0.1, DESK_Y - 0.95, 0.012), rot_z=168)
    rug = tex_mat("Rug", "wool_boucle", scale=9.0, tint=OAT, Sheen_Weight=0.4)
    box("Rug", (2.5, 1.8, 0.012), (dx, DESK_Y - 0.9, 0.006), rug, 0.004)
    load_model("potted_plant_04", (dx - 0.72, DESK_Y + 0.22, DESK_Z), rot_z=40)

    # loose things that float in the film
    loose = []
    mug = cyl("Mug", 0.041, 0.092, (dx + 0.42, DESK_Y - 0.2, DESK_Z + 0.046), ceramic, 0.004)
    coffee = cyl("Coffee", 0.036, 0.002, (0, 0, 0.044), mat("Coffee", Base_Color=(0.03, 0.015, 0.008, 1), Roughness=0.1), 0)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.007, location=(0.045, 0, 0),
                                     rotation=(math.radians(90), 0, 0))
    handle = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    handle.data.materials.append(ceramic)
    for part in (coffee, handle):
        part.parent = mug
    loose.append(mug)
    for i, (px, py, rz) in enumerate([(-0.78, -0.2, 8), (-0.76, -0.19, -6), (-0.8, -0.22, 21)]):
        loose.append(box("Paper%d" % i, (0.21, 0.297, 0.0006), (dx + px, DESK_Y + py, DESK_Z + 0.001 + i * 0.0012),
                         paper, 0, rot_z=rz))
    loose.append(box("Notebook", (0.15, 0.21, 0.014), (dx + 0.72, DESK_Y - 0.12, DESK_Z + 0.007),
                     lib.add_bump(mat("NotebookCover", Base_Color=lib.LAPIS, Roughness=0.6), [(300, 2, 0.15)]),
                     0.003, rot_z=-12))
    loose.append(cyl("Pencil", 0.0038, 0.18, (dx + 0.62, DESK_Y - 0.26, DESK_Z + 0.004),
                     mat("PencilPaint", Base_Color=lib.RUST, Roughness=0.4), 0.0008, verts=6, rot=(90, 0, 35)))
    s["loose"] = loose

    # the lit cubes on the right wall, staggered, as in the site's studio
    strip = glow_mat("CubeStrip", lib.WARM, 14.0)
    spines = [mat("Spine%d" % i, Base_Color=c, Roughness=0.7) for i, c in enumerate(
        [lib.LAPIS, OAT, lib.RUST, lin("0D142C"), lin("5A6FC0"), lin("3A2A22")])]
    cw, cd, ct = 0.44, 0.27, 0.018
    cxr = W / 2 - cd / 2
    for i, (cy, cz) in enumerate([(-0.9, 1.22), (-0.42, 1.66), (0.06, 1.22), (0.54, 1.66), (1.02, 1.22)]):
        box("CubeTop", (cd, cw, ct), (cxr, cy, cz + cw / 2 - ct / 2), walnut)
        box("CubeBottom", (cd, cw, ct), (cxr, cy, cz - cw / 2 + ct / 2), walnut)
        for sy in (-1, 1):
            box("CubeSide", (cd, ct, cw - 2 * ct), (cxr, cy + sy * (cw / 2 - ct / 2), cz), walnut)
        box("CubeBack", (ct, cw - 2 * ct, cw - 2 * ct), (W / 2 - ct / 2, cy, cz), walnut, 0)
        box("CubeStrip", (0.008, cw - 2 * ct - 0.02, 0.008), (W / 2 - ct - 0.012, cy, cz + cw / 2 - ct - 0.008), strip, 0)
        y = cy - cw / 2 + ct + 0.012
        for _ in range(random.randint(3, 7)):  # a short row of books in each
            bw, bh = random.uniform(0.018, 0.04), random.uniform(0.2, 0.3)
            if y + bw > cy + cw / 2 - ct - 0.05:
                break
            box("Book", (random.uniform(0.15, 0.2), bw, bh), (cxr + 0.01, y + bw / 2, cz - cw / 2 + ct + bh / 2),
                random.choice(spines), 0.002)
            y += bw + 0.002

    # one framed print over the desk: the gallery's Aurora card back, lapis lights under grain
    aurora = mat("Aurora", Roughness=0.5)
    nt = aurora.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = 2.2
    n.inputs["Detail"].default_value = 0.0
    n.inputs["Distortion"].default_value = 1.4
    nt.links.new(tc.outputs["Object"], n.inputs["Vector"])
    grad = nt.nodes.new("ShaderNodeValToRGB")
    e = grad.color_ramp.elements
    e[0].position, e[0].color = 0.32, lin("0A1030")
    e[1].position, e[1].color = 0.7, lib.LAPIS_HI
    mid = e.new(0.5)
    mid.color = lib.LAPIS
    nt.links.new(n.outputs["Fac"], grad.inputs["Fac"])
    nt.links.new(grad.outputs["Color"], bsdf(aurora).inputs["Base Color"])
    ax, az = dx - 1.25, 1.62
    box("PrintFrame", (0.62, 0.025, 0.86), (ax, BACK - 0.0125, az), steel, 0.003)
    box("Print", (0.56, 0.004, 0.8), (ax, BACK - 0.027, az), aurora, 0)

    # dust in the lamp light: the site's dust, here as real specks
    bm = bmesh.new()
    for _ in range(260):
        p = Vector((random.gauss(lx - 0.4, 0.45), random.gauss(DESK_Y - 0.3, 0.4), random.uniform(0.75, 1.7)))
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=random.uniform(0.0006, 0.0015),
                                   matrix=Matrix.Translation(p))
    me = bpy.data.meshes.new("Dust")
    bm.to_mesh(me)
    bm.free()
    dust = lib.link(bpy.data.objects.new("Dust", me))
    me.materials.append(mat("Dust", Base_Color=(1, 1, 1, 1), Roughness=1.0))
    s["dust"] = dust

    world = bpy.data.worlds.new("Night")
    bpy.context.scene.world = world
    if not world.node_tree:
        world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = lib.NAVY
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.02
    return s


SHOTS = {  # camera position, look-at point, lens, f-stop
    "wide": ((1.9, -1.9, 1.5), (-0.35, 1.3, 1.0), 22, 4.0),     # from the right: window, print, desk
    "cubes": ((-1.6, -1.8, 1.45), (0.6, 1.3, 1.0), 24, 4.0),    # from the left: desk and the lit cubes
    "desk": ((1.15, 0.05, 1.3), (0.1, 1.75, 0.98), 35, 2.2),
}
EXPOSURE = 1.2  # the room is lit by one lamp, lift it so the dark still has detail

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--shot", default="wide", choices=list(SHOTS))
    p.add_argument("--preview", action="store_true")
    a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
    scene = lib.setup(preview=a.preview, frames=1)
    scene.cycles.max_bounces = 8
    scene.view_settings.exposure = EXPOSURE
    build()
    pos, aim, lens, fstop = SHOTS[a.shot]
    target = lib.empty("Aim", aim)
    cam = lib.camera(lens=lens, fstop=fstop, focus=target)
    cam.location = pos
    lib.look_at(cam, target)
    out = os.path.join(lib.WORK, "renders", "studio")
    os.makedirs(out, exist_ok=True)
    scene.render.filepath = os.path.join(out, a.shot + ("_preview" if a.preview else "") + ".png")
    bpy.ops.render.render(write_still=True)
