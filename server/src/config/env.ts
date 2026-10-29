import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

// El proyecto usa un único `.env` en la raíz. Los scripts de npm se ejecutan
// con cwd = server/, así que probamos ambas ubicaciones.
for (const candidate of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '..', '.env')]) {
  if (existsSync(candidate)) {
    loadDotenv({ path: candidate });
    break;
  }
}

const booleanish = z
  .enum(['true', 'false', '1', '0'])
  .transform((value) => value === 'true' || value === '1');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  APP_ORIGIN: z.string().url().default('http://localhost:5173'),

  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1).default('sqlquest_app'),
  LAB_DB_NAME: z.string().min(1).default('sqlquest_lab'),

  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET debe tener al menos 32 caracteres'),

  ADMIN_USERNAME: z.string().min(3).max(40).default('profe'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD debe tener al menos 8 caracteres'),

  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  LOGIN_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),

  TRUST_PROXY: booleanish.default(false),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Fallar de forma segura y explícita: nunca arrancar con configuración a medias.
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error(
    `\n[SQLQuest] Configuración inválida o incompleta.\n${details}\n\n` +
      `Revisa tu archivo .env (puedes copiar .env.example).\n`,
  );
  process.exit(1);
}

export const env = Object.freeze({
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
  sessionCookieName: 'sq_session',
  sessionTtlMs: 7 * 24 * 60 * 60 * 1000,
});

export type Env = typeof env;
