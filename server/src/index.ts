import { createApp } from './app.js';
import { env } from './config/env.js';
import { assertDatabaseReady, closePools } from './db/pool.js';
import { purgeExpiredSessions } from './lib/session.js';
import { logger } from './lib/logger.js';

const app = createApp();

try {
  await assertDatabaseReady();
  const purged = await purgeExpiredSessions();
  if (purged > 0) logger.info('Sesiones caducadas eliminadas', { purged });
} catch (error) {
  logger.error('No se pudo conectar con MySQL al arrancar', { error: String(error) });
  process.exit(1);
}

const server = app.listen(env.PORT, () => {
  logger.info('SQLQuest API escuchando', {
    port: env.PORT,
    origin: env.APP_ORIGIN,
    environment: env.NODE_ENV,
  });
});

async function shutdown(signal: string): Promise<void> {
  logger.info('Cerrando servidor', { signal });
  server.close(async () => {
    await closePools();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
