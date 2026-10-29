import type { LessonState, ZoneId } from '../types';
import { ZONE_VISUALS } from '../world/zoneLayout';

interface MapPanelProps {
  lessons: LessonState[];
  onOpenZone: (zone: ZoneId) => void;
  onClose?: () => void;
  /** En modo accesible no hay mundo 3D detrás. */
  standalone?: boolean;
}

/**
 * Mapa de la isla en forma de lista. Es la alternativa accesible al mundo 3D:
 * funciona sin WebGL, con lector de pantalla y con teclado.
 */
export function MapPanel({ lessons, onOpenZone, onClose, standalone = false }: MapPanelProps) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="map-title">
      <section className="panel">
        <header className="panel__header">
          <div>
            <p className="panel__subtitle">Mapa de la isla</p>
            <h2 className="panel__title" id="map-title">
              🗺️ ¿A dónde quieres ir?
            </h2>
          </div>
          {onClose && (
            <button type="button" className="btn btn--ghost btn--icon" aria-label="Cerrar mapa" onClick={onClose}>
              ✕
            </button>
          )}
        </header>

        <div className="panel__body">
          <div className="zone-list">
            {ZONE_VISUALS.map((zone) => {
              const zoneLessons = lessons.filter((lesson) => lesson.zone === zone.id);
              const mastered = zoneLessons.filter((lesson) => lesson.status === 'mastered').length;
              const locked = zoneLessons.length > 0 && zoneLessons.every((lesson) => lesson.status === 'locked');
              return (
                <button
                  key={zone.id}
                  type="button"
                  className={`zone-card ${locked ? 'zone-card--locked' : ''}`}
                  disabled={locked}
                  onClick={() => onOpenZone(zone.id)}
                >
                  <span className="zone-card__emoji" aria-hidden="true">
                    {locked ? '🔒' : zone.emoji}
                  </span>
                  <span style={{ flex: 1 }}>
                    <strong>{zone.name}</strong>
                    <span className="zone-card__meta" style={{ display: 'block' }}>
                      {zoneLessons.length} lecciones · {mastered} dominadas
                    </span>
                  </span>
                  {!locked && <span aria-hidden="true">›</span>}
                </button>
              );
            })}
          </div>
          {standalone && (
            <p className="muted">
              Estás en el modo sin 3D. Puedes jugar todas las lecciones desde este mapa.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
