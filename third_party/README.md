# 7z decoder source and replacement

The unmodified browser decoder is 7z-wasm 1.2.0, based on 7-Zip 24.09.
Its original JavaScript/WASM files remain separate in `web/vendor/7z/`.
Hashes are recorded in `web/vendor/7z/PROVENANCE.json`.

Corresponding sources provided alongside the binaries:

- [7z-wasm v1.2.0](sources/7z-wasm-1.2.0.tar.gz), upstream commit
  `10ae71a413a5589a48d11a75ed61f83d90d256db`, from
  https://github.com/use-strict/7z-wasm/tree/v1.2.0
- [7-Zip 24.09](sources/7zip-24.09.tar.xz), from
  https://github.com/ip7z/7zip/releases/tag/24.09

Extract the wrapper source and follow its README and `build` script. It contains
the Emscripten patch, Dockerfile, environment files, and compilation commands.
The Dockerfile's old 7-zip.org source URL no longer works; use the supplied
7-Zip source archive (extract into `/7z-src`) or the official GitHub release
instead. The unmodified Dockerfile records the upstream toolchain setup.

To use a rebuilt or modified decoder, replace `web/vendor/7z/7zz.umd.js` and
`web/vendor/7z/7zz.wasm`, then run `python3 tools/build_site.py`. This regenerates
the embedded worker and standalone HTML. No application signing or secret is
required. The upstream library licenses permit modification under their terms.
