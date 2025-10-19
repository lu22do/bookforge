"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const baseURL = (_a = import.meta.env.VITE_API_URL) !== null && _a !== void 0 ? _a : 'http://localhost:3001';
exports.api = {
    listProjects() {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield fetch(`${baseURL}/projects`);
            return r.json();
        });
    },
    createProject(partial) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield fetch(`${baseURL}/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(partial !== null && partial !== void 0 ? partial : {}) });
            return r.json();
        });
    },
    updateProject(id, project) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield fetch(`${baseURL}/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project) });
            return r.json();
        });
    },
    patchProject(id, patch) {
        return __awaiter(this, void 0, void 0, function* () {
            const r = yield fetch(`${baseURL}/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
            return r.json();
        });
    },
    deleteProject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fetch(`${baseURL}/projects/${id}`, { method: 'DELETE' });
        });
    }
};
