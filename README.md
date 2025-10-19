# BookForge

A starter app to brainstorm and structure books: themes, style, characters, outline, beats. 

## Quick start

```bash
# 1) install deps
npm install

# 2) start API and Web in parallel
npm run dev
# API on http://localhost:3001
# Web on http://localhost:5173
```

> The server stores data **in memory**. Restarting the server resets the data. The web app caches state in the backend; optional localStorage persistence can be toggled in the UI.

## Build

```bash
npm run build
```

## Packages
- `shared/` — TypeScript types used by both server and web
- `server/` — Express API with simple CRUD
- `web/` — React + Vite + Tailwind UI
