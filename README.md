# ExecuVision Picture Command

Open ExecuVision graphics, browse collections, choose colors, and export PNGs—all in your browser.

**[Open the app](https://unamanic.github.io/execuvision-picture-command/)**

![ExecuVision Picture Command showing a graphics collection](assets/screenshot.png)

## Features

- Open `.EV` files, disk ZIPs, and original `.7z` archives with contained disk ZIPs.
- Search, filter, sort, and mark favorites in a collection.
- Browse with keyboard shortcuts and inspect graphics with zoom and focus view.
- Choose CGA palettes or grayscale and export native-resolution PNGs.
- Save source details and palette values as JSON.

Files are processed on your device. No uploads, account, analytics, or network processing.
Source files stay unchanged; collections and favorites last for the current session.
An original AI-generated demo is included. No historical sample archives or disk images are included. The screenshot illustrates the interface.

## Try the demo

Choose **Load demo** in the app to open a Matrix-inspired digital-rain graphic at
300 × 200 pixels. It uses CGA palette 0 (high intensity, black background) and is embedded in the offline build.

[Download the .EV demo](https://unamanic.github.io/execuvision-picture-command/demo/MATRIX.EV)
· [PNG preview](assets/demo/matrix.png)

The EV file stores pixel indices; choose the **Green / red** palette preset after
importing it manually to reproduce the demo colors.

## Use locally

Download the self-contained [offline HTML](https://unamanic.github.io/execuvision-picture-command/ExecuVision-Picture-Desk.html)
and open it in a current browser. For controls, supported formats, and limits, see [the usage guide](web/README.md).

## Development

Requires Node.js 22+. There are no package dependencies to install.

```sh
npm test        # Builds the site and runs all tests
npm run preview # Serves dist/ at http://127.0.0.1:8000
```

Use `npm run build` to build without running tests. The build embeds the scripts, styles, and 7z decoder
in `dist/index.html` and creates the downloadable single-file version.
Tests use generated fixtures; private graphics libraries are not required.

GitHub Actions tests and builds pull requests. Pushes to `main` also deploy the
`dist/` artifact to GitHub Pages. Enable **GitHub Actions** as the Pages source
when using this workflow in a fork.

## Software reference

[VCN ExecuVision 1.0 on WinWorld](https://winworldpc.com/product/vcn-execuvision/10)
provides information about the original software and its graphics libraries.

## Inspiration

This project was inspired by [Why Clip Art Was Everywhere... Until It Wasn't](https://www.youtube.com/watch?v=XfLlpxE6AYM)
by Linus Boman.

## Acknowledgments

Thanks to OpenAI Codex for collaborating on the design, implementation, testing,
and documentation of this project.

## License

The original project code is licensed under the [MIT License](LICENSE),
Copyright © 2026 William Witt. Bundled third-party software and the historical
artwork shown in the screenshot retain their own licenses and rights.

## Third-party software

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the decoder acknowledgments
and licenses. The bundled 7z decoder's corresponding source archives and rebuild
instructions are included in [third_party/](third_party/README.md).
