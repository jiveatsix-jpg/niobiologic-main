# NioBiologic

A tactical, terminal-styled canvas graphing tool: line evolution, comparison bars, distribution donut, and radar views over user-defined sectors/streams, with CSV/JSON import-export and a local graph library. Runs as a web app (Vite) or a desktop app (Tauri).

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run lint` — TypeScript type-check (`tsc --noEmit`)
- `npm test` — run the test suite once
- `npm run test:watch` — run tests in watch mode
- `npm run tauri` — Tauri CLI (desktop packaging, see `src-tauri/`)
