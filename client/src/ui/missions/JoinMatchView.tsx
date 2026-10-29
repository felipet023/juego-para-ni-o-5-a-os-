import { useState } from 'react';
import { DataTable } from '../DataTable';
import { useTable } from '../useTable';
import type { AttemptResult, JoinMatchMission } from '../../types';

interface JoinMatchViewProps {
  mission: JoinMatchMission;
  outcome: AttemptResult | null;
  busy: boolean;
  onSubmit: (answer: unknown) => void;
}

function indexOfColumn(columns: { key: string }[], key: string): number {
  return columns.findIndex((column) => column.key === key);
}

/** Dos tablas lado a lado: el niño toca las filas que sí tienen pareja. */
export function JoinMatchView({ mission, outcome, busy, onSubmit }: JoinMatchViewProps) {
  const left = useTable(mission.leftTable);
  const right = useTable(mission.rightTable);
  const [ids, setIds] = useState<number[]>([]);
  const done = outcome?.correct === true;

  if (left.error || right.error) {
    return (
      <p className="form-error" role="alert">
        {left.error ?? right.error}
      </p>
    );
  }

  const leftSnapshot = left.data;
  const idIndex = leftSnapshot ? Math.max(0, indexOfColumn(leftSnapshot.columns, 'id')) : 0;
  const nameIndex = leftSnapshot
    ? Math.max(
        0,
        indexOfColumn(leftSnapshot.columns, 'nombre') === -1
          ? 1
          : indexOfColumn(leftSnapshot.columns, 'nombre'),
      )
    : 0;

  const matchedIds = new Set(outcome?.matchedIds ?? []);
  const unmatchedIds = new Set(outcome?.unmatchedIds ?? []);

  function toggle(id: number) {
    setIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <div className="stack">
      <div className="match-grid">
        <section className="lesson-block">
          <h3>
            <span aria-hidden="true">🐾</span> {mission.leftTable}
          </h3>
          <p className="muted">Toca las filas que tienen pareja en {mission.rightTable}.</p>
          <div className="stack" role="group" aria-label={`Filas de ${mission.leftTable}`}>
            {leftSnapshot ? (
              leftSnapshot.rows.map((row, rowIndex) => {
                const id = Number(row[idIndex]);
                const selected = ids.includes(id);
                const classes = ['row-pick'];
                if (selected) classes.push('row-pick--on');
                if (matchedIds.has(id)) classes.push('row-pick--ok');
                if (unmatchedIds.has(id)) classes.push('row-pick--no');
                return (
                  <button
                    key={`${id}-${rowIndex}`}
                    type="button"
                    className={classes.join(' ')}
                    aria-pressed={selected}
                    disabled={busy || done}
                    onClick={() => toggle(id)}
                  >
                    {String(row[nameIndex])}{' '}
                    <span className="muted">
                      ({mission.leftKey}: {String(row[indexOfColumn(leftSnapshot.columns, mission.leftKey)])})
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="muted">Abriendo…</p>
            )}
          </div>
        </section>

        <section className="lesson-block">
          <h3>
            <span aria-hidden="true">👪</span> {mission.rightTable}
          </h3>
          <p className="muted">Esta es la lista de dueños. Compara los números.</p>
          <DataTable snapshot={right.data} caption={`Tabla ${mission.rightTable}`} />
        </section>
      </div>

      <button
        type="button"
        className="btn btn--primary btn--huge btn--block"
        disabled={busy || done || ids.length === 0}
        onClick={() => onSubmit({ ids })}
      >
        {done ? '¡Listo!' : busy ? 'Comprobando…' : '✅ Comprobar parejas'}
      </button>
    </div>
  );
}
