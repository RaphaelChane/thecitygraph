# TCG — Portfolio site

One-page website for a video and photography studio.
Plain HTML, CSS and JavaScript — no build step, no dependencies to install:
everything ships precompiled in `assets/`.

## Local preview

```bash
python3 -m http.server 8888
```

Then open <http://localhost:8888>.

> A local server is preferable to double-clicking `index.html`: some browsers
> block local file access (video, fonts).

## Structure

```
index.html        Full page
assets/           Styles, scripts, fonts, images, videos
```

## Customisation

| What | Where |
| --- | --- |
| Text, headings, contact | `index.html` |
| Colours, typography, spacing | `assets/css/style.css` (`:root` variables) |
| Images and videos | `assets/img/`, `assets/video/` |

Images are served in several sizes (`srcset`): keep the file names or the
responsive layout will break.

## Deployment

Static site hosted on GitHub Pages. See `DEPLOYMENT.md`.

## Browser support

Recent versions of Chrome, Edge, Firefox and Safari, desktop and mobile.
