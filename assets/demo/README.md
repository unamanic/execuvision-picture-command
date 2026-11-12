# Digital Rain demo

An original AI-generated, Matrix-inspired graphic, converted to exactly **300 × 200**
pixels and four colors. `MATRIX.EV` and `matrix.png` contain identical pixel indices.

- `MATRIX.EV`: a synthetic kind-2 picture with a literal raster block.
- `matrix.png`: the matching four-color indexed PNG preview.
- `matrix.json`: palette, dimensions, provenance description, and decoded-pixel hash.

CGA palette 0, high intensity, black background: `#000000`, `#55ff55`,
`#ff5555`, `#ffff55`. EV files contain pixel indices; choose the **Green / red**
preset in Picture Command to reproduce these colors. Load demo selects these
standard CGA settings automatically.
The EV has been verified in Picture Command; compatibility with the original
ExecuVision application has not been tested.

The image was generated with the built-in image-generation tool, resized to
300 × 200, quantized to four tones, then mapped to standard CGA colors in luminance order
(black, light red, light green, yellow). The encoder in `tools/encode_ev.mjs` writes
the indexed raster without relying on undocumented compressed-run behavior.

## Original generation prompt

The source was generated in green tones; the final demo is converted to CGA as
described above.

Use case: stylized-concept. Asset type: original demo artwork for a retro 2-bit graphics viewer, intended final resolution exactly 300 by 200 pixels, landscape 3:2. Create a Matrix-inspired digital-rain scene: dense vertical columns of small green computer-code glyphs on deep black, a mysterious lone black silhouette wearing a long coat centered within the falling code, an angular luminous doorway framing the silhouette. Strong readable composition at very low resolution. Flat crisp pixel-art clusters, large clear shapes, restrained dithering, hard edges. Use only four tones: black #000000, dark green #005500, green #00aa00, bright green #55ff55. Full-bleed image; no UI, no border, no titles, no Matrix logo, no watermarks. Avoid photorealism, soft glow, gradients, blur, scanlines, and fine detail that disappears at 300x200. Generate at 3:2 aspect ratio; designed for downsampling to exactly 300x200.
