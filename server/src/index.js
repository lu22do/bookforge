"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const nanoid_1 = require("nanoid");
const store_js_1 = require("./store.js");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/projects', (_req, res) => {
    res.json(store_js_1.db.projects);
});
app.post('/projects', (req, res) => {
    const base = (0, store_js_1.createSampleProject)();
    const body = (req.body || {});
    const project = Object.assign(Object.assign(Object.assign({}, base), body), { id: (0, nanoid_1.nanoid)(10), title: body.title || base.title });
    store_js_1.db.projects.unshift(project);
    res.status(201).json(project);
});
app.get('/projects/:id', (req, res) => {
    const p = store_js_1.db.projects.find(p => p.id === req.params.id);
    if (!p)
        return res.status(404).json({ error: 'Not found' });
    res.json(p);
});
app.put('/projects/:id', (req, res) => {
    const idx = store_js_1.db.projects.findIndex(p => p.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ error: 'Not found' });
    const merged = (0, store_js_1.touch)(Object.assign(Object.assign({}, req.body), { id: req.params.id }));
    store_js_1.db.projects[idx] = merged;
    res.json(merged);
});
app.patch('/projects/:id', (req, res) => {
    const idx = store_js_1.db.projects.findIndex(p => p.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ error: 'Not found' });
    store_js_1.db.projects[idx] = (0, store_js_1.touch)(Object.assign(Object.assign({}, store_js_1.db.projects[idx]), req.body));
    res.json(store_js_1.db.projects[idx]);
});
app.delete('/projects/:id', (req, res) => {
    const before = store_js_1.db.projects.length;
    store_js_1.db.projects = store_js_1.db.projects.filter(p => p.id !== req.params.id);
    if (store_js_1.db.projects.length === before)
        return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
});
const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`BookForge API on http://localhost:${PORT}`));
