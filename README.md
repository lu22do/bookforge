# BookForge

A starter app to brainstorm and structure books: themes, style, characters, outline, beats. 

Originally built by ChatGPT with following prompt:
Let's build a web app in nodejs and react in typescript. This app will help build the structure for book writing. This can be used to brainstorm and create the theme, the style, the characters, the outline, the beats for the story. It will consists of projects - each projects being for one story. Make sure to have a clear schema for each entity in the project. For this first version, it is OK to store everything in    memory.

## Quick start

```bash
TBD
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
