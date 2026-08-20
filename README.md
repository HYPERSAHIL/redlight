# redlight.sahil.run - UP Verified Map (Option A)

Leaflet + OSM, district-centroid only, verified sources only.

## Data
- `public/data/up-points.geojson` - 6 verified points (high/medium) - district centroids, not buildings
- `public/data/up-districts.geojson` - UP districts shaded by UPSACS TI coverage (hasTI). Replace with official Census 2011 polygons later.

Scale to new state: add `public/data/<state>-points.geojson` + entry in `src/config.js`

## Dev
npm install
npm run dev
npm run build -> dist/

## Deploy - Cloudflare Pages
wrangler pages deploy dist --project-name=redlight --branch=main
Custom domain: redlight.sahil.run (CNAME to redlight.pages.dev)

## Legal
District-centroid only, sources in popup, disclaimer in UI. Not a directory. For information only.
