export const tracks = {
  python: 'Python',
  dsa: 'Data structures',
  sql: 'SQL',
} as const;

export type Track = keyof typeof tracks;
export type Mode = 'explorer' | 'builder' | 'pro';

export type Question = {
  prompt: string;
  options: [string, string, string];
  answer: 0 | 1 | 2;
  hint: string;
  explain: string;
};

export type Lesson = {
  id: string;
  track: Track;
  title: string;
  subtitle: string;
  minutes: number;
  explanations: Record<Mode, string>;
  remember: string[];
  mistake: string;
  detail: {title: string; body: string};
  questions: [Question, Question];
  recall: {term: string; answer: string};
};

type Tone = 'active' | 'done' | 'muted';
export type Cell = {value: string | number; top?: string | number; bottom?: string | number; tone?: Tone};
export type Table = {title: string; headers: string[]; rows: (string | number)[][]; active?: number[]};
export type Scene =
  | {kind: 'cells'; title: string; cells: Cell[]; note?: string; metrics?: {label: string; value: string | number}[]}
  | {kind: 'bars'; title: string; cells: Cell[]}
  | {kind: 'chain'; title: string; cells: Cell[]}
  | {kind: 'tree'; title: string; active?: string; visited: string[]}
  | {kind: 'tables'; tables: Table[]};

export type Frame = {line: number; caption: string; scene: Scene};
export type Trace = {code: string[]; frames: Frame[]};
