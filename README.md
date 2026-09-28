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

## Languages

The compact EN/NO button beside the theme control switches every page between English (the default) and Norwegian Bokmål. The visitor's choice is stored locally under `triebstark-language` (`en` or `nb`) and follows navigation, refreshes, and other open tabs. It is not sent to a translation service. Without JavaScript, the original English HTML remains usable.

`public/assets/language.js` contains the Bokmål dictionary and shared language runtime. Dictionary keys match original English text with surrounding whitespace removed and internal whitespace collapsed. When adding or changing site copy, update the dictionary too, including titles, descriptions and accessibility labels. The runtime preserves markup and restores the original English text when switching back. Game class names, usernames and names of products remain unchanged.

Dynamic controls use `window.siteI18n.t(template, variables)` and rerender on `site:languagechange`; localized regions are marked `data-i18n-dynamic` so the static translator leaves them alone. `training.js` formats Hevy dates and numbers for `en-GB` or `nb-NO`, while workout titles and exercise names stay exactly as logged. Keep these rules when adding new dynamic content.

The website itself has no analytics, tracking cookies, account system, external fonts, or message-submission form. Social handles and profile links are supplied by the owner. Spotify, BattleTag, and Discord display copyable usernames; Spotify needs a full profile URL before a direct link can be added. Add an email or contact service only after its details are supplied and verified.

## Training page

- `public/training/index.html`: Strength & Bodybuilding page, licensed archival photo, verified public Hevy session, profile links, and prepared referral button.
- `public/assets/training.css` and `training.js`: page styling and referral-button activation.
- `public/data/training-config.json`: set `hevyReferralUrl` to the exact HTTPS referral URL supplied by the owner. This is the only value needed to activate the button and disclosure. Until then it stays visibly disabled and labelled coming soon. Never substitute the ordinary profile URL. Config is fetched without caching. Never put API credentials in this file.
- `public/assets/arnold-training-1975.jpg`: 1280 x 855 Wikimedia thumbnail of Harry Chase / Los Angeles Times, UCLA Library's 1975 Pumping Iron photo, CC BY 4.0. Source and license are credited on the page and in the colophon. Resized by Wikimedia; no other edits.

The featured workout is an explicitly dated snapshot of the public session at https://hevy.com/workout/0F5MTHOtRm4, verified 2026-09-28. It is not an automatic feed. It shows Push 1, 2026-09-05, 55 minutes, 7,310 kg logged volume, six exercises; the bench count includes two warm-ups. Profile links always lead to the current activity at https://hevy.com/user/thomalex.

Automatic workout and measurement synchronization is implemented in scripts/sync_hevy.py and .github/workflows/sync-hevy.yml, with data served from public/data/hevy-feed.json. It checks every 30 minutes once the HEVY_API_KEY repository secret is added. Until connected, the dated public session remains as the fallback. See HEVY-SETUP.md for the exact connection steps, publication scope, referral configuration, and API photo limitation. The API key is never served to visitors.
