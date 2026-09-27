# TRIEBSTARK

The personal website of **Thomalex**, live at [triebstark.com](https://triebstark.com).

## Website

- `public/index.html`: homepage, introduction, project, notes, social profiles, and copyable handles.
- `public/gaming/index.html`: dedicated WoW Classic & Forever PvP page, personalized help, and Discord contact.
- `public/assets/gaming.css`: gaming page styles and responsive character archive.
- `public/assets/wow-character.png`, `wow-warrior.png`, and `wow-rogue.png`: original owner-supplied Hunter, Warrior, and Rogue images. The archive links to the full-size originals.
- `public/notes/a-place-to-start/index.html`: the first personal note.
- `public/colophon/index.html`: site information, artwork credit, and privacy explanation.
- `public/404.html`: custom page-not-found response.
- `public/assets/site.css` and `site.js`: responsive light/dark themes, theme toggle, and menu/copy-link interactions.
- `public/assets/theme.js`: applies the saved theme before the first paint.
- `public/assets/orbit.png`: AI-enhanced gym image based on the owner-supplied photograph (1086 × 1448 pixels).
- `public/robots.txt` and `sitemap.xml`: search-engine discovery.

Dark mode is the default, regardless of device preference. The header sun/moon button switches themes on every page, including the 404 page. The choice is remembered in browser local storage (`triebstark-theme`), synchronized across open tabs, and falls back gracefully when storage is blocked. Without JavaScript, the site remains usable in dark mode.

## Local preview

No dependencies or build step are required. With Python installed, run:

```sh
python -m http.server 8080 --directory public
```

Then visit `http://localhost:8080`. Python's preview server does not emulate Nginx's custom error handling or response headers.

For production-equivalent validation with Docker installed:

```sh
docker build -t triebstark .
docker run --rm -p 8080:8080 triebstark
```

The image runs `nginx -t` while building to validate the configuration. It serves all of `public/` on port 8080.

## Hyperlift deployment

| Setting | Value |
| --- | --- |
| GitHub repository | `THMLX/TRIEBSTARK` |
| Branch | `main` |
| Dockerfile path | `Dockerfile` |
| `APPLICATION_PORT` | `8080` |
| Automatic builds | Enabled |

Pushing to `main` triggers a build and deployment. Nginx uses relative directory redirects behind Hyperlift's HTTPS proxy and returns a real 404 for missing pages.

## Editing

Edit the HTML files directly. Keep the shared header/footer consistent across pages. Add new pages inside `public/` and add their canonical URLs to the sitemap. Add only real profile links and verified personal details.

Assets cache for one hour. Increment the versioned CSS/JS URL suffix in each HTML file after changes, or give changed assets a new filename. HTML is revalidated on each request.

The website itself has no analytics, tracking cookies, account system, external fonts, or message-submission form. Social handles and profile links are supplied by the owner. Spotify, BattleTag, and Discord display copyable usernames; Spotify needs a full profile URL before a direct link can be added. Add an email or contact service only after its details are supplied and verified.
