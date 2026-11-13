"""Cut the home page reel from the project recordings and the Blender orbit shot.

  python scripts/reel/cut.py

Writes:
  public/reel/loop.mp4   1280x720, silent, the card that grows on the home page
  public/reel/reel.mp4   1920x1080, with the reel track if it's there, for the full-screen player

The shot list is the one Sevith approved on 12 Nov (MEMORY.md, "Reel, approved").
The orbit shot uses the full Blender frames when they exist, else the low-res preview.
Music: blender-work/assets/audio/reel.mp3 (Pixabay, downloaded by hand). Without it the reel is silent.
"""
import glob
import os
import subprocess

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
WORK = os.path.join(ROOT, "public", "work")
OUT = os.path.join(ROOT, "public", "reel")
MUSIC = os.path.join(ROOT, "blender-work", "assets", "audio", "reel.mp3")
# Cut on the beat of the reel track: 136 BPM, first beat at 0.232s, the drop on beat 256 (113.2s).
# The reel starts one shot before the drop, so the first cut lands on it.
BEAT = 60 / 136
SHOT = 4 * BEAT  # 1.76s each
ORBIT = 14 * BEAT  # the orbit shot that closes the reel
MUSIC_START = 0.232 + 252 * BEAT

SHOTS = [
    ("esdeekid/enter", 1.5), ("polaris/terminal", 3.0), ("onlyvillas/landing", 0.0),
    ("ochi/eyes", 0.5), ("polaris/markets", 4.0), ("esdeekid/chapter", 2.0),
    ("tesseract/interview", 1.5), ("onlyvillas/nearby", 4.0), ("polaris/backtest", 6.0),
    ("ochi/hero", 5.0), ("tesseract/jobs", 0.0), ("onlyvillas/project", 5.0),
    ("esdeekid/live", 0.0),
]


def orbit_frames():
    full = sorted(glob.glob(os.path.join(ROOT, "blender-work", "renders", "s1", "f_*.png")))
    if len(full) >= 192:
        return full, 24
    preview = sorted(glob.glob(os.path.join(ROOT, "blender-work", "renders", "s1_preview", "f_*.png")))
    return preview, 6  # every 4th frame of a 24 fps shot


def cut(w, h, out, music):
    frames, rate = orbit_frames()
    keep = frames[-int(ORBIT * rate):]
    listing = os.path.join(OUT, "orbit.txt")
    with open(listing, "w") as f:
        for p in keep:
            f.write("file '%s'\nduration %.6f\n" % (os.path.abspath(p).replace("\\", "/"), 1 / rate))
        f.write("file '%s'\n" % os.path.abspath(keep[-1]).replace("\\", "/"))

    cmd = ["ffmpeg", "-v", "error", "-y"]
    fit = "scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,setsar=1,fps=30,format=yuv420p" % (w, h, w, h)
    graph = []
    for i, (clip, start) in enumerate(SHOTS):
        cmd += ["-ss", str(start), "-t", str(SHOT), "-i", os.path.join(WORK, clip + ".mp4")]
        graph.append("[%d:v]%s,trim=duration=%s,setpts=PTS-STARTPTS[v%d]" % (i, fit, SHOT, i))
    n = len(SHOTS)
    cmd += ["-f", "concat", "-safe", "0", "-i", listing]
    graph.append("[%d:v]%s,trim=duration=%s,setpts=PTS-STARTPTS[v%d]" % (n, fit, ORBIT, n))
    graph.append("".join("[v%d]" % i for i in range(n + 1)) + "concat=n=%d:v=1:a=0[out]" % (n + 1))
    total = n * SHOT + ORBIT
    maps = ["-map", "[out]"]
    if music:
        cmd += ["-ss", "%.3f" % MUSIC_START, "-i", MUSIC]
        graph.append("[%d:a]atrim=duration=%s,afade=t=out:st=%s:d=2.5[a]" % (n + 1, total, total - 2.5))
        maps += ["-map", "[a]", "-c:a", "aac", "-b:a", "192k"]
    cmd += ["-filter_complex", ";".join(graph)] + maps
    cmd += ["-c:v", "libx264", "-crf", "24" if w < 1600 else "19", "-preset", "slow", "-movflags", "+faststart", "-an" if not music else "-shortest", out]
    subprocess.run(cmd, check=True)
    os.remove(listing)
    print("wrote", os.path.relpath(out, ROOT), "%.0fs" % total, "orbit:", "full" if rate == 24 else "preview", "music:", bool(music))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    have = os.path.exists(MUSIC)
    cut(1280, 720, os.path.join(OUT, "loop.mp4"), False)
    cut(1920, 1080, os.path.join(OUT, "reel.mp4"), have)
