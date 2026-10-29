import type { RowDataPacket } from 'mysql2/promise';
import { appPool } from '../db/pool.js';
import { LESSONS } from '../content/lessons.js';
import type {
  Lesson,
  Mission,
  PublicMission,
  PublicQuizCheck,
  QueryResult,
} from '../content/types.js';
import { forbidden, notFound } from '../lib/errors.js';
import { evaluateMission, querySpecSchema, type MissionOutcome } from './missions.js';
import type { LabToy } from './lab.js';
import { evaluateQuery } from '../engine/queryEngine.js';

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'mastered';

export interface LessonProgressRow extends RowDataPacket {
  lesson_id: string;
  status: LessonStatus;
  stars: number;
  mission_done: number;
  practice_done: number;
  checks_passed: number;
  attempts_count: number;
  hints_used: number;
}

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

export interface PublicLessonState extends Omit<LessonState, 'mission' | 'practice' | 'checks'> {
  mission: PublicMission;
  practice: PublicMission;
  checks: PublicQuizCheck[];
}

export interface PublicGameState extends Omit<GameState, 'lessons'> {
  lessons: PublicLessonState[];
}

/** Copia la misión sin la respuesta correcta ni la explicación. */
function stripMission(mission: Mission): PublicMission {
  const clone: Record<string, unknown> = { ...mission };
  delete clone.correctId;
  delete clone.explanation;
  delete clone.target;
  delete clone.expected;
  delete clone.targetName;
  delete clone.expectedValue;
  return clone as unknown as PublicMission;
}

export function toPublicLesson(lesson: LessonState): PublicLessonState {
  const { mission, practice, checks, ...rest } = lesson;
  return {
    ...rest,
    mission: stripMission(mission),
    practice: stripMission(practice),
    checks: checks.map((check) => ({
      id: check.id,
      question: check.question,
      options: check.options,
    })),
  };
}

interface LessonRow extends RowDataPacket {
  id: string;
  order_index: number;
  title: string;
  zone: string;
  is_active: number;
  content_json: unknown;
}

function parseContent(raw: unknown): Lesson | null {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!value || typeof value !== 'object') return null;
    const lesson = value as Lesson;
    if (!lesson.id || !lesson.mission || !lesson.checks) return null;
    return lesson;
  } catch {
    return null;
  }
}

/** Contenido activo, leído de MySQL con respaldo en el código fuente. */
export async function getActiveLessons(): Promise<Lesson[]> {
  const [rows] = await appPool.query<LessonRow[]>(
    'SELECT id, order_index, title, zone, is_active, content_json FROM lessons ORDER BY order_index ASC',
  );
  if (rows.length === 0) return [...LESSONS].sort((a, b) => a.order - b.order);

  const lessons: Lesson[] = [];
  for (const row of rows) {
    if (row.is_active !== 1) continue;
    const lesson = parseContent(row.content_json);
    if (lesson) lessons.push({ ...lesson, order: row.order_index, title: row.title });
  }
  return lessons.sort((a, b) => a.order - b.order);
}

export async function getProgressRows(userId: number): Promise<Map<string, LessonProgressRow>> {
  const [rows] = await appPool.execute<LessonProgressRow[]>(
    'SELECT lesson_id, status, stars, mission_done, practice_done, checks_passed, attempts_count, hints_used FROM progress WHERE user_id = ?',
    [userId],
  );
  return new Map(rows.map((row) => [row.lesson_id, row]));
}

export function computeLessonStates(
  lessons: Lesson[],
  progress: Map<string, LessonProgressRow>,
): LessonState[] {
  let previousMastered = true;
  return lessons.map((lesson, index) => {
    const row = progress.get(lesson.id);
    const mastered = row?.status === 'mastered';
    const available = index === 0 ? true : previousMastered;
    const missionDone = row?.mission_done === 1;
    const practiceDone = row?.practice_done === 1;
    const status: LessonStatus = mastered
      ? 'mastered'
      : available
        ? missionDone
          ? 'in_progress'
          : 'available'
        : 'locked';
    const stars = mastered ? 3 : practiceDone ? 2 : missionDone ? 1 : 0;
    previousMastered = mastered;

    return {
      ...lesson,
      status,
      stars,
      missionDone,
      practiceDone,
      checksPassed: row?.checks_passed ?? 0,
      attempts: row?.attempts_count ?? 0,
      hintsUsed: row?.hints_used ?? 0,
    };
  });
}

export async function getGameState(userId: number): Promise<PublicGameState> {
  const [lessons, progress] = await Promise.all([getActiveLessons(), getProgressRows(userId)]);
  const states = computeLessonStates(lessons, progress);

  const [badgeRows] = await appPool.execute<(RowDataPacket & { badge_key: string; awarded_at: string })[]>(
    'SELECT badge_key, awarded_at FROM badges WHERE user_id = ? ORDER BY awarded_at ASC',
    [userId],
  );
  const badgeByKey = new Map(
    lessons.map((lesson) => [lesson.badge.key, { label: lesson.badge.label, emoji: lesson.badge.emoji }]),
  );
  const badges: BadgeState[] = badgeRows.map((row) => ({
    key: row.badge_key,
    label: badgeByKey.get(row.badge_key)?.label ?? 'Insignia',
    emoji: badgeByKey.get(row.badge_key)?.emoji ?? '⭐',
    awardedAt: String(row.awarded_at),
  }));

  const mastered = states.filter((lesson) => lesson.status === 'mastered').length;
  const stars = states.reduce((total, lesson) => total + lesson.stars, 0);
  const next = states.find((lesson) => lesson.status !== 'mastered' && lesson.status !== 'locked');

  return {
    lessons: states.map(toPublicLesson),
    badges,
    stats: {
      mastered,
      total: states.length,
      stars,
      maxStars: states.length * 3,
      nextLessonId: next?.id ?? null,
    },
  };
}

async function ensureProgressRow(userId: number, lessonId: string): Promise<void> {
  await appPool.execute(
    `INSERT INTO progress (user_id, lesson_id, status)
     VALUES (?, ?, 'available')
     ON DUPLICATE KEY UPDATE updated_at = updated_at`,
    [userId, lessonId],
  );
}

async function refreshProgress(userId: number, lessonId: string): Promise<LessonProgressRow> {
  const [rows] = await appPool.execute<LessonProgressRow[]>(
    'SELECT lesson_id, status, stars, mission_done, practice_done, checks_passed, attempts_count, hints_used FROM progress WHERE user_id = ? AND lesson_id = ?',
    [userId, lessonId],
  );
  const row = rows[0];
  if (!row) throw notFound('No encontramos tu progreso.');
  return row;
}

export async function getLessonForUser(
  userId: number,
  lessonId: string,
): Promise<{ lesson: Lesson; state: LessonState; lessons: LessonState[] }> {
  const [lessons, progress] = await Promise.all([getActiveLessons(), getProgressRows(userId)]);
  const states = computeLessonStates(lessons, progress);
  const state = states.find((item) => item.id === lessonId);
  if (!state) throw notFound('Esa lección no existe o está desactivada.');
  if (state.status === 'locked') {
    throw forbidden('Primero completa la misión anterior para abrir esta zona.');
  }
  return { lesson: state, state, lessons: states };
}

export interface AttemptResult extends MissionOutcome {
  stars: number;
  status: LessonStatus;
  checksPassed: number;
  mastered: boolean;
  nextLessonId: string | null;
  badge?: { key: string; label: string; emoji: string };
}

export async function recordAttempt(params: {
  userId: number;
  lessonId: string;
  step: 'mission' | 'practice';
  answer: unknown;
}): Promise<AttemptResult> {
  const { userId, lessonId, step, answer } = params;
  const { lesson, state, lessons } = await getLessonForUser(userId, lessonId);
  if (step === 'practice' && !state.missionDone) {
    throw forbidden('Primero completa la misión y después practica.');
  }
  const mission = step === 'mission' ? lesson.mission : lesson.practice;

  const outcome = await evaluateMission({ lesson, mission, answer, userId });

  await ensureProgressRow(userId, lessonId);
  await appPool.execute(
    'INSERT INTO attempts (user_id, lesson_id, step, is_correct, answer_json) VALUES (?, ?, ?, ?, ?)',
    [userId, lessonId, step, outcome.correct ? 1 : 0, JSON.stringify(answer ?? null)],
  );

  if (outcome.correct) {
    if (step === 'mission') {
      await appPool.execute(
        'UPDATE progress SET mission_done = 1, status = IF(status = "mastered", "mastered", "in_progress"), stars = GREATEST(stars, 1), attempts_count = attempts_count + 1 WHERE user_id = ? AND lesson_id = ?',
        [userId, lessonId],
      );
    } else {
      await appPool.execute(
        'UPDATE progress SET practice_done = 1, status = IF(status = "mastered", "mastered", "in_progress"), stars = GREATEST(stars, 2), attempts_count = attempts_count + 1 WHERE user_id = ? AND lesson_id = ?',
        [userId, lessonId],
      );
    }
  } else {
    await appPool.execute(
      'UPDATE progress SET attempts_count = attempts_count + 1 WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId],
    );
  }

  const row = await refreshProgress(userId, lesson.id);
  const lessonIndex = lessons.findIndex((item) => item.id === lessonId);

  return {
    ...outcome,
    stars: row.stars,
    status: row.status,
    checksPassed: row.checks_passed,
    mastered: row.status === 'mastered',
    nextLessonId: row.status === 'mastered' ? (lessons[lessonIndex + 1]?.id ?? null) : null,
    badge: row.status === 'mastered' ? lesson.badge : undefined,
  };
}

export async function recordCheck(params: {
  userId: number;
  lessonId: string;
  index: number;
  optionId: string;
}): Promise<{
  correct: boolean;
  explanation: string;
  checksPassed: number;
  mastered: boolean;
  stars: number;
  badge?: { key: string; label: string; emoji: string };
}> {
  const { userId, lessonId, index, optionId } = params;
  const { lesson, state } = await getLessonForUser(userId, lessonId);
  if (!state.missionDone || !state.practiceDone) {
    throw forbidden('Primero completa la misión y la práctica de esta lección.');
  }
  const check = lesson.checks[index];
  if (!check) throw notFound('Esa pregunta no existe.');

  const correct = check.correctId === optionId;
  await ensureProgressRow(userId, lessonId);

  if (correct) {
    // Máscara de bits: 3 preguntas → valores 1, 2, 4.
    await appPool.execute(
      'UPDATE progress SET checks_passed = checks_passed | ? WHERE user_id = ? AND lesson_id = ?',
      [1 << index, userId, lessonId],
    );
  }

  const row = await refreshProgress(userId, lessonId);
  const allPassed = (row.checks_passed & 0b111) === 0b111;

  if (allPassed && row.status !== 'mastered') {
    await appPool.execute(
      'UPDATE progress SET status = "mastered", stars = 3 WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId],
    );
    await appPool.execute(
      'INSERT INTO badges (user_id, badge_key) VALUES (?, ?) ON DUPLICATE KEY UPDATE awarded_at = awarded_at',
      [userId, lesson.badge.key],
    );
  }

  const updated = await refreshProgress(userId, lessonId);
  return {
    correct,
    explanation: check.explanation,
    checksPassed: updated.checks_passed,
    mastered: updated.status === 'mastered',
    stars: updated.stars,
    badge: updated.status === 'mastered' ? lesson.badge : undefined,
  };
}

export async function recordHint(userId: number, lessonId: string): Promise<{ hintsUsed: number }> {
  await getLessonForUser(userId, lessonId);
  await ensureProgressRow(userId, lessonId);
  await appPool.execute(
    'UPDATE progress SET hints_used = LEAST(hints_used + 1, 3) WHERE user_id = ? AND lesson_id = ?',
    [userId, lessonId],
  );
  const row = await refreshProgress(userId, lessonId);
  return { hintsUsed: row.hints_used };
}

export interface QueryPreview {
  result: QueryResult;
}

export async function previewQuery(query: unknown): Promise<QueryPreview> {
  const parsed = querySpecSchema.parse(query);
  return { result: evaluateQuery(parsed) };
}

export type { LabToy };
