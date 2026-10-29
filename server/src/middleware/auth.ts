import type { Request, RequestHandler, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { forbidden, unauthorized } from '../lib/errors.js';
import { findSessionUser, type AuthUser } from '../lib/session.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function readSessionToken(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.[env.sessionCookieName];
}

/** Carga el usuario si hay sesión válida; nunca falla por no tenerla. */
export const attachUser: RequestHandler = async (req, _res, next) => {
  try {
    const token = readSessionToken(req);
    if (!token) return next();
    const user = await findSessionUser(token);
    if (user) req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  return next();
};

export function requireRole(role: 'admin' | 'player'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (req.user.role !== role) {
      // El rol SIEMPRE viene de la base de datos, nunca del cliente.
      return next(forbidden('Esta zona es solo para administradores.'));
    }
    return next();
  };
}
