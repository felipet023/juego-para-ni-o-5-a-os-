import { useEffect, useState } from 'react';
import { api, ApiError } from '../../api/client';
import { DataTable } from '../DataTable';
import type { AttemptResult, LabMission, LabToy } from '../../types';

interface LabViewProps {
  mission: LabMission;
  outcome: AttemptResult | null;
  busy: boolean;
  onSubmit: (answer: unknown) => void;
  notify: (message: string) => void;
}

const TYPES = ['dinosaurio', 'pelota', 'robot', 'peluche', 'carro', 'bloques'];
const COLORS = ['verde', 'azul', 'rojo', 'blanco', 'amarillo', 'morado'];

function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/**
 * Laboratorio aislado: INSERT, UPDATE y DELETE se ejecutan de verdad, pero
 * solo sobre las filas ficticias de este jugador y con confirmación previa.
 */
export function LabView({ mission, outcome, busy, onSubmit, notify }: LabViewProps) {
  const [toys, setToys] = useState<LabToy[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stage, setStage] = useState<'edit' | 'confirm'>('edit');
  const [resetArmed, setResetArmed] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState(TYPES[0]!);
  const [color, setColor] = useState(COLORS[0]!);
  const [precio, setPrecio] = useState('10');
  const [targetName, setTargetName] = useState('');
  const [value, setValue] = useState('');

  const done = outcome?.correct === true;

  useEffect(() => {
    let alive = true;
    api
      .lab()
      .then((response) => {
        if (alive) setToys(response.toys);
      })
      .catch((caught) => {
        if (alive) {
          setLoadError(caught instanceof ApiError ? caught.message : 'No pudimos abrir el laboratorio.');
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (outcome?.lab) setToys(outcome.lab);
  }, [outcome]);

  const snapshot = {
    columns: [
      { key: 'id', label: 'id' },
      { key: 'nombre', label: 'nombre' },
      { key: 'tipo', label: 'tipo' },
      { key: 'color', label: 'color' },
      { key: 'precio', label: 'precio' },
    ],
    rows: toys.map((toy) => [toy.id, toy.nombre, toy.tipo, toy.color, toy.precio]),
  };

  const sqlPreview =
    mission.action === 'insert'
      ? `INSERT INTO juguetes (nombre, tipo, color, precio)\nVALUES (${quote(nombre)}, ${quote(tipo)}, ${quote(color)}, ${Number(precio) || 0});`
      : mission.action === 'update'
        ? `UPDATE juguetes\nSET ${mission.field} = ${quote(value)}\nWHERE nombre = ${quote(targetName)};`
        : `DELETE FROM juguetes\nWHERE nombre = ${quote(targetName)};`;

  function buildAnswer(): unknown | null {
    if (mission.action === 'insert') {
      const amount = Number(precio);
      if (!nombre.trim()) {
        notify('Escribe el nombre del juguete.');
        return null;
      }
      if (!Number.isFinite(amount) || amount < 0) {
        notify('El precio debe ser un número.');
        return null;
      }
      return { nombre: nombre.trim(), tipo, color, precio: amount };
    }
    if (mission.action === 'update') {
      if (!targetName) {
        notify('Elige el juguete que quieres cambiar.');
        return null;
      }
      if (!value.trim()) {
        notify('Escribe el nuevo valor.');
        return null;
      }
      return {
        targetName,
        field: mission.field,
        value: mission.field === 'precio' ? Number(value) : value.trim(),
      };
    }
    if (!targetName) {
      notify('Elige el juguete que quieres borrar.');
      return null;
    }
    return { targetName };
  }

  function prepare() {
    if (buildAnswer()) setStage('confirm');
  }

  function confirm() {
    const answer = buildAnswer();
    if (!answer) return;
    setStage('edit');
    onSubmit(answer);
  }

  async function reset() {
    setResetting(true);
    try {
      const response = await api.resetLab();
      setToys(response.toys);
      setResetArmed(false);
      notify('Laboratorio reiniciado con los juguetes de mentira.');
    } catch (caught) {
      notify(caught instanceof ApiError ? caught.message : 'No pudimos reiniciar el laboratorio.');
    } finally {
      setResetting(false);
    }
  }

  if (loadError) {
    return (
      <p className="form-error" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <p className="muted" style={{ margin: 0 }}>
          🧪 Datos de mentira. Solo tuyos. Puedes reiniciar cuando quieras.
        </p>
        {resetArmed ? (
          <span className="row">
            <button type="button" className="btn btn--danger" disabled={resetting} onClick={() => void reset()}>
              {resetting ? 'Reiniciando…' : 'Sí, reiniciar'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setResetArmed(false)}>
              Cancelar
            </button>
          </span>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={() => setResetArmed(true)}>
            ♻️ Reiniciar laboratorio
          </button>
        )}
      </div>

      {stage === 'confirm' ? (
        <div className="lesson-block">
          <h3>🔍 Mira lo que va a pasar</h3>
          <code className="sql">{sqlPreview}</code>
          <p className="muted">
            {mission.action === 'delete'
              ? 'Esta acción quita una fila. Solo afecta al laboratorio.'
              : 'Esta acción cambia solo las filas del laboratorio.'}
          </p>
          <div className="row">
            <button type="button" className="btn btn--primary" disabled={busy} onClick={confirm}>
              {busy
                ? 'Guardando…'
                : mission.action === 'insert'
                  ? '✅ Sí, guardar'
                  : mission.action === 'update'
                    ? '✅ Sí, cambiar'
                    : '🗑️ Sí, borrar'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setStage('edit')}>
              Volver
            </button>
          </div>
        </div>
      ) : (
        <div className="lesson-block">
          <h3>
            {mission.action === 'insert'
              ? '➕ Juguete nuevo'
              : mission.action === 'update'
                ? '✏️ Cambiar un juguete'
                : '🗑️ Sacar un juguete'}
          </h3>

          {mission.action === 'insert' && (
            <div className="stack">
              <div className="field">
                <label htmlFor="lab-nombre">Nombre</label>
                <input
                  id="lab-nombre"
                  className="input"
                  value={nombre}
                  maxLength={40}
                  disabled={done}
                  onChange={(event) => setNombre(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="lab-tipo">Tipo</label>
                <select
                  id="lab-tipo"
                  className="select"
                  value={tipo}
                  disabled={done}
                  onChange={(event) => setTipo(event.target.value)}
                >
                  {TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="lab-color">Color</label>
                <select
                  id="lab-color"
                  className="select"
                  value={color}
                  disabled={done}
                  onChange={(event) => setColor(event.target.value)}
                >
                  {COLORS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="lab-precio">Precio</label>
                <input
                  id="lab-precio"
                  className="input"
                  type="number"
                  min={0}
                  max={999}
                  value={precio}
                  disabled={done}
                  onChange={(event) => setPrecio(event.target.value)}
                />
              </div>
            </div>
          )}

          {mission.action !== 'insert' && (
            <div className="stack">
              <div className="field">
                <label htmlFor="lab-target">Juguete</label>
                <select
                  id="lab-target"
                  className="select"
                  value={targetName}
                  disabled={done}
                  onChange={(event) => setTargetName(event.target.value)}
                >
                  <option value="">Elige uno…</option>
                  {toys.map((toy) => (
                    <option key={toy.id} value={toy.nombre}>
                      {toy.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {mission.action === 'update' && (
                <div className="field">
                  <label htmlFor="lab-value">
                    {mission.field === 'color' ? 'Nuevo color' : 'Nuevo precio'}
                  </label>
                  {mission.field === 'color' ? (
                    <select
                      id="lab-value"
                      className="select"
                      value={value}
                      disabled={done}
                      onChange={(event) => setValue(event.target.value)}
                    >
                      <option value="">Elige un color…</option>
                      {COLORS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="lab-value"
                      className="input"
                      type="number"
                      min={0}
                      max={999}
                      value={value}
                      disabled={done}
                      onChange={(event) => setValue(event.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="btn btn--primary btn--huge btn--block"
            style={{ marginTop: '0.8rem' }}
            disabled={busy || done}
            onClick={prepare}
          >
            Ver mi consulta 👀
          </button>
        </div>
      )}

      <DataTable snapshot={snapshot} caption="Tabla juguetes del laboratorio" />

      <p className="muted" role="status">
        {done ? '🎉 ¡Cambio hecho!' : 'Cada cambio pide confirmación antes de ejecutarse.'}
      </p>
    </div>
  );
}
