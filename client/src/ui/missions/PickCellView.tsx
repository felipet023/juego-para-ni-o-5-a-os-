import { useState } from 'react';
import { DataTable } from '../DataTable';
import { useTable } from '../useTable';
import type { AttemptResult, PickCellMission } from '../../types';

interface PickCellViewProps {
  mission: PickCellMission;
  outcome: AttemptResult | null;
  busy: boolean;
  onSubmit: (answer: unknown) => void;
}

/** El niño toca una celda de la tabla para responder. */
export function PickCellView({ mission, outcome, busy, onSubmit }: PickCellViewProps) {
  const { data, error } = useTable(mission.table);
  const [picked, setPicked] = useState<{ row: number; column: string } | null>(null);
  const done = outcome?.correct === true;

  if (error) {
    return (
      <p className="form-error" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="stack">
      <DataTable
        snapshot={data}
        caption={`Tabla ${mission.table}`}
        disabled={busy || done}
        selectedCells={picked ? [`${picked.row}:${picked.column}`] : []}
        onCellClick={(row, column) => {
          setPicked({ row, column });
          onSubmit({ row, column });
        }}
      />
      <p className="muted">Toca la celda que responde la pregunta.</p>
    </div>
  );
}
