import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { labPool } from '../db/pool.js';
import { LAB_SEED_TOYS } from '../content/datasets.js';
import { badRequest, notFound } from '../lib/errors.js';

export interface LabToy {
  id: number;
  nombre: string;
  tipo: string;
  color: string;
  precio: number;
}

interface LabRow extends RowDataPacket {
  id: number;
  nombre: string;
  tipo: string;
  color: string;
  precio: number;
}

function toToy(row: LabRow): LabToy {
  return {
    id: Number(row.id),
    nombre: row.nombre,
    tipo: row.tipo,
    color: row.color,
    precio: Number(row.precio),
  };
}

export async function getLabToys(userId: number): Promise<LabToy[]> {
  const [rows] = await labPool.execute<LabRow[]>(
    'SELECT id, nombre, tipo, color, precio FROM lab_juguetes WHERE player_id = ? ORDER BY id ASC',
    [userId],
  );
  return rows.map(toToy);
}

export async function ensureLabSeeded(userId: number): Promise<LabToy[]> {
  const existing = await getLabToys(userId);
  if (existing.length > 0) return existing;
  return resetLab(userId);
}

export async function resetLab(userId: number): Promise<LabToy[]> {
  const connection = await labPool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM lab_juguetes WHERE player_id = ?', [userId]);
    for (const toy of LAB_SEED_TOYS) {
      await connection.execute(
        'INSERT INTO lab_juguetes (player_id, nombre, tipo, color, precio) VALUES (?, ?, ?, ?, ?)',
        [userId, toy.nombre, toy.tipo, toy.color, toy.precio],
      );
    }
    await connection.execute(
      "INSERT INTO lab_auditoria (player_id, accion, detalle) VALUES (?, 'reset', 'Laboratorio restaurado')",
      [userId],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getLabToys(userId);
}

export async function findToyByName(userId: number, nombre: string): Promise<LabToy | null> {
  const [rows] = await labPool.execute<LabRow[]>(
    'SELECT id, nombre, tipo, color, precio FROM lab_juguetes WHERE player_id = ? AND nombre = ? LIMIT 1',
    [userId, nombre],
  );
  const row = rows[0];
  return row ? toToy(row) : null;
}

export async function insertToy(
  userId: number,
  toy: { nombre: string; tipo: string; color: string; precio: number },
): Promise<LabToy> {
  const [result] = await labPool.execute<ResultSetHeader>(
    'INSERT INTO lab_juguetes (player_id, nombre, tipo, color, precio) VALUES (?, ?, ?, ?, ?)',
    [userId, toy.nombre, toy.tipo, toy.color, toy.precio],
  );
  await labPool.execute(
    "INSERT INTO lab_auditoria (player_id, accion, detalle) VALUES (?, 'insert', ?)",
    [userId, `Juguete ${toy.nombre}`.slice(0, 200)],
  );
  const [rows] = await labPool.execute<LabRow[]>(
    'SELECT id, nombre, tipo, color, precio FROM lab_juguetes WHERE id = ? AND player_id = ?',
    [result.insertId, userId],
  );
  const row = rows[0];
  if (!row) throw notFound('No encontramos el juguete recién guardado.');
  return toToy(row);
}

export async function updateToy(
  userId: number,
  toyId: number,
  field: 'color' | 'precio',
  value: string | number,
): Promise<LabToy> {
  if (field === 'color') {
    if (typeof value !== 'string') throw badRequest('El color debe ser texto.');
    await labPool.execute(
      'UPDATE lab_juguetes SET color = ? WHERE id = ? AND player_id = ?',
      [value, toyId, userId],
    );
  } else {
    const precio = Number(value);
    if (!Number.isFinite(precio) || precio < 0 || precio > 999) {
      throw badRequest('El precio debe estar entre 0 y 999.');
    }
    await labPool.execute(
      'UPDATE lab_juguetes SET precio = ? WHERE id = ? AND player_id = ?',
      [precio, toyId, userId],
    );
  }
  await labPool.execute(
    "INSERT INTO lab_auditoria (player_id, accion, detalle) VALUES (?, 'update', ?)",
    [userId, `Juguete ${toyId}: ${field}`.slice(0, 200)],
  );
  const [rows] = await labPool.execute<LabRow[]>(
    'SELECT id, nombre, tipo, color, precio FROM lab_juguetes WHERE id = ? AND player_id = ?',
    [toyId, userId],
  );
  const row = rows[0];
  if (!row) throw notFound('No encontramos ese juguete.');
  return toToy(row);
}

export async function deleteToy(userId: number, toyId: number): Promise<void> {
  await labPool.execute('DELETE FROM lab_juguetes WHERE id = ? AND player_id = ?', [toyId, userId]);
  await labPool.execute(
    "INSERT INTO lab_auditoria (player_id, accion, detalle) VALUES (?, 'delete', ?)",
    [userId, `Juguete ${toyId} borrado`.slice(0, 200)],
  );
}
