import type { Project } from '@bookforge/shared';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const api = {
  async listProjects(): Promise<Project[]> {
    const r = await fetch(`${baseURL}/projects`);
    return r.json();
  },
  async createProject(partial?: Partial<Project>): Promise<Project> {
    const r = await fetch(`${baseURL}/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(partial ?? {}) });
    return r.json();
  },
  async updateProject(id: string, project: Project): Promise<Project> {
    const r = await fetch(`${baseURL}/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project) });
    return r.json();
  },
  async patchProject(id: string, patch: Partial<Project>): Promise<Project> {
    const r = await fetch(`${baseURL}/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    return r.json();
  },
  async deleteProject(id: string): Promise<void> {
    await fetch(`${baseURL}/projects/${id}`, { method: 'DELETE' });
  }
};
