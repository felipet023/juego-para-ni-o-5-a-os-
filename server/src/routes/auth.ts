import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';
import { env } from '../config/env.js';
import { appPool } from '../db/pool.js';
import { AppError, unauthorized } from '../lib/errors.js';
import { DUMMY_HASH, verifyPassword } from '../lib/password.js';
import { createSession, deleteSession } from '../lib/session.js';
import { requireAuth } from '../middleware/auth.js';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  display_name: string;
  avatar: string;
  role: 'player' | 'admin';
  is_active: number;
}

const loginSchema = z
  .object({
    username: z.string().trim().min(3, 'El nombre debe tener al menos 3 letras.').max(40),
    password: z.string().min(1).max(72),
  })
  .strict();

const loginLimiter = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'rate_limited',
        message: 'Demasiados intentos seguidos. Espera un momento y vuelve a probar.',
      },
    });
  },
});

export const authRouter = Router();

authRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const normalized = username.toLocaleLowerCase('es');

    const [rows] = await appPool.execute<UserRow[]>(
      'SELECT id, username, password_hash, display_name, avatar, role, is_active FROM users WHERE username = ? LIMIT 1',
      [normalized],
    );
    const user = rows[0];

    // Comparamos siempre, exista o no el usuario: misma latencia, mismo mensaje.
    const isValid = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !isValid || user.is_active !== 1) {
      throw new AppError(401, 'invalid_credentials', 'Usuario o clave incorrectos.');
    }

    const { token } = await createSession(user.id, req.get('user-agent'), req.ip);
    res.cookie(env.sessionCookieName, token, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: env.sessionTtlMs,
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const token = (req.cookies as Record<string, string> | undefined)?.[env.sessionCookieName];
    if (token) await deleteSession(token);
    res.clearCookie(env.sessionCookieName, { path: '/' });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', (req, res) => {
  if (!req.user) throw unauthorized();
  res.json({ user: req.user });
});

authRouter.get('/session', (req, res) => {
  res.json({ user: req.user ?? null });
});

authRouter.post('/session/refresh', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
