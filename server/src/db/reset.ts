import { env } from '../config/env.js';
import { appPool, labPool } from '../db/pool.js';
import { runMigrations } from '../db/migrate.js';
import { seed } from './seed.js';
import { logger } from '../lib/logger.js';

/**
 * Borra los datos de desarrollo y vuelve a sembrar. Nunca se ejecuta en
 * producción. No elimina las bases ni las tablas: solo sus filas.
 */
export async function resetDatabase(): Promise<void> {
  if (env.isProduction) {
    throw new Error('db:reset está deshabilitado cuando NODE_ENV=production.');
  }

  await runMigrations();

  const appTables = ['attempts', 'progress', 'badges', 'sessions', 'audit_log', 'lessons', 'users'];
  for (const table of appTables) {
    await appPool.query(`DELETE FROM ${table}`);
  }
  await labPool.query('DELETE FROM lab_auditoria');
  await labPool.query('DELETE FROM lab_juguetes');

  await seed();
  logger.info('Base de datos de desarrollo reiniciada');
}

const isDirectRun = process.argv[1]?.endsWith('reset.ts') || process.argv[1]?.endsWith('reset.js');
if (isDirectRun) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      logger.error('Error reiniciando la base de datos', { error: String(error) });
      process.exit(1);
    });
}
