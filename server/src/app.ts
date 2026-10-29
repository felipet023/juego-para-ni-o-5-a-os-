import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import { env } from './config/env.js';
import { attachUser } from './middleware/auth.js';
import {
  corsMiddleware,
  errorHandler,
  notFoundHandler,
  requestLogger,
  sameOriginGuard,
  securityHeaders,
} from './middleware/security.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { gameRouter } from './routes/game.js';
import { healthRouter } from './routes/health.js';

const here = dirname(fileURLToPath(import.meta.url));
const clientDist = join(here, '..', '..', 'client', 'dist');
const clientIndex = join(clientDist, 'index.html');

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  if (env.TRUST_PROXY) app.set('trust proxy', 1);

  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(sameOriginGuard);
  app.use(requestLogger);
  app.use(attachUser);

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/game', gameRouter);
  app.use('/api/admin', adminRouter);

  // En producción el mismo servidor entrega el juego compilado.
  if (existsSync(clientIndex)) {
    app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      res.sendFile(clientIndex);
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
