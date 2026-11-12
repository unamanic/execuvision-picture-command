# ExecuVision Picture Command

Open `index.html` to view ExecuVision graphics, choose their colors, and save PNGs.
Files stay on your device. No account, server, or internet connection is needed.

The single-file version is `dist/ExecuVision-Picture-Desk.html`. If you use the
modular version, keep the files in `web/` together.

## Open graphics

Choose or drop `.EV` files, `.ZIP` files, or `.7z` archives. Archives containing
disk ZIPs open directly. Include matching `EVSLIDE.TOC` or `EVPIX.TOC` files to
show graphic names. For loose files, open one disk's files at a time so names
can be matched correctly.

Opening another batch replaces the collection and its favorites. Clear collection
releases the loaded files. Your source files are never changed.

## Browse and view

- Search by graphic name, filename, or disk. Multiple search words can match
  different parts of the name or source path.
- Use **Filter & sort** to choose a graphic type, source disk, or sort order.
- Mark favorites to create a temporary shortlist, then select **Favorites only**.
- Previous/next follow the filtered order. Filtering can hide the selected
  graphic from the list while leaving it in the preview.
- Use **Fit** to fit the graphic to the preview, or 1×, 2×, or 3× to inspect pixels.
  Scroll the preview when the graphic is larger than the available space.
- Change the preview background or use **Focus on graphic** for more room.

Keyboard shortcuts: `/` focuses search, left/right arrows browse results,
Escape clears the search, and Tab moves between controls.

## Choose colors and export

Choose CGA colors or grayscale. In CGA mode, select a background color,
foreground colors, and intensity. **Palette presets & color values** offers
ready-made palettes, a reset button, and exact hexadecimal color values.
The selected palette may differ from the original colors.

**Save PNG** exports the selected graphic at its original pixel dimensions,
using the selected palette. Zoom, preview background, and 4:3 preview proportions
do not change the export. The proposed filename appears below the controls.
Your browser's download settings determine where files are saved.

**Save details (JSON)** exports the title, filename, source, dimensions, and
selected palette. Import warnings can also be saved as a text report.

## Supported archives and limits

ZIP supports stored and DEFLATE compression, plus one nested ZIP level.
7z supports EV/TOC files and contained disk ZIPs. Encrypted archives, links,
RAR files, and archives containing only disk images are unsupported.

Limits are 500 input files and 64 MiB per batch, 1 MiB per EV/TOC file, and
320 × 200 pixels per graphic. 7z extraction also limits the declared expanded
archive to 64 MiB and 2,000 entries, and stops after 45 seconds. Use **Cancel
import** to stop an extraction. For unsupported archives, extract the EV/TOC
files separately and open those instead.

A browser with WebAssembly and Web Workers is required for 7z. ZIP DEFLATE
requires native DecompressionStream support. All decoding happens in memory;
no archive contents are uploaded or written to disk during import.

## Licenses

The original application code is licensed under the MIT License,
Copyright © 2026 William Witt. See `LICENSE` in the repository or distribution.
Bundled dependencies retain the licenses listed below.

The graphics decoder incorporates format information corroborated with
pcmill/vcn-execuvision-slide-format-converter, MIT © 2026 Pieter van Mill.
See the MIT notice in the app or `pcmill-MIT.txt` in the distribution.

The bundled 7z decoder is 7z-wasm 1.2.0 / 7-Zip 24.09, licensed under LGPL 2.1
or later plus the unRAR restriction. See `7z-License.txt` and
`unRarLicense.txt`. Source and build instructions:
https://github.com/use-strict/7z-wasm
