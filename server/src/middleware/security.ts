import cors from 'cors';
import helmet from 'helmet';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env.js';
import { AppError, forbidden } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { ZodError } from 'zod';

const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'blob:'],
  fontSrc: ["'self'", 'data:'],
  connectSrc: ["'self'"],
  mediaSrc: ["'self'", 'data:', 'blob:'],
  workerSrc: ["'self'", 'blob:'],
  objectSrc: ["'none'"],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
};

export const securityHeaders: RequestHandler = helmet({
  // En desarrollo el frontend lo sirve Vite y la CSP estorbaría al HMR.
  contentSecurityPolicy: env.isProduction ? { directives: CSP_DIRECTIVES } : false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
});

export const corsMiddleware = cors({
  origin: env.APP_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 600,
});

/**
 * Defensa CSRF en profundidad: además de SameSite=Lax, exigimos que el
 * Origin de toda petición que modifica datos sea exactamente el nuestro.
 */
export const sameOriginGuard: RequestHandler = (req, _res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();

  const origin = req.headers.origin;
  if (!origin) {
    // Los navegadores modernos siempre envían Origin en POST/PATCH/DELETE.
    // En producción rechazamos lo que no lo traiga; en desarrollo y tests
    // permitimos herramientas locales (curl, supertest).
    if (env.isProduction) return next(forbidden('Origen de la petición no permitido.'));
    return next();
  }
  if (origin !== env.APP_ORIGIN) return next(forbidden('Origen de la petición no permitido.'));
  return next();
};

export const requestLogger: RequestHandler = (req, res, next) => {
  if (env.isTest) return next();
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - startedAt) / 1e6;
    logger.debug('http', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Math.round(ms),
    });
  });
  return next();
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'not_found', message: 'Ese camino no existe.' } });
};

interface ClientBodyError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
}

/** Reconoce los errores que lanza express.json() con JSON inválido o demasiado grande. */
function isClientBodyError(error: unknown): error is ClientBodyError {
  if (!(error instanceof Error)) return false;
  if (!('status' in error) && !('statusCode' in error)) return false;
  const candidate = error as ClientBodyError;
  const status = candidate.statusCode ?? candidate.status ?? 0;
  return status >= 400 && status < 500;
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Revisa los datos: hay algo que no encaja.',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof AppError) {
    if (error.status >= 500) logger.error(error.code, { message: error.message });
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.publicMessage,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    });
    return;
  }

  // Errores del lector de JSON (body-parser): no son fallos del servidor.
  if (isClientBodyError(error)) {
    const status = error.statusCode ?? error.status ?? 400;
    if (status === 413) {
      res.status(413).json({
        error: { code: 'payload_too_large', message: 'El mensaje es demasiado grande.' },
      });
      return;
    }
    res.status(400).json({
      error: { code: 'bad_request', message: 'No pudimos leer los datos enviados.' },
    });
    return;
  }

  // Nunca filtramos detalles internos al cliente.
  logger.error('unhandled_error', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  res.status(500).json({
    error: { code: 'server_error', message: 'Algo falló en la isla. Inténtalo otra vez.' },
  });
};
