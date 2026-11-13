"""Cut the rendered segments into one film and give it the look: bloom, a lapis streak, grain, vignette.

  python scripts/space/post.py              final frames  -> blender-work/out/space-film.mp4
  python scripts/space/post.py --preview    animatic      -> blender-work/out/space-film-preview.mp4

Needs ffmpeg on PATH. Every frame present in a segment's folder is used, so a step-4 animatic just plays held frames.
"""
import glob
import os
import subprocess
import sys

WORK = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "blender-work")
SEGS = ["s1", "s2", "s3a", "s3b", "s4", "s5", "s6a", "s6b"]
LENGTH = {"s1": 192, "s2": 192, "s3a": 120, "s3b": 96, "s4": 192, "s5": 192, "s6a": 108, "s6b": 108}
LAPIS = "0x2440A8"
preview = "--preview" in sys.argv

cmd = ["ffmpeg", "-v", "error", "-y"]
graph = []
for i, seg in enumerate(SEGS):
    folder = os.path.join(WORK, "renders", seg + ("_preview" if preview else ""))
    frames = sorted(glob.glob(os.path.join(folder, "f_*.png")))
    if not frames:
        sys.exit("no frames in " + folder)
    numbers = [int(os.path.basename(f)[2:6]) for f in frames] + [LENGTH[seg] + 1]
    listing = os.path.join(folder, "frames.txt")
    with open(listing, "w") as fh:  # each frame holds until the next one that exists
        for f, a, b in zip(frames, numbers, numbers[1:]):
            fh.write("file '%s'\nduration %.6f\n" % (f.replace("\\", "/"), (b - a) / 24))
        fh.write("file '%s'\n" % frames[-1].replace("\\", "/"))
    cmd += ["-f", "concat", "-safe", "0", "-i", listing]
    graph.append("[%d:v]fps=24,scale=1920:1080:flags=lanczos,format=gbrp,trim=duration=%.4f,setpts=PTS-STARTPTS[v%d]"
                 % (i, LENGTH[seg] / 24, i))

graph += [
    # scene 3: through the cloud. scene 6: the lamp becomes the sun.
    "[v2][v3]xfade=transition=fadewhite:duration=1:offset=4[s3]",
    "[v6][v7]xfade=transition=fade:duration=1:offset=3.5[s6]",
    # scene 4 ends in the window's light and bleeds to lapis, scene 5 resolves out of it
    "[v4]fade=t=out:st=6.7:d=1.3:color=%s[s4]" % LAPIS,
    "[v5]fade=t=in:st=0:d=1.5:color=%s[s5]" % LAPIS,
    "[v0][v1][s3][s4][s5][s6]concat=n=6:v=1:a=0,split=3[base][hi1][hi2]",
    # bloom: only the highlights, blurred and screened back
    "[hi1]curves=all='0/0 0.72/0 1/1',gblur=sigma=22[bloom]",
    # the anamorphic streak: highlights smeared sideways, tinted lapis
    "[hi2]curves=all='0/0 0.8/0 1/1',gblur=sigma=110:sigmaV=1.2,colorchannelmixer=rr=0.55:gg=0.7:bb=1.0[streak]",
    "[base][bloom]blend=all_mode=screen:all_opacity=0.55[b1]",
    "[b1][streak]blend=all_mode=screen:all_opacity=0.5,"
    "rgbashift=rh=-2:bh=2:edge=smear,vignette=angle=PI/5.5,noise=alls=6:allf=t+u,format=yuv420p[out]",
]

out_dir = os.path.join(WORK, "out")
os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, "space-film-preview.mp4" if preview else "space-film.mp4")
cmd += ["-filter_complex", ";".join(graph), "-map", "[out]", "-r", "24", "-c:v", "libx264",
        "-crf", "20" if preview else "15", "-preset", "medium" if preview else "slow",
        "-movflags", "+faststart", out]
subprocess.run(cmd, check=True)
print("wrote", os.path.normpath(out))
