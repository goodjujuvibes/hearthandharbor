# Hearth &amp; Harbor

A single-page recruitment site for **Hearth &amp; Harbor**, a small old-school
[Monsters &amp; Memories](https://www.monstersandmemories.com/) MMO guild.

> A place to return to. People to set out with.
> At first light, we set out. By firelight, we return.

Built as a plain static site — no build step, no dependencies. Just HTML, CSS,
and a small vanilla-JS file.

## Files

| File | Purpose |
|---|---|
| `index.html` | The full one-page site (hero → footer) plus all five modal overlays. |
| `styles.css` | All styling, driven by design tokens (CSS custom properties in `:root`). |
| `app.js` | Overlay open/close, single-open FAQ accordion, and Discord CTA wiring. |
| `.github/workflows/deploy.yml` | GitHub Pages deployment (publishes on push to `main`). |

## Running locally

It's static, so any file server works:

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly in a browser also works.

## Deploying to GitHub Pages

1. Push to the `main` branch.
2. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. The included workflow publishes the site automatically.

Because the site lives at the repo root and uses only relative paths, it works
whether Pages serves from a project subpath (`user.github.io/repo/`) or a custom
domain — no base-path configuration needed.

## Design

Recreated from the Claude Design handoff. Colors, typography, spacing, copy, and
interactions follow that spec. Fonts (Almendra SC, Vollkorn, Cardo, EB Garamond)
load from Google Fonts. All glyphs (hearth arch, flame, lighthouse) are inline
SVG; the starfields and ember glows are pure CSS radial gradients — there are no
raster image assets.

Copy note: there are **no em dashes** anywhere in the on-page copy, by choice.
Keep it that way when editing.
