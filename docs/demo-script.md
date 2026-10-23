# 3–5 Minute Walkthrough Plan

Use this as a guide, not a script to read word for word. Record the real running app and your own code. Do not claim a feature works unless you have tested it.

## 0:00–0:30 — Introduce the project
- Say your name, the app name (Atlas — Product Explorer), and the API used (DummyJSON Products).
- Show the loaded catalogue and explain that it uses vanilla JavaScript, Vite, and Tailwind CSS v4.

## 0:30–1:15 — Loading and network requests
- Open DevTools → Network and select Slow 4G.
- Reload the page and show the skeleton loading state.
- Explain that `loadCatalogue()` starts the products and category requests in parallel with `Promise.allSettled()`.
- Point to `getJSON()` in `src/api.js` and explain `fetch`, `response.ok`, and JSON parsing.

## 1:15–2:15 — Search, filter, sort, and stats
- Search for a product title or brand, then show that results update after a short debounce.
- Select a category, change the sort order, and show the controls can be combined.
- Explain `getVisibleItems()` and why `toSorted()` avoids mutating the original array.
- Explain the `reduce()` calculations in `getStats()`.

## 2:15–3:00 — Details and favourites
- Open a product details view and point out the extra request for one product ID.
- Save a favourite, refresh, and show that it remains saved.
- Press Escape or the close button to close the details view.

## 3:00–4:00 — Empty and error states
- Search for a phrase that cannot match any product to show the empty state; use Clear filters to recover.
- To demonstrate the error state, temporarily change the products URL to an invalid path in `src/api.js`, save, and reload. Show the friendly error and Retry button.
- Restore the correct URL and reload. Do not leave the API URL broken in the final commit.

## 4:00–4:30 — Explain the architecture
- Show `src/main.js` (state and events), `src/api.js` (requests), `src/utils.js` (pure transformations), and `src/render.js` (UI templates).
- Finish by showing the README and the deployed URL after deployment.
