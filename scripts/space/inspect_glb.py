"""Print what is inside a glb. Run: blender -b --python inspect_glb.py -- file.glb"""
import sys
import bpy

path = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)

for o in bpy.data.objects:
    d = o.dimensions
    info = f"{o.type:9} {o.name:40} parent={o.parent.name if o.parent else '-':20} dim=({d.x:.2f},{d.y:.2f},{d.z:.2f})"
    if o.type == "MESH":
        m = o.data
        mats = [s.material.name if s.material else "-" for s in o.material_slots]
        info += f" polys={len(m.polygons)} uv={len(m.uv_layers)} mats={mats} vgroups={len(o.vertex_groups)}"
    print("OBJ", info)

for m in bpy.data.materials:
    b = m.node_tree.nodes.get("Principled BSDF") if m.node_tree else None
    if b:
        c = b.inputs["Base Color"]
        tex = c.links[0].from_node.type if c.links else "-"
        print("MAT", m.name, [round(v, 2) for v in c.default_value], "tex=" + tex,
              "metal=%.2f rough=%.2f" % (b.inputs["Metallic"].default_value, b.inputs["Roughness"].default_value))
# Connected pieces: which are big and boxy (few polygons for their size)?
import bmesh
for o in [o for o in bpy.data.objects if o.type == "MESH"]:
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bm.transform(o.matrix_world)
    seen = set()
    names = [s.material.name.replace("EMU:emusuit21_", "") for s in o.material_slots]
    for f0 in bm.faces:
        if f0.index in seen:
            continue
        stack, faces = [f0], []
        seen.add(f0.index)
        while stack:
            f = stack.pop()
            faces.append(f)
            for e in f.edges:
                for g in e.link_faces:
                    if g.index not in seen:
                        seen.add(g.index)
                        stack.append(g)
        vs = {v for f in faces for v in f.verts}
        lo = [min(v.co[i] for v in vs) for i in range(3)]
        hi = [max(v.co[i] for v in vs) for i in range(3)]
        size = max(hi[i] - lo[i] for i in range(3))
        if size > 0.18:
            print("ISLAND %-28s polys=%6d size=%.2f x[%.2f %.2f] y[%.2f %.2f] z[%.2f %.2f]" % (
                names[f0.material_index], len(faces), size, lo[0], hi[0], lo[1], hi[1], lo[2], hi[2]))
    bm.free()

# Where each material sits: split the mesh by material and print each part's box.
for o in [o for o in bpy.data.objects if o.type == "MESH"]:
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.separate(type="MATERIAL")
    bpy.ops.object.mode_set(mode="OBJECT")
for o in bpy.data.objects:
    if o.type == "MESH" and o.data.polygons:
        xs = [o.matrix_world @ v.co for v in o.data.vertices]
        lo = [min(p[i] for p in xs) for i in range(3)]
        hi = [max(p[i] for p in xs) for i in range(3)]
        print("PART %-45s polys=%6d  x[%.2f %.2f] y[%.2f %.2f] z[%.2f %.2f]" % (
            o.material_slots[0].material.name, len(o.data.polygons), lo[0], hi[0], lo[1], hi[1], lo[2], hi[2]))
for i in bpy.data.images:
    if i.size[0]:
        i.save_render(path.rsplit(".", 1)[0] + "_" + i.name + ".png")
print("ARMATURES", len(bpy.data.armatures), "IMAGES", [(i.name, i.size[:]) for i in bpy.data.images])
