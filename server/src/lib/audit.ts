import { appPool } from '../db/pool.js';
import { logger } from './logger.js';

export interface AuditEntry {
  actorId: number | null;
  actorUsername: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: Record<string, unknown>;
}

/** Registro de acciones administrativas. Nunca guarda secretos. */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    await appPool.execute(
      'INSERT INTO audit_log (actor_id, actor_username, action, target_type, target_id, meta_json) VALUES (?, ?, ?, ?, ?, ?)',
      [
        entry.actorId,
        entry.actorUsername,
        entry.action,
        entry.targetType ?? null,
        entry.targetId ?? null,
        entry.meta ? JSON.stringify(entry.meta) : null,
      ],
    );
  } catch (error) {
    // La auditoría nunca debe tumbar la operación principal, pero sí avisar.
    logger.error('audit_write_failed', { error: String(error), action: entry.action });
  }
}
