import { useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../../api/client';
import { DataTable } from '../DataTable';
import { useTable } from '../useTable';
import type {
  AttemptResult,
  BuildQueryMission,
  QueryResult,
  QuerySpec,
  WhereOp,
} from '../../types';

interface BuildQueryViewProps {
  mission: BuildQueryMission;
  outcome: AttemptResult | null;
  busy: boolean;
  onSubmit: (answer: unknown) => void;
}

function shortLabel(column: string): string {
  return column.includes('.') ? column.split('.').pop() ?? column : column;
}

function tableOf(column: string): string | null {
  return column.includes('.') ? column.split('.')[0] ?? null : null;
}

/**
 * Constructor visual de consultas: el niño arma SELECT / WHERE / ORDER BY /
 * LIMIT / JOIN tocando piezas. Nunca escribe SQL libre.
 */
export function BuildQueryView({ mission, outcome, busy, onSubmit }: BuildQueryViewProps) {
  const allowed = mission.allowed;
  const { data } = useTable(mission.table);

  const [columns, setColumns] = useState<string[]>([]);
  const [whereColumn, setWhereColumn] = useState<string | null>(null);
  const [whereOp, setWhereOp] = useState<WhereOp>('=');
  const [whereValue, setWhereValue] = useState('');
  const [orderColumn, setOrderColumn] = useState<string | null>(null);
  const [orderDir, setOrderDir] = useState<'ASC' | 'DESC'>('ASC');
  const [limit, setLimit] = useState<number | null>(null);
  const [joinOn, setJoinOn] = useState(false);

  const [preview, setPreview] = useState<QueryResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const done = outcome?.correct === true;

  const query = useMemo<QuerySpec>(() => {
    const spec: QuerySpec = { select: columns, from: mission.table };
    if (whereColumn && whereValue.trim()) {
      spec.where = { column: whereColumn, op: whereOp, value: whereValue.trim() };
    }
    if (orderColumn) spec.orderBy = { column: orderColumn, dir: orderDir };
    if (limit) spec.limit = limit;
    if (joinOn && allowed.join) spec.join = allowed.join;
    return spec;
  }, [allowed.join, columns, joinOn, limit, mission.table, orderColumn, orderDir, whereColumn, whereOp, whereValue]);

  const queryKey = JSON.stringify(query);

  // Vista previa automática: el niño ve el resultado mientras arma la consulta.
  useEffect(() => {
    const spec = JSON.parse(queryKey) as QuerySpec;
    if (spec.select.length === 0) {
      setPreview(null);
      setPreviewError(null);
      return;
    }
    let alive = true;
    const timer = window.setTimeout(() => {
      api
        .preview(spec)
        .then((response) => {
          if (!alive) return;
          setPreview(response.result);
          setPreviewError(null);
        })
        .catch((caught) => {
          if (!alive) return;
          setPreview(null);
          setPreviewError(
            caught instanceof ApiError ? caught.message : 'Esa combinación todavía no funciona.',
          );
        });
    }, 450);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [queryKey]);

  const whereValues = useMemo(() => {
    if (!data || !whereColumn) return [];
    const index = data.columns.findIndex((column) => column.key === whereColumn);
    if (index < 0) return [];
    return [...new Set(data.rows.map((row) => String(row[index] ?? '')))];
  }, [data, whereColumn]);

  function toggleColumn(column: string) {
    setColumns((current) =>
      current.includes(column) ? current.filter((item) => item !== column) : [...current, column],
    );
  }

  return (
    <div className="builder">
      <div className="builder__row">
        <span className="builder__label">SELECT</span>
        {allowed.columns.map((column) => {
          const table = tableOf(column);
          const on = columns.includes(column);
          return (
            <button
              key={column}
              type="button"
              className={`chip ${on ? 'chip--on' : ''}`}
              aria-pressed={on}
              disabled={done}
              onClick={() => toggleColumn(column)}
            >
              {table && <span className="chip__table">{table}.</span>}
              {shortLabel(column)}
            </button>
          );
        })}
      </div>

      <div className="builder__row">
        <span className="builder__label">FROM</span>
        <span className="pill">📋 {mission.table}</span>
      </div>

      {allowed.join && (
        <div className="builder__row">
          <span className="builder__label">JOIN</span>
          <button
            type="button"
            className={`chip ${joinOn ? 'chip--on' : ''}`}
            aria-pressed={joinOn}
            disabled={done}
            onClick={() => setJoinOn((value) => !value)}
          >
            🔗 Unir con {allowed.join.table}
          </button>
          {joinOn && (
            <span className="muted">
              {allowed.join.leftColumn} = {allowed.join.rightColumn}
            </span>
          )}
        </div>
      )}

      {allowed.where && (
        <div className="builder__row">
          <span className="builder__label">WHERE</span>
          <button
            type="button"
            className={`chip ${whereColumn ? 'chip--on' : ''}`}
            aria-pressed={Boolean(whereColumn)}
            disabled={done}
            onClick={() => {
              setWhereColumn(whereColumn ? null : allowed.where?.columns[0] ?? null);
              setWhereValue('');
            }}
          >
            🎯 Filtrar
          </button>
          {whereColumn && (
            <>
              <select
                className="select"
                aria-label="Columna del filtro"
                value={whereColumn}
                disabled={done}
                onChange={(event) => {
                  setWhereColumn(event.target.value);
                  setWhereValue('');
                }}
              >
                {allowed.where.columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
              <select
                className="select"
                aria-label="Comparación"
                value={whereOp}
                disabled={done}
                onChange={(event) => setWhereOp(event.target.value as WhereOp)}
              >
                {allowed.where.ops.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
              {whereValues.length > 0 ? (
                <div className="row" role="group" aria-label="Valor del filtro">
                  {whereValues.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`chip ${whereValue === value ? 'chip--on' : ''}`}
                      aria-pressed={whereValue === value}
                      disabled={done}
                      onClick={() => setWhereValue(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  className="input"
                  aria-label="Valor del filtro"
                  value={whereValue}
                  disabled={done}
                  maxLength={40}
                  onChange={(event) => setWhereValue(event.target.value)}
                />
              )}
            </>
          )}
        </div>
      )}

      {allowed.orderBy && (
        <div className="builder__row">
          <span className="builder__label">ORDER BY</span>
          <button
            type="button"
            className={`chip ${orderColumn ? 'chip--on' : ''}`}
            aria-pressed={Boolean(orderColumn)}
            disabled={done}
            onClick={() => setOrderColumn(orderColumn ? null : allowed.orderBy?.[0] ?? null)}
          >
            🔀 Ordenar
          </button>
          {orderColumn && (
            <>
              <select
                className="select"
                aria-label="Columna para ordenar"
                value={orderColumn}
                disabled={done}
                onChange={(event) => setOrderColumn(event.target.value)}
              >
                {allowed.orderBy.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
              {(['ASC', 'DESC'] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  className={`chip ${orderDir === direction ? 'chip--on' : ''}`}
                  aria-pressed={orderDir === direction}
                  disabled={done}
                  onClick={() => setOrderDir(direction)}
                >
                  {direction === 'ASC' ? '⬆️ ASC' : '⬇️ DESC'}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {allowed.limit && (
        <div className="builder__row">
          <span className="builder__label">LIMIT</span>
          {allowed.limit.map((amount) => (
            <button
              key={amount}
              type="button"
              className={`chip ${limit === amount ? 'chip--on' : ''}`}
              aria-pressed={limit === amount}
              disabled={done}
              onClick={() => setLimit(limit === amount ? null : amount)}
            >
              {amount}
            </button>
          ))}
        </div>
      )}

      <div className="builder__row">
        <span className="builder__label">Vista</span>
        {preview ? (
          <code className="sql">{preview.sql}</code>
        ) : (
          <span className="muted">
            {previewError ?? 'Toca las columnas para ver tu consulta.'}
          </span>
        )}
      </div>

      {preview && preview.rows.length > 0 && (
        <DataTable
          snapshot={{ columns: preview.columns, rows: preview.rows }}
          caption="Resultado de tu consulta"
        />
      )}
      {preview && preview.rows.length === 0 && <p className="empty">Tu consulta no devuelve filas.</p>}

      <button
        type="button"
        className="btn btn--primary btn--huge btn--block"
        disabled={busy || done || columns.length === 0}
        onClick={() => onSubmit({ query })}
      >
        {done ? '¡Listo!' : busy ? 'Comprobando…' : '✅ Comprobar'}
      </button>
    </div>
  );
}
