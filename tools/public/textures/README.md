# Textures for Cabin 3D

Place small (<= 1K) CC0 textures here. Suggested sources: https://ambientcg.com

Folders and expected filenames:

- textures/corrugate/normal.png
- textures/longrun/normal.png (can alias corrugate)
- textures/fiveRib/normal.png (can alias corrugate)
- textures/tray/normal.png (can alias corrugate)
- textures/weatherboard/albedo.jpg
- textures/weatherboard/normal.jpg
- textures/ply/albedo.jpg
- textures/ply/normal.jpg
- textures/membrane/albedo.jpg
- textures/pir/albedo.jpg

Notes
- All URLs are resolved using Vite’s BASE_URL automatically in code; just keep the folder under tools/public.
- Prefer seamless, tileable images. Keep normal maps in linear color space.
- If multiple materials share the same source file initially, copy to the expected filename (simplifies code).

Licensing
- Include the source URL and license for each file here.
- AmbientCG assets are typically licensed under CC0 1.0.

