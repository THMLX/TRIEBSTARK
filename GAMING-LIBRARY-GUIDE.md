# WoW PvP library data guide

The class pages read their lists from `public/data/wow-pvp-library.json`. Keep gear, consumables, and macro lists there so the four class pages stay consistent.

## Best-in-slot plans

Each class and game version has two independent plans: `openWorld` and `battleground`. For each plan:

- `plannerUrl`: the exact share URL for the completed interactive gear set (Wowhead Classic for `classic`; Sixty Upgrades Forever for `forever`). It can be embedded on the class page and always has a separate open-in-new-tab link.
- `modelUrl`: an exact share URL for a Wowhead 3D model / Dressing Room view. It is displayed in the page's 3D preview panel.
- `items`: a map from equipment slot key to `{ "name": "...", "wowheadUrl": "https://www.wowhead.com/..." }`.

For example:

```json
"items": {
  "head": {
    "name": "Item name",
    "wowheadUrl": "https://www.wowhead.com/..."
  }
}
```

Every visible item link must use its exact HTTPS Wowhead item page. The page deliberately does not guess URLs or show a gear item as complete until that URL is present. This keeps every item in the first-party gear list clickable directly to its own database record.

Equipment slot keys are: `head`, `neck`, `shoulders`, `back`, `chest`, `shirt`, `tabard`, `wrists`, `hands`, `waist`, `legs`, `feet`, `finger1`, `finger2`, `trinket1`, `trinket2`, `mainHand`, `offHand`, and `ranged`.

## Situational gear and consumables

Under each class/version, `situationalGear` is an array for every equipment slot. Add entries with `name`, `wowheadUrl`, and optional `notes` or `matchups`. `consumables` is an array of `{ "name", "wowheadUrl", "category", "notes" }` objects. Give every item an exact Wowhead URL so the same direct-link behavior applies.

## Macros

Put each macro in one of four arrays:

- `macros.pvp`
- `macros.class` for general class macros
- `macros.qualityOfLife`
- `macros.niche`

Each entry has a `title`, `code`, and optional `notes`. The site shows a filter bar, a titled dark rounded card, the macro text, and a clipboard button.

The schema currently has empty lists for Hunter, Warrior, Rogue, and Druid in both Classic and Forever. Add only your actual gear and macro choices; the current pages intentionally contain no invented builds.
