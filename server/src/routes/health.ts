import { Router } from 'express';
import { env } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'sqlquest-api',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.round(process.uptime()),
    time: new Date().toISOString(),
  });
});
