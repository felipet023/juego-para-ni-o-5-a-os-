import { Link } from 'react-router-dom';
import type { GameState, User } from '../types';

interface TopBarProps {
  user: User;
  game: GameState;
  onOpenMap: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function TopBar({ user, game, onOpenMap, onOpenSettings, onLogout }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__emoji" aria-hidden="true">
          🦎
        </span>
        <span className="brand__title">SQLQuest 3D</span>
      </div>

      <div className="topbar__stats" aria-label="Tu progreso">
        <span className="pill">
          <span aria-hidden="true">⭐</span> {game.stats.stars}/{game.stats.maxStars}
          <span className="sr-only"> estrellas</span>
        </span>
        <span className="pill">
          <span aria-hidden="true">🏅</span> {game.stats.mastered}/{game.stats.total}
          <span className="sr-only"> lecciones dominadas</span>
        </span>
      </div>

      <div className="topbar__actions">
        <button type="button" className="btn btn--ghost" onClick={onOpenMap} aria-label="Abrir el mapa">
          <span aria-hidden="true">🗺️</span>
          <span className="brand__title">Mapa</span>
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onOpenSettings}
          aria-label="Abrir los ajustes"
        >
          <span aria-hidden="true">⚙️</span>
          <span className="brand__title">Ajustes</span>
        </button>
        {user.role === 'admin' && (
          <Link className="btn btn--ghost" to="/admin" aria-label="Panel del profe">
            <span aria-hidden="true">🛠️</span>
            <span className="brand__title">Profe</span>
          </Link>
        )}
        <button type="button" className="btn btn--ghost" onClick={onLogout} aria-label="Salir del juego">
          <span aria-hidden="true">👋</span>
          <span className="brand__title">Salir</span>
        </button>
      </div>
    </header>
  );
}
