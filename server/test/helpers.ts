import type { ResultSetHeader } from 'mysql2/promise';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { LESSONS } from '../src/content/lessons.js';
import type { Mission } from '../src/content/types.js';
import { appPool, labPool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';
import { hashPassword } from '../src/lib/password.js';
import { matchingLeftIds } from '../src/engine/queryEngine.js';

export const app = createApp();

/** Base limpia + las 13 lecciones reales. */
export async function resetDatabase(): Promise<void> {
  await runMigrations();

  // Orden hijo → padre para respetar las claves foráneas.
  for (const table of ['audit_log', 'badges', 'attempts', 'progress', 'sessions', 'lessons', 'users']) {
    await appPool.query(`DELETE FROM \`${table}\``);
  }
  await labPool.query('DELETE FROM lab_juguetes');
  await labPool.query('DELETE FROM lab_auditoria');

  for (const lesson of LESSONS) {
    await appPool.execute(
      'INSERT INTO lessons (id, order_index, title, zone, content_json) VALUES (?, ?, ?, ?, ?)',
      [lesson.id, lesson.order, lesson.title, lesson.zone, JSON.stringify(lesson)],
    );
  }
}

export async function createUser(params: {
  username: string;
  password: string;
  role?: 'player' | 'admin';
  displayName?: string;
  avatar?: string;
  isActive?: boolean;
}): Promise<number> {
  const hash = await hashPassword(params.password);
  const [result] = await appPool.execute<ResultSetHeader>(
    `INSERT INTO users (username, password_hash, role, display_name, avatar, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      params.username,
      hash,
      params.role ?? 'player',
      params.displayName ?? params.username,
      params.avatar ?? 'ajolote',
      params.isActive === false ? 0 : 1,
    ],
  );
  return Number(result.insertId);
}

export async function loginAgent(username: string, password: string) {
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ username, password }).expect(200);
  return agent;
}

/** Respuesta correcta para cualquier tipo de misión (solo para pruebas). */
export function correctAnswer(mission: Mission): unknown {
  switch (mission.kind) {
    case 'choice':
      return { optionId: mission.correctId };
    case 'pick-cell':
      return { row: mission.target.row, column: mission.target.column };
    case 'build-query':
      return { query: mission.expected };
    case 'join-match': {
      const { matched } = matchingLeftIds(
        mission.leftTable,
        mission.rightTable,
        mission.leftKey,
        mission.rightKey,
      );
      return { ids: matched };
    }
    case 'lab-action':
      if (mission.action === 'insert') return mission.expected;
      if (mission.action === 'update') {
        return {
          targetName: mission.targetName,
          field: mission.field,
          value: mission.expectedValue,
        };
      }
      return { targetName: mission.targetName };
    default:
      throw new Error('Misión desconocida');
  }
}

export function lessonById(id: string) {
  const lesson = LESSONS.find((item) => item.id === id);
  if (!lesson) throw new Error(`Lección no encontrada: ${id}`);
  return lesson;
}

export async function markMastered(userId: number, lessonId: string): Promise<void> {
  await appPool.execute(
    `INSERT INTO progress (user_id, lesson_id, status, stars, mission_done, practice_done, checks_passed)
     VALUES (?, ?, 'mastered', 3, 1, 1, 7)
     ON DUPLICATE KEY UPDATE status = 'mastered', stars = 3, mission_done = 1, practice_done = 1, checks_passed = 7`,
    [userId, lessonId],
  );
}

/** Marca como dominadas todas las lecciones anteriores, para probar zonas avanzadas. */
export async function unlockLesson(userId: number, lessonId: string): Promise<void> {
  const target = lessonById(lessonId);
  for (const lesson of LESSONS.filter((item) => item.order < target.order)) {
    await markMastered(userId, lesson.id);
  }
}

export { LESSONS };
