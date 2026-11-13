"""The Earth behind the astronaut card on the home page: one still of the reel's Earth (same
globe, sun and stars as film.py's orbit shot, without the astronaut), written as a WebP to
public/space/earth.webp. three.js draws the live NASA suit in front of it.

Run: D:/Blender/blender.exe -b --python scripts/space/web_earth.py
The camera sits where the astronaut floats, looking back past him with the limb low in the
frame, tilted a little like Lusion's card, so the curve fills the bottom third.
"""
import math
import os
import subprocess
import sys

import bpy
from mathutils import Euler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import film  # noqa: E402
import lib  # noqa: E402

PNG = os.path.join(lib.WORK, "out", "earth_plate.png")
WEBP = os.path.join(lib.ROOT, "public", "space", "earth.webp")

scene = lib.setup(preview=False, frames=1)
scene.render.resolution_x, scene.render.resolution_y = 2560, 1440
scene.render.use_motion_blur = False
scene.render.image_settings.color_depth = "8"
# Earth alone on a clear background: the page draws its own stars, so Earth can sink out
# of frame while the stars stay and fade on their own.
scene.render.film_transparent = True
scene.render.image_settings.color_mode = "RGBA"
astro, sun, suns = film.orbit_set(film.SUN_DAY)
for o in [astro, *astro.children_recursive]:
    o.hide_render = True

cam = lib.camera(lens=30, fstop=16)
cam.data.dof.use_dof = False
cam.location = (0, 0.6, 0.2)
# Looking back along -Y, level, so the limb (about 5 degrees below level) sits just under
# the middle and more of the lit surface shows than haze, rolled so the curve climbs right.
cam.rotation_euler = Euler((math.radians(90), math.radians(7), math.radians(180)), "XYZ")
scene.camera = cam
scene.render.filepath = PNG
bpy.ops.render.render(write_still=True)

os.makedirs(os.path.dirname(WEBP), exist_ok=True)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", PNG, "-c:v", "libwebp", "-pix_fmt", "yuva420p", "-quality", "82", WEBP], check=True)
print("WROTE", WEBP, os.path.getsize(WEBP) // 1024, "KB")
