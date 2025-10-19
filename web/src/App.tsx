import React, { useEffect, useMemo, useReducer, useState } from 'react';
import type { Project, Theme, Style, Character, Beat, BeatType, OutlineSection, Chapter, ID } from '@bookforge/shared';
import { api } from './api';
import { TextArea, TextField, SelectField, InfoRow } from './ui';

/*******************
 * Global App State
 *******************/

type State = {
  projects: Project[];
  selectedProjectId?: ID;
  persistLocal: boolean; // persist selection state locally
};

type Action =
  | { type: 'INIT'; payload: State }
  | { type: 'SET_PROJECTS'; projects: Project[] }
  | { type: 'SELECT_PROJECT'; id: ID }
  | { type: 'UPSERT_PROJECT'; project: Project }
  | { type: 'DELETE_PROJECT'; id: ID }
  | { type: 'TOGGLE_PERSIST' };

const initialState: State = { projects: [], selectedProjectId: undefined, persistLocal: true };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT':
      return action.payload;
    case 'SET_PROJECTS':
      return { ...state, projects: action.projects, selectedProjectId: action.projects[0]?.id ?? state.selectedProjectId };
    case 'SELECT_PROJECT':
      return { ...state, selectedProjectId: action.id };
    case 'UPSERT_PROJECT': {
      const exists = state.projects.some(p => p.id === action.project.id);
      const projects = exists ? state.projects.map(p => (p.id === action.project.id ? action.project : p)) : [action.project, ...state.projects];
      return { ...state, projects };
    }
    case 'DELETE_PROJECT': {
      const projects = state.projects.filter(p => p.id !== action.id);
      const selected = state.selectedProjectId === action.id ? projects[0]?.id : state.selectedProjectId;
      return { ...state, projects, selectedProjectId: selected };
    }
    case 'TOGGLE_PERSIST':
      return { ...state, persistLocal: !state.persistLocal };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tab, setTab] = useState<'overview'|'theme'|'style'|'characters'|'outline'|'beats'|'export'>('overview');

  // bootstrap
  useEffect(() => {
    (async () => {
      const projects = await api.listProjects();
      const cached = JSON.parse(localStorage.getItem('bookforge_ui') || '{}');
      dispatch({ type: 'INIT', payload: { projects, selectedProjectId: cached.selectedProjectId, persistLocal: cached.persistLocal ?? true } });
      if (!cached.selectedProjectId && projects[0]) {
        dispatch({ type: 'SELECT_PROJECT', id: projects[0].id });
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.persistLocal) return;
    localStorage.setItem('bookforge_ui', JSON.stringify({ selectedProjectId: state.selectedProjectId, persistLocal: state.persistLocal }));
  }, [state.selectedProjectId, state.persistLocal]);

  const selected = useMemo(() => state.projects.find(p => p.id === state.selectedProjectId) ?? state.projects[0], [state.projects, state.selectedProjectId]);

  // Handlers
  const createProject = async () => {
    const title = prompt('Project title?', 'New Story');
    const p = await api.createProject(title ? { title } : undefined);
    dispatch({ type: 'UPSERT_PROJECT', project: p });
    dispatch({ type: 'SELECT_PROJECT', id: p.id });
  };

  const deleteProject = async (id: ID) => {
    await api.deleteProject(id);
    dispatch({ type: 'DELETE_PROJECT', id });
  };

  const saveProject = async (patch: Partial<Project>) => {
    if (!selected) return;
    const merged: Project = { ...selected, ...patch, updatedAt: Date.now() } as Project;
    const saved = await api.updateProject(selected.id, merged);
    dispatch({ type: 'UPSERT_PROJECT', project: saved });
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black tracking-tight">BookForge</span>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">web</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={state.persistLocal} onChange={() => dispatch({ type: 'TOGGLE_PERSIST' })} />
            Persist UI locally
          </label>
          <button className="rounded-lg border px-3 py-1.5 hover:bg-gray-100" onClick={createProject}>+ New Project</button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-0">
        {/* Sidebar */}
        <aside className="col-span-3 border-r bg-white p-3 max-h-[calc(100vh-56px)] overflow-auto">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Projects</h2>
          </div>
          <ul className="space-y-1">
            {state.projects.map((p) => (
              <li key={p.id} className={`group flex items-center justify-between rounded-lg border px-3 py-2 ${selected?.id === p.id ? 'border-purple-400 bg-purple-50' : 'hover:bg-gray-50'}`}>
                <button onClick={() => dispatch({ type: 'SELECT_PROJECT', id: p.id })} className="text-left">
                  <div className="font-medium leading-tight">{p.title}</div>
                  <div className="text-xs text-gray-500">Updated {new Date(p.updatedAt).toLocaleString()}</div>
                </button>
                <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                  <button
                    className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100"
                    onClick={async () => {
                      const title = prompt('Rename project:', p.title) ?? p.title;
                      await saveProject({ ...(p.id === selected?.id ? {} : p), title });
                    }}
                  >Rename</button>
                  <button className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => confirm('Delete project?') && deleteProject(p.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main */}
        <section className="col-span-9 max-h-[calc(100vh-56px)] overflow-auto p-4">
          {/* Tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {(['overview','theme','style','characters','outline','beats','export'] as const).map((k) => (
              <button key={k} onClick={() => setTab(k)} className={`rounded-full border px-3 py-1.5 text-sm ${tab === k ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-100'}`}>{k[0].toUpperCase()+k.slice(1)}</button>
            ))}
          </div>

          {selected ? (
            <div className="space-y-6">
              {tab === 'overview' && <Overview selected={selected} onSave={saveProject} />}
              {tab === 'theme' && <ThemeEditor project={selected} onChange={(theme) => saveProject({ theme })} />}
              {tab === 'style' && <StyleEditor project={selected} onChange={(style) => saveProject({ style })} />}
              {tab === 'characters' && <CharactersEditor project={selected} onSave={saveProject} />}
              {tab === 'outline' && <OutlineEditor project={selected} onSave={saveProject} />}
              {tab === 'beats' && <BeatsEditor project={selected} onSave={saveProject} />}
              {tab === 'export' && <ExportPanel project={selected} />}
            </div>
          ) : (
            <div className="text-gray-500">No project selected.</div>
          )}
        </section>
      </main>
    </div>
  );
}

/****************
 * Overview
 ****************/
function Overview({ selected, onSave }: { selected: Project; onSave: (p: Partial<Project>) => void }) {
  const [form, setForm] = useState({
    title: selected.title,
    logline: selected.logline ?? '',
    genre: selected.genre ?? '',
    mood: selected.mood ?? '',
    tags: (selected.tags ?? []).join(', '),
    notes: selected.notes ?? ''
  });
  useEffect(() => {
    setForm({ title: selected.title, logline: selected.logline ?? '', genre: selected.genre ?? '', mood: selected.mood ?? '', tags: (selected.tags ?? []).join(', '), notes: selected.notes ?? '' });
  }, [selected.id]);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        <TextField label="Genre" value={form.genre} onChange={(v) => setForm({ ...form, genre: v })} />
      </div>
      <TextField label="Logline" value={form.logline} onChange={(v) => setForm({ ...form, logline: v })} />
      <div className="grid grid-cols-2 gap-4">
        <TextField label="Mood" value={form.mood} onChange={(v) => setForm({ ...form, mood: v })} />
        <TextField label="Tags (comma‑separated)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
      </div>
      <TextArea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
      <div>
        <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={() => onSave({ title: form.title.trim() || 'Untitled', genre: form.genre.trim() || undefined, logline: form.logline.trim() || undefined, mood: form.mood.trim() || undefined, tags: form.tags.split(',').map(s => s.trim()).filter(Boolean), notes: form.notes.trim() || undefined })}>Save Overview</button>
      </div>
    </div>
  );
}

/****************
 * Theme Editor
 ****************/
function ThemeEditor({ project, onChange }: { project: Project; onChange: (t: Theme) => void }) {
  const [t, setT] = useState<Theme>(project.theme);
  useEffect(() => setT(project.theme), [project.id]);
  return (
    <div className="grid gap-4">
      <TextField label="Core Question" value={t.coreQuestion} onChange={(v) => setT({ ...t, coreQuestion: v })} />
      <TagEditor label="Concepts" values={t.concepts} onChange={(values) => setT({ ...t, concepts: values })} />
      <TagEditor label="Motifs" values={t.motifs} onChange={(values) => setT({ ...t, motifs: values })} />
      <TagEditor label="Conflicts" values={t.conflicts} onChange={(values) => setT({ ...t, conflicts: values })} />
      <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={() => onChange(t)}>Save Theme</button>
    </div>
  );
}

/****************
 * Style Editor
 ****************/
function StyleEditor({ project, onChange }: { project: Project; onChange: (s: Style) => void }) {
  const [s, setS] = useState<Style>(project.style);
  useEffect(() => setS(project.style), [project.id]);
  return (
    <div className="grid gap-4">
      <SelectField label="Point of View" value={s.pov} onChange={(v) => setS({ ...s, pov: v as Style['pov'] })} options={["first","second","third-limited","third-omniscient","multi"]} />
      <SelectField label="Tense" value={s.tense} onChange={(v) => setS({ ...s, tense: v as Style['tense'] })} options={["past","present","future"]} />
      <TextField label="Voice" value={s.voice} onChange={(v) => setS({ ...s, voice: v })} />
      <SelectField label="Pacing" value={s.pacing} onChange={(v) => setS({ ...s, pacing: v as Style['pacing'] })} options={["slow-burn","balanced","fast"]} />
      <TextField label="Tone" value={s.tone} onChange={(v) => setS({ ...s, tone: v })} />
      <TagEditor label="Narrative Devices" values={s.narrativeDevices} onChange={(values) => setS({ ...s, narrativeDevices: values })} />
      <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={() => onChange(s)}>Save Style</button>
    </div>
  );
}

/****************
 * Characters
 ****************/
function CharactersEditor({ project, onSave }: { project: Project; onSave: (p: Partial<Project>) => void }) {
  const [draft, setDraft] = useState<Character>({ id: crypto.randomUUID(), name: '', role: 'Protagonist', archetype: '', goal: '', need: '', flaw: '', backstory: '', relationships: [], tags: [] });

  const addCharacter = () => {
    if (!draft.name.trim()) return alert('Name is required');
    onSave({ characters: [draft, ...project.characters] });
    setDraft({ ...draft, id: crypto.randomUUID(), name: '' });
  };

  const remove = (id: ID) => {
    onSave({ characters: project.characters.filter(c => c.id !== id) });
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Add Character</h3>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
          <TextField label="Role" value={draft.role} onChange={(v) => setDraft({ ...draft, role: v })} />
          <TextField label="Archetype" value={draft.archetype ?? ''} onChange={(v) => setDraft({ ...draft, archetype: v })} />
          <TextField label="Goal" value={draft.goal ?? ''} onChange={(v) => setDraft({ ...draft, goal: v })} />
          <TextField label="Need" value={draft.need ?? ''} onChange={(v) => setDraft({ ...draft, need: v })} />
          <TextField label="Flaw" value={draft.flaw ?? ''} onChange={(v) => setDraft({ ...draft, flaw: v })} />
          <TextArea label="Backstory" value={draft.backstory ?? ''} onChange={(v) => setDraft({ ...draft, backstory: v })} />
          <TextField label="Relationships (comma)" value={(draft.relationships ?? []).join(', ')} onChange={(v) => setDraft({ ...draft, relationships: v.split(',').map(s=>s.trim()).filter(Boolean) })} />
          <TextField label="Tags (comma)" value={(draft.tags ?? []).join(', ')} onChange={(v) => setDraft({ ...draft, tags: v.split(',').map(s=>s.trim()).filter(Boolean) })} />
        </div>
        <div className="mt-3">
          <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={addCharacter}>Add</button>
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Characters</h3>
        <ul className="grid grid-cols-1 gap-3">
          {project.characters.map((c) => (
            <li key={c.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-600">{c.role}{c.archetype ? ` · ${c.archetype}` : ''}</div>
                </div>
                <button className="rounded-md border px-2 py-1 text-sm text-red-600 hover:bg-red-50" onClick={() => remove(c.id)}>Delete</button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {c.goal && <InfoRow label="Goal" value={c.goal} />}
                {c.need && <InfoRow label="Need" value={c.need} />}
                {c.flaw && <InfoRow label="Flaw" value={c.flaw} />}
                {c.backstory && <InfoRow label="Backstory" value={c.backstory} />}
                {(c.relationships?.length ?? 0) > 0 && <InfoRow label="Relationships" value={c.relationships!.join(', ')} />}
                {(c.tags?.length ?? 0) > 0 && <InfoRow label="Tags" value={c.tags!.join(', ')} />}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/****************
 * Outline Editor
 ****************/
function OutlineEditor({ project, onSave }: { project: Project; onSave: (p: Partial<Project>) => void }) {
  const addSection = () => {
    const title = prompt('Section title (e.g., Act I)', 'New Section');
    if (!title) return;
    const section: OutlineSection = { id: crypto.randomUUID(), title, chapters: [] };
    onSave({ outline: [section, ...project.outline] });
  };

  const upsertSection = (section: OutlineSection) => {
    const outline = project.outline.some(s => s.id === section.id)
      ? project.outline.map(s => (s.id === section.id ? section : s))
      : [section, ...project.outline];
    onSave({ outline });
  };

  const deleteSection = (sectionId: ID) => onSave({ outline: project.outline.filter(s => s.id !== sectionId) });

  return (
    <div className="grid gap-4">
      <div>
        <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={addSection}>+ Add Section</button>
      </div>

      <div className="grid gap-3">
        {project.outline.map((s) => (
          <SectionCard key={s.id} section={s} onChange={upsertSection} onDelete={deleteSection} />
        ))}
      </div>
    </div>
  );
}

function SectionCard({ section, onChange, onDelete }: { section: OutlineSection; onChange: (s: OutlineSection) => void; onDelete: (id: ID) => void }) {
  const [title, setTitle] = useState(section.title);
  const [summary, setSummary] = useState(section.summary ?? '');
  useEffect(() => { setTitle(section.title); setSummary(section.summary ?? ''); }, [section.id]);

  const addChapter = () => onChange({ ...section, chapters: [...section.chapters, { id: crypto.randomUUID(), title: `Chapter ${section.chapters.length + 1}`, summary: '', beats: [] }] });
  const updateChapter = (c: Chapter) => onChange({ ...section, chapters: section.chapters.map(x => x.id === c.id ? c : x) });
  const deleteChapter = (id: ID) => onChange({ ...section, chapters: section.chapters.filter(c => c.id !== id) });

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{section.title}</div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100" onClick={addChapter}>+ Chapter</button>
          <button className="rounded-md border px-3 py-1 text-sm text-red-600 hover:bg-red-50" onClick={() => onDelete(section.id)}>Delete Section</button>
        </div>
      </div>
      <div className="mt-2 grid gap-2">
        <TextArea label="Section Summary" value={summary} onChange={setSummary} />
        <div>
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100" onClick={() => onChange({ ...section, title, summary })}>Save Section</button>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {section.chapters.map((c) => (
          <ChapterCard key={c.id} chapter={c} onChange={updateChapter} onDelete={deleteChapter} />
        ))}
      </div>
    </div>
  );
}

function ChapterCard({ chapter, onChange, onDelete }: { chapter: Chapter; onChange: (c: Chapter) => void; onDelete: (id: ID) => void }) {
  const [title, setTitle] = useState(chapter.title);
  const [summary, setSummary] = useState(chapter.summary ?? '');
  useEffect(() => { setTitle(chapter.title); setSummary(chapter.summary ?? ''); }, [chapter.id]);

  const addBeat = () => onChange({ ...chapter, beats: [{ id: crypto.randomUUID(), type: 'Custom', description: '' }, ...chapter.beats] });
  const updateBeat = (b: Beat) => onChange({ ...chapter, beats: chapter.beats.map(x => x.id === b.id ? b : x) });
  const deleteBeat = (id: ID) => onChange({ ...chapter, beats: chapter.beats.filter(b => b.id !== id) });

  return (
    <div className="rounded-xl border bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <input className="w-1/2 rounded-md border px-2 py-1" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-white" onClick={addBeat}>+ Beat</button>
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-white" onClick={() => onChange({ ...chapter, title, summary })}>Save Chapter</button>
          <button className="rounded-md border px-3 py-1 text-sm text-red-600 hover:bg-white" onClick={() => onDelete(chapter.id)}>Delete</button>
        </div>
      </div>
      <TextArea label="Chapter Summary" value={summary} onChange={setSummary} />
      <div className="mt-2 grid gap-2">
        {chapter.beats.map((b) => (
          <BeatRow key={b.id} beat={b} onChange={updateBeat} onDelete={deleteBeat} />
        ))}
      </div>
    </div>
  );
}

/****************
 * Loose Beats
 ****************/
function BeatsEditor({ project, onSave }: { project: Project; onSave: (p: Partial<Project>) => void }) {
  const addBeat = () => {
    const description = prompt('Beat description', '');
    if (description == null) return;
    const beat: Beat = { id: crypto.randomUUID(), type: 'Custom', description };
    onSave({ beats: [beat, ...project.beats] });
  };
  const updateBeat = (b: Beat) => onSave({ beats: project.beats.map(x => x.id === b.id ? b : x) });
  const deleteBeat = (id: ID) => onSave({ beats: project.beats.filter(b => b.id !== id) });

  return (
    <div className="grid gap-4">
      <div>
        <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={addBeat}>+ Add Beat</button>
      </div>
      <div className="grid gap-2">
        {project.beats.map((b) => (
          <BeatRow key={b.id} beat={b} onChange={updateBeat} onDelete={deleteBeat} />
        ))}
      </div>
    </div>
  );
}

function BeatRow({ beat, onChange, onDelete }: { beat: Beat; onChange: (b: Beat) => void; onDelete: (id: ID) => void }) {
  const [local, setLocal] = useState<Beat>(beat);
  useEffect(() => setLocal(beat), [beat.id]);
  return (
    <div className="grid grid-cols-12 items-start gap-2 rounded-lg border bg-white p-3">
      <select value={local.type} onChange={(e) => setLocal({ ...local, type: e.target.value as BeatType })} className="col-span-3 rounded-md border px-2 py-1">
        {["Inciting Incident","Key Decision","Pinch Point","Midpoint Reversal","Dark Night","Climax","Resolution","Custom"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <input className="col-span-5 rounded-md border px-2 py-1" placeholder="Description" value={local.description} onChange={(e) => setLocal({ ...local, description: e.target.value })} />
      <input className="col-span-4 rounded-md border px-2 py-1" placeholder="Stakes / Setting / Notes" value={[local.stakes, local.setting, local.notes].filter(Boolean).join(' · ')} onChange={(e) => { const parts = e.target.value.split('·').map(s => s.trim()); setLocal({ ...local, stakes: parts[0], setting: parts[1], notes: parts.slice(2).join(' · ') || undefined }); }} />
      <div className="col-span-12 flex items-center justify-end gap-2">
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100" onClick={() => onChange(local)}>Save</button>
        <button className="rounded-md border px-3 py-1 text-sm text-red-600 hover:bg-red-50" onClick={() => onDelete(beat.id)}>Delete</button>
      </div>
    </div>
  );
}

/****************
 * Export Panel
 ****************/
function ExportPanel({ project }: { project: Project }) {
  const [pretty, setPretty] = useState(true);
  const json = React.useMemo(() => (pretty ? JSON.stringify(project, null, 2) : JSON.stringify(project)), [project, pretty]);
  const download = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safe = project.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'project';
    a.download = `${safe}.bookforge.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const copy = async () => { try { await navigator.clipboard.writeText(json); alert('Copied to clipboard'); } catch { alert('Copy failed'); } };
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pretty} onChange={() => setPretty(p => !p)} /> Pretty print</label>
        <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100" onClick={copy}>Copy JSON</button>
        <button className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700" onClick={download}>Download JSON</button>
      </div>
      <pre className="max-h-[50vh] overflow-auto rounded-lg border bg-white p-3 text-xs leading-relaxed">{json}</pre>
    </div>
  );
}

/****************
 * TagEditor
 ****************/
function TagEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (vals: string[]) => void }) {
  const [text, setText] = useState(values.join(', '));
  useEffect(() => setText(values.join(', ')), [values.join(',')]);
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-gray-600">{label}</span>
      <input className="rounded-md border px-3 py-2" value={text} onChange={(e) => setText(e.target.value)} onBlur={() => onChange(text.split(',').map(s => s.trim()).filter(Boolean))} />
      <span className="text-xs text-gray-500">Comma‑separated</span>
    </label>
  );
}
