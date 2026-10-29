import mysql, { type Pool, type PoolOptions } from 'mysql2/promise';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

function baseOptions(database: string): PoolOptions {
  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database,
    waitForConnections: true,
    connectionLimit: env.isTest ? 4 : 10,
    maxIdle: 5,
    idleTimeout: 60_000,
    charset: 'utf8mb4',
    // Sin multiStatements: una sola sentencia por consulta (defensa contra inyección).
    multipleStatements: false,
    // Devolvemos DATE/DECIMAL como tipos JS predecibles.
    dateStrings: true,
    decimalNumbers: true,
    timezone: 'Z',
  };
}

/** Pool principal: cuentas, contenido y progreso. */
export const appPool: Pool = mysql.createPool(baseOptions(env.DB_NAME));

/**
 * Pool del laboratorio infantil. Apunta a una base separada y la cuenta de
 * aplicación solo tiene SELECT/INSERT/UPDATE/DELETE allí (sin DDL).
 */
export const labPool: Pool = mysql.createPool(baseOptions(env.LAB_DB_NAME));

export async function closePools(): Promise<void> {
  await Promise.allSettled([appPool.end(), labPool.end()]);
}

export async function assertDatabaseReady(): Promise<void> {
  const [rows] = await appPool.query<mysql.RowDataPacket[]>('SELECT 1 AS ok');
  if (rows[0]?.ok !== 1) throw new Error('La base de datos no respondió.');
  logger.info('Conexión MySQL verificada', { database: env.DB_NAME, host: env.DB_HOST });
}
