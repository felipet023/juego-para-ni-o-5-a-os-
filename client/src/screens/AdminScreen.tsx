import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import type { AdminLesson, AdminOverview, AdminPlayer, AuditEntry } from '../types';
import { LoginScreen } from './LoginScreen';

const AVATARS = ['ajolote', 'rana', 'tortuga', 'pulpo', 'estrella', 'dino'];

export function AdminScreen() {
  const phase = useAppStore((state) => state.phase);
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({ username: '', displayName: '', password: '', avatar: 'ajolote' });
  const [resetFor, setResetFor] = useState<AdminPlayer | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmProgress, setConfirmProgress] = useState<AdminPlayer | null>(null);

  const isAdmin = phase === 'ready' && user?.role === 'admin';

  const reload = useCallback(async () => {
    try {
      const [overviewData, playersData, lessonsData, auditData] = await Promise.all([
        api.adminOverview(),
        api.adminPlayers(),
        api.adminLessons(),
        api.adminAudit(),
      ]);
      setOverview(overviewData);
      setPlayers(playersData.players);
      setLessons(lessonsData.lessons);
      setAudit(auditData.entries);
      setError(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No pudimos cargar el panel.');
    }
  }, []);

  useEffect(() => {
    if (isAdmin) void reload();
  }, [isAdmin, reload]);

  function report(caught: unknown, fallback: string) {
    setNotice(null);
    setError(caught instanceof ApiError ? caught.message : fallback);
  }

  async function run(action: () => Promise<unknown>, message: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
      setNotice(message);
      await reload();
    } catch (caught) {
      report(caught, 'No pudimos completar la acción.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  if (phase !== 'ready') {
    return <LoginScreen intro="Este panel es solo para el profe. Entra con tu cuenta de administración." />;
  }

  if (!user) {
    return <LoginScreen intro="Este panel es solo para el profe. Entra con tu cuenta de administración." />;
  }

  if (user.role !== 'admin') {
    return (
      <main className="login">
        <section className="login__card" aria-labelledby="no-admin-title">
          <span className="login__mascot" aria-hidden="true">
            🔒
          </span>
          <h1 className="login__title" id="no-admin-title">
            Zona del profe
          </h1>
          <p className="login__subtitle">
            Esta parte es solo para adultos con permiso de administración.
          </p>
          <Link className="btn btn--primary btn--huge btn--block" to="/">
            Volver a la isla
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="admin">
      <header className="admin__header">
        <div>
          <h1 style={{ margin: 0 }}>🛠️ Panel del profe</h1>
          <p className="muted" style={{ margin: 0 }}>
            Sesión de {user.displayName} ({user.username})
          </p>
        </div>
        <div className="row">
          <Link className="btn btn--ghost" to="/">
            🎮 Ir al juego
          </Link>
          <a className="btn btn--ghost" href={api.adminExportUrl}>
            ⬇️ Exportar progreso
          </a>
          <button type="button" className="btn btn--ghost" onClick={() => void handleLogout()}>
            👋 Salir
          </button>
        </div>
      </header>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="feedback feedback--ok" role="status">
          <span aria-hidden="true">✅</span>
          <span>{notice}</span>
        </div>
      )}

      {overview && (
        <section className="admin__grid" aria-label="Resumen">
          <div className="metric">
            <span className="metric__value">{overview.players}</span>
            <span className="metric__label">Jugadores</span>
          </div>
          <div className="metric">
            <span className="metric__value">{overview.activePlayers}</span>
            <span className="metric__label">Activos</span>
          </div>
          <div className="metric">
            <span className="metric__value">{overview.lessonsMastered}</span>
            <span className="metric__label">Lecciones dominadas</span>
          </div>
          <div className="metric">
            <span className="metric__value">{overview.attempts}</span>
            <span className="metric__label">Intentos</span>
          </div>
          <div className="metric">
            <span className="metric__value">
              {overview.attempts === 0
                ? '—'
                : `${Math.round((overview.correctAttempts / overview.attempts) * 100)}%`}
            </span>
            <span className="metric__label">Aciertos</span>
          </div>
          <div className="metric">
            <span className="metric__value">{overview.activeSessions}</span>
            <span className="metric__label">Sesiones activas</span>
          </div>
        </section>
      )}

      <section className="card">
        <h2>➕ Crear jugador</h2>
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            void run(async () => {
              await api.adminCreatePlayer({
                username: form.username.trim(),
                displayName: form.displayName.trim(),
                password: form.password,
                avatar: form.avatar,
              });
              setForm({ username: '', displayName: '', password: '', avatar: 'ajolote' });
            }, 'Jugador creado. Comparte la clave en persona, no por chat público.');
          }}
        >
          <div className="field" style={{ minWidth: '10rem', flex: 1 }}>
            <label htmlFor="new-username">Usuario</label>
            <input
              id="new-username"
              className="input"
              value={form.username}
              autoComplete="off"
              minLength={3}
              maxLength={40}
              required
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
          </div>
          <div className="field" style={{ minWidth: '10rem', flex: 1 }}>
            <label htmlFor="new-display">Nombre visible</label>
            <input
              id="new-display"
              className="input"
              value={form.displayName}
              maxLength={40}
              required
              onChange={(event) => setForm({ ...form, displayName: event.target.value })}
            />
          </div>
          <div className="field" style={{ minWidth: '10rem', flex: 1 }}>
            <label htmlFor="new-password">Clave temporal</label>
            <input
              id="new-password"
              className="input"
              type="password"
              value={form.password}
              autoComplete="new-password"
              minLength={6}
              maxLength={72}
              required
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </div>
          <div className="field" style={{ minWidth: '8rem' }}>
            <label htmlFor="new-avatar">Avatar</label>
            <select
              id="new-avatar"
              className="select"
              value={form.avatar}
              onChange={(event) => setForm({ ...form, avatar: event.target.value })}
            >
              {AVATARS.map((avatar) => (
                <option key={avatar} value={avatar}>
                  {avatar}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            Crear
          </button>
        </form>
      </section>

      <section className="card">
        <h2>👧 Jugadores</h2>
        {players.length === 0 ? (
          <p className="empty">Todavía no hay jugadores.</p>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Jugador</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Estrellas</th>
                  <th scope="col">Dominadas</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>
                      <strong>{player.displayName}</strong>
                      <br />
                      <span className="muted">{player.username}</span>
                    </td>
                    <td>
                      <span className={`status-dot status-dot--${player.isActive ? 'on' : 'off'}`} />
                      {player.isActive ? 'Activo' : 'Bloqueado'}
                    </td>
                    <td>⭐ {player.stars}</td>
                    <td>🏅 {player.mastered}</td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn btn--ghost"
                          disabled={busy}
                          onClick={() =>
                            void run(
                              () => api.adminTogglePlayer(player.id, !player.isActive),
                              player.isActive ? 'Jugador bloqueado.' : 'Jugador activado.',
                            )
                          }
                        >
                          {player.isActive ? 'Bloquear' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost"
                          disabled={busy}
                          onClick={() => {
                            setResetFor(player);
                            setNewPassword('');
                          }}
                        >
                          Cambiar clave
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger"
                          disabled={busy}
                          onClick={() => setConfirmProgress(player)}
                        >
                          Reiniciar progreso
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>📚 Lecciones</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Lección</th>
              <th scope="col">Zona</th>
              <th scope="col">Estado</th>
              <th scope="col">Acción</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id}>
                <td>{lesson.order + 1}</td>
                <td>
                  {lesson.title} {lesson.isCustom && <span className="pill">editada</span>}
                </td>
                <td>{lesson.zone}</td>
                <td>
                  <span className={`status-dot status-dot--${lesson.isActive ? 'on' : 'off'}`} />
                  {lesson.isActive ? 'Activa' : 'Oculta'}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => api.adminUpdateLesson(lesson.id, { isActive: !lesson.isActive }),
                        lesson.isActive ? 'Lección ocultada.' : 'Lección activada.',
                      )
                    }
                  >
                    {lesson.isActive ? 'Ocultar' : 'Mostrar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>🧾 Registro de acciones</h2>
        {audit.length === 0 ? (
          <p className="empty">Sin acciones registradas.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Cuándo</th>
                <th scope="col">Quién</th>
                <th scope="col">Acción</th>
                <th scope="col">Objetivo</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.at).toLocaleString('es')}</td>
                  <td>{entry.actor ?? 'sistema'}</td>
                  <td>{entry.action}</td>
                  <td>
                    {entry.targetType ?? '—'} {entry.targetId ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {resetFor && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="reset-title">
          <div className="panel panel--narrow">
            <header className="panel__header">
              <h2 className="panel__title" id="reset-title">
                Cambiar clave de {resetFor.displayName}
              </h2>
              <button
                type="button"
                className="btn btn--ghost btn--icon"
                aria-label="Cancelar"
                onClick={() => setResetFor(null)}
              >
                ✕
              </button>
            </header>
            <div className="panel__body">
              <p className="muted">
                Se cerrarán todas las sesiones abiertas de este jugador. Comparte la nueva clave en
                persona.
              </p>
              <div className="field">
                <label htmlFor="reset-password">Nueva clave</label>
                <input
                  id="reset-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={72}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
            </div>
            <div className="panel__footer">
              <button type="button" className="btn btn--ghost" onClick={() => setResetFor(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={busy || newPassword.length < 6}
                onClick={() =>
                  void run(async () => {
                    await api.adminResetPassword(resetFor.id, newPassword);
                    setResetFor(null);
                  }, 'Clave cambiada y sesiones cerradas.')
                }
              >
                Guardar clave
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmProgress && (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="panel panel--narrow">
            <header className="panel__header">
              <h2 className="panel__title" id="confirm-title">
                ¿Reiniciar el progreso?
              </h2>
            </header>
            <div className="panel__body">
              <p>
                Se borrarán las estrellas, insignias e intentos de{' '}
                <strong>{confirmProgress.displayName}</strong>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="panel__footer">
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmProgress(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--danger"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await api.adminResetProgress(confirmProgress.id);
                    setConfirmProgress(null);
                  }, 'Progreso reiniciado.')
                }
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
