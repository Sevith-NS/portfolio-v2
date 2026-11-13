"""Shared pieces for the space film: render setup, materials, astronaut, Earth, stars.

Assets live in blender-work/assets (git-ignored):
  nasa/emu.glb          NASA 3D Resources, Extravehicular Mobility Unit (public)
  earth/*.jpg           Solar System Scope textures, CC BY 4.0 (credit needed)
"""
import math
import os
import random

import bmesh
import bpy
from mathutils import Matrix, Vector

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORK = os.path.join(ROOT, "blender-work")
ASSETS = os.path.join(WORK, "assets")
FPS = 24


def lin(h):
    """sRGB hex to the linear RGBA Blender wants."""
    h = h.lstrip("#")
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return tuple(f(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (1.0,)


NAVY = lin("0D142C")
LAPIS = lin("2440A8")
LAPIS_HI = lin("96ACFF")
RUST = lin("B4502E")
WARM = (1.0, 0.72, 0.45, 1.0)  # the one warm light: sun, lamp
SUIT = (0.80, 0.80, 0.78, 1.0)


# ---------------------------------------------------------------- render

def setup(preview=False, frames=192):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "OPTIX"
    (prefs.refresh_devices if hasattr(prefs, "refresh_devices") else prefs.get_devices)()
    for d in prefs.devices:
        d.use = d.type == "OPTIX"
    c = s.cycles
    c.device = "GPU"
    c.samples = 24 if preview else 64  # 128 took about a minute a frame on the 3060, too slow for 1152 frames
    c.use_adaptive_sampling = True
    c.adaptive_threshold = 0.05 if preview else 0.03
    c.use_denoising = True
    c.denoiser = "OPTIX" if preview else "OPENIMAGEDENOISE"
    c.denoising_use_gpu = True
    c.max_bounces = 6
    c.caustics_reflective = c.caustics_refractive = False
    r = s.render
    r.resolution_x, r.resolution_y = (960, 540) if preview else (1920, 1080)
    r.fps = FPS
    r.use_motion_blur = not preview
    r.use_persistent_data = True
    r.image_settings.file_format = "PNG"
    r.image_settings.color_depth = "8" if preview else "16"
    r.image_settings.compression = 15
    s.frame_start, s.frame_end = 1, frames
    s.view_settings.view_transform = "AgX"
    try:
        s.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass
    return s


def render(scene, out_dir, frame=None, step=1):
    os.makedirs(out_dir, exist_ok=True)
    if frame is not None:
        scene.frame_set(frame)
        scene.render.filepath = os.path.join(out_dir, "still_%04d.png" % frame)
        bpy.ops.render.render(write_still=True)
    else:
        scene.frame_step = step
        scene.render.filepath = os.path.join(out_dir, "f_")
        bpy.ops.render.render(animation=True)


# ---------------------------------------------------------------- helpers

def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


def empty(name, loc=(0, 0, 0)):
    o = link(bpy.data.objects.new(name, None))
    o.location = loc
    return o


def key(o, frame, loc=None, rot=None, scale=None, linear=False):
    """Keyframe a transform. rot is XYZ degrees. linear=True for moves that run across a cut."""
    bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR" if linear else "BEZIER"
    if loc is not None:
        o.location = loc
        o.keyframe_insert("location", frame=frame)
    if rot is not None:
        o.rotation_euler = [math.radians(a) for a in rot]
        o.keyframe_insert("rotation_euler", frame=frame)
    if scale is not None:
        o.scale = (scale,) * 3 if isinstance(scale, (int, float)) else scale
        o.keyframe_insert("scale", frame=frame)


def key_prop(owner, path, frame, value, linear=False):
    bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR" if linear else "BEZIER"
    setattr(owner, path, value)
    owner.keyframe_insert(path, frame=frame)


def look_at(o, target):
    c = o.constraints.new("TRACK_TO")
    c.target = target
    c.track_axis, c.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"
    return c


def camera(name="Cam", lens=40, fstop=2.8, focus=None):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.clip_start, cd.clip_end = 0.05, 40000
    cd.dof.use_dof = True
    cd.dof.aperture_fstop = fstop
    cd.dof.aperture_ratio = 1.5  # oval bokeh, the anamorphic feel
    if focus:
        cd.dof.focus_object = focus
    o = link(bpy.data.objects.new(name, cd))
    bpy.context.scene.camera = o
    return o


def light(name, kind, energy, color=WARM, loc=(0, 0, 0), rot=(0, 0, 0), size=1.0):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy
    ld.color = color[:3]
    if kind == "SUN":
        ld.angle = math.radians(size)
    elif kind == "AREA":
        ld.size = size
    else:
        ld.shadow_soft_size = size
    o = link(bpy.data.objects.new(name, ld))
    o.location = loc
    o.rotation_euler = [math.radians(a) for a in rot]
    if kind == "AREA":
        o.visible_glossy = False  # no square reflections in the visor
    return o


def sun_towards(direction, energy=6.0, color=(1.0, 0.86, 0.7, 1.0)):
    """A sun lamp whose light comes FROM `direction` (a vector pointing at the sun)."""
    o = light("Sun", "SUN", energy, color, size=1.6)  # wider than the real sun, for a readable glint
    o.rotation_euler = Vector(direction).normalized().to_track_quat("Z", "Y").to_euler()
    return o


# ---------------------------------------------------------------- materials

def mat(name, **inputs):
    """A Principled material. Keyword names are socket names with _ for spaces."""
    m = bpy.data.materials.new(name)
    if not m.node_tree:
        m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    for k, v in inputs.items():
        b.inputs[k.replace("_", " ")].default_value = v
    return m


def bsdf(m):
    return m.node_tree.nodes["Principled BSDF"]


def add_bump(m, layers, coords="Object"):
    """Chain noise bumps onto a material. layers = [(scale, detail, strength), ...]."""
    nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    prev = None
    for scale, detail, strength in layers:
        n = nt.nodes.new("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = scale
        n.inputs["Detail"].default_value = detail
        nt.links.new(tc.outputs[coords], n.inputs["Vector"])
        bp = nt.nodes.new("ShaderNodeBump")
        bp.inputs["Strength"].default_value = strength
        bp.inputs["Distance"].default_value = 0.01
        nt.links.new(n.outputs["Fac"], bp.inputs["Height"])
        if prev:
            nt.links.new(prev.outputs["Normal"], bp.inputs["Normal"])
        prev = bp
    nt.links.new(prev.outputs["Normal"], bsdf(m).inputs["Normal"])
    return m


def fabric(name, color=SUIT):
    """Suit cloth: fine weave, soft wrinkles, a little grime in the folds."""
    m = mat(name, Base_Color=color, Roughness=0.82, Sheen_Weight=0.35, Sheen_Roughness=0.5)
    add_bump(m, [(8, 4, 0.8), (34, 5, 0.5), (700, 2, 0.3)])  # weaker than this and the denoiser irons it flat
    nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = 6
    n.inputs["Detail"].default_value = 6
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[0].color = tuple(c * 0.72 for c in color[:3]) + (1,)
    ramp.color_ramp.elements[1].position = 0.62
    ramp.color_ramp.elements[1].color = color
    nt.links.new(tc.outputs["Object"], n.inputs["Vector"])
    nt.links.new(n.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf(m).inputs["Base Color"])
    return m


def metal(name, color=(0.55, 0.56, 0.58, 1), rough=0.38):
    return add_bump(mat(name, Base_Color=color, Metallic=1.0, Roughness=rough), [(60, 3, 0.05)])


def emission(name, color, strength):
    m = mat(name, Base_Color=(0, 0, 0, 1), Roughness=1.0)
    bsdf(m).inputs["Emission Color"].default_value = color
    bsdf(m).inputs["Emission Strength"].default_value = strength
    return m


# ---------------------------------------------------------------- astronaut

def load_astronaut():
    """NASA's EMU suit, re-shaded. Returns an empty at the body's centre; the suit faces +Y."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(ASSETS, "nasa", "emu.glb"))
    new = [o for o in bpy.data.objects if o not in before]
    mesh = next(o for o in new if o.type == "MESH")

    cloth = fabric("SuitCloth")
    grey = metal("SuitMetal")
    box = add_bump(mat("SuitBox", Base_Color=(0.62, 0.62, 0.6, 1), Roughness=0.55, Metallic=0.2), [(50, 3, 0.08)])
    # Not fully metal: a mirror facing black space renders black, this keeps a dark gold body.
    visor = mat("Visor", Base_Color=(0.9, 0.5, 0.14, 1), Metallic=0.82, Roughness=0.04,
                Coat_Weight=1.0, Coat_Roughness=0.02)
    gold = metal("SuitGold", (0.9, 0.62, 0.28, 1), 0.3)
    rust = fabric("SuitRust", RUST)
    strap = fabric("SuitStrap", lin("9A5A34"))
    patch = fabric("SuitPatch")
    img = bpy.data.images.load(os.path.join(ASSETS, "nasa", "patch_lapis.png"))
    tex = patch.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image = img
    patch.node_tree.links.new(tex.outputs["Color"], bsdf(patch).inputs["Base Color"])

    rules = [  # first match on the material name wins
        ("lambert8SG", patch),            # left shoulder, was a flag
        ("lambert9SG", cloth),            # right shoulder, was a mission patch
        ("lambert7SG", box),              # chest box face, had readable labels
        ("emusuit5_blinn3SG", gold), ("blinn3SG", visor),
        ("blinn1SG", gold), ("blinn2SG", grey),
        ("blinn12SG", strap),
        ("lambert4SG", rust), ("emusuit5_lambert3SG", rust),
        ("jetpack2SG", box), ("initialShadingGroup", grey),
        ("lambert2SG", cloth), ("lambert5SG", cloth), ("lambert10SG", cloth),
    ]
    for slot in mesh.material_slots:
        for needle, m in rules:
            if slot.material.name.endswith(needle):
                slot.material = m
                break

    # The model carries a boxy jetpack frame with arm rests. Group faces into connected parts
    # (the file stores every face loose, so join them by shared corner positions), then drop
    # the parts that are boxy (big faces) and sit out at the sides, in front of the hips or far back.
    bm = bmesh.new()
    bm.from_mesh(mesh.data)
    bm.faces.ensure_lookup_table()
    mw = mesh.matrix_world
    group = list(range(len(bm.faces)))

    def find(i):
        while group[i] != i:
            group[i] = group[group[i]]
            i = group[i]
        return i

    seen = {}
    for f in bm.faces:
        for v in f.verts:
            k = (round(v.co.x, 4), round(v.co.y, 4), round(v.co.z, 4))
            j = seen.setdefault(k, f.index)
            if j != f.index:
                group[find(j)] = find(f.index)
    parts = {}
    for f in bm.faces:
        a = f.calc_area()
        p = parts.setdefault(find(f.index), [0.0, 0, Vector(), []])
        p[0] += a
        p[1] += 1
        p[2] += (mw @ f.calc_center_median()) * a
        p[3].append(f)
    doomed = []
    for area, count, centre, faces in parts.values():
        if area / count < 0.0006:
            continue  # fine mesh: the suit itself
        c = centre / area
        side = abs(c.x - 0.03)
        if side > 0.28 or (c.y > -0.25 and c.z < 1.2 and side > 0.2) or c.y < -0.3:
            doomed += faces  # everything boxy behind the torso goes too, a clean pack replaces it below
    bmesh.ops.delete(bm, geom=doomed, context="FACES")
    bm.to_mesh(mesh.data)
    bm.free()

    root = empty("Astro")
    world = mesh.matrix_world.copy()  # keep the importer's Y-up to Z-up turn
    mesh.parent = None
    world.translation += Vector((0, 0.2, -1.15))  # body centre to the origin, so he tumbles about his middle
    mesh.matrix_world = world
    mesh.parent = root

    # A plain life-support pack in place of the frame's leftovers, which looked broken from behind.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.03, -0.24, 0.24))
    pack = bpy.context.active_object
    pack.name = "Pack"
    pack.scale = (0.56, 0.3, 0.84)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bev = pack.modifiers.new("bevel", "BEVEL")
    bev.width, bev.segments = 0.045, 5
    pack.modifiers.new("normals", "WEIGHTED_NORMAL")
    bpy.ops.object.shade_smooth()
    pack.data.materials.append(cloth)
    pack.parent = root
    for o in new:
        if o is not mesh and o.type == "EMPTY":
            bpy.data.objects.remove(o)
    return root


# ---------------------------------------------------------------- city

def specks(name, points, radius=(0.02, 0.05), color=(0.8, 0.86, 1.0, 1), strength=30.0, seed=1):
    """Glowing dust: one mesh of tiny spheres at `points`. With motion blur they streak."""
    rnd = random.Random(seed)
    bm = bmesh.new()
    for p in points:
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=rnd.uniform(*radius), matrix=Matrix.Translation(p))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(emission(name, color, strength))
    return link(bpy.data.objects.new(name, me))


def city(window, cloud_z=None, seed=3):
    """A night city in metres: a glowing street grid, dark blocks, one tower with a single lit window.

    window = (x, y, z) centre of the lit window, on the tower face that looks toward -Y.
    Returns the window's emission strength socket.
    """
    rnd = random.Random(seed)
    block, street, n = 66.0, 12.0, 34  # pitch 78: film.py's WINDOW sits on a block centre
    pitch = block + street
    half = n * pitch / 2

    ground = emission("Streets", (1.0, 0.36, 0.1, 1), 1.0)
    nt = ground.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    bands = []
    for axis in ("X", "Y"):  # a street runs along every multiple of `pitch`
        shift = nt.nodes.new("ShaderNodeMath")
        shift.operation = "ADD"
        shift.inputs[1].default_value = street / 2
        nt.links.new(sep.outputs[axis], shift.inputs[0])
        mod = nt.nodes.new("ShaderNodeMath")
        mod.operation = "FLOORED_MODULO"
        mod.inputs[1].default_value = pitch
        nt.links.new(shift.outputs[0], mod.inputs[0])
        lt = nt.nodes.new("ShaderNodeMath")
        lt.operation = "LESS_THAN"
        lt.inputs[1].default_value = street
        nt.links.new(mod.outputs[0], lt.inputs[0])
        bands.append(lt)
    road = nt.nodes.new("ShaderNodeMath")
    road.operation = "MAXIMUM"
    nt.links.new(bands[0].outputs[0], road.inputs[0])
    nt.links.new(bands[1].outputs[0], road.inputs[1])
    vor = nt.nodes.new("ShaderNodeTexVoronoi")  # street lamps, not a solid band
    vor.inputs["Scale"].default_value = 0.11
    nt.links.new(tc.outputs["Object"], vor.inputs["Vector"])
    lamp = nt.nodes.new("ShaderNodeMapRange")
    lamp.inputs["From Max"].default_value = 0.45
    lamp.inputs["To Min"].default_value = 7.0  # brighter than this clips amber to cream
    lamp.inputs["To Max"].default_value = 0.15
    nt.links.new(vor.outputs["Distance"], lamp.inputs["Value"])
    glow = nt.nodes.new("ShaderNodeMath")
    glow.operation = "MULTIPLY"
    nt.links.new(road.outputs[0], glow.inputs[0])
    nt.links.new(lamp.outputs["Result"], glow.inputs[1])
    nt.links.new(glow.outputs[0], bsdf(ground).inputs["Emission Strength"])
    bpy.ops.mesh.primitive_plane_add(size=2 * half + 6000)
    bpy.context.active_object.data.materials.append(ground)

    wall = mat("Tower", Base_Color=(0.018, 0.022, 0.04, 1), Roughness=0.8)
    nt = wall.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    brick = nt.nodes.new("ShaderNodeTexBrick")  # dark glass panes in a grid: they only catch reflections
    brick.offset = 0.0
    brick.inputs["Scale"].default_value = 0.3
    brick.inputs["Mortar Size"].default_value = 0.06
    brick.inputs["Color1"].default_value = brick.inputs["Color2"].default_value = (0.12, 0.12, 0.12, 1)
    brick.inputs["Mortar"].default_value = (0.85, 0.85, 0.85, 1)
    nt.links.new(tc.outputs["Object"], brick.inputs["Vector"])
    nt.links.new(brick.outputs["Color"], bsdf(wall).inputs["Roughness"])

    tx, ty = window[0], window[1] + 22.0  # the tower's centre
    bm = bmesh.new()

    def tower(cx, cy, w, d, h):
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((cx, cy, h / 2)) @ Matrix.Diagonal((w, d, h, 1)))

    for i in range(n):
        for j in range(n):
            cx, cy = (i + 0.5) * pitch - half, (j + 0.5) * pitch - half
            if abs(cx - tx) < pitch * 0.6 and abs(cy - ty) < pitch * 0.6:
                continue  # the lit tower's own block
            if cy < ty and abs(cx - tx) < pitch * 1.6 and ty - cy < pitch * 3.2:
                h_cap = 30.0  # keep the camera's way in clear
            else:
                h_cap = 400.0
            for qx in (-1, 1):
                for qy in (-1, 1):
                    if rnd.random() < 0.12:
                        continue
                    h = min(h_cap, rnd.lognormvariate(3.3, 0.55))
                    tower(cx + qx * block / 4, cy + qy * block / 4,
                          rnd.uniform(18, 28), rnd.uniform(18, 28), h)
    tower(tx, ty, 44.0, 44.0, window[2] + 38.0)
    me = bpy.data.meshes.new("City")
    bm.to_mesh(me)
    bm.free()
    me.materials.append(wall)
    link(bpy.data.objects.new("City", me))

    lit = emission("LitWindow", WARM, 20.0)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(window[0], window[1] - 0.05, window[2]),
                                     rotation=(math.radians(90), 0, 0))
    w = bpy.context.active_object
    w.scale = (3.4, 2.5, 1)
    w.data.materials.append(lit)

    if cloud_z is not None:  # thin cloud between the camera and the streets
        cl = mat("Cloud", Base_Color=(1, 1, 1, 1), Roughness=1.0)
        nt = cl.node_tree
        tc = nt.nodes.new("ShaderNodeTexCoord")
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = 0.004
        nz.inputs["Detail"].default_value = 8.0
        nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
        a = nt.nodes.new("ShaderNodeMapRange")
        a.inputs["From Min"].default_value = 0.5
        a.inputs["From Max"].default_value = 0.75
        a.inputs["To Max"].default_value = 0.55
        nt.links.new(nz.outputs["Fac"], a.inputs["Value"])
        nt.links.new(a.outputs["Result"], bsdf(cl).inputs["Alpha"])
        bpy.ops.mesh.primitive_plane_add(size=9000, location=(0, 0, cloud_z))
        bpy.context.active_object.data.materials.append(cl)
        bpy.context.active_object.visible_shadow = False

    moon = light("Moon", "SUN", 0.5, (0.22, 0.38, 1.0), size=3.0)
    moon.rotation_euler = Vector((-0.5, -0.4, 0.75)).to_track_quat("Z", "Y").to_euler()
    return bsdf(lit).inputs["Emission Strength"]


# ---------------------------------------------------------------- space

def stars(strength=1.0):
    """Milky Way map plus sharp procedural stars, on the world."""
    w = bpy.data.worlds.new("Space")
    bpy.context.scene.world = w
    if not w.node_tree:
        w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(os.path.join(ASSETS, "earth", "stars.jpg"))
    bg1 = nt.nodes.new("ShaderNodeBackground")
    bg1.inputs["Strength"].default_value = 0.35 * strength
    nt.links.new(env.outputs["Color"], bg1.inputs["Color"])

    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 260
    nt.links.new(tc.outputs["Generated"], vor.inputs["Vector"])
    dot = nt.nodes.new("ShaderNodeMapRange")  # a small disc round each cell point
    dot.inputs["From Min"].default_value = 0.0
    dot.inputs["From Max"].default_value = 0.09
    dot.inputs["To Min"].default_value = 1.0
    dot.inputs["To Max"].default_value = 0.0
    nt.links.new(vor.outputs["Distance"], dot.inputs["Value"])
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(vor.outputs["Color"], sep.inputs["Color"])
    powr = nt.nodes.new("ShaderNodeMath")  # most stars faint, a few bright
    powr.operation = "POWER"
    powr.inputs[1].default_value = 6.0
    nt.links.new(sep.outputs["Red"], powr.inputs[0])
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    nt.links.new(dot.outputs["Result"], mul.inputs[0])
    nt.links.new(powr.outputs["Value"], mul.inputs[1])
    gain = nt.nodes.new("ShaderNodeMath")
    gain.operation = "MULTIPLY"
    gain.inputs[1].default_value = 40.0 * strength
    nt.links.new(mul.outputs["Value"], gain.inputs[0])
    bg2 = nt.nodes.new("ShaderNodeBackground")
    bg2.inputs["Color"].default_value = (0.8, 0.86, 1.0, 1)
    nt.links.new(gain.outputs["Value"], bg2.inputs["Strength"])
    add = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(bg1.outputs[0], add.inputs[0])
    nt.links.new(bg2.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], out.inputs["Surface"])
    return w


def _sphere(name, radius, segs=256):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=segs // 2, radius=radius)
    o = bpy.context.active_object
    o.name = name
    bpy.ops.object.shade_smooth()
    return o


def _img(nt, file, color=True):
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = bpy.data.images.load(os.path.join(ASSETS, "earth", file))
    if not color:
        n.image.colorspace_settings.name = "Non-Color"
    return n


def _day_factor(nt, sun_dir, lo=-0.15, hi=0.25):
    """1 where the sun hits, 0 on the night side."""
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    d = nt.nodes.new("ShaderNodeVectorMath")
    d.operation = "DOT_PRODUCT"
    d.inputs[1].default_value = Vector(sun_dir).normalized()
    nt.links.new(geo.outputs["Normal"], d.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = lo
    mr.inputs["From Max"].default_value = hi
    nt.links.new(d.outputs["Value"], mr.inputs["Value"])
    return mr.outputs["Result"], d


def earth(sun_dir, radius=6371.0, face=(13.0, 77.6), toward=(0, 0, 1)):
    """Earth with night lights, clouds and a lapis rim.

    1 unit is 1 km here while the astronaut stays 2 units tall, which keeps the numbers small.
    face = (lat, lon) turned to point along `toward`. Default is Bangalore.
    Returns (root empty, dict of the dot-product nodes so the sun can be animated).
    """
    root = empty("Earth")
    suns = {}

    ground = _sphere("EarthGround", radius)
    m = mat("EarthGround", Roughness=0.7)
    nt = m.node_tree
    day = _img(nt, "daymap.jpg")
    night = _img(nt, "nightmap.jpg")
    fac, suns["ground"] = _day_factor(nt, sun_dir)
    lw = nt.nodes.new("ShaderNodeLayerWeight")  # haze, only right at the limb
    lw.inputs["Blend"].default_value = 0.5
    hz = nt.nodes.new("ShaderNodeMapRange")
    hz.inputs["From Min"].default_value = 0.88
    hz.inputs["From Max"].default_value = 1.0
    hz.inputs["To Max"].default_value = 0.55
    nt.links.new(lw.outputs["Facing"], hz.inputs["Value"])
    haze = nt.nodes.new("ShaderNodeMixRGB")
    haze.inputs["Color2"].default_value = (0.12, 0.26, 1.0, 1)
    nt.links.new(hz.outputs["Result"], haze.inputs["Fac"])
    rich = nt.nodes.new("ShaderNodeHueSaturation")  # deeper oceans, the map is pale as shipped
    rich.inputs["Saturation"].default_value = 1.35
    rich.inputs["Value"].default_value = 0.7
    nt.links.new(day.outputs["Color"], rich.inputs["Color"])
    nt.links.new(rich.outputs["Color"], haze.inputs["Color1"])
    nt.links.new(haze.outputs["Color"], bsdf(m).inputs["Base Color"])
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    nt.links.new(fac, inv.inputs[1])
    glow = nt.nodes.new("ShaderNodeMath")
    glow.operation = "MULTIPLY"
    glow.inputs[1].default_value = 9.0
    nt.links.new(inv.outputs["Value"], glow.inputs[0])
    tint = nt.nodes.new("ShaderNodeMixRGB")  # city lights go terracotta-amber, never yellow
    tint.blend_type = "MULTIPLY"
    tint.inputs["Fac"].default_value = 1.0
    tint.inputs["Color2"].default_value = (1.0, 0.5, 0.22, 1)
    nt.links.new(night.outputs["Color"], tint.inputs["Color1"])
    nt.links.new(tint.outputs["Color"], bsdf(m).inputs["Emission Color"])
    nt.links.new(glow.outputs["Value"], bsdf(m).inputs["Emission Strength"])
    ground.data.materials.append(m)

    clouds = _sphere("EarthClouds", radius * 1.003)
    m = mat("EarthClouds", Base_Color=(1, 1, 1, 1), Roughness=1.0)
    nt = m.node_tree
    c = _img(nt, "clouds.jpg", color=False)
    thin = nt.nodes.new("ShaderNodeMapRange")  # drop the thin haze so the land shows through
    thin.inputs["From Min"].default_value = 0.18
    thin.inputs["From Max"].default_value = 0.9
    thin.inputs["To Max"].default_value = 0.85
    nt.links.new(c.outputs["Color"], thin.inputs["Value"])
    nt.links.new(thin.outputs["Result"], bsdf(m).inputs["Alpha"])
    clouds.data.materials.append(m)

    air = _sphere("EarthAir", radius * 1.02)
    m = bpy.data.materials.new("EarthAir")
    if not m.node_tree:
        m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (0.16, 0.33, 1.0, 1)
    em.inputs["Strength"].default_value = 2.2
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.5
    ramp = nt.nodes.new("ShaderNodeValToRGB")  # thin glow that peaks just above the limb
    e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.45, (0, 0, 0, 1)
    e[1].position, e[1].color = 0.93, (1, 1, 1, 1)
    end = e.new(1.0)
    end.color = (0, 0, 0, 1)
    fac, suns["air"] = _day_factor(nt, sun_dir, -0.45, 0.2)
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    nt.links.new(lw.outputs["Facing"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], mul.inputs[0])
    nt.links.new(fac, mul.inputs[1])
    nt.links.new(mul.outputs["Value"], mix.inputs["Fac"])
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    air.data.materials.append(m)
    air.visible_shadow = False

    # Turn the globe so `face` points along `toward`: find the vertex whose UV is that lat/lon.
    lat, lon = face
    want = Vector(((lon + 180) / 360, (lat + 90) / 180))
    me = ground.data
    uv = me.uv_layers.active.data
    best = min(me.loops, key=lambda l: (uv[l.index].uv - want).length)
    local = me.vertices[best.vertex_index].co.normalized()
    root.rotation_euler = local.rotation_difference(Vector(toward).normalized()).to_euler()

    for o in (ground, clouds, air):
        o.parent = root
    return root, suns
