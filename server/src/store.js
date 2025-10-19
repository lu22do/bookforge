"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.touch = exports.db = exports.createSampleProject = void 0;
const nanoid_1 = require("nanoid");
const now = () => Date.now();
const createSampleProject = () => ({
    id: (0, nanoid_1.nanoid)(10),
    title: 'New Story',
    logline: 'A dancer hunts a melody only she can hear across a dreaming city.',
    genre: 'Literary Fantasy',
    mood: 'dreamlike, romantic, uncanny',
    tags: ['draft', 'v0'],
    theme: {
        coreQuestion: 'What do we sacrifice to become who we are?',
        concepts: ['self vs duty', 'art vs survival'],
        motifs: ['moths', 'mirrors', 'trains at night'],
        conflicts: ['man vs self', 'man vs society']
    },
    style: {
        pov: 'third-limited',
        tense: 'past',
        voice: 'lyrical with dry humor',
        pacing: 'balanced',
        tone: 'wistful, electric',
        narrativeDevices: ['interludes', 'letters']
    },
    characters: [
        {
            id: (0, nanoid_1.nanoid)(10),
            name: 'Kakiko',
            role: 'Protagonist',
            archetype: 'Seeker',
            goal: 'Find the original melody',
            need: 'Accept imperfection',
            flaw: 'Perfectionism',
            backstory: 'Child prodigy who stopped performing after a stage accident.',
            relationships: ['Ishikawa (mentor/rival)'],
            tags: ['dancer', 'stubborn']
        }
    ],
    outline: [
        {
            id: (0, nanoid_1.nanoid)(10),
            title: 'Act I — Setup',
            summary: 'Introduce Kakiko, the city, and the missing melody.',
            chapters: [
                {
                    id: (0, nanoid_1.nanoid)(10),
                    title: 'Chapter 1: The Last Rehearsal',
                    summary: 'Kakiko hears a fragment in a subway station.',
                    beats: [
                        {
                            id: (0, nanoid_1.nanoid)(10),
                            type: 'Inciting Incident',
                            description: 'Stranger whistles the exact phrase from her dreams.',
                            stakes: 'If she ignores it, she may lose the trail forever.'
                        }
                    ]
                }
            ]
        }
    ],
    beats: [
        { id: (0, nanoid_1.nanoid)(10), type: 'Custom', description: 'Recurring image: a moth circling a rehearsal lamp.' }
    ],
    notes: 'Sketchy idea dump goes here.',
    createdAt: now(),
    updatedAt: now()
});
exports.createSampleProject = createSampleProject;
exports.db = {
    projects: [(0, exports.createSampleProject)()]
};
const touch = (p) => (Object.assign(Object.assign({}, p), { updatedAt: now() }));
exports.touch = touch;
