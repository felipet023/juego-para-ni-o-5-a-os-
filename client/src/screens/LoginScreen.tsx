import { useState, type FormEvent } from 'react';
import { ApiError } from '../api/client';
import { useAppStore } from '../store/useAppStore';
import { playTone } from '../lib/audio';

interface LoginScreenProps {
  /** Texto que explica por qué se pide la cuenta (jugador o profe). */
  intro?: string;
}

export function LoginScreen({ intro }: LoginScreenProps) {
  const login = useAppStore((state) => state.login);
  const settings = useAppStore((state) => state.settings);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await login(username.trim(), password);
      playTone('ok', settings.sound);
    } catch (caught) {
      playTone('error', settings.sound);
      setError(caught instanceof ApiError ? caught.message : 'No pudimos entrar. Inténtalo otra vez.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <section className="login__card" aria-labelledby="login-title">
        <span className="login__mascot" aria-hidden="true">
          🦎
        </span>
        <h1 className="login__title" id="login-title">
          SQLQuest 3D
        </h1>
        <p className="login__subtitle">
          {intro ?? 'La Isla de los Datos te espera. Pide ayuda a un adulto para entrar.'}
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="username">Tu nombre de jugador</label>
            <input
              id="username"
              name="username"
              className="input"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
              maxLength={40}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Tu clave secreta</label>
            <input
              id="password"
              name="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              maxLength={72}
            />
          </div>

          <button className="btn btn--primary btn--huge btn--block" type="submit" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar a la isla'}
          </button>
        </form>

        <p className="demo-hint">
          Byte cuida tus datos: no pedimos tu nombre real ni tu edad.
        </p>

        {import.meta.env.DEV && (
          <p className="demo-hint">
            Cuenta de prueba local: <strong>explorador</strong> / <strong>Isla2026!</strong>
          </p>
        )}
      </section>
    </main>
  );
}
