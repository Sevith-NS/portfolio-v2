# The astronaut for the landing page's closing scene, modelled in Blender and exported
# for the browser. Every limb is its own object, pivoted at its joint and parented
# shoulder to hand and hip to boot, so the site can pose and float it (components/three/Space.tsx).
#
#   blender -b -P scripts/astronaut.py                 writes public/models/astronaut.glb
#   blender -b -P scripts/astronaut.py -- preview.png  also renders a posed still to check it
import bpy, bmesh, math, sys
from mathutils import Matrix, Vector

bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, color, rough, metal=0.0, glow=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if glow:
        b.inputs["Emission Color"].default_value = (*glow, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m


SUIT = material("suit", (0.86, 0.87, 0.9), 0.62)
GREY = material("grey", (0.2, 0.215, 0.25), 0.55)
METAL = material("metal", (0.7, 0.72, 0.76), 0.28, metal=1.0)
VISOR = material("visor", (0.004, 0.006, 0.014), 0.05, metal=1.0)
LAPIS = material("lapis", (0.0, 0.026, 0.456), 0.45)  # the site's accent, #002DB4
LAMP = material("lamp", (0.03, 0.1, 1.0), 0.4, glow=(0.2, 0.33, 1.0), strength=4.0)

AXIS = {"Z": Matrix.Identity(4), "X": Matrix.Rotation(math.pi / 2, 4, "Y"), "Y": Matrix.Rotation(math.pi / 2, 4, "X")}


class Part:
    """One rigid piece of the suit, built around its joint at the origin."""

    def __init__(self, name, at, parent=None, bevel=0.03):
        self.bm = bmesh.new()
        self.name, self.at, self.parent, self.bevel = name, at, parent, bevel
        self.mats = []

    def _paint(self, verts, mat):
        if mat not in self.mats:
            self.mats.append(mat)
        for f in {f for v in verts for f in v.link_faces}:
            f.material_index, f.smooth = self.mats.index(mat), True

    def ball(self, at, radii, mat, seg=32):
        radii = (radii,) * 3 if isinstance(radii, (int, float)) else radii
        r = bmesh.ops.create_uvsphere(self.bm, u_segments=seg, v_segments=seg // 2, radius=1, matrix=Matrix.Translation(at) @ Matrix.Diagonal((*radii, 1)))
        self._paint(r["verts"], mat)

    def box(self, at, size, mat):
        r = bmesh.ops.create_cube(self.bm, size=1, matrix=Matrix.Translation(at) @ Matrix.Diagonal((*size, 1)))
        self._paint(r["verts"], mat)

    def limb(self, top, bottom, radius, mat, x=0.0, y=0.0):
        """A capsule hanging down the Z axis from `top` to `bottom`."""
        r = bmesh.ops.create_cone(self.bm, cap_ends=False, segments=32, radius1=radius, radius2=radius, depth=top - bottom, matrix=Matrix.Translation((x, y, (top + bottom) / 2)))
        self._paint(r["verts"], mat)
        for z in (top, bottom):
            self.ball((x, y, z), radius, mat)

    def ring(self, at, major, minor, mat, axis="Z", seg=40, tube=12):
        turn = Matrix.Translation(at) @ AXIS[axis]
        grid = [[self.bm.verts.new(turn @ Vector(((major + minor * math.cos(b)) * math.cos(a), (major + minor * math.cos(b)) * math.sin(a), minor * math.sin(b)))) for b in (j * math.tau / tube for j in range(tube))] for a in (i * math.tau / seg for i in range(seg))]
        for i in range(seg):
            for j in range(tube):
                self.bm.faces.new((grid[i][j], grid[(i + 1) % seg][j], grid[(i + 1) % seg][(j + 1) % tube], grid[i][(j + 1) % tube]))
        self._paint([v for row in grid for v in row], mat)

    def ribs(self, z, radius, mat):
        """The folds of a joint: three soft rings stacked down the limb."""
        for k in (-1, 0, 1):
            self.ring((0, 0, z + k * 0.034), radius, 0.026, mat)

    def build(self):
        mesh = bpy.data.meshes.new(self.name)
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces)
        self.bm.to_mesh(mesh)
        self.bm.free()
        for m in self.mats:
            mesh.materials.append(m)
        o = bpy.data.objects.new(self.name, mesh)
        bpy.context.scene.collection.objects.link(o)
        o.location = self.at
        if self.parent:
            o.parent = self.parent
        if self.bevel:
            b = o.modifiers.new("round", "BEVEL")  # only the boxes have edges this sharp
            b.width, b.segments, b.limit_method, b.angle_limit = self.bevel, 5, "ANGLE", math.radians(50)
            o.modifiers.new("normals", "WEIGHTED_NORMAL")
        return o


# ---- torso ------------------------------------------------------------------
p = Part("Torso", (0, 0, 0.32), bevel=0.085)
p.box((0, 0, 0.02), (0.58, 0.38, 0.62), SUIT)  # chest
p.box((0, 0.005, -0.36), (0.48, 0.33, 0.28), SUIT)  # hips
p.ring((0, 0, -0.24), 0.235, 0.03, GREY)  # belt
p.ring((0, 0, 0.345), 0.175, 0.042, METAL)  # the collar the helmet locks into
torso = p.build()

p = Part("Pack", (0, 0.27, 0.06), torso, bevel=0.06)
p.box((0, 0, 0), (0.5, 0.22, 0.66), SUIT)
p.box((0, 0.1, 0.12), (0.3, 0.06, 0.2), GREY)
for x in (-0.15, 0.15):  # the two tanks
    p.limb(0.2, -0.22, 0.062, GREY, x=x, y=0.13)
p.build()

p = Part("Chest", (0, -0.205, 0.05), torso, bevel=0.02)
p.box((0, 0, 0), (0.3, 0.07, 0.17), GREY)
p.box((-0.07, -0.035, 0.02), (0.1, 0.02, 0.06), LAMP)  # the readout
for i, m in enumerate((LAMP, SUIT, LAPIS)):
    p.ball((0.035 + i * 0.042, -0.04, 0.03), 0.014, m, seg=16)
p.box((0.075, -0.035, -0.035), (0.1, 0.02, 0.025), METAL)
p.build()

# Two hoses from the pack round to the chest unit.
for s in (-1, 1):
    cu = bpy.data.curves.new("hose", "CURVE")
    cu.dimensions, cu.bevel_depth, cu.bevel_resolution = "3D", 0.02, 5
    sp = cu.splines.new("NURBS")
    pts = [(0.2 * s, 0.2, 0.1), (0.36 * s, 0.1, 0.02), (0.37 * s, -0.12, -0.04), (0.2 * s, -0.24, 0.0), (0.14 * s, -0.22, 0.03)]
    sp.points.add(len(pts) - 1)
    for q, c in zip(sp.points, pts):
        q.co = (*c, 1)
    sp.use_endpoint_u, sp.order_u = True, 4
    hose = bpy.data.objects.new("Hose", cu)
    bpy.context.scene.collection.objects.link(hose)
    hose.data.materials.append(GREY)
    hose.parent = torso

# ---- head -------------------------------------------------------------------
p = Part("Head", (0, 0, 0.36), torso, bevel=0)
p.ball((0, 0, 0.27), 0.31, SUIT, seg=48)
p.ball((0, -0.125, 0.265), (0.245, 0.215, 0.205), VISOR, seg=48)
p.ring((0, -0.105, 0.265), 0.218, 0.02, METAL, axis="Y")  # the visor's rim
for s in (-1, 1):  # the hinges at the ears
    p.ball((0.295 * s, 0.02, 0.26), (0.035, 0.075, 0.075), METAL, seg=24)
head = p.build()

# ---- arms and legs ----------------------------------------------------------
for s, side in ((-1, "R"), (1, "L")):
    p = Part("Arm" + side, (0.37 * s, 0, 0.2), torso)
    p.ball((0, 0, 0), 0.135, SUIT)
    p.limb(-0.04, -0.3, 0.1, SUIT)
    p.ring((0, 0, -0.15), 0.1, 0.02, LAPIS)  # the one band of colour
    arm = p.build()

    p = Part("Forearm" + side, (0, 0, -0.36), arm)
    p.ribs(0, 0.086, GREY)
    p.limb(-0.06, -0.27, 0.09, SUIT)
    p.ring((0, 0, -0.3), 0.086, 0.026, METAL)  # the cuff
    fore = p.build()

    p = Part("Hand" + side, (0, 0, -0.33), fore)
    p.ball((0, 0, -0.085), (0.078, 0.058, 0.105), GREY)
    p.ball((0, -0.062, -0.055), (0.03, 0.04, 0.045), GREY, seg=16)  # thumb
    p.build()

    p = Part("Leg" + side, (0.145 * s, 0, -0.5), torso)
    p.ball((0, 0, 0), 0.135, SUIT)
    p.limb(-0.05, -0.34, 0.122, SUIT)
    leg = p.build()

    p = Part("Shin" + side, (0, 0, -0.41), leg)
    p.ribs(0, 0.104, GREY)
    p.limb(-0.07, -0.3, 0.108, SUIT)
    p.ring((0, 0, -0.33), 0.1, 0.028, METAL)
    shin = p.build()

    p = Part("Boot" + side, (0, 0, -0.36), shin, bevel=0.045)
    p.box((0, -0.05, -0.085), (0.21, 0.33, 0.16), GREY)
    p.box((0, -0.05, -0.17), (0.225, 0.345, 0.03), LAPIS)  # the sole
    p.build()

root = bpy.data.objects.new("Astronaut", None)
bpy.context.scene.collection.objects.link(root)
torso.parent = root

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath="public/models/astronaut.glb", export_format="GLB", export_apply=True, export_yup=True)

# ---- a posed still, to check the model by eye -------------------------------
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if args:
    o = bpy.data.objects
    o["ArmL"].rotation_euler = (math.radians(20), math.radians(-150), 0)  # waving
    o["ForearmL"].rotation_euler = (0, math.radians(35), 0)
    o["ArmR"].rotation_euler = (math.radians(-15), math.radians(28), 0)
    o["ForearmR"].rotation_euler = (math.radians(-40), 0, 0)
    o["LegL"].rotation_euler = (math.radians(-18), math.radians(-8), 0)
    o["ShinL"].rotation_euler = (math.radians(30), 0, 0)
    o["LegR"].rotation_euler = (math.radians(14), math.radians(8), 0)
    o["ShinR"].rotation_euler = (math.radians(18), 0, 0)
    root.rotation_euler = (math.radians(-6), 0, math.radians(22))

    scene = bpy.context.scene
    world = bpy.data.worlds.new("space")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.003, 0.006, 0.02, 1)
    scene.world = world
    for at, size, power, color in (((2.5, -3, 3), 3, 900, (1, 0.97, 0.92)), ((-3, -1, 0.5), 3, 500, (0.25, 0.4, 1.0)), ((0.5, 3, 2), 2, 700, (0.4, 0.55, 1.0))):
        bpy.ops.object.light_add(type="AREA", location=at)
        light = bpy.context.object
        light.rotation_euler = (Vector((0, 0, 0.2)) - light.location).to_track_quat("-Z", "Y").to_euler()
        light.data.size, light.data.energy, light.data.color = size, power, color
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam.location = Vector((0.4, -5.2, 0.45))
    cam.rotation_euler = (Vector((0, 0, 0.12)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.lens = 60
    r = scene.render
    r.engine, r.resolution_x, r.resolution_y = "CYCLES", 1000, 1000
    scene.cycles.samples, scene.cycles.use_denoising = 64, True
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "OPTIX"
        prefs.refresh_devices()
        for d in prefs.devices:
            d.use = True
        scene.cycles.device = "GPU"
    except Exception:
        pass  # no GPU: the CPU renders the same picture, slower
    scene.view_settings.view_transform = "Standard"
    r.filepath = args[0]
    bpy.ops.render.render(write_still=True)
