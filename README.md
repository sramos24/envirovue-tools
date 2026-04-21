# Envirovue Tools

Progressive Web App (PWA) suite for Insight Environmental Building Consultants LLC.

## Tools
- **Home Inspector** — Field data capture across 8 inspection sections
- **Photo Documentation** — Photo captioning, auto-linking to field notes, PDF export

## Deploy
This is a static site ready for GitHub Pages. Upload the entire folder contents
to a repo, enable Pages on the main branch, and your site will be live at
`https://YOUR-USERNAME.github.io/REPO-NAME/`.

## Install on iPhone
1. Open the site in Safari
2. Tap Share → Add to Home Screen
3. Tap Add — the tools now work offline

## Updating
Edit any file, commit to the repo, and GitHub Pages redeploys in ~30 seconds.
To force users to get the latest version, bump `CACHE_VERSION` in `sw.js`.

## File Structure
```
envirovue-tools/
├── index.html           ← Launcher / landing page
├── manifest.json        ← PWA manifest for launcher
├── sw.js                ← Service worker (caches everything for offline)
├── icons/               ← App icons (180, 192, 512 px)
├── home-inspector/
│   ├── index.html
│   └── manifest.json
└── photo-tool/
    ├── index.html
    └── manifest.json
```
