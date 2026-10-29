import { createHash, randomBytes } from 'node:crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { env } from '../config/env.js';
import { appPool } from '../db/pool.js';

export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  role: 'player' | 'admin';
}

interface SessionRow extends RowDataPacket {
  user_id: number;
  username: string;
  display_name: string;
  avatar: string;
  role: 'player' | 'admin';
  is_active: number;
  expires_at: string;
}

/** El token nunca se guarda en claro: solo su SHA-256. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;
  return createHash('sha256').update(`${env.SESSION_SECRET}:${ip}`).digest('hex');
}

export async function createSession(
  userId: number,
  userAgent: string | undefined,
  ip: string | undefined,
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + env.sessionTtlMs);
  await appPool.execute(
    'INSERT INTO sessions (token_hash, user_id, expires_at, user_agent, ip_hash) VALUES (?, ?, ?, ?, ?)',
    [hashToken(token), userId, expiresAt, (userAgent ?? '').slice(0, 255), hashIp(ip)],
  );
  return { token, expiresAt };
}

export async function findSessionUser(token: string): Promise<AuthUser | null> {
  const [rows] = await appPool.execute<SessionRow[]>(
    `SELECT s.user_id, s.expires_at, u.username, u.display_name, u.avatar, u.role, u.is_active
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
      LIMIT 1`,
    [hashToken(token)],
  );
  const row = rows[0];
  if (!row) return null;
  if (row.is_active !== 1) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await deleteSession(token);
    return null;
  }
  return {
    id: row.user_id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar,
    role: row.role,
  };
}

export async function deleteSession(token: string): Promise<void> {
  await appPool.execute('DELETE FROM sessions WHERE token_hash = ?', [hashToken(token)]);
}

export async function deleteAllSessionsFor(userId: number): Promise<void> {
  await appPool.execute('DELETE FROM sessions WHERE user_id = ?', [userId]);
}

export async function purgeExpiredSessions(): Promise<number> {
  const [result] = await appPool.execute<import('mysql2/promise').ResultSetHeader>(
    'DELETE FROM sessions WHERE expires_at <= NOW()',
  );
  return result.affectedRows;
}
