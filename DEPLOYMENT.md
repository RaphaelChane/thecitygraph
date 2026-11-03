# Deployment

The site is fully static: no build step, no server to maintain.
It is published with GitHub Pages.

## Publish

1. Push the `main` branch to the GitHub repository.
2. **Settings → Pages → Source**: `Deploy from a branch`.
3. Branch `main`, folder `/ (root)`, then **Save**.

The site goes live at `https://<account>.github.io/<repo>/` after a minute or
two. Every `git push` to `main` republishes it automatically.

## Custom domain (optional)

Only do this once the domain is registered and its DNS is available: without
that, GitHub redirects the site to an address that does not exist (404).

1. At your registrar, point the domain to GitHub Pages (the `A` and `AAAA`
   records listed in the GitHub documentation).
2. **Settings → Pages → Custom domain**: enter the domain.
3. Wait for DNS propagation, then tick **Enforce HTTPS**.

GitHub then creates a `CNAME` file at the repository root: it must be committed
for the setting to persist.

## Updates

```bash
git add .
git commit -m "Update"
git push
```

## Checks

- home page reachable;
- styles, images and videos loading correctly;
- HTTPS active if a custom domain is configured;
- `robots.txt` and `sitemap.xml` reachable.
