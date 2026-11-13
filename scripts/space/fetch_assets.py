"""Download every model and texture the space film and the studio use into blender-work/assets.

  python scripts/space/fetch_assets.py

Sources and licences:
  NASA 3D Resources (github.com/nasa/NASA-3D-Resources): the EMU suit. NASA media, no logo use implied.
  Solar System Scope (solarsystemscope.com/textures): Earth and stars. CC BY 4.0, credit them.
  Poly Haven (polyhaven.com): furniture and surfaces. CC0.
"""
import json
import os
import urllib.request

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "blender-work", "assets")
UA = {"User-Agent": "asset-fetch/1.0"}

NASA = "https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/"
SSS = "https://www.solarsystemscope.com/textures/download/8k_"
MODELS = ["modern_arm_chair_01", "desk_lamp_arm_01", "potted_plant_04"]
TEXTURES = ["herringbone_parquet", "american_walnut_veneer", "painted_plaster_wall", "wool_boucle"]
MAPS = {"Diffuse": "diff", "nor_gl": "nor", "Rough": "rough"}


def get(url, path):
    if os.path.exists(path) and os.path.getsize(path) > 0:
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    print("get", os.path.relpath(path, ASSETS))
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300) as r, open(path, "wb") as f:
        f.write(r.read())


def api(asset):
    with urllib.request.urlopen(urllib.request.Request("https://api.polyhaven.com/files/" + asset, headers=UA), timeout=60) as r:
        return json.load(r)


get(NASA + "Extravehicular%20Mobility%20Unit/Extravehicular%20Mobility%20Unit.glb", os.path.join(ASSETS, "nasa", "emu.glb"))
for name in ("earth_daymap", "earth_nightmap", "earth_clouds", "stars"):
    get(SSS + name + ".jpg", os.path.join(ASSETS, "earth", name.replace("earth_", "") + ".jpg"))

for m in MODELS:
    entry = api(m)["gltf"]["2k"]["gltf"]
    base = os.path.join(ASSETS, "polyhaven", m)
    get(entry["url"], os.path.join(base, m + ".gltf"))
    for rel, inc in entry["include"].items():
        get(inc["url"], os.path.join(base, *rel.split("/")))

for t in TEXTURES:
    files = api(t)
    for key, short in MAPS.items():
        get(files[key]["2k"]["jpg"]["url"], os.path.join(ASSETS, "polyhaven", t, short + ".jpg"))
print("done")
