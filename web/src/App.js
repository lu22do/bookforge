"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = __importStar(require("react"));
const api_1 = require("./api");
const ui_1 = require("./ui");
const initialState = { projects: [], selectedProjectId: undefined, persistLocal: true };
function reducer(state, action) {
    var _a, _b, _c;
    switch (action.type) {
        case 'INIT':
            return action.payload;
        case 'SET_PROJECTS':
            return Object.assign(Object.assign({}, state), { projects: action.projects, selectedProjectId: (_b = (_a = action.projects[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : state.selectedProjectId });
        case 'SELECT_PROJECT':
            return Object.assign(Object.assign({}, state), { selectedProjectId: action.id });
        case 'UPSERT_PROJECT': {
            const exists = state.projects.some(p => p.id === action.project.id);
            const projects = exists ? state.projects.map(p => (p.id === action.project.id ? action.project : p)) : [action.project, ...state.projects];
            return Object.assign(Object.assign({}, state), { projects });
        }
        case 'DELETE_PROJECT': {
            const projects = state.projects.filter(p => p.id !== action.id);
            const selected = state.selectedProjectId === action.id ? (_c = projects[0]) === null || _c === void 0 ? void 0 : _c.id : state.selectedProjectId;
            return Object.assign(Object.assign({}, state), { projects, selectedProjectId: selected });
        }
        case 'TOGGLE_PERSIST':
            return Object.assign(Object.assign({}, state), { persistLocal: !state.persistLocal });
        default:
            return state;
    }
}
function App() {
    const [state, dispatch] = (0, react_1.useReducer)(reducer, initialState);
    const [tab, setTab] = (0, react_1.useState)('overview');
    // bootstrap
    (0, react_1.useEffect)(() => {
        (() => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const projects = yield api_1.api.listProjects();
            const cached = JSON.parse(localStorage.getItem('bookforge_ui') || '{}');
            dispatch({ type: 'INIT', payload: { projects, selectedProjectId: cached.selectedProjectId, persistLocal: (_a = cached.persistLocal) !== null && _a !== void 0 ? _a : true } });
            if (!cached.selectedProjectId && projects[0]) {
                dispatch({ type: 'SELECT_PROJECT', id: projects[0].id });
            }
        }))();
    }, []);
    (0, react_1.useEffect)(() => {
        if (!state.persistLocal)
            return;
        localStorage.setItem('bookforge_ui', JSON.stringify({ selectedProjectId: state.selectedProjectId, persistLocal: state.persistLocal }));
    }, [state.selectedProjectId, state.persistLocal]);
    const selected = (0, react_1.useMemo)(() => { var _a; return (_a = state.projects.find(p => p.id === state.selectedProjectId)) !== null && _a !== void 0 ? _a : state.projects[0]; }, [state.projects, state.selectedProjectId]);
    // Handlers
    const createProject = () => __awaiter(this, void 0, void 0, function* () {
        const title = prompt('Project title?', 'New Story');
        const p = yield api_1.api.createProject(title ? { title } : undefined);
        dispatch({ type: 'UPSERT_PROJECT', project: p });
        dispatch({ type: 'SELECT_PROJECT', id: p.id });
    });
    const deleteProject = (id) => __awaiter(this, void 0, void 0, function* () {
        yield api_1.api.deleteProject(id);
        dispatch({ type: 'DELETE_PROJECT', id });
    });
    const saveProject = (patch) => __awaiter(this, void 0, void 0, function* () {
        if (!selected)
            return;
        const merged = Object.assign(Object.assign(Object.assign({}, selected), patch), { updatedAt: Date.now() });
        const saved = yield api_1.api.updateProject(selected.id, merged);
        dispatch({ type: 'UPSERT_PROJECT', project: saved });
    });
    return (<div className="min-h-screen w-full bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black tracking-tight">BookForge</span>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">web</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={state.persistLocal} onChange={() => dispatch({ type: 'TOGGLE_PERSIST' })}/>
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
            {state.projects.map((p) => (<li key={p.id} className={`group flex items-center justify-between rounded-lg border px-3 py-2 ${(selected === null || selected === void 0 ? void 0 : selected.id) === p.id ? 'border-purple-400 bg-purple-50' : 'hover:bg-gray-50'}`}>
                <button onClick={() => dispatch({ type: 'SELECT_PROJECT', id: p.id })} className="text-left">
                  <div className="font-medium leading-tight">{p.title}</div>
                  <div className="text-xs text-gray-500">Updated {new Date(p.updatedAt).toLocaleString()}</div>
                </button>
                <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                  <button className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100" onClick={() => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const title = (_a = prompt('Rename project:', p.title)) !== null && _a !== void 0 ? _a : p.title;
                yield saveProject(Object.assign(Object.assign({}, (p.id === (selected === null || selected === void 0 ? void 0 : selected.id) ? {} : p)), { title }));
            })}>Rename</button>
                  <button className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => confirm('Delete project?') && deleteProject(p.id)}>Delete</button>
                </div>
              </li>))}
          </ul>
        </aside>

        {/* Main */}
        <section className="col-span-9 max-h-[calc(100vh-56px)] overflow-auto p-4">
          {/* Tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {['overview', 'theme', 'style', 'characters', 'outline', 'beats', 'export'].map((k) => (<button key={k} onClick={() => setTab(k)} className={`rounded-full border px-3 py-1.5 text-sm ${tab === k ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-100'}`}>{k[0].toUpperCase() + k.slice(1)}</button>))}
          </div>

          {selected ? (<div className="space-y-6">
              {tab === 'overview' && <Overview selected={selected} onSave={saveProject}/>}
              {tab === 'theme' && <ThemeEditor project={selected} onChange={(theme) => saveProject({ theme })}/>}
              {tab === 'style' && <StyleEditor project={selected} onChange={(style) => saveProject({ style })}/>}
              {tab === 'characters' && <CharactersEditor project={selected} onSave={saveProject}/>}
              {tab === 'outline' && <OutlineEditor project={selected} onSave={saveProject}/>}
              {tab === 'beats' && <BeatsEditor project={selected} onSave={saveProject}/>}
              {tab === 'export' && <ExportPanel project={selected}/>}
            </div>) : (<div className="text-gray-500">No project selected.</div>)}
        </section>
      </main>
    </div>);
}
/****************
 * Overview
 ****************/
function Overview({ selected, onSave }) {
    var _a, _b, _c, _d, _e;
    const [form, setForm] = (0, react_1.useState)({
        title: selected.title,
        logline: (_a = selected.logline) !== null && _a !== void 0 ? _a : '',
        genre: (_b = selected.genre) !== null && _b !== void 0 ? _b : '',
        mood: (_c = selected.mood) !== null && _c !== void 0 ? _c : '',
        tags: ((_d = selected.tags) !== null && _d !== void 0 ? _d : []).join(', '),
        notes: (_e = selected.notes) !== null && _e !== void 0 ? _e : ''
    });
    (0, react_1.useEffect)(() => {
        var _a, _b, _c, _d, _e;
        setForm({ title: selected.title, logline: (_a = selected.logline) !== null && _a !== void 0 ? _a : '', genre: (_b = selected.genre) !== null && _b !== void 0 ? _b : '', mood: (_c = selected.mood) !== null && _c !== void 0 ? _c : '', tags: ((_d = selected.tags) !== null && _d !== void 0 ? _d : []).join(', '), notes: (_e = selected.notes) !== null && _e !== void 0 ? _e : '' });
    }, [selected.id]);
    return (<div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <ui_1.TextField label="Title" value={form.title} onChange={(v) => setForm(Object.assign(Object.assign({}, form), { title: v }))}/>
        <ui_1.TextField label="Genre" value={form.genre} onChange={(v) => setForm(Object.assign(Object.assign({}, form), { genre: v }))}/>
      </div>
      <ui_1.TextField label="Logline" value={form.logline} onChange={(v) => setForm(Object.assign(Object.assign({}, form), { logline: v }))}/>
      <div className="grid grid-cols-2 gap-4">
        <ui_1.TextField label="Mood" value={form.mood} onChange={(v) => setForm(Object.assign(Object.assign({}, form), { mood: v }))}/>
        <ui_1.TextField label="Tags (comma‑separated)" value={form.tags} onChange={(v) => setForm(Object.assign(Object.assign({}, form), { tags: v }))}/>
      </div>
      <ui_1.TextArea label="Notes" value={form.notes} onChange={(v) => setForm(Object.assign(Object.assign({}, form), { notes: v }))}/>
      <div>
        <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={() => onSave({ title: form.title.trim() || 'Untitled', genre: form.genre.trim() || undefined, logline: form.logline.trim() || undefined, mood: form.mood.trim() || undefined, tags: form.tags.split(',').map(s => s.trim()).filter(Boolean), notes: form.notes.trim() || undefined })}>Save Overview</button>
      </div>
    </div>);
}
/****************
 * Theme Editor
 ****************/
function ThemeEditor({ project, onChange }) {
    const [t, setT] = (0, react_1.useState)(project.theme);
    (0, react_1.useEffect)(() => setT(project.theme), [project.id]);
    return (<div className="grid gap-4">
      <ui_1.TextField label="Core Question" value={t.coreQuestion} onChange={(v) => setT(Object.assign(Object.assign({}, t), { coreQuestion: v }))}/>
      <TagEditor label="Concepts" values={t.concepts} onChange={(values) => setT(Object.assign(Object.assign({}, t), { concepts: values }))}/>
      <TagEditor label="Motifs" values={t.motifs} onChange={(values) => setT(Object.assign(Object.assign({}, t), { motifs: values }))}/>
      <TagEditor label="Conflicts" values={t.conflicts} onChange={(values) => setT(Object.assign(Object.assign({}, t), { conflicts: values }))}/>
      <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={() => onChange(t)}>Save Theme</button>
    </div>);
}
/****************
 * Style Editor
 ****************/
function StyleEditor({ project, onChange }) {
    const [s, setS] = (0, react_1.useState)(project.style);
    (0, react_1.useEffect)(() => setS(project.style), [project.id]);
    return (<div className="grid gap-4">
      <ui_1.SelectField label="Point of View" value={s.pov} onChange={(v) => setS(Object.assign(Object.assign({}, s), { pov: v }))} options={["first", "second", "third-limited", "third-omniscient", "multi"]}/>
      <ui_1.SelectField label="Tense" value={s.tense} onChange={(v) => setS(Object.assign(Object.assign({}, s), { tense: v }))} options={["past", "present", "future"]}/>
      <ui_1.TextField label="Voice" value={s.voice} onChange={(v) => setS(Object.assign(Object.assign({}, s), { voice: v }))}/>
      <ui_1.SelectField label="Pacing" value={s.pacing} onChange={(v) => setS(Object.assign(Object.assign({}, s), { pacing: v }))} options={["slow-burn", "balanced", "fast"]}/>
      <ui_1.TextField label="Tone" value={s.tone} onChange={(v) => setS(Object.assign(Object.assign({}, s), { tone: v }))}/>
      <TagEditor label="Narrative Devices" values={s.narrativeDevices} onChange={(values) => setS(Object.assign(Object.assign({}, s), { narrativeDevices: values }))}/>
      <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={() => onChange(s)}>Save Style</button>
    </div>);
}
/****************
 * Characters
 ****************/
function CharactersEditor({ project, onSave }) {
    var _a, _b, _c, _d, _e, _f, _g;
    const [draft, setDraft] = (0, react_1.useState)({ id: crypto.randomUUID(), name: '', role: 'Protagonist', archetype: '', goal: '', need: '', flaw: '', backstory: '', relationships: [], tags: [] });
    const addCharacter = () => {
        if (!draft.name.trim())
            return alert('Name is required');
        onSave({ characters: [draft, ...project.characters] });
        setDraft(Object.assign(Object.assign({}, draft), { id: crypto.randomUUID(), name: '' }));
    };
    const remove = (id) => {
        onSave({ characters: project.characters.filter(c => c.id !== id) });
    };
    return (<div className="grid gap-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">Add Character</h3>
        <div className="grid grid-cols-2 gap-3">
          <ui_1.TextField label="Name" value={draft.name} onChange={(v) => setDraft(Object.assign(Object.assign({}, draft), { name: v }))}/>
          <ui_1.TextField label="Role" value={draft.role} onChange={(v) => setDraft(Object.assign(Object.assign({}, draft), { role: v }))}/>
          <ui_1.TextField label="Archetype" value={(_a = draft.archetype) !== null && _a !== void 0 ? _a : ''} onChange={(v) => setDraft(Object.assign(Object.assign({}, draft), { archetype: v }))}/>
          <ui_1.TextField label="Goal" value={(_b = draft.goal) !== null && _b !== void 0 ? _b : ''} onChange={(v) => setDraft(Object.assign(Object.assign({}, draft), { goal: v }))}/>
          <ui_1.TextField label="Need" value={(_c = draft.need) !== null && _c !== void 0 ? _c : ''} onChange={(v) => setDraft(Object.assign(Object.assign({}, draft), { need: v }))}/>
          <ui_1.TextField label="Flaw" value={(_d = draft.flaw) !== null && _d !== void 0 ? _d : ''} onChange={(v) => setDraft(Object.assign(Object.assign({}, draft), { flaw: v }))}/>
          <ui_1.TextArea label="Backstory" value={(_e = draft.backstory) !== null && _e !== void 0 ? _e : ''} onChange={(v) => setDraft(Object.assign(Object.assign({}, draft), { backstory: v }))}/>
          <ui_1.TextField label="Relationships (comma)" value={((_f = draft.relationships) !== null && _f !== void 0 ? _f : []).join(', ')} onChange={(v) => setDraft(Object.assign(Object.assign({}, draft), { relationships: v.split(',').map(s => s.trim()).filter(Boolean) }))}/>
          <ui_1.TextField label="Tags (comma)" value={((_g = draft.tags) !== null && _g !== void 0 ? _g : []).join(', ')} onChange={(v) => setDraft(Object.assign(Object.assign({}, draft), { tags: v.split(',').map(s => s.trim()).filter(Boolean) }))}/>
        </div>
        <div className="mt-3">
          <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={addCharacter}>Add</button>
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Characters</h3>
        <ul className="grid grid-cols-1 gap-3">
          {project.characters.map((c) => {
            var _a, _b, _c, _d;
            return (<li key={c.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-600">{c.role}{c.archetype ? ` · ${c.archetype}` : ''}</div>
                </div>
                <button className="rounded-md border px-2 py-1 text-sm text-red-600 hover:bg-red-50" onClick={() => remove(c.id)}>Delete</button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {c.goal && <ui_1.InfoRow label="Goal" value={c.goal}/>}
                {c.need && <ui_1.InfoRow label="Need" value={c.need}/>}
                {c.flaw && <ui_1.InfoRow label="Flaw" value={c.flaw}/>}
                {c.backstory && <ui_1.InfoRow label="Backstory" value={c.backstory}/>}
                {((_b = (_a = c.relationships) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0 && <ui_1.InfoRow label="Relationships" value={c.relationships.join(', ')}/>}
                {((_d = (_c = c.tags) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0 && <ui_1.InfoRow label="Tags" value={c.tags.join(', ')}/>}
              </div>
            </li>);
        })}
        </ul>
      </div>
    </div>);
}
/****************
 * Outline Editor
 ****************/
function OutlineEditor({ project, onSave }) {
    const addSection = () => {
        const title = prompt('Section title (e.g., Act I)', 'New Section');
        if (!title)
            return;
        const section = { id: crypto.randomUUID(), title, chapters: [] };
        onSave({ outline: [section, ...project.outline] });
    };
    const upsertSection = (section) => {
        const outline = project.outline.some(s => s.id === section.id)
            ? project.outline.map(s => (s.id === section.id ? section : s))
            : [section, ...project.outline];
        onSave({ outline });
    };
    const deleteSection = (sectionId) => onSave({ outline: project.outline.filter(s => s.id !== sectionId) });
    return (<div className="grid gap-4">
      <div>
        <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={addSection}>+ Add Section</button>
      </div>

      <div className="grid gap-3">
        {project.outline.map((s) => (<SectionCard key={s.id} section={s} onChange={upsertSection} onDelete={deleteSection}/>))}
      </div>
    </div>);
}
function SectionCard({ section, onChange, onDelete }) {
    var _a;
    const [title, setTitle] = (0, react_1.useState)(section.title);
    const [summary, setSummary] = (0, react_1.useState)((_a = section.summary) !== null && _a !== void 0 ? _a : '');
    (0, react_1.useEffect)(() => { var _a; setTitle(section.title); setSummary((_a = section.summary) !== null && _a !== void 0 ? _a : ''); }, [section.id]);
    const addChapter = () => onChange(Object.assign(Object.assign({}, section), { chapters: [...section.chapters, { id: crypto.randomUUID(), title: `Chapter ${section.chapters.length + 1}`, summary: '', beats: [] }] }));
    const updateChapter = (c) => onChange(Object.assign(Object.assign({}, section), { chapters: section.chapters.map(x => x.id === c.id ? c : x) }));
    const deleteChapter = (id) => onChange(Object.assign(Object.assign({}, section), { chapters: section.chapters.filter(c => c.id !== id) }));
    return (<div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{section.title}</div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100" onClick={addChapter}>+ Chapter</button>
          <button className="rounded-md border px-3 py-1 text-sm text-red-600 hover:bg-red-50" onClick={() => onDelete(section.id)}>Delete Section</button>
        </div>
      </div>
      <div className="mt-2 grid gap-2">
        <ui_1.TextArea label="Section Summary" value={summary} onChange={setSummary}/>
        <div>
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100" onClick={() => onChange(Object.assign(Object.assign({}, section), { title, summary }))}>Save Section</button>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {section.chapters.map((c) => (<ChapterCard key={c.id} chapter={c} onChange={updateChapter} onDelete={deleteChapter}/>))}
      </div>
    </div>);
}
function ChapterCard({ chapter, onChange, onDelete }) {
    var _a;
    const [title, setTitle] = (0, react_1.useState)(chapter.title);
    const [summary, setSummary] = (0, react_1.useState)((_a = chapter.summary) !== null && _a !== void 0 ? _a : '');
    (0, react_1.useEffect)(() => { var _a; setTitle(chapter.title); setSummary((_a = chapter.summary) !== null && _a !== void 0 ? _a : ''); }, [chapter.id]);
    const addBeat = () => onChange(Object.assign(Object.assign({}, chapter), { beats: [{ id: crypto.randomUUID(), type: 'Custom', description: '' }, ...chapter.beats] }));
    const updateBeat = (b) => onChange(Object.assign(Object.assign({}, chapter), { beats: chapter.beats.map(x => x.id === b.id ? b : x) }));
    const deleteBeat = (id) => onChange(Object.assign(Object.assign({}, chapter), { beats: chapter.beats.filter(b => b.id !== id) }));
    return (<div className="rounded-xl border bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <input className="w-1/2 rounded-md border px-2 py-1" value={title} onChange={(e) => setTitle(e.target.value)}/>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-white" onClick={addBeat}>+ Beat</button>
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-white" onClick={() => onChange(Object.assign(Object.assign({}, chapter), { title, summary }))}>Save Chapter</button>
          <button className="rounded-md border px-3 py-1 text-sm text-red-600 hover:bg-white" onClick={() => onDelete(chapter.id)}>Delete</button>
        </div>
      </div>
      <ui_1.TextArea label="Chapter Summary" value={summary} onChange={setSummary}/>
      <div className="mt-2 grid gap-2">
        {chapter.beats.map((b) => (<BeatRow key={b.id} beat={b} onChange={updateBeat} onDelete={deleteBeat}/>))}
      </div>
    </div>);
}
/****************
 * Loose Beats
 ****************/
function BeatsEditor({ project, onSave }) {
    const addBeat = () => {
        const description = prompt('Beat description', '');
        if (description == null)
            return;
        const beat = { id: crypto.randomUUID(), type: 'Custom', description };
        onSave({ beats: [beat, ...project.beats] });
    };
    const updateBeat = (b) => onSave({ beats: project.beats.map(x => x.id === b.id ? b : x) });
    const deleteBeat = (id) => onSave({ beats: project.beats.filter(b => b.id !== id) });
    return (<div className="grid gap-4">
      <div>
        <button className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700" onClick={addBeat}>+ Add Beat</button>
      </div>
      <div className="grid gap-2">
        {project.beats.map((b) => (<BeatRow key={b.id} beat={b} onChange={updateBeat} onDelete={deleteBeat}/>))}
      </div>
    </div>);
}
function BeatRow({ beat, onChange, onDelete }) {
    const [local, setLocal] = (0, react_1.useState)(beat);
    (0, react_1.useEffect)(() => setLocal(beat), [beat.id]);
    return (<div className="grid grid-cols-12 items-start gap-2 rounded-lg border bg-white p-3">
      <select value={local.type} onChange={(e) => setLocal(Object.assign(Object.assign({}, local), { type: e.target.value }))} className="col-span-3 rounded-md border px-2 py-1">
        {["Inciting Incident", "Key Decision", "Pinch Point", "Midpoint Reversal", "Dark Night", "Climax", "Resolution", "Custom"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <input className="col-span-5 rounded-md border px-2 py-1" placeholder="Description" value={local.description} onChange={(e) => setLocal(Object.assign(Object.assign({}, local), { description: e.target.value }))}/>
      <input className="col-span-4 rounded-md border px-2 py-1" placeholder="Stakes / Setting / Notes" value={[local.stakes, local.setting, local.notes].filter(Boolean).join(' · ')} onChange={(e) => { const parts = e.target.value.split('·').map(s => s.trim()); setLocal(Object.assign(Object.assign({}, local), { stakes: parts[0], setting: parts[1], notes: parts.slice(2).join(' · ') || undefined })); }}/>
      <div className="col-span-12 flex items-center justify-end gap-2">
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-100" onClick={() => onChange(local)}>Save</button>
        <button className="rounded-md border px-3 py-1 text-sm text-red-600 hover:bg-red-50" onClick={() => onDelete(beat.id)}>Delete</button>
      </div>
    </div>);
}
/****************
 * Export Panel
 ****************/
function ExportPanel({ project }) {
    const [pretty, setPretty] = (0, react_1.useState)(true);
    const json = react_1.default.useMemo(() => (pretty ? JSON.stringify(project, null, 2) : JSON.stringify(project)), [project, pretty]);
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
    const copy = () => __awaiter(this, void 0, void 0, function* () { try {
        yield navigator.clipboard.writeText(json);
        alert('Copied to clipboard');
    }
    catch (_a) {
        alert('Copy failed');
    } });
    return (<div className="grid gap-3">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pretty} onChange={() => setPretty(p => !p)}/> Pretty print</label>
        <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100" onClick={copy}>Copy JSON</button>
        <button className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700" onClick={download}>Download JSON</button>
      </div>
      <pre className="max-h-[50vh] overflow-auto rounded-lg border bg-white p-3 text-xs leading-relaxed">{json}</pre>
    </div>);
}
/****************
 * TagEditor
 ****************/
function TagEditor({ label, values, onChange }) {
    const [text, setText] = (0, react_1.useState)(values.join(', '));
    (0, react_1.useEffect)(() => setText(values.join(', ')), [values.join(',')]);
    return (<label className="grid gap-1 text-sm">
      <span className="text-gray-600">{label}</span>
      <input className="rounded-md border px-3 py-2" value={text} onChange={(e) => setText(e.target.value)} onBlur={() => onChange(text.split(',').map(s => s.trim()).filter(Boolean))}/>
      <span className="text-xs text-gray-500">Comma‑separated</span>
    </label>);
}
