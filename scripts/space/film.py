"""The space film: orbit, night fall, descent, the one lit window, the room, back to orbit.

Eight segments. Each is a function that builds its set and keys its moves, and returns its length in frames.
Scenes 3 and 6 are two segments each, joined by a crossfade in post (scripts/space/post.sh).

  blender -b --python scripts/space/film.py -- --scene s1 --frame 96 --preview   one quick still
  blender -b --python scripts/space/film.py -- --scene s1                        the whole segment, final quality
  blender -b --python scripts/space/film.py -- --scene s1 --start 120            resume a stopped render

Frames land in blender-work/renders/<scene>/ (or <scene>_preview/).
"""
import argparse
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402

import lib  # noqa: E402
import studio  # noqa: E402
from lib import key, key_prop  # noqa: E402

R = 6371.0
ALT = 1800.0
EARTH_DIR = Vector((0, -0.55, -0.83)).normalized()  # below and behind him
SUN_DAY = (0.80, 0.45, 0.40)   # camera-right and a little in front: a side key with a visor glint
SUN_NIGHT = (0.25, -0.85, -0.45)  # behind the planet
SPIN = Vector((-9, 5, 15)) / 192  # his slow drift, degrees a frame, shared so cuts stay smooth

# poses shared across cuts
S1_CAM0, S1_AIM0, S1_ROT0 = (0.35, 3.1, 0.5), (0, 0, 0.45), Vector((-4, 0, -8))
S1_CAM1, S1_AIM1 = (0.0, 3.3, 2.1), (0, 0, 0.2)
FALL = 24.0  # how far he has dropped by the end of scene 2
WINDOW = (39.0, 173.0, 95.0)
ROOM_ASTRO, ROOM_ROT, ROOM_CAM = (-0.55, 0.45, 1.32), (4, 0, -150), (1.9, -1.5, 1.35)


def orbit_set(sun_dir):
    """Astronaut at the origin facing +Y, Earth below and behind, stars, one sun, lapis fill."""
    astro = lib.load_astronaut()
    lib.stars()
    globe, suns = lib.earth(sun_dir, R, toward=-EARTH_DIR)
    globe.location = EARTH_DIR * (R + ALT)
    sun = lib.sun_towards(sun_dir, 3.2)
    fill = lib.light("Fill", "AREA", 140, (0.2, 0.36, 1.0), loc=(-4, 2.5, 1.0), size=4)
    lib.look_at(fill, astro)
    moon = lib.light("Moon", "SUN", 0.3, (0.22, 0.38, 1.0), size=3.0)  # so he still reads on the night side
    moon.rotation_euler = Vector((-0.7, 0.5, 0.6)).to_track_quat("Z", "Y").to_euler()
    return astro, sun, suns


def aimed_camera(target, lens=40, fstop=8):
    aim = lib.empty("Aim")
    cam = lib.camera(lens=lens, fstop=fstop, focus=target)
    lib.look_at(cam, aim)
    return cam, aim


def follow_light(cam, astro, energy):
    """A lapis light that rides with the camera, so he still reads once he is far from the set's fill."""
    fl = lib.light("Follow", "AREA", energy, (0.2, 0.36, 1.0), size=3)
    fl.parent = cam
    fl.location = (-2.5, 1.5, 0.5)  # camera-left and above, in the camera's own space
    lib.look_at(fl, astro)
    return fl.data


def sweep_sun(sun, suns, a, b, f0, f1):
    """Turn the sun from a to b, keeping the lamp and the Earth shader's day side in step."""
    a, b = Vector(a).normalized(), Vector(b).normalized()
    sun.rotation_mode = "QUATERNION"
    prev = None
    for f in range(f0, f1 + 1, 6):
        d = a.slerp(b, (f - f0) / (f1 - f0))
        q = d.to_track_quat("Z", "Y")
        if prev and q.dot(prev) < 0:
            q.negate()
        prev = q
        sun.rotation_quaternion = q
        sun.keyframe_insert("rotation_quaternion", frame=f)
        for n in suns.values():
            n.inputs[1].default_value = d
            n.inputs[1].keyframe_insert("default_value", frame=f)


def s1():
    """Orbit. Sun in the visor, Earth rises behind him."""
    astro, sun, suns = orbit_set(SUN_DAY)
    cam, aim = aimed_camera(astro)
    key(astro, 1, rot=S1_ROT0, linear=True)
    key(astro, 192, rot=S1_ROT0 + SPIN * 191, linear=True)
    key(aim, 1, loc=S1_AIM0)
    key(aim, 192, loc=S1_AIM1)
    key(cam, 1, loc=S1_CAM0)
    key(cam, 192, loc=S1_CAM1)
    return 192


def s2():
    """Night falls. He tips back and drops toward the planet while the day-night line sweeps over it."""
    astro, sun, suns = orbit_set(SUN_DAY)
    cam, aim = aimed_camera(astro)
    rot0 = S1_ROT0 + SPIN * 192
    key(astro, 1, rot=rot0, loc=(0, 0, 0))
    key(astro, 40, loc=(0, 0, 0))
    key(astro, 192, rot=rot0 + Vector((-150, 20, 40)), loc=EARTH_DIR * FALL)
    aim.parent = astro
    key(aim, 1, loc=S1_AIM1)
    key(aim, 192, loc=(0, 0, 0))
    key(cam, 1, loc=S1_CAM1)
    key(cam, 192, loc=(0, 2.6, 3.0))
    sweep_sun(sun, suns, SUN_DAY, SUN_NIGHT, 30, 150)
    fl = follow_light(cam, astro, 0.0)
    key_prop(fl, "energy", 40, 0.0)
    key_prop(fl, "energy", 192, 4000.0)
    return 192


def s3a():
    """The fall, part one. Down toward the night side, stars streaking past as dust."""
    astro, sun, suns = orbit_set(SUN_NIGHT)
    cam, aim = aimed_camera(astro)
    aim.parent = astro
    rot0 = S1_ROT0 + SPIN * 192 + Vector((-150, 20, 40))
    drop = 560.0
    key(astro, 1, rot=rot0, loc=EARTH_DIR * FALL, linear=True)
    key(astro, 120, rot=rot0 + Vector((-200, 60, 90)), linear=True)
    key(astro, 1, loc=EARTH_DIR * FALL)
    key(astro, 120, loc=EARTH_DIR * (FALL + drop))
    rig = lib.empty("Rig")  # falls with him, so the camera can close the gap early and then hold it
    key(rig, 1, loc=EARTH_DIR * FALL)
    key(rig, 120, loc=EARTH_DIR * (FALL + drop))
    cam.parent = rig
    key(cam, 1, loc=Vector((0, 2.6, 3.0)) - EARTH_DIR * FALL)
    key(cam, 50, loc=EARTH_DIR * -11 + Vector((0, 0.8, 1.5)))
    fl = follow_light(cam, astro, 4000.0)
    key_prop(fl, "energy", 1, 4000.0)
    key_prop(fl, "energy", 50, 900.0)  # the camera closes in, so less is needed
    rnd = random.Random(4)
    side, up = Vector((1, 0, 0)), EARTH_DIR.cross(Vector((1, 0, 0)))
    pts = []
    for _ in range(2600):
        a, r = rnd.uniform(0, math.tau), rnd.uniform(1.5, 26)
        pts.append(EARTH_DIR * rnd.uniform(20, FALL + drop + 60) + side * math.cos(a) * r + up * math.sin(a) * r)
    lib.specks("FallDust", pts)
    return 120


def city_set(cloud=True):
    astro = lib.load_astronaut()
    lib.stars(0.6)
    glow = lib.city(WINDOW, cloud_z=300.0 if cloud else None)
    bpy.context.scene.view_settings.exposure = 0.3
    cd = bpy.data.cameras.new("Cam")
    cd.lens = 32
    cd.clip_start, cd.clip_end = 0.1, 20000
    cd.dof.use_dof = True
    cd.dof.focus_object = astro
    cd.dof.aperture_fstop = 5.6
    cd.dof.aperture_ratio = 1.5
    cam = lib.link(bpy.data.objects.new("Cam", cd))
    bpy.context.scene.camera = cam
    return astro, cam, glow


S3B_CAM1 = (0.0, 0.0, 430.0)


def s3b():
    """The fall, part two. Out of the cloud, straight down onto a glowing street grid."""
    astro, cam, _ = city_set()
    key(cam, 1, loc=(-30, -20, 640), rot=(0, 0, -6), linear=True)
    key(cam, 96, loc=S3B_CAM1, rot=(0, 0, 12), linear=True)
    key(astro, 1, loc=(-29, -18, 626), rot=(40, 10, 0), linear=True)
    key(astro, 96, loc=(2, 3, 416), rot=(160, 70, 90), linear=True)
    return 96


def s4():
    """The one lit window. A swoop from straight down to level with it, then into its light."""
    astro, cam, glow = city_set()
    wx, wy, wz = WINDOW
    key(cam, 1, loc=S3B_CAM1, rot=(0, 0, 12))
    key(cam, 120, loc=(wx, wy - 62, wz + 22), rot=(72, 0, 0))
    key(cam, 192, loc=(wx, wy - 1.3, wz), rot=(90, 0, 0))
    key(astro, 1, loc=(2, 3, 416), rot=(160, 70, 90))
    key(astro, 120, loc=(wx + 1.5, wy - 44, wz + 13), rot=(290, 40, 220))
    key(astro, 178, loc=(wx, wy - 0.4, wz), rot=(360, 0, 360))  # upright, facing the light
    key_prop(glow, "default_value", 120, 20.0)
    key_prop(glow, "default_value", 192, 160.0)  # the window blooms as we reach it
    return 192


def room_set():
    st = studio.build()
    bpy.context.scene.view_settings.exposure = studio.EXPOSURE
    bpy.context.scene.cycles.max_bounces = 8
    astro = lib.load_astronaut()
    astro.scale = (0.92,) * 3
    cam, aim = aimed_camera(astro, lens=24, fstop=3.2)
    follow_light(cam, astro, 70.0)  # the lamp is behind him, without this his front is a black shape
    st["rest"] = [(o, o.location.copy(), o.rotation_euler.copy()) for o in st["loose"]]
    return st, astro, cam, aim


def lift(st, frame, k, linear=False):
    """Loose desk things, k = 0 at rest, 1 afloat."""
    bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR" if linear else "BEZIER"
    for i, (o, loc, rot) in enumerate(st["rest"]):
        o.location = loc + Vector((0.05 * (i - 2), -0.06 * (i % 3), 0.2 + 0.07 * i)) * k
        o.rotation_euler = (rot.x + 0.5 * k * (i % 2 - 0.5), rot.y + 0.35 * k, rot.z + 0.6 * k * (1 - i % 3))
        o.keyframe_insert("location", frame=frame)
        o.keyframe_insert("rotation_euler", frame=frame)


def s5():
    """The room. He drifts in weightless, the mug and papers lift off the desk, he steadies by the desk."""
    st, astro, cam, aim = room_set()
    key(astro, 1, loc=(-1.25, -1.2, 1.5), rot=(26, -16, -205))  # never far enough round to show the cut-down pack
    key(astro, 150, loc=ROOM_ASTRO)
    key(astro, 192, loc=ROOM_ASTRO, rot=ROOM_ROT)
    key(aim, 1, loc=(0.2, 1.5, 1.0))
    key(aim, 130, loc=(-0.4, 0.5, 1.3))
    key(aim, 192, loc=(-0.5, 0.45, 1.4))
    key(cam, 1, loc=(1.15, -1.95, 1.75))
    key(cam, 192, loc=ROOM_CAM)
    lift(st, 55, 0.0)
    lift(st, 192, 1.0)
    return 192


def s6a():
    """Back to orbit, part one. Everything but the lamp goes dark and we drift into its light."""
    st, astro, cam, aim = room_set()
    astro.location, astro.rotation_euler = ROOM_ASTRO, [math.radians(a) for a in ROOM_ROT]
    lamp = st["lamp_pos"]
    key(aim, 1, loc=(-0.5, 0.45, 1.4))
    key(aim, 108, loc=lamp)
    key(cam, 1, loc=ROOM_CAM)
    key(cam, 108, loc=lamp + Vector((-0.12, -0.5, -0.22)))
    lift(st, 1, 1.0, linear=True)
    lift(st, 108, 1.5, linear=True)
    key_prop(st["moon"].data, "energy", 1, st["moon"].data.energy)
    key_prop(st["moon"].data, "energy", 70, 0.0)
    for socket in (st["screen"], lib.bsdf(bpy.data.materials["CubeStrip"]).inputs["Emission Strength"]):
        key_prop(socket, "default_value", 1, socket.default_value)
        key_prop(socket, "default_value", 70, 0.0)
    return 108


def s6b():
    """Back to orbit, part two. The lamp is the sun in his visor. Ends on scene 1's first frame."""
    astro, sun, suns = orbit_set(SUN_DAY)
    cam, aim = aimed_camera(astro)
    key(astro, 1, rot=S1_ROT0 - SPIN * 107, linear=True)
    key(astro, 108, rot=S1_ROT0, linear=True)
    key(aim, 1, loc=(0.02, 0.0, 0.68))
    key(aim, 108, loc=S1_AIM0)
    key(cam, 1, loc=(0.14, 1.0, 0.74))
    key(cam, 108, loc=S1_CAM0)
    return 108


SCENES = {f.__name__: f for f in (s1, s2, s3a, s3b, s4, s5, s6a, s6b)}

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--scene", required=True, choices=list(SCENES))
    p.add_argument("--frame", type=int)
    p.add_argument("--preview", action="store_true")
    p.add_argument("--step", type=int, default=1)
    p.add_argument("--start", type=int, default=1)  # resume a stopped render from here
    p.add_argument("--end", type=int)
    a = p.parse_args(sys.argv[sys.argv.index("--") + 1:])
    scene = lib.setup(preview=a.preview)
    length = SCENES[a.scene]()
    scene.frame_start, scene.frame_end = a.start, a.end or length
    scene.render.use_overwrite = a.preview  # a final render skips frames already on disk, so rerunning resumes it
    out = os.path.join(lib.WORK, "renders", a.scene + ("_preview" if a.preview else ""))
    lib.render(scene, out, frame=a.frame, step=a.step)
