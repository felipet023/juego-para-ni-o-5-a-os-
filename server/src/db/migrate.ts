import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, '..', '..', 'db', 'migrations');

/**
 * Aplica las migraciones versionadas de la base principal.
 *
 * El esquema del laboratorio (`sqlquest_lab`) se crea con `db/setup.sql`
 * ejecutado por un administrador: la cuenta de la aplicación no tiene DDL
 * en esa base, y eso es intencional.
 */
export async function runMigrations(): Promise<void> {
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    // Solo la herramienta de migraciones puede enviar varias sentencias.
    multipleStatements: true,
    charset: 'utf8mb4',
    dateStrings: true,
  });

  try {
    await connection.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         id VARCHAR(120) NOT NULL PRIMARY KEY,
         applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
       ) ENGINE = InnoDB`,
    );

    const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();
    for (const file of files) {
      const [rows] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT id FROM schema_migrations WHERE id = ?',
        [file],
      );
      if (rows.length > 0) {
        logger.info('Migración ya aplicada', { database: env.DB_NAME, file });
        continue;
      }
      const sql = await readFile(join(migrationsDir, file), 'utf8');
      await connection.query(sql);
      await connection.query('INSERT INTO schema_migrations (id) VALUES (?)', [file]);
      logger.info('Migración aplicada', { database: env.DB_NAME, file });
    }
  } finally {
    await connection.end();
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  runMigrations()
    .then(() => {
      logger.info('Migraciones completadas');
      process.exit(0);
    })
    .catch((error: unknown) => {
      logger.error('Error ejecutando migraciones', { error: String(error) });
      process.exit(1);
    });
}
