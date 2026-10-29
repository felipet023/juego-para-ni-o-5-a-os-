import { TABLES } from '../content/datasets.js';
import type { QueryResult, QuerySpec, TableDef, WhereOp } from '../content/types.js';
import { badRequest } from '../lib/errors.js';

type Cell = string | number;
type FlatRow = Record<string, Cell>;

const OPERATORS: readonly WhereOp[] = ['=', '!=', '>', '<', '>=', '<=', 'LIKE'];

export function getTable(name: string): TableDef {
  const table = TABLES[name];
  if (!table) throw badRequest('Esa tabla no existe en la isla.');
  return table;
}

/** Separa `tabla.columna` en sus partes. Sin prefijo usa la tabla por defecto. */
function splitColumn(column: string, defaultTable: string): { table: string; key: string } {
  const parts = column.split('.');
  if (parts.length === 1) return { table: defaultTable, key: parts[0]! };
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw badRequest(`La columna «${column}» no es válida.`);
  }
  return { table: parts[0], key: parts[1] };
}

function resolveColumn(column: string, defaultTable: TableDef): { table: TableDef; key: string; type: 'texto' | 'numero' | 'fecha' } {
  const { table, key } = splitColumn(column, defaultTable.name);
  const found = getTable(table);
  const definition = found.columns.find((col) => col.key === key);
  if (!definition) throw badRequest(`La columna «${column}» no existe en ${found.name}.`);
  return { table: found, key, type: definition.type };
}

function qualify(table: TableDef, row: Record<string, Cell>, includePlainKeys: boolean): FlatRow {
  const flat: FlatRow = {};
  for (const [key, value] of Object.entries(row)) {
    if (includePlainKeys) flat[key] = value;
    flat[`${table.name}.${key}`] = value;
  }
  return flat;
}

function toNumber(value: Cell): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function likeToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/%/g, '.*').replace(/_/g, '.')}$`, 'i');
}

function compare(left: Cell, op: WhereOp, right: string, type: 'texto' | 'numero' | 'fecha'): boolean {
  if (type === 'numero') {
    const a = toNumber(left);
    const b = Number(right);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    switch (op) {
      case '=':
        return a === b;
      case '!=':
        return a !== b;
      case '>':
        return a > b;
      case '<':
        return a < b;
      case '>=':
        return a >= b;
      case '<=':
        return a <= b;
      case 'LIKE':
        return likeToRegExp(right).test(String(left));
    }
  }

  const a = String(left).toLocaleLowerCase('es');
  const b = right.toLocaleLowerCase('es');
  switch (op) {
    case '=':
      return a === b;
    case '!=':
      return a !== b;
    case '>':
      return a > b;
    case '<':
      return a < b;
    case '>=':
      return a >= b;
    case '<=':
      return a <= b;
    case 'LIKE':
      return likeToRegExp(right).test(String(left));
  }
}

function quote(value: string, type: 'texto' | 'numero' | 'fecha'): string {
  if (type === 'numero' && Number.isFinite(Number(value))) return String(Number(value));
  return `'${value.replace(/'/g, "''")}'`;
}

/** Renderiza la consulta para mostrarla al niño (nunca se envía a MySQL). */
export function renderSql(spec: QuerySpec): string {
  const base = getTable(spec.from);
  const parts: string[] = [`SELECT ${spec.select.join(', ')}`, `FROM ${spec.from}`];
  if (spec.join) {
    parts.push(
      `INNER JOIN ${spec.join.table} ON ${spec.join.leftColumn} = ${spec.join.rightColumn}`,
    );
  }
  if (spec.where) {
    const resolved = resolveColumn(spec.where.column, base);
    parts.push(`WHERE ${spec.where.column} ${spec.where.op} ${quote(spec.where.value, resolved.type)}`);
  }
  if (spec.orderBy) parts.push(`ORDER BY ${spec.orderBy.column} ${spec.orderBy.dir}`);
  if (spec.limit !== undefined) parts.push(`LIMIT ${spec.limit}`);
  return `${parts.join(' ')};`;
}

function expandColumns(spec: QuerySpec, base: TableDef, joined?: TableDef): string[] {
  if (spec.select.length === 1 && spec.select[0] === '*') {
    if (joined) {
      return [
        ...base.columns.map((col) => `${base.name}.${col.key}`),
        ...joined.columns.map((col) => `${joined.name}.${col.key}`),
      ];
    }
    return base.columns.map((col) => col.key);
  }
  return spec.select;
}

/**
 * Ejecuta la consulta sobre los datos ficticios en memoria.
 * No hay SQL libre: solo se aceptan tablas, columnas y operadores del catálogo.
 */
export function evaluateQuery(spec: QuerySpec): QueryResult {
  if (spec.select.length === 0) throw badRequest('Elige al menos una columna.');
  if (spec.limit !== undefined && (!Number.isInteger(spec.limit) || spec.limit < 1 || spec.limit > 50)) {
    throw badRequest('El límite debe estar entre 1 y 50.');
  }
  if (spec.where && !OPERATORS.includes(spec.where.op)) {
    throw badRequest('Ese operador no está permitido.');
  }

  const base = getTable(spec.from);
  let joined: TableDef | undefined;

  if (spec.join) {
    if (spec.join.table === base.name) throw badRequest('No puedes unir una tabla consigo misma aquí.');
    joined = getTable(spec.join.table);
    const left = resolveColumn(spec.join.leftColumn, base);
    const right = resolveColumn(spec.join.rightColumn, joined);
    if (left.table.name !== base.name) throw badRequest('La columna de unión debe salir de la tabla izquierda.');
    if (right.table.name !== joined.name) throw badRequest('La columna de unión debe salir de la tabla derecha.');
    if (left.type !== right.type) throw badRequest('Las columnas de unión deben ser del mismo tipo.');
  }

  let rows: FlatRow[] = base.rows.map((row) => qualify(base, row, true));

  if (spec.join && joined) {
    const { key: leftKey } = splitColumn(spec.join.leftColumn, base.name);
    const { key: rightKey } = splitColumn(spec.join.rightColumn, joined.name);
    const index = new Map<string, Record<string, Cell>[]>();
    for (const row of joined.rows) {
      const key = String(row[rightKey]);
      const bucket = index.get(key) ?? [];
      bucket.push(row);
      index.set(key, bucket);
    }
    const next: FlatRow[] = [];
    for (const row of base.rows) {
      const matches = index.get(String(row[leftKey]));
      if (!matches) continue;
      for (const match of matches) {
        // Las claves sin prefijo pertenecen siempre a la tabla izquierda.
        next.push({ ...qualify(base, row, true), ...qualify(joined, match, false) });
      }
    }
    rows = next;
  }

  if (spec.where) {
    const where = spec.where;
    const resolved = resolveColumn(where.column, base);
    if (joined && resolved.table.name !== base.name && resolved.table.name !== joined.name) {
      throw badRequest('Esa columna no está en las tablas de la consulta.');
    }
    rows = rows.filter((row) =>
      compare(row[where.column] ?? row[resolved.key] ?? '', where.op, where.value, resolved.type),
    );
  }

  if (spec.orderBy) {
    const order = spec.orderBy;
    const resolved = resolveColumn(order.column, base);
    const direction = order.dir === 'DESC' ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const left = a[order.column] ?? a[resolved.key] ?? '';
      const right = b[order.column] ?? b[resolved.key] ?? '';
      if (resolved.type === 'numero') return (toNumber(left) - toNumber(right)) * direction;
      return String(left).localeCompare(String(right), 'es') * direction;
    });
  }

  const total = rows.length;
  if (spec.limit !== undefined) rows = rows.slice(0, spec.limit);

  const columns = expandColumns(spec, base, joined).map((column) => {
    const resolved = resolveColumn(column, base);
    if (joined && resolved.table.name !== base.name && resolved.table.name !== joined.name) {
      throw badRequest('Esa columna no está en las tablas de la consulta.');
    }
    return { key: column, label: column };
  });

  const projected = rows.map((row) =>
    columns.map((column) => {
      const value = row[column.key];
      if (value === undefined) throw badRequest(`La columna «${column.key}» no está en el resultado.`);
      return value;
    }),
  );

  return {
    columns,
    rows: projected,
    sql: renderSql(spec),
    total,
    truncated: spec.limit !== undefined && spec.limit < total,
  };
}

function normalizeQuery(spec: QuerySpec): string {
  const base = getTable(spec.from);
  const joined = spec.join ? getTable(spec.join.table) : undefined;
  const columns = expandColumns(spec, base, joined)
    .map((column) => column.toLocaleLowerCase('es'))
    .sort();
  return JSON.stringify({
    select: columns,
    from: spec.from.toLocaleLowerCase('es'),
    where: spec.where
      ? {
          column: spec.where.column.toLocaleLowerCase('es'),
          op: spec.where.op,
          value: spec.where.value.trim().toLocaleLowerCase('es'),
        }
      : null,
    orderBy: spec.orderBy
      ? { column: spec.orderBy.column.toLocaleLowerCase('es'), dir: spec.orderBy.dir }
      : null,
    limit: spec.limit ?? null,
    join: spec.join
      ? {
          table: spec.join.table.toLocaleLowerCase('es'),
          leftColumn: spec.join.leftColumn.toLocaleLowerCase('es'),
          rightColumn: spec.join.rightColumn.toLocaleLowerCase('es'),
        }
      : null,
  });
}

/** Compara intención, no solo resultado: dos consultas distintas pueden dar lo mismo. */
export function queriesEquivalent(a: QuerySpec, b: QuerySpec): boolean {
  try {
    return normalizeQuery(a) === normalizeQuery(b);
  } catch {
    return false;
  }
}

/** Ids de la tabla izquierda que tienen (o no) pareja en la derecha. */
export function matchingLeftIds(
  leftTable: string,
  rightTable: string,
  leftKey: string,
  rightKey: string,
): { matched: number[]; unmatched: number[] } {
  const left = getTable(leftTable);
  const right = getTable(rightTable);
  const leftResolved = resolveColumn(leftKey, left);
  const rightResolved = resolveColumn(rightKey, right);
  const available = new Set(right.rows.map((row) => String(row[rightResolved.key])));

  const matched: number[] = [];
  const unmatched: number[] = [];
  for (const row of left.rows) {
    const id = Number(row[left.primaryKey]);
    if (available.has(String(row[leftResolved.key]))) matched.push(id);
    else unmatched.push(id);
  }
  return { matched, unmatched };
}

export function tableSnapshot(name: string): {
  columns: { key: string; label: string; type: string }[];
  rows: Cell[][];
} {
  const table = getTable(name);
  return {
    columns: table.columns.map((col) => ({ key: col.key, label: col.label, type: col.type })),
    rows: table.rows.map((row) => table.columns.map((col) => row[col.key] ?? '')),
  };
}
