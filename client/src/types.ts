export type ZoneId =
  | 'playa'
  | 'pueblo'
  | 'taller'
  | 'cueva'
  | 'bosque'
  | 'puente'
  | 'laboratorio'
  | 'castillo'
  | 'templo';

export type ColumnType = 'texto' | 'numero' | 'fecha';

export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
}

export interface TableSnapshot {
  columns: { key: string; label: string; type?: string }[];
  rows: (string | number)[][];
}

export type WhereOp = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE';

export interface QuerySpec {
  select: string[];
  from: string;
  where?: { column: string; op: WhereOp; value: string };
  orderBy?: { column: string; dir: 'ASC' | 'DESC' };
  limit?: number;
  join?: { table: string; leftColumn: string; rightColumn: string };
}

export interface QueryResult {
  columns: { key: string; label: string }[];
  rows: (string | number)[][];
  sql: string;
  total: number;
  truncated: boolean;
}

export interface DemoStep {
  title: string;
  text: string;
  sql?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  emoji?: string;
}

export interface ChoiceMission {
  kind: 'choice';
  prompt: string;
  options: ChoiceOption[];
  /** El servidor no envía la respuesta correcta al navegador. */
  correctId?: string;
  explanation?: string;
}

export interface PickCellMission {
  kind: 'pick-cell';
  prompt: string;
  table: string;
  target?: { row: number; column: string };
  explanation?: string;
}

export interface BuildQueryMission {
  kind: 'build-query';
  prompt: string;
  table: string;
  expected?: QuerySpec;
  allowed: {
    columns: string[];
    where?: { columns: string[]; ops: WhereOp[] };
    orderBy?: string[];
    limit?: number[];
    join?: { table: string; leftColumn: string; rightColumn: string };
  };
  explanation?: string;
}

export interface JoinMatchMission {
  kind: 'join-match';
  prompt: string;
  leftTable: string;
  rightTable: string;
  leftKey: string;
  rightKey: string;
  explanation?: string;
}

export type LabMission =
  | {
      kind: 'lab-action';
      prompt: string;
      action: 'insert';
      expected?: { nombre: string; tipo: string; color: string; precio: number };
      explanation?: string;
    }
  | {
      kind: 'lab-action';
      prompt: string;
      action: 'update';
      targetName?: string;
      field: 'color' | 'precio';
      expectedValue?: string | number;
      explanation?: string;
    }
  | {
      kind: 'lab-action';
      prompt: string;
      action: 'delete';
      targetName?: string;
      explanation?: string;
    };

export type Mission = ChoiceMission | PickCellMission | BuildQueryMission | JoinMatchMission | LabMission;

export interface QuizCheck {
  id: string;
  question: string;
  options: ChoiceOption[];
  correctId?: string;
  explanation?: string;
}

export interface Lesson {
  id: string;
  order: number;
  title: string;
  zone: ZoneId;
  concept: string;
  objective: string;
  analogy: string;
  demo: DemoStep[];
  mission: Mission;
  practice: Mission;
  hints: [string, string, string];
  successMessage: string;
  errorFeedback: string;
  checks: [QuizCheck, QuizCheck, QuizCheck];
  badge: { key: string; label: string; emoji: string };
}

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'mastered';

export interface LessonState extends Lesson {
  status: LessonStatus;
  stars: number;
  missionDone: boolean;
  practiceDone: boolean;
  checksPassed: number;
  attempts: number;
  hintsUsed: number;
}

export interface BadgeState {
  key: string;
  label: string;
  emoji: string;
  awardedAt: string;
}

export interface GameState {
  lessons: LessonState[];
  badges: BadgeState[];
  stats: {
    mastered: number;
    total: number;
    stars: number;
    maxStars: number;
    nextLessonId: string | null;
  };
}

export interface User {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  role: 'player' | 'admin';
}

export interface LabToy {
  id: number;
  nombre: string;
  tipo: string;
  color: string;
  precio: number;
}

export interface AttemptResult {
  correct: boolean;
  feedback: string;
  sql?: string;
  result?: QueryResult;
  lab?: LabToy[];
  matchedIds?: number[];
  unmatchedIds?: number[];
  stars: number;
  status: LessonStatus;
  checksPassed: number;
  mastered: boolean;
  nextLessonId: string | null;
  badge?: { key: string; label: string; emoji: string };
}

export interface CheckResult {
  correct: boolean;
  explanation: string;
  checksPassed: number;
  mastered: boolean;
  stars: number;
  badge?: { key: string; label: string; emoji: string };
}

export interface AdminOverview {
  players: number;
  activePlayers: number;
  lessonsMastered: number;
  attempts: number;
  correctAttempts: number;
  activeSessions: number;
  perLesson: { id: string; title: string; isActive: boolean; mastered: number }[];
  recentAttempts: { username: string; lessonId: string; step: string; correct: boolean; at: string }[];
}

export interface AdminPlayer {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  isActive: boolean;
  createdAt: string;
  mastered: number;
  stars: number;
}

export interface AdminLesson {
  id: string;
  order: number;
  title: string;
  zone: string;
  isActive: boolean;
  isCustom: boolean;
}

export interface AuditEntry {
  id: number;
  actor: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  at: string;
}
