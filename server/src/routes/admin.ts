import { Router } from 'express';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';
import { appPool } from '../db/pool.js';
import { writeAudit } from '../lib/audit.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { hashPassword } from '../lib/password.js';
import { deleteAllSessionsFor } from '../lib/session.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { LESSONS } from '../content/lessons.js';
import type { Lesson } from '../content/types.js';

const idParams = z.object({ id: z.coerce.number().int().positive() }).strict();
const lessonParams = z.object({ id: z.string().min(1).max(60) }).strict();

const createPlayerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Mínimo 3 caracteres.')
      .max(40)
      .regex(/^[a-z0-9._-]+$/i, 'Solo letras, números, punto, guion y guion bajo.'),
    displayName: z.string().trim().min(1).max(40),
    password: z.string().min(6, 'La clave debe tener al menos 6 caracteres.').max(72),
    avatar: z.enum(['ajolote', 'rana', 'tortuga', 'pulpo', 'estrella', 'dino']).default('ajolote'),
  })
  .strict();

const updatePlayerSchema = z.object({ isActive: z.boolean() }).strict();
const resetPasswordSchema = z.object({ password: z.string().min(6).max(72) }).strict();
const resetProgressSchema = z.object({ confirm: z.literal(true) }).strict();

const updateLessonSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    isActive: z.boolean().optional(),
    content: z.unknown().optional(),
  })
  .strict();

interface CountRow extends RowDataPacket {
  players: number;
  active_players: number;
  lessons_mastered: number;
  attempts: number;
  correct_attempts: number;
  sessions: number;
}

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/overview', async (_req, res, next) => {
  try {
    const [counts] = await appPool.query<CountRow[]>(
      `SELECT
         (SELECT COUNT(*) FROM users WHERE role = 'player') AS players,
         (SELECT COUNT(*) FROM users WHERE role = 'player' AND is_active = 1) AS active_players,
         (SELECT COUNT(*) FROM progress WHERE status = 'mastered') AS lessons_mastered,
         (SELECT COUNT(*) FROM attempts) AS attempts,
         (SELECT COUNT(*) FROM attempts WHERE is_correct = 1) AS correct_attempts,
         (SELECT COUNT(*) FROM sessions WHERE expires_at > NOW()) AS sessions`,
    );

    const [perLesson] = await appPool.query<
      (RowDataPacket & { id: string; title: string; is_active: number; mastered: number })[]
    >(
      `SELECT l.id, l.title, l.is_active,
              (SELECT COUNT(*) FROM progress p WHERE p.lesson_id = l.id AND p.status = 'mastered') AS mastered
         FROM lessons l
        ORDER BY l.order_index ASC`,
    );

    const [recent] = await appPool.query<
      (RowDataPacket & { username: string; lesson_id: string; step: string; is_correct: number; created_at: string })[]
    >(
      `SELECT u.username, a.lesson_id, a.step, a.is_correct, a.created_at
         FROM attempts a JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC
        LIMIT 15`,
    );

    const stats = counts[0];
    res.json({
      players: Number(stats?.players ?? 0),
      activePlayers: Number(stats?.active_players ?? 0),
      lessonsMastered: Number(stats?.lessons_mastered ?? 0),
      attempts: Number(stats?.attempts ?? 0),
      correctAttempts: Number(stats?.correct_attempts ?? 0),
      activeSessions: Number(stats?.sessions ?? 0),
      perLesson: perLesson.map((row) => ({
        id: row.id,
        title: row.title,
        isActive: row.is_active === 1,
        mastered: Number(row.mastered),
      })),
      recentAttempts: recent.map((row) => ({
        username: row.username,
        lessonId: row.lesson_id,
        step: row.step,
        correct: row.is_correct === 1,
        at: String(row.created_at),
      })),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/players', async (_req, res, next) => {
  try {
    const [rows] = await appPool.query<
      (RowDataPacket & {
        id: number;
        username: string;
        display_name: string;
        avatar: string;
        is_active: number;
        created_at: string;
        mastered: number;
        stars: number;
      })[]
    >(
      `SELECT u.id, u.username, u.display_name, u.avatar, u.is_active, u.created_at,
              (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.status = 'mastered') AS mastered,
              (SELECT COALESCE(SUM(p.stars), 0) FROM progress p WHERE p.user_id = u.id) AS stars
         FROM users u
        WHERE u.role = 'player'
        ORDER BY u.created_at ASC`,
    );
    res.json({
      players: rows.map((row) => ({
        id: row.id,
        username: row.username,
        displayName: row.display_name,
        avatar: row.avatar,
        isActive: row.is_active === 1,
        createdAt: String(row.created_at),
        mastered: Number(row.mastered),
        stars: Number(row.stars),
      })),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/players', async (req, res, next) => {
  try {
    const body = createPlayerSchema.parse(req.body);
    const username = body.username.toLocaleLowerCase('es');
    const passwordHash = await hashPassword(body.password);
    try {
      const [result] = await appPool.execute<import('mysql2/promise').ResultSetHeader>(
        `INSERT INTO users (username, password_hash, role, display_name, avatar)
         VALUES (?, ?, 'player', ?, ?)`,
        [username, passwordHash, body.displayName, body.avatar],
      );
      await writeAudit({
        actorId: req.user!.id,
        actorUsername: req.user!.username,
        action: 'player.create',
        targetType: 'user',
        targetId: String(result.insertId),
        meta: { username, displayName: body.displayName },
      });
      res.status(201).json({ id: result.insertId, username, displayName: body.displayName });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
        throw conflict('Ese nombre de jugador ya existe.');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/players/:id', async (req, res, next) => {
  try {
    const { id } = idParams.parse(req.params);
    const body = updatePlayerSchema.parse(req.body);
    const [result] = await appPool.execute<import('mysql2/promise').ResultSetHeader>(
      "UPDATE users SET is_active = ? WHERE id = ? AND role = 'player'",
      [body.isActive ? 1 : 0, id],
    );
    if (result.affectedRows === 0) throw notFound('No encontramos ese jugador.');
    if (!body.isActive) await deleteAllSessionsFor(id);
    await writeAudit({
      actorId: req.user!.id,
      actorUsername: req.user!.username,
      action: body.isActive ? 'player.activate' : 'player.deactivate',
      targetType: 'user',
      targetId: String(id),
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/players/:id/reset-password', async (req, res, next) => {
  try {
    const { id } = idParams.parse(req.params);
    const body = resetPasswordSchema.parse(req.body);
    const hash = await hashPassword(body.password);
    const [result] = await appPool.execute<import('mysql2/promise').ResultSetHeader>(
      "UPDATE users SET password_hash = ? WHERE id = ? AND role = 'player'",
      [hash, id],
    );
    if (result.affectedRows === 0) throw notFound('No encontramos ese jugador.');
    await deleteAllSessionsFor(id);
    await writeAudit({
      actorId: req.user!.id,
      actorUsername: req.user!.username,
      action: 'player.reset_password',
      targetType: 'user',
      targetId: String(id),
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/players/:id/reset-progress', async (req, res, next) => {
  try {
    const { id } = idParams.parse(req.params);
    resetProgressSchema.parse(req.body);
    const [users] = await appPool.execute<(RowDataPacket & { id: number })[]>(
      "SELECT id FROM users WHERE id = ? AND role = 'player'",
      [id],
    );
    if (users.length === 0) throw notFound('No encontramos ese jugador.');
    await appPool.execute('DELETE FROM progress WHERE user_id = ?', [id]);
    await appPool.execute('DELETE FROM attempts WHERE user_id = ?', [id]);
    await appPool.execute('DELETE FROM badges WHERE user_id = ?', [id]);
    await writeAudit({
      actorId: req.user!.id,
      actorUsername: req.user!.username,
      action: 'player.reset_progress',
      targetType: 'user',
      targetId: String(id),
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/lessons', async (_req, res, next) => {
  try {
    const [rows] = await appPool.query<
      (RowDataPacket & { id: string; order_index: number; title: string; zone: string; is_active: number; is_custom: number })[]
    >('SELECT id, order_index, title, zone, is_active, is_custom FROM lessons ORDER BY order_index ASC');
    res.json({
      lessons: rows.map((row) => ({
        id: row.id,
        order: Number(row.order_index),
        title: row.title,
        zone: row.zone,
        isActive: row.is_active === 1,
        isCustom: row.is_custom === 1,
      })),
    });
  } catch (error) {
    next(error);
  }
});

function looksLikeLesson(value: unknown): value is Lesson {
  if (!value || typeof value !== 'object') return false;
  const lesson = value as Partial<Lesson>;
  return (
    typeof lesson.id === 'string' &&
    typeof lesson.title === 'string' &&
    typeof lesson.order === 'number' &&
    Array.isArray(lesson.demo) &&
    Array.isArray(lesson.hints) &&
    lesson.hints.length === 3 &&
    Array.isArray(lesson.checks) &&
    lesson.checks.length === 3 &&
    typeof lesson.mission === 'object' &&
    lesson.mission !== null &&
    typeof lesson.practice === 'object' &&
    lesson.practice !== null
  );
}

adminRouter.patch('/lessons/:id', async (req, res, next) => {
  try {
    const { id } = lessonParams.parse(req.params);
    const body = updateLessonSchema.parse(req.body);
    const [existing] = await appPool.execute<(RowDataPacket & { id: string })[]>(
      'SELECT id FROM lessons WHERE id = ?',
      [id],
    );
    if (existing.length === 0) throw notFound('Esa lección no existe.');

    const sets: string[] = [];
    const values: (string | number)[] = [];

    if (body.title !== undefined) {
      sets.push('title = ?');
      values.push(body.title);
    }
    if (body.isActive !== undefined) {
      sets.push('is_active = ?');
      values.push(body.isActive ? 1 : 0);
    }
    if (body.content !== undefined) {
      if (!looksLikeLesson(body.content)) {
        throw badRequest('El contenido de la lección no tiene el formato esperado.');
      }
      if (body.content.id !== id) throw badRequest('El id del contenido no coincide con la lección.');
      sets.push('content_json = ?, is_custom = 1');
      values.push(JSON.stringify(body.content));
    }
    if (sets.length === 0) throw badRequest('No enviaste ningún cambio.');

    values.push(id);
    await appPool.execute(`UPDATE lessons SET ${sets.join(', ')} WHERE id = ?`, values);

    await writeAudit({
      actorId: req.user!.id,
      actorUsername: req.user!.username,
      action: 'lesson.update',
      targetType: 'lesson',
      targetId: id,
      meta: { fields: Object.keys(body) },
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/audit', async (_req, res, next) => {
  try {
    const [rows] = await appPool.query<
      (RowDataPacket & {
        id: number;
        actor_username: string | null;
        action: string;
        target_type: string | null;
        target_id: string | null;
        created_at: string;
      })[]
    >(
      `SELECT id, actor_username, action, target_type, target_id, created_at
         FROM audit_log ORDER BY created_at DESC LIMIT 100`,
    );
    res.json({
      entries: rows.map((row) => ({
        id: Number(row.id),
        actor: row.actor_username,
        action: row.action,
        targetType: row.target_type,
        targetId: row.target_id,
        at: String(row.created_at),
      })),
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/export', async (req, res, next) => {
  try {
    const [rows] = await appPool.query<
      (RowDataPacket & { username: string; display_name: string; mastered: number; stars: number })[]
    >(
      `SELECT u.username, u.display_name,
              (SELECT COUNT(*) FROM progress p WHERE p.user_id = u.id AND p.status = 'mastered') AS mastered,
              (SELECT COALESCE(SUM(p.stars), 0) FROM progress p WHERE p.user_id = u.id) AS stars
         FROM users u WHERE u.role = 'player' ORDER BY u.username ASC`,
    );
    const payload = {
      exportedAt: new Date().toISOString(),
      note: 'Datos mínimos y ficticios. No incluye contraseñas, sesiones ni datos personales.',
      players: rows.map((row) => ({
        username: row.username,
        displayName: row.display_name,
        lessonsMastered: Number(row.mastered),
        stars: Number(row.stars),
      })),
    };
    await writeAudit({
      actorId: req.user!.id,
      actorUsername: req.user!.username,
      action: 'data.export',
      targetType: 'report',
      meta: { players: payload.players.length },
    });
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sqlquest-progreso.json"');
    res.send(JSON.stringify(payload, null, 2));
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/content', (_req, res) => {
  res.json({
    lessons: LESSONS.map((lesson) => ({
      id: lesson.id,
      order: lesson.order,
      title: lesson.title,
      zone: lesson.zone,
      checks: lesson.checks.length,
    })),
  });
});
