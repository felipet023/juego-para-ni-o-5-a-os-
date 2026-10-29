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

export interface TableDef {
  name: string;
  label: string;
  columns: ColumnDef[];
  primaryKey: string;
  rows: Record<string, string | number>[];
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
  correctId: string;
  explanation: string;
}

export interface PickCellMission {
  kind: 'pick-cell';
  prompt: string;
  table: string;
  /** Índice de fila (0-based) y clave de columna que el niño debe tocar. */
  target: { row: number; column: string };
  explanation: string;
}

export interface BuildQueryMission {
  kind: 'build-query';
  prompt: string;
  table: string;
  expected: QuerySpec;
  allowed: {
    columns: string[];
    where?: { columns: string[]; ops: WhereOp[] };
    orderBy?: string[];
    limit?: number[];
    join?: { table: string; leftColumn: string; rightColumn: string };
  };
  explanation: string;
}

export interface JoinMatchMission {
  kind: 'join-match';
  prompt: string;
  leftTable: string;
  rightTable: string;
  leftKey: string;
  rightKey: string;
  explanation: string;
}

export type LabMission =
  | {
      kind: 'lab-action';
      prompt: string;
      action: 'insert';
      expected: { nombre: string; tipo: string; color: string; precio: number };
      explanation: string;
    }
  | {
      kind: 'lab-action';
      prompt: string;
      action: 'update';
      targetName: string;
      field: 'color' | 'precio';
      expectedValue: string | number;
      explanation: string;
    }
  | {
      kind: 'lab-action';
      prompt: string;
      action: 'delete';
      targetName: string;
      explanation: string;
    };

export type Mission = ChoiceMission | PickCellMission | BuildQueryMission | JoinMatchMission | LabMission;

export interface QuizCheck {
  id: string;
  question: string;
  options: ChoiceOption[];
  correctId: string;
  explanation: string;
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

export interface Zone {
  id: ZoneId;
  name: string;
  subtitle: string;
  emoji: string;
  color: string;
  position: [number, number];
  firstLessonOrder: number;
}

/**
 * Versión "pública" de una misión: la que viaja al navegador.
 * Nunca incluye la respuesta correcta (correctId, expected, target…).
 * El servidor es la única autoridad para decidir si el niño acertó.
 */
type PublicMissionOf<T> = T extends { kind: 'choice' }
  ? Omit<T, 'correctId' | 'explanation'>
  : T extends { kind: 'pick-cell' }
    ? Omit<T, 'target' | 'explanation'>
    : T extends { kind: 'build-query' }
      ? Omit<T, 'expected' | 'explanation'>
      : T extends { kind: 'join-match' }
        ? Omit<T, 'explanation'>
        : T extends { kind: 'lab-action' }
          ? Omit<T, 'explanation' | 'expected' | 'targetName' | 'expectedValue'>
          : never;

export type PublicMission = PublicMissionOf<Mission>;

export interface PublicQuizCheck {
  id: string;
  question: string;
  options: ChoiceOption[];
}

export interface PublicLesson extends Omit<Lesson, 'mission' | 'practice' | 'checks'> {
  mission: PublicMission;
  practice: PublicMission;
  checks: PublicQuizCheck[];
}
