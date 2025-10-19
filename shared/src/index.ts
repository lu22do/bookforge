export type ID = string;

export type Theme = {
  coreQuestion: string;
  concepts: string[];
  motifs: string[];
  conflicts: string[];
};

export type Style = {
  pov: "first" | "second" | "third-limited" | "third-omniscient" | "multi";
  tense: "past" | "present" | "future";
  voice: string;
  pacing: "slow-burn" | "balanced" | "fast";
  tone: string;
  narrativeDevices: string[];
};

export type BeatType =
  | "Inciting Incident"
  | "Key Decision"
  | "Pinch Point"
  | "Midpoint Reversal"
  | "Dark Night"
  | "Climax"
  | "Resolution"
  | "Custom";

export type Beat = {
  id: ID;
  type: BeatType;
  description: string;
  stakes?: string;
  setting?: string;
  charactersInvolved?: ID[];
  notes?: string;
};

export type Chapter = {
  id: ID;
  title: string;
  summary?: string;
  beats: Beat[];
};

export type OutlineSection = {
  id: ID;
  title: string;
  summary?: string;
  chapters: Chapter[];
};

export type Character = {
  id: ID;
  name: string;
  role: string;
  archetype?: string;
  goal?: string;
  need?: string;
  flaw?: string;
  backstory?: string;
  relationships?: string[];
  tags?: string[];
};

export type Project = {
  id: ID;
  title: string;
  logline?: string;
  genre?: string;
  mood?: string;
  tags?: string[];
  theme: Theme;
  style: Style;
  characters: Character[];
  outline: OutlineSection[];
  beats: Beat[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
};
