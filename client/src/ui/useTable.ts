import { useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import type { TableSnapshot } from '../types';

/** Carga una tabla de práctica del servidor (datos ficticios y fijos). */
export function useTable(name: string | undefined) {
  const [data, setData] = useState<TableSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setData(null);
      return;
    }
    let alive = true;
    setError(null);
    api
      .table(name)
      .then((snapshot) => {
        if (alive) setData(snapshot);
      })
      .catch((caught) => {
        if (alive) {
          setError(caught instanceof ApiError ? caught.message : 'No pudimos abrir la tabla.');
        }
      });
    return () => {
      alive = false;
    };
  }, [name]);

  return { data, error };
}
