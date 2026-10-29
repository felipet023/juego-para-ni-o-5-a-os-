import type { TableSnapshot } from '../types';

interface DataTableProps {
  snapshot: TableSnapshot | null;
  caption?: string;
  /** Si se pasa, cada celda se vuelve un botón. */
  onCellClick?: (row: number, column: string) => void;
  /** Celdas ya elegidas, con formato `fila:columna`. */
  selectedCells?: string[];
  /** Filas resaltadas (por ejemplo, las que coinciden en un JOIN). */
  highlightRows?: number[];
  /** Filas atenuadas (por ejemplo, las que no coinciden). */
  dimRows?: number[];
  disabled?: boolean;
}

/** Tabla pequeña, legible y con botones grandes para tocar celdas. */
export function DataTable({
  snapshot,
  caption,
  onCellClick,
  selectedCells = [],
  highlightRows = [],
  dimRows = [],
  disabled = false,
}: DataTableProps) {
  if (!snapshot) {
    return (
      <p className="muted" role="status">
        Abriendo la tabla…
      </p>
    );
  }

  if (snapshot.rows.length === 0) {
    return <p className="empty">Esta tabla está vacía.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">#</th>
            {snapshot.columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {snapshot.rows.map((row, rowIndex) => {
            const classes = [
              highlightRows.includes(rowIndex) ? 'row--hl' : '',
              dimRows.includes(rowIndex) ? 'row--dim' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <tr key={rowIndex} className={classes || undefined}>
                <th scope="row">{rowIndex + 1}</th>
                {snapshot.columns.map((column, columnIndex) => {
                  const value = row[columnIndex] ?? '';
                  const key = `${rowIndex}:${column.key}`;
                  return (
                    <td key={column.key}>
                      {onCellClick ? (
                        <button
                          type="button"
                          className={`cell-btn ${selectedCells.includes(key) ? 'cell-btn--on' : ''}`}
                          onClick={() => onCellClick(rowIndex, column.key)}
                          disabled={disabled}
                        >
                          {String(value)}
                        </button>
                      ) : (
                        String(value)
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
