import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';
import type { Project } from '@bookforge/shared';
import { db, createSampleProject, touch } from './store.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/projects', (_req, res) => {
  res.json(db.projects);
});

app.post('/projects', (req, res) => {
  const base = createSampleProject();
  const body = (req.body || {}) as Partial<Project>;
  const project: Project = {
    ...base,
    ...body,
    id: nanoid(10),
    title: body.title || base.title
  };
  db.projects.unshift(project);
  res.status(201).json(project);
});

app.get('/projects/:id', (req, res) => {
  const p = db.projects.find(p => p.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

app.put('/projects/:id', (req, res) => {
  const idx = db.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const merged = touch({ ...(req.body as Project), id: req.params.id });
  db.projects[idx] = merged;
  res.json(merged);
});

app.patch('/projects/:id', (req, res) => {
  const idx = db.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.projects[idx] = touch({ ...db.projects[idx], ...(req.body as Partial<Project>) });
  res.json(db.projects[idx]);
});

app.delete('/projects/:id', (req, res) => {
  const before = db.projects.length;
  db.projects = db.projects.filter(p => p.id !== req.params.id);
  if (db.projects.length === before) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => console.log(`BookForge API on http://localhost:${PORT}`));
