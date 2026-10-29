import { env } from '../config/env.js';
import { appPool } from '../db/pool.js';
import { runMigrations } from '../db/migrate.js';
import { LESSONS } from '../content/lessons.js';
import { hashPassword } from '../lib/password.js';
import { logger } from '../lib/logger.js';
import type { RowDataPacket } from 'mysql2/promise';

async function seedLessons(): Promise<void> {
  for (const lesson of LESSONS) {
    await appPool.execute(
      `INSERT INTO lessons (id, order_index, title, zone, content_json)
       VALUES (?, ?, ?, ?, ?) AS incoming
       ON DUPLICATE KEY UPDATE
         order_index = incoming.order_index,
         title = IF(lessons.is_custom = 0, incoming.title, lessons.title),
         zone = incoming.zone,
         content_json = IF(lessons.is_custom = 0, incoming.content_json, lessons.content_json)`,
      [lesson.id, lesson.order, lesson.title, lesson.zone, JSON.stringify(lesson)],
    );
  }
  logger.info('Lecciones sembradas', { count: LESSONS.length });
}

async function seedUser(params: {
  username: string;
  password: string;
  displayName: string;
  role: 'admin' | 'player';
  avatar: string;
}): Promise<void> {
  const [rows] = await appPool.execute<(RowDataPacket & { id: number })[]>(
    'SELECT id FROM users WHERE username = ?',
    [params.username],
  );
  if (rows.length > 0) {
    logger.info('Usuario ya existe, no se modifica', { username: params.username });
    return;
  }
  const hash = await hashPassword(params.password);
  await appPool.execute(
    'INSERT INTO users (username, password_hash, role, display_name, avatar) VALUES (?, ?, ?, ?, ?)',
    [params.username, hash, params.role, params.displayName, params.avatar],
  );
  logger.info('Usuario creado', { username: params.username, role: params.role });
}

export async function seed(): Promise<void> {
  await runMigrations();
  await seedLessons();

  await seedUser({
    username: env.ADMIN_USERNAME.toLocaleLowerCase('es'),
    password: env.ADMIN_PASSWORD,
    displayName: 'Profe Byte',
    role: 'admin',
    avatar: 'ajolote',
  });

  if (!env.isProduction) {
    // Cuenta de demostración SOLO para desarrollo local.
    await seedUser({
      username: 'explorador',
      password: 'Isla2026!',
      displayName: 'Explorador',
      role: 'player',
      avatar: 'dino',
    });
  }

  logger.info('Semilla completada');
}

const isDirectRun = process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js');
if (isDirectRun) {
  seed()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      logger.error('Error en la semilla', { error: String(error) });
      process.exit(1);
    });
}
